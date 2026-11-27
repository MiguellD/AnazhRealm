"use strict";
// DER ABDRUCK DER WELT (`node scripts/werkbank.cjs abdruck`, w28-funktion-welt): die Welt ist eine FUNKTION — derselbe Kopf,
// zweimal gebaut, ergibt 0 abweichende Dinge. Headless (Null-Renderer, keine GPU, keine laufende Werkbank): der EINE Welt-Boot
// des Baums (welt-boot `nullWelt`), je Ort (genesis · wiese · dorf aus spec/profiband/haushalt.json) Ring + „die Welt steht"
// in ZEITLOSEN Bau-Takten (die Welt baut und lebt nicht — gleich wie viele Takte das Gerät braucht, `abdruckFahrt`), dann DIE
// FESTE UHR — die Welt-Uhr springt über die Tür des Spiels (`_weltUhrNimm`, wie die Uhr eines Mitspielers) auf die Stunde des
// Orts — und genau `TAKTE` Lebens-Takte in exakten 1/64 s am Mittag, jeder mit zu Ende gebautem Bau; danach je BENANNTEM Ding
// ein Inhalt-Hash. Die Zahl der gelebten Takte führt, nie die Wanduhr: ein Abdruck dieser Fahrt und einer der Fahrt davor
// (das Einschwingen lebte nach der Wanduhr) sind zwei Maße — verglichen wird nur innerhalb EINER Fahrt (`--gegen <sha>` baut
// beide Seiten mit der Linse des rufenden Baums).
// Die Klassen (je Ort): halter (jedes ArrayBuffer-Byte am Pfad seines ersten Halters, Schlüssel sortiert) · saetze (je Block
// die Quell-Geometrie, ohne Pack-Lage) · instanzen (je Instanz-Mesh die sortierte Menge seiner Instanzen) · netze (je Mesh der
// Szene Geometrie und Lage, als Menge je Name) · stoffe (je Stoff jede Eigenschaft; Knoten als GRAPH: Typ + Werte + Kanten,
// nie die Erzeugungs-id) · plan · bestand · licht (5 Stunden) · boden · platte.
// KANONISCH, nie gelernt: was keine Lage der Welt ist (Pack-Reihenfolge, Erzeugungs-ids, die Reihenfolge der Ankunft), hasht der
// Abdruck in der Form, die es nicht trägt; was kein Zustand der Welt ist, nimmt die feste Liste `KEIN_WELT_ZUSTAND` beim Namen
// mit Grund aus — keine Rausch-Liste, kein Toleranz-Abzug.
// DER LESER: jede Abgabe belegt „außerhalb von X byte-gleich" mit `abdruck --gegen <datei|sha>` (.claude/agents/champion.md);
// die Linse „A gegen A = 0 anders" fährt in der vollen Batterie (`abdruck --a-gegen-a`), ihr Selbsttest in check:statik.
const path = require("path");
const fs = require("fs");
const os = require("os");
const cp = require("child_process");

// ── DER KERN (Seite und Selbsttest: derselbe Text) ─────────────────────────────────────────────────────────────────────────
// `abdruckKern(G)` → die Hasher über G.st / G.r. In der Seite ist G das Fenster (`st`, `r` sind seine Getter).
function abdruckKern(G) {
    // FNV-1a, zwei Ströme (64 bit)
    const H = () => ({ a: 0x811c9dc5, b: 0x01000193 ^ 0x9e3779b9 });
    const byte = (h, x) => {
        h.a = Math.imul(h.a ^ x, 0x01000193);
        h.b = (Math.imul(h.b ^ x, 0x01000193) + 0x7f4a7c15) | 0;
    };
    const txt = (h, s) => {
        s = String(s);
        for (let i = 0; i < s.length; i++) {
            const c = s.charCodeAt(i);
            byte(h, c & 255);
            if (c > 255) byte(h, c >> 8);
        }
        byte(h, 0);
    };
    const hex = (h) => (h.a >>> 0).toString(16).padStart(8, "0") + (h.b >>> 0).toString(16).padStart(8, "0");
    const typed = (h, v) => {
        const u = new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
        if (u.byteLength % 4 === 0 && u.byteOffset % 4 === 0) {
            const w = new Uint32Array(u.buffer, u.byteOffset, u.byteLength >> 2);
            for (let i = 0; i < w.length; i++) {
                h.a = Math.imul(h.a ^ w[i], 0x01000193);
                h.b = (Math.imul(h.b ^ (w[i] >>> 7), 0x01000193) + 0x7f4a7c15) | 0;
            }
        } else for (let i = 0; i < u.length; i++) byte(h, u[i]);
    };
    const textH = (s) => {
        const h = H();
        txt(h, s);
        return hex(h);
    };
    const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    // Schlüssel, die kein Inhalt sind: Identität (uuid, id), Zähler des Caches, Rückwege, Stempel der Wanduhr
    const SKIP =
        /^(uuid|_uuid|id|version|_listeners|parent|parents|__|_cache|_cacheKey|matrixWorld|modelViewMatrix|normalMatrix|stackTrace|_t0|zeit|seit|ms$|t$|stamp)/;
    // DER KNOTEN ALS GRAPH (vendor three r184: `customCacheKey(){return this.id}` — der Programm-Schlüssel jedes Knotens endet in
    // seiner Erzeugungs-id, zwei gleiche Graphen heißen in zwei Läufen verschieden): Typ + jedes Glied ohne Identität + die
    // Kanten (Kind-Knoten über ihren Graph-Hash), je Abdruck einmal je Knoten gemerkt; ein Kreis heißt „@kreis". Ein Glied mit
    // „_" ist das Gedächtnis des Knotens, nie sein Graph (vendor `_getChildren` überspringt es; `_cache` merkt sich die Swizzles,
    // die irgendein Leser schon einmal fragte — `.xz` steht da, wenn ein Takt ihn las)
    const KNOTEN_AUS = /^(_|id$|uuid$|version$|stackTrace$|parents$|isNode$)/;
    let memo = new WeakMap();
    // DIE TAKT-UHR IM STOFF (`state.lodUniforms.uLodTakt` = `state.weltTakt`, die Takte DIESES Geräts seit dem Laden): sie
    // zählt den Loop, nie die Welt-Uhr; was sie zeigt, ist die Blende des Eintritts — die trägt `instanzen` (aEin) als Stand
    const taktUhr = (n) => {
        const lu = G.st && G.st.lodUniforms;
        return !!lu && n === lu.uLodTakt;
    };
    // DIE REIHEN DES KARTEN-ATLAS (`_karteNadel`: `karteNadel` · `karteJahr`, je Glied `z.idx` — die Schicht, vergeben in der
    // Folge der Bestellung): eine Reihe hasht als Menge Karte → Wert, nie in der Folge ihrer Schichten
    const atlasReihe = (n) => {
        const at = G.r && G.r._kartenAtlas;
        if (!at || !at.zellen || !(n === at.nadelU || n === at.jahrU) || !Array.isArray(n.array)) return null;
        const h = H();
        txt(h, "K:atlas-reihe:" + (n.name || ""));
        for (const [k, z] of [...at.zellen].sort(vor)) (txt(h, String(k)), wert(h, n.array[z.idx], 3, new Set()));
        return hex(h);
    };
    const knoten = (n) => {
        const m = memo.get(n);
        if (m) return m;
        if (taktUhr(n)) return "@takt-uhr";
        const reihe = atlasReihe(n);
        if (reihe) return (memo.set(n, reihe), reihe);
        memo.set(n, "@kreis");
        const h = H();
        txt(h, "K:" + (n.type || n.constructor?.name || "?"));
        for (const k of Object.keys(n).sort()) {
            if (KNOTEN_AUS.test(k)) continue;
            let x;
            try {
                x = n[k];
            } catch {
                continue;
            }
            txt(h, k);
            wert(h, x, 5, new Set());
        }
        const e = hex(h);
        memo.set(n, e);
        return e;
    };
    const fnH = (f) => "fn:" + (f.name || "") + ":" + textH(Function.prototype.toString.call(f));
    // kanonischer Wert-Hash: Objekte nach sortierten Schlüsseln, Map/Set sortiert, Typed als Bytes; Zahlen auf 1e-6
    const wert = (h, v, tiefe, gesehen) => {
        if (v == null) return txt(h, "~");
        const t = typeof v;
        if (t === "number") return txt(h, Number.isFinite(v) ? Math.round(v * 1e6) / 1e6 : String(v));
        if (t === "string") return txt(h, v.replace(UUID, "uuid"));
        if (t === "boolean" || t === "bigint") return txt(h, v);
        if (t === "function") return txt(h, fnH(v));
        if (t !== "object") return txt(h, t);
        if (ArrayBuffer.isView(v)) return (txt(h, v.constructor.name), typed(h, v));
        if (v instanceof ArrayBuffer) return typed(h, new Uint8Array(v));
        if (v.isNode) return txt(h, "N:" + knoten(v));
        if (v.isObject3D || v.isBufferGeometry || v.isMaterial)
            return txt(h, "@" + (v.type || "") + ":" + (v.name || ""));
        if (v.isTexture) return txt(h, "@tex:" + (v.name || "") + ":" + texGroesse(v));
        if (typeof Node !== "undefined" && v instanceof Node) return txt(h, "@dom");
        if (gesehen.has(v)) return txt(h, "@zyklus");
        if (tiefe <= 0) return txt(h, "@tief");
        gesehen.add(v);
        if (v instanceof Map) {
            const e = [...v].map(([k, x]) => [typeof k === "object" ? "obj" : String(k), x]).sort(vor);
            txt(h, "M" + e.length);
            for (const [k, x] of e) (txt(h, k), wert(h, x, tiefe - 1, gesehen));
        } else if (v instanceof Set) {
            const e = [...v].map((x) => W(x, tiefe - 1)).sort();
            txt(h, "S" + e.length);
            for (const k of e) txt(h, k);
        } else if (Array.isArray(v)) {
            txt(h, "A" + v.length);
            for (const x of v) wert(h, x, tiefe - 1, gesehen);
        } else {
            txt(h, "O");
            for (const k of Object.keys(v)
                .filter((k) => !SKIP.test(k))
                .sort()) {
                let x;
                try {
                    x = v[k];
                } catch {
                    continue;
                }
                txt(h, k);
                wert(h, x, tiefe - 1, gesehen);
            }
        }
        gesehen.delete(v);
    };
    const vor = (a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
    const texGroesse = (t) => {
        const i = t.image || (t.source && t.source.data);
        return i ? (i.width | 0) + "x" + (i.height | 0) + "x" + (i.depth | 0) : "-";
    };
    const W = (v, tiefe = 8) => {
        const h = H();
        wert(h, v, tiefe, new Set());
        return hex(h);
    };
    const geoH = (g) => {
        const h = H();
        if (!g || !g.attributes) return "~";
        for (const k of Object.keys(g.attributes).sort()) {
            const a = g.attributes[k];
            const arr = a.array || (a.data && a.data.array);
            txt(h, k);
            if (arr) typed(h, arr);
        }
        if (g.index) typed(h, g.index.array);
        return hex(h);
    };
    // DIE MENGE JE NAME: Dinge gleichen Namens (zwei Instanz-Meshes „vogel") tragen ihre Nummer nach ihrem INHALT, nie nach der
    // Reihenfolge, in der sie ankamen
    // (`einzeln`: je Ding sein Inhalt, nummeriert nach Inhalt — die Stoffe; sonst EIN Ding je Name: die Menge seiner Inhalte und
    // ihre Zahl — ein Ding mehr ist ein anderes Ding, nie eine Kaskade verschobener Nummern)
    const menge = (paare, einzeln = false) => {
        const je = new Map();
        for (const [k, v] of paare) (je.get(k) || je.set(k, []).get(k)).push(v);
        const aus = {};
        for (const [k, l] of je)
            if (einzeln) l.sort().forEach((v, i) => (aus[i ? k + "#" + i : k] = v));
            else aus[k] = l.length === 1 ? l[0] : textH(l.sort().join("+")) + "/" + l.length;
        return aus;
    };
    const name3 = (o) => String(o.name || (o.userData && o.userData.archInstanceKey) || o.type).replace(UUID, "uuid");

    // A · DIE HALTER: jedes ArrayBuffer-Byte der Welt am Pfad seines ersten Halters (Breitensuche ab r, Schlüssel SORTIERT —
    // die Ordnung der Glieder ist die Folge ihres ersten Schreibens, nie Inhalt); Gruppe = die ersten `tiefe` Glieder. Was eine
    // kanonische Klasse trägt, fehlt hier: die Szene (netze · instanzen · stoffe), die Sätze (je Block), die Lagen jedes
    // Instanz-Meshes (als Menge) — und was KEIN_WELT_ZUSTAND nennt.
    const halter = (tiefe = 3, aus_ = []) => {
        const r = G.r,
            st = G.st;
        const gesehen = new WeakSet(),
            q = [[r, "r"]],
            roh = {};
        let bytes = 0;
        if (st.scene) gesehen.add(st.scene);
        if (st.chunkSaetze) gesehen.add(st.chunkSaetze);
        // ein Leib in Bewegung zählt in `netze` (Gestalt) und `bestand` (wer), nie mit seiner Pose
        for (const c of [...(st.creatures || []), ...(st.leichname || [])]) gesehen.add(c);
        for (const [, S] of r._bewohnerSiedlungen || [])
            for (const b of S.aktivListe || []) if (b && b.leib) gesehen.add(b.leib);
        const inst = (o) => {
            for (const a of [o.instanceMatrix, o.instanceColor]) if (a && a.array) gesehen.add(a.array.buffer);
            for (const a of Object.values((o.geometry && o.geometry.attributes) || {}))
                if (a && (a.isInstancedBufferAttribute || a.meshPerAttribute)) {
                    const arr = a.array || (a.data && a.data.array);
                    if (arr) gesehen.add(arr.buffer);
                }
        };
        // DIE KANONISCHEN HALTER (ein Ding, dessen Bytes eine Ablage tragen, hasht in der Form seiner Bedeutung; seine Puffer
        // zählen nicht mehr einzeln):
        //   das Netz des Wassers (`_wasserNetz`: das Sheet als CSR der Dreiecke je Zelle) — seine Bedeutung ist die MENGE seiner
        //     Dreiecke (`_wasserNetzHoehe` nimmt das höchste über dem Punkt, die Folge zählt nicht); das gezeichnete Sheet und die
        //     Rechnung vorab (`_computeWaterSheetData`) tragen dieselben Dreiecke in zwei Folgen
        //   die Kachel der Ferne der Wiese (`_nahWieseFernKachel`): sie trägt jedes Büschel mit Ordnung unter dem höchsten Anteil,
        //     den ein Auge seit ihrem Bau verlangte (sie baut nur neu, wenn das Auge ihn überholt) — gezeichnet wird je Bild, was
        //     das Auge JETZT verlangt (die Wahl der GPU, `WIESE_WGSL`): die Kachel hasht die Büschel unter der Schranke des Auges
        //     jetzt (`_wieseFernSchranke(lage, auge, 0)`); ihre Blöcke je Vorlage sind ihre Kopie
        // die Menge der Dreiecke: je Dreieck seine drei Ecken (jedes Attribut), gedreht auf die kleinste Ecke (die Wendung bleibt)
        const dreiecke = (A, I) => {
            const ecke = (k) => A.map(([a, s]) => Array.from(a.subarray(k * s, k * s + s), (x) => Math.round(x * 1e4)).join(",")).join("/"); // prettier-ignore
            const tri = [];
            for (let t = 0; t + 2 < I.length; t += 3) {
                const e = [ecke(I[t]), ecke(I[t + 1]), ecke(I[t + 2])];
                const m = e.indexOf([...e].sort()[0]);
                tri.push([e[m], e[(m + 1) % 3], e[(m + 2) % 3]].join(";"));
            }
            const h = H();
            for (const s of tri.sort()) txt(h, s);
            return hex(h);
        };
        //   das gezeichnete Sheet des Wassers (`_finalizeWaterSheetMesh`, `voxelChunkWaterIso`): dieselbe Menge, als Mesh
        const kanon = (v, pp) => {
            if (v.pos && v.idx && v.start && v.liste && v.nb) {
                for (const a of [v.pos, v.idx, v.start, v.liste, v.meer]) gesehen.add(a.buffer);
                return [pp + ".dreiecke", dreiecke([[v.pos, 3], [v.meer, 1]], v.idx)];
            }
            if (v.isMesh && v.userData && v.userData.isHydrosphere && v.geometry && v.geometry.index) {
                const g = v.geometry,
                    A = [];
                for (const k of Object.keys(g.attributes).sort()) {
                    const a = g.attributes[k];
                    if (a && a.array) (A.push([a.array, a.itemSize]), gesehen.add(a.array.buffer));
                }
                gesehen.add(g.index.array.buffer);
                return [pp + ".dreiecke", dreiecke(A, g.index.array)];
            }
            if ("anteil" in v && v.lage && v.basis && Array.isArray(v.bueschel) && r.constructor._wieseFernSchranke) {
                const S = r.constructor._wieseFernSchranke(v.lage, r._wieseAuge(st.camera.position), 0),
                    h = H();
                v.bueschel.forEach((b, i) => {
                    if (!(b.o < S)) return;
                    txt(h, Math.round(b.o * 1e6));
                    txt(h, b.vorlage);
                    for (let j = 0; j < 16; j++) txt(h, Math.round(v.basis[i * 16 + j] * 1e4));
                    // die Ebene des Gesetzes (`_wieseHang`): an ihr misst das Gesetz der Ferne Anteil und Größe des Büschels
                    for (let j = 0; j < 2; j++) txt(h, Math.round(v.hang[i * 2 + j] * 1e5));
                    for (let j = 0; j < 3; j++) txt(h, Math.round(v.farben[i * 3 + j] * 1e4));
                });
                // ihre Puffer (Basis, Tint, die Blöcke je Vorlage) sind die Kopie dieser Büschel
                const weg = (x, t) => {
                    if (!x || typeof x !== "object" || t < 0) return;
                    if (ArrayBuffer.isView(x)) return gesehen.add(x.buffer);
                    if (Array.isArray(x)) return x.forEach((y) => weg(y, t - 1));
                    for (const y of Object.values(x)) weg(y, t - 1);
                };
                for (const k of Object.keys(v))
                    if (k !== "lage" && k !== "chunkKarten" && k !== "bueschel") weg(v[k], 3);
                return [pp + ".bueschel", hex(h)];
            }
            return null;
        };
        for (let i = 0; i < q.length; i++) {
            const [o, p] = q[i];
            q[i] = null;
            if (aus_.some((re) => re.test(p))) continue;
            const kinder = [];
            if (o instanceof Map)
                [...o]
                    .map(([k, v]) => [v, p + "[=" + (typeof k === "object" ? "obj" : String(k)) + "]"])
                    .sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
                    .forEach((x) => kinder.push(x));
            else if (o instanceof Set) {
                let j = 0;
                for (const v of o) kinder.push([v, p + "[#" + j++ + "]"]);
            } else if (Array.isArray(o))
                o.forEach((v, j) => kinder.push([v, p + (v && v.isObject3D ? "[o:" + name3(v) + "]" : "[" + j + "]")]));
            if (!Array.isArray(o))
                for (const k of Object.keys(o).sort()) {
                    if (k === "parent") continue;
                    try {
                        kinder.push([o[k], p + "." + k]);
                    } catch {
                        /* ein Getter, der wirft, hält nichts */
                    }
                }
            for (const [v, pp] of kinder) {
                if (!v || typeof v !== "object" || gesehen.has(v)) continue;
                gesehen.add(v);
                if (v.isInstancedMesh) inst(v);
                // ein Instanz-Attribut liegt in der Folge der Slots (die Ankunft der Instanzen) — `instanzen` trägt es als Menge
                if ((v.isInstancedBufferAttribute || v.isInstancedInterleavedBuffer) && v.array)
                    gesehen.add(v.array.buffer);
                const buf = ArrayBuffer.isView(v) ? v : v instanceof ArrayBuffer ? new Uint8Array(v) : null;
                const gruppe = (s) =>
                    s
                        .split(/(?=[.[])/)
                        .slice(0, tiefe)
                        .map((x) => (x[0] === "[" ? "[]" : x))
                        .join("");
                const kn = !buf && !aus_.some((re) => re.test(pp)) && kanon(v, pp);
                if (kn) ((roh[gruppe(kn[0])] ||= {})[kn[0].replace(UUID, "uuid")] ||= []).push(kn[1]);
                else if (buf) {
                    if (buf.buffer !== v && gesehen.has(buf.buffer)) continue;
                    gesehen.add(buf.buffer);
                    if (aus_.some((re) => re.test(pp))) continue;
                    const g = gruppe(pp);
                    const h = H();
                    typed(h, buf);
                    bytes += buf.byteLength;
                    const n = pp.replace(UUID, "uuid");
                    ((roh[g] ||= {})[n] ||= []).push(hex(h));
                } else if (v !== globalThis && !(typeof Node !== "undefined" && v instanceof Node)) q.push([v, pp]);
            }
        }
        const aus = {};
        for (const [g, je] of Object.entries(roh)) {
            aus[g] = {};
            for (const [n, l] of Object.entries(je)) aus[g][n] = l.sort().join("+");
        }
        return { aus, bytes };
    };

    // A2 · DIE SÄTZE ohne Pack-Reihenfolge: je Block (Schlüssel) die Quell-Geometrie, die er in den Satz legte
    // Der Block einer Bau-Gruppe (`_bauSatzLege`: `b.bau`, n Ecken je Instanz, cnt Instanzen) trägt die Kopien seiner Instanzen
    // in der Folge ihrer SLOTS — die Folge, in der sie in die Gruppe traten: der Block hasht als Menge seiner Kopien.
    const bauBlockH = (b) => {
        const g = b.geom,
            n = b.bau.n,
            cnt = b.bau.cnt;
        const A = Object.keys(g.attributes)
            .sort()
            .map((k) => [k, g.attributes[k]]);
        const je = [];
        for (let i = 0; i < cnt; i++) {
            const h = H();
            for (const [k, a] of A) {
                const arr = a.array || (a.data && a.data.array),
                    s = a.itemSize;
                txt(h, k);
                if (arr) typed(h, arr.subarray(i * n * s, (i + 1) * n * s));
            }
            je.push(hex(h));
        }
        const h = H();
        for (const x of je.sort()) txt(h, x);
        if (g.index) {
            // der Index einer Kopie relativ zu ihrer ersten Ecke: die Vorlage, cnt-mal
            const I = g.index.array,
                m = I.length / Math.max(1, cnt);
            const rel = new Int32Array(m);
            for (let j = 0; j < m; j++) rel[j] = I[j];
            typed(h, rel);
        }
        return hex(h) + "/" + cnt;
    };
    const saetze = () => {
        const paare = [];
        for (const [sk, s] of G.st.chunkSaetze || [])
            for (const [bk, b] of s.bloecke || [])
                paare.push([
                    (String(sk) + "|" + String(bk)).replace(UUID, "uuid"),
                    !b.geom
                        ? "~" + b.vAnzahl
                        : b.bau && b.bau.cnt > 0 && b.bau.n * b.bau.cnt === b.geom.attributes.position.count
                          ? bauBlockH(b)
                          : geoH(b.geom),
                ]);
        return menge(paare);
    };
    const satzNetze = () => {
        const s = new WeakSet();
        for (const [, x] of G.st.chunkSaetze || []) if (x.mesh) s.add(x.mesh);
        return s;
    };
    // A3 · DIE INSTANZEN ohne Reihenfolge: je Instanz-Mesh die sortierte Menge seiner Instanzen (Matrix auf 1e-4 + jedes
    // Instanz-Attribut). Zwei Glieder sind Lage der Ablage, nie der Welt, und reisen in ihrer Bedeutung:
    //   aKarte.x — die SCHICHT des Karten-Atlas (`_impostorZelleNeu`: `idx = at.n++`, vergeben in der Folge der Bestellung) →
    //              der Schlüssel der Karte, die dort liegt (`fimp:<art>|<gestalt>`)
    //   aEin     — der Takt des Eintritts (`state.weltTakt` beim Setzen) → wie weit die Blende ist (0 … KARTEN_EINTRITT_TAKTE)
    let schichtKey = null;
    const schicht = (x) => {
        if (!schichtKey) {
            schichtKey = new Map();
            const at = G.r._kartenAtlas;
            if (at && at.zellen) for (const [k, z] of at.zellen) schichtKey.set(z.idx, k);
        }
        return "schicht:" + (schichtKey.get(Math.round(x)) ?? "?" + Math.round(x));
    };
    const eintritt = (x) => {
        const E = (G.r.constructor && G.r.constructor.KARTEN_EINTRITT_TAKTE) || 32;
        return "ein:" + (x > 0 ? Math.max(0, Math.min(E, (G.st.weltTakt | 0) - x)) : "-");
    };
    const instanzen = () => {
        schichtKey = null;
        const paare = [];
        G.st.scene.traverse((o) => {
            if (!o.isInstancedMesh) return;
            const n = Math.min(o.count, o.instanceMatrix.count),
                M = o.instanceMatrix.array,
                C = o.instanceColor && o.instanceColor.array;
            const inst = Object.entries((o.geometry && o.geometry.attributes) || {}).filter(
                ([, a]) => a.isInstancedBufferAttribute || a.meshPerAttribute
            );
            const je = [];
            for (let i = 0; i < n; i++) {
                const h = H();
                for (let j = 0; j < 16; j++) txt(h, Math.round(M[i * 16 + j] * 1e4));
                if (C) for (let j = 0; j < 3; j++) txt(h, Math.round(C[i * 3 + j] * 1e4));
                for (const [k, a] of inst) {
                    const s = a.itemSize,
                        arr = a.array || (a.data && a.data.array);
                    if (!arr) continue;
                    txt(h, k);
                    for (let j = 0; j < s; j++) {
                        const x = arr[i * s + j];
                        if (k === "aKarte" && j === 0) txt(h, schicht(x));
                        else if (k === "aEin") txt(h, eintritt(x));
                        else txt(h, Math.round(x * 1e4));
                    }
                }
                je.push(hex(h));
            }
            je.sort();
            const h = H();
            for (const x of je) txt(h, x);
            paare.push([name3(o), hex(h) + "/" + n]);
        });
        return menge(paare);
    };
    // A4 · DIE NETZE der Szene (jedes Mesh, das kein Satz und keine Instanz-Senke ist): Geometrie, Lage auf 1 mm, Sicht — als
    // Menge je Name
    // DIE LEIBER IN BEWEGUNG (Tiere, Leichname, Bewohner): ihre Pose ist das Integral der Takt-Folge seit ihrer Geburt (die Deltas
    // DIESES Geräts, die Ankunft ihres Körpers aus dem Faden) — keine Funktion von Saat und Welt-Uhr; ihr Leib zählt mit seiner
    // Gestalt (Ruhe-Geometrie), nie mit seiner Lage. Wer sie sind, trägt `bestand`.
    const leiber = () => {
        const L = new WeakSet(),
            st = G.st;
        const ein = (o) => o && o.traverse && o.traverse((x) => L.add(x));
        for (const c of st.creatures || []) ein(c);
        for (const c of st.leichname || []) ein(c);
        for (const [, S] of G.r._bewohnerSiedlungen || []) for (const b of S.aktivListe || []) ein(b && b.leib);
        return L;
    };
    const netze = () => {
        const satz = satzNetze(),
            leib = leiber(),
            paare = [];
        G.st.scene.traverse((o) => {
            if (!(o.isMesh || o.isPoints || o.isLine) || o.isInstancedMesh || satz.has(o)) return;
            if (leib.has(o)) return paare.push(["leib:" + name3(o), geoH(o.geometry)]);
            const p = o.position,
                q = o.quaternion,
                s = o.scale;
            const lage = [p.x, p.y, p.z, q.x, q.y, q.z, q.w, s.x, s.y, s.z].map((x) => Math.round(x * 1e3));
            paare.push([name3(o), textH(geoH(o.geometry) + "|" + lage.join(",") + "|" + (o.visible ? 1 : 0))]);
        });
        return menge(paare);
    };

    // B · DIE PLATTE: jeder Eintrag der IDB anazhFoundryAssets/assets; Name = Schlüssel ohne die SHA der Kerne
    const platte = () =>
        new Promise((fertig) => {
            const q = indexedDB.open("anazhFoundryAssets", 1);
            q.onupgradeneeded = () => q.result.createObjectStore("assets");
            q.onerror = () => fertig({ fehler: String(q.error) });
            q.onsuccess = () => {
                const db = q.result;
                try {
                    const s = db.transaction("assets", "readonly").objectStore("assets");
                    const ks = s.getAllKeys(),
                        vs = s.getAll();
                    vs.onsuccess = () => {
                        const aus = {};
                        ks.result.forEach(
                            (k, i) => (aus[String(k).replace(/[0-9a-f]{16}/g, "#")] = W(vs.result[i], 10))
                        );
                        db.close();
                        fertig({ aus });
                    };
                    vs.onerror = () => fertig({ fehler: String(vs.error) });
                } catch (e) {
                    fertig({ fehler: String(e) });
                }
            };
        });

    // C · DIE STOFFE: jeder Stoff der Szene (einmal je Stoff), Name = Stoff-Name|Typ @ Name des ersten Trägers; Inhalt = jede
    // Eigenschaft (Knoten als Graph). Der Programm-Schlüssel (`customProgramCacheKey`) ist NICHT dabei: er trägt die ids.
    const STOFF_AUS = /^(uuid|id|version|_listeners)$/;
    const stoffe = () => {
        memo = new WeakMap();
        // der Name eines Stoffs: sein Name|Typ @ der kleinste Name seiner Träger (der erste Träger hinge an der Folge der Szene)
        const traeger = new Map();
        G.st.scene.traverse((o) => {
            for (const m of [o.material].flat()) {
                if (!m) continue;
                const n = name3(o),
                    a = traeger.get(m);
                if (a === undefined || n < a) traeger.set(m, n);
            }
        });
        // EIN STOFF OHNE SICHTBAREN TRÄGER zeichnet nichts: er zählt mit seinem Namen, nie mit seinem Stand — wer ihn wieder
        // zeigt, schreibt ihn im selben Takt (der Regen: `_tickRain` setzt Deckung und Uhr, ehe er sichtbar wird; still hält er
        // den Stand des letzten Regens, den die Folge der Takte davor brachte)
        const sichtbar = new Set();
        G.st.scene.traverseVisible((o) => {
            for (const m of [o.material].flat()) if (m) sichtbar.add(m);
        });
        const paare = [];
        for (const [m, tn] of traeger) {
            if (!sichtbar.has(m)) {
                paare.push([
                    ((m.name || m.type) + "@" + tn).replace(UUID, "uuid"),
                    JSON.stringify({ "@": "unsichtbar" }),
                ]);
                continue;
            }
            {
                const n = ((m.name || m.type) + "@" + tn).replace(UUID, "uuid");
                const pj = {};
                for (const p of Object.keys(m).sort()) {
                    if (STOFF_AUS.test(p)) continue;
                    let v;
                    try {
                        v = m[p];
                    } catch {
                        continue;
                    }
                    pj[p] = W(v, 4);
                }
                paare.push([n, JSON.stringify(pj)]);
            }
        }
        const aus = {};
        for (const [k, v] of Object.entries(menge(paare, true))) aus[k] = JSON.parse(v);
        return aus;
    };

    // D · DER PLAN: Zellen der Siedlungen, Pläne der lebenden Siedlungen, der Genesis-Plan (Zonen, Gehege, Erdbau), die Bau-Liste
    const plan = () => {
        const st = G.st,
            r = G.r,
            aus = {};
        const cells = (st.worldMeta && st.worldMeta.settlementCells) || {};
        for (const k of Object.keys(cells)) aus["zelle:" + k] = W(cells[k], 6);
        for (const [k, S] of r._bewohnerSiedlungen || []) aus["plan:" + k] = W(S.plan, 7);
        if (r._genesisPlan) aus["genesis:plan"] = W(r._genesisPlan, 8);
        if (st.worldMeta && st.worldMeta.genesisOrt) aus["genesis:ort"] = W(st.worldMeta.genesisOrt, 3);
        if (typeof r._gehegeListe === "function") aus["genesis:gehege"] = W(r._gehegeListe(), 6);
        const paare = [];
        for (const e of st.architectures || []) {
            const n =
                "bau:" +
                (e.type || "?") +
                ":" +
                (e.position ? [e.position.x, e.position.z].map((x) => Math.round(x * 100) / 100).join(",") : "-");
            paare.push([n, W({ t: e.type, p: e.position, r: e.rotation, s: e.scale, params: e.params }, 5)]);
        }
        return Object.assign(aus, menge(paare));
    };

    // E · DER BESTAND nach den festen Takten: Tiere (Art, Lage auf 1 dm, Zustand) und Bewohner (Lage auf 1 cm, Ziel)
    const bestand = () => {
        const st = G.st,
            r = G.r,
            aus = {},
            art = {};
        // ein Tier ist, wer es ist (Seele, Gattung, Adresse und Erbe im Bestand, Größe, Gehege, Leben) — seine Lage ist die eines
        // Leibs in Bewegung (`leiber`), sein Ort im Bestand trägt der Halter (`_bestandRegion`). Die Adresse ist `indId` des
        // Gesetzes (Region, Welt-Takt, Lauf-Nummer), das Erbe `a`; die netId ist Sync-Schlüssel (am Leib des Bestands der Hash
        // dieser Adresse, `_bestandLeib`; am Leib ohne Tier zählt sie die Leiber der Seite) und kein Merkmal des Tiers — bis
        // leben-erbe hashte der Abdruck sie, der Täter von A gegen A an tier:*.
        const tier = (c, tot) => {
            const u = c.userData || {};
            const t = u._bestand || null;
            return W({ s: u.soul, g: u.gattung, k: u.kind, n: t && t.id, a: t && t.a, e: t && t.e, b: u.bodySize, h: u.gehege, tot }, 2); // prettier-ignore
        };
        (st.creatures || []).forEach((c) => (art[(c.userData && c.userData.soul) || "?"] ||= []).push(tier(c, 0)));
        (st.leichname || []).forEach((c) => (art[(c.userData && c.userData.soul) || "?"] ||= []).push(tier(c, 1)));
        for (const [a, l] of Object.entries(art)) aus["tier:" + a] = W(l.sort(), 2) + "/" + l.length;
        for (const [k, S] of r._bewohnerSiedlungen || []) {
            const L = S.bewohner || S.leute || S.npcs || [];
            (Array.isArray(L) ? L : [...((L.values && L.values()) || [])]).forEach((b, i) => {
                const p = b.pos || b.position || (b.mesh && b.mesh.position) || (b.leib && b.leib.position);
                aus["bewohner:" + k + ":" + (b.id ?? i)] = W(
                    {
                        p: p && [p.x, p.y ?? 0, p.z].map((x) => Math.round(x * 100) / 100),
                        z: (b.ziel && b.ziel.art) || b.zustand || b.state,
                    },
                    3
                );
            });
            if (S.verkehr) aus["verkehr:" + k] = W(S.verkehr, 4);
        }
        return aus;
    };

    // F · DAS LICHT an fünf Stunden: jedes Licht der Szene (Farbe, Stärke, Lage) + Belichtung, Hintergrund, Nebel
    const licht = () => {
        const st = G.st,
            r = G.r,
            aus = {},
            t0 = st.timeOfDay;
        for (const h of [6, 9, 12, 17, 21]) {
            r._uhrSetzen(h / 24, "regler");
            try {
                r._applyDayNightToScene();
            } catch (e) {
                aus["fehler:" + h] = String(e.message);
                continue;
            }
            const L = [];
            st.scene.traverse((o) => {
                if (o.isLight)
                    L.push([
                        o.type,
                        o.name,
                        o.color && o.color.getHex(),
                        Math.round(o.intensity * 1e5) / 1e5,
                        o.position && [o.position.x, o.position.y, o.position.z].map((x) => Math.round(x * 1e3) / 1e3),
                    ]);
            });
            L.sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
            aus["licht:" + h + "h"] = W(L, 4);
            const f = st.scene.fog;
            aus["belichtung:" + h + "h"] = W(
                [
                    st.renderer && st.renderer.toneMappingExposure,
                    st.exposure,
                    st._belichtung,
                    st.scene.background && st.scene.background.getHex && st.scene.background.getHex(),
                    f && [f.color && f.color.getHex(), f.density, f.near, f.far],
                ],
                3
            );
        }
        r._uhrSetzen(t0, "regler");
        try {
            r._applyDayNightToScene();
        } catch {
            /* die Stunde des Orts steht wieder */
        }
        return aus;
    };

    // G · DAS GESETZ DES BODENS: die Makro-Höhe auf 33×33 Punkten im Ring 256 m um den Ort (reine Funktion) + die gebaute Fläche
    const boden = (x0, z0) => {
        const r = G.r,
            a = [],
            b = [];
        for (let i = -16; i <= 16; i++)
            for (let j = -16; j <= 16; j++) {
                const x = x0 + i * 16,
                    z = z0 + j * 16;
                a.push(r._terrainMacroSurfaceY ? r._terrainMacroSurfaceY(x, z, true) : NaN);
                b.push(r._voxelSurfaceY(x, z));
            }
        return { "gesetz:hoehe": W(a, 2), "gebaut:flaeche": W(b, 2) };
    };

    return { W, knoten, halter, saetze, instanzen, netze, platte, stoffe, plan, bestand, licht, boden, textH };
}

// ── KEIN ZUSTAND DER WELT: die feste Liste (Pfad-Muster im Halter, mit Grund) ────────────────────────────────────────────────
// Jede Zeile nennt ein Ding, das der Abdruck NIE hasht, weil es keine Lage der Welt ist. Sie wächst nur mit Grund und Beleg.
const KEIN_WELT_ZUSTAND = [
    {
        klasse: "halter",
        muster: /^r\.state\.flightRecorder(\.|$)/,
        grund:
            "der Flug-Schreiber (`_flightRecorderInit`, stamm/dirigent-regler.js): Wanduhr-Dauern der Takte, GC und Stillstand " +
            "dieses Geräts — ein Mess-Schreiber, kein Glied der Welt liest ihn",
    },
    {
        klasse: "halter",
        muster: /^r\._bewohner(Koepfe|Nachbarn|NbZahl|Bewegt)(\.|\[|$)/,
        grund:
            "die Arbeits-Puffer des Bewohner-Takts (stamm/siedlung-bewohner.js: `_bewohnerKoepfe` die Köpfe des Takts, " +
            "`_bewohnerNachbarn` und `_bewohnerNbZahl` die Nachbarn einer Wahl, `_bewohnerBewegt`): vor jedem Lesen neu " +
            "geschrieben, ihr Rest ist der Stand der letzten Wahl, die einer traf — kein Glied liest ihn danach",
    },
    {
        klasse: "halter",
        muster: /^r\._blueten(Gruppen|Folge|Aus)(\.|\[|$)/,
        grund:
            "die Arbeits-Puffer des Bestäuber-Takts (`_bestaeuberBlueten`, stamm/kreatur-fauna.js): je Bild neu gefüllte Listen " +
            "der Blöcke der Nah-Streu; was ein Bild nicht trug, hält seine alte Liste, bis die Karte 512 Gruppen zählt — der " +
            "Rest ist die Folge der Bilder davor, die Blüten selbst trägt `r.state.nahStreu`",
    },
    {
        klasse: "instanzen",
        muster: /^dorf-rauch$/,
        grund:
            "die Teilchen des Kamin-Rauchs (`_updateDorfRauch`): jedes steigt mit dem Wind × dt seines Takts und lebt, solange " +
            "der Deckel je Kamin (RAUCH_GESETZ.maxTeilchen) es trägt — der Stand ist das Integral der Takt-Folge seit dem " +
            "Einschwingen wie die Pose eines Leibs; der Wurf selbst ist Funktion von Saat, Kamin und Welt-Uhr",
    },
];
// die Ausnahmen einer Klasse außer dem Halter (der fällt schon in der Seite): fort, bevor ein Vergleich sie sieht
const ohneAusnahmen = (ort) => {
    for (const z of KEIN_WELT_ZUSTAND)
        if (z.klasse !== "halter" && ort[z.klasse])
            for (const k of Object.keys(ort[z.klasse]))
                if (z.muster.test(k.replace(/#\d+$/, ""))) delete ort[z.klasse][k];
    return ort;
};

// DIE DOMÄNE eines Dings (nur die Anzeige des Vergleichs: je Domäne gezählt, beim Namen genannt)
const DOM = [
    ["D4 Tiere", /creature|kreatur|tier[:.]|tierBaum|herde|rudel|gehege|tetrapod|wolf|vogel|bestaeuber/i],
    ["D5 Mensch", /bewohner|mensch|npc|leib|koerper|player|spieler|tritt/i],
    ["D6 Fahrzeug", /vehicle|fahr|wagen|verkehr|ritt|kamera|camera/i],
    [
        "D3 Siedlung",
        /settlement|siedlung|arch|haus|house|dorf|zelle:|plan:|genesis:|bau|fachwerk|stadt|trasse|gasse|wege|weg[A-Z.:|]|ort[A-Z]|_ort|grundriss|platz|feuerstelle|zaun|brunnen/i,
    ],
    [
        "D2 Vegetation",
        /scatter|streu|forest|wald|tree|baum|veg|foliage|gras|halm|wiese|natur|phyto|wind|laub|strauch|busch|kraut|blume|bluete|flora|eiche|birke|buche|fichte|tanne|kiefer|f:/i,
    ],
    [
        "D1 Gelaende",
        /voxel|chunk|terrain|gelaende|boden|hydro|water|wasser|density|surf|pegel|fluss|see|fels|stein|hoehe|flaeche|formation/i,
    ],
    [
        "D7 Licht",
        /licht|light|sun|sonne|material|stoff|shader|tex|exposure|belicht|himmel|sky|atmo|post|wolke|nebel|fog|impostor/i,
    ],
    ["D8 Foundry", /foundry|studio|platte|asset|ofen|karte/i],
];
const KLASSEN = ["halter", "saetze", "instanzen", "netze", "platte", "stoffe", "plan", "bestand", "licht", "boden"];
const domaene = (klasse, name) => {
    const s =
        klasse === "licht"
            ? "licht:" + name
            : klasse === "boden"
              ? "boden " + name
              : klasse === "bestand" && /^tier:/.test(name)
                ? "tier:"
                : name;
    for (const [d, re] of DOM) if (re.test(s)) return d;
    return "D9 Takt/Rest";
};

// DER VERGLEICH zweier Abdrücke: Ding = Ort|Klasse|Name. Ein Objekt-Ding (Halter-Gruppe, Stoff) ist anders, wenn ein
// Unter-Schlüssel anders ist ODER nur auf einer Seite steht — kein Abzug, keine Schnittmenge.
function vergleiche(A, B) {
    const dinge = (fp) => {
        const m = new Map();
        for (const [ort, o] of Object.entries(fp.orte || {}))
            for (const k of KLASSEN) {
                const src = k === "platte" ? (o.platte && o.platte.aus) || {} : o[k] || {};
                for (const [g, v] of Object.entries(src)) m.set(`${ort}|${k}|${g}`, v);
            }
        return m;
    };
    const [da, db] = [dinge(A), dinge(B)];
    const je = {},
        anders = [];
    const zaehle = (d, f) => ((je[d] ||= { dinge: 0, anders: 0, nurA: 0, nurB: 0 })[f] += 1);
    for (const k of [...new Set([...da.keys(), ...db.keys()])].sort()) {
        const [, klasse, ...rest] = k.split("|");
        const d = domaene(klasse, rest.join("|"));
        zaehle(d, "dinge");
        if (!da.has(k) || !db.has(k)) {
            zaehle(d, da.has(k) ? "nurA" : "nurB");
            anders.push({ ding: k, domaene: d, det: da.has(k) ? "nur in A" : "nur in B" });
            continue;
        }
        const a = da.get(k),
            b = db.get(k);
        if (typeof a === "object" && a && typeof b === "object" && b) {
            const ks = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
            const diff = ks.filter((p) => a[p] !== b[p]);
            if (!diff.length) continue;
            zaehle(d, "anders");
            anders.push({
                ding: k,
                domaene: d,
                det: `${diff.length}/${ks.length} anders: ${diff.slice(0, 3).join(" ; ")}`,
            });
        } else if (a !== b) {
            zaehle(d, "anders");
            anders.push({ ding: k, domaene: d, det: "" });
        }
    }
    return { je, anders };
}
function vergleichText(v, zeige = 40) {
    const z = ["Domäne".padEnd(16) + " Dinge anders nurA nurB"];
    for (const [d, x] of Object.entries(v.je).sort())
        z.push(
            d.padEnd(16) +
                String(x.dinge).padStart(6) +
                String(x.anders).padStart(7) +
                String(x.nurA).padStart(5) +
                String(x.nurB).padStart(5)
        );
    for (const x of v.anders.slice(0, zeige)) z.push(`  ${x.domaene} · ${x.ding.slice(0, 140)} ${x.det.slice(0, 220)}`);
    if (v.anders.length > zeige) z.push(`  … und ${v.anders.length - zeige} weitere`);
    z.push(
        `ANDERS ${v.anders.length} · Domänen: ${[...new Set(v.anders.map((x) => x.domaene))].sort().join(", ") || "keine"}`
    );
    return z.join("\n");
}

// ── DER LAUF ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// DIE FESTE UHR: je Ort eine eigene Stunde der Welt-Uhr (`UHR_S` × (i+1)), der Takt-Stempel ab `STEMPEL_MS` × (i+1) in exakten
// 1/64 s (binär genau: jede Seite rechnet dieselbe Folge von Deltas)
const UHR_S = 3600;
const STEMPEL_MS = 1e9;
const DT_MS = 1000 / 64;
// DIE FAHRT EINES ORTS (Seite und Selbsttest: derselbe Text; `G` trägt `st`, `r`, `sleep`, `__gebautNach`, `__weltStehtNach` —
// in der Seite das Fenster). DIE WELT LEBT NUR IN GEZÄHLTEN TAKTEN (abdruck-am-takt): der Stempel `t` führt jeden Takt der Fahrt.
// Ein BAU-Takt steht am Stempel des letzten — zeitlos (stamm/dirigent-takt.js `zeitlos`): die Welt baut (Strom, Foundry, Stufen,
// Fege-Takte) und lebt nicht —, ein LEBENS-Takt geht exakt `dt` weiter. Das Einschwingen (Ring, dann „die Welt steht“) fährt
// NUR Bau-Takte, gleich wie viele das Gerät braucht; gelebt wird der erste Takt am Ort (seit dem letzten Stempel der Welt — dem
// Boot, dem Ort davor — verging mehr als der Deckel des Takts: er lebt genau `TAKT_DECKEL_S`) und danach genau `takte` Takte an
// der festen Uhr. Bis hier ging jeder Takt des Einschwingens `dt` weiter, ab der Wanduhr (`performance.now()`): unter Last
// brauchte der Ring mehr Takte, die Welt lebte vor der festen Uhr verschieden lang (dorf: 593 gegen 1198 Takte = 9,3 gegen
// 18,7 s Spiel-Zeit), und was in der Zeit kam und ging, blieb im Abdruck — A gegen A an 94e4c615: die fünf Leiber des Wurfs am
// Ort dorf mit anderer laufender Nummer (`tier:baer|fuchs|wesen|wolf`, D4 1 von 6 Läufen, auf Bestellung 2 von 2) und der
// gemerkte Wege-Baum `netz.baeume[=3]` der Siedlung (D5 3 von 6).
async function abdruckFahrt(G, { ziel, takte, uhr, stempel, dt }) {
    const st = G.st,
        r = G.r;
    let t = stempel;
    const takt = (lebt) => () => {
        st._frameOverBudget = false;
        if (st._activeRingRadius < ziel) st._activeRingRadius = ziel;
        try {
            r._gameLoopTick(lebt ? (t += dt) : t);
        } catch (e) {
            r._loopErrorBoundary(e);
        }
        return G.sleep(0);
    };
    const bau = takt(false),
        leben = takt(true);
    let n = await G.__gebautNach("abdruck: Ring " + ziel, {
        fertig: () => r._builtRingRadius() >= ziel,
        takt: bau,
        max: 1800,
    });
    n += await G.__weltStehtNach(bau, 1800);
    // DIE FESTE UHR: die Welt-Uhr über die Tür des Spiels (wie die Uhr eines Mitspielers, `_weltUhrNimm`) auf die Stunde des Orts
    if (!(st.spielZeit < uhr)) throw new Error(`abdruck: die Uhr steht schon bei ${st.spielZeit} s ≥ ${uhr} s`);
    r._weltUhrNimm(uhr);
    // JEDER LEBENS-TAKT SIEHT EINE WELT OHNE OFFENEN BAU: was ein Takt bestellt (ein Faden rechnet, die Antwort kommt nach der
    // Wanduhr), baut in Bau-Takten zu Ende, ehe der nächste lebt — sonst läse das Leben, wie weit der Bau unter der Last kam
    const offen = () => {
        const o = r._weltOffen();
        for (const k in o) if (o[k]) return true;
        return false;
    };
    let zwischen = 0;
    for (let k = 0; k < takte; k++) {
        r._uhrSetzen(0.5, "regler");
        await leben();
        zwischen += await G.__gebautNach("abdruck: der Bau nach Lebens-Takt " + (k + 1), {
            fertig: () => !offen(),
            takt: bau,
            max: 1800,
        });
    }
    // DIE WELT STEHT BEI DIESER UHR (w28-funktion-welt-2): was der Sprung und die Takte regten (der Schnee-Versatz wandert mit
    // der Uhr, jede Stufe baut die Chunks im Band neu — unter der Frist der Wanduhr, also je Last verschieden weit), baut zu
    // Ende in Bau-Takten — gleich wie viele es braucht, die Uhr und das Leben stehen. Bis hier hashte der Abdruck nach den
    // Takten, gleich ob die Welt stand: an a1bf7f16 hielt sie beim Hash „Chunks offen 53“ (genesis) und „Chunks offen 27“
    // (dorf), der Fege-Takt streuLod mitten in seiner Runde — er las, wie weit die Arbeit unter der Last kam.
    // (jeder Lauf geht mindestens einen stillen Takt, das EINE Einschwingen: sein letzter Takt sieht dieselbe Uhr)
    const still = await G.__weltStehtNach(bau, 1800);
    return { still, takte: n, zwischen };
}
async function abdruckLauf({
    baum,
    orte = ["genesis", "wiese", "dorf"],
    takte = 240,
    log = console.log,
    probe = null,
} = {}) {
    const BAUM = path.resolve(baum);
    const WB = require(path.join(BAUM, "scripts/lib/welt-boot.cjs"));
    const { messort } = require(path.join(BAUM, "scripts/lib/welt-orte.cjs"));
    const t0 = Date.now();
    const server = WB.statikServer({ root: BAUM });
    const { browser, page } = await WB.nullWelt(server, { frist: 600000, da: "() => true" }, 600000);
    const tBoot = Date.now() - t0;
    await page.evaluate(`window.__abd = (${abdruckKern})(window); window.__abdFahrt = ${abdruckFahrt};`);
    const kopf = (() => {
        try {
            return cp.execSync("git rev-parse HEAD", { cwd: BAUM }).toString().trim();
        } catch {
            return "?";
        }
    })();
    const erg = { baum: BAUM, kopf, takte, orte: {}, zeiten: { boot_s: tBoot / 1000 } };
    try {
        for (const [i, ort] of orte.entries()) {
            const m = messort(ort);
            const t1 = Date.now();
            const steh = await page.evaluate(
                async (x, z, dorf, TAKTE, uhr, stempel, dt) => {
                    window.__anazhAutoSettlement = !!dorf;
                    st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
                    st.yaw = 0;
                    st.pitch = 0;
                    r._uhrSetzen(0.5, "regler");
                    st.perfTargetMs = 1000;
                    const ziel = Math.min(12, st.chunkRingRadius || 4);
                    const f = await window.__abdFahrt(window, { ziel, takte: TAKTE, uhr, stempel, dt });
                    return {
                        still: f.still,
                        takte: f.takte,
                        zwischen: f.zwischen,
                        ring: r._builtRingRadius(),
                        uhr: st.spielZeit,
                        tiere: (st.creatures || []).length,
                        siedlungen: (r._bewohnerSiedlungen || new Map()).size,
                        bauten: (st.architectures || []).length,
                    };
                },
                m.x,
                m.z,
                m.dorfZug,
                takte,
                UHR_S * (i + 1),
                STEMPEL_MS * (i + 1),
                DT_MS
            );
            const t2 = Date.now();
            const fp = await page.evaluate(
                async (x, z, aus) => {
                    const A = window.__abd,
                        d = {};
                    const h = A.halter(
                        3,
                        aus.map((s) => new RegExp(s))
                    );
                    d.halter = h.aus;
                    d.halterBytes = h.bytes;
                    d.platte = await A.platte();
                    d.stoffe = A.stoffe();
                    d.saetze = A.saetze();
                    d.instanzen = A.instanzen();
                    d.netze = A.netze();
                    d.plan = A.plan();
                    d.bestand = A.bestand();
                    d.licht = A.licht();
                    d.boden = A.boden(x, z);
                    return d;
                },
                m.x,
                m.z,
                KEIN_WELT_ZUSTAND.filter((z) => z.klasse === "halter").map((z) => z.muster.source)
            );
            erg.orte[ort] = ohneAusnahmen(
                Object.assign({ stand: steh, s_stehen: (t2 - t1) / 1000, s_abdruck: (Date.now() - t2) / 1000 }, fp)
            );
            // DIE SONDE (`--probe <ausdruck>`): ein Ausdruck der Seite nach dem Abdruck, sein Wert roh im Ort — der Täter beim Namen
            if (probe) erg.orte[ort].probe = await page.evaluate(`(async () => (${probe}))()`);
            log(
                `  ${ort}: ${JSON.stringify(steh)} · stehen ${((t2 - t1) / 1000).toFixed(1)} s · abdruck ` +
                    `${((Date.now() - t2) / 1000).toFixed(1)} s · halter ${(fp.halterBytes / 1048576).toFixed(1)} MB`
            );
        }
    } finally {
        await browser.close();
        server.close();
    }
    erg.zeiten.gesamt_s = (Date.now() - t0) / 1000;
    return erg;
}

// DER FREMDE KOPF (`--gegen <sha>`): ein eigener Arbeitsbaum am SHA (node_modules angebunden), sein Abdruck, dann fort
async function abdruckAmKopf(root, sha, opts) {
    const ziel = fs.mkdtempSync(path.join(os.tmpdir(), "abdruck-"));
    cp.execFileSync("git", ["worktree", "add", "--detach", ziel, sha], { cwd: root, stdio: "ignore" });
    try {
        fs.symlinkSync(path.join(root, "node_modules"), path.join(ziel, "node_modules"), "junction");
        return await abdruckLauf(Object.assign({}, opts, { baum: ziel }));
    } finally {
        try {
            fs.unlinkSync(path.join(ziel, "node_modules"));
        } catch {
            /* schon fort */
        }
        cp.execFileSync("git", ["worktree", "remove", "--force", ziel], { cwd: root, stdio: "ignore" });
    }
}

// ── DER SELBSTTEST (ohne Welt, `abdruck --selbsttest`): derselbe Kern über einer kleinen Welt aus Objekten ──────────────────
// Zwei Bauten derselben Welt — andere Erzeugungs-ids der Knoten, Instanzen, Glieder und Szene in anderer Folge — sind 0 anders;
// die Mutanten fallen ROT beim Namen ihres Dings: die Erzeugungs-ID im Schlüssel einer Karte (`r._stoffKarte`, der Schlüssel
// trägt die id des Knotens) und die Wanduhr im Pool (`r._vogelPool`, eine Lage aus `performance.now()`).
function selbstWelt({ folge = true, idAb = 0, mutante = null, uhr = 0 } = {}) {
    let id = idAb;
    const knoten = (type, felder) => Object.assign({ isNode: true, type, id: id++, _cacheKey: "k" + id }, felder);
    const farbe = knoten("UniformNode", { value: 0.5, name: "" });
    const mat = {
        isMaterial: true,
        type: "MeshStandardNodeMaterial",
        name: "stoff",
        uuid: "0000000" + idAb + "-0000-0000-0000-000000000000",
        colorNode: knoten("OperatorNode", { op: "*", aNode: farbe, bNode: knoten("ConstNode", { value: 2 }) }),
    };
    const geo = (n) => ({
        isBufferGeometry: true,
        attributes: { position: { array: Float32Array.from({ length: n }, (_, i) => i), itemSize: 3 } },
        index: null,
    });
    const o3 = (x) => ({
        isObject3D: true,
        position: { x, y: 0, z: 0 },
        quaternion: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
    });
    const mesh = (name, x) => Object.assign(o3(x), { isMesh: true, name, geometry: geo(9), material: mat });
    const M = [
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 3, 0, 4, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -5, 0, 2, 1],
    ];
    const im = Object.assign(o3(0), {
        isMesh: true,
        isInstancedMesh: true,
        name: "streu",
        geometry: geo(9),
        material: mat,
        count: 2,
        instanceMatrix: { count: 2, array: Float32Array.from((folge ? M : M.slice().reverse()).flat()) },
    });
    const kinder = folge ? [mesh("fels", 1), mesh("haus", 2), im] : [im, mesh("haus", 2), mesh("fels", 1)];
    const scene = {
        isObject3D: true,
        traverse(f) {
            f(scene);
            kinder.forEach(f);
        },
        traverseVisible(f) {
            this.traverse(f);
        },
    };
    const st = {
        scene,
        creatures: [],
        leichname: [],
        chunkSaetze: new Map(),
        architectures: [],
        worldMeta: {},
        weltTakt: 9,
    };
    const bestand = [
        ["a", Float32Array.of(1, 2)],
        ["b", Float32Array.of(3)],
    ];
    const r = {
        state: st,
        _bewohnerSiedlungen: new Map(),
        _bestand: new Map(folge ? bestand : bestand.slice().reverse()),
        _vogelPool: { lagen: Float32Array.of(1, 2, 3) },
    };
    if (mutante === "id") r._stoffKarte = new Map([["stoff#" + mat.colorNode.id, Float32Array.of(1)]]);
    if (mutante === "uhr") r._vogelPool.lagen[0] = uhr;
    return { st, r };
}
function selbstAbdruck(w) {
    const K = abdruckKern(w);
    return {
        orte: {
            selbst: {
                halter: K.halter(
                    3,
                    KEIN_WELT_ZUSTAND.filter((z) => z.klasse === "halter").map((z) => z.muster)
                ).aus,
                stoffe: K.stoffe(),
                saetze: K.saetze(),
                instanzen: K.instanzen(),
                netze: K.netze(),
                plan: K.plan(),
                bestand: K.bestand(),
            },
        },
    };
}
// DIE KLEINE WELT LEBT (der Selbsttest der Fahrt, `abdruckFahrt` — derselbe Text wie in der Seite): ihr Loop trägt das Gesetz des
// Takts (stamm/dirigent-takt.js: ein Takt am Stempel des letzten ist zeitlos, er baut und lebt nicht; sonst lebt er sein Delta,
// höchstens den Deckel). Der Ring steht nach `ringTakte` Takten (ein Gerät unter Last braucht mehr); der dritte Lebens-Takt
// bestellt einen Bau, der `verzug` Takte später ankommt (ein Faden antwortet nach der Wanduhr). Was das Leben hinterlässt, trägt
// der Abdruck: je gelebter Sekunde kam und ging ein Leib (der Wolf trägt die laufende Nummer), der Vogel zog so weit, wie die
// Welt lebte, und er zählt jeden Lebens-Takt, der den bestellten Bau noch nicht sah.
async function selbstFahrt({ ringTakte = 40, verzug = 5 } = {}, fahrt = abdruckFahrt) {
    const w = selbstWelt();
    let [letzter, gebaut, gelebt, lebensTakte, kommt, blind, zeit] = [4000, 0, 0, 0, -1, 0, 0];
    w.st._activeRingRadius = 4;
    // die Uhr der kleinen Welt ist ihre eigene Zahl (`zeit`); die Fahrt liest sie, wie sie die Uhr der Welt liest
    Object.defineProperty(w.st, "spielZeit", { get: () => zeit });
    Object.assign(w.r, {
        _gameLoopTick(t) {
            const delta = t === letzter ? 0 : Math.min(Math.max(0.001, (t - letzter) / 1000), 0.1);
            letzter = t;
            if (delta > 0) {
                if (kommt >= 0 && gebaut < kommt) blind++;
                if (++lebensTakte === 3) kommt = gebaut + 1 + verzug;
                gelebt += delta;
                zeit += delta;
            }
            gebaut++;
        },
        _builtRingRadius: () => (gebaut >= ringTakte ? 4 : 0),
        _weltOffen: () => ({ foundry: kommt >= 0 && gebaut < kommt ? 1 : 0 }),
        _weltUhrNimm: (u) => (zeit = u),
        _uhrSetzen() {},
        _loopErrorBoundary(e) {
            throw e;
        },
    });
    const G = {
        st: w.st,
        r: w.r,
        sleep: () => Promise.resolve(),
        __gebautNach: async (name, { fertig, takt }) => {
            let n = 0;
            for (; !fertig(); n++) await takt(n);
            return n;
        },
        __weltStehtNach: async (takt) => (await takt(0), 1),
    };
    await fahrt(G, { ziel: 4, takte: 240, uhr: UHR_S, stempel: STEMPEL_MS, dt: DT_MS });
    // der Wolf trägt seine Adresse im Bestand (`_bestand.id`, die Identität des Tiers im Abdruck) aus der gelebten Zeit
    w.st.creatures.push({ userData: { soul: "wolf", _bestand: { id: "c" + (1 + Math.floor(gelebt)) } } });
    w.r._vogelPool.lagen.set([gelebt, blind]);
    return w;
}
// die Mutante der Fahrt: ihr Text mit EINER getauschten Stelle (die alte Klasse) — trifft der Tausch den Text nicht, wirft sie
function fahrtMutante(alt, neu) {
    const q = String(abdruckFahrt);
    if (q.split(alt).length !== 2) throw new Error(`abdruck --selbsttest: die Mutante trifft die Fahrt nicht (${alt})`);
    return new Function(`return (${q.replace(alt, neu)})`)();
}
async function abdruckSelbsttest(log = console.log) {
    const fehler = [];
    // die kleine Welt trägt jede geprüfte Klasse (sonst wäre „0 anders" leer)
    const leer = Object.entries(selbstAbdruck(selbstWelt()).orte.selbst)
        .filter(([k, v]) => /halter|stoffe|instanzen|netze/.test(k) && !Object.keys(v).length)
        .map(([k]) => k);
    if (leer.length) fehler.push("die kleine Welt trägt nichts in: " + leer.join(", "));
    const fall = (name, A, B, muss) => {
        const v = vergleiche(selbstAbdruck(A), selbstAbdruck(B));
        const namen = v.anders.map((x) => x.ding);
        const ok = muss ? namen.some((n) => muss.test(n)) : namen.length === 0;
        log(
            `  ${ok ? "✅" : "❌"} Selbsttest „${name}" → ${muss ? "rot" : "grün"}: ${namen.join(" · ") || "(0 anders)"}`
        );
        if (!ok) fehler.push(`${name}: ${muss ? "der Täter steht nicht beim Namen (" + muss + ")" : namen.join(", ")}`);
    };
    fall("dieselbe Welt, andere ids und Folge", selbstWelt(), selbstWelt({ folge: false, idAb: 1000 }));
    fall(
        "Erzeugungs-ID im Schlüssel",
        selbstWelt({ mutante: "id" }),
        selbstWelt({ folge: false, idAb: 1000, mutante: "id" }),
        /\|halter\|r\._stoffKarte/
    );
    fall(
        "Wanduhr im Pool",
        selbstWelt({ mutante: "uhr", uhr: performance.now() }),
        selbstWelt({ folge: false, idAb: 1000, mutante: "uhr", uhr: performance.now() + 16.7 }),
        /\|halter\|r\._vogelPool/
    );
    // DIE FAHRT (abdruck-am-takt): ein Einschwingen, das 800 Takte länger baut, und ein Bau, der 60 statt 5 Takte nach seinem
    // Lebens-Takt ankommt, sind 0 anders — die Welt lebt nur in gezählten Takten, jeder sieht eine Welt ohne offenen Bau. Die
    // alte Klasse fällt ROT beim Namen: der Zeit-Takt (jeder Takt des Einschwingens lebt 1/64 s — der Wolf trägt eine andere
    // laufende Nummer) und das Leben neben dem Bau (kein Warten zwischen den Lebens-Takten — der Vogel sah den Bau 5 gegen 60
    // Takte lang nicht).
    const zeitTakt = fahrtMutante("lebt ? (t += dt) : t", "(t += dt)");
    const nebenBau = fahrtMutante("fertig: () => !offen(),", "fertig: () => true,");
    fall("das Einschwingen 800 Takte länger", await selbstFahrt(), await selbstFahrt({ ringTakte: 840 }));
    fall("der Bau eines Lebens-Takts kommt 60 statt 5 Takte später", await selbstFahrt(), await selbstFahrt({ verzug: 60 }));
    fall(
        "der Zeit-Takt im Einschwingen",
        await selbstFahrt({}, zeitTakt),
        await selbstFahrt({ ringTakte: 840 }, zeitTakt),
        /\|bestand\|tier:wolf/
    );
    fall(
        "das Leben neben dem Bau",
        await selbstFahrt({}, nebenBau),
        await selbstFahrt({ verzug: 60 }, nebenBau),
        /\|halter\|r\._vogelPool/
    );
    return fehler;
}

module.exports = {
    abdruckKern,
    abdruckLauf,
    abdruckAmKopf,
    abdruckSelbsttest,
    vergleiche,
    vergleichText,
    KEIN_WELT_ZUSTAND,
    domaene,
};
