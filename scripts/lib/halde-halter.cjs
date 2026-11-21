"use strict";
// DIE HALDE NACH HALTER (heap-register, 21.11.): `heapHalter` (draw-zaehler.cjs) nennt nur die Bytes der Typed Arrays ab r — am
// Richter-Preis von verkehr#1 325 von 559 MB; der Rest (Objekte, Strings, Closures, Code, die Knoten-Caches des Renderers) blieb ohne
// Namen. Hier liest EIN Schnappschuss der V8-Halde (`HeapProfiler.takeHeapSnapshot`, als Datei) jeden Knoten: die Breitensuche ab
// `window.anazhRealm` bucht jede Selbst-Größe auf den Pfad, über den sie ZUERST erreicht wird (dieselbe Lesart wie heapHalter, Pfad
// bis `tiefe` Glieder, Map/Set-Einträge als „[]“), was r nicht erreicht, auf „außerhalb r · <Typ> <Name>“. Schwache Kanten zählen nie.
// Der Leser: `werkbank puffer --halde <datei>` (Route /halde) — die Halter-Tafel einer Pose, Summe = die ganze Halde.
const fs = require("fs");

// der Schnappschuss ist JSON von ~1–2 B je Halden-Byte: über 512 MB trägt ihn kein String — gelesen wird er Byte für Byte
function lies(datei) {
    const B = fs.readFileSync(datei);
    let i = 0;
    const suche = (s) => {
        const j = B.indexOf(s, i, "latin1");
        if (j < 0) throw new Error("halde: " + s + " fehlt");
        i = j + s.length;
    };
    // der Kopf (snapshot.meta …) ist klein: bis vor "nodes"
    suche('"snapshot":');
    const kopfEnde =
        B.indexOf(',"nodes":', i, "latin1") >= 0
            ? B.indexOf(',"nodes":', i, "latin1")
            : B.indexOf(',\n"nodes":', i, "latin1");
    const kopf = JSON.parse(B.toString("utf8", i, kopfEnde));
    const zahlen = (name, n) => {
        suche('"' + name + '":');
        while (B[i] !== 0x5b) i++;
        i++;
        const a = new Float64Array(n);
        let k = 0,
            v = 0,
            inZahl = false;
        for (; ; i++) {
            const c = B[i];
            if (c >= 48 && c <= 57) {
                v = v * 10 + (c - 48);
                inZahl = true;
            } else {
                if (inZahl) a[k++] = v;
                v = 0;
                inZahl = false;
                if (c === 0x5d) break;
            }
        }
        i++;
        return a.subarray(0, k);
    };
    const nf = kopf.meta.node_fields.length,
        ef = kopf.meta.edge_fields.length;
    const nodes = zahlen("nodes", kopf.node_count * nf);
    const edges = zahlen("edges", kopf.edge_count * ef);
    suche('"strings":');
    while (B[i] !== 0x5b) i++;
    i++;
    const strings = [];
    for (;;) {
        while (B[i] !== 0x22 && B[i] !== 0x5d) i++;
        if (B[i] === 0x5d) break;
        // ein JSON-String: bis zum unmaskierten Anführungszeichen, dann JSON.parse des kurzen Stücks (Escapes)
        let j = i + 1,
            esc = false;
        for (; ; j++) {
            const c = B[j];
            if (esc) esc = false;
            else if (c === 0x5c) esc = true;
            else if (c === 0x22) break;
        }
        const roh = B.toString("utf8", i, j + 1);
        strings.push(roh.indexOf("\\") < 0 ? roh.slice(1, -1) : JSON.parse(roh));
        i = j + 1;
    }
    return { meta: kopf.meta, nodes, edges, strings, nf, ef };
}

function halter(datei, { tiefe = 3, top = 60, wurzel = "anazhRealm", tief = [] } = {}) {
    const { meta, nodes, edges, strings, nf, ef } = lies(datei);
    const NT = meta.node_types[0],
        ET = meta.edge_types[0];
    const fT = meta.node_fields.indexOf("type"),
        fN = meta.node_fields.indexOf("name"),
        fS = meta.node_fields.indexOf("self_size"),
        fE = meta.node_fields.indexOf("edge_count");
    const eT = meta.edge_fields.indexOf("type"),
        eN = meta.edge_fields.indexOf("name_or_index"),
        eZ = meta.edge_fields.indexOf("to_node");
    const n = nodes.length / nf;
    const erste = new Uint32Array(n + 1);
    for (let k = 0, e = 0; k < n; k++) {
        erste[k] = e;
        e += nodes[k * nf + fE];
    }
    erste[n] = edges.length / ef;
    const SCHWACH = ET.indexOf("weak"),
        ABK = ET.indexOf("shortcut"),
        ELEM = ET.indexOf("element"),
        HIDDEN = ET.indexOf("hidden");
    const PROP = ET.indexOf("property"),
        INTERN = ET.indexOf("internal"),
        KONTEXT = ET.indexOf("context");
    const groesse = (k) => nodes[k * nf + fS];
    const name = (k) => strings[nodes[k * nf + fN]];
    const typ = (k) => NT[nodes[k * nf + fT]];
    let gesamt = 0;
    for (let k = 0; k < n; k++) gesamt += groesse(k);
    // die Wurzel: die Eigenschaft `anazhRealm` eines Window-Objekts
    let r = -1;
    for (let k = 0; k < n && r < 0; k++) {
        if (typ(k) !== "object" || !/^Window\b/.test(name(k))) continue;
        for (let e = erste[k]; e < erste[k + 1]; e++)
            if (edges[e * ef + eT] === PROP && strings[edges[e * ef + eN]] === wurzel) {
                r = edges[e * ef + eZ] / nf;
                break;
            }
    }
    if (r < 0) throw new Error("halde: window." + wurzel + " fehlt im Schnappschuss");
    // Breitensuche ab r: je Knoten der Pfad seines ersten Erreichens (gekürzt auf `tiefe` Glieder; ein Pfad aus `tief` geht 3 weiter)
    const pfadId = new Int32Array(n).fill(-1),
        glieder = new Uint8Array(n);
    const pfade = ["r"],
        pfadNr = new Map([["r", 0]]);
    const id = (p) => {
        let v = pfadNr.get(p);
        if (v === undefined) {
            v = pfade.length;
            pfade.push(p);
            pfadNr.set(p, v);
        }
        return v;
    };
    const q = new Uint32Array(n);
    let kopf = 0,
        ende = 0;
    q[ende++] = r;
    pfadId[r] = 0;
    while (kopf < ende) {
        const k = q[kopf++],
            p = pfade[pfadId[k]],
            g = glieder[k];
        const grenze = tief.some((t) => p.startsWith(t)) ? tiefe + 3 : tiefe;
        for (let e = erste[k]; e < erste[k + 1]; e++) {
            const t = edges[e * ef + eT];
            if (t === SCHWACH || t === ABK) continue;
            const z = edges[e * ef + eZ] / nf;
            if (pfadId[z] >= 0) continue;
            // Window und DOM werden nie durchwandert (wie heapHalter: globalThis und Node)
            const zn = name(z);
            if (typ(z) === "object" && /^Window\b/.test(zn)) continue;
            let glied;
            if (g >= grenze) glied = "";
            else if (t === PROP) glied = "." + strings[edges[e * ef + eN]];
            else if (t === ELEM) glied = "[]";
            else if (t === KONTEXT) glied = ":" + strings[edges[e * ef + eN]];
            // innere Glieder (Map-Tafel, Elemente, Backing-Store, Maps der Form) zählen zum Halter, sie verlängern den Pfad nicht
            else glied = "";
            pfadId[z] = glied ? id(p + glied) : pfadId[k];
            glieder[z] = glied ? g + 1 : g;
            q[ende++] = z;
        }
    }
    const je = new Map(),
        art = new Map();
    let ausR = 0;
    const aussen = new Map();
    for (let k = 0; k < n; k++) {
        const s = groesse(k);
        if (!s) continue;
        if (pfadId[k] < 0) {
            ausR += s;
            const kk = typ(k) + " " + String(name(k)).slice(0, 60);
            aussen.set(kk, (aussen.get(kk) || 0) + s);
            continue;
        }
        const p = pfade[pfadId[k]];
        je.set(p, (je.get(p) || 0) + s);
        const ak = p + "\u0000" + typ(k) + " " + String(name(k)).slice(0, 40);
        art.set(ak, (art.get(ak) || 0) + s);
    }
    const mb = (b) => +(b / 1048576).toFixed(2);
    const liste = [...je].sort((a, b) => b[1] - a[1]).slice(0, top);
    const arten = new Map();
    for (const [ak, s] of art) {
        const [p, a] = ak.split("\u0000");
        if (!liste.some(([x]) => x === p)) continue;
        if (!arten.has(p)) arten.set(p, []);
        arten.get(p).push([a, s]);
    }
    return {
        gesamt_mb: mb(gesamt),
        ab_r_mb: mb(gesamt - ausR),
        ausserhalb_r_mb: mb(ausR),
        knoten: n,
        halter: liste.map(([p, s]) => [
            p,
            mb(s),
            (arten.get(p) || [])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([a, x]) => [a, mb(x)]),
        ]),
        ausserhalb: [...aussen]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 25)
            .map(([a, s]) => [a, mb(s)]),
    };
}
module.exports = { halter, lies };

if (require.main === module) {
    const a = process.argv.slice(2);
    const o = (k, d) => (a.indexOf(k) >= 0 ? a[a.indexOf(k) + 1] : d);
    const tief = a.filter((x, k) => a[k - 1] === "--tief");
    console.log(
        JSON.stringify(halter(a[0], { tiefe: Number(o("--tiefe", 3)), top: Number(o("--top", 60)), tief }), null, 1)
    );
}
