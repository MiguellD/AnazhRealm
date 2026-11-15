"use strict";
// DER HEAP-ZENSUS NACH ERZEUGER (w28-heap-zensus): `/puffer` kennt die Typed Arrays beim Halter (`__heapHalter`), nie die
// gewöhnlichen Objekte. Der Sampling-Heap-Profiler von V8 (CDP `HeapProfiler.startSampling` vor dem Boot, `getSamplingProfile`
// nach zwei erzwungenen GC) trägt die NOCH LEBENDEN Bytes je Allokations-Stelle; verdichtet wird zweimal:
//   stelle — die Funktion, in der die Allokation geschah (oft three.js: `Vector3`, `Matrix4`, `clone`),
//   spiel  — der nächste Rahmen des Spiels darüber (nicht vendor/, nicht nativ): wer die Allokation BESTELLT hat.
// Die Datei:Zeile ist der Anfang der Funktion (der Profiler nennt nur sie). Die Backing-Stores der ArrayBuffer leben außerhalb
// des V8-Heaps — sie stehen im Zensus nie, nur in `backingStorageSize` (die Zeile „Typed-Array-Speicher“).

const MB = (x) => +(x / 1048576).toFixed(1);
const fremd = (url) => !url || /\/vendor\/|\/node_modules\/|^(chrome|devtools|extensions)::?/.test(url);
const ort = (cf) => {
    let p = cf.url || "";
    try {
        p = new URL(p).pathname.replace(/^\//, "");
    } catch {}
    return p ? `${p}:${cf.lineNumber + 1}` : "(nativ)";
};
const name = (cf) => cf.functionName || "(anonym)";

function verdichten(profile, usage, { top = 30 } = {}) {
    const stelle = new Map(),
        spiel = new Map();
    let summe = 0;
    const buche = (m, cf, n) => {
        const k = `${name(cf)} · ${ort(cf)}`;
        m.set(k, (m.get(k) || 0) + n);
    };
    // iterativ (die Stapel des Spiels sind tief): je Knoten der nächste Spiel-Rahmen von oben her
    const stapel = [[profile.head, null]];
    while (stapel.length) {
        const [k, sp] = stapel.pop();
        const eigen = fremd(k.callFrame.url) ? sp : k.callFrame;
        if (k.selfSize > 0) {
            summe += k.selfSize;
            buche(stelle, k.callFrame, k.selfSize);
            buche(spiel, eigen || k.callFrame, k.selfSize);
        }
        for (const c of k.children || []) stapel.push([c, eigen]);
    }
    const reihe = (m) => {
        const s = [...m].sort((a, b) => b[1] - a[1]);
        const kopf = s.slice(0, top).map(([k, n]) => [k, MB(n), +((100 * n) / (summe || 1)).toFixed(1)]);
        const rest = s.slice(top).reduce((a, [, n]) => a + n, 0);
        return { kopf, rest: [`Rest (${Math.max(0, s.length - top)} Stellen)`, MB(rest), +((100 * rest) / (summe || 1)).toFixed(1)] };
    };
    const o = {
        summeMB: MB(summe),
        heap: {
            jsMB: MB(usage.usedSize),
            typedMB: MB(usage.backingStorageSize || 0),
            heapMB: MB(usage.usedSize + (usage.backingStorageSize || 0)),
        },
        stelle: reihe(stelle),
        spiel: reihe(spiel),
    };
    const zeilen = (r) => [...r.kopf, r.rest].map(([k, mb, pc], i) => `${String(i + 1).padStart(3)}  ${String(mb).padStart(7)} MB  ${String(pc).padStart(5)} %  ${k}`);
    o.tafel = [
        `HEAP-ZENSUS NACH ERZEUGER — lebend nach 2× GC (Sampling-Heap-Profiler von V8)`,
        `Heap nach GC ${o.heap.heapMB} MB = JS-Heap ${o.heap.jsMB} MB + Typed-Array-Speicher ${o.heap.typedMB} MB · Summe des Samplings ${o.summeMB} MB (${((100 * summe) / (usage.usedSize || 1)).toFixed(0)} % des JS-Heaps)`,
        ``,
        `NACH ALLOKATIONS-STELLE (Funktion · Datei:Zeile des Funktionsanfangs):`,
        ...zeilen(o.stelle),
        ``,
        `NACH BESTELLER IM SPIEL (der nächste Rahmen außerhalb vendor/ und nativ):`,
        ...zeilen(o.spiel),
    ].join("\n");
    return o;
}

// der Selbsttest (ohne Welt): eine three-Allokation unter einem Spiel-Rahmen bucht die Stelle auf three, den Besteller aufs Spiel
function selbsttest() {
    const cf = (functionName, url, lineNumber) => ({ functionName, url, lineNumber });
    const profile = {
        head: {
            callFrame: cf("(root)", "", 0),
            selfSize: 0,
            children: [
                {
                    callFrame: cf("_bewohnerLeib", "http://h/stamm/koerper-leib.js?v=1", 147),
                    selfSize: 1048576,
                    children: [{ callFrame: cf("clone", "http://h/vendor/three.module.js", 9), selfSize: 3 * 1048576, children: [] }],
                },
            ],
        },
    };
    const o = verdichten(profile, { usedSize: 8 * 1048576, backingStorageSize: 0 }, { top: 5 });
    const f = [];
    if (o.summeMB !== 4) f.push(`Summe ${o.summeMB} ≠ 4`);
    if (o.stelle.kopf[0][0] !== "clone · vendor/three.module.js:10") f.push(`Stelle ${o.stelle.kopf[0][0]}`);
    if (o.spiel.kopf[0][0] !== "_bewohnerLeib · stamm/koerper-leib.js:148" || o.spiel.kopf[0][1] !== 4) f.push(`Besteller ${o.spiel.kopf[0]}`);
    return f;
}

module.exports = { verdichten, selbsttest };
