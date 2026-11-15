"use strict";
// scripts/lib/licht-proben.cjs — DIE PROBEN DES LICHTS (`werkbank licht --tag|--kontakt|--naesse|--tafeln|--luft|--laub`, w28-werkbank-teilt):
// je Gang die Welt-Seite einer Licht-Linse (scripts/lib/licht-linsen.cjs: Seiten-Probe, Urteil, Selbsttest) über die Rufe der Werkbank
// (`rufe`, `evalRuf`, `umstellen`, `eigeneWelt`) — die Bilanz ohne Schalter (`werkbank licht [--uhr u] [--ist <id>]`) ist der Weg
// `/licht` der Werkbank. Jeder Gang endet mit seinem Urteil (Exit 0 nur GRÜN); `--selbsttest` urteilt ohne Welt.
const { selbsttestEnde, pngDatei, path, jsonLesen } = require("./welt-boot.cjs");
const LL = require("./licht-linsen.cjs");
// die Fälle eines Selbsttests [ist, soll] (soll: Wert oder Muster), die nicht treffen — Nässe und Laub-Licht
const istSoll = (f) => f.filter(([ist, soll]) => (soll instanceof RegExp ? !soll.test(ist) : ist !== soll));

// die Schalter der Gänge, in der Reihe, in der sie gelten (der erste, den die Befehlszeile trägt)
const LICHT_GAENGE = ["tag", "kontakt", "naesse", "tafeln", "luft", "laub"];
async function lichtGang({ argv, opt, hat, SELBST, rufe, evalRuf, umstellen, ergebnis, endeMit, eigeneWelt, dateiAb, urteilEnde }) {
    if (hat("tag")) {
        // DIE TAG-ACHSE (S7, W7): je Messort (`--orte`, Standard der Spawn und die Mess-Wiese in Ego; die Sicht nach dem
        // Doppelpunkt, `wiese:third`) die Uhr-Kurve aus dem Ausgabe-Pfad (`__tagKurve`), ihre Nachtastung (`tagFeinUhren`) und ihr
        // Urteil `tagKurveUrteil` (licht-linsen.cjs); `--kurz` und `--eigen` die Wand der Karte, `--ordner d` die Bilder,
        // `--datei f.json` die Messung.
        const halt = await eigeneWelt();
        const welt = {};
        const kurve =(uhren, png) => evalRuf(`return await __tagKurve(${JSON.stringify({ uhren, png })});`);
        try {
            for (const wahl of String(opt("--orte", "genesis,wiese")).split(",")) {
                const [ort, sicht = "ego"] = wahl.split(":");
                await umstellen({ ort, sicht });
                const a = await kurve(hat("kurz") ? LL.TAG_UHREN_KURZ : LL.TAG_UHREN, !!opt("--ordner"));
                const m = (welt[wahl] = ergebnis(a));
                for (const z of m.zeilen || []) {
                    if (z.png) pngDatei(path.resolve(opt("--ordner"), `tag-${wahl.replace(":", "-")}-${z.uhr}.png`), z.png);
                    delete z.png;
                }
                const f = m.zeilen && (await kurve(LL.tagFeinUhren(m.zeilen), false)).ergebnis;
                if (f) (m.fein = f.zeilen), Object.assign(m.schreiber, f.schreiber);
            }
        } finally {
            if (halt) await halt();
        }
        dateiAb(welt);
        const u = LL.tagKurveUrteil(welt);
        console.log(JSON.stringify(u.kurven, null, 1));
        // je Ort die sechs Zahlen und sein Urteil in EINER Zeile (der Probe-Post liest die Zeilen mit ROT/GRUEN)
        for (const [ort, z] of Object.entries(u.zahlen)) console.log(`TAG ${ort} ${u.befunde.some((b) => b.includes(` ${ort}: `)) ? "ROT" : "GRUEN"}: ${z}`);
        urteilEnde("TAG-ACHSE", u);
    } else if (hat("kontakt")) {
        // DER KONTAKT-SCHATTEN (schatten.K1): `kontaktSicht` an der Platte saat-s7-platte der Prüfbühne je Uhr, das Urteil `kontaktUrteil`
        // (Staffel 1 am Fuß; `--zuwachs` dazu Staffel 2, der Zuwachs je m — der Richter des Gesetzes im `_schattenFilter`: die Text-Probe
        // des Radius fiel mit w12-kontakt-zuwachs, unter der alten Summe der Radien misst der Zuwachs am Mittag 0,503 cm je m, ROT beim
        // Namen). Bühne und Platte stehen EINMAL vor den Uhren (die Uhr springt in der Sicht): je Uhr zwei Umstellen kosteten an der
        // Radeon drei kalte Ringe, 17,9 s
        const fehl = LL.kontaktSelbsttest();
        console.log(`KONTAKT Selbsttest ${fehl.length ? "ROT: " + fehl.join(" | ") : "4/4"}`);
        if (fehl.length || SELBST) process.exit(fehl.length ? 1 : 0);
        const welt = {};
        const P = require("../../spec/pruefbuehne/welt.json").architectures.find((a) => a.id === "saat-s7-platte");
        await umstellen({ ort: "buehne", sicht: "ego" });
        await umstellen({ x: P.position.x, z: P.position.z - 8 });
        for (const uhr of opt("--uhr", "0.5").split(",").map(Number)) {
            const o = { uhr, png: !!opt("--bilder"), platte: P.id };
            const m = (welt[uhr] = ergebnis(await evalRuf(`return await (${LL.kontaktSicht})(${JSON.stringify(o)});`)));
            for (const [pose, p] of Object.entries(m?.posen || {}))
                if (p.png) pngDatei(path.resolve(opt("--bilder"), `kontakt-${uhr}-${pose}.png`), p.png), delete p.png;
        }
        const rot = Object.entries(welt).flatMap(([uhr, m]) => LL.kontaktUrteil(m, hat("zuwachs")).befunde.map((b) => `Uhr ${uhr} ${b}`));
        console.log(JSON.stringify(welt, null, 1));
        endeMit(`KONTAKT ${rot.length ? "ROT: " + rot.join(" | ") : "GRUEN"}`, !rot.length);
    } else if (hat("naesse")) {
        // DIE NÄSSE (wetter.K2): Selbsttest Basis, Nässe ohne Dach, Regen im Haus und nasse Punkte unter dem Dach bei Median 1 (die
        // Gefache von main 5fb21e29: 5 716 von 13 141), nasser Marktstand, helles Regenbild ROT
        const m = (aussen, innen, regenbild, ri = 0, dach = 2, nass = 0) => ({ aussen: { n: 400, verhaeltnis: aussen }, innen: { n: 400, verhaeltnis: innen, nass }, dicht: 1, glanz: 16, regen: { innen: ri, aussen: 9 }, dachBauten: { n: 2, trocken: dach }, regenbild });
        const f = [
            [LL.naesseUrteil({ wiese: m(1.0, null, 1.08) }).befunde.join(), /wiese Nässe porös draußen 1 außerhalb.*Regenbild 1\.08/],
            [LL.naesseUrteil({ dorf: m(0.62, 0.64, 0.7) }).befunde.join(), /dorf innen unter dem Dach 0\.64 außerhalb/],
            [LL.naesseUrteil({ dorf: m(0.62, 1, 0.7, 7, 0, 0.435) }).befunde.join(), /Dach 0\.435 außerhalb.*7 Regen-Punkte innen.*trocken 0\/2/],
            [LL.naesseUrteil({ wiese: m(0.66, null, 0.7), dorf: m(0.62, 1.01, 0.7) }).urteil, "GRUEN"],
            [LL.naesseUrteil({}).urteil, "ROT"],
        ];
        const fehl = istSoll(f);
        console.log(`NÄSSE Selbsttest: ${f.length - fehl.length}/${f.length}`);
        if (fehl.length || SELBST) process.exit(fehl.length ? 1 : 0);
        const halt = await eigeneWelt();
        const welt = {};
        try {
            // je Ort die Sicht nach dem Doppelpunkt (`wiese:third`, sonst Ego): im Dorf stellt die Probe die Kamera an die Schwelle
            for (const wahl of /^(wiese|dorf)/.test(opt("--naesse", "")) ? opt("--naesse").split(",") : ["wiese", "wiese:third", "dorf"]) {
                const [ort, sicht = "ego"] = wahl.split(":");
                await umstellen({ ort, sicht });
                const lauf = (o) => evalRuf(`return await (${LL.naesseSicht})(${JSON.stringify(o)});`);
                let dach;
                // DIE STÄNDE DES DORFS: am Ort wählt der Spieler das Haus (das nächste mit Hülle und Tür, seine Schwelle) und den
                // nächsten Dach-Bau, dann tritt er an den Dach-Bau (der Dach-Pool trägt die Dächer um ihn) und an die Schwelle. Bis
                // 30.10. kehrte er dazwischen an den Ort zurück, nur um das Haus zu wählen — ein Umstellen mehr, dasselbe Haus
                if (ort === "dorf") {
                    const s = (await lauf({ ort, haus: true })).ergebnis.schwelle;
                    const z = (await lauf({ ort, dach: "ziel" })).ergebnis.ziel;
                    if (z) await umstellen({ x: z[0] + 3, z: z[1] + 3 });
                    dach = z ? (await lauf({ ort, dach: "pruefen" })).ergebnis : { n: 0, trocken: 0 };
                    await umstellen({ x: s[0], z: s[2] });
                }
                const a = await lauf({ ort, png: !!opt("--bilder") });
                welt[wahl] = Object.assign(ergebnis(a), dach && { dachBauten: dach });
                for (const [i, png] of (welt[wahl].png || []).entries())
                    pngDatei(path.resolve(opt("--bilder"), `naesse-${wahl}-${["klar", "frisch", "nass"][i]}.png`), png);
                delete welt[wahl].png;
            }
        } finally {
            if (halt) await halt();
        }
        dateiAb(welt);
        const u = LL.naesseUrteil(welt);
        console.log(JSON.stringify(welt, null, 1));
        urteilEnde("NÄSSE", u);
    } else if (hat("tafeln")) {
        // DIE TAFELN DER ATMOSPHÄRE SIND GEZEICHNET (w28-tafel-ganz): in der Welt am Messort Genesis das Ist jeder Tafel, die Probe der
        // verzögerten Pipeline von Ψ_ms und die Mutante (das alte `_einmalRender`), Urteil `tafelGanzUrteil`; `--selbsttest` ohne Welt.
        selbsttestEnde(LL.tafelGanzSelbsttest());
        if (SELBST) process.exit(0);
        const halt = await eigeneWelt();
        let m;
        try {
            // am Messort steht die Welt (ihre Tafeln, ihr Weltbild) — der Ruf direkt nach dem Start fände die Ziele der Tafeln leer
            await umstellen({ ort: "genesis", sicht: "ego" });
            m = ergebnis(await evalRuf(`return await __tafelGanz(${JSON.stringify({ verzoegert: Number(opt("--verzoegert", 3)) })});`));
        } finally {
            if (halt) await halt();
        }
        dateiAb(m);
        if (m.fehler) throw new Error("TAFELN: " + m.fehler);
        const u = LL.tafelGanzUrteil(m);
        for (const b of u.befunde) console.log("  ROT " + b);
        endeMit(`TAFELN ${u.urteil} · Wolke von unten ${JSON.stringify(m.wolke)} · Ist ${JSON.stringify(m.ist.tafeln)} · verzögert ${m.probe.takte} Takte, frisch ${m.probe.frisch} · Mutante leer-frisch im Takt ${m.mutante && m.mutante.frischLeer}`, u.urteil === "GRUEN");
    } else if (hat("luft")) {
        // DIE LUFT IM BILD (ferne-luft): `luftTiefe` vom Hügel am Ort (`--ort`, Standard Genesis: offen) je Uhr der Referenz,
        // zu Mittag dazu vom Gipfel (das Höchste des Gesetzes binnen 3 km, Auge 40 m); das Urteil `luftTiefeUrteil` gegen die
        // externe Referenz spec/farbe/luft-referenz.json. `--wetter <wort>` misst nur vom Hügel die Sicht im Wetter (Ferne K5),
        // mit `--zug` den Wetter-Zug klar → Wort → klar, die Ausgabe-Luma je Sekunde (Licht K5); Urteil `wetterLuftUrteil`.
        const ref = jsonLesen(path.join(__dirname, "../../spec/farbe/luft-referenz.json"));
        const fehl = LL.luftTiefeSelbsttest(ref);
        // der Selbsttest: grauer β, Kante 21 %, Linie, leere Messung, Sicht 1800 m, Sprung 0,5 EV/s und der Ton je Pixel beim Namen ROT
        selbsttestEnde(fehl);
        if (SELBST) process.exit(0);
        const halt = await eigeneWelt();
        const seite = async (f, o) =>
            ergebnis(await evalRuf(`const kantenLinie = ${LL.kantenLinie}, luftBetaRef = ${LL.luftBetaRef}, luftAufgeloest = ${LL.luftAufgeloest}, farbTon = ${LL.farbTon}, tonDesBands = ${LL.tonDesBands}; return await (${f})(${JSON.stringify(o)});`));
        const wort = opt("--wetter");
        const zug = wort && argv.includes("--zug");
        const mittag = { ...ref, uhren: [0.5] };
        let m;
        try {
            await umstellen({ ort: opt("--ort", "genesis"), sicht: "ego" });
            m = zug ? { wort, ...(await seite(LL.wetterZug, { wort, sek: 60 })) } : await seite(LL.luftTiefe, { ref: wort ? mittag : ref, augeM: 120, wetter: wort });
            const g = !wort && (await rufe("/eval", {
                code: "const p = r.state.playerMesh.position; let g = [0, 0, -1e9]; for (let x = -3e3; x <= 3e3; x += 50) for (let z = -3e3; z <= 3e3; z += 50) " +
                    "{ const y = r._terrainMacroSurfaceY(p.x + x, p.z + z, false); if (y > g[2]) g = [p.x + x, p.z + z, y]; } return g;",
            })).ergebnis;
            if (g) {
                await umstellen({ x: g[0], z: g[1] });
                m.gipfel = Object.assign({ ort: g.map(Math.round) }, await seite(LL.luftTiefe, { ref: mittag, augeM: 40 }));
            }
        } finally {
            if (halt) await halt();
        }
        dateiAb(m);
        if (m.fehler) throw new Error("LUFT: " + m.fehler);
        const w = wort && LL.wetterLuftUrteil(m, ref);
        if (zug) endeMit(`ZUG ${w.zug.gruen ? "GRUEN" : "ROT"} · Sprung ${JSON.stringify(w.zug.sprung)} EV/s (Soll ≤ ${ref.wetter.zugEvS}) · klar → ${wort} → klar gezogen ${w.zug.gezogen}, ${m.reihe.length} s`, w.zug.gruen);
        if (wort) endeMit(`SICHT ${w.sicht.gruen ? "GRUEN" : "ROT"} · Sicht im Wetter ${wort} ${w.sicht.ist} m (Soll ${ref.wetter.sichtSturmM} ±${ref.wetter.band * 100} %, ${w.sicht.n} Azimute)`, w.sicht.gruen);
        const u = LL.luftTiefeUrteil(m, ref);
        for (const b of u.befunde.map((x) => "ROT " + x).concat(u.offen.map((x) => "OFFEN " + x))) console.log("  " + b);
        endeMit(`LUFT ${u.urteil} · ${Object.entries(u.staffel).map((e) => e.join(" ")).join(" · ")} (offen: ${Object.keys(ref.offen).join(", ")})`, u.urteil === "GRUEN");
    } else if (hat("laub")) {
        // DAS LAUB IM GEGENLICHT: je Art der nächste Baum, der Spieler am Augen-Ort (die Stufe folgt ihm), Gegenlicht
        // gegen Auflicht; das Urteil `laubLichtUrteil` (≥ 1,3, Labor ± 10 % wo gemessen). `--selbsttest` ohne Welt.
        if (SELBST) {
            const m = (v) => ({ verhaeltnis: v, gegen: { Y: v }, auf: { Y: 1 }, stoffe: "laub" });
            const fz = (v, dL, dC) => ({ paar: "fern/nah", stufe: "bodenSatz → fern-ring", karte: { verhaeltnis: v, dL, dC } });
            const lu = (welt, labor) => LL.laubLichtUrteil({ welt, labor });
            const f = [
                [lu({ eiche: m(1.4) }).urteil, "GRUEN"],
                [
                    lu({ eiche: m(0.3) }).befunde.join(),
                    /eiche: Gegenlicht\/Auflicht 0\.3 < 1\.3/,
                ],
                [lu({ eiche: m(1.4) }, { eiche: { verhaeltnis: 1.0 } }).urteil, "ROT"],
                [
                    lu({ eiche: m(1.4) }, { eiche: { verhaeltnis: 1.35 } }).urteil,
                    "GRUEN",
                ],
                // das Labor misst unter EINEM Licht: gegen die Welt-Seite `sonne`, nie gegen die volle Licht-Kette
                [
                    lu({ eiche: Object.assign(m(1.4), { sonne: { verhaeltnis: 1.0 } }) }, { eiche: { verhaeltnis: 1.4 } }).befunde.join(),
                    /Welt 1 gegen Labor 1\.4 \(nur Sonne\)/,
                ],
                [lu({ birke: { fehler: "keine Laub-Senke" } }).urteil, "ROT"],
                // die Karte gegen ihre Gestalt (A7) — ROT beim Namen
                [lu({ fichte: { stufe: "f:fichte:L1", karte: { verhaeltnis: 1.24, dL: 3.7, dC: 1.4 } } }).befunde.join(), /KARTE fichte: Karte\/Gestalt \(f:fichte:L1\) Luma 1\.24/],
                [lu({ fichte: { karte: { verhaeltnis: 1.04, dL: 0.8, dC: -0.8 } } }).urteil, "GRUEN"],
                // die Karte in der Nacht (F6): ROT beim Namen der Stunde
                [lu({ "fichte@0": { stufe: "f:fichte:L1", karte: { verhaeltnis: 4.737, dL: 16.6, dC: 2.73 } } }).befunde.join(), /KARTE fichte@0: Karte\/Gestalt \(f:fichte:L1\) Luma 4\.737/],
                // ohne das Band die Wirts-Zahlen (Rauheit 0,9, Mikro-Kavität): die Karte nachts 0,544 ihrer Gestalt — ROT nach unten
                [lu({ "fichte@0": { stufe: "f:fichte:L1", karte: { verhaeltnis: 0.544, dL: -3.86, dC: -0.53 } } }).befunde.join(), /KARTE fichte@0: Karte\/Gestalt \(f:fichte:L1\) Luma 0\.544/],
                // die ganze Normale im zum Auge gekippten Rahmen: mittags 1,278 — ROT nach oben
                [lu({ "fichte@0.5": { stufe: "f:fichte:L1", karte: { verhaeltnis: 1.278, dL: 4.21, dC: -1.75 } } }).urteil, "ROT"],
                [lu({ eiche: { karte: { verhaeltnis: 1.02, dL: 0.3, dC: 4.2 } } }).urteil, "ROT"],
                [LL.laubLichtUrteil({}).urteil, "ROT"],
                // DIE FERNE JE STUNDE (F6): Fern-Ring gegen Boden-Satz nachts über Mittag ROT beim Namen
                [lu({ "ring@0.5": fz(1.072, 1.97, -7.21), "ring@0": fz(1.604, 7.04, -4.17) }).befunde.join(), /FERN ring@0: fern\/nah gegen Mittag \(bodenSatz → fern-ring\) Luma 1\.496/],
                [lu({ "ring@0.5": fz(1.038, 0.96, -5.6), "ring@0": fz(1.047, 0.45, -2.82) }).urteil, "GRUEN"],
                [JSON.stringify(lu({ "haus@0.5": fz(0.788, -5.35, -1.7), "haus@0": fz(0.763, -4.17, 1.04) }).zeilen[1]), /"karte":0\.968.*"mittag":0\.788/],
                [lu({ "haus@0": fz(0.763, -4.17, 1.04) }).befunde.join(), /FERN haus@0: ohne die Zeile zu Mittag/],
                // die Krone von oben: Zwei-Strom-Band über der gemessenen Blatt-Albedo
                [LL.kronenReflexionSoll(0.164, [0.5, 1]).join("/"), "0.0705/0.099"],
                [LL.kronenObenUrteil({ welt: { fichte: { oben: { R: 0.08, A: 0.164, tau: [0.5, 1] } } } }).urteil, "GRUEN"],
                [
                    LL.kronenObenUrteil({ welt: { fichte: { oben: { R: 0.15, A: 0.164, tau: [0.5, 1] } } } }).befunde.join(),
                    /fichte: Reflexion 0\.15 außerhalb \[0\.0705, 0\.099\].*besonnte Schale/,
                ],
                [LL.kronenObenUrteil({ welt: { fichte: { oben: { R: 0.03, A: 0.164, tau: [0.5, 1] } } } }).urteil, "ROT"],
                [LL.kronenObenUrteil({ welt: { fichte: { fehler: "keine Laub-Senke" } } }).urteil, "ROT"],
                [LL.kronenObenUrteil({}).urteil, "ROT"],
                ...LL.tagKurveSelbsttest(),
            ];
            const fehl = istSoll(f);
            endeMit(`LAUB-LICHT Selbsttest: ${f.length - fehl.length}/${f.length}`, !fehl.length);
        }
        const welt = {};
        // Das Exemplar je Art: das nächste zum Messort Wiese (spec/profiband/haushalt.json) — derselbe Baum in jedem Lauf.
        // `--ort genesis`: die Bäume der Ankunft (A7, die Karte gegen ihre Gestalt)
        const wiese = require("../../spec/profiband/haushalt.json").messorte.find((m) => m.id === (opt("--ort") || "wiese"));
        // `--oben`: dasselbe Exemplar lotrecht von oben, die Reflexion der Krone gegen das Zwei-Strom-Band
        // (`kronenObenUrteil`). Die Arten stehen hinter `--laub`, ohne Liste eiche,birke (ein folgender Schalter ist keine Art).
        const oben = hat("oben");
        const arten = opt("--laub") && !String(opt("--laub")).startsWith("--") ? opt("--laub") : "eiche,birke";
        // DAS SPIEL-AUGE (S2b): `--wechsel f` das Auge im f-fachen Abstand, ab dem das Spiel die Karte zeigt, `--auge h` die
        // Augenhöhe (Ego 1,6 · Third 3,5), `--hang g` ein Exemplar am Hang (Gefälle ≥ g), das Auge talwärts
        // DIE STUNDEN (F6): `--uhr 0.5,0.25,0` misst jede Art je Stunde (Mittag · Dämmerung · Nacht) — die Karte antwortet dem
        // Licht der Uhr wie ihre Gestalt; die Zeile heißt `<art>@<uhr>`
        const uhren = opt("--uhr") === undefined ? [null] : String(opt("--uhr")).split(",").map(Number);
        // DIE FERNE JE STUNDE (F6): zwei Namen der Liste gehen den Weg der Karte (dasselbe Auge, zwei Stufen) — `ring` Boden-Satz
        // gegen Fern-Ring am Messort, `haus` L0 gegen L2 im Spiel-Abstand am Messort dorf (der Dorf-Zug baut es beim Spieler)
        const dorf = require("../../spec/profiband/haushalt.json").messorte.find((m) => m.id === "dorf");
        // `--eigen` die Wand der Karte (gate:licht-weg:echt): die Welt als Kind, gestoppt nach der letzten Zeile
        const halt = await eigeneWelt();
        try {
            // DER PLAN JE ART (w4-proben-tempo2, 31.10.): Exemplar und Auge einer Art hängen nie an der Uhr — jede Uhr nach der ersten ruft
            // den Plan nur der Stunde wegen (sein Ruf stellt sie) und schwingt ein, wo der Spieler nach der Zeile davor steht — am Auge des
            // Plans, die Schüsse stellen nur die Kamera (`auge`); bis dahin je Uhr der Gang zum Anker, der Plan samt seinem Einschwingen und
            // der Gang zurück ans Auge
            for (const art of String(arten).split(",")) { let plan = null; for (const uhr of uhren) {
                const zeile = uhr == null ? art : `${art}@${uhr}`;
                // DER LICHTWEG (Licht K3): `panorama`, `feld`, `spiegel` und `wasser` (eine Zahl stellt die Fläche senkrecht, Grad neben
                // der Sonne) — die graue Fläche im Licht der Welt gegen das Licht des Wegs
                if (/^(panorama|feld|spiegel|wasser)\d*$/.test(art)) {
                    if (!Object.keys(welt).length) await umstellen({ ort: "dorf" }); // der Feld-Pass steht erst im Takt
                    welt[zeile] = ergebnis(await evalRuf(`return await __lichtWeg({ weg: "${art}", uhr: ${uhr} });`)); // ein Wurf des Wegs reist als `fehler` beim Namen
                    continue;
                }
                const [haus, boden] = [art === "haus", art === "ring"];
                const anker = haus || boden ? dorf.spieler : wiese.spieler;
                if ((haus || boden) && !(welt[`haus@${uhren[0]}`] || welt[`ring@${uhren[0]}`])) await umstellen({ ort: "dorf" });
                const spiel = `wechsel: ${Number(opt("--wechsel", 0)) || 0}, augeH: ${Number(opt("--auge", 1.7)) || 1.7}, hang: ${Number(opt("--hang", 0)) || 0}, uhr: ${uhr}, haus: ${haus}, boden: ${boden}`;
                const c = `return await __laubGegenlicht(Object.assign({ art: ${JSON.stringify(art)} }, __o));`;
                const ein = () => hat("karte") && rufe("/lauf", { sek: 5, ein: 8, ruhe: 120, regler: "voll" });
                // `--abstand m`: der Augen-Ort so weit vom Fuß (die Stufe folgt dem Spieler: nah L0, weiter L1)
                const planRuf = () => rufe("/eval", { code: `const __o = { plan: true, anker: ${JSON.stringify(anker)}, abstand: ${Number(opt("--abstand", 8)) || 8}, ${spiel} }; ${c}` });
                if (plan) await planRuf(), await ein();
                else {
                    // am Anker stehen: welche Bäume eine nahe Stufe (eine Laub-Senke) tragen, folgt dem Spieler
                    await umstellen({ x: anker[0], z: anker[1] });
                    // die Stufen der Gestalten schwingen ein (nach dem Umstellen fehlt dem Plan der Karte die Laub-Senke)
                    for (let i = 0; i < (hat("karte") ? 6 : 1) && !(plan && !plan.fehler); i++, await ein()) plan = (await planRuf()).ergebnis;
                    if (!plan || plan.fehler) {
                        welt[zeile] = plan || { fehler: "kein Plan" };
                        plan = null;
                        continue;
                    }
                    await umstellen({ x: plan.auge[0], z: plan.auge[1] });
                    await ein();
                }
                // `--karte` (A7): dasselbe Auge, erst die Gestalt in ihrer Stufe, dann die Karte (Schwellen 0,3/0,6 m), danach zurück
                // — auch der Boden: Boden-Satz und Fern-Ring aus dem fernen Auge der Naht (zwei Augen maßen den Blickwinkel mit, Licht K3)
                const k = (n) => evalRuf(`const __o = { ziel: ${JSON.stringify(plan.ziel)}, auge: ${JSON.stringify(boden ? plan.fern : plan.auge)}, karte: ${n}, stufe: ${haus ? (n === 1 ? 0 : 2) : null}, ${spiel} }; ${c}`);
                // `plan.l1` hält das Exemplar im Spiel-Abstand auf L1, 0,6 m jede Krone auf der Karte, null stellt zurück; das Haus: Schuss 1
                // in L0 (`t01`: beide Schwellen über dem Auge), Schuss 2 in L2 (`stufe`, sonst urteilt die Linse laut)
                const stufen = async (t12, t01) => {
                    const D = "const D = r.constructor.LOD_DISTANCES; window.__karteD = window.__karteD || [D.thresh01, D.thresh12];";
                    // die nahen Bäume wählen sofort neu, am Abstand ohne Zustand: die neuen Schwellen sind eine neue Epoche der Grenzen
                    // (`_stufenSchirm` → `_tickArchitectureLOD`, w8-linsen-blick — bis dahin stand das Exemplar im Karten-Schuss auf L0)
                    await evalRuf(t12 == null ? `${D} [D.thresh01, D.thresh12] = window.__karteD; window.__karteD = null; return 1;` : `${D} D.thresh01 = ${t01 == null ? `Math.min(window.__karteD[0], ${t12} / 2)` : t01}; D.thresh12 = ${t12}; return 1;`);
                    await ein();
                };
                if (hat("karte")) {
                    if (haus) await stufen(plan.l1, plan.l1);
                    else if (opt("--wechsel") && !boden) await stufen(plan.l1);
                    // die Gestalt des Exemplars kann noch reisen (L1 im Bau): bis zu drei Läufe mehr, sonst urteilt die Linse laut
                    for (let i = 0; i < 4 && ((await k(1)).ergebnis || {}).fehler; i++) await ein();
                    if (!boden) await stufen(0.6);
                }
                const w = hat("karte")
                    ? (await k(2)).ergebnis
                    : (await evalRuf(`const __o = { ziel: ${JSON.stringify(plan.ziel)}, oben: ${oben} }; ${c}`)).ergebnis;
                if (hat("karte") && !boden) await stufen(null);
                const ordner = opt("--ordner");
                if (w?.karte && ordner)
                    w.karte.png.forEach((p, i) => pngDatei(path.join(ordner, `karte-${zeile}-${i ? "karte" : "gestalt"}.png`), p));
                if (w?.karte) delete w.karte.png;
                if (w?.oben?.png) {
                    if (ordner)
                        pngDatei(path.join(ordner, `krone-${art}-oben.png`), w.oben.png);
                    delete w.oben.png;
                }
                if (w?.gegen)
                    for (const k of ["gegen", "auf"]) {
                        if (ordner)
                            pngDatei(path.join(ordner, `laub-${art}-${k}.png`), w[k].png);
                        delete w[k].png;
                    }
                welt[zeile] = w;
            } }
        } finally {
            if (halt) await halt();
        }
        if (oben) {
            const u = LL.kronenObenUrteil({ welt });
            console.log(JSON.stringify({ welt, zeilen: u.zeilen }, null, 1));
            urteilEnde("KRONE-OBEN", u);
        }
        const u = LL.laubLichtUrteil({ welt });
        // `--datei`: die Welt-Seite für das Labor-Urteil (diag-albedo-tafel.cjs --laub --welt <datei>)
        dateiAb({ welt });
        console.log(JSON.stringify({ welt, zeilen: u.zeilen }, null, 1));
        urteilEnde("LAUB-LICHT", u);
    }
}

module.exports = { LICHT_GAENGE, lichtGang };
