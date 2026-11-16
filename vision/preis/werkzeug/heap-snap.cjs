// heap-snap.cjs — wertet einen V8-Heap-Schnappschuss aus (Strom-Leser, die Datei darf groesser als eine JS-Zeichenkette sein):
// je Konstruktor die eigene und die gehaltene Groesse (Dominator-Baum, Cooper-Harvey-Kennedy; schwache Kanten zaehlen nicht),
// dazu die groessten Einzel-Halter mit ihrem Pfad im Dominator-Baum. Aufruf: node heap-snap.cjs <datei.heapsnapshot> [top] > aus.json
"use strict";
const fs = require("fs");
const datei = process.argv[2], TOP = Number(process.argv[3]) || 40;

// ── Strom-Leser ──
function lies(datei) {
    const fd = fs.openSync(datei, "r"), B = Buffer.alloc(16 << 20);
    let kopf = "", phase = "kopf", zahl = -1, ziel = null;
    const arr = { nodes: new Uint32Array(1 << 22), nN: 0, edges: new Uint32Array(1 << 23), nE: 0 };
    const push = (n) => {
        if (ziel === "nodes") { if (arr.nN === arr.nodes.length) { const a = new Uint32Array(arr.nodes.length * 2); a.set(arr.nodes); arr.nodes = a; } arr.nodes[arr.nN++] = n; }
        else { if (arr.nE === arr.edges.length) { const a = new Uint32Array(arr.edges.length * 2); a.set(arr.edges); arr.edges = a; } arr.edges[arr.nE++] = n; }
    };
    const strings = [];
    let sBuf = [], inStr = false, esc = false, suche = "";
    for (;;) {
        const n = fs.readSync(fd, B, 0, B.length, null);
        if (!n) break;
        let i = 0;
        if (phase === "kopf") {
            const t = B.toString("latin1", 0, n), alt = kopf.length;
            const k = (kopf + t).indexOf('"nodes":[');
            if (k < 0) { kopf += t; continue; }
            kopf = (kopf + t).slice(0, k);
            i = k + 9 - alt; // latin1: ein Zeichen je Byte
            phase = "zahlen"; ziel = "nodes";
        }
        for (; i < n; i++) {
            const c = B[i];
            if (phase === "zahlen") {
                if (c >= 48 && c <= 57) zahl = (zahl < 0 ? 0 : zahl * 10) + (c - 48);
                else {
                    if (zahl >= 0) { push(zahl); zahl = -1; }
                    if (c === 93) { phase = ziel === "nodes" ? "suche-edges" : "suche-strings"; suche = ""; }
                }
            } else if (phase === "suche-edges" || phase === "suche-strings") {
                suche += String.fromCharCode(c);
                if (suche.length > 40) suche = suche.slice(-40);
                if (phase === "suche-edges" && suche.endsWith('"edges":[')) { phase = "zahlen"; ziel = "edges"; }
                if (phase === "suche-strings" && suche.endsWith('"strings":[')) phase = "strings";
            } else if (phase === "strings") {
                if (!inStr) { if (c === 34) { inStr = true; sBuf = [34]; } else if (c === 93) { phase = "ende"; break; } continue; }
                sBuf.push(c);
                if (esc) { esc = false; continue; }
                if (c === 92) { esc = true; continue; }
                if (c === 34) {
                    inStr = false;
                    let s;
                    try { s = JSON.parse(Buffer.from(sBuf).toString("utf8")); } catch (_e) { s = "?"; }
                    strings.push(s.length > 200 ? s.slice(0, 200) : s);
                    sBuf = [];
                }
                if (sBuf.length > 1e6) { sBuf = sBuf.slice(0, 400); } // ueberlange Zeichenkette: Kopf genuegt (schliesst dennoch richtig)
            }
        }
        if (phase === "ende") break;
    }
    fs.closeSync(fd);
    const meta = JSON.parse(kopf.replace(/,\s*$/, "") + "}").snapshot.meta;
    return { meta, nodes: arr.nodes.subarray(0, arr.nN), edges: arr.edges.subarray(0, arr.nE), strings };
}

const t0 = Date.now();
const { meta, nodes, edges, strings } = lies(datei);
const NF = meta.node_fields.length, EF = meta.edge_fields.length;
const nT = meta.node_fields.indexOf("type"), nName = meta.node_fields.indexOf("name"), nSelf = meta.node_fields.indexOf("self_size"), nEc = meta.node_fields.indexOf("edge_count");
const eT = meta.edge_fields.indexOf("type"), eName = meta.edge_fields.indexOf("name_or_index"), eTo = meta.edge_fields.indexOf("to_node");
const NTYP = meta.node_types[0], ETYP = meta.edge_types[0];
const N = nodes.length / NF;
const ersteKante = new Uint32Array(N + 1);
for (let v = 0, e = 0; v < N; v++) { ersteKante[v] = e; e += nodes[v * NF + nEc]; ersteKante[v + 1] = e; }
const schwach = ETYP.indexOf("weak"), shortcut = ETYP.indexOf("shortcut");
const klasse = (v) => {
    const t = NTYP[nodes[v * NF + nT]], nm = strings[nodes[v * NF + nName]];
    if (t === "object" || t === "native") return nm;
    if (t === "closure") return "(closure)";
    if (t === "string" || t === "concatenated string" || t === "sliced string") return "(string)";
    return "(" + t + ")";
};
// ── Postorder ab der Wurzel 0 ──
const post = new Int32Array(N).fill(-1), ordnung = new Uint32Array(N);
let pn = 0;
{
    const stapelV = new Uint32Array(N), stapelE = new Uint32Array(N), besucht = new Uint8Array(N);
    let sp = 0; stapelV[0] = 0; stapelE[0] = ersteKante[0]; besucht[0] = 1;
    while (sp >= 0) {
        const v = stapelV[sp];
        if (stapelE[sp] < ersteKante[v + 1]) {
            const e = stapelE[sp]++;
            const typ = edges[e * EF + eT];
            if (typ === schwach || typ === shortcut) continue;
            const w = edges[e * EF + eTo] / NF;
            if (besucht[w]) continue;
            besucht[w] = 1; sp++; stapelV[sp] = w; stapelE[sp] = ersteKante[w];
        } else { post[v] = pn; ordnung[pn++] = v; sp--; }
    }
}
// ── Vorgaenger (CSR) ──
const vorZ = new Uint32Array(N + 1);
for (let v = 0; v < N; v++) if (post[v] >= 0) for (let e = ersteKante[v]; e < ersteKante[v + 1]; e++) { const typ = edges[e * EF + eT]; if (typ === schwach || typ === shortcut) continue; vorZ[edges[e * EF + eTo] / NF + 1]++; }
for (let v = 0; v < N; v++) vorZ[v + 1] += vorZ[v];
const vor = new Uint32Array(vorZ[N]), fuell = vorZ.slice(0, N);
for (let v = 0; v < N; v++) if (post[v] >= 0) for (let e = ersteKante[v]; e < ersteKante[v + 1]; e++) { const typ = edges[e * EF + eT]; if (typ === schwach || typ === shortcut) continue; const w = edges[e * EF + eTo] / NF; vor[fuell[w]++] = v; }
// ── Dominatoren (in Postorder-Nummern) ──
const dom = new Int32Array(pn).fill(-1), wurzel = post[0];
dom[wurzel] = wurzel;
for (let geaendert = true, runde = 0; geaendert; runde++) {
    geaendert = false;
    for (let i = pn - 1; i >= 0; i--) {
        if (i === wurzel) continue;
        const v = ordnung[i];
        let neu = -1;
        for (let k = vorZ[v]; k < vorZ[v + 1]; k++) {
            let p = post[vor[k]];
            if (p < 0 || dom[p] < 0) continue;
            if (neu < 0) { neu = p; continue; }
            let a = p, b = neu;
            while (a !== b) { while (a < b) a = dom[a]; while (b < a) b = dom[b]; }
            neu = a;
        }
        if (neu >= 0 && dom[i] !== neu) { dom[i] = neu; geaendert = true; }
    }
}
// ── gehaltene Groesse ──
const halt = new Float64Array(pn);
for (let i = 0; i < pn; i++) halt[i] = nodes[ordnung[i] * NF + nSelf];
for (let i = 0; i < pn; i++) if (i !== wurzel && dom[i] >= 0) halt[dom[i]] += halt[i];
// ── je Klasse: eigen, Zahl, gehalten (ohne Doppel: nur Knoten ohne gleichklassigen Dominator-Vorfahren) ──
const kIdx = new Map(), kNamen = [];
const kv = new Int32Array(pn);
for (let i = 0; i < pn; i++) { const k = klasse(ordnung[i]); let j = kIdx.get(k); if (j === undefined) { j = kNamen.length; kIdx.set(k, j); kNamen.push(k); } kv[i] = j; }
const K = kNamen.length, eigen = new Float64Array(K), zahl = new Float64Array(K), gehalten = new Float64Array(K);
// Kinder-Listen des Dominator-Baums fuer einen DFS mit Klassen-Zaehler
const kz = new Uint32Array(pn + 1);
for (let i = 0; i < pn; i++) if (i !== wurzel && dom[i] >= 0) kz[dom[i] + 1]++;
for (let i = 0; i < pn; i++) kz[i + 1] += kz[i];
const kinder = new Uint32Array(kz[pn]), kf = kz.slice(0, pn);
for (let i = 0; i < pn; i++) if (i !== wurzel && dom[i] >= 0) kinder[kf[dom[i]]++] = i;
{
    const aktiv = new Uint32Array(K), st = new Uint32Array(pn), sk = new Uint32Array(pn);
    let sp = 0; st[0] = wurzel; sk[0] = kz[wurzel];
    if (!aktiv[kv[wurzel]]) gehalten[kv[wurzel]] += halt[wurzel];
    aktiv[kv[wurzel]]++; eigen[kv[wurzel]] += nodes[ordnung[wurzel] * NF + nSelf]; zahl[kv[wurzel]]++;
    while (sp >= 0) {
        const i = st[sp];
        if (sk[sp] < kz[i + 1]) {
            const c = kinder[sk[sp]++];
            const k = kv[c];
            if (!aktiv[k]) gehalten[k] += halt[c];
            aktiv[k]++; eigen[k] += nodes[ordnung[c] * NF + nSelf]; zahl[k]++;
            sp++; st[sp] = c; sk[sp] = kz[c];
        } else { aktiv[kv[i]]--; sp--; }
    }
}
const mb = (x) => +(x / 1048576).toFixed(2);
const klassen = kNamen.map((n, j) => ({ n, zahl: zahl[j], eigen: mb(eigen[j]), gehalten: mb(gehalten[j]) }));
// ── Pfad-Name eines Knotens: die Kante von seinem Dominator (oder irgendeinem Vorgaenger) ──
const kantenName = (vonV, zuV) => {
    for (let e = ersteKante[vonV]; e < ersteKante[vonV + 1]; e++) if (edges[e * EF + eTo] / NF === zuV) {
        const t = ETYP[edges[e * EF + eT]], x = edges[e * EF + eName];
        return t === "element" || t === "hidden" ? "[" + x + "]" : strings[x];
    }
    // ohne direkte Kante (der Dominator haelt ueber einen Umweg): die Kante des ersten benannten Vorgaengers
    for (let k = vorZ[zuV]; k < vorZ[zuV + 1]; k++) {
        const p = vor[k];
        for (let e = ersteKante[p]; e < ersteKante[p + 1]; e++) if (edges[e * EF + eTo] / NF === zuV) {
            const t = ETYP[edges[e * EF + eT]];
            if (t === "property" || t === "internal" || t === "context") return "~" + klasse(p) + "." + strings[edges[e * EF + eName]];
        }
    }
    return "?";
};
const pfad = (i) => {
    const teile = [];
    for (let k = 0; k < 9 && i !== wurzel; k++) { const d = dom[i]; teile.unshift(kantenName(ordnung[d], ordnung[i]) + ":" + klasse(ordnung[i])); i = d; }
    return teile.join(" > ");
};
// die groessten Halter: Knoten mit >= 1 MB gehalten, deren Kinder keinen einzelnen Anteil > 80 % tragen (der Knoten IST der Halter)
const halter = [];
for (let i = 0; i < pn; i++) {
    if (halt[i] < 1048576 || i === wurzel) continue;
    let maxK = 0;
    for (let k = kz[i]; k < kz[i + 1]; k++) maxK = Math.max(maxK, halt[kinder[k]]);
    if (maxK > 0.8 * halt[i]) continue;
    halter.push(i);
}
halter.sort((a, b) => halt[b] - halt[a]);
// ── der Zensus nach Halter-Pfad: BFS ab der Wurzel (kuerzester Halte-Weg, schwache Kanten nicht), je Knoten die eigene Groesse
// unter dem Pfad ab dem globalen Objekt, auf L Glieder gekuerzt (Indizes als []) ──
const elter = new Int32Array(N).fill(-1), elterKante = new Int32Array(N).fill(-1);
const q = new Uint32Array(N);
let qz = 0;
{
    let a = 0, z = 0; q[z++] = 0; elter[0] = 0;
    while (a < z) {
        const v = q[a++];
        for (let e = ersteKante[v]; e < ersteKante[v + 1]; e++) {
            const typ = edges[e * EF + eT];
            if (typ === schwach || typ === shortcut) continue;
            // OHNE_EPH: der starke Halte-Weg — die Kante Schluessel -> Wert einer WeakMap haelt nicht (sie lebt nur mit dem Schluessel)
            if (process.env.OHNE_EPH && ETYP[typ] === "internal" && String(strings[edges[e * EF + eName]]).includes(" / part of key")) continue;
            const w = edges[e * EF + eTo] / NF;
            if (elter[w] >= 0) continue;
            elter[w] = v; elterKante[w] = e; q[z++] = w;
        }
    }
    qz = z;
}
const glied = (e) => {
    const t = ETYP[edges[e * EF + eT]], x = edges[e * EF + eName];
    if (t === "element") return "[]";
    if (t === "hidden") return "(h)";
    const s = strings[x];
    if (typeof s !== "string" || /^\d/.test(s) || s.includes(" / part of ")) return "[]"; // Eintraege von Map/Set/WeakMap
    return t === "context" ? "^" + s : "." + s;
};
const istGlobal = (v) => NTYP[nodes[v * NF + nT]] === "object" && /^Window|JSGlobalObject|^global/.test(strings[nodes[v * NF + nName]]);
if (process.env.RO) {
    // DIE RENDER-OBJEKTE (RO=1, mit OHNE_EPH=1): je Render-Objekt des Renderers (Eigenschaften object, material, geometry,
    // _nodeBuilderState) sein Objekt (Mesh) und dessen STARKER Halte-Weg (ohne WeakMap-Kanten), mit Klassen je Glied auf L Glieder
    const L = Number(process.env.RO_L || 7);
    const kante = (v, n) => { for (let e = ersteKante[v]; e < ersteKante[v + 1]; e++) if (ETYP[edges[e * EF + eT]] === "property" && strings[edges[e * EF + eName]] === n) return edges[e * EF + eTo] / NF; return -1; };
    const weg = (v) => {
        const t = [];
        let u = v, k = 0;
        for (; u > 0 && k < 80 && !istGlobal(u); k++, u = elter[u]) t.push(glied(elterKante[u]) + ":" + klasse(u));
        if (u < 0 || elter[v] < 0) return "(unerreichbar stark)";
        t.reverse();
        return (istGlobal(u) ? "G" : "(intern)") + t.slice(0, L).join("");
    };
    const je = new Map();
    let n = 0;
    for (let v = 0; v < N; v++) {
        if (NTYP[nodes[v * NF + nT]] !== "object") continue;
        const o = kante(v, "object");
        if (o < 0 || kante(v, "_nodeBuilderState") < 0 || kante(v, "material") < 0) continue;
        n++;
        const imSzene = kante(o, "parent");
        const k = weg(o) + (imSzene >= 0 && NTYP[nodes[imSzene * NF + nT]] !== "hidden" ? "" : "");
        const e = je.get(k) || { ro: 0, roMB: 0, obj: new Set() };
        e.ro++;
        e.roMB += post[v] >= 0 ? halt[post[v]] : 0;
        if (!e.obj.has(o)) { e.obj.add(o); e.objMB = (e.objMB || 0) + (post[o] >= 0 ? halt[post[o]] : 0); }
        je.set(k, e);
    }
    // [Weg, Render-Objekte, Objekte, MB gehalten von den Render-Objekten, MB gehalten von den Objekten]
    const aus = [...je].map(([k, e]) => [k, e.ro, e.obj.size, mb(e.roMB), mb(e.objMB || 0)]).sort((a, b) => b[3] + b[4] - a[3] - a[4] || b[1] - a[1]);
    process.stdout.write(JSON.stringify({ renderObjekte: n, je: aus.slice(0, 200) }, null, 1));
    process.exit(0);
}
// je Knoten in BFS-Ordnung: Tiefe unter dem globalen Objekt (dG, -1 = nicht darunter) und der Ahne in Tiefe L (anc)
const zensus = (L, nurPuffer, klassig) => {
    const dG = new Int32Array(N).fill(-1), dR = new Int32Array(N), anc = new Int32Array(N).fill(-1), memo = new Map();
    for (let i = 1; i < qz; i++) {
        const v = q[i], p = elter[v];
        if (istGlobal(v)) { dG[v] = 0; anc[v] = v; continue; }
        if (dG[p] >= 0) { dG[v] = dG[p] + 1; anc[v] = dG[v] <= L ? v : anc[p]; }
        else { dR[v] = dR[p] + 1; anc[v] = dR[v] <= 3 ? v : anc[p]; } // ausserhalb des Globalen: der Knoten in Tiefe 3 unter der Wurzel
    }
    const name = (a) => {
        let s = memo.get(a);
        if (s !== undefined) return s;
        if (dG[a] < 0) { const t = []; for (let u = a; u !== 0 && t.length < 4; u = elter[u]) t.push(klasse(u) + glied(elterKante[u])); s = "(intern) " + t.reverse().join(" > "); }
        else { const t = []; for (let u = a; dG[u] > 0; u = elter[u]) t.push(glied(elterKante[u]) + (klassig ? ":" + klasse(u) : "")); s = "G" + t.reverse().join(""); }
        memo.set(a, s);
        return s;
    };
    const m = new Map();
    for (let i = 1; i < qz; i++) {
        const v = q[i];
        if (nurPuffer && klasse(v) !== "system / JSArrayBufferData") continue;
        const s = nodes[v * NF + nSelf];
        if (!s) continue;
        const k = name(anc[v]);
        m.set(k, (m.get(k) || 0) + s);
    }
    return [...m].filter(([, s]) => s >= Number(process.env.MIN || 262144)).sort((a, b) => b[1] - a[1]).slice(0, 300).map(([k, s]) => [k, mb(s)]);
};
if (process.env.TIEF) {
    // nur der tiefe Zensus mit Klassen je Glied, gefiltert (TIEF=Glieder, FILTER=Anfang des Pfads)
    const f = process.env.FILTER || "";
    process.stdout.write(JSON.stringify({ tief: zensus(Number(process.env.TIEF), false, true).filter(([k]) => k.startsWith(f)) }, null, 1));
    process.exit(0);
}
const aus = {
    zensus3: zensus(3, false),
    zensus5: zensus(5, false),
    puffer5: zensus(5, true),
    datei: require("path").basename(datei), knoten: N, erreichbar: pn, sek: +((Date.now() - t0) / 1000).toFixed(1),
    gesamt_mb: mb(halt[wurzel]),
    klassen_gehalten: [...klassen].sort((a, b) => b.gehalten - a.gehalten).slice(0, TOP),
    klassen_eigen: [...klassen].sort((a, b) => b.eigen - a.eigen).slice(0, TOP),
    halter: halter.slice(0, TOP * 2).map((i) => ({ mb: mb(halt[i]), klasse: klasse(ordnung[i]), pfad: pfad(i) })),
};
process.stdout.write(JSON.stringify(aus, null, 1));
