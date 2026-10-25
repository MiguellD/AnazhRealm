// =============================================================================
// speicher-faden.js — DER SPEICHER-FADEN (Lehre 24: der Haupt-Thread trägt keine Bytes, die Platte gehört in den Worker).
//
// Der Haupt-Faden reicht je Sicherung nur die ÄNDERUNG des Stands (`_standAenderung`): die Teile der Stand-Tafel, deren JSON
// sich änderte, als EINE Zeichenkette (durch "\u0001" getrennt — ein JSON-Text trägt das Steuerzeichen nie roh; ihr Klon ist
// im Sender ein memcpy: postMessage 0,07–0,10 ms gegen 0,19–0,25 ms für Kodieren und Transfer eines Puffers, ABAB 3× headless),
// die Glieder der Listen (Bauten, Baupläne, Wesen) je Seriennummer, ihre Ordnung, wenn sie sich änderte, und die neuen Edits
// als Zahlen per Transfer; zurück kommen Quittungen und das Abbild per Transfer. Der Teil „" ist der Kopf: die Felder ohne
// eigenen Teil als Text ohne Klammern. Dieser Faden hält je Welt das Modell des Stands, setzt das JSON zusammen (die Bytes, die
// `JSON.stringify` der Tafel ergäbe) und schreibt ATOMAR in IndexedDB („anazhRealm" · „worlds"): EINE Transaktion liest den
// vorigen Stand, legt ihn als `<id>.bak` ab und schreibt den neuen unter `<id>` — tmp + Rename + .bak des save-servers;
// ein Tod mitten darin lässt beide, wie sie waren. Das Format auf der Platte ist das des Lesers (`_idbPreload`): {at, json}.
//
// DIE EDITS (Welt = Seed + Edits + Leben): je Edit x, y, z, r als Float64 (verlustfrei, little-endian) und der Modus als Bit
// (1 = fill), im Stand base64 unter `voxelEdits` {n, xyzr, modus} — 43 Zeichen je Edit statt 64 im Objekt-JSON. Der Leser
// (`_standNormal`) legt sie zurück nach `worldMeta.voxelEdits`.
//
// Ops (je Nachricht EINE Antwort mit ihrem `n`, in der Reihenfolge der Nachrichten): stand · ablegen · loeschen · abbild ·
// server · still. Ein Fehler antwortet {ok:false, grund}; das Modell der Welt fällt, der Haupt-Faden sendet sie ganz neu.
// =============================================================================
"use strict";

const STORE = "worlds";
const TRENNER = "\u0001";
const welten = new Map(); // welt → {ordnung, teile: Map, listen: Map(key → {ordnung, glieder: Map}), edits}
let platteP = null;

// Die EINE Datenbank (dieselbe wie die des Lesers). Ohne IndexedDB (null-origin der inneren Welt) antwortet jede Op mit
// `platte: false` — der Stand lebt dann nur in diesem Faden, die Seite sagt es laut.
function platte() {
    if (platteP) return platteP;
    platteP = new Promise((ok) => {
        const ohne = (grund) => ok({ db: null, grund: String(grund) });
        try {
            const req = indexedDB.open("anazhRealm", 1);
            req.onupgradeneeded = () => {
                if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
            };
            req.onsuccess = () => ok({ db: req.result, grund: null });
            req.onerror = () => ohne((req.error && req.error.message) || "IndexedDB öffnet nicht");
            req.onblocked = () => ohne("IndexedDB blockiert");
        } catch (e) {
            ohne((e && e.message) || e);
        }
    });
    return platteP;
}

// EINE Transaktion: der vorige Stand wird `.bak`, der neue `<id>` — löst erst, wenn sie fest ist.
async function schreibeAtomar(welt, at, json) {
    const P = await platte();
    if (!P.db) return false;
    await new Promise((ok, nein) => {
        const tx = P.db.transaction(STORE, "readwrite");
        const st = tx.objectStore(STORE);
        st.get(welt).onsuccess = (e) => {
            const vor = e.target.result;
            if (vor && typeof vor.json === "string") st.put(vor, welt + ".bak");
            st.put({ at, json }, welt);
        };
        tx.oncomplete = () => ok();
        tx.onerror = () => nein(tx.error || new Error("Transaktion fehlgeschlagen"));
        tx.onabort = () => nein(tx.error || new Error("Transaktion abgebrochen"));
    });
    return true;
}

async function loescheWelt(welt) {
    const P = await platte();
    if (!P.db) return false;
    await new Promise((ok, nein) => {
        const tx = P.db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(welt);
        tx.objectStore(STORE).delete(welt + ".bak");
        tx.oncomplete = () => ok();
        tx.onerror = () => nein(tx.error || new Error("Löschen fehlgeschlagen"));
    });
    return true;
}

// base64 eines Byte-Felds (in Scheiben: String.fromCharCode trägt nicht beliebig viele Argumente)
function b64(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
}

// Die Edits einer Welt: wachsende Puffer (x, y, z, r je Edit, little-endian) und die Modus-Bits.
function editsNeu() {
    return { n: 0, xyzr: new DataView(new ArrayBuffer(4096 * 32)), modus: new Uint8Array(512) };
}
function editsAnhaengen(E, ab, xyzr, modus) {
    if (ab > E.n) throw new Error(`Edit-Lücke: der Anhang beginnt bei ${ab}, der Faden hält ${E.n}`);
    const n = ab + modus.length;
    if (n * 32 > E.xyzr.byteLength) {
        const neu = new DataView(new ArrayBuffer(Math.max(n * 32, E.xyzr.byteLength * 2)));
        new Uint8Array(neu.buffer).set(new Uint8Array(E.xyzr.buffer, 0, E.n * 32));
        E.xyzr = neu;
    }
    if (n > E.modus.length * 8) {
        const neu = new Uint8Array(Math.max(Math.ceil(n / 8), E.modus.length * 2));
        neu.set(E.modus);
        E.modus = neu;
    }
    for (let i = 0; i < modus.length; i++) {
        const j = ab + i;
        for (let k = 0; k < 4; k++) E.xyzr.setFloat64(j * 32 + k * 8, xyzr[i * 4 + k], true);
        if (modus[i]) E.modus[j >> 3] |= 1 << (j & 7);
        else E.modus[j >> 3] &= ~(1 << (j & 7));
    }
    E.n = n;
}
function editsJson(E) {
    const xyzr = b64(new Uint8Array(E.xyzr.buffer, 0, E.n * 32));
    const modus = b64(E.modus.subarray(0, Math.ceil(E.n / 8)));
    return `{"n":${E.n},"xyzr":"${xyzr}","modus":"${modus}"}`;
}

// DIE EINE KOMPOSITION: die Teile in der Ordnung der Tafel — die Listen als Arrays ihrer Glieder, die Edits kompakt.
function komponiere(W) {
    const out = [];
    for (const k of W.ordnung) {
        // der Kopf: die Felder ohne eigenen Teil, als Text ohne Klammern (leer, wenn sie alle undefined sind)
        if (k === "") {
            if (W.teile.get("")) out.push(W.teile.get(""));
            continue;
        }
        const L = W.listen.get(k);
        const v =
            k === "voxelEdits"
                ? editsJson(W.edits)
                : L
                  ? "[" + L.ordnung.map((s) => L.glieder.get(s)).join(",") + "]"
                  : W.teile.get(k);
        if (v === undefined) throw new Error(`der Teil „${k}" fehlt im Modell`);
        out.push(JSON.stringify(k) + ":" + v);
    }
    return "{" + out.join(",") + "}";
}

const zuBytes = (text) => new TextEncoder().encode(text).buffer;

const OPS = {
    // DIE SICHERUNG: die Änderung auf das Modell, das ganze JSON in EINER Transaktion auf die Platte.
    async stand(m) {
        let W = welten.get(m.welt);
        if (m.voll) {
            W = { ordnung: [], teile: new Map(), listen: new Map(), edits: editsNeu() };
            welten.set(m.welt, W);
        } else if (!W) return { ok: false, grund: "kein Modell der Welt im Faden (der Haupt-Faden sendet sie ganz)" };
        try {
            const stuecke = m.daten.split(TRENNER);
            let i = 0;
            if (m.ordnung) W.ordnung = m.ordnung;
            for (const k of m.teile) W.teile.set(k, stuecke[i++]);
            for (const k in m.listen || {}) {
                const l = m.listen[k];
                const L = W.listen.get(k) || { ordnung: [], glieder: new Map() };
                W.listen.set(k, L);
                for (const s of l.teile) L.glieder.set(s, stuecke[i++]);
                if (l.ordnung) {
                    L.ordnung = Array.from(l.ordnung);
                    const lebt = new Set(L.ordnung);
                    for (const s of L.glieder.keys()) if (!lebt.has(s)) L.glieder.delete(s);
                }
            }
            if (i !== stuecke.length && !(i === 0 && stuecke.length === 1 && stuecke[0] === ""))
                throw new Error(`${stuecke.length} Stücke, ${i} benannt`);
            if (m.edits) {
                if (m.edits.ab === 0) W.edits = editsNeu();
                editsAnhaengen(W.edits, m.edits.ab, m.edits.xyzr, m.edits.modus);
            }
            const json = komponiere(W);
            const fest = await schreibeAtomar(m.welt, m.at, json);
            return { ok: true, at: m.at, bytes: json.length, edits: W.edits.n, platte: fest };
        } catch (e) {
            welten.delete(m.welt);
            throw e;
        }
    },
    // DIE ABLAGE einer ganzen Welt (die Tür, die Geburt, die Fusion): die Bytes, wie sie kamen. Ein Modell derselben Welt
    // fällt — der Haupt-Faden sendet sie bei der nächsten Sicherung ganz.
    async ablegen(m) {
        welten.delete(m.welt);
        return { ok: true, at: m.at, bytes: m.json.length, platte: await schreibeAtomar(m.welt, m.at, m.json) };
    },
    async loeschen(m) {
        welten.delete(m.welt);
        return { ok: true, platte: await loescheWelt(m.welt) };
    },
    // DAS ABBILD des Modells (der Welt-Wechsel legt es als Platz ab): die Bytes per Transfer, null ohne Modell.
    async abbild(m) {
        const W = welten.get(m.welt);
        return { ok: true, daten: W ? zuBytes(komponiere(W)) : null };
    },
    // Der save-server (localhost:4312) schreibt den ganzen Stand atomar (tmp + Rename + .bak) — die Bytes komponiert hier.
    async server(m) {
        const W = welten.get(m.welt);
        if (!W) return { ok: false, grund: "kein Modell der Welt im Faden" };
        const res = await fetch(m.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: '{"fileName":"anazhRealmState.json","state":' + komponiere(W) + "}",
        });
        if (!res.ok) return { ok: false, grund: `HTTP ${res.status}` };
        const r = await res.json();
        return { ok: true, pfad: r.path || null };
    },
    // Die Schranke: antwortet, wenn alles davor fest ist (die Ops laufen in EINER Reihe).
    async still() {
        return { ok: true };
    },
};

let reihe = Promise.resolve();
self.onmessage = (e) => {
    const m = e.data;
    reihe = reihe.then(async () => {
        let antwort;
        try {
            antwort = await OPS[m.op](m);
        } catch (err) {
            antwort = { ok: false, grund: String((err && err.message) || err) };
        }
        const P = await platte();
        antwort.n = m.n;
        antwort.op = m.op;
        if (!P.db) antwort.ohnePlatte = P.grund;
        self.postMessage(antwort, antwort.daten ? [antwort.daten] : []);
    });
};
