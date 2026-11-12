// shader-kosten.cjs — DIE SHADER-KOSTEN-LINSE (Gebot 10: die Linse nennt den Täter beim Namen): die Pass-Stempel und die
// Zerlegung nennen den Verbraucher, nicht seine Arbeit je Pixel. Was ein Fragment KOSTEN KANN, steht im
// erzeugten WGSL (r184 TSL → WGSL, dasselbe, das die GPU zieht): diese Linse liest es je Programm (dem NodeBuilderState, den
// r184 je Material × Objekt-Art × Pass baut) und zählt statisch, über alle Funktions-Aufrufe ausmultipliziert:
//   Zugriffe — textureSample* · textureLoad · textureGather*: je Art (Proben · Schatten-Vergleiche · Ladungen · Sammeln) und
//     je Ort: UNBEDINGT (jedes Fragment zahlt sie), im ZWEIG (if/else/switch — eine Uniform-Bedingung zahlt nur, wenn sie
//     gilt) oder in einer SCHLEIFE (je Durchlauf)
//   Ableitungen (dpdx/dpdy/fwidth) · Schleifen · Verzweigungen · eine Ops-Schätzung (Operatoren + Builtins; Transzendente,
//     normalize und length gewichtet — eine Zählung des Programms, keine Zyklen)
//   Rauschen — Aufrufe einer Funktion mit noise/perlin/simplex/worley/fbm im Namen (MaterialX `mx_perlin_noise_*`: je Aufruf
//     8 Gitter-Hashes); eine Rausch-Funktion IN einer Rausch-Funktion zählt nicht extra. Das RAUSCH-GESETZ des Bodens
//     (`_rauschAtlas`) ist keine Funktion: es liegt im Graph des Stoffs und zeigt sich als Ladungen (6 je Raum-Wert, 2 je Ebene).
// Kein Lauf-Maß: welcher Zweig gilt und wie oft eine Schleife läuft, entscheidet die GPU — die Zahl ist die OBERGRENZE der
// Arbeit je Fragment und der Ort, an dem eine Stufe gratis werden KANN. Die Zeit misst die gpu-bank am ruhigen Messplatz.
//
// DAS BUDGET JE STOFF (`STOFFE`): ein Stoff des Spiels (der Zustands-Schlüssel seines Materials) und seine Decke — ein neues
// Rauschen je Fragment fällt hier auf, bevor es Millisekunden kostet.
//
// DER STOFF-GRAPH (GPU-frei, für den Playtest auf dem Null-Renderer): der Knoten-Graph eines Stoffs VOR dem Bau — dieselbe
// Rausch-Regel an den Funktions-Knoten (ein Aufruf mit Layout, `mx_noise_float` ist ein Überladungs-Knoten), dazu die
// Texturen je Name; ein Fn-Aufruf ohne Layout baut seinen Rumpf erst im Compiler — die Linse LIEST ihn wie der Bau (unter
// einem eigenen Stapel der TSL: der Rumpf einer Fn, der Zweig eines `If`, der Rumpf einer Schleife; `gelesen`), und sein
// Inhalt zählt wie jeder Knoten; nur ein Rumpf, der sich nicht lesen lässt (er liest den Bauer oder wirft), bleibt `verborgen`.
//
//   Node:   wgslKosten(wgsl) → { einstieg, abtastungen: {gesamt, unbedingt, zweig, schleife}, proben, vergleiche, ladungen,
//           sammeln, ableitungen, schleifen, verzweigungen, ops, rauschen, rauschNamen, rauschJeAufruf }
//           kostenUrteil(kosten, budget, name) → [Verletzungen]  (budget: unbedingtMax · zweigMin · schleifeMax · rauschenMax ·
//           opsMax · ladungenMax · probenMax; ein unbekannter Schlüssel wirft)
//           kostenTabelle(nachher, vorher) · stoffGraph(stoff, rauschQuelle) · selbsttest() → [Fehler] · STOFFE
//   Seite:  window.__shaderKosten({ frames, stoffe }) → [{ programm, objekte, klassen, stoffe, fragment }] — EIN echter Frame
//           (`_loopRender`), je gezeichnetem Programm das erzeugte Fragment-WGSL (Bundles nehmen dafür neu auf)
//           window.__stoffGraph(stoff) → { slots, knoten, rauschen, rauschNamen, texturen, verborgen, gelesen, zweig }
//   Werkbank: node scripts/werkbank.cjs shader [--nur <regex>] [--top n] [--ordner d]
//                                              [--stoff boden [--gegen alt.wgsl] [--datei neu.wgsl]]
//             node scripts/werkbank.cjs shader --selbsttest
"use strict";

const ZUGRIFF =
    /\btexture(Sample(?:Level|Bias|Grad|CompareLevel|Compare|BaseClampToEdge)?|Load|Gather(?:Compare)?)\s*\(/g;
const RAUSCH_NAME = /noise|perlin|simplex|worley|fbm/i;
const ABLEITUNG = /\b(?:dpdx|dpdy|fwidth)(?:Fine|Coarse)?\s*\(/g;
const SCHLEIFE = /\b(?:for|loop|while)\b/g;
const VERZWEIGUNG = /\bif\s*\(/g;
const OPERATOR = /<<|>>|&&|\|\||==|!=|<=|>=|[+\-*/%&|^<>]/g;
const SCHWER = /\b(?:pow|exp|exp2|log|log2|sin|cos|tan|asin|acos|atan|atan2|sqrt|inverseSqrt|normalize)\s*\(/g;
const MITTEL = /\b(?:length|distance|cross|reflect|refract)\s*\(/g;
const LEICHT =
    /\b(?:mix|smoothstep|clamp|dot|floor|ceil|fract|round|trunc|abs|min|max|step|sign|select|saturate|fma)\s*\(/g;

// DIE STOFFE mit Budget: der Zustands-Schlüssel des Materials (`state[zustand]`) und die Decke je Fragment. Boden (Welle G,
// gemessen am Boden-Stoff des echten Frames): kein Gitter-Rauschen — die zwei erlaubten Rausch-Aufrufe sind r184s Schatten-
// Dither (`interleavedGradientNoise`, 4 Ops je Aufruf, je Kaskade einer); ein MaterialX-Rauschen (548 Ops) bricht dazu die
// Ops-Decke —, die Ladungen des Rausch-Atlas (76, seit K53 ohne den Fleck des Wiesen-Grunds) und die Ops-Schätzung unter der Decke.
// Die Zeichen eines Programms (`zeichen`) urteilen nur als RATSCHE eines benannten Programms (`zeichenMax`, die Prüfbühne S0:
// das Boden-Programm, `S0_ZEICHEN` in scripts/diag-pruefbuehne.cjs — der Stand des Tages + 5 %, sie fällt nur); die kalte
// Übersetzung auf echter GPU ist Auskunft, nie Urteil im Zug (Wanduhr eines geteilten Läufers, z409 12.11.). Bis 07.11. hier die
// feste Decke 100 000 Zeichen für jeden Stoff — 4 Züge fielen an 100 211–122 088 Zeichen, während S0 auf der GTX in 14–15 s stand.
// Keine Hilfs-Funktion liest eine Bindung (`bindungInFunktionMax` 0, `bindungenInFunktionen`).
// EINE Abtastung in einer Schleife (`schleifeMax` 1: die Himmels-Tafel des Grat-Himmels, drei Durchläufe im Zweig): der
// Luftschatten las die Horizont-Karte in einer zweiten, achtmal je Fragment JEDES Stoffs — GTX 1060, Mess-Wiese Ego 34,3 ms
// gegen 26,9 an den Ecken (w28-horizont-gtx, `_luftEnsure`); am Kopf 4e2df19b zählt die Linse 2 und ist ROT.
const STOFFE = Object.freeze({
    boden: Object.freeze({
        zustand: "voxelChunkMaterial",
        budget: Object.freeze({
            schleifeMax: 1,
            rauschenMax: 2,
            ladungenMax: 90,
            probenMax: 12,
            opsMax: 2400,
            bindungInFunktionMax: 0,
        }),
    }),
});

const zaehle = (s, re) => (s.match(re) || []).length;

// Kommentare raus (die Zählung liest nur Code).
const { ohneKommentare } = require("./stamm.cjs");

// Die Funktionen eines WGSL-Moduls: Name → Rumpf (ohne die äußeren Klammern) und der Name des Fragment-Einstiegs.
function funktionen(code) {
    const aus = new Map();
    let einstieg = null;
    const re = /(@fragment\s+)?\bfn\s+([A-Za-z_]\w*)\s*\(/g;
    let m;
    while ((m = re.exec(code))) {
        const name = m[2];
        // die Klammer des Rumpfs: nach der Parameter-Liste (und dem Rückgabe-Typ) die erste `{`
        let i = re.lastIndex,
            tief = 1;
        while (i < code.length && tief > 0) {
            if (code[i] === "(") tief++;
            else if (code[i] === ")") tief--;
            i++;
        }
        const auf = code.indexOf("{", i);
        if (auf < 0) break;
        let j = auf + 1;
        tief = 1;
        while (j < code.length && tief > 0) {
            if (code[j] === "{") tief++;
            else if (code[j] === "}") tief--;
            j++;
        }
        aus.set(name, code.slice(auf + 1, j - 1));
        if (m[1]) einstieg = name;
        re.lastIndex = j;
    }
    return { aus, einstieg };
}

// Die Orte eines Rumpfs: für jede Stelle die Art des innersten umschließenden Blocks (unbedingt · zweig · schleife).
// Ein Block erbt: in einer Schleife bleibt alles Schleife, in einem Zweig alles Zweig (Schleife schlägt Zweig).
function ortAn(rumpf) {
    const art = new Array(rumpf.length);
    const stapel = [];
    let wartend = null;
    let klammer = 0; // runde Klammern: das `;` im Kopf einer for-Schleife beendet keine Anweisung
    const wort = /[A-Za-z_]\w*/y;
    for (let i = 0; i < rumpf.length; i++) {
        const c = rumpf[i];
        if (c === "(") klammer++;
        else if (c === ")") klammer = Math.max(0, klammer - 1);
        if (/[A-Za-z_]/.test(c) && (i === 0 || !/\w/.test(rumpf[i - 1]))) {
            wort.lastIndex = i;
            const w = wort.exec(rumpf);
            if (w) {
                const k = w[0];
                if (k === "if" || k === "else" || k === "switch" || k === "case" || k === "default") wartend = "zweig";
                else if (k === "for" || k === "loop" || k === "while") wartend = "schleife";
            }
        } else if (c === "{") {
            const oben = stapel.length ? stapel[stapel.length - 1] : "unbedingt";
            const neu = wartend || "block";
            stapel.push(
                oben === "schleife" || neu === "schleife"
                    ? "schleife"
                    : oben === "zweig" || neu === "zweig"
                      ? "zweig"
                      : oben
            );
            wartend = null;
        } else if (c === "}") stapel.pop(); else if (c === ";" && klammer === 0) wartend = null;
        art[i] = stapel.length ? stapel[stapel.length - 1] : "unbedingt";
    }
    // „block" ohne Zweig/Schleife darüber ist unbedingt
    return (i) => (art[i] === "block" || art[i] === undefined ? "unbedingt" : art[i]);
}

// DAS TSL-LECK (B7 in gate:wasser-leben:bild; w4-licht-baustein e09ca48e): r184 schreibt einen Knoten dorthin, wo er
// ZUERST gebaut wird — konsumiert ein Baustein einen Knoten des Aufrufers nur in seinem `If`, steht dessen Zuweisung im
// if-Block, und jeder spätere Leser außerhalb liest dort, wo der Zweig nicht lief, die ungerechnete private Variable (0).
// Je Funktion jede Variable, deren erste Zuweisung in Zweig oder Schleife steht; ein else, das ihr unmittelbar zuweist
// (r184 `select`), deckt das Paar, und es zählt am Ort seines `if`. Leck: danach liest sie eine unbedingte Stelle —
// [{ name, gesetzt, gelesen }] als Anweisungstext (gesetzt mit dem Kopf des Zweigs).
function tslLecks(wgsl) {
    const aus = [];
    for (const rumpf of funktionen(ohneKommentare(wgsl)).aus.values()) {
        const ort = ortAn(rumpf);
        const zeile = (i) =>
            rumpf
                .slice(rumpf.lastIndexOf("\n", i) + 1)
                .split("\n")[0]
                .trim()
                .slice(0, 160);
        // je Stelle die innerste offene Klammer, je Klammer ihre schließende; je Variable die Orte ihrer Zuweisungen
        const [offen, schluss, zuw] = [[], [], new Map()];
        for (let i = 0, s = [-1]; i < rumpf.length; i++) {
            if (rumpf[i] === "}") schluss[s.pop()] = i;
            offen[i] = s[s.length - 1];
            if (rumpf[i] === "{") s.push(i);
        }
        for (const m of rumpf.matchAll(/^\s*(\w+)\s*=(?!=)/gm))
            zuw.set(m[1], [...(zuw.get(m[1]) || []), m.index + m[0].length]);
        for (const [name, [i, ...weitere]] of zuw) {
            let [p, a] = [i, -1];
            while (ort(p) !== "unbedingt") {
                a = offen[p];
                if (!weitere.some((k) => /^\s*else\s*$/.test(rumpf.slice(schluss[a] + 1, offen[k])))) break;
                p = a - 1;
            }
            const leser = new RegExp(`(?<![.\\w])${name}\\b`, "g");
            leser.lastIndex = i;
            let n;
            while (ort(p) !== "unbedingt" && (n = leser.exec(rumpf)) && ort(n.index) !== "unbedingt");
            if (n) aus.push({ name, gesetzt: `${zeile(a)} ${zeile(i)} }`, gelesen: zeile(n.index) });
        }
    }
    return aus;
}

// Die Ops-Schätzung eines Rumpfs (ohne Aufrufe): Typ-Annotationen und Deklarationen fallen vor der Operator-Zählung
// (`vec3<f32>` ist kein Vergleich, `var x : f32;` keine Arbeit, `-> f32` kein Minus).
function opsSchaetzung(rumpf) {
    let s = rumpf.replace(/^\s*var\s+\w+\s*:[^=;]*;/gm, "");
    for (let alt = ""; alt !== s;) {
        alt = s;
        s = s.replace(/(\w)\s*<[^<>()=;]*>/g, "$1");
    }
    s = s.replace(/->\s*\w+/g, "");
    return zaehle(s, OPERATOR) + 4 * zaehle(s, SCHWER) + 3 * zaehle(s, MITTEL) + zaehle(s, LEICHT);
}

const SUMMEN = ["proben", "vergleiche", "ladungen", "sammeln", "ableitungen", "schleifen", "verzweigungen", "ops"];

function leer() {
    const k = { abtastungen: { gesamt: 0, unbedingt: 0, zweig: 0, schleife: 0 }, rauschen: 0, rauschNamen: {} };
    for (const f of SUMMEN) k[f] = 0;
    return k;
}

function artVon(z) {
    if (z === "Load") return "ladungen";
    if (z.startsWith("SampleCompare")) return "vergleiche";
    if (z.startsWith("Gather")) return "sammeln";
    return "proben";
}

// DIE KOSTEN EINES MODULS je Fragment: je Funktion die eigenen Kosten, der Einstieg zählt die Aufrufe seiner Hilfs-
// Funktionen am Aufruf-Ort mit (WGSL kennt keine Rekursion; ein Kreis bricht ab).
function wgslKosten(wgsl) {
    const code = ohneKommentare(wgsl);
    const { aus: fns, einstieg } = funktionen(code);
    const memo = new Map();
    const kostenVon = (name, pfad) => {
        if (memo.has(name)) return memo.get(name);
        const rumpf = fns.get(name);
        const k = leer();
        if (rumpf == null || pfad.has(name)) return k;
        pfad.add(name);
        const ort = ortAn(rumpf);
        let m;
        ZUGRIFF.lastIndex = 0;
        while ((m = ZUGRIFF.exec(rumpf))) {
            k.abtastungen.gesamt++;
            k.abtastungen[ort(m.index)]++;
            k[artVon(m[1])]++;
        }
        k.ableitungen += zaehle(rumpf, ABLEITUNG);
        k.schleifen += zaehle(rumpf, SCHLEIFE);
        k.verzweigungen += zaehle(rumpf, VERZWEIGUNG);
        k.ops += opsSchaetzung(rumpf);
        // Aufrufe: eine eigene Funktion trägt ihre Kosten an den Aufruf-Ort; eine fremde mit dem Rausch-Namen (die EINE Regel
        // RAUSCH_NAME, auch `noise3(`) zählt als Rauschen
        const ruf = /\b([A-Za-z_]\w*)\s*\(/g;
        while ((m = ruf.exec(rumpf))) {
            const f = m[1];
            if (f === name) continue;
            if (!fns.has(f)) {
                if (RAUSCH_NAME.test(f)) {
                    k.rauschen++;
                    k.rauschNamen[f] = (k.rauschNamen[f] || 0) + 1;
                }
                continue;
            }
            const o = ort(m.index);
            const u = kostenVon(f, pfad);
            k.abtastungen.gesamt += u.abtastungen.gesamt;
            if (o === "unbedingt") {
                k.abtastungen.unbedingt += u.abtastungen.unbedingt;
                k.abtastungen.zweig += u.abtastungen.zweig;
                k.abtastungen.schleife += u.abtastungen.schleife;
            } else k.abtastungen[o] += u.abtastungen.gesamt;
            for (const s of SUMMEN) k[s] += u[s];
            if (RAUSCH_NAME.test(f)) {
                // EIN Rauschen je Aufruf — was die Rausch-Funktion intern ruft, trägt sie selbst
                k.rauschen++;
                k.rauschNamen[f] = (k.rauschNamen[f] || 0) + 1;
            } else {
                k.rauschen += u.rauschen;
                for (const [n, c] of Object.entries(u.rauschNamen)) k.rauschNamen[n] = (k.rauschNamen[n] || 0) + c;
            }
        }
        pfad.delete(name);
        memo.set(name, k);
        return k;
    };
    const name = einstieg || (fns.has("main") ? "main" : null);
    const k = name ? kostenVon(name, new Set()) : leer();
    // je Aufruf: was eine Rausch-Funktion des Moduls einmal kostet (für die Tabelle)
    const rauschJeAufruf = {};
    for (const n of fns.keys()) if (RAUSCH_NAME.test(n)) rauschJeAufruf[n] = kostenVon(n, new Set()).ops;
    return {
        einstieg: name,
        funktionen: fns.size,
        zeichen: String(wgsl).length,
        ...k,
        rauschJeAufruf,
        bindungInFunktion: bindungenInFunktionen(code, fns, name),
    };
}

// DIE BINDUNG IN EINER HILFS-FUNKTION (K17-3 Runde 2): r184 baut eine Layout-Funktion (`Fn().setLayout`) EINMAL je
// Builder-KLASSE (`nodeBuilderFunctionsCacheMap`, vendor/three.webgpu.min.js: `Fi.get(e.constructor)`) und hängt denselben
// Text an jedes Programm — eine Uniform, Textur oder ein Puffer darin trägt den Namen aus dem Programm, das sie zuerst baute.
// Die Wiese (`wieseRelief`) las den Rausch-Atlas als `nodeUniform0`; im Programm der Prüfbühne hieß so ein f32 im Uniform-
// Block: `unresolved value 'nodeUniform0'`, die Pipeline fiel. Eine Hilfs-Funktion liest darum keine Bindung des Moduls
// (eine `var` auf Modul-Ebene oder einen r184-Bindungs-Namen) — je Täter die Funktion und die Namen.
function bindungenInFunktionen(code, fns, einstieg) {
    const global = new Set();
    let tief = 0;
    const deklar = /\bvar\s*(?:<[^>]*>)?\s*([A-Za-z_]\w*)/y;
    for (let i = 0; i < code.length; i++) {
        const c = code[i];
        if (c === "{") tief++;
        else if (c === "}") tief--;
        else if (tief === 0 && c === "v" && (i === 0 || !/\w/.test(code[i - 1]))) {
            deklar.lastIndex = i;
            const m = deklar.exec(code);
            if (m) global.add(m[1]);
        }
    }
    const r184 = /^(?:nodeUniform\d+|NodeBuffer_\w+|nodeVarying\d+|nodeUniformsSampler\w*)$/;
    const aus = [];
    for (const [f, rumpf] of fns) {
        if (f === einstieg || f === "main") continue;
        // die eigenen Namen der Funktion: ihre Parameter und was ihr Rumpf deklariert (r184 nennt die Variablen einer Layout-
        // Funktion wie die `var<private>` des Einstiegs: `nodeVar0` — die eigene verdeckt die des Moduls)
        const eigen = new Set();
        const kopf = new RegExp(`\\bfn\\s+${f}\\s*\\(([^)]*)\\)`).exec(code);
        for (const p of (kopf ? kopf[1] : "").matchAll(/([A-Za-z_]\w*)\s*:/g)) eigen.add(p[1]);
        for (const d of rumpf.matchAll(/\b(?:var|let|const)\s*(?:<[^>]*>)?\s*([A-Za-z_]\w*)/g)) eigen.add(d[1]);
        const namen = new Set();
        for (const w of rumpf.match(/\b[A-Za-z_]\w*\b/g) || [])
            if (!eigen.has(w) && (global.has(w) || r184.test(w))) namen.add(w);
        if (namen.size) aus.push({ fn: f, namen: [...namen] });
    }
    return aus;
}

// DAS URTEIL gegen ein Budget je Programm: jede Verletzung beim Namen. Ein unbekannter Budget-Schlüssel wirft (eine
// vertippte Decke prüfte sonst still nichts).
const GRENZEN = {
    unbedingtMax: [
        (k) => k.abtastungen.unbedingt,
        "≤",
        "unbedingte Abtastungen je Fragment",
        " — eine Stufe zahlt auch, wenn sie nichts zeigt",
    ],
    zweigMin: [
        (k) => k.abtastungen.zweig,
        "≥",
        "Abtastungen in Zweigen",
        " — eine Stufe steht nicht mehr hinter ihrer Stärke",
    ],
    schleifeMax: [(k) => k.abtastungen.schleife, "≤", "Abtastungen in Schleifen", ""],
    zeichenMax: [
        (k) => k.zeichen,
        "≤",
        "Zeichen WGSL",
        " — die Ratsche des Programms (der Stand + 5 %, sie fällt nur): jedes Zeichen übersetzt der GPU-Prozess vor dem ersten Bild",
    ],
    rauschenMax: [(k) => k.rauschen, "≤", "Rausch-Aufrufe je Fragment", ""],
    opsMax: [(k) => k.ops, "≤", "Ops je Fragment (Schätzung)", ""],
    ladungenMax: [(k) => k.ladungen, "≤", "Ladungen je Fragment", ""],
    probenMax: [(k) => k.proben, "≤", "Proben je Fragment", ""],
    bindungInFunktionMax: [
        (k) => k.bindungInFunktion.length,
        "≤",
        "Hilfs-Funktionen lesen eine Bindung des Moduls",
        " — r184 baut eine Layout-Funktion EINMAL je Builder-Klasse, jedes weitere Programm erbt die Bindungs-Namen des ersten",
        (k) => k.bindungInFunktion.map((b) => `${b.fn}: ${b.namen.join(", ")}`).join(" · "),
    ],
};
function kostenUrteil(k, budget, name) {
    const n = name || "Programm";
    for (const s of Object.keys(budget || {}))
        if (!GRENZEN[s]) throw new Error(`kostenUrteil: unbekannter Budget-Schlüssel „${s}"`);
    if (!k || !k.einstieg) return [`${n}: kein Fragment-Einstieg im WGSL gefunden (die Linse ist blind)`];
    const v = [];
    for (const [s, grenze] of Object.entries(budget || {})) {
        if (grenze == null) continue;
        const [lies, rel, was, warum, taeter] = GRENZEN[s];
        const ist = lies(k);
        if (rel === "≤" ? ist > grenze : ist < grenze) {
            const namen =
                s === "rauschenMax" && ist > 0
                    ? ` (${Object.entries(k.rauschNamen)
                          .map(([f, c]) => f + " ×" + c)
                          .join(", ")})`
                    : taeter
                      ? ` (${taeter(k)})`
                      : "";
            v.push(`${n}: ${ist} ${was}${namen} (Budget ${rel} ${grenze})${warum}`);
        }
    }
    return v;
}

// Die Tabelle eines Programms (und seines Vorgängers daneben).
function kostenTabelle(nach, vor) {
    const posten = [
        ["rauschen", (k) => k.rauschen],
        ["abtastungen", (k) => k.abtastungen.gesamt],
        ["  unbedingt", (k) => k.abtastungen.unbedingt],
        ["  im Zweig", (k) => k.abtastungen.zweig],
        ["  in Schleife", (k) => k.abtastungen.schleife],
        ...SUMMEN.map((f) => [f, (k) => k[f]]),
    ];
    const z = [];
    const kopf = vor ? ["Posten je Fragment", "vorher", "nachher"] : ["Posten je Fragment", "Wert"];
    z.push(kopf.map((s, i) => (i ? s.padStart(10) : s.padEnd(22))).join(""));
    for (const [n, lies] of posten) {
        const a = vor ? [lies(vor), lies(nach)] : [lies(nach)];
        z.push(n.padEnd(22) + a.map((v) => String(v).padStart(10)).join(""));
    }
    const r = Object.entries(nach.rauschJeAufruf || {}).map(([n, o]) => `${n}: ${o} Ops`);
    if (vor) r.unshift(...Object.entries(vor.rauschJeAufruf || {}).map(([n, o]) => `(vorher) ${n}: ${o} Ops`));
    return z.join("\n") + (r.length ? "\nje Aufruf: " + r.join(" · ") : "");
}

// DER STOFF-GRAPH: jeder Knoten einmal (id), von jedem `…Node`-Slot des Stoffs über `getChildren()` (r184 Node: jede
// eigene Eigenschaft ohne `_`, die ein Knoten ist oder Knoten trägt). Ein Fn-Aufruf ohne Layout baut seinen Rumpf erst im
// Compiler: ist er ein Knoten der TSL-Bibliothek selbst (`tsl`: jeder exportierte Knoten samt Graph — positionWorld,
// cameraPosition, normalView …), zählt er als `bibliothek`; ein Rumpf des Spiels wird GELESEN (`lies` unten: `gelesen`, sein
// Inhalt zählt), und nur der, der sich nicht lesen lässt, bleibt `verborgen` (dort könnte ein Rauschen wohnen). Ohne Lesen
// zählen die ZWEIGE des Stamms (`zweige`: die Rümpfe von
// `AnazhRealm._zweigTSL`, K17-2) — ihr Rumpf liest nur seine Argumente, und die sind Kinder des Aufrufs: der Graph sieht den
// Inhalt, gezählt als `zweig`. Dazu je benanntem Uniform seine Knoten (`uniformen`: der Schirm-Pixel des Mikro-Details,
// material.K2). Rein — läuft in der Seite und im Selbsttest.
function stoffGraph(stoff, rauschQuelle, tsl, zweige) {
    const ist = new RegExp(rauschQuelle, "i");
    const aus = {
        slots: [],
        knoten: 0,
        rauschen: 0,
        rauschNamen: {},
        texturen: {},
        verborgen: 0,
        gelesen: 0,
        bibliothek: 0,
        zweig: 0,
        uniformen: {},
    };
    if (!stoff) return Object.assign(aus, { fehler: "kein Stoff" });
    const bib = new Set();
    const offen = [];
    for (const k of Object.keys(tsl || {})) {
        const v = tsl[k];
        if (v?.isNode === true) offen.push(v);
    }
    while (offen.length) {
        const n = offen.pop();
        if (bib.has(n.id)) continue;
        bib.add(n.id);
        for (const c of n.getChildren()) offen.push(c);
    }
    const stapel = [];
    for (const s of Object.keys(stoff)) {
        const v = stoff[s];
        if (/Node$/.test(s) && v && v.isNode === true) {
            aus.slots.push(s);
            stapel.push(v);
        }
    }
    // DER RUMPF WIRD GELESEN (w28-baum-programm): ein Rumpf ohne Layout entsteht erst im Bau — der Aufruf einer Fn
    // (`ShaderCallNodeInternal.call`: jsFunc(Eingänge, Bauer)), der Zweig eines `If` (`StackNode.If`: ein Fn-Knoten ohne Eingänge)
    // und der Rumpf einer Schleife (`LoopNode.getProperties`: die letzte Funktion der Parameter, ihre Zähler als Ausdrücke). Die
    // Linse geht ihn wie der Bau: unter EINEM eigenen Stapel der TSL (`stack`, `setCurrentStack`), und jeder Knoten, den er legt
    // oder zurückgibt, zählt wie jeder Knoten des Graphen (Rauschen, Texturen, weitere Rümpfe). Statt des Bauers reist ein
    // Platzhalter, der beim ersten Griff wirft: ein Rumpf, der den Bauer liest oder sonst wirft, bleibt `verborgen` — wie ohne
    // die Stapel-Glieder der TSL (der Selbsttest ohne sie, eine Vendor-Drift). Bis hier war JEDER Rumpf des Spiels verborgen,
    // und der Boden durfte keinen tragen: die Pool-Schleifen des Lichts (`_lichtPoolTerm`, das Dach) brauchen ihre Fn-Hülle,
    // nur in ihrem Bau hat `Loop` einen Stapel.
    const kannLesen =
        !!tsl && [tsl.stack, tsl.setCurrentStack, tsl.getCurrentStack, tsl.expression].every((f) => typeof f === "function");
    const bauer = new Proxy(
        {},
        {
            get(o, k) {
                if (k === Symbol.iterator)
                    return function* () {
                        yield;
                    };
                throw new Error("der Rumpf liest den Bauer: " + String(k));
            },
        }
    );
    const gelesenDa = new Set();
    const versucht = new Set(); // jeder Rumpf EINMAL: der Fn-Knoten eines Aufrufs ist auch sein Kind
    // → true, wenn der Rumpf gelesen ist: seine Knoten liegen auf dem Stapel des Gangs
    const lies = (rumpf, bau) => {
        if (gelesenDa.has(rumpf)) return true;
        versucht.add(rumpf);
        if (!kannLesen) return false;
        const vor = tsl.getCurrentStack();
        let s = null;
        let ergebnis = null;
        try {
            s = tsl.stack();
            tsl.setCurrentStack(s);
            ergebnis = bau();
        } catch {
            return false;
        } finally {
            tsl.setCurrentStack(vor);
        }
        gelesenDa.add(rumpf);
        aus.gelesen++;
        for (const c of (s && s.nodes) || []) if (c && c.isNode === true) stapel.push(c);
        if (s && s.outputNode && s.outputNode.isNode === true) stapel.push(s.outputNode);
        if (ergebnis && ergebnis.isNode === true) stapel.push(ergebnis);
        return true;
    };
    // die Eingänge eines Aufrufs, wie der Bau sie reicht: benannt (EIN schlichtes Objekt) oder als Reihe
    const eingaenge = (roh) =>
        roh.length === 1 && roh[0] && roh[0].isNode !== true && Object.getPrototypeOf(roh[0]) === Object.prototype ? roh[0] : roh;
    const gesehen = new Set();
    while (stapel.length) {
        const n = stapel.pop();
        if (gesehen.has(n.id)) continue;
        gesehen.add(n.id);
        aus.knoten++;
        let name = null;
        if (n.isShaderCallNodeInternal === true) {
            const sn = n.shaderNode;
            const lay = sn && sn.layout;
            const roh = Array.isArray(n.rawInputs) ? n.rawInputs : null;
            if (lay) name = lay.name;
            else if (bib.has(n.id)) aus.bibliothek++;
            else if (zweige && zweige.includes(sn)) aus.zweig++;
            else if (
                !sn ||
                typeof sn.jsFunc !== "function" ||
                !lies(sn, () => (roh && roh.length > 0) || sn.jsFunc.length > 1 ? sn.jsFunc(eingaenge(roh || []), bauer) : sn.jsFunc(bauer))
            )
                aus.verborgen++;
        } else if (typeof n.jsFunc === "function" && !n.layout && !bib.has(n.id) && !(zweige && zweige.includes(n))) {
            // ein Fn-Knoten ohne Aufruf (der Zweig eines `If`): sein Rumpf ohne Eingänge; den Rumpf eines Aufrufs zählte der Aufruf
            if (!versucht.has(n) && !lies(n, () => n.jsFunc(bauer))) aus.verborgen++;
        } else if (
            // die Schleife (r184 `LoopNode`: kein Kenn-Glied, sie trägt `params` und `getVarName`)
            typeof n.getVarName === "function" &&
            Array.isArray(n.params) &&
            typeof n.params[n.params.length - 1] === "function"
        ) {
            const zaehler = {};
            for (let i = 0; i < n.params.length - 1; i++) {
                const p = n.params[i];
                const nm = (p && p.isNode !== true && p.name) || n.getVarName(i);
                zaehler[nm] = kannLesen ? tsl.expression(nm, (p && p.isNode !== true && p.type) || "int") : null;
            }
            if (!lies(n, () => n.params[n.params.length - 1](zaehler))) aus.verborgen++;
        } else if (Array.isArray(n.functionNodes) && n.functionNodes.length) {
            const f = n.functionNodes[0];
            name = f?.shaderNode?.layout?.name || "Überladung";
        }
        if (name && ist.test(name)) {
            aus.rauschen++;
            aus.rauschNamen[name] = (aus.rauschNamen[name] || 0) + 1;
        }
        if (n.isUniformNode === true && n.name) aus.uniformen[n.name] = (aus.uniformen[n.name] || 0) + 1;
        if (n.isTextureNode === true && n.value) {
            const t = n.value.name || "namenlos";
            aus.texturen[t] = (aus.texturen[t] || 0) + 1;
        }
        for (const c of n.getChildren()) stapel.push(c);
    }
    return aus;
}

// DER SELBSTTEST: gebaute WGSL-Stücke und Knoten-Graphen, deren Kosten feststehen.
function selbsttest() {
    const fehler = [];
    const pruef = (name, ist, soll) => {
        const a = JSON.stringify(ist),
            b = JSON.stringify(soll);
        if (a !== b) fehler.push(`${name}: ${a} statt ${b}`);
    };
    // (1) die Orte: Zweig, Schleife, Hilfs-Funktion am Aufruf-Ort
    const modul = `
struct Out { @location(0) c : vec4<f32> };
fn hilf( uv : vec2<f32> ) -> vec4<f32> {
    // textureSample( t, s, uv ) im Kommentar zählt nicht
    return textureSample( tex, samp, uv ) + textureLoad( tex2, vec2<i32>( 0 ), 0 );
}
fn mx_noise_float( p : vec3<f32> ) -> f32 { return 0.0; }
@fragment
fn main( @builtin( position ) p : vec4<f32> ) -> Out {
    var a : vec4<f32>;
    a = textureSample( tex, samp, vec2<f32>( 0.5 ) );
    if ( render.staerke != 0.0 ) {
        a = a + textureSample( tex, samp, vec2<f32>( 0.1 ) );
        a = a + hilf( vec2<f32>( 0.2 ) );
    } else {
        a = a + textureSampleLevel( tex, samp, vec2<f32>( 0.3 ), 0.0 );
    }
    for ( var i : u32 = 0u; i < 4u; i ++ ) {
        a = a + textureLoad( tex2, vec2<i32>( i32( i ), 0 ), 0 );
        if ( a.x > 1.0 ) { a = a * mx_noise_float( a.xyz ); }
    }
    a = a + hilf( vec2<f32>( 0.4 ) );
    return Out( a );
}`;
    const k = wgslKosten(modul);
    pruef("Einstieg", k.einstieg, "main");
    // main: 1 unbedingt · Zweig: 1 + hilf(2) + 1 = 4 · Schleife: 1 · danach hilf(2) unbedingt → unbedingt 3
    pruef("Abtastungen", k.abtastungen, { gesamt: 8, unbedingt: 3, zweig: 4, schleife: 1 });
    pruef("Arten", [k.proben, k.ladungen, k.vergleiche, k.sammeln], [5, 3, 0, 0]);
    pruef("Schleifen", k.schleifen, 1);
    pruef("Rauschen", k.rauschen, 1);
    // Das Urteil: ein Budget, das hält, und je eines, das bricht — jedes beim Namen.
    pruef("Urteil hält", kostenUrteil(k, { unbedingtMax: 3, zweigMin: 4, schleifeMax: 1, rauschenMax: 1 }, "s"), []);
    const rot = kostenUrteil(k, { unbedingtMax: 2, zweigMin: 5, schleifeMax: 0, rauschenMax: 0 }, "s");
    pruef("Urteil rot (4 Verletzungen)", rot.length, 4);
    if (!rot.some((s) => /3 unbedingte Abtastungen/.test(s)))
        fehler.push("Urteil nennt die unbedingten Abtastungen nicht");
    if (!rot.some((s) => /mx_noise_float ×1/.test(s))) fehler.push("Urteil nennt die Rausch-Funktion nicht beim Namen");
    // Eine Stufe, die aus ihrem Zweig wandert, wird unbedingt (der Fall, den gate:post-kette bewacht).
    const ohneZweig = wgslKosten(modul.replace("if ( render.staerke != 0.0 ) {", "{"));
    pruef("Stufe ohne Zweig", ohneZweig.abtastungen.unbedingt, 6);
    // Die Bindung in einer Hilfs-Funktion: `hilf` liest die Texturen des Moduls (tex, tex2) — rot beim Namen; derselbe Zugriff
    // im Einstieg hält, eine reine Hilfs-Funktion hält, und ein r184-Bindungs-Name, den das Modul nicht deklariert (der Fall
    // der Prüfbühne: `nodeUniform0` war dort ein Feld im Uniform-Block), fällt ebenso.
    const modulB = `@group( 0 ) @binding( 1 ) var tex : texture_2d<f32>;\n@group( 0 ) @binding( 2 ) var tex2 : texture_2d<f32>;\n${modul}`;
    const bind = kostenUrteil(wgslKosten(modulB), { bindungInFunktionMax: 0 }, "s");
    if (!(bind.length === 1 && bind[0].includes("hilf: tex, tex2")))
        fehler.push(`Urteil nennt die Bindung in der Hilfs-Funktion nicht (${JSON.stringify(bind)})`);
    const rein = modulB.replace(
        "return textureSample( tex, samp, uv ) + textureLoad( tex2, vec2<i32>( 0 ), 0 );",
        "return vec4<f32>( uv, 0.0, 1.0 );"
    );
    pruef("reine Hilfs-Funktion hält", kostenUrteil(wgslKosten(rein), { bindungInFunktionMax: 0 }, "s"), []);
    const fremd = kostenUrteil(
        wgslKosten(rein.replace("vec4<f32>( uv, 0.0, 1.0 )", "textureLoad( nodeUniform0, vec2<i32>( 0 ), 0 )")),
        { bindungInFunktionMax: 0 },
        "s"
    );
    if (!(fremd.length === 1 && fremd[0].includes("hilf: nodeUniform0")))
        fehler.push(`Urteil nennt den geerbten r184-Namen nicht (${JSON.stringify(fremd)})`);
    // Ein Modul ohne Fragment-Einstieg (ein Compute-Modul) ist blind, nie grün.
    pruef("blind", kostenUrteil(wgslKosten("fn f() {}"), {}, "x").length, 1);
    // Eine vertippte Decke wirft, statt still nichts zu prüfen.
    let wirft = false;
    try {
        kostenUrteil(k, { rauschMax: 0 }, "s");
    } catch {
        wirft = true;
    }
    if (!wirft) fehler.push("ein unbekannter Budget-Schlüssel prüfte still nichts");

    // (2) die Arbeit je Fragment: Aufrufe multiplizieren, Typ-Annotationen sind keine Operatoren, ein eingeschmuggeltes
    // Hash-Rauschen bricht das Budget des Bodens, eine Rausch-Funktion in einer Rausch-Funktion zählt einmal.
    const W = `
fn hilf ( x : u32 ) -> u32 {
	var a : u32;
	a = ( x ^ 3u );
	return ( a * 5u );
}
fn probe ( p : vec2<f32> ) -> f32 {
	let t = textureLoad( tex, vec2<i32>( 1, 2 ), u32( 0u ) );
	return ( f32( hilf( 1u ) ) + t.x );
}
fn mx_gradient_float ( p : vec3<f32> ) -> f32 {
	return ( p.x * 0.5 );
}
fn mx_perlin_noise_float_1 ( p : vec3<f32> ) -> f32 {
	return ( mx_gradient_float( p ) + mx_gradient_float( p ) );
}
fn mx_fractal_noise_float ( p : vec3<f32> ) -> f32 {
	return ( mx_perlin_noise_float_1( p ) + mx_perlin_noise_float_1( p ) );
}
@fragment
fn main( @location( 0 ) uv : vec2<f32> ) -> OutputStruct {
	var v : f32;
	if ( ( uv.x > 0.5 ) ) {
		v = ( probe( uv ) * probe( uv ) );
	}
	v = ( v + dpdx( v ) );
	for ( var i : i32 = 0; i < 4; i ++ ) { v = mix( v, 1.0, 0.5 ); }
	return vec4<f32>( textureSample( tex2, tex2_sampler, uv ).xyz, pow( v, 2.0 ) );
}`;
    const b = wgslKosten(W);
    pruef(
        "Arbeit",
        [b.ladungen, b.proben, b.ableitungen, b.schleifen, b.verzweigungen, b.rauschen],
        [2, 1, 1, 1, 1, 0]
    );
    // hilf: ^ * = 2 · probe: + = 1, + 1 × hilf = 3 · main: > * + < ++(2) = 6 + mix 1 + pow 4 = 11, + 2 × probe = 17
    // (die Deklarationen `var v : f32;`, `vec2<i32>` und `-> OutputStruct` zählen nicht)
    pruef("Ops", b.ops, 17);
    const rausch = (n) => " * mx_perlin_noise_float_1( vec3<f32>( v ) )".repeat(n);
    const b2 = wgslKosten(
        W.replace(
            "v = ( v + dpdx( v ) );",
            `v = ( v + dpdx( v ) + mx_fractal_noise_float( vec3<f32>( v ) )${rausch(1)} );`
        )
    );
    // ein Fraktal + ein Perlin; das Perlin IM Fraktal zählt nicht extra
    pruef(
        "eingeschmuggeltes Rauschen",
        [b2.rauschen, b2.rauschNamen],
        [2, { mx_fractal_noise_float: 1, mx_perlin_noise_float_1: 1 }]
    );
    // mx_gradient_float: * = 1 · mx_perlin_noise_float_1: + und 2 × 1 = 3 · mx_fractal_noise_float: + und 2 × 3 = 7
    pruef("je Aufruf", b2.rauschJeAufruf, { mx_perlin_noise_float_1: 3, mx_fractal_noise_float: 7 });
    // das Boden-Budget lässt die zwei Schatten-Dither durch, ein drittes Rauschen nie
    if (kostenUrteil(b2, STOFFE.boden.budget, "boden").length) fehler.push("das Boden-Budget fiel bei zwei Rauschen");
    const b3 = wgslKosten(W.replace("v = ( v + dpdx( v ) );", `v = ( v + dpdx( v )${rausch(3)} );`));
    if (
        !kostenUrteil(b3, STOFFE.boden.budget, "boden").some((s) =>
            /3 Rausch-Aufrufe .*mx_perlin_noise_float_1 ×3/.test(s)
        )
    )
        fehler.push("das Boden-Budget fing das dritte Rauschen nicht beim Namen");
    // eine fremde Rausch-Funktion, deren Name mit der Regel BEGINNT (`noise3(`), zählt wie jede andere
    const b4 = wgslKosten(W.replace("v = ( v + dpdx( v ) );", "v = ( v + dpdx( v ) + noise3( v ) );"));
    pruef("fremdes Rauschen", [b4.rauschen, b4.rauschNamen], [1, { noise3: 1 }]);
    if (kostenUrteil(b, STOFFE.boden.budget, "boden").length) fehler.push("das Boden-Budget fiel ohne Grund");
    // Das TSL-Leck (je Funktion ein Fall): die erste Zuweisung im Zweig, danach ein unbedingter Leser — rot beim Namen und
    // mit dem Kopf des Zweigs; das select-Paar (if und else weisen zu) und die Variable vor dem Zweig (`toVar`) bleiben
    // still, ein select-Paar in einem Zweig nicht.
    const lecks = tslLecks(`
fn leck() -> f32 {
    if ( a ) {
        x = 1.0;
    }
    return x;
}
fn auswahl() -> f32 {
    if ( a ) {
        x = 1.0;
    } else {
        x = 2.0;
    }
    return x;
}
fn vorher() -> f32 {
    x = 0.0;
    if ( a ) {
        x = 1.0;
    }
    return x;
}
fn auswahlImZweig() -> f32 {
    if ( b ) {
        if ( a ) {
            x = 1.0;
        } else {
            x = 2.0;
        }
    }
    return x;
}`);
    pruef(
        "TSL-Leck",
        lecks.map((l) => [l.name, l.gesetzt, l.gelesen]),
        [
            ["x", "if ( a ) { x = 1.0; }", "return x;"],
            ["x", "if ( b ) { x = 1.0; }", "return x;"],
        ]
    );

    // (3) der Stoff-Graph: ein Knoten-Graph wie r184 ihn baut — Slots, geteilte Knoten einmal, Überladung und Aufruf mit
    // Layout sind Rauschen, ein Aufruf ohne Layout ist verborgen (oder Bibliothek, wenn die TSL ihn exportiert), Texturen
    // je Name.
    let id = 0;
    const knoten = (eig) => {
        const n = Object.assign({ isNode: true, id: id++ }, eig);
        n.getChildren = function* () {
            for (const v of Object.values(n)) if (Array.isArray(v)) {
                    for (const x of v) if (x?.isNode === true) yield x;
                } else if (v?.isNode === true) yield v;
        };
        return n;
    };
    const fn = (name) => ({ shaderNode: { layout: name ? { name } : null } });
    const atlas = { name: "rausch-atlas" };
    const laden = knoten({ isTextureNode: true, value: atlas });
    const geteilt = knoten({ a: laden, b: knoten({ isTextureNode: true, value: atlas }) });
    const mx = knoten({
        functionNodes: [fn("mx_perlin_noise_float_0"), fn("mx_perlin_noise_float_1")],
        parametersNodes: [geteilt],
    });
    const positionWorld = knoten({ isShaderCallNodeInternal: true, ...fn(null) });
    const tsl = { positionWorld, mix: () => null, PI: 3.14 };
    const stoff = {
        colorNode: knoten({ a: geteilt, b: knoten({ isShaderCallNodeInternal: true, ...fn(null), rawInputs: [] }) }),
        normalNode: knoten({ a: geteilt, n: mx, p: positionWorld }),
        roughnessNode: null,
        name: "kein Slot",
    };
    const g = stoffGraph(stoff, RAUSCH_NAME.source, tsl);
    pruef(
        "Graph",
        [g.slots, g.knoten, g.rauschen, g.texturen, g.verborgen, g.bibliothek],
        [["colorNode", "normalNode"], 8, 1, { "rausch-atlas": 2 }, 1, 1]
    );
    pruef("Graph ohne Bibliothek", stoffGraph(stoff, RAUSCH_NAME.source, null).verborgen, 2);
    // der Zweig des Stamms: sein Rumpf ist bekannt, sein Inhalt reist als Argument — der Graph zählt die Ladung darin
    const zweigRumpf = { layout: null };
    const imZweig = knoten({ isTextureNode: true, value: atlas });
    const stoffZ = {
        colorNode: knoten({ isShaderCallNodeInternal: true, shaderNode: zweigRumpf, rawInputs: [imZweig] }),
    };
    const gz = stoffGraph(stoffZ, RAUSCH_NAME.source, tsl, [zweigRumpf]);
    pruef("Zweig des Stamms", [gz.zweig, gz.verborgen, gz.texturen], [1, 0, { "rausch-atlas": 1 }]);
    pruef("fremder Rumpf ohne Layout", stoffGraph(stoffZ, RAUSCH_NAME.source, tsl, []).verborgen, 1);
    // DER RUMPF WIRD GELESEN: mit den Stapel-Gliedern der TSL geht die Linse den Rumpf eines Aufrufs, den Zweig eines `If` und
    // den Rumpf einer Schleife — ein Rauschen darin fällt beim Namen, die Ladung darin zählt; ein Rumpf, der den Bauer liest
    // oder wirft, bleibt verborgen, und ohne die Stapel-Glieder jeder
    let stapelJetzt = null;
    const tslStapel = Object.assign({}, tsl, {
        stack: () => ({ nodes: [], outputNode: null }),
        setCurrentStack: (s) => (stapelJetzt = s),
        getCurrentStack: () => stapelJetzt,
        expression: (nm) => knoten({ ausdruck: nm }),
    });
    const lege = (n) => (stapelJetzt.nodes.push(n), n);
    const rauschRuf = () => knoten({ isShaderCallNodeInternal: true, ...fn("mx_perlin_noise_float_0"), rawInputs: [] });
    const fnKnoten = (jsFunc) => knoten({ jsFunc, layout: null });
    const ruf = (jsFunc, rawInputs = null) => knoten({ isShaderCallNodeInternal: true, shaderNode: fnKnoten(jsFunc), rawInputs });
    const schleife = (rumpf) => knoten({ getVarName: (i) => "ijk"[i], params: [knoten({ zahl: 4 }), rumpf] });
    const lesen = (wurzel, t = tslStapel) => {
        const e = stoffGraph({ colorNode: wurzel }, RAUSCH_NAME.source, t, []);
        return [e.rauschen, e.gelesen, e.verborgen, e.texturen["rausch-atlas"] || 0];
    };
    pruef("Rumpf mit Rauschen", lesen(ruf(() => rauschRuf())), [1, 1, 0, 0]);
    pruef("Rumpf mit Ladung auf dem Stapel", lesen(ruf(() => (lege(knoten({ isTextureNode: true, value: atlas })), knoten({})))), [0, 1, 0, 1]);
    pruef("Rumpf liest seine Eingänge", lesen(ruf(([a]) => knoten({ a }), [knoten({ isTextureNode: true, value: atlas })])), [0, 1, 0, 1]);
    pruef("Rauschen im Zweig eines If", lesen(ruf(() => (lege(knoten({ ifNode: fnKnoten(() => rauschRuf()) })), knoten({})))), [1, 2, 0, 0]);
    pruef("Rauschen in der Schleife", lesen(ruf(() => (lege(schleife(({ i }) => knoten({ i, r: rauschRuf() }))), knoten({})))), [1, 2, 0, 0]);
    pruef("Rumpf liest den Bauer", lesen(ruf((b) => b.material)), [0, 0, 1, 0]);
    pruef("Rumpf wirft", lesen(ruf(() => { throw new Error("x"); })), [0, 0, 1, 0]); // prettier-ignore
    pruef("ohne Stapel-Glieder bleibt jeder Rumpf verborgen", lesen(ruf(() => rauschRuf()), tsl), [0, 0, 1, 0]);
    pruef("der Stapel der Welt kehrt zurück", stapelJetzt, null);
    pruef("Graph ohne Stoff", stoffGraph(null, RAUSCH_NAME.source, tsl).fehler, "kein Stoff");
    pruef("Graph-Namen", g.rauschNamen, { mx_perlin_noise_float_0: 1 });
    return fehler;
}

// ── Seite ────────────────────────────────────────────────────────────────────────────────────────────────────────────

// EIN echter Frame (`_loopRender`), je gezeichnetem Programm (NodeBuilderState) das erzeugte Fragment-WGSL, die Zahl der
// Render-Objekte, ihre Täter-Klassen und die Stoffe (`stoffe`: Name → Zustands-Schlüssel), deren Material es zeichnet. Die
// Region-Bundles nehmen dafür neu auf (ein Replay holt kein Render-Objekt).
function shaderKostenSeite(o) {
    return (async () => {
        const opt = o || {};
        const rend = st.renderer;
        const objs = rend._objects;
        const roh = objs.get;
        const pp = st.postProcessing;
        const traa = st.traaNode;
        const stoffe = Object.entries(opt.stoffe || {}).map(([n, z]) => [n, st[z]]);
        const je = new Map();
        const name = (ro) => {
            if (pp && ro.object === pp._quadMesh) return "post:ausgabe";
            if (traa && ro.material === traa._resolveMaterial) return "TRAA.resolve";
            try {
                return r._taeterKlasse(ro.object);
            } catch {
                return (ro.object && (ro.object.name || ro.object.type)) || "?";
            }
        };
        objs.get = function (...a) {
            const ro = roh.apply(this, a);
            try {
                const s = ro.getNodeBuilderState();
                let e = je.get(s);
                if (!e)
                    je.set(
                        s,
                        (e = { fragment: s.fragmentShader || "", objekte: 0, klassen: new Map(), stoffe: new Set() })
                    );
                e.objekte++;
                const k = name(ro);
                e.klassen.set(k, (e.klassen.get(k) || 0) + 1);
                for (const [n, m] of stoffe) if (m && ro.material === m) e.stoffe.add(n);
            } catch {
                /* ein Objekt ohne Zustand zählt nicht */
            }
            return ro;
        };
        const q = rend.backend?.device ? rend.backend.device.queue : null;
        try {
            __bundlesNeu();
            for (let i = 0; i < Math.max(1, opt.frames || 1); i++) window.__loopBild();
            if (q) await q.onSubmittedWorkDone();
        } finally {
            objs.get = roh;
        }
        return [...je.values()].map((e) => {
            const kl = [...e.klassen.entries()].sort((a, b) => b[1] - a[1]);
            return {
                programm: kl.length ? kl[0][0] : "?",
                objekte: e.objekte,
                klassen: kl.slice(0, 6),
                stoffe: [...e.stoffe],
                fragment: e.fragment,
            };
        });
    })();
}

// DER HASH VON MATERIALX (three r184 mx_noise_float, lookup3 von Bob Jenkins, drei Schlüssel): die EINE Portierung der
// Linsen — der Atlas des Playtests (scripts/playtest/dirigent.cjs) ruft sie in der Seite. Die Rausch-Probe der Werkbank (GPU
// gegen CPU je Pixel) fiel 08.11.: kein Gate fuhr sie, und dirigent.cjs zitierte sie als Beweis.
function mxLookup3(x, y, z) {
    const rot = (v, k) => ((v << k) | (v >>> (32 - k))) >>> 0;
    let a = (0xdeadbeef + (3 << 2) + 13) >>> 0;
    let b = a;
    let c = a;
    a = (a + x) >>> 0;
    b = (b + y) >>> 0;
    c = (c + z) >>> 0;
    c = ((c ^ b) - rot(b, 14)) >>> 0;
    a = ((a ^ c) - rot(c, 11)) >>> 0;
    b = ((b ^ a) - rot(a, 25)) >>> 0;
    c = ((c ^ b) - rot(b, 16)) >>> 0;
    a = ((a ^ c) - rot(c, 4)) >>> 0;
    b = ((b ^ a) - rot(a, 14)) >>> 0;
    c = ((c ^ b) - rot(b, 24)) >>> 0;
    return c;
}

module.exports = {
    STOFFE,
    wgslKosten,
    tslLecks,
    kostenUrteil,
    kostenTabelle,
    selbsttest,
    SHADER_INSTALL:
        mxLookup3.toString() +
        `window.__shaderKosten = ${shaderKostenSeite.toString()};` +
        `window.__stoffGraph = (stoff) => (${stoffGraph.toString()})(stoff, ${JSON.stringify(RAUSCH_NAME.source)}, window.THREE.TSL, ` +
        `window.anazhRealm && typeof window.anazhRealm.constructor._zweigTSL === "function" ? ` +
        `[window.anazhRealm.constructor._zweigTSL(window.THREE.TSL).shaderNode] : []);`,
};
