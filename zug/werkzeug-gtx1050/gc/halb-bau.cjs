// halb-bau.cjs <ziel.json> <name>=<datei.wgsl>[:<schnitt>[+<schnitt>…]] … — baut einen künstlichen Lauf für die uebersetz-sonde: je
// Eintrag EIN Fragment-Text, wahlweise mit benannten Schnitten am TEXT (Messung, kein Schnitt am Spiel). So wird die
// Übersetzungszeit eines Programms am Text halbiert, bis das Konstrukt benannt ist, das sie trägt.
// Schnitte:
//   luft-tot      die Zeile, die die Luft in die Ausgabe mischt, wird `… = Output;` — die Rechnung der Luft bleibt als toter Text
//   luft-leer     der ganze Abschnitt der Luft (von seinem ersten `if` nach `Output = max(…)` bis zur Misch-Zeile) fällt, `… = Output;`
//   ton-tot       die Zeile der Ausgabe-Rasterung (exp2/floor/log2, das Rauschen der Ausgabe) wird `vec4<f32>( max( Output.xyz, vec3<f32>( 0.0 ) ), Output.w )`
//   ohne-m1       das zweite Ziel (`output.m1`, der Glanz) wird `vec4<f32>( 0.0, 0.0, 0.0, 1.0 )` ohne seine Rechnung
//   zeilen:a-b    die Zeilen a…b von `main` (1-basiert in der Datei) fallen — NUR für Zuweisungen, deren Ziel danach niemand liest
const fs = require("fs");
const [ziel, ...rest] = process.argv.slice(2);
if (!ziel || !rest.length) throw new Error("halb-bau.cjs <ziel.json> <name>=<datei.wgsl>[:<schnitt>+…] …");
const MISCH = /^(\s*)(nodeVar\d+) = vec4<f32>\( mix\( \( Output\.xyz \* nodeVar\d+ \), nodeVar\d+, .*$/m;
const SCHNITTE = {
    "luft-tot": (t) => {
        if (!MISCH.test(t)) throw new Error("luft-tot: keine Misch-Zeile der Luft");
        return t.replace(MISCH, "$1$2 = Output;");
    },
    "luft-leer": (t) => {
        const z = t.split("\n");
        const m = z.findIndex((l) => MISCH.test(l));
        let a = m;
        while (a > 0 && !/^\s*Output = max\( vec4<f32>\( \( outgoingLight \+ EmissiveColor \)/.test(z[a])) a--;
        if (m < 0 || a <= 0) throw new Error("luft-leer: Abschnitt der Luft nicht gefunden");
        const ziel = MISCH.exec(z[m]);
        return [...z.slice(0, a + 1), `${ziel[1]}${ziel[2]} = Output;`, ...z.slice(m + 1)].join("\n");
    },
    "ton-tot": (t) => {
        const re = /^(\s*)(nodeVar\d+) = vec4<f32>\( max\( \( (nodeVar\d+) \+ \( exp2\( \( floor\( log2\(.*$/m;
        if (!re.test(t)) throw new Error("ton-tot: keine Zeile der Ausgabe-Rasterung");
        return t.replace(re, "$1$2 = vec4<f32>( $3, Output.w );");
    },
    "ohne-m1": (t) => {
        const re = /^(\s*)output\.m1 = nodeVar\d+;$/m;
        if (!re.test(t)) throw new Error("ohne-m1: kein zweites Ziel");
        return t.replace(re, "$1output.m1 = vec4<f32>( 0.0, 0.0, 0.0, 1.0 );");
    },
};
// ein Ruf mit ausgeglichenen Klammern: jeder Ruf von `fn(` bekommt `um(args)` als neue Argument-Liste
const jederRuf = (t, fn, um) => {
    let aus = "";
    let i = 0;
    for (;;) {
        const k = t.indexOf(fn + "(", i);
        if (k < 0) break;
        if (/[A-Za-z0-9_]/.test(t[k - 1] || "")) {
            aus += t.slice(i, k + fn.length);
            i = k + fn.length;
            continue;
        }
        let tiefe = 0;
        let e = k + fn.length;
        for (; e < t.length; e++) {
            if (t[e] === "(") tiefe++;
            else if (t[e] === ")" && --tiefe === 0) break;
        }
        aus += t.slice(i, k) + um(t.slice(k + fn.length + 1, e));
        i = e + 1;
    }
    return aus + t.slice(i);
};
// vergleich-level   jeder Schatten-Vergleich `textureSampleCompare` wird `textureSampleCompareLevel` (Stufe 0, keine Ableitung)
// abtast-level      jedes `textureSample` (mit Ableitung) wird `textureSampleLevel( …, 0.0 )` — NICHT bildgleich, nur die Frage,
//                   was die Ableitungen im verzweigten Rumpf an Übersetzung kosten
SCHNITTE["vergleich-level"] = (t) => jederRuf(t, "textureSampleCompare", (a) => "textureSampleCompareLevel(" + a + ")");
SCHNITTE["abtast-level"] = (t) => jederRuf(t, "textureSample", (a) => "textureSampleLevel(" + a.replace(/\s+$/, "") + ", 0.0 )");
const shader = {};
for (const e of rest) {
    const [name, r] = [e.slice(0, e.indexOf("=")), e.slice(e.indexOf("=") + 1)];
    const k = r.search(/:(?![\\/])/); // ein Doppelpunkt, der kein Laufwerk ist
    const [datei, schnitte] = k > 1 ? [r.slice(0, k), r.slice(k + 1).split("+")] : [r, []];
    let t = fs.readFileSync(datei, "utf8");
    for (const s of schnitte) {
        const zl = /^zeilen:(\d+)-(\d+)$/.exec(s);
        if (zl) {
            const z = t.split("\n");
            z.splice(Number(zl[1]) - 1, Number(zl[2]) - Number(zl[1]) + 1);
            t = z.join("\n");
        } else if (SCHNITTE[s]) t = SCHNITTE[s](t);
        else throw new Error("unbekannter Schnitt " + s);
    }
    if (shader[name]) throw new Error("Name doppelt: " + name);
    shader[name] = t;
    console.log(name.padEnd(28), String(t.length).padStart(7), "Zeichen", schnitte.join("+") || "(Stand)");
}
fs.writeFileSync(ziel, JSON.stringify({ shader }));
