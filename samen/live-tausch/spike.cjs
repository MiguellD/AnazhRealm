// spike.cjs — WEGWERF-CODE des Samen-Befunds „Gesetz live tauschen" (w28-samen-live-tausch). Kein Gate, kein Zug, kein Schnitt:
// er fasst keine Datei außerhalb von samen/live-tausch/ an und patcht die laufende Seite nur von außen.
//
//   node samen/live-tausch/spike.cjs            alle drei Fälle, schreibt ergebnis.json + PNG neben sich
//
// EIN Kern (koerper-core.js), EINE Art (ein Mensch auf dem Bau-Weg des Bewohners, `_buildHumanGroup(ov)` wie `_bewohnerGeburt`),
// EINE Zahl des Gesetzes: labProportionen `shoulderHW = (0.259 * H) / 2` → 0.360 (Fassung B, die Schulter wird breit).
//   (a) heute        der Kern lädt in der laufenden Seite neu (<script src> wie beim Start) — was bleibt alt?
//   (b) Gegenprobe   alles wegwerfen: die Seite lädt neu mit Fassung B — Zeit, Platte, was der Spieler verliert
//   (c) Kandidat     zwei Fassungen nebeneinander, jede Vorlage trägt den Hash ihrer Kern-Fassung im Schlüssel
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { statikServer, starteBrowser, pngDatei } = require("../../scripts/lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("../../scripts/lib/ausgabe-aufnahme.cjs");

const ROOT = path.resolve(__dirname, "../..");
const HIER = __dirname;
const ALT = "shoulderHW = (0.259 * H) / 2";
const NEU = "shoulderHW = (0.360 * H) / 2";
const kernA = fs.readFileSync(path.join(ROOT, "koerper-core.js"), "utf8");
if (kernA.split(ALT).length !== 2) throw new Error("die EINE Zahl steht nicht genau einmal im Kern");
const kernB = kernA.replace(ALT, NEU);
const sha16 = (t) => crypto.createHash("sha256").update(t).digest("hex").slice(0, 16);
// der Kern in einem FACH statt im globalen Namensraum: sein IIFE-Fuß liest `self` — hier ein eigenes Objekt je Fassung
const fach = (t, name) =>
    `(function(){var F=(window.__gesetzFach=window.__gesetzFach||{});var self=(F[${JSON.stringify(name)}]={});var globalThis=self;\n${t}\n})();`;

let fassung = "A"; // welche Fassung der Server unter /koerper-core.js ausliefert
const server = statikServer({
    keinCache: true,
    wandle: (p, roh) => {
        if (p === "/koerper-core.js") return fassung === "B" ? kernB : kernA;
        if (p === "/samen-fach-A.js") return fach(kernA, "A");
        if (p === "/samen-fach-B.js") return fach(kernB, "B");
        if (p.startsWith("/B/")) {
            // der Baum der Fassung B (für den zweiten Studio-Faden des Kandidaten): alles gleich, nur der Kern trägt die neue Zahl
            const q = p.slice(2);
            if (q === "/koerper-core.js") return kernB;
            const fp = path.join(ROOT, q);
            return fp.startsWith(ROOT) && fs.existsSync(fp) ? fs.readFileSync(fp) : null;
        }
        return roh;
    },
});

// ───────────────────────── Seiten-Funktionen (laufen im Browser) ─────────────────────────

// die Welt steht so weit, dass ein Mensch gebaut werden kann: erstes Weltbild, das Buch, die Spieler-Vorlage im Memo
async function bereit() {
    const t0 = performance.now();
    await window.__weltDa(() => r && st && st._weltbildDa && r._foundry && r._foundry.recipes);
    const weltbildMs = performance.now() - t0;
    // die Bestellungen des Boots sind geliefert (nichts im Flug, nichts wartet) — 2 s am Stück
    let ruhig = 0;
    const f = r._foundry;
    while (ruhig < 20 && performance.now() - t0 < 240000) {
        ruhig = f.pending.size === 0 && !(f.warte && f.warte.length) ? ruhig + 1 : 0;
        await sleep(100);
    }
    const L = f.lieferung || { platte: 0, werk: 0, auftrag: 0, je: {} };
    while (performance.now() - t0 < weltbildMs + 12000) await sleep(100); // der Loop läuft 12 s über das Weltbild (Belichtung, Jahr, Himmel stehen)
    st.renderer.setAnimationLoop(null); // die Welt ruht zwischen den Schritten (wie an der Werkbank): der Schuss steht an SEINER Kamera
    return {
        weltbildMs: Math.round(weltbildMs),
        geliefertMs: Math.round(performance.now() - t0),
        nullRenderer: !!st.renderer._isHeadlessNull,
        platteLebt: !!f.platte,
        werkFaeden: 1 + ((f.helfer && f.helfer.length) || 0),
        lieferung: { auftrag: L.auftrag, platte: L.platte, werk: L.werk, karte: L.je.karte || null },
        // die Kerne im Schlüssel der Platte je Lieferung (die Schale nennt sie): wie viele Lieferungen tragen `koerper`?
        liefern: {
            alle: L.liste ? L.liste.length : 0,
            mitKoerper: L.liste ? L.liste.filter((x) => String(x[3]).split(",").includes("koerper")).length : 0,
            beispiel: L.liste && L.liste.length ? L.liste[0] : null,
        },
        spieler: st.playerMesh ? [st.playerMesh.position.x, st.playerMesh.position.z].map((v) => +v.toFixed(2)) : null,
    };
}

// EIN MENSCH auf dem Bau-Weg des Bewohners (`_bewohnerGeburt`: `_buildHumanGroup(G.ov)` unter ruhender Übergabe), an x/z gestellt
function menschBauen(o) {
    const T = THREE;
    const t0 = performance.now();
    const alt = r._activePeerUebergabe;
    r._activePeerUebergabe = {};
    let g = null;
    const gussVor = r._fadenUmgangenZahl | 0;
    try {
        g = r._buildHumanGroup(o.ov);
    } finally {
        r._activePeerUebergabe = alt;
    }
    const bauMs = performance.now() - t0;
    if (!g || !g.userData.rig) return { fehler: "kein Leib" };
    g.name = "samen-" + o.name;
    const vorher = o.ersetzt && window.__samen && window.__samen[o.name];
    if (vorher) {
        st.scene.remove(vorher);
        r._disposeSoulGroup(vorher);
    }
    const h = r._koerperBodenUnter(o.x, NaN, o.z);
    g.position.set(o.x, (Number.isFinite(h) ? h : 0) + AnazhRealm.PLAYER_FOOT_OFFSET, o.z);
    g.rotation.y = o.blick;
    st.scene.add(g);
    g.updateMatrixWorld(true);
    (window.__samen = window.__samen || {})[o.name] = g;
    // seine Vorlagen (das Memo des Ofens) und ihre Breite: die Schulter-Zahl des Gesetzes ist an ihr messbar
    let vorlagen = [];
    g.traverse((n) => {
        if (n.__ofenVorlagen) vorlagen = n.__ofenVorlagen;
    });
    const breite = (v) => {
        // die Breite des Rumpfs auf Schulterhöhe: die Ecken der Haut-Hüllen der Vorlage zwischen 78 % und 84 % ihrer Höhe
        const box = new T.Box3().setFromObject(v.root);
        const [y0, y1] = [box.min.y + 0.78 * (box.max.y - box.min.y), box.min.y + 0.84 * (box.max.y - box.min.y)];
        let [lo, hi] = [Infinity, -Infinity];
        const p = new T.Vector3();
        v.root.updateMatrixWorld(true);
        v.root.traverse((n) => {
            const a = n.isMesh && n.geometry && n.geometry.attributes.position;
            if (!a) return;
            for (let i = 0; i < a.count; i++) {
                p.fromBufferAttribute(a, i).applyMatrix4(n.matrixWorld);
                if (p.y >= y0 && p.y <= y1) [lo, hi] = [Math.min(lo, p.x), Math.max(hi, p.x)];
            }
        });
        return +(hi - lo).toFixed(4);
    };
    return {
        name: o.name,
        bauMs: +bauMs.toFixed(1),
        vorlagen: vorlagen.map((v) => ({
            schluessel: v.__ofen.key.length > 90 ? v.__ofen.key.slice(0, 40) + "…" + v.__ofen.key.slice(-36) : v.__ofen.key,
            schulterBreite: breite(v),
            nutzer: v.__ofen.nutzer,
        })),
    };
}

// EIN BILD aus dem Ausgabe-Pfad: die Welt ruht (der Loop steht seit `bereit`, wie an der Werkbank), die Kamera steht vor den
// Menschen, die Bühne (Mittag · Sonne · Sommer), der Schuss — danach die Schilder (Name → Text) über den Köpfen, auf das PNG gemalt
async function bild(o) {
    const T = THREE;
    const t0 = performance.now();
    const y = o.y;
    st.camera.position.set(o.von[0], y + o.von[1], o.von[2]);
    st.camera.lookAt(o.nach[0], y + o.nach[1], o.nach[2] + 1e-4);
    st.camera.updateMatrixWorld(true);
    window.__buehne({});
    if (st.playerMesh) st.playerMesh.visible = false;
    const a = await window.__ausgabeAufnahme(o.W, o.H, 1, { satz: "messung" });
    const bildMs = Math.round(performance.now() - t0);
    const roh = Object.assign(new Image(), { src: __png(a.u8, o.W, o.H) });
    await roh.decode();
    const c = Object.assign(document.createElement("canvas"), { width: o.W, height: o.H });
    const x = c.getContext("2d");
    x.drawImage(roh, 0, 0);
    x.font = "600 15px sans-serif";
    x.textAlign = "center";
    for (const [name, text, unten] of o.schilder || []) {
        const g = window.__samen && window.__samen[name];
        if (!g) continue;
        const p = new T.Vector3(g.position.x, g.position.y + (unten ? -0.95 : 1.55), g.position.z).project(st.camera);
        const zeilen = String(text).split("\n");
        const [px, py] = [((p.x + 1) / 2) * o.W, ((1 - p.y) / 2) * o.H + (unten ? 20 * zeilen.length + 14 : 0)];
        const b = Math.max(...zeilen.map((z) => x.measureText(z).width)) + 14;
        x.fillStyle = "rgba(16,18,22,0.82)";
        x.fillRect(px - b / 2, py - 20 * zeilen.length - 6, b, 20 * zeilen.length + 6);
        x.fillStyle = "#fff";
        zeilen.forEach((z, i) => x.fillText(z, px, py - 20 * (zeilen.length - 1 - i) - 8));
    }
    if (o.titel) {
        x.textAlign = "left";
        x.fillStyle = "rgba(16,18,22,0.82)";
        x.fillRect(0, 0, o.W, 30);
        x.fillStyle = "#fff";
        x.fillText(o.titel, 12, 21);
    }
    return { png: c.toDataURL("image/png"), bildMs };
}

// DER ZEIGER-ZENSUS: jeder Wert in Klasse, Welt und Zustand, der ein Objekt oder eine Funktion des Kerns `K` IST (Identität) —
// das sind die Halter, die einen Tausch des globalen Namens überleben
function zeigerZensus(name) {
    const K = window.__samenKerne[name];
    const ziel = new Map();
    const gang = (o, pfad, tiefe) => {
        if (!o || (typeof o !== "object" && typeof o !== "function") || ziel.has(o)) return;
        ziel.set(o, pfad);
        if (tiefe <= 0 || typeof o === "function" || ArrayBuffer.isView(o)) return;
        for (const k of Object.keys(o)) gang(o[k], pfad + "." + k, tiefe - 1);
    };
    gang(K, "K", 5);
    const treffer = [];
    const gesehen = new Set();
    const suche = (o, pfad, tiefe) => {
        if (!o || (typeof o !== "object" && typeof o !== "function")) return;
        if (ziel.has(o)) return void treffer.push(pfad + " → " + ziel.get(o));
        if (gesehen.has(o) || tiefe <= 0) return;
        gesehen.add(o);
        if (o.isObject3D || o.isBufferGeometry || o.isMaterial || o.isTexture || ArrayBuffer.isView(o)) return;
        if (o instanceof Node || o instanceof Worker || o === window) return;
        if (o instanceof Map) {
            let i = 0;
            for (const [k, v] of o) {
                suche(v, pfad + "<" + String(k).slice(0, 40) + ">", tiefe - 1);
                if (++i > 4000) break;
            }
            return;
        }
        let namen;
        try {
            namen = Object.getOwnPropertyNames(o);
        } catch {
            return;
        }
        if (namen.length > 6000) return;
        for (const k of namen) {
            let d;
            try {
                d = Object.getOwnPropertyDescriptor(o, k);
            } catch {
                continue;
            }
            if (!d || d.get) continue;
            suche(d.value, pfad + "." + k, tiefe - 1);
        }
    };
    suche(AnazhRealm, "AnazhRealm", 4);
    suche(r, "r", 4);
    suche(window.__terrainCore, "__terrainCore", 2);
    for (const ns of ["__tetrapodaCore", "__schmiedeCore", "__fachwerkCore", "__phytoCore"]) suche(window[ns], ns, 2);
    return { ziele: ziel.size, halter: treffer.length, namen: treffer.slice(0, 60) };
}

// DER STAND DER ABGELEITETEN DINGE: was die laufende Welt aus dem Körper-Gesetz hält
function standDerDinge() {
    const memo = AnazhRealm._tierOfenMemo || new Map();
    const f = r._foundry;
    const strom = AnazhRealm._gesetzStromMemo || new Map();
    let leiber = 0,
        meshes = 0,
        szene = 0;
    st.scene.traverse((n) => {
        szene++;
        if (n.__ofenVorlagen && n.__ofenVorlagen.some((v) => v.__ofen.key.startsWith("mensch|"))) leiber++;
        if (n.isMesh) meshes++;
    });
    return {
        ofenMemo: memo.size,
        ofenMemoMensch: [...memo.keys()].filter((k) => k.startsWith("mensch|")).length,
        ofenRoh: (AnazhRealm._ofenRohMemo || new Map()).size,
        foundryCache: f ? f.cache.size : 0,
        gesetzStrom: strom.size,
        gesetzStromKoerper: [...strom.keys()].filter((k) => k.startsWith("koerper:")).length,
        stoffe: Object.keys(r._foundryMats || {}).length,
        menschLeiber: leiber,
        szeneKnoten: szene,
        szeneMeshes: meshes,
        chunks: st.voxelChunks ? st.voxelChunks.size : 0,
        kreaturen: Array.isArray(st.creatures) ? st.creatures.length : null,
    };
}

// DIE PLATTE NACH INHALT: je Lieferung (ihr Rest-Schlüssel, ohne den Gesetz-Kopf) der SHA-256 ihrer Bytes — der Hash der
// abgeleiteten Sache selbst. Zwei Stände nebeneinander sagen, wie viele Dinge ein Gesetz-Wechsel WIRKLICH ändert.
async function platteNachInhalt() {
    const t0 = performance.now();
    const d = await new Promise((ok, bruch) => {
        const q = indexedDB.open("anazhFoundryAssets", 1);
        q.onupgradeneeded = () => q.result.createObjectStore("assets");
        q.onerror = () => bruch(q.error);
        q.onsuccess = () => ok(q.result);
    });
    const [keys, werte] = await new Promise((ok) => {
        const o = d.transaction("assets", "readonly").objectStore("assets");
        const [k, v] = [o.getAllKeys(), o.getAll()];
        v.onsuccess = () => ok([k.result, v.result]);
    });
    d.close();
    const aus = {};
    let bytes = 0;
    for (let i = 0; i < keys.length; i++) {
        const k = String(keys[i]);
        if (!k.includes("~")) continue;
        const teile = [];
        const gang = (o, tiefe) => {
            if (!o || typeof o !== "object" || tiefe > 6) return;
            if (ArrayBuffer.isView(o)) return void teile.push(new Uint8Array(o.buffer, o.byteOffset, o.byteLength));
            for (const n of Object.keys(o).sort()) {
                const v = o[n];
                if (v && typeof v === "object") gang(v, tiefe + 1);
                else teile.push(new TextEncoder().encode(n + "=" + String(v) + ";"));
            }
        };
        gang(werte[i], 0);
        const n = teile.reduce((a, t) => a + t.byteLength, 0);
        const alle = new Uint8Array(n);
        let off = 0;
        for (const t of teile) (alle.set(t, off), (off += t.byteLength));
        bytes += n;
        const h = await crypto.subtle.digest("SHA-256", alle);
        aus[k.slice(k.indexOf("~") + 1)] = Array.from(new Uint8Array(h).slice(0, 8), (x) => x.toString(16).padStart(2, "0")).join("");
    }
    return { hash: aus, zahl: Object.keys(aus).length, bytes, ms: Math.round(performance.now() - t0) };
}

// (a) HEUTE: der Kern lädt neu, wie die Seite ihn beim Start lud (<script src="koerper-core.js?v=…">, CSP 'self')
async function kernNeuLaden() {
    const alt = window.__koerperCore;
    (window.__samenKerne = window.__samenKerne || {}).alt = alt;
    const t0 = performance.now();
    await new Promise((ok, bruch) => {
        const s = document.createElement("script");
        s.src = "koerper-core.js?v=samen-" + Date.now();
        s.onload = ok;
        s.onerror = () => bruch(new Error("der Kern lädt nicht"));
        document.head.appendChild(s);
    });
    const neu = window.__koerperCore;
    window.__samenKerne.neu = neu;
    return {
        ladeMs: +(performance.now() - t0).toFixed(1),
        getauscht: neu !== alt,
        schulterAlt: +alt.labProportionen().shoulderHW.toFixed(4),
        schulterNeu: +neu.labProportionen().shoulderHW.toFixed(4),
    };
}

// der Mensch-Ofen im FADEN gefragt (der Weg jeder Bewohner-Vorlage, `_bewohnerVorlagen`): welches Gesetz baut er?
async function fadenFragen(o) {
    const T = THREE;
    const t0 = performance.now();
    const meshes = await r._foundryRequest("mensch", 0, 0, o.ov, 0);
    if (!meshes || !meshes.length) return { fehler: "der Faden lieferte nichts" };
    const asm = r._ofenAssembleAsset(meshes);
    const box = new T.Box3().setFromObject(asm.root);
    const [y0, y1] = [box.min.y + 0.78 * (box.max.y - box.min.y), box.min.y + 0.84 * (box.max.y - box.min.y)];
    let [lo, hi] = [Infinity, -Infinity];
    const p = new T.Vector3();
    asm.root.updateMatrixWorld(true);
    asm.root.traverse((n) => {
        const a = n.isMesh && n.geometry && n.geometry.attributes.position;
        if (!a) return;
        for (let i = 0; i < a.count; i++) {
            p.fromBufferAttribute(a, i).applyMatrix4(n.matrixWorld);
            if (p.y >= y0 && p.y <= y1) [lo, hi] = [Math.min(lo, p.x), Math.max(hi, p.x)];
        }
    });
    asm.root.traverse((n) => n.geometry && n.geometry.dispose());
    const L = r._foundry.lieferung.liste;
    return { ms: Math.round(performance.now() - t0), schulterBreite: +(hi - lo).toFixed(4), liefer: L[L.length - 1] };
}

// (c) DER KANDIDAT, von außen an die Seite gelegt: je Fassung ein Fach, der Hash der Fassung im Schlüssel am EINEN Weg ins Memo
async function kandidatAnlegen() {
    const t0 = performance.now();
    const lade = (u) =>
        new Promise((ok, bruch) => {
            const s = document.createElement("script");
            s.src = u;
            s.onload = ok;
            s.onerror = () => bruch(new Error(u + " lädt nicht"));
            document.head.appendChild(s);
        });
    await lade("samen-fach-B.js");
    const ladeMs = performance.now() - t0;
    const A = window.__koerperCore;
    const B = window.__gesetzFach.B.__koerperCore;
    window.__samenKerne = { alt: A, neu: B };
    // der Hash der Fassung: SHA-256 über den Quelltext (wie die Schale der Platte ihn rechnet), 16 Hex
    const hex = async (u) => {
        const t = await (await fetch(u)).text();
        const h0 = performance.now();
        const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
        return {
            sha: Array.from(new Uint8Array(d), (x) => x.toString(16).padStart(2, "0")).join("").slice(0, 16),
            ms: +(performance.now() - h0).toFixed(2),
            bytes: t.length,
        };
    };
    const hA = await hex("koerper-core.js");
    const hB = await hex("B/koerper-core.js");
    const fassung = new Map([
        [A, hA.sha],
        [B, hB.sha],
    ]);
    window.__samenFassung = fassung;
    // DER SCHLÜSSEL TRÄGT DIE FASSUNG: der EINE Key-Münzer des Mensch-Ofens hängt den Hash des Kerns an, der gerade gilt
    const muenzer = Object.getPrototypeOf(r)._ofenMenschKey;
    r._ofenMenschKey = function (d, s, h, l) {
        return muenzer.call(this, d, s, h, l) + "|g:" + fassung.get(window.__koerperCore);
    };
    // UNTER EINER FASSUNG BAUEN: der globale Name zeigt für die Dauer des (synchronen) Baus auf die Fassung, danach zurück.
    // Dabei zählt die Spur: welche Namen des Kerns liest der Bau über den globalen Namen, welche Pfade über den Gesetz-Strom
    window.__unterFassung = (K, tu) => {
        const spur = { kern: {}, strom: {} };
        const zaehl = new Proxy(K, {
            get(o, k) {
                if (typeof k === "string") spur.kern[k] = (spur.kern[k] || 0) + 1;
                return o[k];
            },
        });
        fassung.set(zaehl, fassung.get(K));
        const [gAlt, stromAlt] = [window.__koerperCore, AnazhRealm.Gesetz];
        AnazhRealm.Gesetz = function (pfad) {
            const memo = AnazhRealm._gesetzStromMemo;
            if (String(pfad).startsWith("koerper:"))
                spur.strom[pfad] = (spur.strom[pfad] || 0) + (memo && memo.has(pfad) ? 1 : 1000);
            return stromAlt.apply(this, arguments);
        };
        window.__koerperCore = zaehl;
        try {
            return { aus: tu(), spur };
        } finally {
            window.__koerperCore = gAlt;
            AnazhRealm.Gesetz = stromAlt;
        }
    };
    // die Kosten des Schlüssels im Normalbetrieb: 20 000 Münzungen mit und ohne Fassung
    const d = Object.assign({}, A.START_PARAMS);
    const mess = (fn) => {
        const t = performance.now();
        let n = 0;
        for (let i = 0; i < 20000; i++) n += fn(i).length;
        return [(performance.now() - t) / 20000, n / 20000];
    };
    const [ohneMs, ohneLen] = mess((i) => muenzer.call(r, d, 0xaabbcc, 0x332211, i & 1));
    const [mitMs, mitLen] = mess((i) => r._ofenMenschKey(d, 0xaabbcc, 0x332211, i & 1));
    return {
        fachLadeMs: +ladeMs.toFixed(1),
        hashA: hA,
        hashB: hB,
        schluesselOhneUs: +(ohneMs * 1000).toFixed(3),
        schluesselMitUs: +(mitMs * 1000).toFixed(3),
        schluesselLaenge: [ohneLen, mitLen],
    };
}

function unterFassungBauen(o) {
    const K = window.__samenKerne[o.fassung];
    const t0 = performance.now();
    const { aus, spur } = window.__unterFassung(K, () => window.__menschBauen(o));
    aus.gesamtMs = +(performance.now() - t0).toFixed(1);
    aus.spur = {
        kernNamen: Object.keys(spur.kern).length,
        kernLesungen: Object.values(spur.kern).reduce((a, b) => a + b, 0),
        kern: spur.kern,
        // der Gesetz-Strom: >= 1000 = frisch gelesen (aus dem GLOBALEN Namen der Fassung), sonst aus dem Memo (die Fassung des Starts)
        strom: spur.strom,
    };
    return aus;
}

// (c2) DER FADEN DER FASSUNG B: ein zweiter Studio-Faden aus DEMSELBEN Boot-Blob, dessen Kerne aus dem Baum /B/ laden — der Wirt
// baut seinen Start aus `location.href`, das für die Dauer der Geburt auf /B/index.html zeigt (history.replaceState lädt nichts)
async function fadenB(o) {
    const idbZahl = () =>
        new Promise((ok) => {
            const q = indexedDB.open("anazhFoundryAssets", 1);
            q.onupgradeneeded = () => q.result.createObjectStore("assets");
            q.onerror = () => ok(null);
            q.onsuccess = () => {
                const d = q.result;
                const st0 = d.transaction("assets", "readonly").objectStore("assets");
                const k = st0.getAllKeys();
                k.onsuccess = () => {
                    const keys = k.result.map(String);
                    const koepfe = {};
                    for (const s of keys) {
                        const kopf = s.includes("~") ? s.slice(0, s.indexOf("~")) : s;
                        koepfe[kopf] = (koepfe[kopf] || 0) + 1;
                    }
                    d.close();
                    ok({ zahl: keys.length, koepfe });
                };
            };
        });
    const vor = await idbZahl();
    const fA = r._foundry;
    const t0 = performance.now();
    const hier = location.href;
    r._foundry = null;
    history.replaceState(null, "", "/B/index.html");
    let fB;
    try {
        fB = r._ensureAssetFoundry(true); // vorWelt: sein Buch geht nicht in die Welt (die trägt das Buch der Fassung A)
    } finally {
        history.replaceState(null, "", hier);
        r._foundry = fA;
    }
    while (!fB.ready && performance.now() - t0 < 120000) await sleep(50);
    const bootMs = performance.now() - t0;
    if (!fB.ready) return { fehler: "der Faden B steht nicht", bootMs };
    await sleep(1500); // seine Platte öffnet (der Stempel fegt, was sein Gesetz nicht trägt)
    const nach = await idbZahl();
    // dieselbe Eingabe an beide Fäden: was liefert jeder, unter welchem Schlüssel der Platte?
    const frage = async (f) => {
        const T = THREE;
        r._foundry = f;
        let zusage;
        try {
            zusage = r._foundryWorkerRequest("mensch", 0, 0, o.ov, r._foundryKoerperKey("mensch", 0, 0, o.ov), false, 0);
        } finally {
            r._foundry = fA;
        }
        const t = performance.now();
        const meshes = await zusage;
        if (!meshes || !meshes.length) return { fehler: "leer" };
        const asm = r._ofenAssembleAsset(meshes);
        const box = new T.Box3().setFromObject(asm.root);
        const [y0, y1] = [box.min.y + 0.78 * (box.max.y - box.min.y), box.min.y + 0.84 * (box.max.y - box.min.y)];
        let [lo, hi] = [Infinity, -Infinity];
        const p = new T.Vector3();
        asm.root.updateMatrixWorld(true);
        asm.root.traverse((n) => {
            const a = n.isMesh && n.geometry && n.geometry.attributes.position;
            if (!a) return;
            for (let i = 0; i < a.count; i++) {
                p.fromBufferAttribute(a, i).applyMatrix4(n.matrixWorld);
                if (p.y >= y0 && p.y <= y1) [lo, hi] = [Math.min(lo, p.x), Math.max(hi, p.x)];
            }
        });
        asm.root.traverse((n) => n.geometry && n.geometry.dispose());
        const L = f.lieferung.liste;
        return { ms: Math.round(performance.now() - t), schulterBreite: +(hi - lo).toFixed(4), liefer: L[L.length - 1] };
    };
    const ausB = await frage(fB);
    const ausA = await frage(fA);
    await sleep(800);
    const ende = await idbZahl();
    const ausA2 = await frage(fA); // dieselbe Frage noch einmal an A: liegt sie jetzt auf der Platte?
    const ausB2 = await frage(fB);
    fB.worker.terminate();
    return { bootMs: Math.round(bootMs), platteVor: vor, platteNachOeffnen: nach, platteEnde: ende, ausA, ausB, ausA2, ausB2 };
}

// ───────────────────────── Der Lauf ─────────────────────────

(async () => {
    const erg = { stand: "V" + require(path.join(ROOT, "package.json")).version, kern: { A: sha16(kernA), B: sha16(kernB), zeilen: kernA.split("\n").length } };
    const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(0).padStart(4)} s]`, ...a);
    const T0 = Date.now();
    const sichern = () => fs.writeFileSync(path.join(HIER, "ergebnis.json"), JSON.stringify(erg, null, 1));
    await server.lausche(0);
    const browser = await starteBrowser({ art: "linse", frist: 1800000 });
    const page = await browser.newPage();
    erg.fadenUmgangen = [];
    page.on("console", (m) => {
        const t = m.text();
        if (/FADEN-UMGANGEN/.test(t)) erg.fadenUmgangen.push(t.slice(0, 200));
        if (/\[ERROR\]|platte|PLATTE|STOFF/.test(t)) log("[seite]", t.slice(0, 220));
    });
    await page.setViewport({ width: 960, height: 540 });
    const W = 960,
        H = 540;
    const boot = async (name, f) => {
        fassung = f;
        const t = Date.now();
        await server.zeige(page, 120000, "index.html?holz=kienspan");
        await page.evaluate(AUSGABE_INSTALL);
        await page.evaluate("window.__menschBauen = " + menschBauen.toString());
        const b = await page.evaluate(bereit);
        b.wandMs = Date.now() - t;
        log(`Boot ${name} (Kern ${f}): Weltbild ${b.weltbildMs} ms, geliefert ${b.geliefertMs} ms, Platte ${b.lieferung.platte} / Werk ${b.lieferung.werk}`);
        return b;
    };
    const schuss = async (datei, mitte, titel, schilder) => {
        const y = await page.evaluate((m) => r._koerperBodenUnter(m[0], NaN, m[1]) || 0, mitte);
        const b = await page.evaluate(bild, { W, H, y, titel, schilder, von: [mitte[0] + 3.0, 1.35, mitte[1]], nach: [mitte[0] - 0.4, 0.95, mitte[1]] });
        pngDatei(path.join(HIER, datei), b.png);
        log(`Bild ${datei} (${b.bildMs} ms)`);
        return b.bildMs;
    };
    // die Bewohner-Gestalt des Versuchs: die Dials eines gerollten Genoms (der Weg jeder Gestalt einer Siedlung)
    const ORT = [-6, 0]; // vor dem Spieler der Ankunft (Blick nach −x)
    try {
        // ════════ Boot 1: Fassung A, kalte Platte ════════
        erg.boot1 = await boot("1", "A");
        const inhalt = { A1: await page.evaluate(platteNachInhalt) };
        const ov = await page.evaluate(() => r._dialsAusGenom(r._rollHumanoidGenome("samen-bewohner")));
        const ov2 = await page.evaluate(() => r._dialsAusGenom(r._rollHumanoidGenome("samen-nachbar")));
        erg.ov = ov;
        sichern();

        // ════════ (a) HEUTE: der Kern lädt in der laufenden Seite neu ════════
        const a = (erg.a = {});
        a.standVor = await page.evaluate(standDerDinge);
        a.mensch1 = await page.evaluate(menschBauen, { name: "a1", ov, x: ORT[0], z: ORT[1] - 0.9, blick: Math.PI / 2 });
        fassung = "B";
        const tA = Date.now();
        a.tausch = await page.evaluate(kernNeuLaden);
        // derselbe Bewohner noch einmal (dieselbe Eingabe), nach dem Tausch
        a.mensch2 = await page.evaluate(menschBauen, { name: "a2", ov, x: ORT[0], z: ORT[1] + 0.9, blick: Math.PI / 2 });
        a.bildMs = await schuss("a-heute.png", ORT, "(a) HEUTE: der Kern lud in der laufenden Seite neu (Schulter 0,259 → 0,360) — derselbe Bewohner bleibt ALT", [
            ["a1", "a1 · VOR dem Tausch\nSchulter " + a.mensch1.vorlagen[0].schulterBreite],
            ["a2", "a2 · NACH dem Tausch, gleiche Eingabe\nSchulter " + a.mensch2.vorlagen[0].schulterBreite + " (Klon der alten Vorlage)"],
        ]);
        a.tauschBisBildMs = Date.now() - tA;
        // ein ANDERER Bewohner (neue Eingabe): der Haupt-Faden gießt ihn selbst — mit welchem Gesetz?
        a.mensch3 = await page.evaluate(menschBauen, { name: "a3", ov: ov2, x: ORT[0] - 1.5, z: ORT[1], blick: Math.PI / 2 });
        // und dieselbe neue Eingabe über den Faden (der Weg der Bewohner-Vorlagen)
        a.faden = await page.evaluate(fadenFragen, { ov: { dials: Object.assign({}, ov2, { __samen: 1 }), skinColor: 0xc68642, hairColor: 0x2b1b12 } });
        a.zeigerAlt = await page.evaluate(zeigerZensus, "alt");
        a.zeigerNeu = await page.evaluate(zeigerZensus, "neu");
        a.standNach = await page.evaluate(standDerDinge);
        await schuss("a-heute-drei.png", ORT, "(a) HEUTE: nach dem Tausch — gleiche Eingabe ALT (Memo), neue Eingabe NEU (Haupt-Faden): still gemischt", [
            ["a1", "a1 · vor dem Tausch\n" + a.mensch1.vorlagen[0].schulterBreite],
            ["a2", "a2 · danach, gleiche Eingabe\n" + a.mensch2.vorlagen[0].schulterBreite + " = ALT"],
            ["a3", "a3 · danach, neue Eingabe\n" + a.mensch3.vorlagen[0].schulterBreite + " = NEU (Faden: " + a.faden.schulterBreite + " = ALT)", true],
        ]);
        log("(a)", JSON.stringify({ tausch: a.tausch, m1: a.mensch1.vorlagen, m2: a.mensch2.vorlagen, m3: a.mensch3.vorlagen, faden: a.faden }));
        log("(a) Zeiger alt", a.zeigerAlt.halter, "neu", a.zeigerNeu.halter);
        sichern();

        // ════════ (b) GEGENPROBE: alles wegwerfen — die Seite lädt neu, der Kern ist Fassung B ════════
        const b = (erg.b = {});
        b.verliert = await page.evaluate(() => ({
            samenMenschen: Object.keys(window.__samen || {}).length,
            stand: (() => {
                const memo = AnazhRealm._tierOfenMemo || new Map();
                let n = 0;
                st.scene.traverse(() => n++);
                return { szeneKnoten: n, ofenMemo: memo.size, foundryCache: r._foundry.cache.size, chunks: st.voxelChunks ? st.voxelChunks.size : 0 };
            })(),
            uhr: st.timeOfDay,
        }));
        const tB = Date.now();
        b.boot = await boot("2 = Gegenprobe", "B");
        inhalt.B = await page.evaluate(platteNachInhalt);
        b.mensch = await page.evaluate(menschBauen, { name: "b1", ov, x: ORT[0], z: ORT[1], blick: Math.PI / 2 });
        b.bildMs = await schuss("b-neuaufbau.png", ORT, "(b) GEGENPROBE: alles weg, die Seite lud neu mit Fassung B — nur EIN Stand im Bild, kein Vergleich", [
            ["b1", "b1 · nach dem Neuaufbau\nSchulter " + b.mensch.vorlagen[0].schulterBreite + " (Fassung B)"],
        ]);
        b.tauschBisBildMs = Date.now() - tB;
        b.standNach = await page.evaluate(standDerDinge);
        log("(b)", JSON.stringify({ boot: b.boot, mensch: b.mensch.vorlagen, ms: b.tauschBisBildMs }));
        sichern();

        // ════════ Boot 3: zurück auf Fassung A — trägt die Platte A noch? ════════
        erg.boot3 = await boot("3 (zurück auf A)", "A");
        inhalt.A3 = await page.evaluate(platteNachInhalt);
        // der Vergleich nach INHALT: A gegen A (zweimal frisch gebaut — die Gegenprobe: derselbe Bau, dieselben Bytes?) und A gegen B
        const gegen = (x, y) => {
            const gemeinsam = Object.keys(x.hash).filter((k) => k in y.hash);
            const anders = gemeinsam.filter((k) => x.hash[k] !== y.hash[k]);
            return { gemeinsam: gemeinsam.length, anders: anders.length, namen: anders.slice(0, 40) };
        };
        erg.inhalt = {
            A1: { zahl: inhalt.A1.zahl, bytes: inhalt.A1.bytes, hashMs: inhalt.A1.ms },
            B: { zahl: inhalt.B.zahl, bytes: inhalt.B.bytes, hashMs: inhalt.B.ms },
            A3: { zahl: inhalt.A3.zahl, bytes: inhalt.A3.bytes, hashMs: inhalt.A3.ms },
            AgegenA: gegen(inhalt.A1, inhalt.A3),
            AgegenB: gegen(inhalt.A1, inhalt.B),
        };
        log("Inhalt", JSON.stringify(erg.inhalt));
        // ════════ Boot 4: A noch einmal — die warme Platte als Maß ════════
        erg.boot4 = await boot("4 (A warm)", "A");
        sichern();

        // ════════ (c) DER KANDIDAT: zwei Fassungen nebeneinander ════════
        const c = (erg.c = {});
        c.standVor = await page.evaluate(standDerDinge);
        const tC = Date.now();
        c.anlegen = await page.evaluate(kandidatAnlegen);
        c.menschA = await page.evaluate(unterFassungBauen, { fassung: "alt", name: "cA", ov, x: ORT[0], z: ORT[1] - 0.9, blick: Math.PI / 2 });
        c.menschB = await page.evaluate(unterFassungBauen, { fassung: "neu", name: "cB", ov, x: ORT[0], z: ORT[1] + 0.9, blick: Math.PI / 2 });
        c.bildMs = await schuss("c-kandidat.png", ORT, "(c) KANDIDAT: zwei Fassungen des Körper-Gesetzes in EINER laufenden Welt, derselbe Bewohner, der Hash im Schlüssel", [
            ["cA", "Fassung A · g:" + c.anlegen.hashA.sha.slice(0, 8) + "\nSchulter " + c.menschA.vorlagen[0].schulterBreite],
            ["cB", "Fassung B · g:" + c.anlegen.hashB.sha.slice(0, 8) + "\nSchulter " + c.menschB.vorlagen[0].schulterBreite],
        ]);
        c.tauschBisBildMs = Date.now() - tC;
        // ein zweiter nach dem neuen Gesetz: trifft er die Vorlage (Klon), oder baut er neu?
        c.menschB2 = await page.evaluate(unterFassungBauen, { fassung: "neu", name: "cB2", ov, x: ORT[0] - 1.5, z: ORT[1], blick: Math.PI / 2 });
        // UMSCHALTEN: der stehende Leib cA wechselt an seinem Ort die Fassung (alt fort, neu aus dem Memo) — und zurück
        c.umschalten = [];
        for (const f of ["neu", "alt", "neu", "alt"]) {
            const u = await page.evaluate(unterFassungBauen, { fassung: f, name: "cUm", ov, x: ORT[0] + 1.2, z: ORT[1], blick: Math.PI / 2, ersetzt: true });
            c.umschalten.push({ fassung: f, ms: u.gesamtMs, schulter: u.vorlagen[0].schulterBreite });
        }
        c.standNach = await page.evaluate(standDerDinge);
        c.zeigerAlt = await page.evaluate(zeigerZensus, "alt");
        c.zeigerNeu = await page.evaluate(zeigerZensus, "neu");
        // was der Leib der Fassung B NACH dem Bau liest: der Takt (Tuch, Gang) fragt den globalen Namen — die Fassung A
        c.nachDemBau = await page.evaluate(() => ({
            globalIstAlt: window.__koerperCore === window.__samenKerne.alt,
            leibTaktIstAlt: AnazhRealm._leibTakt() === window.__samenKerne.alt,
            leibTraegtFassung: !!(window.__samen.cB.userData && window.__samen.cB.userData.gesetz),
            rigMapIstAlt: AnazhRealm.MOTION_RIG_MAP === window.__samenKerne.alt.MOTION_RIG_MAP,
        }));
        log("(c)", JSON.stringify({ anlegen: c.anlegen, A: c.menschA.vorlagen, B: c.menschB.vorlagen, B2: c.menschB2.vorlagen, msA: c.menschA.gesamtMs, msB: c.menschB.gesamtMs }));
        sichern();
        // (c2) der Faden der Fassung B
        c.faden = await page.evaluate(fadenB, { ov: { dials: ov, skinColor: 0xc68642, hairColor: 0x2b1b12 } });
        log("(c2)", JSON.stringify(c.faden).slice(0, 1500));
        sichern();
    } catch (e) {
        erg.fehler = String((e && e.stack) || e).slice(0, 2000);
        log("FEHLER", erg.fehler);
    }
    sichern();
    await browser.close().catch(() => {});
    server.close();
    log("Ende");
    process.exit(erg.fehler ? 1 : 0);
})();
