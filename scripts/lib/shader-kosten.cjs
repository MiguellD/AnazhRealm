// shader-kosten.cjs — DIE SHADER-KOSTEN-LINSE (06.10., Welle G; Gebot 10: die Linse nennt den Täter beim Namen). Befund
// (GTX 1060, Mess-Wiese, `werkbank zerlegen`): die Fragment-Arbeit trägt den Frame — der Boden-Satz kostete 6,90 ms GPU für
// 6 Befehle (26 MaterialX-Hash-Rauschen je Pixel), die Godrays tasteten 20× je Pixel auch ohne Sonne im Bild (0,69 ms); die
// Pass-Stempel und die Zerlegung nennen den Verbraucher, nicht seine Arbeit je Pixel. Was ein Fragment KOSTEN KANN, steht im
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
// DIE RAUSCH-PROBE: das Atlas-Rauschen der GPU gegen die CPU, je Pixel eines 64×64-Gleitkomma-Ziels — (1) die Ebene k = 0 ist
// EXAKT MaterialX `mx_noise_float(vec3(x, y, 0))`, (2) jede Ebene und (3) der Raum-Wert sind das Rausch-Gesetz (Gradient =
// mx-Regel aus lookup3 der versetzten Gitter-Zelle) — gerechnet auf der CPU aus dem HASH, nie aus den Atlas-Bytes.
//
// DER STOFF-GRAPH (GPU-frei, für den Playtest auf dem Null-Renderer): der Knoten-Graph eines Stoffs VOR dem Bau — dieselbe
// Rausch-Regel an den Funktions-Knoten (ein Aufruf mit Layout, `mx_noise_float` ist ein Überladungs-Knoten), dazu die
// Texturen je Name; ein Fn-Aufruf ohne Layout baut seinen Rumpf erst im Compiler — der Graph zählt ihn als `verborgen`.
//
//   Node:   wgslKosten(wgsl) → { einstieg, abtastungen: {gesamt, unbedingt, zweig, schleife}, proben, vergleiche, ladungen,
//           sammeln, ableitungen, schleifen, verzweigungen, ops, rauschen, rauschNamen, rauschJeAufruf }
//           kostenUrteil(kosten, budget, name) → [Verletzungen]  (budget: unbedingtMax · zweigMin · schleifeMax · rauschenMax ·
//           opsMax · ladungenMax · probenMax; ein unbekannter Schlüssel wirft)
//           kostenTabelle(nachher, vorher) · stoffGraph(stoff, rauschQuelle) · selbsttest() → [Fehler] · STOFFE
//   Seite:  window.__shaderKosten({ frames, stoffe }) → [{ programm, objekte, klassen, stoffe, fragment }] — EIN echter Frame
//           (`_loopRender`), je gezeichnetem Programm das erzeugte Fragment-WGSL (Bundles nehmen dafür neu auf)
//           window.__rauschProbe() → { ebeneMx, ebeneY, ebeneZ, raum } (max |GPU − CPU| je Probe)
//           window.__stoffGraph(stoff) → { slots, knoten, rauschen, rauschNamen, texturen, verborgen }
//   Werkbank: node scripts/werkbank.cjs shader [--nur <regex>] [--top n] [--ordner d]
//                                              [--stoff boden [--gegen alt.wgsl] [--datei neu.wgsl] [--rauschprobe]]
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
// Ops-Decke —, die Ladungen des Rausch-Atlas (78) und die Ops-Schätzung unter der Decke.
const STOFFE = Object.freeze({
    boden: Object.freeze({
        zustand: "voxelChunkMaterial",
        budget: Object.freeze({ rauschenMax: 2, ladungenMax: 90, probenMax: 12, opsMax: 2400 }),
    }),
});

const zaehle = (s, re) => (s.match(re) || []).length;

// Kommentare raus (die Zählung liest nur Code).
function ohneKommentare(s) {
    return String(s)
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/\/\/[^\n]*/g, " ");
}

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
        } else if (c === "}") {
            stapel.pop();
        } else if (c === ";" && klammer === 0) {
            wartend = null;
        }
        art[i] = stapel.length ? stapel[stapel.length - 1] : "unbedingt";
    }
    // „block" ohne Zweig/Schleife darüber ist unbedingt
    return (i) => (art[i] === "block" || art[i] === undefined ? "unbedingt" : art[i]);
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
    return { einstieg: name, funktionen: fns.size, zeichen: String(wgsl).length, ...k, rauschJeAufruf };
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
    rauschenMax: [(k) => k.rauschen, "≤", "Rausch-Aufrufe je Fragment", ""],
    opsMax: [(k) => k.ops, "≤", "Ops je Fragment (Schätzung)", ""],
    ladungenMax: [(k) => k.ladungen, "≤", "Ladungen je Fragment", ""],
    probenMax: [(k) => k.proben, "≤", "Proben je Fragment", ""],
};
function kostenUrteil(k, budget, name) {
    const n = name || "Programm";
    for (const s of Object.keys(budget || {}))
        if (!GRENZEN[s]) throw new Error(`kostenUrteil: unbekannter Budget-Schlüssel „${s}"`);
    if (!k || !k.einstieg) return [`${n}: kein Fragment-Einstieg im WGSL gefunden (die Linse ist blind)`];
    const v = [];
    for (const [s, grenze] of Object.entries(budget || {})) {
        if (grenze == null) continue;
        const [lies, rel, was, warum] = GRENZEN[s];
        const ist = lies(k);
        if (rel === "≤" ? ist > grenze : ist < grenze) {
            const namen =
                s === "rauschenMax" && ist > 0
                    ? ` (${Object.entries(k.rauschNamen)
                          .map(([f, c]) => f + " ×" + c)
                          .join(", ")})`
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
// cameraPosition, normalView …), zählt er als `bibliothek`, sonst als `verborgen` (ein Rumpf des Spiels, den der Graph
// nicht sieht — dort könnte ein Rauschen wohnen). Rein — läuft in der Seite und im Selbsttest.
function stoffGraph(stoff, rauschQuelle, tsl) {
    const ist = new RegExp(rauschQuelle, "i");
    const aus = { slots: [], knoten: 0, rauschen: 0, rauschNamen: {}, texturen: {}, verborgen: 0, bibliothek: 0 };
    if (!stoff) return Object.assign(aus, { fehler: "kein Stoff" });
    const bib = new Set();
    const offen = [];
    for (const k of Object.keys(tsl || {})) {
        const v = tsl[k];
        if (v && v.isNode === true) offen.push(v);
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
    const gesehen = new Set();
    while (stapel.length) {
        const n = stapel.pop();
        if (gesehen.has(n.id)) continue;
        gesehen.add(n.id);
        aus.knoten++;
        let name = null;
        if (n.isShaderCallNodeInternal === true) {
            const lay = n.shaderNode && n.shaderNode.layout;
            if (lay) name = lay.name;
            else if (bib.has(n.id)) aus.bibliothek++;
            else aus.verborgen++;
        } else if (Array.isArray(n.functionNodes) && n.functionNodes.length) {
            const f = n.functionNodes[0];
            name = (f && f.shaderNode && f.shaderNode.layout && f.shaderNode.layout.name) || "Überladung";
        }
        if (name && ist.test(name)) {
            aus.rauschen++;
            aus.rauschNamen[name] = (aus.rauschNamen[name] || 0) + 1;
        }
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
    // Ein Modul ohne Fragment-Einstieg (ein Compute-Modul) ist blind, nie grün.
    pruef("blind", kostenUrteil(wgslKosten("fn f() {}"), {}, "x").length, 1);
    // Eine vertippte Decke wirft, statt still nichts zu prüfen.
    let wirft = false;
    try {
        kostenUrteil(k, { rauschMax: 0 }, "s");
    } catch (_e) {
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

    // (3) der Stoff-Graph: ein Knoten-Graph wie r184 ihn baut — Slots, geteilte Knoten einmal, Überladung und Aufruf mit
    // Layout sind Rauschen, ein Aufruf ohne Layout ist verborgen (oder Bibliothek, wenn die TSL ihn exportiert), Texturen
    // je Name.
    let id = 0;
    const knoten = (eig) => {
        const n = Object.assign({ isNode: true, id: id++ }, eig);
        n.getChildren = function* () {
            for (const v of Object.values(n)) {
                if (Array.isArray(v)) {
                    for (const x of v) if (x && x.isNode === true) yield x;
                } else if (v && v.isNode === true) yield v;
            }
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
        const r = window.anazhRealm;
        const st = r.state;
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
                return typeof r._taeterKlasse === "function" ? r._taeterKlasse(ro.object) : ro.object.type;
            } catch (_e) {
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
            } catch (_e) {
                /* ein Objekt ohne Zustand zählt nicht */
            }
            return ro;
        };
        const q = rend.backend && rend.backend.device ? rend.backend.device.queue : null;
        try {
            st.scene.traverse((n) => {
                if (n.isBundleGroup) n.needsUpdate = true;
            });
            for (let i = 0; i < Math.max(1, opt.frames || 1); i++) {
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                r._loopRender(performance.now() / 1000);
            }
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

// Die Rausch-Probe: GPU (das Atlas-Rauschen im erzeugten WGSL) gegen CPU (MaterialX-Hash, nie die Atlas-Bytes).
function rauschProbe() {
    return (async () => {
        const r = window.anazhRealm;
        const T = window.THREE;
        const TSL = T.TSL;
        const A = r.constructor;
        const R = A.RAUSCH_GESETZ;
        const P = R.P;
        const [SA, SB] = R.schraeg;
        const ra = r._rauschAtlas();
        // CPU: MaterialX (three r184 mx_noise_float) — lookup3, Gradienten-Regel, Fünftgrad-Blende, Skala
        const rot = (x, k) => ((x << k) | (x >>> (32 - k))) >>> 0;
        const hash = (x, y, z) => {
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
        };
        const grad = (h, x, y, z) => {
            h &= 15;
            const u = h < 8 ? x : y;
            const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
            return (h & 1 ? -u : u) + (h & 2 ? -v : v);
        };
        const blende = (t) => t * t * t * (t * (t * 6 - 15) + 10);
        const lerp = (a, b, t) => a + (b - a) * t;
        const mx = (x, y, z) => {
            const X = Math.floor(x);
            const Y = Math.floor(y);
            const Z = Math.floor(z);
            const fx = x - X;
            const fy = y - Y;
            const fz = z - Z;
            const g = (i, j, k, dx, dy, dz) =>
                grad(hash((X + i) | 0, (Y + j) | 0, (Z + k) | 0), fx - dx, fy - dy, fz - dz);
            const u = blende(fx);
            const v = blende(fy);
            const w = blende(fz);
            const s0 = lerp(
                lerp(g(0, 0, 0, 0, 0, 0), g(1, 0, 0, 1, 0, 0), u),
                lerp(g(0, 1, 0, 0, 1, 0), g(1, 1, 0, 1, 1, 0), u),
                v
            );
            const s1 = lerp(
                lerp(g(0, 0, 1, 0, 0, 1), g(1, 0, 1, 1, 0, 1), u),
                lerp(g(0, 1, 1, 0, 1, 1), g(1, 1, 1, 1, 1, 1), u),
                v
            );
            return 0.982 * lerp(s0, s1, w);
        };
        // CPU: das Rausch-Gesetz — der Gradient der Gitter-Zelle (i, j, k) ist die mx-Regel aus lookup3 der versetzten
        // Basis-Zelle ((i + SA·k) mod P, (j + SB·k) mod P, 0); `ebene` nimmt die Komponenten (x, cB).
        const gv = (i, j, k) => {
            const h = hash((((i + SA * k) % P) + P) % P, (((j + SB * k) % P) + P) % P, 0);
            return [grad(h, 1, 0, 0), grad(h, 0, 1, 0), grad(h, 0, 0, 1)];
        };
        const ebeneCpu = (x, y, k, cB) => {
            const X = Math.floor(x);
            const Y = Math.floor(y);
            const fx = x - X;
            const fy = y - Y;
            const e = (i, j, dx, dy) => {
                const g = gv(X + i, Y + j, k);
                return g[0] * (fx - dx) + g[cB] * (fy - dy);
            };
            const u = blende(fx);
            return (
                R.skala * lerp(lerp(e(0, 0, 0, 0), e(1, 0, 1, 0), u), lerp(e(0, 1, 0, 1), e(1, 1, 1, 1), u), blende(fy))
            );
        };
        const raumCpu = (x, y, z) => {
            const X = Math.floor(x);
            const Y = Math.floor(y);
            const Z = Math.floor(z);
            const fx = x - X;
            const fy = y - Y;
            const fz = z - Z;
            const e = (i, j, k) => {
                const g = gv(X + i, Y + j, Z + k);
                return g[0] * (fx - i) + g[1] * (fy - j) + g[2] * (fz - k);
            };
            const u = blende(fx);
            const v = blende(fy);
            const s = (k) => lerp(lerp(e(0, 0, k), e(1, 0, k), u), lerp(e(0, 1, k), e(1, 1, k), u), v);
            return R.skala * lerp(s(0), s(1), blende(fz));
        };
        const N = 64;
        const rt = new T.RenderTarget(N, N, { type: T.FloatType, depthBuffer: false });
        const szene = new T.Scene();
        const kam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const quad = new T.Mesh(new T.PlaneGeometry(2, 2), new T.MeshBasicNodeMaterial());
        quad.frustumCulled = false;
        szene.add(quad);
        const sc = TSL.screenCoordinate;
        // die Proben-Koordinate: Pixel-Mitte → Gitter-Raum (nie ganzzahlig, über den ganzen Atlas und über negative Zellen)
        const px = sc.x.mul(3.9).add(-60.37);
        const py = sc.y.mul(4.1).add(-30.61);
        const cpuX = (i) => (i + 0.5) * 3.9 - 60.37;
        const cpuY = (j) => (j + 0.5) * 4.1 - 30.61;
        const proben = {
            // die Basis-Ebene ist MaterialX selbst — nur auf der Basis-Kachel [0, P) (dort IST der Atlas der mx-Hash)
            ebeneMx: [
                ra.ebene(TSL.vec2(sc.x.mul(3.9).add(0.37), sc.y.mul(3.9).add(0.21)), 0, "y"),
                (i, j) => mx((i + 0.5) * 3.9 + 0.37, (j + 0.5) * 3.9 + 0.21, 0),
            ],
            ebeneY: [ra.ebene(TSL.vec2(px, py), 11, "y"), (i, j) => ebeneCpu(cpuX(i), cpuY(j), 11, 1)],
            ebeneZ: [ra.ebene(TSL.vec2(px, py), 0, "z"), (i, j) => ebeneCpu(cpuX(i), cpuY(j), 0, 2)],
            raum: [
                ra.raum(TSL.vec3(px, py, px.mul(0.37).add(py.mul(-0.53)))),
                (i, j) => raumCpu(cpuX(i), cpuY(j), cpuX(i) * 0.37 - cpuY(j) * 0.53),
            ],
        };
        const rend = r.state.renderer;
        const vorZiel = rend.getRenderTarget();
        const out = {};
        try {
            for (const [name, [knoten, cpu]] of Object.entries(proben)) {
                // der Stoff-Ausgang kappt unter 0 (r184 `max(…, 0)`): der Wert reist als n/2 + 1/2
                quad.material.colorNode = TSL.vec4(knoten.mul(0.5).add(0.5), 0.0, 0.0, 1.0);
                quad.material.needsUpdate = true;
                rend.setRenderTarget(rt);
                rend.render(szene, kam);
                const f = await rend.readRenderTargetPixelsAsync(rt, 0, 0, N, N);
                let max = 0;
                let summe = 0;
                for (let j = 0; j < N; j++)
                    for (let i = 0; i < N; i++) {
                        const d = Math.abs(f[(j * N + i) * 4] * 2 - 1 - cpu(i, j));
                        if (d > max) max = d;
                        summe += Math.abs(cpu(i, j));
                    }
                out[name] = { maxFehler: +max.toExponential(2), mittelBetrag: +(summe / (N * N)).toFixed(3) };
            }
        } finally {
            rend.setRenderTarget(vorZiel);
            rt.dispose();
            quad.geometry.dispose();
            quad.material.dispose();
        }
        return out;
    })();
}

// Die Rausch-Probe ist GRÜN, wenn jede Probe unter 1e-4 bleibt (über 1e-4 ist das WGSL nicht das Gesetz).
function probeUrteil(probe) {
    if (!probe || typeof probe !== "object" || !Object.keys(probe).length) return ["Rausch-Probe: kein Ergebnis"];
    return Object.entries(probe)
        .filter(([, v]) => !(v && v.maxFehler < 1e-4))
        .map(([n, v]) => `Rausch-Probe ${n}: größter Fehler ${v && v.maxFehler} (Grenze 1e-4)`);
}

module.exports = {
    STOFFE,
    wgslKosten,
    kostenUrteil,
    kostenTabelle,
    probeUrteil,
    stoffGraph,
    selbsttest,
    SHADER_INSTALL:
        `window.__shaderKosten = ${shaderKostenSeite.toString()};` +
        `window.__rauschProbe = ${rauschProbe.toString()};` +
        `window.__stoffGraph = (stoff) => (${stoffGraph.toString()})(stoff, ${JSON.stringify(RAUSCH_NAME.source)}, window.THREE.TSL);`,
};
