#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-wasser-leben.cjs — DIE WASSER-WAND der Leben-Prüfung (Welle L, Klassen Q6 + Q7). Befund 06.10. (sichtbares
// Fenster, echte Radeon, artifacts/profiband/leben/befund-wasser-fluss.md), jede Zahl hier zuerst ROT am Vorher gemessen:
//   F (Q7-Gestalt)  der Fluss-Spiegel steigt längs der Mitte (14,2 % der 2-m-Schritte, 133 m Anstieg) und wölbt sich quer
//                   (Spanne der Lauf-Fläche über die Kanal-Breite p90 9,7 m) — ein Fluss fließt nie bergauf, quer liegt
//                   er waagrecht; ein Wasserfall steht EINMAL je Ort (19 Einträge, 13 Orte).
//   K (Q6-Körper)   wer vom Ostufer in den See (Spiegel 22,93, 8 m tief) geht, geht am Grund (966 Frames Brustkorb unter
//                   dem Spiegel UND geerdet, bis 4,68 m tief); in Ruhe treibt der Körper auf dem Zell-Dach (Füße 0,35 m
//                   unter dem Spiegel statt der Brustkorb-Linie 1,22 m); Kraulen 0,141 m/s = 14,4 % des Gesetzes; das
//                   Eintauchen aus 6 m ist stumm (0 Landungen).
//   B (Q7-Bild)     das Wasser-Material auf einem Fluss-Bogen: Kanten-Dichte der Stromschnelle bei Wasser-Uhr 3600 s =
//                   5,5 × der bei 60 s, der ruhige Fluss 59,9 gegen 10,5 (der Phasen-Zerfall, das weiße Zebra); 46 % des
//                   ruhigen Flusses schaumbedeckt (Strähnen-Schaum ohne Gesetz). Der Sturm-Regen allein auf Schwarz:
//                   0 Schlieren (eine Punktwolke, WebGPU zeichnet Punkte 1 Pixel groß), lit 0,2 % der Pixel.
//   U (Q7-Gestalt)  die Ufer-Farbe quer zum Fluss: 34 Sprünge (Luma bis 0,223 je 2 cm) — der Bezug der Ufer-Bänder
//                   sprang am Ende des Fluss-Spiegels auf den Meeresspiegel; der Worker färbte 2137 von 7578 Ufer-
//                   Vertices anders als der Main (die Feuchte las eine Halbbreite, die kein Segment trägt).
// Die Proben rufen die Chokepoints selbst (scripts/lib/wasser-linse.cjs): den Spiegel (`_waterRunSurfaceAt` vorher, `_atlasWaterLevelAt` nachher), den
// Sim-Schritt `_stepFixedSim`, den Schritt-Klang `_schrittKlangTick`, das ECHTE Wasser-Material.
//
//   node scripts/diag-wasser-leben.cjs              F + K (Null-Renderer, Mess-Wiese)      npm run gate:wasser-leben
//   node scripts/diag-wasser-leben.cjs --bild       B (WebGPU: swiftshader; --echt die Hardware-GPU)
//   node scripts/diag-wasser-leben.cjs --selftest   das Urteil gegen jeden Täter, ohne Browser (in `npm run check`)
// Port: WASSER_LEBEN_PORT (Standard 4623).
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const SCHWELLE = {
    steigend: 0, // Anteil der 2-m-Schritte, deren Lauf-Fläche > 5 cm steigt
    buckelP90: 0.05, // m — Wölbung des Querschnitts: Mitte gegen das Mittel der Ränder (p90 der Fluss-Punkte)
    lageToleranz: 0.15, // m — Füße unter dem Spiegel in Ruhe gegen die Brustkorb-Linie des Gesetzes
    kraulAnteil: 0.9, // Kraul-Tempo gegen speed × schwimmen.speedMul
    tierLinie: 0.1, // m — Sohle unter dem Spiegel gegen die Wasserlinie der Gestalt (Schultergelenk)
    kantenVerhaeltnis: 1.3, // Kanten-Dichte der Stromschnelle bei Wasser-Uhr 3600 s gegen 60 s
    kantenRuhig: 5, // Kanten-Dichte des ruhigen Flusses bei 3600 s (mittlere Luma-Stufe je Pixel)
    hellRuhig: 0.05, // Schaum-Deckung des ruhigen Flusses (kein Ufer, kein Steil-Lauf: das Gesetz schäumt dort nicht)
    sturm: 1.3, // Kanten-Dichte des ruhigen Flusses im Sturm gegen die bei Sonne (das Gesetz: Amplitude × (w0 + w1·Wind))
    schlieren: 50, // senkrechte Läufe ≥ 4 lit Pixel des Sturm-Regens allein auf Schwarz (640 × 360)
    neigung: 0.2, // (rechts − links) / (rechts + links) der diagonalen Lauf-Nachbarn quer zum Wind
};

// Das Urteil über einen Befund: Liste der Verstöße (leer = grün). Rein — im Selbsttest wie im Lauf.
function urteil(b) {
    const v = [];
    const S = SCHWELLE;
    if (b.fluss) {
        const f = b.fluss;
        if (f.fehler) v.push(`F: ${f.fehler}`);
        else {
            if (!(f.schritte > 1000))
                v.push(`F LEER: nur ${f.schritte} Fluss-Schritte gemessen (die Probe prüfte nichts)`);
            if (!(f.anteilSteigend <= S.steigend))
                v.push(
                    `F1 BERGAUF: ${(f.anteilSteigend * 100).toFixed(1)} % der 2-m-Schritte steigen (${f.steigend} von ${f.schritte}, ` +
                        `${f.anstiegM} m Anstieg, Spitze ${f.maxAnstiegM} m)`
                );
            if (!(f.buckelP90M <= S.buckelP90))
                v.push(
                    `F2 BUCKEL: der Querschnitt wölbt sich p90 ${f.buckelP90M} m (max ${f.buckelMaxM} m; Spanne p90 ${f.querP90M} m) ` +
                        "statt waagrecht"
                );
            if (f.wasserfaelle !== f.wasserfallOrte)
                v.push(`F4 DOPPEL: ${f.wasserfaelle} Wasserfall-Einträge an ${f.wasserfallOrte} Orten`);
        }
    }
    if (b.kanal) {
        const k = b.kanal;
        if (k.fehler) v.push(`F5 SPIEGEL: ${k.fehler}`);
        else if (!(k.zellen > 1000)) v.push(`F5 LEER: nur ${k.zellen} Kanal-Zellen verglichen`);
        else if (k.abweichend > 0)
            v.push(
                `F5 ZWEI KANÄLE: ${k.abweichend} von ${k.zellen} Dichte-Zellen weichen Main ↔ Worker ab (max ${k.maxDelta})`
            );
    }
    if (b.uferFarbe) {
        const u = b.uferFarbe;
        if (u.fehler) v.push(`U: ${u.fehler}`);
        else {
            if (!(u.schritte > 5000)) v.push(`U LEER: nur ${u.schritte} Ufer-Schritte gemessen`);
            if (u.spruenge > 0)
                v.push(
                    `U1 UFER-SPRUNG: die Boden-Farbe springt quer zum Fluss ${u.spruenge}-mal (Luma-Stufe bis ${u.maxSprung} ` +
                        `je 2 cm, z. B. ${JSON.stringify(u.beispiele[0] || null)})`
                );
            const p = u.paritaet;
            if (!p || !(p.vertices > 1000)) v.push("U2 LEER: die Farb-Parität verglich keinen Ufer-Chunk");
            else if (p.abweichend > 0)
                v.push(
                    `U2 ZWEI FARBEN: ${p.abweichend} von ${p.vertices} Ufer-Vertices färbt der Worker anders als der Main ` +
                        `(max ${p.maxDiff})`
                );
        }
    }
    if (b.regen) {
        const g = b.regen;
        if (g.fehler) v.push(`B4: ${g.fehler}`);
        else {
            if (!(g.schlieren >= S.schlieren))
                v.push(`B4 REGEN: der Sturm zeigt ${g.schlieren} Schlieren (lit ${g.litAnteil} der Pixel)`);
            else if (!(Math.abs(g.neigung) >= S.neigung))
                v.push(`B5 SENKRECHT: quer zum Sturm fallen die Schlieren senkrecht (Neigung ${g.neigung})`);
        }
    }
    if (b.ufer) {
        const u = b.ufer;
        if (u.fehler) v.push(`K8: ${u.fehler}`);
        else if (!(u.trocken > 20)) v.push(`K8 LEER: nur ${u.trocken} trockene Ufer-Proben`);
        else if (u.geflutet > 0)
            v.push(
                `K8 UFER-FLUT: ${u.geflutet} von ${u.trocken} trockenen Ufer-Proben tragen Körper-Wasser (bis ${u.maxFlutM} m über dem Gras)`
            );
    }
    if (b.koerper) {
        const k = b.koerper;
        if (k.fehler) v.push(`K: ${k.fehler}`);
        else {
            const h = k.hinein || {};
            if (!(h.schwimmFrames > 0)) v.push("K LEER: der Gang erreichte kein Wasser (die Probe prüfte nichts)");
            if (h.tiefGeerdet > 0)
                v.push(
                    `K1 AM GRUND: ${h.tiefGeerdet} Frames Brustkorb unter dem Spiegel UND geerdet (bis ${h.maxTiefeGeerdetM} m tief)`
                );
            if (h.augenUnterGeerdet > 0)
                v.push(`K1 AM GRUND: ${h.augenUnterGeerdet} Frames Augen unter Wasser UND geerdet`);
            const l = k.lage || {};
            if (!(Math.abs(l.fussUnterSpiegelP50 - l.sollFussUnterSpiegel) <= S.lageToleranz))
                v.push(
                    `K2 ZELL-DACH: in Ruhe die Füße ${l.fussUnterSpiegelP50} m unter dem Spiegel, die Brustkorb-Linie verlangt ` +
                        `${l.sollFussUnterSpiegel} m`
                );
            if (l.augenUnter > 0) v.push(`K2 UNTERGEHEN: ${l.augenUnter} Ruhe-Frames mit den Augen unter Wasser`);
            const c = k.kraulen || {};
            if (!(c.anteil >= S.kraulAnteil))
                v.push(
                    `K3 KRIECHEN: Kraulen ${c.mps} m/s = ${Math.round((c.anteil || 0) * 100)} % des Gesetzes (${c.soll} m/s)`
                );
            const e = k.eintauchen || {};
            if (!e.landung) v.push(`K4 STUMM: das Eintauchen mit ${e.eintauchVy} m/s löst keine Landung aus`);
            else if (e.landung.material !== "wasser")
                v.push(`K4 STUMM: die Landung klingt „${e.landung.material}" statt „wasser"`);
            const tiere = Array.isArray(k.tier) ? k.tier : [];
            if (tiere.length < 8) v.push(`K6 LEER: nur ${tiere.length} Tier-Proben (4 Arten × nah/fern verlangt)`);
            for (const t of tiere) {
                if (t.amGrund)
                    v.push(
                        `K6 AM GRUND: ${t.seele} in ${t.abstand} m steht am Seegrund (Sohle ${t.sohleUnterSpiegel} m unter dem Spiegel)`
                    );
                else if (!(Math.abs(t.sohleUnterSpiegel - t.wasserlinie) <= S.tierLinie))
                    v.push(
                        `K6 LAGE: ${t.seele} in ${t.abstand} m treibt mit der Sohle ${t.sohleUnterSpiegel} m unter dem Spiegel, ` +
                            `ihre Wasserlinie (Schultergelenk) liegt bei ${t.wasserlinie} m`
                    );
            }
            if (!k.peer) v.push("K7 MITSPIELER: die Peer-Probe lief nicht");
            else if (!(Math.abs(k.peer.lehne) > 0.05))
                v.push(`K7 MITSPIELER: der Peer-Körper an der Brustkorb-Linie schwimmt nicht (Lehne ${k.peer.lehne})`);
            const li = k.licht;
            if (!li || !li.himmelVor || !li.himmelGetaucht)
                v.push("K9 LEER: die Licht-Probe lief nicht (Luft oder Himmels-Umgebung fehlt)");
            else {
                if (!(li.nachtUnten < li.nachtOben))
                    v.push(
                        `K9 NACHT: unter Wasser ist die Mitternacht heller (${li.nachtUnten}) als die Luft darüber (${li.nachtOben})`
                    );
                if (!(li.mittagUnten > li.nachtUnten * 2))
                    v.push(
                        `K9 LITERAL: das Wasser kennt Tag und Nacht nicht (Mittag ${li.mittagUnten}, Mitternacht ${li.nachtUnten})`
                    );
                const dh = Math.max(...li.himmelVor.map((x, i) => Math.abs(x - li.himmelGetaucht[i])));
                if (dh > 2)
                    v.push(
                        `K9 HIMMEL: der Tauchgang färbt die Himmels-Umgebung (${li.himmelVor.join("/")} → ${li.himmelGetaucht.join("/")})`
                    );
            }
            const m = k.medium;
            if (!m) v.push("K5 MEDIUM: die Luft-Probe lief nicht (keine Kamera oder Luft)");
            else {
                if (m.kameraUnten !== true)
                    v.push(
                        "K5 MEDIUM: die Kamera 3 m unter dem Spiegel sieht klare Luft (die Luft folgt den Augen des Körpers)"
                    );
                if (m.kameraOben !== false)
                    v.push(
                        "K5 MEDIUM: die Kamera 10 m über dem Spiegel sieht Unterwasser (die Augen des Körpers sind getaucht)"
                    );
            }
        }
    }
    if (b.bild) {
        const g = b.bild;
        if (g.fehler) v.push(`B: ${g.fehler}`);
        else {
            const a = g.uhr60 || {},
                z = g.uhr3600 || {};
            if (!(a.ruhig && a.ruhig.pixel > 1000 && a.schnelle && a.schnelle.pixel > 1000))
                v.push("B LEER: der Fluss-Bogen deckt keine Pixel (die Probe prüfte nichts)");
            else {
                if (!(g.kantenVerhaeltnis <= S.kantenVerhaeltnis))
                    v.push(
                        `B2 ZEBRA: Kanten-Dichte der Stromschnelle bei Wasser-Uhr 3600 s ${z.schnelle.kantenDichte} = ` +
                            `${g.kantenVerhaeltnis} × der bei 60 s (${a.schnelle.kantenDichte})`
                    );
                if (!(z.ruhig.kantenDichte <= S.kantenRuhig))
                    v.push(
                        `B2 ZEBRA: der ruhige Fluss trägt bei Wasser-Uhr 3600 s Kanten-Dichte ${z.ruhig.kantenDichte} ` +
                            `(bei 60 s ${a.ruhig.kantenDichte})`
                    );
                if (!(g.sturmVerhaeltnis >= S.sturm))
                    v.push(
                        `B3 STURM: der Sturm bewegt das Wasser nicht (Kanten-Dichte im Sturm ${g.sturmVerhaeltnis} × der ruhigen)`
                    );
                if (!(a.ruhig.hellAnteil <= S.hellRuhig))
                    v.push(
                        `B1 SCHAUM: ${(a.ruhig.hellAnteil * 100).toFixed(1)} % des ruhigen Flusses schaumbedeckt ohne Gesetz-Grund`
                    );
            }
        }
    }
    if (b.seitenFehler && b.seitenFehler.length) v.push(`SEITE: ${b.seitenFehler[0]}`);
    return v;
}

// ── SELBSTTEST: ein grüner Befund bleibt grün, jeder Täter fällt beim Namen rot ──
function selbsttest() {
    const gut = {
        fluss: {
            schritte: 3800,
            steigend: 0,
            anteilSteigend: 0,
            anstiegM: 0,
            maxAnstiegM: 0,
            querP90M: 0.01,
            querMaxM: 0.04,
            buckelP90M: 0.01,
            buckelMaxM: 0.03,
            wasserfaelle: 9,
            wasserfallOrte: 9,
        },
        kanal: { punkte: 6, zellen: 18000, abweichend: 0, maxDelta: 0 },
        ufer: { trocken: 180, geflutet: 0, maxFlutM: 0 },
        uferFarbe: {
            proben: 24,
            schritte: 48000,
            spruenge: 0,
            maxSprung: 0.01,
            beispiele: [],
            paritaet: { vertices: 6500, abweichend: 0, maxDiff: 0 },
        },
        regen: { litAnteil: 0.13, schlieren: 800, neigung: 0.56 },
        koerper: {
            hinein: { tiefGeerdet: 0, augenUnterGeerdet: 0, maxTiefeGeerdetM: 0, schwimmFrames: 400 },
            lage: { fussUnterSpiegelP50: 1.2, sollFussUnterSpiegel: 1.224, augenUnter: 0 },
            kraulen: { mps: 0.97, soll: 0.977, anteil: 0.99 },
            eintauchen: { landung: { material: "wasser" }, eintauchVy: -10.6 },
            medium: { kameraUnten: true, kameraOben: false },
            tier: ["wesen", "wolf", "fuchs", "baer"].flatMap((seele) =>
                [8, 120].map((abstand) => ({
                    seele,
                    abstand,
                    sohleUnterSpiegel: 0.6,
                    wasserlinie: 0.6,
                    amGrund: false,
                }))
            ),
            peer: { lehne: 0.4, meshKind: "soul" },
            licht: {
                nachtOben: 0.03,
                nachtUnten: 0.004,
                mittagOben: 0.9,
                mittagUnten: 0.5,
                himmelVor: [191, 218, 237],
                himmelGetaucht: [191, 218, 237],
            },
        },
        bild: {
            uhr60: {
                ruhig: { kantenDichte: 1, hellAnteil: 0, pixel: 20000 },
                schnelle: { kantenDichte: 20, pixel: 20000 },
            },
            uhr3600: { ruhig: { kantenDichte: 1 }, schnelle: { kantenDichte: 21 } },
            kantenVerhaeltnis: 1.05,
            sturmVerhaeltnis: 1.8,
        },
    };
    const kopie = () => JSON.parse(JSON.stringify(gut));
    const taeter = [
        ["F1 BERGAUF", (b) => Object.assign(b.fluss, { steigend: 551, anteilSteigend: 0.142, anstiegM: 133.2 })],
        ["F2 BUCKEL", (b) => Object.assign(b.fluss, { buckelP90M: 1.2, querP90M: 9.65 })],
        ["F4 DOPPEL", (b) => (b.fluss.wasserfaelle = 19)],
        ["F LEER", (b) => (b.fluss.schritte = 0)],
        ["F5 ZWEI KANÄLE", (b) => Object.assign(b.kanal, { abweichend: 412, maxDelta: 3.1 })],
        ["K1 AM GRUND", (b) => Object.assign(b.koerper.hinein, { tiefGeerdet: 966, maxTiefeGeerdetM: 4.68 })],
        ["K2 ZELL-DACH", (b) => (b.koerper.lage.fussUnterSpiegelP50 = 0.352)],
        ["K3 KRIECHEN", (b) => Object.assign(b.koerper.kraulen, { mps: 0.141, anteil: 0.144 })],
        ["K4 STUMM", (b) => (b.koerper.eintauchen.landung = null)],
        ["K LEER", (b) => (b.koerper.hinein.schwimmFrames = 0)],
        ["K5 MEDIUM", (b) => (b.koerper.medium = { kameraUnten: false, kameraOben: true })],
        ["K6 AM GRUND", (b) => Object.assign(b.koerper.tier[1], { amGrund: true, sohleUnterSpiegel: 8 })],
        ["K6 LAGE", (b) => Object.assign(b.koerper.tier[0], { sohleUnterSpiegel: 0.3, wasserlinie: 0.87 })],
        ["K6 LEER", (b) => (b.koerper.tier = [])],
        ["K7 MITSPIELER", (b) => (b.koerper.peer.lehne = 0)],
        ["K9 NACHT", (b) => Object.assign(b.koerper.licht, { nachtUnten: 0.17 })],
        ["K9 LITERAL", (b) => Object.assign(b.koerper.licht, { nachtUnten: 0.17, mittagUnten: 0.17, nachtOben: 0.5 })],
        ["K9 HIMMEL", (b) => (b.koerper.licht.himmelGetaucht = [81, 132, 170])],
        ["K9 LEER", (b) => delete b.koerper.licht],
        ["K8 UFER-FLUT", (b) => Object.assign(b.ufer, { geflutet: 37, maxFlutM: 3.15 })],
        ["K8 LEER", (b) => (b.ufer.trocken = 0)],
        [
            "U1 UFER-SPRUNG",
            (b) => Object.assign(b.uferFarbe, { spruenge: 34, maxSprung: 0.223, beispiele: [[607.8, -840, 8.24]] }),
        ],
        ["U LEER", (b) => (b.uferFarbe.schritte = 0)],
        ["U2 ZWEI FARBEN", (b) => Object.assign(b.uferFarbe.paritaet, { abweichend: 2137, maxDiff: 0.056 })],
        ["U2 LEER", (b) => (b.uferFarbe.paritaet = null)],
        ["B4 REGEN", (b) => Object.assign(b.regen, { schlieren: 0, litAnteil: 0.002 })],
        ["B5 SENKRECHT", (b) => (b.regen.neigung = 0.02)],
        ["B2 ZEBRA", (b) => Object.assign(b.bild, { kantenVerhaeltnis: 5.8 })],
        ["B1 SCHAUM", (b) => (b.bild.uhr60.ruhig.hellAnteil = 0.6)],
        ["B3 STURM", (b) => (b.bild.sturmVerhaeltnis = 1)],
        ["B2 ZEBRA: der ruhige", (b) => (b.bild.uhr3600.ruhig.kantenDichte = 63.4)],
        ["B LEER", (b) => (b.bild.uhr60.schnelle.pixel = 0)],
        ["SEITE", (b) => (b.seitenFehler = ["TypeError: x"])],
    ];
    let rot = 0;
    const g = urteil(gut);
    if (g.length) {
        console.log("  ❌ der grüne Befund fällt rot:", g);
        rot++;
    } else console.log("  ✅ der grüne Befund bleibt grün");
    for (const [name, mach] of taeter) {
        const b = kopie();
        mach(b);
        const v = urteil(b);
        const ok = v.some((x) => x.startsWith(name));
        console.log(
            `  ${ok ? "✅" : "❌"} Täter ${name} → ${ok ? v.find((x) => x.startsWith(name)) : "nicht erkannt: " + JSON.stringify(v)}`
        );
        if (!ok) rot++;
    }
    console.log(rot ? `SELBSTTEST ROT (${rot})` : "SELBSTTEST GRÜN");
    process.exit(rot ? 1 : 0);
}

if (process.argv.includes("--selftest")) selbsttest();
else lauf();

async function lauf() {
    const puppeteer = require("puppeteer");
    const http = require("http");
    const fs = require("fs");
    const path = require("path");
    const { WASSER_INSTALL } = require("./lib/wasser-linse.cjs");
    const { softwareWebGpuArgs, echteWebGpuArgs } = require("./lib/software-gpu.cjs");
    const BILD = process.argv.includes("--bild");
    const ECHT = process.argv.includes("--echt");
    const PORT = Number(process.env.WASSER_LEBEN_PORT || 4623);
    const root = path.resolve(__dirname, "..");
    const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".wasm": "application/wasm",
        ".json": "application/json",
        ".css": "text/css",
        ".png": "image/png",
        ".woff2": "font/woff2",
    };
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/") p = "/index.html";
        const fp = path.join(root, p);
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: ECHT ? false : "new",
        protocolTimeout: 900000,
        args: BILD ? (ECHT ? echteWebGpuArgs() : softwareWebGpuArgs()) : ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    if (BILD) await page.setViewport({ width: 640, height: 360 });
    const seitenFehler = [];
    page.on("pageerror", (e) => seitenFehler.push((e.stack || e.message || String(e)).split("\n")[0]));
    if (!BILD)
        await page.evaluateOnNewDocument(() => {
            window.__anazhHeadlessNullRenderer = true;
        });
    let befund = { seitenFehler };
    let exit = 1;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html${BILD && !ECHT ? "?holz=kienspan" : ""}`, {
            waitUntil: "domcontentloaded",
            timeout: 120000,
        });
        await page.waitForFunction(
            () =>
                window.anazhRealm &&
                typeof window.anazhRealm._gameLoopTick === "function" &&
                window.anazhRealm.state.hydrosphere &&
                window.anazhRealm.state.hydrosphere.ready,
            { timeout: 600000, polling: 250 }
        );
        await page.evaluate(WASSER_INSTALL);
        if (BILD) {
            const ordner = (() => {
                const i = process.argv.indexOf("--bilder");
                return i >= 0 ? process.argv[i + 1] : null;
            })();
            befund.bild = await page.evaluate((png) => window.__wasserBild({ png }), !!ordner);
            befund.regen = await page.evaluate(() => window.__wasserRegen({}));
            for (const k of ["png60", "png3600"]) {
                if (ordner && befund.bild[k]) {
                    fs.mkdirSync(ordner, { recursive: true });
                    fs.writeFileSync(
                        path.join(ordner, `wasser-bild-${k.slice(3)}.png`),
                        Buffer.from(befund.bild[k].split(",")[1], "base64")
                    );
                }
                delete befund.bild[k];
            }
        } else {
            // Die Welt an das Ostufer des Sees der Mess-Wiese streamen (Sync-Bau, Worker ausgehängt — wie der Playtest):
            // die Wasser-Zellen der Chunks sind ein Leser der Körper-Wahrheit von gestern.
            await page.evaluate(async () => {
                const r = window.anazhRealm;
                const st = r.state;
                if (st.renderer) {
                    st.renderer.render = function () {};
                    if (typeof st.renderer.renderAsync === "function")
                        st.renderer.renderAsync = () => Promise.resolve();
                }
                st.postProcessingFailed = true;
                st.playerMesh.position.set(-890, r._voxelSurfaceY(-890, -650) + 0.6, -650);
                const worker = st.voxelWorker;
                st.voxelWorker = null;
                const start = performance.now();
                let last = -1,
                    still = performance.now();
                for (;;) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    const n = st.voxelChunks ? st.voxelChunks.size : 0;
                    if (n !== last) {
                        last = n;
                        still = performance.now();
                    }
                    if ((n >= 9 && performance.now() - still > 1500) || performance.now() - start > 90000) break;
                    await new Promise((res) => setTimeout(res, 0));
                }
                st.voxelWorker = worker;
            });
            befund.fluss = await page.evaluate(() => window.__wasserFluss());
            befund.kanal = await page.evaluate(() => window.__wasserKanalParitaet({}));
            befund.koerper = await page.evaluate(() => window.__wasserKoerper({}));
            befund.ufer = await page.evaluate(() => window.__wasserUfer({}));
            befund.uferFarbe = await page.evaluate(() => window.__wasserUferFarbe({}));
        }
        const v = urteil(befund);
        console.log(JSON.stringify(Object.assign({}, befund, { seitenFehler: seitenFehler.slice(0, 5) }), null, 1));
        if (v.length) {
            console.log(`\nWASSER-LEBEN ROT (${v.length}):`);
            for (const x of v) console.log("  ❌ " + x);
        } else console.log("\nWASSER-LEBEN GRÜN");
        exit = v.length ? 1 : 0;
    } catch (e) {
        console.log("WASSER-LEBEN ABBRUCH:", (e && e.message) || e);
        exit = 1;
    } finally {
        await browser.close().catch(() => {});
        server.close();
    }
    process.exit(exit);
}
