// paare.cjs — VOM SPIEL-BILD ZUM BLINDEN BLATT einer 2afc-Sprosse (R11, 26.11.): die Spiel-Bilder EINES Kopfs an EINEM Gerät gegen
// Korpus-Fotos DESSELBEN Motivs, jedes Bild durch denselben Canvas wie die Eichung (bild.cjs: 6 % Rand weg, 480 × 320, eine
// Zwischenbreite, ein Kodierer — die Bedingung, unter der der Prüfer geeicht ist), dazu Fang-Aufgaben mit bekannter Antwort (ein
// Foto des Motivs gegen seine gestörte Fassung, Stufe 3 — die Herkunft „stoerung“ der Eichung), dann das Blatt in Teilen zu 25.
//
//   node vision/pruefer/paare.cjs --sprosse <leiter#n> --spiel <Ordner der Spiel-Bilder> --sha <Kopf> --geraet "<Gerät>"
//        --ziel <Korpus-Ordner> --zuordnung <Ordner außerhalb des Korpus> --bauer <Kennung> [--aus <Ordner, sonst der Korpus>] [--saat 1]
//
// → <aus>/paare/<leiter.n>/ (paare.json + Bilder) · <aus>/blatt/<leiter.n>/teil-01 … (das sieht der Prüfer) ·
//   <zuordnung>/<leiter.n>/teil-01 … (die Wahrheit, getrennt) · <aus>/kontakt/<leiter.n>/teil-NN.jpg (der Bogen für das Auge des Bauers)
//
// WAS DIE SPIEL-BILDER SIND: Schüsse aus dem Ausgabe-Pfad der Spiel-Kamera (Werkbank /bild — der Weg, den die Stationen der Karte
// für ihre Augen-Sprossen rufen), ≥ 40 VERSCHIEDENE Posen am Motiv der Sprosse, alle am selben Kopf und Gerät. Die Sprosse und ihr
// Motiv-Satz stehen in quellen.json `fronten2afc` (a: Schwelle im Satz · b: ≥ 40 gesichtete Fotos des Motivs · c: die Station schießt
// den Fächer); fehlt eines, verweigert das Werkzeug beim Namen — nie ein Blatt aus einem fremden Motiv („Korpus fehlt: …“).
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const MANIFEST = path.join(__dirname, "quellen.json");
const W = 480, H = 320, JE_TEIL = 25, FANG = 10, FANG_STUFE = 3, BUNT_MIN = 6;
const FRAGE = "Welches der beiden Bilder ist das Foto?"; // die Frage der Eichung 2afc × paar — eine andere Frage wäre eine andere Aufgabe
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const zufall = (saat) => { let s = saat >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
const mische = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

async function haupt(argv) {
    const arg = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
    for (const n of ["--sprosse", "--spiel", "--sha", "--geraet", "--ziel", "--zuordnung", "--bauer"]) if (!arg(n)) throw new Error(n + " fehlt (Kopf der Datei)");
    const P = require("./pruefer.cjs"), bild = require("./bild.cjs");
    const id = arg("--sprosse"), ziel = path.resolve(arg("--ziel")), aus = path.resolve(arg("--aus", ziel)), zuWurzel = path.resolve(arg("--zuordnung")), saat = +arg("--saat", 1);
    if (zuWurzel === aus || zuWurzel.startsWith(aus + path.sep)) throw new Error("die Zuordnung liegt AUSSERHALB des Blatt-Ordners — der Prüfer sieht ihn");
    const z = P.sprosseVon(id);
    if (!z || z.art !== "2afc") throw new Error("die Sprosse " + id + " ist im Zensus keine 2afc-Sprosse");
    if (!z.schwelle.mass) throw new Error("verweigert: " + id + " — " + z.schwelle.grund);
    const M = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    const zeile = (M.fronten2afc || []).find((x) => x.id === id);
    if (!zeile || !(zeile.saetze || []).length) throw new Error("Korpus fehlt: " + id + " trägt in quellen.json fronten2afc keinen Motiv-Satz" + (zeile ? " (" + zeile.fehlt + ")" : ""));
    const nicht = new Set((M.nicht || []).map((x) => x.datei)), gesehen = new Set();
    const fotos = zeile.saetze.flatMap((sid) => { const s = M.saetze.find((x) => x.id === sid); if (!s) throw new Error("Korpus fehlt: der Satz „" + sid + "“ steht nicht im Manifest"); return (s.dateien || []).filter((f) => !nicht.has(sid + "/" + f.datei)).map((f) => ({ f, pfad: path.join(ziel, s.ablage, f.datei), rel: s.ablage + "/" + f.datei })); })
        .filter((x) => !gesehen.has(x.f.sha256) && gesehen.add(x.f.sha256));
    for (const x of fotos) if (!fs.existsSync(x.pfad)) throw new Error("Korpus fehlt: " + x.rel + " liegt nicht in " + ziel);
    // die Spiel-Bilder: jede Bild-Datei des Ordners in ihrer Namens-Folge, Doppel (gleiche Bytes) zählen einmal
    const spielDir = path.resolve(arg("--spiel")), sg = new Set();
    const spiel = fs.readdirSync(spielDir).filter((n) => /\.(png|jpe?g)$/i.test(n)).sort().map((n) => ({ n, b: fs.readFileSync(path.join(spielDir, n)) })).filter((x) => { const h = sha(x.b); return !sg.has(h) && sg.add(h); });
    if (spiel.length < P.MIN_PAARE) throw new Error("Spiel-Bilder fehlen: " + spiel.length + " verschiedene in " + spielDir + " < " + P.MIN_PAARE + " (ein Fächer von Posen am Motiv, EIN Kopf, EIN Gerät)");
    const B = await bild.oeffne();
    console.log("Canvas im headless-Browser (ohne GPU), PID " + B.pid);
    try {
        // schwarz-weiße Fotos verrieten die Seite an der Form (kein Spiel-Bild ist schwarz-weiß) — gemessen, nicht von Hand
        const farbig = [];
        for (const x of mische(fotos, zufall(saat))) if ((await B.bunt(fs.readFileSync(x.pfad))) >= BUNT_MIN) farbig.push(x);
        const n = Math.min(spiel.length, farbig.length);
        if (n < P.MIN_PAARE) throw new Error("Korpus fehlt: " + id + " trägt " + farbig.length + " farbige Fotos des Motivs < " + P.MIN_PAARE + " (Sätze " + zeile.saetze.join(", ") + ")");
        // die Fang-Fotos: zuerst die unbenutzten, sonst vom Anfang (ein Foto steht dann in zwei Aufgaben, nie in derselben)
        const fang = farbig.slice(n).concat(farbig).slice(0, FANG);
        const kennung = id.replace("#", "."), pd = path.join(aus, "paare", kennung), blattW = path.join(aus, "blatt", kennung), zuW = path.join(zuWurzel, kennung), kontaktW = path.join(aus, "kontakt", kennung);
        for (const d of [pd, blattW, zuW, kontaktW]) fs.rmSync(d, { recursive: true, force: true });
        fs.mkdirSync(pd, { recursive: true });
        const norm = (b, stufe) => B.norm(b, { w: W, h: H, stufe, vor: W });
        const aufgaben = [];
        for (let i = 0; i < n; i++) {
            const a = "m" + String(i + 1).padStart(2, "0");
            fs.writeFileSync(path.join(pd, a + "-0.jpg"), await norm(fs.readFileSync(farbig[i].pfad), 0));
            fs.writeFileSync(path.join(pd, a + "-1.jpg"), await norm(spiel[i].b, 0));
            aufgaben.push({ bilder: [a + "-0.jpg", a + "-1.jpg"], wahr: 0, quelle: [farbig[i].rel, "spiel: " + spiel[i].n] });
        }
        for (let i = 0; i < fang.length; i++) {
            const a = "f" + String(i + 1).padStart(2, "0"), b = fs.readFileSync(fang[i].pfad);
            fs.writeFileSync(path.join(pd, a + "-0.jpg"), await norm(b, 0));
            fs.writeFileSync(path.join(pd, a + "-1.jpg"), await norm(b, FANG_STUFE));
            aufgaben.push({ bilder: [a + "-0.jpg", a + "-1.jpg"], wahr: 0, fang: true, quelle: [fang[i].rel, fang[i].rel + " · Stufe " + FANG_STUFE] });
        }
        fs.writeFileSync(path.join(pd, "paare.json"), JSON.stringify({ sprosse: id, art: "2afc", form: "paar", frage: FRAGE, bauer: arg("--bauer"), sha: arg("--sha"), geraet: arg("--geraet"), herkunft: "spiel", pixel: W + "×" + H, aufgaben }, null, 1) + "\n");
        const teile = P.teileBauen(pd, blattW, zuW, saat * 100, JE_TEIL);
        fs.mkdirSync(kontaktW, { recursive: true });
        for (const t of teile) {
            const blatt = JSON.parse(fs.readFileSync(path.join(blattW, t.teil, "blatt.json"), "utf8"));
            const zellen = blatt.aufgaben.flatMap((a) => a.bilder.map((nm) => ({ b: fs.readFileSync(path.join(blattW, t.teil, nm)), text: nm.replace(/\.jpg$/, "").replace(/^0+/, "") })));
            fs.writeFileSync(path.join(kontaktW, t.teil + ".jpg"), await B.kontakt(zellen, { spalten: 6, tw: 192, th: 128 }));
        }
        console.log("BLATT " + id + " (" + z.schwelle.wort + "): " + n + " Paare Foto gegen Spiel-Bild + " + fang.length + " Fang-Aufgaben in " + teile.length + " Teilen → " + blattW + " · Zuordnung getrennt in " + zuW + " · Bögen in " + kontaktW);
    } finally {
        await B.zu();
    }
    return 0;
}
if (require.main === module) haupt(process.argv.slice(2)).then((c) => { process.exitCode = c; }, (e) => { console.error(e.message); process.exitCode = 2; });
