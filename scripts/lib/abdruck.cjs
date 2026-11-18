"use strict";
// DER ABDRUCK DER WELT (`node scripts/werkbank.cjs abdruck`, w28-funktion-welt): die Welt ist eine FUNKTION — derselbe Kopf,
// zweimal gebaut, ergibt 0 abweichende Dinge. Headless (Null-Renderer, keine GPU, keine laufende Werkbank): der EINE Welt-Boot
// des Baums (welt-boot `nullWelt`), je Ort (genesis · wiese · dorf aus spec/profiband/haushalt.json) Ring + „die Welt steht",
// dann DIE FESTE UHR — die Welt-Uhr springt über die Tür des Spiels (`_weltUhrNimm`, wie die Uhr eines Mitspielers) auf die
// Stunde des Orts, der Takt bekommt exakte 1/64 s — und `TAKTE` Takte am Mittag; danach je BENANNTEM Ding ein Inhalt-Hash.
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
    // Kanten (Kind-Knoten über ihren Graph-Hash), je Abdruck einmal je Knoten gemerkt; ein Kreis heißt „@kreis".
    const KNOTEN_AUS =
        /^(id|_uuid|uuid|version|_cacheKey|_cacheKeyVersion|stackTrace|parents|_beforeNodes|_listeners|isNode)$/;
    let memo = new WeakMap();
    const knoten = (n) => {
        const m = memo.get(n);
        if (m) return m;
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
    const menge = (paare) => {
        const je = new Map();
        for (const [k, v] of paare) (je.get(k) || je.set(k, []).get(k)).push(v);
        const aus = {};
        for (const [k, l] of je) l.sort().forEach((v, i) => (aus[i ? k + "#" + i : k] = v));
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
        const inst = (o) => {
            for (const a of [o.instanceMatrix, o.instanceColor]) if (a && a.array) gesehen.add(a.array.buffer);
            for (const a of Object.values((o.geometry && o.geometry.attributes) || {}))
                if (a && (a.isInstancedBufferAttribute || a.meshPerAttribute)) {
                    const arr = a.array || (a.data && a.data.array);
                    if (arr) gesehen.add(arr.buffer);
                }
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
                const buf = ArrayBuffer.isView(v) ? v : v instanceof ArrayBuffer ? new Uint8Array(v) : null;
                if (buf) {
                    if (buf.buffer !== v && gesehen.has(buf.buffer)) continue;
                    gesehen.add(buf.buffer);
                    if (aus_.some((re) => re.test(pp))) continue;
                    const g = pp
                        .split(/(?=[.[])/)
                        .slice(0, tiefe)
                        .map((s) => (s[0] === "[" ? "[]" : s))
                        .join("");
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
    const saetze = () => {
        const aus = {};
        for (const [sk, s] of G.st.chunkSaetze || [])
            for (const [bk, b] of s.bloecke || [])
                aus[(String(sk) + "|" + String(bk)).replace(UUID, "uuid")] = b.geom ? geoH(b.geom) : "~" + b.vAnzahl;
        return aus;
    };
    const satzNetze = () => {
        const s = new WeakSet();
        for (const [, x] of G.st.chunkSaetze || []) if (x.mesh) s.add(x.mesh);
        return s;
    };
    // A3 · DIE INSTANZEN ohne Reihenfolge: je Instanz-Mesh die sortierte Menge seiner Instanzen (Matrix auf 1e-4 + jedes
    // Instanz-Attribut)
    const instanzen = () => {
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
                for (const [, a] of inst) {
                    const s = a.itemSize,
                        arr = a.array || (a.data && a.data.array);
                    if (arr) for (let j = 0; j < s; j++) txt(h, Math.round(arr[i * s + j] * 1e4));
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
    const netze = () => {
        const satz = satzNetze(),
            paare = [];
        G.st.scene.traverse((o) => {
            if (!(o.isMesh || o.isPoints || o.isLine) || o.isInstancedMesh || satz.has(o)) return;
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
        const je = new Set(),
            paare = [];
        G.st.scene.traverse((o) => {
            for (const m of [o.material].flat()) {
                if (!m || je.has(m)) continue;
                je.add(m);
                const n = ((m.name || m.type) + "@" + name3(o)).replace(UUID, "uuid");
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
        });
        const aus = {};
        for (const [k, v] of Object.entries(menge(paare))) aus[k] = JSON.parse(v);
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
        (st.creatures || []).forEach((c) => {
            const p = (c.mesh && c.mesh.position) || c.position || (c.group && c.group.position);
            const a =
                c.species || (c.userData && (c.userData.species || c.userData.art)) || c.art || c.kind || c.name || "?";
            (art[a] ||= []).push(
                W(
                    {
                        p: p && [p.x, p.z].map((x) => Math.round(x * 10) / 10),
                        z: c.state || c.zustand || c.mode || (c.userData && c.userData.state),
                        g: c.gehege,
                    },
                    3
                )
            );
        });
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
            st.timeOfDay = h / 24;
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
        st.timeOfDay = t0;
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
const KEIN_WELT_ZUSTAND = [];

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
async function abdruckLauf({ baum, orte = ["genesis", "wiese", "dorf"], takte = 240, log = console.log } = {}) {
    const BAUM = path.resolve(baum);
    const WB = require(path.join(BAUM, "scripts/lib/welt-boot.cjs"));
    const { messort } = require(path.join(BAUM, "scripts/lib/welt-orte.cjs"));
    const t0 = Date.now();
    const server = WB.statikServer({ root: BAUM });
    const { browser, page } = await WB.nullWelt(server, { frist: 600000, da: "() => true" }, 600000);
    const tBoot = Date.now() - t0;
    await page.evaluate(`window.__abd = (${abdruckKern})(window);`);
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
                    let t = performance.now();
                    const takt = () => {
                        st._frameOverBudget = false;
                        if (st._activeRingRadius < ziel) st._activeRingRadius = ziel;
                        try {
                            r._gameLoopTick((t += dt));
                        } catch (e) {
                            r._loopErrorBoundary(e);
                        }
                        return sleep(0);
                    };
                    window.__anazhAutoSettlement = !!dorf;
                    st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
                    st.yaw = 0;
                    st.pitch = 0;
                    st.timeOfDay = 0.5;
                    st.perfTargetMs = 1000;
                    const ziel = Math.min(12, st.chunkRingRadius || 4);
                    let n = await __gebautNach("abdruck: Ring " + ziel, {
                        fertig: () => r._builtRingRadius() >= ziel,
                        takt,
                        max: 1800,
                    });
                    n += await __weltStehtNach(takt, 1800);
                    // DIE FESTE UHR: die Welt-Uhr über die Tür des Spiels, der Stempel auf seine feste Folge
                    r._weltUhrNimm(uhr);
                    t = stempel;
                    for (let k = 0; k < TAKTE; k++) {
                        st.timeOfDay = 0.5;
                        await takt();
                    }
                    return {
                        takte: n,
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
                KEIN_WELT_ZUSTAND.map((z) => z.muster.source)
            );
            erg.orte[ort] = Object.assign(
                { stand: steh, s_stehen: (t2 - t1) / 1000, s_abdruck: (Date.now() - t2) / 1000 },
                fp
            );
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

module.exports = { abdruckKern, abdruckLauf, abdruckAmKopf, vergleiche, vergleichText, KEIN_WELT_ZUSTAND, domaene };
