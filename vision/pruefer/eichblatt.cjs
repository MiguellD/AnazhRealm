// eichblatt.cjs — DIE EICH-BLÄTTER des Blind-Prüfers (R11, 26.11.): je ART ein Blatt, dessen Anker die AUFGABE der Sprossen tragen,
// aus den Sätzen von vision/pruefer/quellen.json (`eichungen`), in TEIL-BLÄTTERN zu 25 Aufgaben (ein Prüfer-Kontext trägt nicht 200
// Bilder), jedes Bild durch denselben Canvas (bild.cjs: Zuschnitt, EIN Pixelmaß, EIN Kodierer), die Zuordnung getrennt und gehasht.
//
//   node vision/pruefer/eichblatt.cjs --ziel <Korpus-Ordner> --zuordnung <Ordner außerhalb des Korpus> --bauer <Kennung> [--nur <blatt>] [--saat 1]
//
// WARUM je Art (Urteil vom 26.11. über das erste Blatt „Foto oder Render?“ aus Sonden-Illustration gegen Landschafts-Foto): ein
// Prüfer trennte dort am MOTIV — ≥ 0,8 hätte nichts über die Machart bewiesen. Darum:
//   art „ordnen“: 200 echte Fotos mit bekannter KLASSE („Welche der N Klassen?“ — hier IST das Motiv die Sache), dazu Reihen der
//                 gestuften Störung mit bekannter ORDNUNG („Bringe die 4 Bilder in die Reihenfolge“).
//   art „2afc“:   Paare INNERHALB einer Motiv-Klasse — Landschafts-Foto gegen Landschafts-Render, und Foto gegen seine gestörte
//                 Fassung (Stufe 1–4) — die Seiten per Saat gemischt, gleiches Pixelmaß, gleiche Zwischenbreite.
// Der Bauer legt bereit und sieht jeden Teil als Kontaktbogen an (kontakt/<blatt>/teil-NN.jpg); die Prüfer-Läufe fährt ein anderer
// Kontext (der Bauer ist nie der Prüfer). Was nach dem Ansehen fällt, steht mit Grund in quellen.json unter `nicht`.
"use strict";
const fs = require("fs");
const path = require("path");
const MANIFEST = path.join(__dirname, "quellen.json");
const W = 480, H = 320, JE_TEIL = 25, BUNT_MIN = 6;
const teilName = (i) => "teil-" + String(i + 1).padStart(2, "0");
const zufall = (saat) => { let s = saat >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
const mische = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

async function haupt(argv) {
    const arg = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
    if (!arg("--ziel") || !arg("--zuordnung") || !arg("--bauer")) throw new Error("--ziel, --zuordnung und --bauer fehlen");
    const ziel = path.resolve(arg("--ziel")), zuWurzel = path.resolve(arg("--zuordnung")), saat = +arg("--saat", 1), bauer = arg("--bauer");
    if (zuWurzel === ziel || zuWurzel.startsWith(ziel + path.sep)) throw new Error("die Zuordnung liegt AUSSERHALB des Korpus-Ordners — der Prüfer sieht den Korpus");
    const { blattBauen } = require("./pruefer.cjs"), bild = require("./bild.cjs");
    const M = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    const nicht = new Set((M.nicht || []).map((x) => x.datei));
    const gesehen = new Set();
    // der Vorrat eines Satzes: seine Dateien in der Folge des Manifests, ohne die gefallenen und ohne Doppel (sha256)
    const vorrat = (ids) => ids.flatMap((id) => { const s = M.saetze.find((x) => x.id === id); if (!s) throw new Error("Korpus fehlt: der Satz „" + id + "“ steht nicht im Manifest"); return (s.dateien || []).filter((f) => !nicht.has(id + "/" + f.datei)).map((f) => ({ id, f, pfad: path.join(ziel, s.ablage, f.datei) })); });
    const frisch = (liste) => liste.filter((x) => !gesehen.has(x.f.sha256) && gesehen.add(x.f.sha256));
    const reihum = (gruppen, n) => { const r = []; for (let i = 0; r.length < n && gruppen.some((g) => g[i]); i++) for (const g of gruppen) if (g[i] && r.length < n) r.push(g[i]); return r; };
    const B = await bild.oeffne();
    console.log("Canvas im headless-Browser (ohne GPU), PID " + B.pid);
    try {
        for (const [id, E] of Object.entries(M.eichungen)) {
            if (arg("--nur") && arg("--nur") !== id) continue;
            gesehen.clear();
            const paareW = path.join(ziel, "paare", id), blattW = path.join(ziel, "blatt", id), zuW = path.join(zuWurzel, id), kontaktW = path.join(ziel, "kontakt", id);
            for (const d of [paareW, blattW, zuW, kontaktW]) fs.rmSync(d, { recursive: true, force: true });
            const teile = []; // { form, frage, optionen, herkunft, aufgaben: [{ quellen: [{ pfad, stufe }], wahr }] }
            const inTeile = (aufgaben, kopf, je) => { for (let i = 0; i < aufgaben.length; i += je) teile.push({ ...kopf, aufgaben: aufgaben.slice(i, i + je) }); };
            if (E.klasse) {
                const K = E.klasse, namen = Object.keys(K.klassen);
                const wahl = reihum(namen.map((n) => frisch(vorrat(K.klassen[n])).map((x) => ({ quellen: [{ pfad: x.pfad, stufe: 0 }], wahr: n }))), K.anker);
                if (wahl.length < K.anker) throw new Error("Korpus fehlt: " + id + " trägt " + wahl.length + " von " + K.anker + " Klassen-Ankern");
                inTeile(mische(wahl, zufall(saat)), { form: "klasse", frage: K.frage, optionen: namen, herkunft: "fremd" }, JE_TEIL);
            }
            if (E.folge) {
                const F = E.folge, wahl = reihum(F.aus.map((s) => frisch(vorrat([s]))), F.reihen).map((x) => ({ quellen: F.stufen.map((stufe) => ({ pfad: x.pfad, stufe })), wahr: true }));
                if (wahl.length < F.reihen) throw new Error("Korpus fehlt: " + id + " trägt " + wahl.length + " von " + F.reihen + " Störungs-Reihen");
                inTeile(wahl, { form: "folge", frage: F.frage, herkunft: "stoerung" }, F.jeTeil);
            }
            if (E.paar) {
                // schwarz-weiß fällt aus Foto UND Render (gemessen, nicht von Hand): kein Render des Satzes ist schwarz-weiß — die Form verriete das Foto
                const farbig = async (liste) => { const r = []; for (const x of liste) (await B.bunt(fs.readFileSync(x.pfad))) >= BUNT_MIN ? r.push(x) : grau.push(path.basename(path.dirname(x.pfad)) + "/" + x.f.datei); return r; };
                const P = E.paar, grau = [], render = await farbig(frisch(vorrat(P.render))), foto = await farbig(frisch(vorrat(P.foto)));
                console.log("  schwarz-weiß gefallen (Buntheit < " + BUNT_MIN + "): " + (grau.join(" · ") || "keins"));
                // JEDER gesichtete Render trägt ein Paar (Renders sind knapp), in gleich großen Teilen ≤ 25; die Störung füllt auf
                const nR = Math.min(render.length, foto.length);
                inTeile(mische(render.slice(0, nR).map((r, i) => ({ quellen: [{ pfad: foto[i].pfad, stufe: 0 }, { pfad: r.pfad, stufe: 0 }], wahr: 0 })), zufall(saat)), { form: "paar", frage: P.frage, herkunft: "fremd", vor: W }, Math.ceil(nR / Math.ceil(nR / JE_TEIL)));
                const rest = reihum([foto.slice(nR), ...P.stoerungAus.map((s) => frisch(vorrat([s])))], P.stoerung).map((x, i) => ({ quellen: [{ pfad: x.pfad, stufe: 0 }, { pfad: x.pfad, stufe: 1 + (i % 4) }], wahr: 0 }));
                if (rest.length < P.stoerung || nR + rest.length < 200) throw new Error("Korpus fehlt: " + id + " trägt " + nR + " Render-Paare und " + rest.length + " von " + P.stoerung + " Störungs-Paaren");
                inTeile(mische(rest, zufall(saat + 1)), { form: "paar", frage: P.frage, herkunft: "stoerung", vor: W }, JE_TEIL);
            }
            const eintrag = { id, art: E.art, pixel: W + "×" + H, bauer, saat, blatt: "blatt/" + id, kontakt: "kontakt/" + id, zuordnung: "getrennt, außerhalb des Korpus-Ordners (" + path.basename(zuWurzel) + "/" + id + "/teil-NN/zuordnung.json)", aufgaben: 0, teile: [], stand: "bereit · kein Lauf gefahren" };
            for (let t = 0; t < teile.length; t++) {
                const T = teile[t], name = teilName(t), pd = path.join(paareW, name);
                fs.mkdirSync(pd, { recursive: true });
                const aufgaben = [];
                for (let i = 0; i < T.aufgaben.length; i++) {
                    const a = T.aufgaben[i], bilder = [];
                    for (let j = 0; j < a.quellen.length; j++) {
                        const n = String(i + 1).padStart(2, "0") + "-" + j + ".jpg";
                        fs.writeFileSync(path.join(pd, n), await B.norm(fs.readFileSync(a.quellen[j].pfad), { w: W, h: H, stufe: a.quellen[j].stufe, vor: T.vor || 0 }));
                        bilder.push(n);
                    }
                    aufgaben.push({ bilder, wahr: a.wahr, quelle: a.quellen.map((q) => path.relative(ziel, q.pfad).replace(/\\/g, "/") + (q.stufe ? " · Stufe " + q.stufe : "")) });
                }
                const P = { sprosse: null, art: E.art, form: T.form, frage: T.frage, optionen: T.optionen, herkunft: T.herkunft, bauer, aufgaben };
                fs.writeFileSync(path.join(pd, "paare.json"), JSON.stringify(P, null, 1) + "\n");
                const r = blattBauen(pd, path.join(blattW, name), path.join(zuW, name), saat * 100 + t, P);
                // der Kontaktbogen zeigt, was der Prüfer sieht: die Bilder des BLATTS in seiner Folge und unter seinen Namen
                const blatt = JSON.parse(fs.readFileSync(path.join(blattW, name, "blatt.json"), "utf8"));
                const zellen = blatt.aufgaben.flatMap((a) => a.bilder.map((n) => ({ b: fs.readFileSync(path.join(blattW, name, n)), text: n.replace(/\.jpg$/, "").replace(/^0+/, "") })));
                const raster = T.form === "klasse" ? { spalten: 5, tw: 240, th: 160 } : T.form === "paar" ? { spalten: 6, tw: 192, th: 128 } : { spalten: 8, tw: 150, th: 100 };
                fs.mkdirSync(kontaktW, { recursive: true });
                fs.writeFileSync(path.join(kontaktW, name + ".jpg"), await B.kontakt(zellen, raster));
                eintrag.teile.push({ teil: name, form: T.form, herkunft: T.herkunft, aufgaben: r.aufgaben, zuordnungSha256: r.zuordnungSha256 });
                eintrag.aufgaben += r.aufgaben;
            }
            M.blaetter = (M.blaetter || []).filter((b) => b.id !== id).concat(eintrag);
            console.log("BLATT " + id + " (" + E.art + "): " + eintrag.aufgaben + " Anker in " + teile.length + " Teilen — " + eintrag.teile.map((x) => x.teil.slice(5) + " " + x.form + "/" + x.herkunft + " " + x.aufgaben).join(" · "));
        }
    } finally {
        await B.zu();
    }
    fs.writeFileSync(MANIFEST, JSON.stringify(M, null, 1) + "\n");
    return 0;
}
if (require.main === module) haupt(process.argv.slice(2)).then((c) => { process.exitCode = c; }, (e) => { console.error(e.message); process.exitCode = 2; });
