// stoff-linse.cjs — DIE STOFF-LINSE (Welle G, Gebot 10: die Linse nennt den Täter beim Namen). Befund 06.10. (Zerlege-
// Linse am ruhigen Messplatz, GTX 1060, Mess-Wiese): der Boden-Satz kostete 6,90 ms GPU für 6 Befehle — die Hälfte des
// Bildes, der teuerste Einzelposten. Welche Arbeit ein Boden-Pixel trägt, sah keine Linse: die Zerlegung nennt den
// Verbraucher, nicht seinen Stoff. Diese Linse liest das ERZEUGTE Fragment-Programm (r184 TSL → WGSL, dasselbe, das die
// GPU zieht) und zählt je Fragment, was es kostet — statisch, über alle Funktions-Aufrufe ausmultipliziert:
//   Abtastungen (textureSample*), Vergleichs-Abtastungen (Schatten), Ladungen (textureLoad), Ableitungen (dpdx/dpdy/
//   fwidth), Schleifen, Verzweigungen, Hash-Rauschen (MaterialX `mx_perlin_noise_*`: je Aufruf 8 Gitter-Hashes; das
//   RAUSCH-GESETZ liegt dagegen im Graph des Stoffs und zeigt sich als Ladungen — 6 je Raum-Wert, 2 je Ebene), dazu eine
//   Ops-Schätzung (Operatoren + Builtins; Transzendente, normalize und length gewichtet) — eine Zählung des Programms,
//   keine Zyklen. Die Zeit misst die gpu-bank am ruhigen Messplatz (`werkbank zerlegen`); diese Linse sagt, WOFÜR sie
//   anfällt, und hält das Budget.
//
// DIE RAUSCH-PROBE: das Atlas-Rauschen der GPU gegen die CPU, je Pixel eines 64×64-Gleitkomma-Ziels — (1) die Ebene
// k = 0 ist EXAKT MaterialX `mx_noise_float(vec3(x, y, 0))` (die Gradienten der Basis-Schicht sind der mx-Hash), (2) jede
// Ebene und (3) der Raum-Wert sind das Rausch-Gesetz (Gradient = mx-Regel aus lookup3 der versetzten Gitter-Zelle) —
// gerechnet auf der CPU aus dem HASH, nie aus den Atlas-Bytes (ein falsch gepacktes Texel fällt so auf).
//
//   Node:   stoffKosten(wgsl) · stoffUrteil(kosten, budget) · stoffTabelle(nachher, vorher) · selbsttest()
//   Seite:  window.__stoffProgramm() → { wgsl } (der Boden-Stoff, r184 `renderer.debug.getShaderAsync`)
//           window.__rauschProbe() → { ebeneMx, ebeneY, ebeneZ, raum } (max |GPU − CPU| je Probe)
//   Werkbank: node scripts/werkbank.cjs stoff [--gegen alt.wgsl] [--datei neu.wgsl] [--rauschprobe] | --selbsttest
"use strict";

// DAS BUDGET des Boden-Stoffs (Welle G, gemessen am Boden-Stoff des echten Wegs): kein Hash-Rauschen, und die Ops-
// Schätzung bleibt unter der Decke — ein neues Rauschen je Fragment fällt hier auf, bevor es Millisekunden kostet.
const BODEN_BUDGET = Object.freeze({ hashRausch: 0, ladungen: 90, abtastungen: 12, ops: 2400 });

const MUSTER = {
    abtastungen: /\btextureSample(?:Level|Grad|Bias|BaseClampToEdge)?\s*\(/g,
    vergleiche: /\btextureSampleCompare(?:Level)?\s*\(/g,
    ladungen: /\btextureLoad\s*\(/g,
    sammeln: /\btextureGather(?:Compare)?\s*\(/g,
    ableitungen: /\b(?:dpdx|dpdy|fwidth)(?:Fine|Coarse)?\s*\(/g,
    schleifen: /\bfor\s*\(|\bloop\s*\{|\bwhile\s*\(/g,
    verzweigungen: /\bif\s*\(/g,
};
const SCHWER = /\b(?:pow|exp|exp2|log|log2|sin|cos|tan|asin|acos|atan|atan2|sqrt|inverseSqrt|normalize)\s*\(/g;
const MITTEL = /\b(?:length|distance|cross|reflect|refract)\s*\(/g;
const LEICHT =
    /\b(?:mix|smoothstep|clamp|dot|floor|ceil|fract|round|trunc|abs|min|max|step|sign|select|saturate|fma)\s*\(/g;
const HASH_RAUSCH = /^mx_(?:perlin_noise|noise|cell_noise|worley_noise|fractal)/;

const zaehle = (s, re) => (s.match(re) || []).length;

// Die Funktionen eines WGSL-Moduls: Name → Rumpf (Kommentare gestrippt), dazu der Name des Fragment-Einstiegs.
function funktionen(wgsl) {
    const src = String(wgsl).replace(/\/\/.*$/gm, "");
    const fns = new Map();
    let einstieg = null;
    const re = /(@fragment\s+)?\bfn\s+(\w+)\s*\(/g;
    let m;
    while ((m = re.exec(src))) {
        const auf = src.indexOf("{", m.index);
        let tiefe = 0;
        let i = auf;
        for (; i < src.length; i++) {
            if (src[i] === "{") tiefe++;
            else if (src[i] === "}" && --tiefe === 0) break;
        }
        fns.set(m[2], src.slice(auf + 1, i));
        if (m[1]) einstieg = m[2];
        re.lastIndex = i;
    }
    return { fns, einstieg };
}

// Die eigenen Kosten eines Rumpfs (ohne Aufrufe): Typ-Annotationen und Deklarationen fallen vor der Operator-Zählung
// (`vec3<f32>` ist kein Vergleich, `var x : f32;` keine Arbeit).
function eigeneKosten(rumpf, namen) {
    const k = {};
    for (const [n, re] of Object.entries(MUSTER)) k[n] = zaehle(rumpf, re);
    let s = rumpf.replace(/^\s*var\s+\w+\s*:[^=;]*;/gm, "");
    for (let alt = ""; alt !== s;) {
        alt = s;
        s = s.replace(/(\w)\s*<[^<>()=;]*>/g, "$1");
    }
    s = s.replace(/->\s*\w+/g, "");
    const opsRoh = zaehle(s, /<<|>>|&&|\|\||==|!=|<=|>=|[+\-*/%&|^<>]/g);
    k.ops = opsRoh + 4 * zaehle(s, SCHWER) + 3 * zaehle(s, MITTEL) + zaehle(s, LEICHT);
    k.aufrufe = {};
    for (const n of namen) {
        const c = zaehle(rumpf, new RegExp(`\\b${n}\\s*\\(`, "g"));
        if (c) k.aufrufe[n] = c;
    }
    return k;
}

const FELDER = ["abtastungen", "vergleiche", "ladungen", "sammeln", "ableitungen", "schleifen", "verzweigungen", "ops"];

// Die Kosten je Fragment: der Einstieg mit allen Aufrufen ausmultipliziert (WGSL kennt keine Rekursion).
function stoffKosten(wgsl) {
    const { fns, einstieg } = funktionen(wgsl);
    if (!einstieg) return { fehler: "kein @fragment-Einstieg" };
    const namen = [...fns.keys()];
    const eigen = new Map(
        namen.map((n) => [
            n,
            eigeneKosten(
                fns.get(n),
                namen.filter((x) => x !== n)
            ),
        ])
    );
    const memo = new Map();
    const summe = (n) => {
        if (memo.has(n)) return memo.get(n);
        const e = eigen.get(n);
        const t = { hashRausch: 0 };
        for (const f of FELDER) t[f] = e[f];
        for (const [g, c] of Object.entries(e.aufrufe)) {
            const u = summe(g);
            for (const f of FELDER) t[f] += c * u[f];
            t.hashRausch += c * (HASH_RAUSCH.test(g) ? 1 : u.hashRausch);
        }
        memo.set(n, t);
        return t;
    };
    const je = summe(einstieg);
    // je Aufruf: was eine Rausch-Funktion einmal kostet (für die Tabelle)
    const rausch = {};
    for (const n of namen)
        if (HASH_RAUSCH.test(n)) {
            const u = summe(n);
            rausch[n] = { ops: u.ops, ladungen: u.ladungen };
        }
    return { einstieg, funktionen: namen.length, zeichen: String(wgsl).length, je, rausch };
}

function stoffUrteil(k, budget) {
    const B = budget || BODEN_BUDGET;
    const befunde = [];
    if (!k || k.fehler) return { ok: false, befunde: [(k && k.fehler) || "keine Kosten"] };
    for (const [f, max] of Object.entries(B)) if (k.je[f] > max) befunde.push(`${f} ${k.je[f]} > Budget ${max}`);
    return { ok: befunde.length === 0, befunde };
}

function stoffTabelle(nach, vor) {
    const z = [];
    const kopf = vor ? ["Posten je Fragment", "vorher", "nachher"] : ["Posten je Fragment", "Wert"];
    z.push(kopf.map((s, i) => (i ? s.padStart(10) : s.padEnd(22))).join(""));
    for (const f of ["hashRausch", ...FELDER]) {
        const a = vor ? [vor.je[f], nach.je[f]] : [nach.je[f]];
        z.push(f.padEnd(22) + a.map((v) => String(v).padStart(10)).join(""));
    }
    const r = Object.entries(nach.rausch || {}).map(([n, u]) => `${n}: ${u.ops} Ops`);
    if (vor) r.unshift(...Object.entries(vor.rausch || {}).map(([n, u]) => `(vorher) ${n}: ${u.ops} Ops`));
    return z.join("\n") + (r.length ? "\nje Aufruf: " + r.join(" · ") : "");
}

// DER SELBSTTEST (nur Node): ein Modul mit bekannten Kosten — Aufrufe multiplizieren, Typ-Annotationen sind keine
// Operatoren, ein eingeschmuggeltes Hash-Rauschen bricht das Budget.
function selbsttest() {
    const befunde = [];
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
fn mx_perlin_noise_float_1 ( p : vec3<f32> ) -> f32 {
	return ( p.x * 0.5 );
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
    const k = stoffKosten(W);
    const soll = { ladungen: 2, abtastungen: 1, ableitungen: 1, schleifen: 1, verzweigungen: 1, hashRausch: 0 };
    for (const [f, v] of Object.entries(soll)) if (k.je[f] !== v) befunde.push(`${f} ${k.je[f]} statt ${v}`);
    // hilf: ^ * = 2 · probe: + = 1, + 1 × hilf = 3 · main: > * + < ++(2) = 6 + mix 1 + pow 4 = 11, + 2 × probe = 17
    // (die Deklarationen `var v : f32;`, `vec2<i32>` und `-> OutputStruct` zählen nicht)
    if (k.je.ops !== 17) befunde.push(`ops ${k.je.ops} statt 17`);
    const k2 = stoffKosten(
        W.replace("v = ( v + dpdx( v ) );", "v = ( v + dpdx( v ) + mx_perlin_noise_float_1( vec3<f32>( v ) ) );")
    );
    if (k2.je.hashRausch !== 1) befunde.push(`eingeschmuggeltes Hash-Rauschen: ${k2.je.hashRausch} statt 1`);
    if (stoffUrteil(k2, { hashRausch: 0 }).ok) befunde.push("das Budget fing das Hash-Rauschen nicht");
    if (!stoffUrteil(k, { hashRausch: 0, ladungen: 2 }).ok) befunde.push("das Budget fiel ohne Grund");
    return { ok: befunde.length === 0, befunde, kosten: k.je };
}

// ── Seite ────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Das Fragment-Programm des Boden-Stoffs, wie r184 es für das gezeichnete Boden-Objekt baut.
function stoffProgramm() {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const mat = st.voxelChunkMaterial;
        let obj = null;
        st.scene.traverse((o) => {
            if (!obj && o.material === mat) obj = o;
        });
        if (!obj) return { fehler: "kein Boden-Objekt mit dem Boden-Stoff in der Szene" };
        const s = await st.renderer.debug.getShaderAsync(st.scene, st.camera, obj);
        return { wgsl: s.fragmentShader };
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

module.exports = {
    BODEN_BUDGET,
    stoffKosten,
    stoffUrteil,
    stoffTabelle,
    selbsttest,
    STOFF_INSTALL:
        `window.__stoffProgramm = ${stoffProgramm.toString()};` + `window.__rauschProbe = ${rauschProbe.toString()};`,
};
