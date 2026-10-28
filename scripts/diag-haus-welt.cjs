// diag-haus-welt.cjs — DAS HAUS DER WELT IST BEGEHBAR, WIE ES GEZEICHNET IST (gate:haus-welt). Die Linse ruft die ECHTEN
// Pfade (headless, Null-Renderer): `spawnSettlement` (das Drehbuch-Dorf 7/18), die Foundry liefert die Stufen, der Spieler
// geht über den Sim-Schritt (`_stepFixedSim`, W-Taste):
//   W1  TÜR: vom Podest vor der Haustür geht der Körper 1 m hinter die Schwelle — je Haus, gedrehte eingeschlossen
//   W2  DIELE: drinnen steht der Fuß auf der Diele des Gesetzbuchs (± 3 cm; das Gesetzbuch rechnet die Probe selbst)
//   W4  GRUNDRISS: keine Natur (die Arten des Terrain-Studios) im Grundriss eines Hauses des Drehbuch-Dorfs, keine Natur
//       (Eintrag, Streu-Zelle, Kachel-Pflanze) auf Straße, Feldweg, Platz, Anger oder Acker des Dorfs (die Wege-Karte).
//   W4b DAS FERNE DORF: ein Dorf entsteht 300 m vom Spieler — keine lebende Streu-Zelle in seinen Häusern, auch nicht, wenn
//       die Region unter ihm neu baut; der Spieler läuft hin — kein Natur-Eintrag, keine Streu-Zelle, keine Kachel-Pflanze
//       im Grundriss. Alle Quellen setzen durch EINE Wand (`_naturSetzen`); gewartet wird auf den Konsum, nie auf Takte.
//   W5  KOLLISION == OPTIK: an jedem Punkt eines 0,5-m-Rasters im Kern-Grundriss urteilt die Welt-Kapsel (der Löser
//       `_resolveCapsuleVsAABB` gegen die Boxen des Hauses) wie das Gesetzbuch (dieselbe Wand-Regel gegen seine Solids) ≥ 97 %
//   W6  DER FRONTALE ANLAUF: je Kultur läuft der Körper von 6 m vor der Front durch die Tür — vor der ersten Studio-Stufe
//       (Kern-Hülle) und während die Fernstufe 2 bzw. 1 steht; vor der Schwelle höchstens 1,3 m über dem Boden, nie 1 m
//       darunter, der Korridor ist begehbar (stetig, solide)
//   W7  BAU IM BAU: kein Haus des Drehbuch-Dorfs steht in einem Bau, der vor ihm stand, vor keiner Haustür dessen Wand;
//       derselbe Akt ein zweites Mal am selben Anker: kein Haus, Brunnen oder Stand des zweiten Dorfs steht im ersten
//   W8  DIE LICHTUNG: die Genesis-Plattform ist ein Grundriss derselben Wand — über ihrer Scheibe keine Krone, keine
//       Kachel-Pflanze; der Hain der KI wächst weder dort noch im Grundriss eines Dorf-Hauses (Gegenprobe 150 m weiter: er
//       wächst), jede Absage nennt die Lichtung. DER GENESIS-PLATZ: die Sohle liegt ≤ 0,3 m über dem Boden, die Lichtung ist
//       der Platz des Rings (Tore + 4 m), ein Damm räumt den Hain aus seinen Boxen.
//   W10 SPIELGANG: Tür, Keller, jeder Lauf bis zum Dachboden, auch am Spur-Rand — kein Hub > 0,3 m je Schritt, kein Tier im Haus;
//       mit der Phase start JEDES Haus des Start-Dorfs (aus seinem Plan), mit `--bild` sein Innen-Bild gegen den Außen-Schatten
//   W9  DAS GRUND-DATUM (S4): je Box des Körper-Satzes (fachwerk `grundVon`) kein Büschel der Nah-Wiese, dessen Halme
//       hineinreichen, keine Erde über der Diele; `--bild`: Halm- und Boden-Pixel je Box 0, Third vor jedem Haus 0, das Haus
//       des Spielers setzt die Werkstatt; am See und am Fluss der Mess-Wiese je Ego und Third kein Halm unter dem Spiegel.
//       ABBAU · PLAN · WAISE · ZUG · AUSSTATTUNG: der Grund fällt mit dem Bau, liegt vor seiner Hülle, trägt stets einen Bau;
//       der Zug des Start-Dorfs überlebt Sperre und Reload, Brunnen, Laternen und Stände stehen am Ort des Plans.
//   --selftest: je Defekt serviert der Server die Basis-Zeile des Stamms — GENAU die Probe dieses Defekts wird rot;
//   die Welt eines Selbsttests fährt nur die Phase seines Täters (haus · sohle · lichtung · bau · w4 · w4b · w6), der Hauptlauf alle.
//   node scripts/diag-haus-welt.cjs [--selftest [--nur=promotion,nahstreu]] [--phasen=lichtung]
"use strict";
const {
    statikServer,
    starteBrowser,
    nullRenderer,
    warteAufWelt,
    teilAus,
    ROOT,
    hauptLauf,
    pngDatei,
} = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { WASSER_INSTALL } = require("./lib/wasser-linse.cjs");

const SELBST = process.argv.includes("--selftest");
// --nur=promotion,nahstreu: nur diese Selbsttests (der Hauptlauf fährt immer)
const NUR = (process.argv.find((a) => a.startsWith("--nur=")) || "--nur=").slice(6).split(",").filter(Boolean);
// --phasen=lichtung,w4: der Hauptlauf fährt nur diese Phasen (eine gezielte Messung; ohne die Option alle)
const PHASEN = (process.argv.find((a) => a.startsWith("--phasen=")) || "--phasen=").slice(9).split(",").filter(Boolean);
// --bild: W9 aus dem Ausgabe-Bild, echter Renderer (lokal unter dem GPU-Schloss); der Lauf fährt nur die Phase grund
const BILD = process.argv.includes("--bild");

// DIE BASIS-ZEILEN je Defekt: [geheilte Form im Stamm, Basis-Form].
const BASIS = {
    // ohne die Hülle des Gesetzbuchs: nur die vier EG-Wände der Tür-Zeile, keine Böden, Tritte, Innenwände
    huelle: [["if (fest && fest.length) {", "if (false) {"]],
    // die gedrehte Box als achsparallele Welt-AABB gelesen
    obb: [["        const ob = box.obb;\n        if (ob) {", "        const ob = null;\n        if (ob) {"]],
    // die Natur wirft in den Grundriss, und das Dorf räumt nicht
    grundriss: [
        // die Wand des Orts (`_ortWand`) trägt den Grundriss für die Natur-Wand und den Solitär
        [
            "        return this._imGrundriss(position.x, position.z, 0.8, this._naturKrone(name, opts));",
            "        return false;",
        ],
        // die Räumung lebt an der Wurzel (`spawnArchitecture`) und an der Ankunft der Hülle (`_hausHuelleSetzen`)
        ["if (this._grundrissVon(entry)) this._grundrissRaeumen(entry);", ""],
        [
            "this.state.architectures.includes(entry))\n            this._grundrissRaeumen(entry);",
            "this.state.architectures.includes(entry)) void 0;",
        ],
    ],
    // die Streu der Region räumt nicht, wenn das Dorf kommt
    streu: [["this._streuZelleRaeumen(cell);", "void 0;"]],
    // die Streu-Zelle läuft an der Wand vorbei (der Neubau der Region)
    streuwand: [
        [
            "const rec = this._naturSetzen(species, tf, tf, () =>",
            "const rec = ((_a, _b, _c, f) => f())(species, tf, tf, () =>",
        ],
    ],
    // die Promotion läuft an der Wand vorbei (und Region wie Neubau lassen die Zellen stehen — sonst erreicht keine den Ring)
    promotion: [
        ["this._streuZelleRaeumen(cell);", "void 0;"],
        [
            "const rec = this._naturSetzen(species, tf, tf, () =>",
            "const rec = ((_a, _b, _c, f) => f())(species, tf, tf, () =>",
        ],
        [
            "im Grundriss eines Hauses fällt er mit seiner Streu-Instanz.\n        const entry = this._naturSetzen(",
            "im Grundriss eines Hauses fällt er mit seiner Streu-Instanz.\n        const entry = this.spawnArchitecture(",
        ],
    ],
    // die Nah-Streu läuft an der Wand vorbei
    nahstreu: [["this._naturSetzen(null, it, null, () => items.push(it));", "items.push(it);"]],
    // DIE LICHTUNG (W8): die Wand kennt die Genesis-Plattform nicht (ihr Bauplan trägt keine Lichtung)
    lichtung: [["                lichtung: true,\n", ""]],
    // DIE SCHEIBE SCHWEBT: die Plattform steht 5 m über dem Grund
    schwebe: [
        [
            'this.spawnArchitecture("start_plattform", { x: spot.x, y: sohle + 0.5, z: spot.z }, { silent: true });',
            'this.spawnArchitecture("start_plattform", { x: spot.x, y: sohle + 5.5, z: spot.z }, { silent: true });',
        ],
    ],
    // DER PLATZ IST NUR DIE SCHEIBE: die Lichtung trägt den Ring der Tore nicht (6,5 m statt Kreis + Tor-Tiefe)
    platz: [
        [
            "const r = Math.max(p0 && Number.isFinite(p0.x) ? (p0.x / 2) * g : 0, P.ringR + P.rand);",
            "const r = p0 && Number.isFinite(p0.x) ? (p0.x / 2) * g : 0;",
        ],
    ],
    // W9: der Erdbau kennt keinen Keller
    grundkeller: [["/gelaende-core.js", "        if (!E || !E.hohl) return d;", "        if (E || !E) return d;"]],
    // W9: der Kreis des Büschels ohne die Matrix der Vorlage
    grundbueschel: [["            reich: 0.72,", "            reich: 0.17,"]],
    // W9: der Abbau lässt den Grund liegen
    abbau: [["        this._erdbauGrundFaellt(entry);", "        "]],
    // W9 SLOT: das gesetzte Haus legt seinen Plan ohne Vorplatz
    vorplatz: [["return this._erdbauSetzen(key, v2.erdbau)", "return this._erdbauSetzen(key, v2.erdbau.slice(0, 2))"]],
    // W9: der Grund wartet auf die Hülle
    grundplan: [["        this._hausGrundSetzen(entry);\n        // DIE EINE RÄUMUNG", "        // DIE EINE RÄUMUNG"]],
    // W9: der geschlossene Slot lässt seinen Grund liegen
    waise: [
        [
            "        const zu = () => (this._erdbauGrundFaellt({ position: { x: wx, z: wz } }), false);",
            "        const zu = () => false;",
        ],
    ],
    // W9: das Verblassen nimmt nur den Eintrag
    verblassen: [
        [
            "        if (entry) this.removeArchitecture(entry, { still: true });",
            "        if (entry) this.state.architectures.splice(this.state.architectures.indexOf(entry), 1);",
        ],
    ],
    // W9: der Plan stellt den Brunnen ungeprüft vor ein Haus
    ausstattung: [["/fachwerk-core.js", "        lay.brunnen = neu;\n        return aus;", "        return aus;"]],
    // W9: die Wiederkehr nach dem Reload reiht die offenen Slots nicht ein
    zugreload: [
        [
            "this._dorfZug(this._dorfZugOffen(v2, anker), anker, k, gang)",
            "this._dorfZug({ ...v2, slots: [] }, anker, k, gang)",
        ],
    ],
    // EIN BAU OHNE HAUS-ZEILE TRÄGT KEINEN GRUNDRISS: Tor, Esse, Brunnen, Damm — die Natur wirft in ihn, nichts räumt
    baugrund: [["if (!(e.affordances && e.affordances.moveable) && !this._istNatur(e)) {", "if (false) {"]],
    // DIE WAND KENNT DEN WEG NICHT: Weg, Platz und Acker eines Dorfs urteilen nur über die Wiese
    weg: [['return this._aufWeg(x, z, rand, ohne && ohne._trittBox) ? "weg" : false;', "return false;"]],
    // DAS WERK IM STEIN: der Satz setzt seine Werke auf den Boden des Gesetzes, nie auf den Bau, der dort trägt
    dach: [["? this._bauDachUnter(x, z, sy) + 0.5 : y;", "? sy + 0.5 : y;"]],
    // eine Quelle geht an der Wand vorbei: die Wald-Schlange setzt ihre Würfe direkt
    lichtungwald: [
        [
            "            this._naturSetzen(task.name, task.position, task.opts);",
            "            this.spawnArchitecture(task.name, task.position, task.opts);",
        ],
    ],
    // eine Quelle geht an der Wand vorbei: der Hain der KI (`spawn_studio`) setzt seine Natur direkt — an der Plattform UND im Haus
    kihain: [["? this._naturSetzen(name, ort, opts, null, absage)", "? this.spawnArchitecture(name, ort, opts)"]],
    // die Wand nimmt still: der Hain fällt ohne Absage — der Chat sagte „gewachsen" bei 0 Bäumen
    stumm: [["            if (absage) absage(wo);\n", ""]],
    // die Fernstufe trägt ihre Bounding-Box statt der Solids des Gesetzbuchs (das Gesetzbuch reist über den Worker)
    fernstufe: [
        [
            "/fachwerk-core.js",
            "var huelle = gm.__solids && gm.__solids.length ? { stufe: stufe, boxen: gm.__solids } : null;",
            "var hb = new THREE.Box3().setFromObject(g); var huelle = stufe === 0 ? { stufe: 0, boxen: gm.__solids } : { stufe: stufe, boxen: [hb.min.x, hb.min.y, hb.min.z, hb.max.x, hb.max.y, hb.max.z] };",
        ],
    ],
    // die Siedlung baut ohne Bau-Wand (ein Haus darf in einem bestehenden Bau stehen): die Slot-Quelle und die Ort-Wahl
    // (`_ortTraegtWirt`) lesen dieselbe Wand — der Defekt nimmt sie beiden
    bauwand: [
        ["if (!this._bauFrei(wx, wz, ry,", "if (false && !this._bauFrei(wx, wz, ry,"],
        ["if (!this._bauFrei(wx, wz, sl.phi || 0,", "if (false && !this._bauFrei(wx, wz, sl.phi || 0,"],
        ["const R = Math.max(0.5, (this._blueprintFootprintRadius(type, 1) || 0) * Math.SQRT1_2);", "return true;"],
    ],
    // W10: der Stab (die Brüstung) trägt · der Spieler klettert an jeder gestreiften Wand · an keiner
    kletter: [["-Math.SQRT1_2 &&", "Infinity &&"]],
    // W10: jeder Slot des Start-Dorfs östlich seiner Mitte fällt geschlossen — das Dorf steht nicht ganz
    startslot: [["        if (!name) return zu(); // fail-closed", "        if (!name || slot.x > 0) return zu();"]],
    // W10: der Bau räumt den Wurf des Felds nicht, am Deckel der Tiere
    tierbau: [
        ['if (wo && wo !== "weg") fallen.push(c);', "if (false) fallen.push(c);"],
        ["            maxCreatures: 20,", "            maxCreatures: 6,"],
    ],
    wand: [["-Math.SQRT1_2 &&", "-2 &&"]],
    stab: [
        [
            "(ob ? 2 * Math.min(ob.hx, ob.hz) : Math.min(a.maxX - a.minX, a.maxZ - a.minZ)) < AnazhRealm.PLAYER_STAB;",
            "false;",
        ],
    ],
    // vor der ersten Studio-Stufe die geschlossene Kern-Box ohne Tür-Lücke
    kern: [["boxen = this._hausKernHuelle(t);", "boxen = [-t.W / 2, 0, -t.D / 2, t.W / 2, 3.1, t.D / 2];"]],
};
const patchZiel = (z) =>
    z.length === 3 ? z : ["/" + (stammLib.dateiMit(ROOT, z[0]) || stammLib.dateien(ROOT)[0]), z[0], z[1]];

// DIE WELTEN NEBENEINANDER (HAUS_WELT_PARALLEL, höchstens 4): je Platz ein EIGENER Server (HAUS_WELT_PORT + Platz) mit dem
// Patch SEINER Welt, je Welt ein eigener Browser-Kontext
const PARALLEL = Math.max(1, Number(process.env.HAUS_WELT_PARALLEL) || Math.min(4, require("os").cpus().length));
const PORT_BASIS = Number(process.env.HAUS_WELT_PORT) || 0;
// --teil=k/n: die CI fährt die Welten in n Gruppen — Teil k trägt die Welten i (0 = der Hauptlauf, dann die Selbsttests)
// mit i mod n = k - 1; jede Welt urteilt in GENAU einem Teil.
const TEIL = teilAus(process.argv);
const imTeil = (i) => !TEIL || i % TEIL.n === TEIL.k - 1;
// eine Patch-Zeile [geheilt, basis] gilt der Stamm-Datei, die sie trägt (`dateiMit`), [datei, geheilt, basis] der genannten
// (das Gesetzbuch reist über den Foundry-Worker: /fachwerk-core.js)
const machServer = (platz) =>
    statikServer({
        root: ROOT,
        wandle: (p, data) => {
            const z = platz.z;
            const meine = data && z && z.patch ? z.patch.map(patchZiel).filter((x) => x[0] === p) : [];
            if (!meine.length) return data;
            let txt = data.toString("utf8");
            for (const [, geheilt, basis] of meine) {
                if (!txt.includes(geheilt)) z.fehler.push(`geheilte Zeile fehlt in ${p} („${geheilt.slice(0, 70)}…")`);
                else {
                    txt = txt.replace(geheilt, basis);
                    z.angewandt.add(p + "|" + geheilt);
                }
            }
            return Buffer.from(txt, "utf8");
        },
    });

async function proben(phasen) {
    const r = window.anazhRealm;
    const s = r.state;
    const A = r.constructor;
    const FC = window.__fachwerkCore;
    // DIE PHASEN: haus (W1 W2 W4c W5 W10 je Haus), start (dazu jedes Haus des Start-Dorfs), innen (sein Innen-Bild), sohle,
    // lichtung, bau (W8), w4, w4b, w6, grund (W9) — der Hauptlauf fährt alle in zwei Welten, ein Selbsttest nur die seines Täters
    const P = new Set(phasen);
    const o = { haeuser: [], phasen: [...P] };
    if (!FC || typeof FC.HAUS !== "function") return { fehler: "__fachwerkCore fehlt" };
    const pm = s.playerMesh;
    const DT = A.FIXED_DT || 1 / 60;
    let t = 5000;
    const pumpe = async (n) => {
        for (let k = 0; k < n; k++) {
            try {
                r._gameLoopTick(performance.now());
            } catch {}
            if (k % 8 === 0) await sleep(10);
        }
    };
    // DAS WARTEN IM EREIGNIS (welt-boot `__deckel`): Takt um Takt, bis `bis()` gilt — der Deckel zählt nur Takte, in denen die
    // Welt nichts offen hat (`_weltOffen`): unter Last wartet die Probe auf den Bau, nie auf eine Takt-Zahl; `ms` Pause je Gang
    const warteBis = async (bis, n, max, ms) => {
        let ja = false;
        try {
            for (let k = 0, weiter = window.__deckel("haus-welt", max); !(ja = bis()) && weiter() && k++ < 4 * max;)
                await pumpe(n).then(() => ms && sleep(ms));
        } catch {}
        return ja;
    };
    // DIE RUHE AM ORT (x, z): sein Chunk steht, die Wald-Schlange ist leer, die Nah-Streu hat jede gewollte Kachel gebaut
    // (`nahStreu.offen` 0) — 20 Proben in Folge nach `vor` Takten; gezählt wird der Konsum, nie eine Takt-Zahl. Ohne Ort
    // (x null) nur Schlange und Streu.
    const ruheAn = async (x, z, vor = 60) => {
        const span = r._voxelChunkConfig(0).span;
        let [ruhig, k] = [0, 0];
        const steht = () => {
            const e =
                x == null || (s.voxelChunks && s.voxelChunks.get(`${Math.floor(x / span)},${Math.floor(z / span)}`));
            const ns = s.nahStreu;
            return (
                k++ > vor &&
                e &&
                (x == null || e.surfMap) &&
                !(s.pendingVegSpawns && s.pendingVegSpawns.length) &&
                ns &&
                ns.kacheln.size > 0 &&
                ns.offen === 0
            );
        };
        await warteBis(() => (ruhig = steht() ? ruhig + 1 : 0) >= 20, 4, 1500);
        return ruhig >= 20;
    };
    // eine lebende Streu-Zelle (ihre Instanz-Slots oder ihr Feld-Wurf)
    const lebt = (c) => (c.slots && c.slots.length) || c.feld;
    // jede Streu-Zelle jeder Region
    const streuZellen = () =>
        [...((s.scatterRegions && s.scatterRegions.values()) || [])].flatMap((g) => g.cells || []);
    // die Streu-Regionen im ±40-m-Kreuz um (x, z)
    const regionenUm = (x, z) => {
        const q = new Set();
        for (const dx of [-40, 0, 40])
            for (const dz of [-40, 0, 40])
                q.add(`${Math.floor((x + dx) / A.SCATTER.regionM)},${Math.floor((z + dz) / A.SCATTER.regionM)}`);
        return q;
    };
    // ── das Drehbuch-Dorf 7/18, der Akt des Chats „dorf 7 18" — AN EINEM HANG: der nächste 16-m-Ring (160–480 m um den
    // Start) mit einem trockenen Ort (kein Wasser im 40-m-Kreis), dessen Gefälle über ±8 m 0,3–0,6 ist, darin der steilste ──
    let dorfOrt = null;
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    const rund = (v, k = 100) => Math.round(v * k) / k;
    const gruende = () => (r._erdbauLage() || {}).gruende || [];
    {
        const nass = (x, z) => {
            const ws = r._atlasWaterLevelAt(x, z, hh(x, z));
            return Number.isFinite(ws) && ws > hh(x, z) - 0.3;
        };
        const hang = (x, z) => r._slopeAt(x, z, hh, 8); // die EINE Steilheit über ±8 m
        const trocken = (x, z) => {
            if (nass(x, z)) return false;
            for (let b = 0; b < 12; b++)
                for (const rr of [20, 40])
                    if (nass(x + Math.cos((b * Math.PI) / 6) * rr, z + Math.sin((b * Math.PI) / 6) * rr)) return false;
            return true;
        };
        for (let ring = 10; ring <= 30 && !dorfOrt; ring++)
            for (let k = 0; k < 8 * ring; k++) {
                const a = (k / (8 * ring)) * Math.PI * 2;
                const x = pm.position.x + Math.cos(a) * ring * 16;
                const z = pm.position.z + Math.sin(a) * ring * 16;
                const g = hang(x, z);
                if (g >= 0.3 && g <= 0.6 && (!dorfOrt || g > dorfOrt.hang) && trocken(x, z))
                    dorfOrt = { x, y: hh(x, z), z, hang: g };
            }
        o.dorfOrt = dorfOrt
            ? {
                  x: Math.round(dorfOrt.x),
                  z: Math.round(dorfOrt.z),
                  hang: rund(dorfOrt.hang, 1000),
              }
            : null;
    }
    const start = { x: pm.position.x, y: pm.position.y, z: pm.position.z };
    o.startOrt = { x: Math.round(start.x), z: Math.round(start.z) };
    const vorBau = new Set(s.architectures);
    let steht = false;
    r.spawnSettlement(
        dorfOrt ? { seed: 7, nH: 18, position: { x: dorfOrt.x, y: dorfOrt.y, z: dorfOrt.z } } : { seed: 7, nH: 18 }
    ).then(() => (steht = true));
    const dorfHaeuser = () =>
        s.architectures.filter((e) => e.type && e.type.startsWith("haus_") && e.tuer && e.fundament);
    // der Export reist durch den Foundry-Worker, der Akt hebt über den Zug: warten, bis er steht
    await warteBis(() => steht, 4, 120, 100);
    const H = dorfHaeuser();
    o.gesamt = H.length;
    const dorfMitte = { x: start.x, z: start.z };
    if (H.length) {
        dorfMitte.x = H.reduce((a, e) => a + e.position.x, 0) / H.length;
        dorfMitte.z = H.reduce((a, e) => a + e.position.z, 0) / H.length;
    }
    // die Probe des Gesetzbuchs je Haus (Rezept + Stempel + Same → HAUS): Diele und Flights
    const gesetz = (e) => {
        const kultur = e.type.slice(5);
        const pre = FC.PRESETS && FC.PRESETS[kultur];
        if (!pre) return null;
        const P = FC.hausParams(pre, e.studioOv || null);
        P.seed = e.seed;
        const Hh = FC.HAUS(window.THREE, FC.mat, P);
        Hh.build({ gelaende: false });
        return Hh;
    };
    // ein trockener Ort 150 m um M, 60 m von jedem Haus (`wild`: die Wildnis trägt ihn), null ohne
    const ort150 = (M, wild) => {
        for (let a = 0; a < 16; a++) {
            const gx = M.x + Math.cos((a / 16) * Math.PI * 2) * 150;
            const gz = M.z + Math.sin((a / 16) * Math.PI * 2) * 150;
            if (!r._landAt(gx, gz, 0.5) || (wild && !r._wildnisTraegt(gx, gz))) continue;
            if (!s.architectures.some((e) => e.fundament && Math.hypot(e.position.x - gx, e.position.z - gz) < 60))
                return [gx, gz];
        }
        return null;
    };
    // das 5 × 5-Raster über den Grundriss eines Hauses (`_grundrissVon`), 0,1 m innen
    const raster5 = (e, f) =>
        [0, 1, 2, 3, 4].flatMap((i) =>
            [0, 1, 2, 3, 4].map((j) => welt(e, f.ox + (f.ex - 0.1) * (i / 2 - 1), f.oz + (f.ez - 0.1) * (j / 2 - 1)))
        );
    const welt = (e, lx, lz) => {
        const c = Math.cos(e.rotationY || 0);
        const sn = Math.sin(e.rotationY || 0);
        return { x: e.position.x + lx * c + lz * sn, z: e.position.z - lx * sn + lz * c };
    };
    const lokal = (e, x, z) => {
        const c = Math.cos(e.rotationY || 0);
        const sn = Math.sin(e.rotationY || 0);
        const dx = x - e.position.x;
        const dz = z - e.position.z;
        return { x: dx * c - dz * sn, z: dx * sn + dz * c };
    };
    const stell = (x, y, z) => {
        pm.position.set(x, y, z);
        s._fieldVy = 0;
        if (s.playerVel && s.playerVel.setValue) s.playerVel.setValue(0, 0, 0);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm.position);
        for (let k = 0; k < 20; k++) r._stepFixedSim((t += DT), DT);
    };
    // die Orte auf Ringen um m (je 8 auf den Radien rs)
    const ring = (m, rs, n = 8) =>
        rs.flatMap((rr) =>
            Array.from({ length: n }, (_, a) => [
                m.x + Math.cos((a / n) * Math.PI * 2) * rr,
                m.z + Math.sin((a / n) * Math.PI * 2) * rr,
            ])
        );
    // ein Haus des Rezepts `vor` auf dem ersten der Orte mit Land, frei im 14-m-Kreis, an dem `gut(x, z)` nach dem Bau der
    // Boden-Karten gilt, samt Hülle; null: keiner. Gesetzt wie vom Spieler: die Werkstatt prägt das Rezept (`ws.studioOv`,
    // ein eigener Körper über den Steuer-Passagier `__w9`), das Phantom steht am Ort, `confirmBuild` setzt (schöpfer)
    const setze = async (vor, id, orte, gut = () => true, phi = 0.6) => {
        for (const [x, z] of vor ? orte : []) {
            if (!r._landAt(x, z, 0.5) || !r._ortFrei(x, z, 14)) continue;
            stell(x, hh(x, z) + 2, z);
            await warteBis(() => !!r._bodenSichtChunks(x - 8, z - 8, x + 8, z + 8), 5, 200);
            if (!gut(x, z)) continue;
            const ws = s.workshop || (s.workshop = {});
            (ws.studioOv || (ws.studioOv = {}))[r._foundryPresetForEntry(vor)] = { ...vor.studioOv, __w9: id };
            const [modus, ni, bm] = [r.getGameMode(), r._newArchId, s.buildMode];
            r.setGameMode("schöpfer");
            r._bauModusFuer(vor.type);
            if (bm.phantomMesh) bm.phantomMesh.position.set(x, hh(x, z), z);
            if (bm.phantomMesh) bm.phantomMesh.rotation.y = phi;
            r._newArchId = () => id;
            const hs = r._hausHuelleSetzen; // W9 PLAN: die Gründe an seiner Mitte, wenn die Hülle seines Körpers ankommt
            r._hausHuelleSetzen = function (en, hu) {
                if (en.id === id && !en._hausHuelle)
                    en.__w9Plan = gruende().filter(
                        (g) => Math.hypot(g.cx - en.position.x, g.cz - en.position.z) < 0.05
                    ).length;
                return hs.call(this, en, hu);
            };
            try {
                o.werkstatt = r.confirmBuild();
            } finally {
                [r._newArchId, ws.studioOv] = [ni, {}];
                r._clearBuildMode();
                r.setGameMode(modus);
            }
            const e = s.architectures.find((a) => a.id === id);
            if (e)
                await window
                    .__gebautNach(e, { fertig: () => !!e._hausHuelle, bau: () => {}, takt: () => pumpe(4), max: 300 })
                    .catch(() => null);
            if (e && e._hausHuelle) return e;
        }
        return null;
    };
    const FUSS = A.PLAYER_FOOT_OFFSET;
    // W10 DAS START-DORF (siedlung.K1 Staffel 2): der Takt der Welt hebt es am Genesis-Ort (der Hook führt), gegangen wird JEDES
    // Haus seines Plans — der Plan v2 im Gedächtnis des Orts (`_ortPlaene` unter `settlementCells.start.ort`), je Haus-Slot
    // (`_slotBauplan`) das Haus an seinem Ort; ein Slot ohne Haus ist ROT. Dazu die ersten 8 des Drehbuch-Dorfs am Hang.
    const SD = [];
    if (P.has("start")) {
        const takt = window.__anazhAutoSettlement;
        window.__anazhAutoSettlement = true;
        stell(start.x, start.y + 1, start.z);
        const zelle = () => ((s.worldMeta && s.worldMeta.settlementCells) || {}).start;
        await warteBis(() => !!zelle() && !r._autoSettlementQueue && !r._stlWegePending, 1, 1200);
        window.__anazhAutoSettlement = takt;
        const c = zelle();
        const plan = c && r._ortPlaene && r._ortPlaene.get(c.ort);
        const slots = ((plan && plan.slots) || []).filter((sl) => /^haus_/.test(r._slotBauplan(sl, r._foundry) || ""));
        o.startDorf = { slots: slots.length, fehlt: [] };
        for (const sl of slots) {
            const [x, z] = [c.x + sl.x, c.z + sl.z];
            const e = s.architectures.find((a) => a.tuer && Math.hypot(a.position.x - x, a.position.z - z) < 0.05);
            if (e) SD.push(e);
            else o.startDorf.fehlt.push(`${sl.kultur}@${Math.round(x)}/${Math.round(z)}`);
        }
    }
    for (const e of P.has("haus") ? [...SD, ...H.slice(0, 8)] : []) {
        const h = {
            typ: e.type,
            gierGrad: Math.round((((e.rotationY || 0) * 180) / Math.PI) % 360),
            start: SD.includes(e),
        };
        o.haeuser.push(h);
        // die Stufe 0 holen: der Spieler steht am Haus, bis die Foundry die Hülle der Stufe 0 liefert
        stell(e.position.x, e.position.y + 3, e.position.z);
        // im Bau-Ereignis, nie in Takten
        const l0 = () => e._servedLod === 0 && !!e._hausHuelle && e._hausHuelle.stufe === 0;
        await window.__gebautNach(e, { fertig: l0, bau: () => {}, takt: () => pumpe(10), max: 40 }).catch(() => null);
        h.stufe = e._servedLod;
        h.huelle = e._hausHuelle ? e._hausHuelle.stufe : null;
        const Hh = gesetz(e);
        if (!Hh) {
            h.fehler = "kein Gesetzbuch";
            continue;
        }
        const tu = e.tuer;
        const base = e.position.y - 0.5;
        // W10 TIER IM HAUS: kein Leib in der Fundament-Box vor dem Gang (der Wurf des Felds weicht dem Bau, `_naturRaeumen`)
        const fu = r._grundrissVon(e);
        // die Saat: ein Wurf des Felds genau in der Box (`precise`, ohne Spieler-Klemme), am Deckel weicht der fernste Leib
        const sp = welt(e, fu.ox, fu.oz);
        const weit = (c) => Math.hypot(c.position.x - sp.x, c.position.z - sp.z);
        for (let k = 0; k < 64 && s.creatures.length >= s.maxCreatures; k++)
            r.removeCreature(s.creatures.reduce((m, c) => (weit(c) > weit(m) ? c : m)));
        const saat = r.spawnCreatureAt(sp.x, e.position.y + 1, sp.z, undefined, null, { precise: true });
        if (saat) saat.userData.feldWurf = true;
        h.saat = !!saat && r._grundrissRaeumen(e) >= 0;
        h.tiere = s.creatures
            .map((c) => [c, lokal(e, c.position.x, c.position.z)])
            .filter(([, q]) => Math.abs(q.x - fu.ox) <= fu.ex && Math.abs(q.z - fu.oz) <= fu.ez)
            .map(([c]) => c.userData.gattung + " " + (c.position.y - base).toFixed(2));
        // W10 DER SPIELGANG (siedlung.K1): EIN Gang ohne Versetzen, je Sim-Schritt der Hub, je Ziel Rest und Fuß
        const dm = Hh.dims || {};
        const fls = (dm.flights || []).filter((f) => f.x1 - f.x0 > 0.3);
        const kf = fls.find((f) => f.atLevel === "keller");
        const auf = fls
            .filter((f) => f !== kf)
            .sort((a, b) => a.base - b.base || (a.atLevel === "attic") - (b.atLevel === "attic"));
        const g = (h.gang = {
            hub: 0,
            fehlt: [],
            keller: !!kf,
            dach: auf.some((f) => f.atLevel === "attic"),
        });
        s.keys = s.keys || {};
        const eg = dm.levelsY[0];
        const xm = (f) => (f.x0 + f.x1) / 2;
        const oben = (f) => f.zFoot + f.dir * (f.N * f.go + 0.4);
        const seite = (rechts) => (rechts ? dm.stairX1 + 0.6 : dm.stairX0 - 0.6);
        const ziel = (name, lx, lz, soll) => {
            const w = welt(e, lx, lz);
            let kl = 0;
            for (let k = 0, ruhe = 0; ruhe < 10; k++) {
                s.keys.w = !ruhe && k < 500 && Math.hypot(w.x - pm.position.x, w.z - pm.position.z) > 0.2;
                if (!s.keys.w) ruhe++;
                // wie ein Mensch: führt der Weg in eine Wand (≤ 45° neben ihrer Normalen), geht er an ihr entlang, nie hinein
                let [dx, dz] = [w.x - pm.position.x, w.z - pm.position.z];
                const dn = dx * s._wandKontaktNx + dz * s._wandKontaktNz;
                if (
                    s._simZeit - s._wandKontaktAt < A._parkourGesetz().kontaktFrischeSec &&
                    dn < -Math.SQRT1_2 * Math.hypot(dx, dz)
                )
                    [dx, dz] = [dx - dn * s._wandKontaktNx, dz - dn * s._wandKontaktNz];
                s.yaw = Math.atan2(dx, dz);
                const y0 = pm.position.y;
                r._stepFixedSim((t += DT), DT);
                kl += s._parkourKletter > 0;
                if (pm.position.y - y0 > g.hub)
                    [g.hub, g.wo] = [
                        pm.position.y - y0,
                        `${name}: Fuß ${(y0 - FUSS - base).toFixed(2)} → ${(pm.position.y - FUSS - base).toFixed(2)} m`,
                    ];
            }
            const rest = Math.hypot(w.x - pm.position.x, w.z - pm.position.z);
            const fuss = pm.position.y - FUSS - base;
            // wer nie in eine Wand drückt, klettert nie
            if (rest > 0.4 || Math.abs(fuss - soll) > 0.35 || kl)
                g.fehlt.push(
                    `${name} ${rest.toFixed(2)} m neben, Fuß ${fuss.toFixed(2)}/${soll.toFixed(2)}, ${kl} Schritte geklettert`
                );
            [g.x, g.z] = [lx, lz];
        };
        // W1 TÜR: vom Podest-Rand vor der Tür 1,8 m nach innen, an der Zarge entlang (der Körper streift sie)
        const vor = welt(e, tu.x + tu.w / 2 - 0.3, tu.z - 0.25);
        stell(vor.x, base + 0.75 + FUSS, vor.z);
        ziel("tür", tu.x + tu.w / 2 - 0.3, tu.z + 1.8, NaN);
        const l = lokal(e, pm.position.x, pm.position.z);
        // W2 DIELE: der Fuß steht auf einer Fläche des Gesetzbuchs — die nächste Solid-Oberkante, deren Grundfläche den
        // Kapsel-Kreis trifft (das Gesetzbuch rechnet sie selbst, nie die Blocker der Welt)
        const fussL = pm.position.y - FUSS - base;
        const rK = A.PLAYER_WALL_RADIUS || 0.35;
        let best = Infinity;
        for (const so of Hh.solids || []) {
            const qx = Math.max(so.min[0], Math.min(l.x, so.max[0]));
            const qz = Math.max(so.min[2], Math.min(l.z, so.max[2]));
            if ((qx - l.x) ** 2 + (qz - l.z) ** 2 > rK * rK) continue;
            const d = fussL - so.max[1];
            if (Math.abs(d) < Math.abs(best)) best = d;
        }
        h.dieleCm = Number.isFinite(best) ? Math.round(best * 1000) / 10 : null;
        // W1 DIE TÜR LIEGT NIE IM BODEN: das Gelände am Tür-Vorplatz liegt nie über der Diele hinter der Schwelle (die
        // Oberkante des Gesetzbuchs 0,5 m hinter der Tür) — Toleranz 0,2 m, die Feinform des sichtbaren Meshes (Lehre 22)
        {
            let schwelle = -Infinity;
            for (const so of Hh.solids || [])
                if (
                    so.min[0] <= tu.x &&
                    tu.x <= so.max[0] &&
                    so.min[2] <= tu.z + 0.5 &&
                    tu.z + 0.5 <= so.max[2] &&
                    so.max[1] < 1.6
                )
                    schwelle = Math.max(schwelle, so.max[1]);
            h.vorplatzUeberM = Number.isFinite(schwelle) ? rund(hh(vor.x, vor.z) - base - schwelle) : null;
        }
        // W4c DER GRUNDRISS DECKT DAS HAUS: die Solids des Gesetzbuchs liegen in der Fundament-Box des Eintrags (Mitte
        // {ox,oz} + halbe Maße {ex,ez}, haus-lokal) — Podest, Natur-Wand und Räumen lesen sie
        {
            const f = r._grundrissVon(e);
            let ueber = 0;
            for (const so of Hh.solids || []) {
                ueber = Math.max(
                    ueber,
                    f.ox - f.ex - so.min[0],
                    so.max[0] - (f.ox + f.ex),
                    f.oz - f.ez - so.min[2],
                    so.max[2] - (f.oz + f.ez)
                );
            }
            h.grundrissUeberM = rund(ueber);
        }
        // W5 KOLLISION == OPTIK auf der Diele-Ebene: die Welt-Kapsel gegen die Gesetzbuch-Wand-Regel je Rasterpunkt
        {
            const STEP = A.PLAYER_STEP_UP;
            const rW = A.PLAYER_WALL_RADIUS || 0.35;
            const fussY = 0.66; // haus-lokal knapp über der EG-Diele
            let gleich = 0;
            let n = 0;
            for (let gx = -tu.W / 2 + 0.25; gx < tu.W / 2; gx += 0.5)
                for (let gz = -tu.D / 2 + 0.25; gz < tu.D / 2; gz += 0.5) {
                    // das Gesetzbuch: eine Box, deren Oberkante über der Stufe-hoch-Linie liegt und die den Körper
                    // (Fuß … Fuß + 2·FUSS) schneidet, ist Wand, wenn der Kreis sie berührt — die Regel des Kapsel-Lösers
                    let gesetzWand = false;
                    for (const so of Hh.solids || []) {
                        if (!(so.max[1] > fussY + STEP && so.min[1] < fussY + 2 * FUSS)) continue;
                        const qx = Math.max(so.min[0], Math.min(gx, so.max[0]));
                        const qz = Math.max(so.min[2], Math.min(gz, so.max[2]));
                        if ((qx - gx) ** 2 + (qz - gz) ** 2 < rW * rW) {
                            gesetzWand = true;
                            break;
                        }
                    }
                    const w = welt(e, gx, gz);
                    // der Löser der Kapsel je Box (`_resolveCapsuleVsAABB`) gegen die Boxen DIESES Hauses (das Nachbarhaus in der
                    // Reihe ist nicht sein Gesetzbuch)
                    const pos = { x: w.x, z: w.z };
                    for (const bx of e.blockerAABBs || [])
                        r._resolveCapsuleVsAABB(bx, pos, base + fussY, base + fussY + 2 * FUSS, rW, -Infinity);
                    const weltWand = Math.hypot(pos.x - w.x, pos.z - w.z) > 1e-3;
                    n++;
                    if (weltWand === gesetzWand) gleich++;
                }
            h.optikProzent = n ? Math.round((gleich / n) * 1000) / 10 : null;
        }
        if (kf || auf.length) {
            // jenseits des Schachts: um ihn herum — hinter dem Fuß des Laufs auf der Seite des Körpers, davor auf der des
            // Ziels (quer durch den Lauf stieg der Körper auf seine Tritte: Haus 732469 neben der Tür, 0,46 m)
            const hin = (name, lx, lz, soll) => {
                const sr = seite((g.z > dm.stairZ0 ? g.x : lx) > (dm.stairX0 + dm.stairX1) / 2);
                if (g.z < dm.stairZ0 !== lz < dm.stairZ0) {
                    ziel(name + "-um", sr, g.z, NaN);
                    ziel(name + "-um", sr, lz, NaN);
                }
                ziel(name, lx, lz, soll);
            };
            if (kf) {
                const kt = kf.zFoot + kf.dir * (kf.N * kf.go + 0.4);
                hin("keller-kopf", xm(kf), kt, eg);
                ziel("keller", xm(kf), kf.zFoot - kf.dir * 0.6, kf.base + 0.12);
                ziel("keller-auf", xm(kf), kt, eg);
            }
            for (const f of auf) {
                hin(`fuß ${f.atLevel}`, xm(f), f.zFoot - f.dir * 0.6, f.base);
                ziel(`lauf ${f.atLevel}`, xm(f), oben(f), f.base + f.N * f.rise);
            }
            for (const f of kf ? [kf, ...auf] : auf)
                for (const v of [-0.12, 0.12]) {
                    const a = welt(e, xm(f) + v, f.zFoot - f.dir * 0.5);
                    stell(a.x, base + f.base + 0.1 + FUSS, a.z);
                    ziel(`rand ${f.atLevel} ${v}`, xm(f) + v, oben(f), f.base + f.N * f.rise);
                }
        }
        // DIE WAND: frontal gegen die Wand neben der Tür klettert der Körper (gewolltes Klettern trägt)
        const wx = tu.x + (tu.x < 0 ? 1 : -1) * (tu.w / 2 + 0.7);
        const [wv, wz] = [welt(e, wx, tu.z - 0.7), welt(e, wx, tu.z + 1)];
        stell(wv.x, base + 0.75 + FUSS, wv.z);
        let [wy, wmax] = [0, -Infinity];
        for (let k = 0; k < 120; k++) {
            [s.keys.w, s.yaw] = [k >= 30, Math.atan2(wz.x - wv.x, wz.z - wv.z)];
            r._stepFixedSim((t += DT), DT);
            if (k === 29) wy = pm.position.y;
            if (k >= 29) wmax = Math.max(wmax, pm.position.y);
        }
        [s.keys.w, g.wand] = [false, rund(wmax - wy)];
    }
    // W9 (Kopf): Erde 5 cm über der Diele, Raster 0,25 m; `--bild`: je Box zwei Blicke aus dem Ausgabe-Pfad (Halm-Pixel gegen
    // das Bild ohne die Büschel der Box, Boden-Pixel aus der Maske des Boden-Satzes), artifacts/haus-welt/grund-*.png
    // das Grund-Datum eines Hauses (fachwerk `grundVon`): die Boxen des Körper-Satzes (`traegt` 0: der Grund ist ihr Boden)
    const grundDes = (e) => {
        const Hh = gesetz(e);
        const gd = FC.grundVon({ H: Hh });
        return {
            Hh,
            sc: (e.scale > 0 ? e.scale : 1) * (e._hausHuelleSkala > 0 ? e._hausHuelleSkala : 1),
            base: e.position.y - 0.5,
            kasten: gd.boxen.map(([x0, x1, z0, z1, traegt], j) => ({ art: gd.arten[j], x0, x1, z0, z1, traegt })),
        };
    };
    // die Büschel der Nah-Wiese über dem Rechteck (je Kachel einmal)
    const bueschelIn = (x0, z0, x1, z1) => {
        const [KW, l] = [A.NAH_WIESE.kachel, []];
        for (let tx = Math.floor(x0 / KW); tx <= Math.floor(x1 / KW); tx++)
            for (let tz = Math.floor(z0 / KW); tz <= Math.floor(z1 / KW); tz++)
                l.push(...(r._nahWieseKachelBueschel(tx, tz) || []));
        return l;
    };
    let sbE = null; // das Haus des Spielers (W9 mit `--bild`)
    if (P.has("grund")) {
        const BILD = P.has("bild");
        o.w9 = { bild: BILD, haeuser: [] };
        const [WB, HB, cam] = [480, 270, s.camera];
        let tick = null;
        if (BILD) {
            await window.__weltStehtNach(() => pumpe(1));
            window.__buehne();
            s.renderer.setAnimationLoop(null); // der Loop ruht (Lehre 17)
            tick = r._tickNahWiese;
        }
        // ein Schuss aus dem Ausgabe-Pfad: `aus` unsichtbar, die Büschel `innen` ([Kachel, Index]) ohne Matrix
        const schuss = async (aus, innen) => {
            const halt = innen.map(([k, i]) => [k, i, k.basis.slice(i * 16, i * 16 + 16)]);
            for (const m of aus) m.visible = false;
            for (const [k, i] of innen) k.basis.fill(0, i * 16, i * 16 + 16);
            if (innen.length) s.nahWiese.neu = true;
            r._tickNahWiese = aus.length || innen.length ? () => 0 : tick;
            window.__bundlesNeu();
            r._schattenAlleNeu();
            try {
                return (await window.__ausgabeAufnahme(WB, HB, 1, { satz: "messung" })).u8;
            } finally {
                for (const m of aus) m.visible = true;
                for (const [k, i, alt] of halt) k.basis.set(alt, i * 16);
                if (halt.length) s.nahWiese.neu = true;
                r._tickNahWiese = tick;
                window.__bundlesNeu();
            }
        };
        const anders = (X, Y, i) => Math.max(...[0, 1, 2].map((c) => Math.abs(X[i + c] - Y[i + c]))) > 18;
        // die Luminanz (sRGB linear) im Median der Pixel um (px, py) ± rad
        const lin = Array.from({ length: 256 }, (_, i) => (i <= 10 ? i / 3294.6 : ((i / 255 + 0.055) / 1.055) ** 2.4));
        const luma = (u8, px = WB >> 1, py = HB >> 1, rad = WB) => {
            const l = [];
            for (let y = Math.max(0, py - rad); y < Math.min(HB, py + rad + 1); y++)
                for (let x = Math.max(0, px - rad), k; x < Math.min(WB, px + rad + 1); x++)
                    l.push(
                        0.2126 * lin[u8[(k = 4 * (y * WB + x))]] + 0.7152 * lin[u8[k + 1]] + 0.0722 * lin[u8[k + 2]]
                    );
            return l.sort((a, b) => a - b)[l.length >> 1];
        };
        const [TSL, gruen] = [THREE.TSL, (M, k) => M[k + 1] > M[k] + 60 && M[k + 1] > M[k + 2] + 60];
        // DIE MASKE: der Stoff zeichnet `farbe(Albedo)` unbeleuchtet, `aus` unsichtbar
        const maske = async (stoff, farbe, aus) => {
            const alt = stoff.outputNode;
            [stoff.outputNode, stoff.needsUpdate] = [TSL.vec4(farbe(stoff.colorNode && stoff.colorNode.xyz), 1), true];
            try {
                return await schuss(aus, []);
            } finally {
                [stoff.outputNode, stoff.needsUpdate] = [alt, true];
            }
        };
        // trifft der Strahl des Pixels den gezeichneten Boden (`_bodenSichtAt`), solange er `bleibt(x, z)`?
        const trifft = (px, py, bleibt) => {
            const v = new THREE.Vector3(((px + 0.5) / WB) * 2 - 1, 1 - ((py + 0.5) / HB) * 2, 0.5)
                .unproject(cam)
                .sub(cam.position)
                .normalize();
            for (let t = 0, ueber = false; t < 16; t += 0.03) {
                const [x, y, z] = [cam.position.x + v.x * t, cam.position.y + v.y * t, cam.position.z + v.z * t];
                if (!bleibt(x, z)) return false;
                const g = r._bodenSichtAt(x, z);
                if (g == null) continue;
                if (ueber && y <= g) return true;
                ueber = y > g;
            }
            return false;
        };
        // die Natur der Nähe im Bild: die Sätze der Nah-Streu und die Senken der Nah-Wiese
        const natur = () =>
            [
                ...[...s.chunkSaetze].filter(([k]) => k.startsWith("streuSatz|")).map(([, v]) => v.mesh),
                ...[...s.nahWiese.senken.values()].map((x) => x.mesh),
            ].filter(Boolean);
        // EIN BLICK aus dem Ausgabe-Pfad (die Kamera steht; die Natur — Nah-Wiese und Nah-Streu — wirft keinen Schatten, wie
        // `werkbank bild --klasse`): das Bild ohne `aus`, dasselbe ohne die Büschel `weg(bu)` und die Meshes `ohne` (Halm: was
        // sich ändert), die Maske des Boden-Satzes ohne Natur und `aus` (grüne Albedo — die Halm-Schicht des Boden-Stoffs —
        // grün, sonst Magenta); je Pixel `je(k, G, O, Mk)`, das Bild als PNG
        const blick = async (weg, je, aus = [], ohne = []) => {
            cam.updateMatrixWorld(true);
            const wurf = natur().map((m) => [m, m.castShadow, (m.castShadow = false)]);
            const innen = [];
            for (const k of s.nahWiese.kacheln.values())
                for (const [j, bu] of (k.bueschel || []).entries()) if (weg(bu)) innen.push([k, j]);
            try {
                const G = await schuss(aus, []);
                const O = innen.length || ohne.length ? await schuss([...aus, ...ohne], innen) : G;
                const stoff = s.chunkSaetze.get("boden").mesh.material;
                const Mk = await maske(
                    stoff,
                    (alb) =>
                        TSL.select(
                            alb.y.sub(alb.x.add(alb.z).mul(0.5)).greaterThan(0.02),
                            TSL.vec3(0, 1, 0),
                            TSL.vec3(1, 0, 1)
                        ),
                    [...natur(), ...aus]
                );
                for (let k = 0; k < G.length; k += 4) je(k, G, O, Mk);
                return { innen: innen.length, png: window.__png(G, WB, HB) };
            } finally {
                for (const [m, c] of wurf) m.castShadow = c;
            }
        };
        // Halm-Pixel gegen das Bild ohne `weg`, Boden-Pixel (grün; `jeder`: jeder Grund) mit dem Strahl im Boden, solange `bleibt`
        const halmBoden = async (weg, bleibt, jeder) => {
            const z = { halm: 0, boden: 0 };
            const b = await blick(weg, (k, G, O, Mk) => {
                z.halm += anders(G, O, k);
                const grund = gruen(Mk, k) || (jeder && Mk[k] > Mk[k + 1] + 60 && Mk[k + 2] > Mk[k + 1] + 60);
                z.boden += grund && trifft((k / 4) % WB, Math.floor(k / 4 / WB), bleibt);
            });
            return Object.assign(z, b);
        };
        // DAS HAUS DES SPIELERS AUF DER WIESE (`--bild`): am Nadelwald-Hang des Dorfs wächst kaum ein Büschel — ein Haus mit
        // Anbau steht gesetzt auf dem ersten Ort um den Start, an dem die Nah-Wiese im 16-m-Kreis ≥ 60 Büschel baut
        const HS = [...H, ...SD.filter((e) => !H.includes(e))]; // ein Haus des Start-Dorfs, das nach dem Akt stand
        if (BILD) {
            const vor = H.find((v) => (gesetz(v).masse || []).some((m) => m.art === "anbau"));
            o.w9.suche = { typ: vor ? vor.type : null, orte: [] };
            const wiese = (x, z) => {
                const n = bueschelIn(x - 8, z - 8, x + 8, z + 8).length;
                o.w9.suche.orte.push([Math.round(x), Math.round(z), n]);
                return n >= 60;
            };
            sbE = await setze(vor, "s4-spieler", [...ring(start, [48, 96, 144, 300]), [-278, -1038]], wiese);
            if (sbE) {
                HS.push(sbE);
                const [x, z, n] = o.w9.suche.orte[o.w9.suche.orte.length - 1];
                o.w9.spieler = { typ: vor.type, x, z, wiese: n };
            }
        }
        // W9 SLOT (bauen.K2): ein Haus in der Gestalt eines Dorf-Hauses, gesetzt wie vom Spieler auf dem ersten Ort mit Gefälle
        // ≥ 15 % über ±4 m, trägt den Erdbau des Dorf-Slots derselben Gestalt — byte-gleich dem Plan v2 (fachwerk `ortPlan`) des
        // Slots aus dem Gedächtnis des Orts an seinem Ort und Boden; die Platte des Vorplatzes ist Boden (Dichte ±0,3 m)
        const vs = H.find((e) => e.tuer);
        const sw = (o.w9.slot = {});
        const gefaelle = (x, z) => (sw.hang = r._slopeAt(x, z, hh, 4)) >= 0.15; // die EINE Steilheit über ±4 m
        const se = vs && (await setze(vs, "w9-slot", ring(dorfMitte, [60, 90, 120, 160]), gefaelle, vs.rotationY));
        for (const v of se ? r._ortPlaene.values() : [])
            for (const d of v.slots)
                if (Math.hypot(v.ort.x + d.x - vs.position.x, v.ort.z + d.z - vs.position.z) < 0.05) {
                    const { x, y, z } = se.position;
                    const welt = s.worldMeta.erdbau[`haus:${Math.round(x * 100)},${Math.round(z * 100)}`] || [];
                    const soll = FC.ortPlan(
                        { slots: [{ ...d, y: y - 0.5 }] },
                        { x: x - d.x, z: z - d.z },
                        window.__gelaendeCore.ortCtx(r._gelaende())
                    );
                    const vp = welt.find((q) => q.vorplatz >= 0) || {};
                    const erde = (dy) => +(r._terrainDensityAt(vp.cx, vp.y + dy, vp.cz) > 0);
                    Object.assign(sw, {
                        typ: se.type,
                        arten: welt.map((q) => q.art + (q === vp ? "/vorplatz" : "")).join(" "),
                        byte: JSON.stringify(welt) === JSON.stringify(soll.erdbau),
                        boden: erde(-0.3) - erde(0.3),
                    });
                    HS.push(se);
                }
        for (const e of HS) {
            const { Hh, sc, base, kasten: boxen } = grundDes(e);
            const h = {
                typ: e.type,
                id: e.id,
                start: SD.includes(e),
                sc: rund(sc, 1000),
                koerper: [],
            };
            o.w9.haeuser.push(h);
            const solids = Hh.solids || [];
            // die Diele des Gesetzbuchs an (lx, lz) haus-lokal: die Oberkante der Solids bis 1,2 m; -Infinity, wo keiner trägt
            const diele = (lx, lz) => {
                let d = -Infinity;
                for (const so of solids)
                    if (so.min[0] <= lx && lx <= so.max[0] && so.min[2] <= lz && lz <= so.max[2] && so.max[1] < 1.2)
                        d = Math.max(d, so.max[1]);
                return d;
            };
            // trägt die Welt an (lx, ly, lz) haus-lokal Erde? 1 oder 0
            const erde = (lx, ly, lz, p = welt(e, lx * sc, lz * sc)) =>
                +(r._terrainDensityAt(p.x, base + ly * sc, p.z) > 0);
            const frei = (lx, ly, lz, m) =>
                !solids.some((so) => [lx, ly, lz].every((q, k) => so.min[k] - m < q && q < so.max[k] + m));
            // liegt (x, z) (Welt) in der Box, `rand` m vor ihrer Wand (negativ: darüber hinaus)?
            const inBox = (m, x, z, rand) => {
                const l = lokal(e, x, z);
                const [lx, lz] = [l.x / sc, l.z / sc];
                return lx > m.x0 + rand && lx < m.x1 - rand && lz > m.z0 + rand && lz < m.z1 - rand;
            };
            // der Spieler steht im Haupthaus, bis die Hülle der Stufe 0 und die Boden-Karten um das Haus
            // stehen, mit `--bild` dazu die Nah-Wiese
            const ecken = boxen.flatMap((m) => [
                welt(e, m.x0 * sc, m.z0 * sc),
                welt(e, m.x1 * sc, m.z1 * sc),
                welt(e, m.x0 * sc, m.z1 * sc),
                welt(e, m.x1 * sc, m.z0 * sc),
            ]);
            const [mx0, mx1] = [Math.min(...ecken.map((p) => p.x)), Math.max(...ecken.map((p) => p.x))];
            const [mz0, mz1] = [Math.min(...ecken.map((p) => p.z)), Math.max(...ecken.map((p) => p.z))];
            const kartenDa = () => r._bodenSichtChunks(mx0 - 1, mz0 - 1, mx1 + 1, mz1 + 1);
            const steht = () =>
                e._hausHuelle &&
                e._servedLod === 0 &&
                kartenDa() &&
                (!BILD || (s.nahWiese && s.nahWiese.offen === 0 && s.nahWiese.kacheln.size > 0));
            stell(e.position.x, e.position.y + 1, e.position.z);
            let ruhig = 0;
            await warteBis(() => (ruhig = steht() ? ruhig + 1 : 0) >= 3, 5, 120);
            [h.stufe, h.steht] = [e._servedLod, !!steht()];
            const bueschel = bueschelIn(mx0 - 2, mz0 - 2, mx1 + 2, mz1 + 2);
            h.ring = bueschel.length;
            // DIE WEITE DER VORLAGE: die weiteste Halm-Spitze der gezeichneten Büschel je Skala 1 — ein Büschel, dessen Kreis
            // eine Box berührt, steckt seine Halme in sie, auch durch die Wand
            for (const V of s.nahWiese.vorlagen.values())
                for (const a of V.senken)
                    for (let i = 0, P = a.geo.attributes.position, v = new THREE.Vector3(); i < P.count; i++) {
                        v.fromBufferAttribute(P, i).applyMatrix4(a.lokal);
                        o.w9.weite = Math.max(o.w9.weite || 0, Math.hypot(v.x, v.z));
                    }
            const W = o.w9.weite || 0;
            for (const m of boxen) {
                const b = { art: m.art, bueschel: 0, dichte: 0, proben: 0, halm: 0, boden: 0, blicke: 0, png: [] };
                h.koerper.push(b);
                for (const q of bueschel) if (inBox(m, q.x, q.z, (-W * q.s) / sc)) b.bueschel++;
                for (let lx = m.x0 + 0.2; lx <= m.x1 - 0.2; lx += 0.25)
                    for (let lz = m.z0 + 0.2; lz <= m.z1 - 0.2; lz += 0.25) {
                        const d = diele(lx, lz);
                        if (Number.isFinite(d))
                            [b.proben, b.dichte] = [b.proben + 1, b.dichte + erde(lx, d + 0.05, lz)];
                    }
                if (!BILD) continue;
                // zwei Blicke je Box über die Diagonalen, sonst aus der Mitte auf die Ecken; das Auge 1,3 m über der Diele, frei
                const i = 0.45;
                const E4 = [
                    [m.x0 + i, m.z0 + i],
                    [m.x1 - i, m.z1 - i],
                    [m.x1 - i, m.z0 + i],
                    [m.x0 + i, m.z1 - i],
                ];
                const M0 = [(m.x0 + m.x1) / 2, (m.z0 + m.z1) / 2];
                const paare = [
                    [E4[0], E4[1]],
                    [E4[1], E4[0]],
                    [E4[2], E4[3]],
                    [E4[3], E4[2]],
                    ...E4.map((q) => [M0, q]),
                ];
                const dm = Number.isFinite(diele(...M0)) ? diele(...M0) : 0.5;
                for (const [[ax, az], [zx, zz]] of paare) {
                    if (b.blicke >= 2) break;
                    const da = Number.isFinite(diele(ax, az)) ? diele(ax, az) : dm;
                    const dz = Number.isFinite(diele(zx, zz)) ? diele(zx, zz) : dm;
                    const ay = da + 1.3;
                    if (!frei(ax, ay, az, 0.25)) continue;
                    const strahl = Array.from({ length: 19 }, (_, j) => (j + 1) * 0.05).map((t) => [
                        ax + (zx - ax) * t,
                        ay + (dz - ay) * t,
                        az + (zz - az) * t,
                    ]);
                    if (!strahl.every((q) => Math.hypot(q[0] - zx, q[1] - dz, q[2] - zz) < 0.3 || frei(...q, 0.02)))
                        continue;
                    b.blicke++;
                    const [p, q] = [welt(e, ax * sc, az * sc), welt(e, zx * sc, zz * sc)];
                    cam.position.set(p.x, base + ay * sc, p.z);
                    cam.lookAt(q.x, base + dz * sc, q.z);
                    // W10: der Innen-Blick ohne Wegnahme — dieselbe Bedingung wie der Außen-Schatten (`schuss([], [])`)
                    cam.updateMatrixWorld(true);
                    h.innen = Math.min(h.innen ?? 1, luma(await schuss([], [])));
                    // ist der Grund der Boden der Box (der Turm), zählt nur der Halm
                    const z9 = await halmBoden(
                        (bu) => inBox(m, bu.x, bu.z, (-W * bu.s) / sc),
                        (x, z) => inBox(m, x, z, 0.1),
                        m.traegt
                    );
                    [b.halm, b.boden, b.innen] = [
                        b.halm + z9.halm,
                        b.boden + z9.boden,
                        Math.max(b.innen || 0, z9.innen),
                    ];
                    b.png.push(z9.png);
                }
            }
            // W10 DAS INNEN-BILD (siedlung.K1 Staffel 2, Schatten K4; `--bild`): der dunkelste Innen-Blick (`innen`) gegen den
            // Boden im Schatten zur selben Stunde (`aussen`, 13 × 13 px): von DIESEM Haus gegen die Sonne der erste Boden 1 m
            // vor jedem Bau (Wege zählen), dessen Strahl zur Sonne einen Werfer trifft, das Auge 1,6 m hoch 3 m davor; ohne
            // Fleck bleibt `quote` leer
            if (BILD && h.start) {
                const S = s.directionalLight.position.clone().sub(s.directionalLight.target.position).normalize();
                const d = new THREE.Vector3(-S.x, 0, -S.z).normalize();
                const rc = new THREE.Raycaster();
                rc.layers.set(A.SHADOW_TWIN_LAYER);
                let f = null;
                for (let t = 1; t < 40 && !f; t += 0.25) {
                    const q = new THREE.Vector3(e.position.x + d.x * t, 0, e.position.z + d.z * t);
                    if (/haus|bau/.test(r._imGrundriss(q.x, q.z, 1))) continue;
                    q.y = r._bodenSichtAt(q.x, q.z) ?? hh(q.x, q.z);
                    rc.set(q.clone().setY(q.y + 0.05), S);
                    if (rc.intersectObject(s.scene, true).length) f = q;
                }
                if (f) {
                    const p = f.clone().addScaledVector(d, 3);
                    cam.position.set(p.x, hh(p.x, p.z) + 1.6, p.z);
                    cam.lookAt(f);
                    cam.updateMatrixWorld(true);
                    const G = await schuss([], []);
                    const v = f.clone().project(cam);
                    h.aussen = luma(G, Math.round(((v.x + 1) / 2) * WB), Math.round(((1 - v.y) / 2) * HB), 6);
                    h.png = window.__png(G, WB, HB);
                }
                h.quote = rund(h.innen / h.aussen, 1000);
            }
            if (!BILD) continue;
            // THIRD VOR DEM HAUS: die Kamera 5 m vor der Front, 2,6 m über dem Grund, auf die Mitte des Hauses — die Büschel jeder
            // Box gegen das Bild ohne sie; DIE GEGENPROBE: vor der Tür des Hauses des Spielers ändern die Büschel das Bild (alle
            // fort), sonst ist der Blick blind
            const [zv, zh] = [Math.min(...boxen.map((m) => m.z0)), Math.max(...boxen.map((m) => m.z1))];
            const vor = (dz, dy, zz, yz) => {
                const [p, q] = [welt(e, 0, dz * sc), welt(e, 0, zz * sc)];
                cam.position.set(p.x, hh(p.x, p.z) + dy, p.z);
                cam.lookAt(q.x, yz(q), q.z);
            };
            vor(zv - 5, 2.6, (zv + zh) / 2, () => base + sc);
            h.third = await halmBoden(
                (bu) => boxen.some((m) => inBox(m, bu.x, bu.z, (-W * bu.s) / sc)),
                () => false
            );
            if (e !== sbE) continue;
            vor(zv - 3, 1.6, zv - 9, (q) => hh(q.x, q.z));
            h.gegenprobe = (
                await halmBoden(
                    () => true,
                    () => false
                )
            ).halm;
        }
        // DAS WASSER (`--bild`): 10 m vor dem Ufer des Sees und im Fluss der Mess-Wiese (`__wasserOrte`) je Ego (1,6 m über dem
        // Ufer, 1,5 m landein) und Third (4,5 m dahinter, 2,6 m hoch) auf den EINEN Spiegel (`_koerperWasser`): wo das Wasser
        // vorn liegt (die Maske des Wasser-Stoffs), ändert die Natur das Bild ohne Wasser-Klasse nie (Halm-Pixel) und trägt der
        // Grund keine Halm-Schicht (Boden-Pixel); am Gesetz steht keine Pflanze im gezeichneten Wasser (`__wasserFlora`, das
        // Schilf nach seinem Ufer-Band). Die Gegenprobe: vor dem Spiegel (am Ufer) ändert die Natur das Bild.
        const orte = BILD ? await window.__wasserOrte({}) : {};
        o.w9.wasser = [];
        for (const [ort, q] of [
            ["see", orte.see && { x: orte.see.ufer[0] - 10, z: orte.see.ufer[1] }],
            ["fluss", orte.fluss],
        ]) {
            // das Ufer: der nächste Punkt mit Land (20 cm über dem Spiegel) auf acht Strahlen
            let [d, n] = [0, null];
            while (q && !n && (d += 0.5) < 40)
                n = [0, 1, 2, 3, 4, 5, 6, 7]
                    .map((a) => ({ x: Math.cos((a * Math.PI) / 4), z: Math.sin((a * Math.PI) / 4) }))
                    .find((v) => r._landAt(q.x + v.x * d, q.z + v.z * d, 0.2));
            if (!n) continue;
            const L = { x: q.x + n.x * (d + 1.5), z: q.z + n.z * (d + 1.5) };
            stell(L.x, hh(L.x, L.z) + 1, L.z);
            const da = () =>
                r._bodenSichtChunks(q.x - 20, q.z - 20, q.x + 20, q.z + 20) && !s.nahWiese.offen && !s.nahStreu.offen;
            let ruhig = 0;
            await warteBis(() => (ruhig = da() ? ruhig + 1 : 0) >= 3, 5, 200);
            const fl = window.__wasserFlora({ fenster: [q.x - 30, q.z - 30, q.x + 30, q.z + 30] });
            const w = {
                ort,
                x: Math.round(q.x),
                z: Math.round(q.z),
                wiese: fl.wiese.imWasser,
                streu: fl.streu.imWasser,
                blicke: [],
            };
            for (const [sicht, zurueck, hoch] of [
                ["ego", 0, 1.6],
                ["third", 4.5, 2.6],
            ]) {
                const [ex, ez] = [L.x + n.x * zurueck, L.z + n.z * zurueck];
                cam.position.set(ex, hh(ex, ez) + hoch, ez);
                cam.lookAt(q.x, r._koerperWasser(q.x, q.z, -Infinity), q.z);
                const [z, wasser] = [{ sicht, spiegel: 0, halm: 0, boden: 0, gegen: 0 }, []];
                const Wm = await maske(s.hydroSurfaceMaterial, () => TSL.vec3(0, 0, 1), []);
                s.scene.traverse((m) => m.isMesh && m.material === s.hydroSurfaceMaterial && wasser.push(m));
                const je = (k, G, O, Mk) => {
                    const [unter, a] = [Wm[k + 2] > 200 && Wm[k] < 60 && Wm[k + 1] < 60, anders(G, O, k)];
                    [z.spiegel, z.halm, z.gegen] = [z.spiegel + unter, z.halm + (unter && a), z.gegen + (!unter && a)];
                    z.boden += unter && gruen(Mk, k);
                };
                w.blicke.push(Object.assign(z, await blick(() => false, je, wasser, natur())));
            }
            o.w9.wasser.push(w);
        }
        if (BILD) r._tickNahWiese = tick;
    }
    // W7 BAU IM BAU: Grundriss (Raster 5 × 5) und Tür-Vorplatz (1,2 m vor der Front, 3 × 2) jedes Dorf-Hauses gegen die
    // Boxen jedes Baus, der vor dem Dorf stand und nicht weicht (Natur und Würfe des Felds weichen, `_weichtDemBau`; das Haus
    // räumt sie) — eine Box zählt über dem Boden des Hauses (+ Stufe)
    if (P.has("haus")) {
        const STEP = A.PLAYER_STEP_UP;
        const w7 = { haeuser: H.length, imBau: 0, taeter: [] };
        // je Bau aus `vor` (nah, er weicht nicht) die Punkte des Hauses `e` in seinen Boxen: Mitte, Grundriss 5 × 5 (der EINE
        // Grundriss-Leser `_grundrissVon`), mit `tuer` der Vorplatz
        const imBau = (e, vor, tuer) => {
            const [f, tu, boden] = [e.fundament && r._grundrissVon(e), e.tuer, e.position.y - 0.5];
            const pkt = [{ x: e.position.x, z: e.position.z }, ...(f ? raster5(e, f) : [])];
            if (tuer && tu && Number.isFinite(tu.w))
                for (let i = 0; i <= 2; i++)
                    for (const dz of [0.3, 1.1]) pkt.push(welt(e, tu.x + (tu.w / 2 - 0.05) * (i - 1), tu.z - dz));
            const nah = (b) =>
                Math.hypot(b.position.x - e.position.x, b.position.z - e.position.z) <= 40 + (b._blockerReach || 0);
            return [...vor]
                .filter((b) => b !== e && b.blockerAABBs && b.position && nah(b) && !r._weichtDemBau(b))
                .map((b) => [
                    b,
                    pkt.filter((q) =>
                        b.blockerAABBs.some((bx) => bx.topY > boden + STEP && r._boxAbstand2(bx, q.x, q.z) === 0)
                    ).length,
                ])
                .filter(([, n]) => n);
        };
        for (const e of H)
            for (const [b, n] of imBau(e, vorBau, true))
                if (w7.imBau++ < 4)
                    w7.taeter.push(
                        `${e.type}@${Math.round((((e.rotationY || 0) * 180) / Math.PI) % 360)}°in ${b.type} (${n} Punkte)`
                    );
        // das zweite Dorf: derselbe Akt am Anker des ersten (worldMeta.settlementCells „d:7@x,z")
        const zelle = Object.entries((s.worldMeta && s.worldMeta.settlementCells) || {}).find(([k]) =>
            k.startsWith("d:7@")
        );
        if (zelle) {
            const vorBau2 = new Set(s.architectures);
            await r.spawnSettlement({ seed: 7, nH: 18, position: { x: zelle[1].x, y: start.y, z: zelle[1].z } });
            await pumpe(8);
            const neu = s.architectures.filter(
                (e) => !vorBau2.has(e) && /^(haus_|brunnen_|marktstand_)/.test(e.type || "")
            );
            [w7.zweitesDorf, w7.zweitesImBau] = [neu.length, 0];
            for (const e of neu) {
                const [b] = imBau(e, vorBau2);
                if (b && w7.zweitesImBau++ < 4 && w7.taeter.length < 4)
                    w7.taeter.push(`zweites Dorf: ${e.type} in ${b[0].type}`);
            }
        }
        o.w7 = w7;
    }
    // W4 GRUNDRISS: keine Natur im Grundriss — nach dem Pumpen der Natur-Schlange. Was Natur ist und was dem Bau weicht,
    // fragt die Linse den Stamm (`_istNatur`, `_weichtDemBau`: die Natur und jeder Wurf des Felds, die Feuerstelle des
    // Menschen ist Bau).
    const imGrundrissVon = (liste, x, z) => {
        for (const hs of liste) {
            const lx = lokal(hs, x, z);
            const f = r._grundrissVon(hs);
            if (Math.abs(lx.x - f.ox) <= f.ex && Math.abs(lx.z - f.oz) <= f.ez) return hs;
        }
        return null;
    };
    const naturImHaus = (liste) => {
        let imHaus = 0;
        let natur = 0;
        const taeter = [];
        for (const e of s.architectures) {
            if (!r._weichtDemBau(e)) continue;
            natur++;
            const hs = imGrundrissVon(liste, e.position.x, e.position.z);
            if (hs) {
                imHaus++;
                if (taeter.length < 6) taeter.push(e.type + "@" + hs.type);
            }
        }
        return { natur, imHaus, taeter };
    };
    // die lebende Streu (Instanz-Slots oder Gesetz-Platz) im Grundriss — je Schicht
    const streuImHaus = (liste) => {
        const je = {};
        let n = 0;
        let zellen = 0;
        for (const c of streuZellen().filter(lebt)) {
            zellen++;
            if (!imGrundrissVon(liste, c.x, c.z)) continue;
            n++;
            je[c.layer] = (je[c.layer] || 0) + 1;
        }
        return { zellen, imHaus: n, je };
    };
    // W8 DIE LICHTUNG (Kopf): auf der Plattform, bis Chunk, Wald-Schlange und Nah-Streu ruhen, 120 m daneben, bis die
    // Regionen über ihr neu bauen (innerhalb 64 m baut keine Streu), wieder auf ihr, bis der Promotions-Ring promotet ist.
    // der Hain der KI: je Ort `spawn_tree` (4 Bäume im 2,5-m-Kreis) und `spawn_studio` (eine Eiche genau am Ort); `bleibt`
    // lässt ihn stehen (sonst fällt er nach der Zählung)
    const hain = (x, z, bleibt, quelle = "test") => {
        const y = (hh(x, z) || 0) + 0.5;
        const vor = new Set(s.architectures);
        const fehler = [];
        const weicht = { haus: 0, lichtung: 0, bau: 0 };
        for (const prog of [
            ["spawn_tree", ["at", x, y, z], 4],
            ["spawn_studio", "eiche", ["at", x, y, z], 1],
        ]) {
            try {
                const res = r.dslRun(prog, { source: quelle });
                for (const e of res.log || [])
                    if (e.event === "ergebnis")
                        for (const k of ["haus", "lichtung", "bau"]) weicht[k] += (e.gruende && e.gruende[k]) || 0;
            } catch (e) {
                fehler.push(String(e).slice(0, 80));
            }
        }
        const neu = s.architectures.filter((e) => !vor.has(e) && r._istNatur(e));
        if (!bleibt) for (const e of neu) r.removeArchitecture(e);
        return { neu, fehler, weicht };
    };
    // W8 SOHLE: die Scheibe LIEGT auf dem Grund — ihre Sohle (die tiefste Blocker-Box der Plattform) höchstens 0,3 m über
    // dem Boden des Gesetzes an jeder von 49 Proben unter ihr (Mitte, zwei Ringe r/2 und r zu je 24)
    if (P.has("sohle")) {
        const plat = s.architectures.find((a) => a && a.type === "start_plattform");
        const pbp = s.blueprints && s.blueprints.start_plattform;
        const p0 = pbp && Array.isArray(pbp.parts) && pbp.parts[0] && pbp.parts[0].size;
        const platR = p0 && Number.isFinite(p0.x) ? p0.x / 2 : NaN;
        const boxen = (plat && plat.blockerAABBs) || [];
        if (!plat || !(platR > 0) || !boxen.length) o.sohle = { fehler: "keine Genesis-Plattform mit Boxen" };
        else {
            const sohle = Math.min(...boxen.map((b) => b.botY));
            let luft = -Infinity;
            for (const f of [0, 0.5, 1])
                for (let k = 0; k < (f ? 24 : 1); k++) {
                    const a = (k / 24) * Math.PI * 2;
                    const g = r._voxelSurfaceY(
                        plat.position.x + Math.cos(a) * platR * f,
                        plat.position.z + Math.sin(a) * platR * f
                    );
                    luft = Math.max(luft, sohle - g);
                }
            o.sohle = { luft: Number.isFinite(luft) ? rund(luft) : null };
            // DAS WERK AUF DER SCHEIBE: der Satz des Menschen setzt eine Feuerstelle 2 m neben der Mitte — sie steht AUF der
            // Scheibe (ihre Basis an der Oberkante), nie in ihrem Stein (`_bauDachUnter`)
            const wx = plat.position.x + 2;
            const wz = plat.position.z;
            const dach = Math.max(
                ...boxen.filter((q) => wx >= q.minX && wx <= q.maxX && wz >= q.minZ && wz <= q.maxZ).map((q) => q.topY)
            );
            const vor = new Set(s.architectures);
            r.dslRun(["spawn_studio", "feuerstelle", ["at", wx, dach + 0.5, wz], 1], { source: "test" });
            const werk = s.architectures.find((e) => !vor.has(e) && e.position);
            o.sohle.werkTief = werk ? rund(dach - (werk.position.y - 0.5)) : null;
            if (werk) r.removeArchitecture(werk);
        }
    }
    if (P.has("lichtung")) {
        const w8 = {};
        o.w8 = w8;
        const plat = s.architectures.find((a) => a && a.type === "start_plattform");
        const pbp = s.blueprints && s.blueprints.start_plattform;
        const p0 = pbp && Array.isArray(pbp.parts) && pbp.parts[0] && pbp.parts[0].size;
        const platR = p0 && Number.isFinite(p0.x) ? p0.x / 2 : NaN; // die Stein-Scheibe (cylinder: size.x = Durchmesser)
        if (!plat || !(platR > 0)) w8.fehler = "keine Genesis-Plattform";
        else {
            const L = { x: plat.position.x, z: plat.position.z, r: platR };
            w8.plattform = [rund(L.x, 10), rund(L.z, 10), platR];
            // die Reichweite eines Wurfs über die Scheibe: ein Baum mit seiner Krone (der EINE Leser), alles andere mit seinem Ort
            const krone = (art, groesse) => r._naturKrone(art, { scale: groesse });
            const abstand = (x, z) => Math.hypot(x - L.x, z - L.z);
            stell(L.x, plat.position.y + 2.2, L.z);
            w8.ruhe = await ruheAn(L.x, L.z);
            // DER RING: der Ort-Takt baut ihn am Genesis-Ort (headless ruht der Takt, die Probe ruft die Stamm-Methode);
            // die Lichtung der Probe ist ab hier der Platz — der gemessene Kreis der Tore + 4 m
            r._genesisPortalRing(pm.position);
            // die Tore räumen, die Nah-Streu wächst durch die Wand nach: ruhen lassen wie zuvor
            await ruheAn(null, null, 20);
            const tore = s.architectures.filter(
                (a) => a && /^welt_/.test(a.type) && Math.hypot(a.position.x - L.x, a.position.z - L.z) < 30
            );
            w8.tore = tore.length;
            if (tore.length) {
                const ringR =
                    tore.reduce((q, a) => q + Math.hypot(a.position.x - L.x, a.position.z - L.z), 0) / tore.length;
                L.r = Math.max(platR, ringR + 4);
            }
            w8.plattform[2] = rund(L.r, 10);
            // die Kachel-Pflanzen um die Kamera auf der Plattform (die Nah-Streu reicht 24 m)
            w8.pflanzen = 0;
            w8.aufScheibe = 0;
            for (const kk of (s.nahStreu && s.nahStreu.kacheln.values()) || [])
                for (const it of kk.items || []) {
                    const d = abstand(it.x, it.z);
                    if (d < 30) w8.pflanzen++;
                    if (d < L.r) w8.aufScheibe++;
                }
            // DIE STREU der Lichtung: innerhalb 64 m um den Spieler baut keine Region Streu (`SCATTER.innerM`) — der Spieler
            // steht 120 m daneben, die Regionen über der Plattform bauen neu (durch die Wand). Der Aufbau zählt die lebenden
            // Zellen dieser neu gebauten Regionen (die Menge, über die die Wand urteilt); der 40-m-Kreis steht als Zahl daneben.
            let keysW8 = null;
            {
                const fx =
                    ring(L, [120], 16).find(([qx, qz]) => r._landAt(qx, qz, 0.5) && Number.isFinite(hh(qx, qz))) ||
                    null;
                if (fx) {
                    stell(fx[0], hh(fx[0], fx[1]) + 3, fx[1]);
                    await pumpe(20);
                    const keys = regionenUm(L.x, L.z);
                    for (const k of keys) r._disposeScatterRegion(k);
                    keysW8 = keys;
                    const steht = () => [...keys].every((q) => !r._streuRegionWartet(q));
                    await warteBis(steht, 2, 1500);
                    await pumpe(10);
                    w8.streuSteht = steht();
                }
                w8.zellen = 0;
                w8.zellenNeu = 0;
                w8.zellenUeber = 0;
                w8.je = {};
                for (const [rk, region] of (s.scatterRegions && s.scatterRegions.entries()) || [])
                    for (const c of region.cells || []) {
                        if (!lebt(c)) continue;
                        const d = abstand(c.x, c.z);
                        if (d < 40) w8.zellen++;
                        if (keysW8 && keysW8.has(rk)) w8.zellenNeu++;
                        if (d < L.r + (c.promotable ? krone(c.species, c.scale) : 0)) {
                            w8.zellenUeber++;
                            w8.je[c.layer] = (w8.je[c.layer] || 0) + 1;
                        }
                    }
                stell(L.x, plat.position.y + 2.2, L.z);
                await pumpe(20);
            }
            // der Promotions-Ring um die Plattform (wie W4b: die Promotion lebt ohne warme Foundry)
            {
                const PR = A.SCATTER.promoteM;
                const rest = () => {
                    let n = 0;
                    for (const c of streuZellen())
                        if (
                            c.promotable &&
                            c.promotedId == null &&
                            c.slots &&
                            (c.x - L.x) ** 2 + (c.z - L.z) ** 2 <= PR * PR &&
                            !r._scatterIsCellPromoted(c.x, c.z, c.layer || "tree")
                        )
                            n++;
                    return n;
                };
                window.__anazhGateNoFoundry = true;
                try {
                    await warteBis(() => rest() <= 0, 4, 1500);
                } finally {
                    window.__anazhGateNoFoundry = false;
                }
                w8.promoRest = rest();
                await pumpe(10);
            }
            w8.baeume = 0;
            w8.naturUeber = 0;
            w8.taeter = [];
            for (const e of s.architectures) {
                if (!r._istNatur(e) || !e.position) continue;
                const d = abstand(e.position.x, e.position.z);
                if (d < 60 && /^baum_/.test(e._lodSpecies || e.type)) w8.baeume++;
                const k = krone(e._lodSpecies || e.type, e.scale);
                if (d < L.r + k) {
                    w8.naturUeber++;
                    if (w8.taeter.length < 6) w8.taeter.push(`${e.type} ${d.toFixed(1)} m (Krone ${k.toFixed(1)} m)`);
                }
            }
            const kiP = hain(L.x, L.z);
            w8.kiPlattform = kiP.neu.filter(
                (e) => abstand(e.position.x, e.position.z) < L.r + krone(e._lodSpecies || e.type, e.scale)
            ).length;
            w8.kiFehler = kiP.fehler;
            w8.kiWeichtPlattform = kiP.weicht.lichtung; // 5 Würfe, jeder benannt
            // DER SATZ: der Spieler auf der Plattform sagt „pflanz mir eine eiche" (vor ihm, in der Lichtung) — der Chat nennt
            // die Lichtung, nie „gewachsen" bei 0 Bäumen
            {
                const el = document.getElementById("chat-output");
                const t0 = el ? el.innerText.length : 0;
                const vorC = new Set(s.architectures);
                stell(L.x, plat.position.y + 2.2, L.z);
                try {
                    await r.processChatCommand("pflanz mir eine eiche");
                } catch (e) {
                    w8.kiFehler.push(String(e).slice(0, 80));
                }
                const neuC = s.architectures.filter((e) => !vorC.has(e) && r._istNatur(e));
                w8.chatBaeume = neuC.filter(
                    (e) => abstand(e.position.x, e.position.z) < L.r + krone(e._lodSpecies || e.type, e.scale)
                ).length;
                w8.chatGewachsen = neuC.length;
                for (const e of neuC) r.removeArchitecture(e);
                w8.chatSatz = el ? el.innerText.slice(t0).replace(/\s+/g, " ").trim().slice(0, 240) : null;
            }
            const h0 = H[0];
            if (h0) {
                const mitte = welt(h0, r._grundrissVon(h0).ox, r._grundrissVon(h0).oz);
                const kiH = hain(mitte.x, mitte.z);
                w8.kiHaus = kiH.neu.filter((e) => imGrundrissVon([h0], e.position.x, e.position.z)).length;
                w8.kiWeichtHaus = kiH.weicht.haus;
                w8.kiHausTyp = h0.type;
            }
            // die Gegenprobe: ein trockener Ort 150 m von der Plattform, 60 m von jedem Haus
            const g8 = ort150(L);
            w8.gegenprobe = g8 ? hain(...g8).neu.length : null;
        }
    }
    // W8 BAU — DER GRUNDRISS JEDES BAUS: an einem trockenen Ort 150 m von der Plattform (60 m von jedem Haus) wächst der
    // Hain und bleibt, dann entsteht dort ein Damm (ein Bau ohne Haus-Zeile — seine Hülle sind Blocker-Boxen): kein Baum
    // bleibt in seinen Boxen (die Räumung der Wurzel), der zweite Hain mitten im Damm wächst nicht in sie und nennt den Bau
    if (P.has("bau")) {
        const wb = {};
        o.bau = wb;
        const plat = s.architectures.find((a) => a && a.type === "start_plattform");
        const M0 = plat ? plat.position : start;
        const ort = ort150(M0, true);
        const inBau = (bau, x, z) =>
            (bau.blockerAABBs || []).some((b) => {
                const ob = b.obb;
                if (!ob) return x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ;
                const dx = x - ob.cx;
                const dz = z - ob.cz;
                return Math.abs(dx * ob.c - dz * ob.s) <= ob.hx && Math.abs(dx * ob.s + dz * ob.c) <= ob.hz;
            });
        if (!ort) wb.fehler = "kein trockener Ort 150 m von der Plattform";
        else {
            const [gx, gz] = ort;
            const vorher = hain(gx, gz, true, "nexus").neu; // der Hain des Felds
            const damm = r.spawnArchitecture(
                "damm",
                { x: gx, y: (hh(gx, gz) || 0) + 0.5, z: gz },
                { silent: true, precise: true }
            );
            if (!damm || !damm.blockerAABBs) wb.fehler = "der Damm entstand nicht";
            else {
                wb.vorher = vorher.filter((e) => inBau(damm, e.position.x, e.position.z)).length;
                wb.rest = vorher.filter(
                    (e) => s.architectures.includes(e) && inBau(damm, e.position.x, e.position.z)
                ).length;
                const kiB = hain(gx, gz);
                wb.ki = kiB.neu.filter((e) => inBau(damm, e.position.x, e.position.z)).length;
                wb.kiWeicht = kiB.weicht.bau;
                r.removeArchitecture(damm);
            }
            for (const e of vorher) if (s.architectures.includes(e)) r.removeArchitecture(e);
        }
    }
    if (P.has("w4")) {
        stell(dorfMitte.x, (hh(dorfMitte.x, dorfMitte.z) || start.y) + 3, dorfMitte.z);
        await pumpe(200);
        // DER WURF IN DEN GRUNDRISS: je Haus ein Wurf jeder Art des Felds in seine Mitte, durch die EINE Natur-Wand
        // (`_naturSetzen`) — keiner steht
        const wurf = [];
        for (const hs of H) {
            const f = r._grundrissVon(hs);
            const m = welt(hs, f.ox, f.oz);
            for (const t of A.FELD_WURF) {
                const e = r._naturSetzen(
                    t,
                    { x: m.x, y: (hh(m.x, m.z) || 0) + 0.5, z: m.z },
                    {
                        silent: true,
                        seed: 4711,
                    }
                );
                if (e) wurf.push(e);
            }
        }
        o.w4 = naturImHaus(H);
        o.w4.wurf = H.length * A.FELD_WURF.length;
        for (const e of wurf) if (s.architectures.includes(e)) r.removeArchitecture(e);
        // W4 WEG: keine Natur (Eintrag, lebende Streu-Zelle, Kachel-Pflanze) auf Straße, Feldweg, Platz, Anger oder Acker
        // des Drehbuch-Dorfs — die Formen der Wege-Karte, ihr Abstand hier eigens gerechnet (Kapsel um das Segment, gedrehter
        // Kasten); auf dem Gras-Anger gilt seine Grenze (`sperr`, das Gesetzbuch: kein Baum tiefer als 1 m im Anger)
        {
            const formen = [];
            for (const b of (s.wegeKarte && s.wegeKarte.siedlungen) || []) for (const f of b.formen) formen.push(f);
            const abstand = (f, px, pz) => {
                if (f.typ === "kasten") {
                    const co = Math.cos(f.phi || 0);
                    const si = Math.sin(f.phi || 0);
                    const lx = Math.abs(co * (px - f.ax) - si * (pz - f.az)) - f.ex;
                    const lz = Math.abs(si * (px - f.ax) + co * (pz - f.az)) - f.ez;
                    return Math.hypot(Math.max(lx, 0), Math.max(lz, 0)) + Math.min(Math.max(lx, lz), 0);
                }
                const dx = f.bx - f.ax;
                const dz = f.bz - f.az;
                const ll = dx * dx + dz * dz;
                const h = ll > 1e-6 ? Math.min(1, Math.max(0, ((px - f.ax) * dx + (pz - f.az) * dz) / ll)) : 0;
                return Math.hypot(px - (f.ax + dx * h), pz - (f.az + dz * h)) - f.halb;
            };
            const w = { formen: formen.length, natur: 0, aufWeg: 0, taeter: [] };
            const pruef = (art, x, z, quelle) => {
                w.natur++;
                for (const f of formen)
                    if (abstand(f, x, z) < (f.sperr !== undefined ? f.sperr : 0)) {
                        w.aufWeg++;
                        if (w.taeter.length < 6)
                            w.taeter.push(
                                `${art} (${quelle}) auf ${f.typ === "segment" ? "Weg" : f.kanal === 1 ? "Acker" : "Platz"}`
                            );
                        return;
                    }
            };
            for (const e of s.architectures)
                if (e.position && r._istNatur(e)) pruef(e.type, e.position.x, e.position.z, "Eintrag");
            for (const c of streuZellen()) if (lebt(c)) pruef(c.species || c.layer, c.x, c.z, "Streu");
            for (const kk of (s.nahStreu && s.nahStreu.kacheln.values()) || [])
                for (const it of kk.items || []) pruef("Kachel-Pflanze", it.x, it.z, "Nah-Streu");
            o.w4weg = w;
        }
    }
    // das ferne Dorf (W4b) steht 300 m vom Start — W6 meidet seinen Ort auch, wenn W4b nicht läuft. Die Richtung kommt aus der
    // Regel der Welt: jede Streu-Region unter ihm (±40 m) liegt in der Reichweite des Spielers am Start
    // (`_streuRegionInReichweite`), der Ort ist Land.
    let fx = start.x + 300;
    let fz = start.z;
    const fernKandidaten = [];
    {
        const RMf = A.SCATTER.regionM;
        const p0 = { x: start.x, z: start.z };
        for (const [x, z] of ring(start, [300], 16)) {
            let ok = r._landAt(x, z, 0.5);
            for (const dx of [-40, 0, 40])
                for (const dz of [-40, 0, 40])
                    if (ok && !r._streuRegionInReichweite(Math.floor((x + dx) / RMf), Math.floor((z + dz) / RMf), p0))
                        ok = false;
            if (ok) fernKandidaten.push({ x, z });
        }
        if (fernKandidaten.length) {
            fx = fernKandidaten[0].x;
            fz = fernKandidaten[0].z;
        }
        o.fernOrt = { x: Math.round(fx), z: Math.round(fz) };
    }
    if (P.has("w4b")) {
        // W4b (Kopf): 300 m vom Spieler (das Auto-Dorf ab 260 m, `AUTO_SETTLEMENT.nearM`), die Streu steht schon; dann
        // läuft der Spieler hin, der Promotions-Ring (64 m) macht aus Streu-Bäumen echte Bäume
        stell(start.x, start.y + 3, start.z);
        await pumpe(60);
        // die Streu steht vor dem Dorf (wie im Spiel): jede Region unter dem Dorf-Ort gebaut, ohne Foundry-Aufschub
        // (`_streuRegionWartet`)
        const steht = (q) => [...q].every((k) => !r._streuRegionWartet(k));
        // der Ort des fernen Dorfs: der dichteste 40-m-Kreis der Zellen 200–360 m vom Start, auf Land, jede Region unter ihm
        // in Reichweite (`_streuWartet`) — die Probe braucht Zellen unter den Häusern
        const p0 = { x: start.x, z: start.z };
        await warteBis(() => !(r._streuWartet(p0) > 0), 4, 1500);
        const voll = [];
        for (const c of streuZellen()) if (lebt(c)) voll.push(c);
        let best = null;
        for (const c of voll) {
            const d = Math.hypot(c.x - start.x, c.z - start.z);
            if (d < 200 || d > 360 || !r._landAt(c.x, c.z, 0.5)) continue;
            if (![...regionenUm(c.x, c.z)].every((q) => r._streuRegionInReichweite(...q.split(",").map(Number), p0)))
                continue;
            let n = 0;
            for (const q of voll) if (Math.hypot(q.x - c.x, q.z - c.z) < 40) n++;
            if (!best || n > best.n) best = { x: c.x, z: c.z, n };
        }
        if (best) {
            fx = best.x;
            fz = best.z;
            o.fernOrt = { x: Math.round(fx), z: Math.round(fz), zellen: best.n };
        }
        const dorfRegionen = regionenUm(fx, fz);
        const streuSteht = () => steht(dorfRegionen);
        await warteBis(streuSteht, 4, 1500);
        let vorZellen = 0;
        for (const c of streuZellen()) if (lebt(c) && Math.hypot(c.x - fx, c.z - fz) < 40) vorZellen++;
        const vorDorf = new Set(s.architectures);
        let fernSteht = false;
        r.spawnSettlement({ seed: 23, nH: 14, position: { x: fx, y: hh(fx, fz), z: fz } }).then(
            () => (fernSteht = true)
        );
        const fernHaeuser = () =>
            s.architectures.filter((e) => !vorDorf.has(e) && e.type && e.type.startsWith("haus_") && e.fundament);
        await warteBis(() => fernSteht, 4, 120, 100);
        const FH = fernHaeuser();
        o.w4b = { haeuser: FH.length, streuVorher: { steht: streuSteht(), zellen: vorZellen }, fern: streuImHaus(FH) };
        // unter den Häusern: die Zellen, die das Haus geräumt hat, und die, die noch leben (ohne Zellen dort ist W4b blind)
        o.w4b.unterHaus = { lebend: 0, geraeumt: 0 };
        for (const c of streuZellen())
            if (imGrundrissVon(FH, c.x, c.z)) {
                if (lebt(c)) o.w4b.unterHaus.lebend++;
                else if (c.promotedId == null) o.w4b.unterHaus.geraeumt++;
            }
        // die Region unter dem Dorf baut neu (Rückkehr, Nach-Dünnen, Foundry-Refill): sie setzt durch die Wand
        {
            const RM = A.SCATTER.regionM;
            const keys = new Set();
            // nur Regionen in der Reichweite des Spielers: eine Region außer Reichweite fehlt nach der Regel der Welt und baut
            // nie neu
            for (const hs of FH) {
                const rx = Math.floor(hs.position.x / RM);
                const rz = Math.floor(hs.position.z / RM);
                if (r._streuRegionInReichweite(rx, rz, pm.position)) keys.add(`${rx},${rz}`);
            }
            for (const k of keys) r._disposeScatterRegion(k);
            const neuSteht = () => [...keys].every((q) => !r._streuRegionWartet(q));
            await warteBis(neuSteht, 2, 1500);
            await pumpe(10);
            o.w4b.neubau = streuImHaus(FH);
            o.w4b.neubau.steht = neuSteht();
            o.w4b.neubau.grund = [...keys].map((q) => q + " " + (r._streuRegionWartet(q) || "steht")).join(", ");
        }
        // hinlaufen: der Spieler steht in der Mitte der Häuser, bis die Chunks um ihn stehen und die Promotion (3 je Takt)
        // durch ist (die Nah-Streu der Kamera reicht 24 m — die Mitte des Dorfs, nicht sein Anker)
        let mx = 0;
        let mz = 0;
        for (const hs of FH) {
            mx += hs.position.x / Math.max(1, FH.length);
            mz += hs.position.z / Math.max(1, FH.length);
        }
        stell(mx, (hh(mx, mz) || start.y) + 3, mz);
        // (1) mit warmer Foundry: die Ruhe unter dem Spieler (`ruheAn`)
        o.w4b.ruhe = await ruheAn(mx, mz);
        o.w4b.nahStreu = streuImHaus(FH);
        // die Nah-Streu um die Kamera (Farn, Blume, Kiesel der Kachel): keine Pflanze im Grundriss
        {
            let n = 0;
            let imHaus = 0;
            for (const k of (s.nahStreu && s.nahStreu.kacheln.values()) || [])
                for (const it of k.items || []) {
                    n++;
                    if (imGrundrissVon(FH, it.x, it.z)) imHaus++;
                }
            o.w4b.kachel = { pflanzen: n, imHaus };
        }
        // (2) DIE PROMOTION lebt nur ohne warme Foundry (im Spiel der Boot-Spalt vor dem Buch): der Gate-Schalter
        // `__anazhGateNoFoundry`, gewartet, bis jede Baum-Zelle im Promotions-Ring promotet ist
        {
            const PR = A.SCATTER.promoteM;
            const ring = () => {
                let rest = 0;
                let promoviert = 0;
                for (const c of streuZellen()) {
                    if (!c.promotable || (c.x - pm.position.x) ** 2 + (c.z - pm.position.z) ** 2 > PR * PR) continue;
                    if (c.promotedId != null) promoviert++;
                    else if (c.slots && !r._scatterIsCellPromoted(c.x, c.z, c.layer || "tree")) rest++;
                }
                return { rest, promoviert };
            };
            o.w4b.promoWarm = ring();
            window.__anazhGateNoFoundry = true;
            try {
                await warteBis(() => ring().rest <= 0, 4, 1500);
            } finally {
                window.__anazhGateNoFoundry = false;
            }
            o.w4b.promo = ring();
            await pumpe(10);
        }
        o.w4b.nah = naturImHaus(FH);
    }
    if (P.has("w6")) {
        // W6 (Kopf): je Kultur (marokkanisch, viktorianisch, alemannisch) ein Haus wie ein Slot am Hang, die Front bergauf;
        // der Lauf beginnt 6 m vor der Front, (a) im Takt des Spawns (die Kern-Hülle), (b) 60 m bzw. 20 m vor der Mitte, bis
        // die Stufe 2 bzw. 1 steht (der Sim-Schritt ruft keinen LOD-Takt).
        o.w6 = [];
        const KULT = ["marokkanisch", "viktorianisch", "alemannisch"];
        const orte = [];
        for (const k of KULT) {
            const w = { kultur: k };
            o.w6.push(w);
            const P = FC.hausParams(FC.PRESETS[k], null);
            P.seed = 7;
            const Hh = FC.HAUS(window.THREE, FC.mat, P);
            Hh.build({ gelaende: false });
            const dm = Hh.dims;
            const tu = { x: dm.tuer.x, z: dm.tuer.z, w: dm.tuer.w, h: dm.tuer.h, y: dm.tuer.y, W: dm.W, D: dm.D };
            // der Footprint aus den Solids des Gesetzbuchs (beim Hof-Haus reicht er 14 m vor den Ursprung): Mitte + halbe Maße
            let x0 = Infinity;
            let x1 = -Infinity;
            let z0 = Infinity;
            let z1 = -Infinity;
            for (const so of Hh.solids) {
                x0 = Math.min(x0, so.min[0]);
                x1 = Math.max(x1, so.max[0]);
                z0 = Math.min(z0, so.min[2]);
                z1 = Math.max(z1, so.max[2]);
            }
            const fu = { ex: (x1 - x0) / 2, ez: (z1 - z0) / 2, ox: (x0 + x1) / 2, oz: (z0 + z1) / 2 };
            // der Ort: trocken, der Footprint trägt höchstens 4 m Höhenunterschied; die Gier dreht die Front bergauf
            let ort = null;
            const verworfen = {};
            for (let d = 70; d <= 520 && !ort; d += 10)
                for (const [cx, cz] of ring(start, [d], 48)) {
                    if (ort) break;
                    if (orte.some((q) => Math.hypot(q.x - cx, q.z - cz) < 70)) continue;
                    if (Math.hypot(cx - fx, cz - fz) < 120 || Math.hypot(cx - dorfMitte.x, cz - dorfMitte.z) < 90)
                        continue;
                    if (!r._landAt(cx, cz, 0.5)) continue;
                    const gx = (hh(cx + 4, cz) - hh(cx - 4, cz)) / 8;
                    const gz = (hh(cx, cz + 4) - hh(cx, cz - 4)) / 8;
                    if (!Number.isFinite(gx) || !Number.isFinite(gz) || Math.hypot(gx, gz) < 0.02) continue;
                    const gier = Math.atan2(-gx, -gz); // haus-lokal −z (die Front) = Welt (−sin, −cos) = bergauf
                    const c = Math.cos(gier);
                    const sn = Math.sin(gier);
                    let lo = Infinity;
                    let hi = -Infinity;
                    for (let lx = x0; lx <= x1 + 0.01; lx += Math.max(1, (x1 - x0) / 6))
                        for (let lz = z0; lz <= z1 + 0.01; lz += Math.max(1, (z1 - z0) / 8)) {
                            const h = hh(cx + lx * c + lz * sn, cz - lx * sn + lz * c);
                            lo = Math.min(lo, h);
                            hi = Math.max(hi, h);
                        }
                    // die Front bergauf: die Vorderkante trägt den höchsten Punkt (das Podest liegt vorn auf Gelände-Höhe); kein
                    // Buckel im Footprint über den Ecken (der Slot setzt das Haus auf die höchste Ecke — ein Buckel stünde im Haus)
                    const vorn = hh(cx + fu.ox * c + (z0 - 0.5) * sn, cz - fu.ox * sn + (z0 - 0.5) * c);
                    let ecken = -Infinity;
                    for (const [lx, lz] of [
                        [x0, z0],
                        [x1, z0],
                        [x0, z1],
                        [x1, z1],
                        [fu.ox, fu.oz],
                    ])
                        ecken = Math.max(ecken, hh(cx + lx * c + lz * sn, cz - lx * sn + lz * c));
                    if (!(
                        Number.isFinite(hi) &&
                        hi - lo <= 5 &&
                        hi <= ecken + 0.1 &&
                        Number.isFinite(vorn) &&
                        vorn >= hi - 0.6
                    ))
                        continue;
                    // der Anlauf-Korridor ist begehbar (2 m breit um die Tür-Achse, 7 m vor der Front bis zur Front, 0,5-m-Raster):
                    // die oberste Feld-Fläche (`getTerrainHeightAt`) stetig — höchstens 1 m je Schritt — und 1 m darunter solide (die
                    // Fläche interpoliert das 1,2-m-Raster des Felds)
                    let grund = null;
                    for (const lx of [tu.x - 1, tu.x, tu.x + 1]) {
                        let hVor = null;
                        for (let lz = z0 - 7; lz <= z0 + 0.01 && !grund; lz += 0.5) {
                            const px = cx + lx * c + lz * sn;
                            const pz = cz - lx * sn + lz * c;
                            const h = hh(px, pz);
                            if (!Number.isFinite(h) || (hVor !== null && Math.abs(h - hVor) > 1.0)) grund = "stetig";
                            else if (!r._fieldSolid(px, h - 1.0, pz)) grund = "fels";
                            hVor = h;
                        }
                        if (grund) break;
                    }
                    // die Wände des Slots selbst (Wasser über Grundriss und Vorplatz, kein Bau im Weg): sonst fällt er am Ort, den
                    // die Suche fand
                    if (
                        !grund &&
                        (!r._fundamentLand(cx, cz, gier, fu, tu, globalThis.__fachwerkCore.ORT_GESETZ.saumM) ||
                            !r._bauFrei(cx, cz, gier, fu, tu, hi))
                    )
                        grund = "wand";
                    if (grund) verworfen[grund] = (verworfen[grund] || 0) + 1;
                    else ort = { x: cx, z: cz, hMax: hi, gier };
                }
            if (!ort) {
                w.fehler = "kein Ort (Korridor verworfen: " + JSON.stringify(verworfen) + ")";
                continue;
            }
            orte.push(ort);
            // die Solids der Hülle (die EINE Hüllen-Form, S3: je Box ein Teil mit rolle "fest")
            const huelleVon = (e) =>
                e._hausHuelle && Array.isArray(e._hausHuelle.teile)
                    ? e._hausHuelle.teile.filter((t) => t.rolle !== "sicht").length
                    : 0;
            // der Weg (haus-lokal): frontal auf die Tür; beim Hof-Haus durch das Tor, rechts am Brunnen vorbei (das Gesetz des
            // Hofs: zC = Front − Hof-Tiefe, Torriegel 2,8 m, Brunnen mittig im Hof)
            const wegpunkte = [];
            if (dm.grundriss === "hof" || Hh.grundriss === "hof") {
                const zF = tu.z;
                const zC = zF - Math.max(5, Math.min(9, tu.W));
                const wz = (zF + zC + 2.8) / 2;
                wegpunkte.push([0, zC - 0.6], [0, zC + 2.8 + 0.4], [1.5, wz], [0, zF - 0.7]);
            }
            wegpunkte.push([tu.x, tu.z + 1.8]);
            const anlauf = (e) => {
                const vor = welt(e, tu.x, z0 - 6);
                stell(vor.x, (hh(vor.x, vor.z) || e.position.y) + 1.0, vor.z);
                // der Weg wird verfolgt: der Körper bleibt über dem Boden unter ihm (dem Gelände-Gesetz, auf Podest und Diele der
                // Haus-Basis) — höchstens eine Stufe darüber vor der Schwelle (nie über eine Mauer), nie darunter (nie in ein Loch)
                const base = e.position.y - 0.5;
                s.keys = s.keys || {};
                for (const [lx, lz] of wegpunkte) {
                    const q = welt(e, lx, lz);
                    for (let k = 0; k < 500; k++) {
                        if (Math.hypot(q.x - pm.position.x, q.z - pm.position.z) < 0.2) break;
                        s.yaw = Math.atan2(q.x - pm.position.x, q.z - pm.position.z);
                        s.keys.w = true;
                        r._stepFixedSim((t += DT), DT);
                        const lq = lokal(e, pm.position.x, pm.position.z);
                        const gel = hh(pm.position.x, pm.position.z);
                        const fuss = pm.position.y - FUSS;
                        const ueber = rund(fuss - Math.max(gel, base));
                        const unter = rund(fuss - gel);
                        if (lq.z < tu.z - 0.3 && !(ueber <= w.hochM)) {
                            w.hochM = ueber;
                            w.hochOrt = [rund(lq.x), rund(lq.z)];
                        }
                        if (!(unter >= w.tiefM)) {
                            w.tiefM = unter;
                            // der Sturz-Ort: haus-lokal, das Gelände-Gesetz über der Basis, das Feld 0,3 m unter dem Gesetz
                            w.tiefOrt = [rund(lq.x), rund(lq.z), rund(gel - base)];
                            w.tiefFeld = r._fieldSolid(pm.position.x, gel - 0.3, pm.position.z) ? "solide" : "Luft";
                        }
                    }
                    s.keys.w = false;
                    for (let k = 0; k < 10; k++) r._stepFixedSim((t += DT), DT);
                }
                return rund(lokal(e, pm.position.x, pm.position.z).z - tu.z);
            };
            // (a) die Kern-Hülle: der Slot geht den Weg jedes Siedlungs-Hauses (`_spawnSettlementSlot`: Ecken, Podest, Grundriss
            // räumt) — Spawn und Anlauf im selben Takt
            const c = Math.cos(ort.gier);
            const sn = Math.sin(ort.gier);
            const slot = {
                kultur: k,
                x: ort.x,
                z: ort.z,
                phi: ort.gier,
                seed: 7,
                tuer: tu,
                obb: {
                    cx: ort.x + fu.ox * c + fu.oz * sn,
                    cz: ort.z - fu.ox * sn + fu.oz * c,
                    phi: ort.gier,
                    ex: fu.ex,
                    ez: fu.ez,
                },
            };
            const vorSlot = new Set(s.architectures);
            // K10: der Slot geht den Weg des Plans v2 — `_ortWahl` legt seinen Boden y und den Erdbau, bevor das Haus
            // steht (je Haus ein eigener Ort: der Samen trägt die Kultur)
            const v2 = await r._ortWahl(
                { seed: 700 + orte.length, slots: [slot], roads: [], laternen: [] },
                { x: 0, z: 0 }
            );
            const slotV2 = v2 && Array.isArray(v2.slots) ? v2.slots[0] : null;
            if (slotV2) r._spawnSettlementSlot(slotV2, { x: 0, z: 0 }, r._foundry);
            const e = s.architectures.find((q) => !vorSlot.has(q) && q.type === "haus_" + k);
            if (!e) {
                w.fehler = "Slot fiel";
                continue;
            }
            // der Anlauf-Korridor (2 m breit, 6 m vor der Front bis zur Front) ist frei: die Natur darin räumt die Linse wie
            // einen Weg (ein Baum im Weg ist kein Haus-Befund)
            for (const q of s.architectures.slice()) {
                if (q === e || !r._istNatur(q)) continue;
                const lq = lokal(e, q.position.x, q.position.z);
                if (Math.abs(lq.x - tu.x) <= 2 && lq.z >= z0 - 7 && lq.z <= z0) r.removeArchitecture(q);
            }
            w.gierGrad = Math.round((ort.gier * 180) / Math.PI);
            w.kernBoxen = e.blockerAABBs ? e.blockerAABBs.length : 0;
            w.kernHuelle = huelleVon(e);
            w.kernDrinM = anlauf(e);
            // (b) die Fernstufen: der Spieler wartet 60 m (Stufe 2) bzw. 20 m (Stufe 1) vor der Mitte, bis die Foundry liefert
            w.fern = [];
            for (const abstand of [60, 20]) {
                const weg = welt(e, fu.ox, fu.oz - abstand);
                stell(weg.x, (hh(weg.x, weg.z) || e.position.y) + 3, weg.z);
                const soll = abstand > 40 ? 2 : 1;
                await window
                    .__gebautNach(e, {
                        fertig: () => e._hausHuelle && e._servedLod === soll,
                        bau: () => {},
                        takt: () => pumpe(10),
                        max: 60,
                    })
                    .catch(() => null);
                w.fern.push({ stufe: e._servedLod, huelle: huelleVon(e), drinM: anlauf(e) });
            }
        }
    }
    // W9 ABBAU: ein Dorf-Haus (Grund im Erdbau des Orts) und ein gesetztes Haus (eigener Erdbau `haus:`) fallen über
    // `removeArchitecture` — kein Grund an ihrer Mitte, der Boden schließt jede Box mit eigenem Boden, der Keller trägt Erde.
    // Danach misst keine Phase dieses Dorf.
    if (P.has("grund")) {
        o.w9 = o.w9 || {};
        o.w9.abbau = [];
        const dorf = H.find((e) => gesetz(e).cellar) || H[0];
        const gesetzt = sbE || s.architectures.find((e) => e.id === "w9-slot");
        for (const [art, e] of [
            ["dorf", dorf],
            ["gesetzt", gesetzt],
        ]) {
            const a = { art, plan: e && e.__w9Plan };
            o.w9.abbau.push(a);
            if (!e) {
                a.fehler = "kein Haus";
                continue;
            }
            const { Hh, sc, base, kasten: boxen } = grundDes(e);
            const mitten = boxen
                .filter((m) => m.traegt)
                .map((m) => welt(e, ((m.x0 + m.x1) / 2) * sc, ((m.z0 + m.z1) / 2) * sc));
            const ke = Hh.cellar;
            const kp = ke ? welt(e, ((ke.x0 + ke.x1) / 2) * sc, ((ke.z0 + ke.z1) / 2) * sc) : null;
            const ky = ke ? base + (ke.floorY + 0.3) * sc : 0;
            const [x, z] = [e.position.x, e.position.z];
            const lage = () => ({
                gruende: gruende().filter((g) => Math.abs(g.cx - x) < 0.05 && Math.abs(g.cz - z) < 0.05).length,
                offen: mitten.filter((p) => r._bodenSichtAt(p.x, p.z) == null).length,
                kellerErde: kp ? +(r._terrainDensityAt(kp.x, ky, kp.z) > 0) : null,
            });
            const karten = () => r._bodenSichtChunks(x - 10, z - 10, x + 10, z + 10);
            // der Boden um das Haus steht, geschnitten im Grund: 3 ruhige Takte
            stell(x, e.position.y + 1, z);
            let [ruhig, k9] = [0, 0];
            await warteBis(() => (ruhig = k9++ >= 6 && karten() && lage().offen ? ruhig + 1 : 0) >= 3, 5, 120);
            a.vorher = lage();
            a.boxen = mitten.length;
            a.weg = r.removeArchitecture(e);
            k9 = 0;
            await warteBis(() => k9++ >= 6 && karten() && !lage().offen, 5, 60);
            a.nachher = lage();
        }
        // W9 WAISE: das Start-Dorf wächst, ein Bau sperrt seinen letzten Slot, nach dem dritten Haus fällt der Zug wie mit der
        // Seite (Reload), ein Haus verblasst — danach trägt jeder Grund einen Bau an seiner Mitte. ZUG: jeder andere Slot steht.
        // AUSSTATTUNG: Brunnen, Laternen und Stände stehen am Ort des Plans.
        const takt = window.__anazhAutoSettlement;
        const t0 = performance.now();
        window.__anazhAutoSettlement = true;
        stell(start.x, start.y + 1, start.z);
        const zellen = () => (s.worldMeta && s.worldMeta.settlementCells) || {};
        let q = null;
        await warteBis(() => !!(q = r._autoSettlementQueue) || !!zellen().start, 1, 600);
        const sl = q && q.plan.slots[q.plan.slots.length - 1];
        const ort = sl && { x: q.origin.x + sl.x, y: sl.y + 0.5, z: q.origin.z + sl.z };
        const sperre = ort && r.spawnArchitecture("brunnen_dorf", ort, { silent: true });
        await warteBis(() => !(q && r._autoSettlementQueue === q && q.idx < 3), 1, 1200);
        const reload = !!q && r._autoSettlementQueue === q && q.idx < q.plan.slots.length ? q.idx : 0;
        if (reload) {
            // der Reload des Spiels mitten im Erwachen: der Zug fällt, der Ort kehrt aus seinem Gedächtnis wieder (speicher.K3)
            r._autoSettlementQueue = null;
            r._stlWegeKeys.delete(q.cellKey);
        }
        // der Zug des Start-Dorfs (samt seinem Rebuild) ist leer, bevor der Takt ein nächstes Dorf beginnt
        const zugLebt = () => r._autoSettlementQueue || r._stlWegePending || (q && !r._stlWegeKeys.has(q.cellKey));
        const zugOffen = !(await warteBis(() => !zugLebt() && !!zellen().start, 1, 1200));
        window.__anazhAutoSettlement = takt;
        const an = (x, z, typ) => (e) =>
            e !== sperre &&
            (!typ || e.type === typ) &&
            e.position &&
            Math.hypot(e.position.x - x, e.position.z - z) < 0.05;
        const slots = q ? q.plan.slots : [];
        const amSlot = (t) => s.architectures.find(an(q.origin.x + t.x, q.origin.z + t.z));
        const haeuser = slots.filter(amSlot).length;
        const zaehle = (liste, typ, kappe) => {
            const l = (liste || []).filter(Boolean).slice(0, kappe);
            return [
                l.filter((b) => s.architectures.some(an(q.origin.x + b.x, q.origin.z + b.z, typ(b)))).length,
                l.length,
            ];
        };
        const ausstattung = q && {
            brunnen: zaehle(q.plan.brunnen, () => "brunnen_dorf", 5),
            laternen: zaehle(
                (q.plan.laternen || []).filter((l) => l && (!l.wand || (slots[l.slot] && amSlot(slots[l.slot])))),
                (l) => (l.wand ? "wandlaterne_dorf" : "laterne_dorf"),
                Infinity
            ),
            staende: zaehle(q.plan.staende, () => "marktstand_dorf", 3),
        };
        // DAS VERBLASSEN (`_capNexusStructures`): ein Haus des Dorfs verblasst
        const verblasst = slots.map(amSlot).find(Boolean);
        if (verblasst) r._evictArchitecture(verblasst);
        const gr = gruende();
        const ohne = gr.filter((g) => !s.architectures.some(an(g.cx, g.cz)));
        o.w9.waise = {
            start: !!zellen().start,
            gruende: gr.length,
            gesperrt: !!sperre,
            ohne: ohne.map((g) => `${Math.round(g.cx)}/${Math.round(g.cz)}`),
            slots: slots.length,
            haeuser,
            reload,
            zugOffen,
            ausstattung,
            verblasst: !!verblasst,
            ms: Math.round(performance.now() - t0),
        };
    }
    pm.position.set(start.x, start.y, start.z);
    return o;
}

function urteil(o) {
    const f = [];
    if (o.fehler) return [o.fehler];
    const P = new Set(o.phasen);
    if (P.has("haus")) {
        const hs = o.haeuser.filter((h) => !h.fehler);
        if (!(hs.length >= 6)) f.push(`Aufbau: ${hs.length} Häuser geprüft (Soll ≥ 6)`);
        const gedreht = hs.filter(
            (h) => Math.abs(((h.gierGrad % 90) + 90) % 90) > 5 && Math.abs(((h.gierGrad % 90) + 90) % 90) < 85
        );
        if (!(gedreht.length >= 2)) f.push(`Aufbau: ${gedreht.length} gedrehte Häuser (Soll ≥ 2)`);
        const nichtL0 = hs.filter((h) => h.stufe !== 0 || h.huelle !== 0);
        if (nichtL0.length)
            f.push(`Aufbau: ${nichtL0.length} Häuser ohne Stufe 0 / Hülle 0 (${nichtL0.map((h) => h.typ).join(" ")})`);
        const ohneSchwelle = hs.filter((h) => h.vorplatzUeberM === null || h.vorplatzUeberM === undefined);
        if (ohneSchwelle.length)
            f.push(`W1 Tür: ${ohneSchwelle.length} Häuser ohne Diele hinter der Schwelle im Gesetzbuch (Vorbedingung)`);
        const begraben = hs.filter((h) => h.vorplatzUeberM > 0.2);
        if (begraben.length)
            f.push(
                `W1 Tür: ${begraben.length} von ${hs.length} Türen liegen im Boden — der Vorplatz steht über der Diele (${begraben.map((h) => h.typ + "@" + h.gierGrad + "°:+" + h.vorplatzUeberM + " m").join(" ")}; Soll ≤ 0,2 m)`
            );
        const diele = hs.filter((h) => !(Math.abs(h.dieleCm) <= 3));
        if (diele.length)
            f.push(
                `W2 Diele: ${diele.length} Häuser mit dem Fuß neben der Diele (${diele.map((h) => h.typ + ":" + h.dieleCm + " cm").join(" ")})`
            );
        const gang = hs.filter((h) => h.gang);
        if (gang.length < 3 || !gang.some((h) => h.gang.keller) || !gang.some((h) => h.gang.dach))
            f.push(`W10 Aufbau: ${gang.length} Gänge (Soll ≥ 3, mit Keller, mit Dachboden)`);
        const tier = hs.filter((h) => h.tiere && h.tiere.length);
        if (hs.some((h) => !h.saat)) f.push("W10 Saat blind");
        if (tier.length) f.push(`W10 Tier im Haus: ${tier.map((h) => h.typ + " " + h.tiere).join(" · ")}`);
        const hub = gang.filter((h) => !(h.gang.hub <= 0.3));
        if (hub.length) f.push(`W10 Anti-Clip-Hub: ${hub.map((h) => h.typ + " " + h.gang.wo).join(" · ")}`);
        const wand = gang.filter((h) => !(h.gang.wand > 0.5));
        if (wand.length)
            f.push(`W10 Wand: ${wand.map((h) => h.typ + " " + h.gang.wand).join(" · ")} m geklettert (Soll > 0,5)`);
        const zu = gang.filter((h) => h.gang.fehlt.length);
        if (zu.length)
            f.push(
                `W10 Spielgang: ${zu.map((h) => h.typ + "@" + h.gierGrad + "° " + h.gang.fehlt.join(", ")).join(" · ")}`
            );
        const optik = hs.filter((h) => !(h.optikProzent >= 97));
        if (optik.length)
            f.push(
                `W5 Kollision == Optik: ${optik.length} Häuser unter 97 % (${optik.map((h) => h.typ + "@" + h.gierGrad + "°:" + h.optikProzent + " %").join(" ")})`
            );
        if (!o.w7 || !(o.w7.haeuser >= 6))
            f.push(`W7 Aufbau: ${o.w7 ? o.w7.haeuser : "?"} Dorf-Häuser abgetastet (Soll ≥ 6)`);
        else if (o.w7.imBau || o.w7.zweitesImBau || !Number.isFinite(o.w7.zweitesDorf))
            f.push(
                `W7 Bau im Bau: ${o.w7.imBau} Häuser in einem früheren Bau oder mit der Tür an seiner Wand, zweites Dorf am selben Anker ${o.w7.zweitesImBau}/${o.w7.zweitesDorf} im ersten (${o.w7.taeter.join(" · ") || "Akt fehlt"})`
            );
        const ueber = hs.filter((h) => !(h.grundrissUeberM <= 0.05));
        if (ueber.length)
            f.push(
                `W4c Grundriss deckt das Haus nicht: ${ueber.map((h) => h.typ + " " + h.grundrissUeberM + " m").join(" ")} (die Solids ragen aus der Fundament-Box)`
            );
    }
    if (P.has("w6")) {
        const w6 = (o.w6 || []).filter((w) => !w.fehler);
        if (w6.length < 3)
            f.push(
                `W6 Aufbau: ${w6.length} von 3 Häusern (${(o.w6 || []).map((w) => w.kultur + ":" + (w.fehler || "ok")).join(" ")})`
            );
        if (!w6.some((w) => w.kernHuelle === 0)) f.push("W6 Aufbau: kein Haus vor der ersten Studio-Stufe angelaufen");
        const ueberMauer = w6.filter((w) => !(w.hochM <= 1.3));
        if (ueberMauer.length)
            f.push(
                `W6 Aufbau: der Anlauf lief vor der Schwelle über dem Boden (${ueberMauer.map((w) => w.kultur + " " + w.hochM + " m @" + w.hochOrt).join(" ")} — über eine Mauer, nicht durch die Tür)`
            );
        const imLoch = w6.filter((w) => !(w.tiefM >= -1));
        if (imLoch.length)
            f.push(
                `W6 Aufbau: der Körper fiel unter das Gelände (${imLoch.map((w) => w.kultur + " " + w.tiefM + " m @" + w.tiefOrt + " Feld " + w.tiefFeld).join(" ")} — der Ort trägt nicht, kein Tür-Befund)`
            );
        const kernZu = w6.filter((w) => w.kernHuelle === 0 && !(w.kernDrinM >= 1));
        if (kernZu.length)
            f.push(
                `W6 Kern-Hülle: vor der ersten Stufe ${kernZu.map((w) => w.kultur + " " + w.kernDrinM + " m").join(", ")} vor bzw. hinter der Schwelle (Soll ≥ 1)`
            );
        const fernAlle = [];
        for (const w of w6) for (const fz of w.fern || []) fernAlle.push(Object.assign({ kultur: w.kultur }, fz));
        const stufen = new Set(fernAlle.filter((fz) => fz.stufe >= 1 && fz.huelle > 0).map((fz) => fz.stufe));
        if (!stufen.has(1) || !stufen.has(2))
            f.push(`W6 Aufbau: Fernstufen mit Hülle angelaufen: ${[...stufen].join("/") || "keine"} (Soll 1 und 2)`);
        const fernZu = fernAlle.filter((fz) => fz.stufe >= 1 && fz.huelle > 0 && !(fz.drinM >= 1));
        if (fernZu.length)
            f.push(
                `W6 Fernstufe: frontal ${fernZu.map((fz) => fz.kultur + "@L" + fz.stufe + " " + fz.drinM + " m").join(", ")} hinter der Schwelle (Soll ≥ 1)`
            );
    }
    if (P.has("lichtung")) {
        const w = o.w8;
        if (!w || w.fehler) f.push(`W8 Aufbau: ${w ? w.fehler : "Probe fehlt"}`);
        else {
            if (!w.ruhe) f.push("W8 Aufbau: Chunk, Wald-Schlange und Nah-Streu kamen an der Plattform nicht zur Ruhe");
            if (w.promoRest > 0)
                f.push(`W8 Aufbau: ${w.promoRest} Baum-Zellen im Promotions-Ring der Plattform blieben offen`);
            if (!(w.baeume >= 3))
                f.push(
                    `W8 Aufbau: ${w.baeume} Bäume im 60-m-Kreis der Plattform (Soll ≥ 3 — sonst sieht die Probe keinen Wald)`
                );
            if (!w.streuSteht || !(w.zellenNeu >= 20))
                f.push(
                    `W8 Aufbau: ${w.zellenNeu} lebende Streu-Zellen in den neu gebauten Regionen um die Plattform (im 40-m-Kreis ${w.zellen})${w.streuSteht ? "" : " (die Regionen kamen nicht zur Ruhe)"} (Soll ≥ 20)`
                );
            if (!(w.pflanzen >= 20)) f.push(`W8 Aufbau: ${w.pflanzen} Kachel-Pflanzen im 30-m-Kreis (Soll ≥ 20)`);
            if (!(w.tore >= 1))
                f.push(`W8 Aufbau: ${w.tore} Tore im Ring um die Plattform (der Ort-Takt baute keinen Ring)`);
            if (!(w.gegenprobe >= 1))
                f.push(
                    `W8 Aufbau: der Hain der KI wuchs 150 m weiter nicht (${w.gegenprobe}; ${(w.kiFehler || []).join(" ")}) — die Probe ist blind`
                );
            const ueber = [];
            if (w.naturUeber) ueber.push(`${w.naturUeber} Natur-Einträge (${w.taeter.join(" · ")})`);
            if (w.zellenUeber) ueber.push(`${w.zellenUeber} Streu-Zellen ${JSON.stringify(w.je)}`);
            if (w.aufScheibe) ueber.push(`${w.aufScheibe} Kachel-Pflanzen auf dem Platz`);
            if (w.kiPlattform) ueber.push(`${w.kiPlattform} Bäume der KI`);
            if (ueber.length) f.push(`W8 Lichtung: über dem Genesis-Platz (r ${w.plattform[2]} m) ${ueber.join(", ")}`);
            if (w.kiHaus) f.push(`W8 Hain im Haus: ${w.kiHaus} Bäume der KI im Grundriss von ${w.kiHausTyp}`);
            const stumm = [];
            if (!w.kiHaus && !(w.kiWeichtHaus >= 1))
                stumm.push(`der Hain im Haus fiel ohne Eintrag (ergebnis haus ${w.kiWeichtHaus})`);
            if (!w.kiPlattform && !(w.kiWeichtPlattform >= 1))
                stumm.push(`der Hain auf der Plattform fiel ohne Eintrag (ergebnis lichtung ${w.kiWeichtPlattform})`);
            if (
                w.chatGewachsen === 0 &&
                !(/Lichtung/.test(w.chatSatz || "") && !/gewachsen|gepflanzt/.test(w.chatSatz || ""))
            )
                stumm.push(`der Chat sagt „${w.chatSatz}" bei 0 Bäumen (Soll: die Lichtung benannt, nie „gewachsen")`);
            if (w.chatBaeume) stumm.push(`der Satz pflanzte ${w.chatBaeume} Bäume über die Scheibe`);
            if (stumm.length) f.push(`W8 Absage: ${stumm.join(" · ")}`);
        }
    }
    if (P.has("sohle")) {
        const so = o.sohle;
        if (!so || so.fehler) f.push(`W8 Aufbau: ${so ? so.fehler : "Sohlen-Probe fehlt"}`);
        else {
            if (!(so.luft <= 0.3))
                f.push(`W8 Sohle: die Scheibe schwebt ${so.luft} m über dem Boden unter ihr (Soll ≤ 0,3 m)`);
            if (!(Math.abs(so.werkTief) <= 0.05))
                f.push(
                    `W8 Sohle: die Feuerstelle des Satzes steht ${so.werkTief} m unter der Oberkante der Scheibe (Soll auf ihr, ± 5 cm)`
                );
        }
    }
    if (P.has("bau")) {
        const wb = o.bau;
        if (!wb || wb.fehler || !(wb.vorher >= 1))
            f.push(
                `W8 Aufbau: ${wb ? wb.fehler || `${wb.vorher} Bäume des Hains standen in den Boxen des Damms` : "Bau-Probe fehlt"} (Soll ≥ 1 — sonst sieht die Probe keinen Bau)`
            );
        else {
            const bau = [];
            if (wb.rest) bau.push(`${wb.rest} von ${wb.vorher} Bäumen blieben in den Boxen des Damms`);
            if (wb.ki) bau.push(`${wb.ki} Bäume der KI wuchsen in den Damm`);
            else if (!(wb.kiWeicht >= 1)) bau.push(`der Hain im Damm fiel ohne Eintrag (ergebnis bau ${wb.kiWeicht})`);
            if (bau.length) f.push(`W8 Bau: ${bau.join(" · ")}`);
        }
    }
    if (P.has("w4") && o.w4 && o.w4.imHaus)
        f.push(`W4 Grundriss: ${o.w4.imHaus} Natur-Einträge im Grundriss eines Hauses (${o.w4.taeter.join(" ")})`);
    if (P.has("w4")) {
        const w = o.w4weg;
        if (!w || !(w.formen >= 10) || !(w.natur >= 50))
            f.push(
                `W4 Aufbau: ${w ? w.formen : "?"} Formen der Wege-Karte, ${w ? w.natur : "?"} Natur-Stücke (Soll ≥ 10 und ≥ 50 — sonst sieht die Probe keinen Weg)`
            );
        else if (w.aufWeg)
            f.push(`W4 Weg: ${w.aufWeg} Natur-Stücke auf Weg, Platz und Acker des Dorfs (${w.taeter.join(" · ")})`);
    }
    if (P.has("w4b")) {
        if (!o.w4b || !(o.w4b.haeuser >= 8))
            f.push(`W4b Aufbau: ${o.w4b ? o.w4b.haeuser : "?"} Häuser im fernen Dorf (Soll ≥ 8)`);
        else {
            if (!(o.w4b.fern.zellen >= 50))
                f.push(`W4b Aufbau: ${o.w4b.fern.zellen} lebende Streu-Zellen im Ring (Soll ≥ 50)`);
            if (!o.w4b.streuVorher || !o.w4b.streuVorher.steht || !(o.w4b.streuVorher.zellen >= 20))
                f.push(
                    `W4b Aufbau: die Streu stand nicht, bevor das Dorf kam (${o.w4b.streuVorher ? (o.w4b.streuVorher.steht ? "Regionen gebaut" : "Regionen offen") + ", " + o.w4b.streuVorher.zellen + " Zellen im Dorf-Kreis" : "?"}; Soll gebaut, ≥ 20)`
                );
            const unterN = o.w4b.unterHaus ? o.w4b.unterHaus.lebend + o.w4b.unterHaus.geraeumt : 0;
            if (!(unterN >= 5))
                f.push(
                    `W4b Aufbau: unter den Häusern des fernen Dorfs standen ${unterN} Streu-Zellen (Soll ≥ 5 — sonst sieht die Probe keinen Täter)`
                );
            if (o.w4b.fern.imHaus)
                f.push(
                    `W4b Fern-Streu: ${o.w4b.fern.imHaus} Streu-Zellen in den Häusern des fernen Dorfs (${JSON.stringify(o.w4b.fern.je)})`
                );
            if (!o.w4b.neubau || !o.w4b.neubau.steht || !(o.w4b.neubau.zellen >= 50))
                f.push(
                    `W4b Aufbau: die Region baute ${o.w4b.neubau ? o.w4b.neubau.zellen : "?"} Zellen neu${o.w4b.neubau && !o.w4b.neubau.steht ? ` (ohne zur Ruhe zu kommen: ${o.w4b.neubau.grund})` : ""} (Soll ≥ 50, gebaut)`
                );
            else if (o.w4b.neubau.imHaus)
                f.push(
                    `W4b Neubau: ${o.w4b.neubau.imHaus} Streu-Zellen der neu gebauten Region in den Häusern (${JSON.stringify(o.w4b.neubau.je)})`
                );
            if (!o.w4b.ruhe)
                f.push(
                    `W4b Aufbau: Chunk, Wald-Schlange und Nah-Streu kamen am Dorf nicht zur Ruhe (${o.w4b.kachel ? o.w4b.kachel.pflanzen : "?"} Kachel-Pflanzen)`
                );
            if (!o.w4b.promo || !(o.w4b.promo.promoviert >= 1) || o.w4b.promo.rest > 0)
                f.push(
                    `W4b Aufbau: die Promotion lief nicht durch (${o.w4b.promo ? o.w4b.promo.promoviert + " promotet, " + o.w4b.promo.rest + " offen" : "?"} im Ring; Soll ≥ 1, 0 offen)`
                );
            if (o.w4b.kachel && o.w4b.kachel.imHaus)
                f.push(
                    `W4b Nah-Streu: ${o.w4b.kachel.imHaus} von ${o.w4b.kachel.pflanzen} Kachel-Pflanzen im Grundriss`
                );
            if (o.w4b.nah.imHaus)
                f.push(
                    `W4b Promotion: nach dem Hinlaufen ${o.w4b.nah.imHaus} Natur-Einträge im Grundriss (${o.w4b.nah.taeter.join(" ")})`
                );
            if (o.w4b.nahStreu.imHaus)
                f.push(
                    `W4b Rest-Streu: nach dem Hinlaufen ${o.w4b.nahStreu.imHaus} Streu-Zellen im Grundriss (${JSON.stringify(o.w4b.nahStreu.je)})`
                );
        }
    }
    // W9 DAS GRUND-DATUM
    // jedes Haus des Plans steht, mit der Phase haus ist jedes gegangen, mit `--bild` jedes Innen-Bild lesbar
    if (P.has("start")) {
        const sd = o.startDorf || { slots: 0, fehlt: [] };
        const gang = o.haeuser.filter((h) => h.start && h.gang).length;
        if (!(sd.slots >= 1) || sd.fehlt.length || (P.has("haus") && gang !== sd.slots))
            f.push(`W10 Start-Dorf: ${gang} von ${sd.slots} Häusern des Plans gegangen ${sd.fehlt.join(" ")}`);
        const innen = ((o.w9 && o.w9.haeuser) || []).filter((h) => h.start);
        const dunkel = innen.filter((h) => !(h.quote >= 0.15));
        if (P.has("bild") && (innen.length !== sd.slots || dunkel.length))
            f.push(
                `W10 Innen-Bild: ${dunkel.length} von ${innen.length} Häusern unter 15 % des Außen-Schattens (${dunkel.map((h) => `${h.typ} ${h.innen}/${h.aussen}`).join(" · ")})`
            );
    }
    if (P.has("grund")) {
        const w9 = o.w9 || {};
        const hs = w9.haeuser || [];
        const boxen = hs.flatMap((h) => h.koerper);
        const summe = (feld) => boxen.reduce((a, b) => a + (b[feld] || 0), 0);
        const je = (w) => JSON.stringify(boxen.reduce((m, b) => (w(b) && (m[b.art] = (m[b.art] || 0) + w(b)), m), {}));
        const mit = (w) => `in ${hs.filter((h) => h.koerper.some(w)).length} von ${hs.length} Häusern ${je(w)}`;
        const gesehen = boxen.filter((b) => b.blicke > 0);
        const bildW = (b) => (b.halm + b.boden > 20 ? b.halm + b.boden : 0);
        if (!boxen.length || !hs.some((h) => h.ring > 0))
            f.push(`W9 Aufbau: blind — ${boxen.length} Boxen, kein Büschel`);
        if (!(w9.weite > 0)) f.push("W9 Weite: blind — keine Vorlage der Nah-Wiese");
        if (summe("bueschel"))
            f.push(`W9 Büschel: ${summe("bueschel")} im Körper-Satz ${mit((b) => b.bueschel)}, Weite ${w9.weite} m`);
        if (summe("dichte"))
            f.push(
                `W9 Dichte: Erde in ${summe("dichte")} von ${summe("proben")} Zellen über der Diele ${mit((b) => b.dichte)}`
            );
        if (w9.bild && !gesehen.length) f.push("W9 Bild: blind — kein freies Auge in einer Box");
        else if (w9.bild && !hs.some((h) => h.gegenprobe > 0))
            f.push("W9 Bild: blind — die Gegenprobe sieht keinen Halm");
        if (w9.bild && gesehen.some(bildW))
            f.push(`W9 Bild: Halm ${summe("halm")} + Boden ${summe("boden")} px ${mit(bildW)}`);
        // THIRD und WASSER: je Haus Halm/Boden vor ihm; je Wasser die Pflanzen darin am Gesetz und je Sicht Spiegel, Halm, Grund
        // und Gegenprobe — blind ohne Spiegel (500 px) oder Gegenprobe
        const [z9, wl] = [w9Zeile(w9), w9.wasser || []];
        if (w9.bild && hs.some((h) => !h.third || bildW(h.third))) f.push(`W9 Third: ${JSON.stringify(z9.third)} px`);
        const nass = (w) => w.wiese + w.streu || w.blicke.some((z) => z.spiegel < 500 || z.halm + z.boden > 20);
        if (w9.bild && (wl.length < 2 || wl.some((w) => nass(w) || !w.blicke.some((z) => z.gegen))))
            f.push(`W9 Wasser: ${JSON.stringify(z9.wasser)}`);
        const ab = w9.abbau || [];
        const blind = ab.filter((a) => a.fehler || !(a.vorher.gruende > 0 && a.vorher.offen > 0));
        if (ab.length < 2 || blind.length)
            f.push(
                `W9 Abbau: blind — ${ab.length < 2 ? "kein Abbau" : blind.map((a) => a.art + " " + (a.fehler || JSON.stringify(a.vorher)))}`
            );
        const bleibt = ab.filter(
            (a) => !a.fehler && (a.nachher.gruende || a.nachher.offen || a.nachher.kellerErde === 0)
        );
        if (bleibt.length)
            f.push(`W9 Abbau: der Grund überlebt den Bau ${bleibt.map((a) => a.art + JSON.stringify(a.nachher))}`);
        const sw = w9.slot || {};
        if (!(sw.hang >= 0.15 && sw.byte && sw.boden === 1)) f.push(`W9 Slot: ${JSON.stringify(sw)}`);
        const pl = ab.find((a) => a.art === "gesetzt" && !a.fehler);
        if (pl && pl.plan !== 1) f.push(`W9 Plan: ${pl.plan} Gründe bei der Ankunft der Hülle (Soll 1)`);
        const wa = w9.waise || {};
        const au = wa.ausstattung;
        if (!(wa.start && wa.gruende && wa.gesperrt && wa.reload && wa.verblasst))
            f.push(
                `W9 Waise: blind — Start, Gründe, Sperre, Reload, Verblassen ${[wa.start, wa.gruende, wa.gesperrt, wa.reload, wa.verblasst]}`
            );
        else if (wa.ohne.length) f.push(`W9 Waise: ${wa.ohne.length} von ${wa.gruende} Gründen ohne Bau (${wa.ohne})`);
        if (wa.zugOffen) f.push("W9 Zug: blind — der Zug lebt");
        else if (wa.gesperrt && wa.haeuser < wa.slots - 1)
            f.push(`W9 Zug: ${wa.haeuser} von ${wa.slots - 1} freien Slots stehen`);
        if (wa.start && !(au && au.brunnen[1] && au.laternen[1]))
            f.push("W9 Ausstattung: blind — kein Brunnen, keine Laterne");
        else if (au && Object.values(au).some(([n, soll]) => n < soll)) f.push(`W9 Ausstattung: ${JSON.stringify(au)}`);
    }
    return f;
}

// die Zahlen des Grund-Datums: Summen über die Boxen, Gegenprobe, Abbau vorher/nachher, Waise und Zug
const w9Zeile = (w) => ({
    haeuser: w.haeuser.length,
    weite: w.weite,
    summe: ["bueschel", "dichte", "halm", "boden", "blicke"].map((k) =>
        w.haeuser.reduce((a, h) => a + h.koerper.reduce((q, b) => q + b[k], 0), 0)
    ),
    gegenprobe: w.haeuser.map((h) => h.gegenprobe).filter((g) => g != null),
    third: w.haeuser.map((h) => h.third && [h.third.halm, h.third.boden]),
    wasser: (w.wasser || []).map((x) => [
        x.ort,
        x.wiese,
        x.streu,
        x.blicke.map((z) => [z.spiegel, z.halm, z.boden, z.gegen]),
    ]),
    innen: w.haeuser.filter((h) => h.start).map((h) => h.quote),
    abbau: w.abbau,
    slot: w.slot,
    waise: w.waise && { ...w.waise, ohne: w.waise.ohne.length },
});

// die Kopf-Zeile: je Haus W1 W2 W4c W5, dann die Zahlen jeder Phase (ohne Täter-Listen, die nennt das Urteil)
function zeile(o) {
    if (o.fehler) return o.fehler;
    const hs = o.haeuser.filter((h) => !h.fehler);
    const je = (k) => hs.map((h) => h[k]).join("/");
    return (
        `Dorf-Ort ${JSON.stringify(o.dorfOrt)}, Start ${o.startOrt.x}/${o.startOrt.z} · ${hs.length} Häuser, Start-Dorf ` +
        `${hs.filter((h) => h.start).length}/${o.startDorf ? o.startDorf.slots : "–"} · ` +
        (hs.length
            ? `Gier ${je("gierGrad")}° · W1 Vorplatz über der Diele ${je("vorplatzUeberM")} m · W2 Diele ${je("dieleCm")} cm · ` +
              `W4c Überstand ${je("grundrissUeberM")} m · W5 Optik ${je("optikProzent")} % · `
            : "") +
        JSON.stringify(
            {
                W4: o.w4,
                weg: o.w4weg,
                fern: o.fernOrt,
                W4b: o.w4b,
                W8: o.w8,
                sohle: o.sohle,
                bau: o.bau,
                W7: o.w7,
                W6: o.w6,
            },
            (k, v) => (/^(taeter|je|kiFehler)$/.test(k) ? undefined : v)
        ) +
        (o.w9 ? ` · W9 ${JSON.stringify(w9Zeile(o.w9))}` : "")
    );
}

hauptLauf(async () => {
    const browser = await starteBrowser({ art: BILD ? "linse" : "null", frist: 900000 });
    const t0 = Date.now();
    let rot = 0;
    let selbst = [];
    let welten = 0;
    try {
        const lauf = async (inj, phasen, platz) => {
            const z = { patch: inj && BASIS[inj] ? BASIS[inj] : null, fehler: [], angewandt: new Set() };
            platz.z = z;
            // je Lauf ein eigener Browser-Kontext: kein Speicherstand (Save, IndexedDB) des Vorlaufs reist in die nächste
            // Welt (ein gespeichertes Dorf stünde sonst unter dem neu gegründeten)
            const kontext = await browser.createBrowserContext();
            const page = await kontext.newPage();
            page.setDefaultTimeout(880000);
            if (!BILD) await nullRenderer(page);
            // das Bild misst Schatten: auf dem Software-Adapter das Holz nah (kienspan schaltet die Schatten aus)
            const holz = BILD && require("./lib/software-gpu.cjs").linsenGpu() === "software" ? "?holz=nah" : "";
            await platz.server.zeige(page, 180000, "index.html" + holz, "networkidle0");
            await warteAufWelt(page, 180000);
            await page.evaluate(() =>
                window.__weltStehtNach(() => {
                    try {
                        window.anazhRealm._gameLoopTick(performance.now());
                    } catch {}
                })
            );
            if (BILD) await page.evaluate(require("./lib/ausgabe-aufnahme.cjs").AUSGABE_INSTALL + WASSER_INSTALL);
            const o = await page.evaluate(proben, phasen);
            await kontext.close();
            platz.z = null;
            for (const zeile of z.patch || []) {
                const [d, g] = patchZiel(zeile);
                if (!z.angewandt.has(d + "|" + g)) z.fehler.push(`nie angewandt: ${d} („${g.slice(0, 60)}…")`);
            }
            return { o, pf: z.fehler.slice() };
        };
        // die Welten im Pool: höchstens PARALLEL zugleich, die Ergebnisse in der Reihenfolge der Aufträge
        const pool = async (auftraege) => {
            const erg = new Array(auftraege.length);
            let naechster = 0;
            const arbeiter = async (k) => {
                // der Platz k: EIN Server, der den Patch der Welt liefert, die gerade auf ihm fährt
                const platz = { z: null };
                const server = machServer(platz);
                platz.server = await server.lausche(PORT_BASIS ? PORT_BASIS + k : 0);
                try {
                    while (naechster < auftraege.length) {
                        const i = naechster++;
                        erg[i] = await auftraege[i](platz);
                    }
                } finally {
                    server.close();
                }
            };
            await Promise.all(Array.from({ length: Math.min(PARALLEL, auftraege.length) }, (_, k) => arbeiter(k)));
            return erg;
        };
        if (SELBST) {
            // je Täter: die Phase seiner Welt (sie fährt nur, was ihr Selbsttest rot machen soll — der Hauptlauf fährt alle),
            // dann die Proben, die er rot macht
            const soll = {
                huelle: ["haus", "W10 Spielgang", "W5 Kollision"],
                obb: ["haus", "W5 Kollision"],
                grundriss: ["w4", "W4 Grundriss"],
                streu: ["w4b", "W4b Fern-Streu"],
                streuwand: ["w4b", "W4b Neubau"],
                promotion: ["w4b", "W4b Promotion"],
                nahstreu: ["w4b", "W4b Nah-Streu"],
                lichtung: ["lichtung", "W8 Lichtung"],
                schwebe: ["sohle", "W8 Sohle"],
                platz: ["lichtung", "W8 Lichtung"],
                baugrund: ["bau", "W8 Bau"],
                weg: ["w4", "W4 Weg"],
                dach: ["sohle", "W8 Sohle"],
                lichtungwald: ["lichtung", "W8 Lichtung"],
                kihain: ["lichtung", "W8 Lichtung", "W8 Hain im Haus"],
                stumm: ["lichtung", "W8 Absage"],
                fernstufe: ["w6", "W6 Fernstufe"],
                kern: ["w6", "W6 Kern-Hülle"],
                bauwand: ["haus", "W7 Bau im Bau"],
                stab: ["haus", "W10 Anti-Clip-Hub"],
                kletter: ["haus", "W10 Spielgang"],
                startslot: ["start", "W10 Start-Dorf"],
                tierbau: ["haus", "W10 Tier im Haus"],
                wand: ["haus", "W10 Wand"],
                grundkeller: ["grund", "W9 Dichte"],
                grundbueschel: ["grund", "W9 Büschel"],
                abbau: ["grund", "W9 Abbau"],
                grundplan: ["grund", "W9 Plan"],
                vorplatz: ["grund", "W9 Slot"],
                waise: ["grund", "W9 Waise"],
                ausstattung: ["grund", "W9 Zug|W9 Ausstattung"],
                zugreload: ["grund", "W9 Waise", "W9 Zug"],
                verblassen: ["grund", "W9 Waise"],
            };
            selbst = Object.keys(soll)
                .filter((k) => !NUR.length || NUR.includes(k))
                .map((inj) => ({ inj, soll: soll[inj].slice(1), phasen: soll[inj].slice(0, 1) }));
        }
        // der Hauptlauf zuerst (die längsten Welten), dann die Selbsttests — alle im Pool; der Hauptlauf in zwei Welten: das
        // Start-Dorf wächst in der Phase start, in der anderen lässt W9 Waise es wachsen
        const haupt = (
            BILD
                ? [["grund", "bild", "start"]]
                : PHASEN.length
                  ? [PHASEN]
                  : [
                        ["haus", "start"],
                        ["sohle", "lichtung", "bau", "w4", "w4b", "w6", "grund"],
                    ]
        ).map((ph) => (platz) => lauf(null, ph, platz));
        const auftraege = [...haupt, ...selbst.map((s) => (platz) => lauf(s.inj, s.phasen, platz))];
        const meine = auftraege.map((_, i) => i).filter(imTeil);
        const erg = new Array(auftraege.length);
        (await pool(meine.map((i) => auftraege[i]))).forEach((e, j) => (erg[meine[j]] = e));
        welten = meine.length;
        const selbstErg = erg.slice(haupt.length);
        if (selbst.length) {
            for (let i = 0; i < selbst.length; i++) {
                if (!selbstErg[i]) continue; // die Welt eines anderen Teils
                const { inj } = selbst[i];
                const soll = { [inj]: selbst[i].soll };
                const { o, pf } = selbstErg[i];
                const f = urteil(o);
                const trifft = (x) => f.find((y) => x.split("|").some((a) => y.startsWith(a)));
                const fehlt = soll[inj].filter((x) => !trifft(x));
                const ok = pf.length === 0 && fehlt.length === 0;
                const beleg = soll[inj]
                    .map((x) => trifft(x) || `${x}: grün (blind! ${f.join(" | ") || "kein Urteil"})`)
                    .join(" | ");
                console.log(
                    `  ${ok ? "✅" : "❌"} Selbsttest „${inj}" macht ${soll[inj].join(" + ")} rot — ${pf.length ? pf.join("; ") : beleg}`
                );
                if (!ok) rot++;
            }
        }
        for (const hl of erg.slice(0, haupt.length).filter(Boolean)) {
            const { o } = hl;
            if (o.w9) {
                fs.mkdirSync(path.join(ROOT, "artifacts/haus-welt"), { recursive: true });
                // je Bild eine Datei (artifacts/haus-welt/<name>.png), das JSON trägt den Namen
                const bild = (x, name) => {
                    for (const [v, png] of [].concat(x.png || []).entries())
                        pngDatei(path.join(ROOT, `artifacts/haus-welt/${name}-${v}.png`), png);
                    x.png = name;
                };
                o.w9.haeuser.forEach((h, i) => {
                    if (h.png) bild(h, `grund-${i}-aussen`);
                    (h.koerper || []).forEach((b, j) => bild(b, `grund-${i}-${j}-${b.art}`));
                    if (h.third) bild(h.third, `grund-${i}-third`);
                });
                for (const w of o.w9.wasser || []) for (const z of w.blicke) bild(z, `wasser-${w.ort}-${z.sicht}`);
            }
            console.log("  " + zeile(o));
            const f = urteil(o);
            for (const x of f) console.log("  ❌ " + x);
            rot += f.length;
            if (process.env.HAUS_WELT_JSON) fs.writeFileSync(process.env.HAUS_WELT_JSON, JSON.stringify(o, null, 1));
        }
    } finally {
        await browser.close();
    }
    console.log(
        `  ${welten} Welten${TEIL ? ` (Teil ${TEIL.k}/${TEIL.n})` : ""}, ${PARALLEL} zugleich, ${Math.round((Date.now() - t0) / 1000)} s`
    );
    console.log(rot ? `❌ gate:haus-welt ROT (${rot})` : "✅ gate:haus-welt grün");
    process.exit(rot ? 1 : 0);
});
