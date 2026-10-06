// shader-kosten.cjs — DIE SHADER-KOSTEN-LINSE (06.10., Welle G; Gebot 10: die Linse nennt den Täter beim Namen). Befund
// (GTX 1060, Mess-Wiese, `werkbank zerlegen`): die Fragment-Arbeit trägt den Frame — die Godrays tasteten 20× je Pixel
// auch ohne Sonne im Bild (0,69 ms), die Pass-Stempel sehen davon fast nichts. Was ein Fragment KOSTEN KANN, steht schon
// im erzeugten WGSL: diese Linse liest es je Programm (dem NodeBuilderState, den r184 je Material × Objekt-Art baut) und
// zählt statisch:
//   Abtastungen — textureSample* · textureLoad · textureGather*, je Ort: UNBEDINGT (jedes Fragment zahlt sie), im ZWEIG
//     (if/else/switch — eine Uniform-Bedingung zahlt nur, wenn sie gilt) oder in einer SCHLEIFE (je Durchlauf); ein
//     Aufruf einer Hilfs-Funktion (TSL `setLayout`) zählt deren Abtastungen am Aufruf-Ort mit
//   Schleifen — for · loop · while
//   Rauschen — Aufrufe einer Funktion mit noise/perlin/simplex/worley/fbm im Namen
// Kein Lauf-Maß: welcher Zweig gilt und wie oft eine Schleife läuft, entscheidet die GPU — die Zahl ist die OBERGRENZE der
// Arbeit je Fragment und der Ort, an dem eine Stufe gratis werden KANN (ein Zweig hinter ihrer Stärke).
//
//   Node:   wgslKosten(wgsl) → { einstieg, abtastungen: {gesamt, unbedingt, zweig, schleife}, schleifen, rauschen }
//           kostenUrteil(kosten, budget) → [Verletzungen]   (budget: {unbedingtMax, zweigMin, schleifeMax, rauschenMax})
//           selbsttest() → [Fehler]                          (die Zählung an gebauten WGSL-Stücken)
//   Seite:  window.__shaderKosten({ frame }) → [{ programm, objekte, klassen, fragment }] — EIN echter Frame
//           (`_loopRender`), je gezeichnetem Programm das erzeugte Fragment-WGSL (Bundles nehmen dafür neu auf)
//   Werkbank: node scripts/werkbank.cjs shader [--nur <regex>] [--top n]
"use strict";

const ABTASTUNG =
    /\btexture(?:Sample(?:Level|Bias|Grad|Compare|CompareLevel|BaseClampToEdge)?|Load|Gather(?:Compare)?)\s*\(/g;
const RAUSCHEN = /\b([A-Za-z_]\w*(?:noise|Noise|perlin|Perlin|simplex|Simplex|worley|Worley|fbm|Fbm)\w*)\s*\(/g;

// Kommentare raus (die Zählung liest nur Code).
function ohneKommentare(s) {
    return String(s)
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/\/\/[^\n]*/g, " ");
}

// Die Funktionen eines WGSL-Moduls: Name → Rumpf (ohne die äußeren Klammern) und ob sie der Fragment-Einstieg ist.
function funktionen(code) {
    const aus = new Map();
    let einstieg = null;
    const re = /(@fragment\s+)?fn\s+([A-Za-z_]\w*)\s*\(/g;
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

function leer() {
    return { gesamt: 0, unbedingt: 0, zweig: 0, schleife: 0 };
}

// DIE KOSTEN EINES MODULS: je Funktion die eigenen Abtastungen (je Ort), Schleifen und Rausch-Aufrufe; der Einstieg zählt
// die Aufrufe seiner Hilfs-Funktionen am Aufruf-Ort mit (WGSL kennt keine Rekursion; ein Kreis bricht ab).
function wgslKosten(wgsl) {
    const code = ohneKommentare(wgsl);
    const { aus: fns, einstieg } = funktionen(code);
    const memo = new Map();
    const kostenVon = (name, pfad) => {
        if (memo.has(name)) return memo.get(name);
        const rumpf = fns.get(name);
        const k = { abtastungen: leer(), schleifen: 0, rauschen: 0, rauschNamen: {} };
        if (rumpf == null || pfad.has(name)) return k;
        pfad.add(name);
        const ort = ortAn(rumpf);
        let m;
        ABTASTUNG.lastIndex = 0;
        while ((m = ABTASTUNG.exec(rumpf))) {
            k.abtastungen.gesamt++;
            k.abtastungen[ort(m.index)]++;
        }
        k.schleifen += (rumpf.match(/\b(?:for|loop|while)\b/g) || []).length;
        RAUSCHEN.lastIndex = 0;
        while ((m = RAUSCHEN.exec(rumpf))) {
            if (fns.has(m[1])) continue; // eine eigene Rausch-Funktion zählt über ihren Rumpf (Aufruf unten)
            k.rauschen++;
            k.rauschNamen[m[1]] = (k.rauschNamen[m[1]] || 0) + 1;
        }
        // Aufrufe eigener Funktionen: ihre Kosten am Aufruf-Ort
        const ruf = /\b([A-Za-z_]\w*)\s*\(/g;
        while ((m = ruf.exec(rumpf))) {
            const f = m[1];
            if (f === name || !fns.has(f)) continue;
            const o = ort(m.index);
            const u = kostenVon(f, pfad);
            if (/noise|perlin|simplex|worley|fbm/i.test(f)) {
                k.rauschen++;
                k.rauschNamen[f] = (k.rauschNamen[f] || 0) + 1;
            }
            k.abtastungen.gesamt += u.abtastungen.gesamt;
            if (o === "unbedingt") {
                k.abtastungen.unbedingt += u.abtastungen.unbedingt;
                k.abtastungen.zweig += u.abtastungen.zweig;
                k.abtastungen.schleife += u.abtastungen.schleife;
            } else k.abtastungen[o] += u.abtastungen.gesamt;
            k.schleifen += u.schleifen;
            k.rauschen += u.rauschen;
            for (const [n, c] of Object.entries(u.rauschNamen)) k.rauschNamen[n] = (k.rauschNamen[n] || 0) + c;
        }
        pfad.delete(name);
        memo.set(name, k);
        return k;
    };
    const name = einstieg || (fns.has("main") ? "main" : null);
    const k = name ? kostenVon(name, new Set()) : { abtastungen: leer(), schleifen: 0, rauschen: 0, rauschNamen: {} };
    return { einstieg: name, funktionen: fns.size, ...k };
}

// DAS URTEIL gegen ein Budget je Programm: jede Verletzung beim Namen.
function kostenUrteil(k, budget, name) {
    const v = [];
    const n = name || "Programm";
    if (!k || !k.einstieg) return [`${n}: kein Fragment-Einstieg im WGSL gefunden (die Linse ist blind)`];
    const a = k.abtastungen;
    if (budget.unbedingtMax != null && a.unbedingt > budget.unbedingtMax)
        v.push(
            `${n}: ${a.unbedingt} unbedingte Abtastungen je Fragment (Budget ≤ ${budget.unbedingtMax}) — eine Stufe zahlt auch, wenn sie nichts zeigt`
        );
    if (budget.zweigMin != null && a.zweig < budget.zweigMin)
        v.push(
            `${n}: nur ${a.zweig} Abtastungen in Zweigen (Soll ≥ ${budget.zweigMin}) — eine Stufe steht nicht mehr hinter ihrer Stärke`
        );
    if (budget.schleifeMax != null && a.schleife > budget.schleifeMax)
        v.push(`${n}: ${a.schleife} Abtastungen in Schleifen (Budget ≤ ${budget.schleifeMax})`);
    if (budget.rauschenMax != null && k.rauschen > budget.rauschenMax)
        v.push(`${n}: ${k.rauschen} Rausch-Aufrufe (Budget ≤ ${budget.rauschenMax})`);
    return v;
}

// DER SELBSTTEST: gebaute WGSL-Stücke, deren Kosten feststehen.
function selbsttest() {
    const fehler = [];
    const pruef = (name, ist, soll) => {
        const a = JSON.stringify(ist),
            b = JSON.stringify(soll);
        if (a !== b) fehler.push(`${name}: ${a} statt ${b}`);
    };
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
    pruef("Schleifen", k.schleifen, 1);
    pruef("Rauschen", k.rauschen, 1);
    // Das Urteil: ein Budget, das hält, und je eines, das bricht — jedes beim Namen.
    pruef("Urteil hält", kostenUrteil(k, { unbedingtMax: 3, zweigMin: 4, schleifeMax: 1, rauschenMax: 1 }, "s"), []);
    const rot = kostenUrteil(k, { unbedingtMax: 2, zweigMin: 5, schleifeMax: 0, rauschenMax: 0 }, "s");
    pruef("Urteil rot (4 Verletzungen)", rot.length, 4);
    if (!rot.some((s) => /3 unbedingte Abtastungen/.test(s)))
        fehler.push("Urteil nennt die unbedingten Abtastungen nicht");
    // Eine Stufe, die aus ihrem Zweig wandert, wird unbedingt (der Fall, den gate:post-kette bewacht).
    const ohneZweig = wgslKosten(modul.replace("if ( render.staerke != 0.0 ) {", "{"));
    pruef("Stufe ohne Zweig", ohneZweig.abtastungen.unbedingt, 6);
    // Ein Modul ohne Fragment-Einstieg (ein Compute-Modul) ist blind, nie grün.
    pruef("blind", kostenUrteil(wgslKosten("fn f() {}"), {}, "x").length, 1);
    return fehler;
}

// ── Seite ────────────────────────────────────────────────────────────────────────────────────────────────────────────

// EIN echter Frame (`_loopRender`), je gezeichnetem Programm (NodeBuilderState) das erzeugte Fragment-WGSL, die Zahl der
// Render-Objekte und ihre Täter-Klassen. Die Region-Bundles nehmen dafür neu auf (ein Replay holt kein Render-Objekt).
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
                if (!e) je.set(s, (e = { fragment: s.fragmentShader || "", objekte: 0, klassen: new Map() }));
                e.objekte++;
                const k = name(ro);
                e.klassen.set(k, (e.klassen.get(k) || 0) + 1);
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
                fragment: e.fragment,
            };
        });
    })();
}

module.exports = {
    wgslKosten,
    kostenUrteil,
    selbsttest,
    SHADER_INSTALL: `window.__shaderKosten = ${shaderKostenSeite.toString()};`,
};
