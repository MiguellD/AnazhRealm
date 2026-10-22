// =============================================================================
// speicher-worker.js — DER SPEICHER-FADEN (Karte speicher-journal; Lehre 24: die Platte im Worker, über den Kanal per
// Transfer). Der Haupt-Faden meldet je Save nur die ÄNDERUNG: den Kopf (den Snapshot ohne die vier Domänen) und das
// Journal der Domänen — Edits (`worldMeta.voxelEdits`, angehängt), Bauten (`architectures`, je Schlüssel gesetzt oder
// gefallen), Leib und Inventar (Register: ihr neuer Wert, wenn er sich änderte). Dieser Faden hält das Abbild jeder Welt,
// verdichtet und schreibt ATOMAR in IndexedDB (Datenbank „anazhRealm", Store „worlds"):
//   <id>        das Abbild {at, json, schluessel} — die Bytes des vollen Snapshots, `schluessel` die Bau-Schlüssel in Ordnung
//   <id>.bak    der ganze Stand vor dem letzten Abbild des Haupt-Fadens (ein Stand zurück)
//   <id>.k      Kopf + Register des jüngsten Saves {at, n, felder, kopf, register}
//   <id>.j<n>   das Journal eines Saves {edits, bauten}
// EINE Transaktion je Save (.k + .j<n>), je Abbild (<id> + .bak, .k und .j fallen) und je Verdichtung (<id>, .k und .j
// fallen): ein Tod mitten darin lässt den letzten guten Stand ganz. LADEN = Abbild + Kopf + Journal durch `komponiere` —
// dieselbe Funktion, die verdichtet: es sind die Bytes des vollen Snapshots, den der Haupt-Faden beim letzten Save hielt
// (gate:persistence J). Ohne Platte (der null-origin der inneren Welt, AnazhRealm IN AnazhRealm) trägt das Gedächtnis
// dieses Fadens — die Welt lebt ephemer wie hinter dem localStorage-Schatten des Kerns; die Seite sagt es (`platte`).
// =============================================================================
"use strict";

const STORE = "worlds";
const welten = new Map(); // id → das Abbild im Faden (`grundAus`), gesetzt vom Abbild des Haupt-Fadens
let platteP = null;

function platte() {
    if (platteP) return platteP;
    platteP = new Promise((ok) => {
        const ohne = (grund) => ok({ mem: new Map(), grund: String(grund) });
        try {
            const req = indexedDB.open("anazhRealm", 1);
            req.onupgradeneeded = () => {
                if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
            };
            req.onsuccess = () => ok({ db: req.result });
            req.onerror = () => ohne((req.error && req.error.message) || "IndexedDB öffnet nicht");
            req.onblocked = () => ohne("IndexedDB blockiert");
        } catch (e) {
            ohne((e && e.message) || e);
        }
    });
    return platteP;
}

const journalVon = (id) => [id + ".j", id + ".j￿"];
const pad = (n) => String(n).padStart(10, "0");
const eigen = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// EINE Transaktion: puts [[k, v]], dels [k], bereich [von, bis] (gelöscht) — löst erst, wenn sie fest ist.
async function schreibe(puts, dels = [], bereich = null) {
    const P = await platte();
    if (P.mem) {
        if (bereich) for (const k of [...P.mem.keys()]) if (k >= bereich[0] && k <= bereich[1]) P.mem.delete(k);
        for (const k of dels) P.mem.delete(k);
        for (const [k, v] of puts) P.mem.set(k, v);
        return;
    }
    await new Promise((ok, nein) => {
        const tx = P.db.transaction(STORE, "readwrite");
        const st = tx.objectStore(STORE);
        if (bereich) st.delete(IDBKeyRange.bound(bereich[0], bereich[1]));
        for (const k of dels) st.delete(k);
        for (const [k, v] of puts) st.put(v, k);
        tx.oncomplete = () => ok();
        tx.onerror = () => nein(tx.error || new Error("Transaktion fehlgeschlagen"));
        tx.onabort = () => nein(tx.error || new Error("Transaktion abgebrochen"));
    });
}

// Alles einer Welt in EINER Lese-Transaktion: Abbild, .bak, Kopf, Journal (in der Ordnung der Saves).
async function liesWelt(id) {
    const P = await platte();
    const [a, b] = journalVon(id);
    if (P.mem) {
        const j = [...P.mem.keys()]
            .filter((k) => k >= a && k <= b)
            .sort()
            .map((k) => P.mem.get(k));
        return { img: P.mem.get(id), bak: P.mem.get(id + ".bak"), k: P.mem.get(id + ".k"), j };
    }
    return new Promise((ok, nein) => {
        const tx = P.db.transaction(STORE, "readonly");
        const st = tx.objectStore(STORE);
        const out = {};
        st.get(id).onsuccess = (e) => (out.img = e.target.result);
        st.get(id + ".bak").onsuccess = (e) => (out.bak = e.target.result);
        st.get(id + ".k").onsuccess = (e) => (out.k = e.target.result);
        st.getAll(IDBKeyRange.bound(a, b)).onsuccess = (e) => (out.j = e.target.result);
        tx.oncomplete = () => ok(out);
        tx.onerror = () => nein(tx.error || new Error("Lesen fehlgeschlagen"));
    });
}

// Das Abbild im Faden aus einem vollen Snapshot: die Domänen heraus (Bauten je Schlüssel, Edits, Register), der Kopf trägt
// an ihrer Stelle die Marke 0 — `komponiere` setzt sie zurück, wo sie standen.
function grundAus(s, schluessel, felder) {
    const archs = Array.isArray(s.architectures) ? s.architectures : [];
    const keys =
        Array.isArray(schluessel) && schluessel.length === archs.length ? schluessel : archs.map((_, i) => -1 - i);
    const W = { felder: felder || {}, register: {}, registerJson: {}, kopf: s, bauten: new Map(), edits: null };
    keys.forEach((k, i) => W.bauten.set(k, archs[i]));
    if (eigen(s, "architectures")) s.architectures = 0;
    if (s.worldMeta && Array.isArray(s.worldMeta.voxelEdits)) {
        W.edits = s.worldMeta.voxelEdits;
        s.worldMeta.voxelEdits = 0;
    }
    for (const d in W.felder) {
        const r = {};
        for (const k of W.felder[d]) if (eigen(s, k)) r[k] = s[k];
        W.register[d] = r;
        W.registerJson[d] = JSON.stringify(r);
    }
    return W;
}

// Ein Journal-Stück auf das Abbild (Edits angehängt, Bauten je Schlüssel gesetzt oder gefallen).
function wende(W, edits, bauten) {
    if (edits && edits.length) {
        if (!W.edits) W.edits = [];
        for (const e of edits) W.edits.push(e);
    }
    if (bauten) for (const [k, v] of bauten) v === null ? W.bauten.delete(k) : W.bauten.set(k, v);
}

// DIE EINE KOMPOSITION (Verdichtung, Laden, save-server): der Kopf mit den Domänen an ihren Stellen — die Bytes des vollen
// Snapshots. Ein Register-Feld, das der Leib nicht trägt (undefined im Snapshot), fällt wie im JSON des Snapshots.
function komponiere(W) {
    const s = { ...W.kopf };
    for (const d in W.felder) {
        const r = W.register[d] || {};
        for (const k of W.felder[d]) eigen(r, k) ? (s[k] = r[k]) : delete s[k];
    }
    if (s.architectures === 0) s.architectures = [...W.bauten.values()];
    if (s.worldMeta && s.worldMeta.voxelEdits === 0) s.worldMeta = { ...s.worldMeta, voxelEdits: W.edits || [] };
    return JSON.stringify(s);
}

// DIE RETTUNGS-KETTE DER PLATTE: (1) das Abbild mit Kopf und Journal, (2) sonst der .bak (ein Stand zurück). Der Befund
// nennt jedes Glied; ein korruptes Journal-Stück beendet das Journal laut (bis dorthin gilt es).
async function ladeVonPlatte(id) {
    const { img, bak, k, j } = await liesWelt(id);
    const befund = [];
    if (img && typeof img.json === "string") {
        let s = null;
        try {
            s = JSON.parse(img.json);
            if (!s || typeof s !== "object") befund.push("Platte unlesbar");
        } catch (e) {
            befund.push(`Platte korrupt (${e.message})`);
        }
        if (s && typeof s === "object") {
            if (!k) return { json: img.json, at: img.at, quelle: "Platte", befund };
            const W = grundAus(s, img.schluessel, k.felder);
            try {
                W.kopf = JSON.parse(k.kopf);
                for (const d in k.register || {}) W.register[d] = JSON.parse((W.registerJson[d] = k.register[d]));
            } catch (e) {
                befund.push(`Kopf korrupt (${e.message})`);
            }
            for (let i = 0; i < (j || []).length; i++) {
                try {
                    wende(W, j[i].edits ? JSON.parse(j[i].edits) : null, j[i].bauten ? JSON.parse(j[i].bauten) : null);
                } catch (e) {
                    befund.push(`Journal ab Stück ${i + 1} von ${j.length} korrupt (${e.message})`);
                    break;
                }
            }
            return { json: komponiere(W), at: k.at, quelle: "Platte", befund };
        }
    } else befund.push("Platte leer");
    if (bak && typeof bak.json === "string") {
        try {
            JSON.parse(bak.json);
            return { json: bak.json, at: bak.at, quelle: ".bak (ein Stand zurück)", befund };
        } catch (e) {
            befund.push(`.bak korrupt (${e.message})`);
        }
    } else befund.push(".bak leer");
    return { json: null, at: 0, quelle: null, befund };
}

// Der ganze Stand einer Welt jetzt (das Abbild im Faden, sonst die Platte).
async function stand(id) {
    const W = welten.get(id);
    if (W) return { json: komponiere(W), at: W.at };
    const p = await ladeVonPlatte(id);
    return p.json ? p : null;
}

// Ein neues Abbild ganz (Abbild des Haupt-Fadens, Ablage einer Welt): der Stand davor wird der .bak, Kopf und Journal fallen.
async function legeAb(id, json, at, schluessel) {
    const vor = await stand(id);
    const puts = [[id, schluessel ? { at, json, schluessel } : { at, json }]];
    if (vor) puts.push([id + ".bak", { at: vor.at, json: vor.json }]);
    await schreibe(puts, [id + ".k"], journalVon(id));
}

const zuBytes = (text) => {
    const b = new TextEncoder().encode(text);
    return b.buffer;
};

const OPS = {
    // DAS ABBILD des Haupt-Fadens (Boot, Weltgrenze, neuer Faden): die Bytes, wie sie kamen, und das Abbild im Faden.
    async abbild(m) {
        welten.delete(m.id);
        const W = grundAus(JSON.parse(m.json), m.schluessel, m.felder);
        if (W.bauten.size !== m.schluessel.length) throw new Error("die Bau-Schlüssel decken die Bauten nicht");
        await legeAb(m.id, m.json, m.at, m.schluessel);
        Object.assign(W, {
            grund: m.grund,
            at: m.at,
            imgBytes: m.json.length,
            jBytes: 0,
            verdichtenAb: m.verdichtenAb,
        });
        welten.set(m.id, W);
        return { ok: true, at: m.at, bytes: m.json.length };
    },
    // DIE SICHERUNG eines Saves: Kopf + Register + Journal auf das Abbild, EINE Transaktion; das Journal verdichtet, sobald
    // es das Abbild überwiegt.
    async sichern(m) {
        const W = welten.get(m.id);
        if (!W || W.grund !== m.grund)
            return { ok: false, grund: "kein Abbild im Faden (der Haupt-Faden sendet es neu)" };
        try {
            W.kopf = JSON.parse(m.kopf);
            for (const d in m.register) W.register[d] = JSON.parse((W.registerJson[d] = m.register[d]));
            wende(W, m.edits ? JSON.parse(m.edits) : null, m.bauten ? JSON.parse(m.bauten) : null);
            const puts = [
                [m.id + ".k", { at: m.at, n: m.n, felder: W.felder, kopf: m.kopf, register: W.registerJson }],
            ];
            if (m.edits || m.bauten) {
                puts.push([m.id + ".j" + pad(m.n), { edits: m.edits, bauten: m.bauten }]);
                W.jBytes += (m.edits || "").length + (m.bauten || "").length;
            }
            await schreibe(puts);
            W.at = m.at;
            // DIE VERDICHTUNG: überwiegt das Journal das Abbild (mindestens `verdichtenAb` des Haupt-Fadens), wird es Abbild
            if (W.jBytes > Math.max(W.verdichtenAb, W.imgBytes)) {
                const json = komponiere(W);
                await schreibe(
                    [[m.id, { at: m.at, json, schluessel: [...W.bauten.keys()] }]],
                    [m.id + ".k"],
                    journalVon(m.id)
                );
                Object.assign(W, { imgBytes: json.length, jBytes: 0 });
            }
        } catch (e) {
            welten.delete(m.id); // das Abbild im Faden ist nicht mehr das der Platte: der Haupt-Faden sendet es neu
            throw e;
        }
        return { ok: true, at: m.at, bytes: m.kopf.length + (m.edits || "").length + (m.bauten || "").length };
    },
    // DIE ABLAGE einer ganzen Welt (Tür, Geburt, Fusion, Umzug) unter ihrer Id, mit Probe: die Platte trägt danach genau
    // diese Bytes. `nurNeuer` (der Umzug des alten Spiegels): nur, wenn die Platte keinen lesbaren jüngeren Stand trägt.
    async ablegen(m) {
        if (m.nurNeuer) {
            const p = await ladeVonPlatte(m.id);
            if (p.json && p.quelle === "Platte" && p.at >= m.at) return { ok: true, uebernommen: false };
        }
        welten.delete(m.id);
        await legeAb(m.id, m.json, m.at, null);
        const { img } = await liesWelt(m.id);
        if (!img || img.json !== m.json) return { ok: false, grund: "die Platte trägt andere Bytes" };
        return { ok: true, uebernommen: true };
    },
    // DAS LESEN einer Welt durch die Rettungs-Kette — die Bytes per Transfer; `bestand` dazu die Ids der Platte.
    async lesen(m) {
        const P = await platte();
        const out = { ok: true, platte: !P.mem, grund: P.grund || null };
        if (m.id) {
            const p = await ladeVonPlatte(m.id);
            Object.assign(out, {
                quelle: p.quelle,
                befund: p.befund,
                at: p.at,
                daten: p.json ? zuBytes(p.json) : null,
            });
        }
        if (m.bestand) {
            const keys = P.mem
                ? [...P.mem.keys()]
                : await new Promise((ok, nein) => {
                      const req = P.db.transaction(STORE, "readonly").objectStore(STORE).getAllKeys();
                      req.onsuccess = () => ok(req.result);
                      req.onerror = () => nein(req.error);
                  });
            out.bestand = keys.filter((k) => typeof k === "string" && !/\.(bak|k|j\d{10})$/.test(k));
        }
        return out;
    },
    async loeschen(m) {
        welten.delete(m.id);
        await schreibe([], [m.id, m.id + ".bak", m.id + ".k"], journalVon(m.id));
        return { ok: true };
    },
    // Der save-server (localhost:4312) schreibt den ganzen Stand atomar (tmp + Rename + .bak) — die Bytes komponiert hier.
    async server(m) {
        const s = await stand(m.id);
        if (!s) return { ok: false, grund: "kein Stand" };
        const res = await fetch(m.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: '{"fileName":"anazhRealmState.json","state":' + s.json + "}",
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
        antwort.n = m.n;
        self.postMessage(antwort, antwort.daten ? [antwort.daten] : []);
    });
};
