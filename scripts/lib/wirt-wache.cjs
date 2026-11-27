// wirt-wache.cjs — DIE WIRT-WACHE (w28-probe-wirt): eine Probe lässt nichts am Wirt stehen, ehe der Preis misst.
//
// Der Fund (w28-balken-speicher, vegetation.K4#1, Radeon): die Probe `proben` von diag-haus-welt legte ihren Lauscher über
// `r._hausHuelleSetzen` und ließ ihn stehen — er hielt ihren ganzen Kontext (`gebaut`, jedes ungebackene Haus des Gesetzbuchs), und
// der Preis-Lauf danach maß an derselben Pose 1 386 statt 522 MB Heap, p95 16,7 statt 8,7 ms. Der Preis einer Station soll das SPIEL
// messen, nie den Rest einer Probe. Die Klasse heißt: eine Probe lässt etwas am Wirt stehen — eine Methode über `r`, seinen
// Prototypen, `r.state` oder `window`, oder einen Abschluss, der ihren Kontext hält.
//
// DIE WACHE (in der Seite, `wirtWache`): beim ersten `nimm` einer Seite merkt sie sich jedes Funktions-Feld (Wert, Getter, Setter) von
// `r`, jedem Prototyp von `r` bis vor `Object.prototype`, `r.state` und `window` — das Gedächtnis der Seite. Jedes `gib` vergleicht mit
// ihm, nennt jede Abweichung beim Namen (`r._foo neu: function …`, `r.proto._m getauscht`, `window.__x neu`) und setzt sie zurück;
// eine Funktion, die ihre Absicht trägt (`fn.__wirtBleibt = "Grund"`: sie wirkt mit Willen bis zum Preis), steht als erklärt und bleibt.
// DIE MARKE (`/eval` der Werkbank zwischen `nimm` und `gib`): jeder Rumpf trägt eine Marke in seinem äußersten Kontext (`evalRumpf`,
// `__wirtMarke`); jeder Abschluss, den die Probe irgendwo stehen ließ, hält die Kette seiner Kontexte und damit die Marke. Nach der
// Rücknahme und dem Collector lebt eine Marke nur, wenn noch etwas den Kontext ihrer Probe hält — sie steht beim Kopf ihres Codes.
// DAS URTEIL (`wirtUrteil`, Leser: der Läufer der Punkte-Maschine vor dem Preis-Lauf): jede Abweichung beim Namen; lebt nach der
// Rücknahme eine Marke und hält der Heap mehr als WIRT_SCHWELLE_MB über dem Stand vor der Probe, ist der Preis UNGEMESSEN beim Grund —
// nie fail-soft. Der Zuwachs ohne lebende Marke ist die Welt, die die Probe baute; ihn misst der Preis mit Recht.
"use strict";

// DIE SCHWELLE (MB, Heap nach drei Collector-Läufen, nach der Rücknahme − vor der Probe): aus der Streuung an der Radeon (w28-probe-wirt):
// ein Leerlauf ohne Probe als erster nach dem Boot +23,0 bis +33,1 MB, danach +1,3 bis +1,8, dieselbe Pose zweimal +8,8, die Pose von
// vegetation.K4#1 nach der Rücknahme 548,9 gegen 522,6 MB am Kopf ohne Haken (+26,3) — die Schwelle steht beim Doppelten der größten
// Streuung; der Haken von main hielt am Preis +840 bis +1 500 MB
const WIRT_SCHWELLE_MB = 64;

// ── Seite ─────────────────────────────────────────────────────────────
// `gib` false: das Gedächtnis der Seite (einmal je Seite) → { glieder: [[name, n]] }; true: Vergleich, Rücknahme → { anders, wie,
// erklaert, bleibt }. W ist `window` (der Selbsttest gibt ein eigenes)
function wirtWache(r, gib, W) {
    const kurz = (f) => String(f).replace(/\s+/g, " ").slice(0, 80);
    const glieder = () => {
        const g = [["r", r]];
        if (r && r.state) g.push(["r.state", r.state]);
        let i = 0;
        for (let p = r && Object.getPrototypeOf(r); p && p !== Object.prototype; p = Object.getPrototypeOf(p)) g.push([i++ ? "r.proto" + i : "r.proto", p]);
        g.push(["window", W]);
        return g;
    };
    const fns = (o) => {
        const m = new Map();
        for (const k of Object.getOwnPropertyNames(o)) {
            let d = null;
            try {
                d = Object.getOwnPropertyDescriptor(o, k);
            } catch (_e) {
                continue;
            }
            if (d && (typeof d.value === "function" || d.get || d.set)) m.set(k, d);
        }
        return m;
    };
    // DIE DATENFELDER MIT EINFACHEM WERT (rauch-nan): macht eine Probe ein solches Feld zum Getter (die Bühne die Bild-Uhr `_bildZeit`,
    // `uhrHalten`; der Wetter-Spion `state.weather`), wird es zurück ein Datenfeld mit dem Wert, den es bei der Rücknahme liest — das,
    // was jeder Leser zuletzt sah (die Bild-Uhr der Bühne; das Wetter der Welt jetzt, nie das Wort beim ersten `nimm` der Seite). Bis
    // hier fiel das Feld weg, das erste Bild danach las `_bildZeit` undefined, und die Anker-Reihe der Böe trug NaN für immer (GTX 1060
    // am eef726c7, aufwaerts#1: Preis-Lauf 0 Bilder). Das Gedächtnis hält nur die NAMEN (Text): nichts aus dem Kontext einer Probe
    const daten = (o) => {
        const m = new Set();
        for (const k of Object.getOwnPropertyNames(o)) {
            let d = null;
            try {
                d = Object.getOwnPropertyDescriptor(o, k);
            } catch (_e) {
                continue;
            }
            if (d && "value" in d && (d.value === null || (typeof d.value !== "object" && typeof d.value !== "function"))) m.add(k);
        }
        return m;
    };
    const einfach = (x) => x === null || (typeof x !== "object" && typeof x !== "function");
    if (!gib) {
        if (!W.__wirtWache || W.__wirtWache.r !== r) W.__wirtWache = { r, glieder: glieder().map(([n, o]) => [n, o, fns(o), daten(o)]) };
        return { glieder: W.__wirtWache.glieder.map(([n, , m]) => [n, m.size]) };
    }
    const L = W.__wirtWache;
    if (!L || L.r !== r) return { fehler: "kein Gedächtnis der Seite (nimm fehlt)" };
    const gleich = (a, b) => a.value === b.value && a.get === b.get && a.set === b.set;
    const anders = [], wie = {}, erklaert = [], bleibt = [];
    // eine globale Deklaration (`function f() {}` im Skript der Seite, fahrzeug.medium#1: `window.wasserRund` …) ist nicht löschbar,
    // aber schreibbar: zurück heißt dann der alte Wert, ein neues Feld fällt auf `undefined` (es hält nichts und ruft niemand)
    const zurueck = (o, k, v, name) => {
        try {
            if (v) Object.defineProperty(o, k, v);
            else delete o[k];
        } catch (_e) {
            /* unten geprüft */
        }
        let d = Object.getOwnPropertyDescriptor(o, k);
        if (d && d.writable && !d.configurable && (v ? !gleich(d, v) && "value" in v : true)) {
            try {
                o[k] = v ? v.value : undefined;
            } catch (_e) {
                /* unten geprüft */
            }
            d = Object.getOwnPropertyDescriptor(o, k);
            if (!v) wie[name] += " (globale Deklaration, auf undefined)";
        }
        if (v ? !(d && gleich(d, v)) : d && (d.value !== undefined || d.get || d.set)) bleibt.push(name);
    };
    for (const [n, o, vor, wert] of L.glieder) {
        const jetzt = fns(o);
        for (const [k, d] of jetzt) {
            let v = vor.get(k);
            if (v && gleich(v, d)) continue;
            const name = n + "." + k;
            const f = d.value || d.get || d.set;
            if (typeof f.__wirtBleibt === "string" && f.__wirtBleibt) {
                erklaert.push(name + " (" + f.__wirtBleibt + ")");
                continue;
            }
            anders.push(name);
            if (!v && wert && wert.has(k) && d.get) {
                // das Datenfeld, das die Probe zum Getter machte: sein Wert jetzt (ein Wurf oder ein Gegenstand bleibt beim Namen stehen)
                let x;
                try {
                    x = d.get.call(o);
                } catch (e) {
                    x = { wurf: e };
                }
                if (einfach(x)) v = { value: x, writable: true, enumerable: d.enumerable, configurable: true };
                wie[name] = "getauscht: " + kurz(f) + (v ? " → der Wert " + String(x).slice(0, 40) : " → kein einfacher Wert");
                if (!v) {
                    bleibt.push(name);
                    continue;
                }
            } else wie[name] = (v ? "getauscht: " : "neu: ") + kurz(f);
            zurueck(o, k, v, name);
        }
        for (const [k, v] of vor)
            if (!jetzt.has(k)) {
                const name = n + "." + k;
                anders.push(name);
                wie[name] = "fehlt";
                zurueck(o, k, v, name);
            }
    }
    return { anders, wie, erklaert, bleibt };
}
const wirtCode = (gib) => "return (" + wirtWache + ")(r, " + !!gib + ", window);";

// DER RUMPF EINES /eval (die Werkbank und der Selbsttest teilen ihn): die Marke sitzt im äußersten Kontext, jeder Abschluss darin hält sie.
// Der Code endet auf einer eigenen Zeile (ein Text, der mit einem Zeilen-Kommentar schließt, nimmt das Ende des Rahmens nicht mehr mit);
// `url` (w28-seiten-stille, `werkbank/eval/<Name>.js`) gibt dem Text seinen Namen in jedem Stapel statt „(ohne Datei)"
const evalRumpf = (code, url) => "return (async () => { void __wirtMarke; " + code + "\n})();" + (url ? "\n//# sourceURL=" + url : "");
// die Marke eines Rumpfs (in der Seite, W = window; `code` der Code des /eval): ein Objekt, das nur der Kontext des Rumpfs hält — seine
// WeakRef im Buch der Wache
function wirtMarke(W, code) {
    const m = { kopf: String(code).slice(0, 120).replace(/\s+/g, " ") };
    (W.__wirtMarken = W.__wirtMarken || []).push({ ref: new WeakRef(m), kopf: m.kopf });
    return m;
}
// nach dem Collector: die Marken, die noch leben (ihr Kopf), das Buch fällt
function markenLies(W) {
    const L = W.__wirtMarken || [];
    delete W.__wirtMarken;
    return L.filter((x) => x.ref.deref()).map((x) => x.kopf);
}

// ── Urteil (node) ─────────────────────────────────────────────────────
// ab: Rückgabe von `wirtWache(gib)`, haelt: lebende Marken, heapVor/heapNach: MB nach dem Collector → { anders, wie, erklaert, haelt,
// heapVor, heapNach, deltaMB, ungemessen: Grund | null, zeile }
function wirtUrteil({ ab = {}, haelt = [], heapVor = null, heapNach = null, schwelle = WIRT_SCHWELLE_MB } = {}) {
    const anders = ab.anders || [], wie = ab.wie || {};
    const deltaMB = Number.isFinite(heapVor) && Number.isFinite(heapNach) ? +(heapNach - heapVor).toFixed(1) : null;
    const gruende = [];
    if (ab.fehler) gruende.push("die Wache blind: " + ab.fehler);
    if ((ab.bleibt || []).length) gruende.push("nicht zurück: " + ab.bleibt.join(", "));
    // der Heap-Zuwachs allein ist die Welt (eine Probe baut, stellt um, lädt eine andere Pose — vegetation.K4#1: +309,8 MB nach der
    // Rücknahme, gleich dem Kopf ohne Haken); was die PROBE hält, sagt die Marke — lebt eine, ist der Zuwachs ihre obere Schranke
    if (haelt.length && !(deltaMB != null && deltaMB <= schwelle))
        gruende.push("den Kontext der Probe hält noch: " + haelt.slice(0, 3).join(" | ") +
            (deltaMB != null ? " — Heap nach der Rücknahme " + heapVor + " → " + heapNach + " MB (+" + deltaMB + " > " + schwelle + ")" : " — Heap ungemessen"));
    const zeile = (anders.length ? "die Probe ließ stehen: " + anders.map((k) => k + " (" + wie[k] + ")").join(" · ") : "nichts am Wirt") +
        (haelt.length ? " · Kontext gehalten: " + haelt.length : "") +
        (deltaMB != null ? " · Heap " + heapVor + " → " + heapNach + " MB (" + (deltaMB >= 0 ? "+" : "") + deltaMB + ")" : "");
    return { anders, wie, erklaert: ab.erklaert || [], haelt, heapVor, heapNach, deltaMB, ungemessen: gruende.length ? gruende.join(" · ") : null, zeile };
}

// ── Selbsttest (ohne Welt) ─────────────────────────────────────────────
// die Wache und die Marke an einem erfundenen Wirt: der grüne Lauf nennt nichts; jede Mutante — der Haken von diag-haus-welt vor
// w28-balken-speicher (er hält `gebaut`), ein getauschtes eigenes Feld, ein Prototyp, `r.state`, ein neues `window`-Feld, ein Abschluss
// in einem Datenfeld, ein Heap über der Schwelle — steht beim Namen; die erklärte Absicht bleibt und steht als erklärt
async function wirtSelbsttest() {
    const v8 = require("v8"), vm = require("vm");
    v8.setFlagsFromString("--expose-gc");
    const gc = vm.runInNewContext("gc");
    const fehler = [];
    const pruef = (name, ok, was) => {
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${name}": ${was}`);
        if (!ok) fehler.push(name);
    };
    class Welt {
        _hausHuelleSetzen(en) {
            return en;
        }
        _gameLoopTick() {
            return 1;
        }
    }
    const neu = () => {
        const r = new Welt();
        r.state = { tick() {} };
        r._eigen = function () {};
        r._bildZeit = 46; // die Bild-Uhr der Welt: ein Datenfeld mit Zahl
        const W = { r, gross: null };
        return { r, W };
    };
    // die Probe läuft wie in der Werkbank: der Rumpf mit Marke zwischen nimm und gib
    const fahre = async (probe, ohneGib, wache = wirtWache) => {
        const { r, W } = neu();
        wache(r, false, W);
        await new Function("r", "W", "__wirtMarke", evalRumpf(probe))(r, W, wirtMarke(W, probe));
        const ab = ohneGib ? { anders: [] } : wache(r, true, W);
        await require("timers/promises").setImmediate();
        gc();
        gc();
        return { r, W, ab, haelt: markenLies(W) };
    };
    const g = await fahre("const x = [1, 2, 3]; return x.length;");
    pruef("der grüne Lauf", !g.ab.anders.length && !g.haelt.length && !wirtUrteil({ ab: g.ab, heapVor: 500, heapNach: 510 }).ungemessen, "nichts genannt");
    // die Mutante von main (diag-haus-welt vor w28-balken-speicher): der Lauscher über _hausHuelleSetzen hält `gebaut`
    const HAKEN_MAIN = "const gebaut = new Map([[1, new Array(1e5).fill(7)]]); const hs = r._hausHuelleSetzen; " +
        "r._hausHuelleSetzen = function (en, hu) { if (gebaut.size) en.__w9Plan = 1; return hs.call(this, en, hu); }; return 1;";
    // ohne Rücknahme lebt die Marke: sie sieht den Haken, der den Kontext hält (sonst wäre jede freie Marke unten vakuös)
    const ohne = await fahre(HAKEN_MAIN, true);
    pruef("Mutante ohne Rücknahme: die Marke sieht den Haken", ohne.haelt.length === 1 && /_hausHuelleSetzen/.test(ohne.haelt[0]), "lebt: " + ohne.haelt.length);
    const haken = await fahre(HAKEN_MAIN);
    pruef("Mutante der Haken der Hülle (main vor w28-balken-speicher)",
        haken.ab.anders.includes("r._hausHuelleSetzen") && /neu: function/.test(haken.ab.wie["r._hausHuelleSetzen"]) &&
            !Object.prototype.hasOwnProperty.call(haken.r, "_hausHuelleSetzen") && !haken.haelt.length,
        "beim Namen " + haken.ab.anders.join(", ") + ", zurück auf den Prototyp, der Kontext frei (" + haken.haelt.length + " Marken leben)");
    const tausch = await fahre("const alt = r._eigen; r._eigen = () => alt; return 1;");
    pruef("Mutante ein eigenes Feld getauscht", tausch.ab.anders.includes("r._eigen") && /getauscht/.test(tausch.ab.wie["r._eigen"]) && !/alt/.test(String(tausch.r._eigen)),
        tausch.ab.anders.join(", "));
    const proto = await fahre("const P = Object.getPrototypeOf(r); const t = P._gameLoopTick; P._gameLoopTick = function () { return t.call(this) + 1; }; return 1;");
    pruef("Mutante der Prototyp getauscht", proto.ab.anders.includes("r.proto._gameLoopTick") && proto.r._gameLoopTick() === 1, proto.ab.anders.join(", "));
    // die Bühne macht die Bild-Uhr zum Getter (`uhrHalten`, aufwaerts#1 an der GTX 1060 am eef726c7): zurück heißt ein Datenfeld mit
    // der Zahl, die es bei der Rücknahme liest (12,5 s, das letzte Bild der Probe), nie ein gelöschtes Feld (dort las das erste Bild
    // `_bildZeit` undefined, die Anker-Reihe der Böe trug NaN für immer) — und der Kontext der Probe ist frei
    const UHR = "const S = { T: 12.5 }; Object.defineProperty(r, '_bildZeit', { configurable: true, enumerable: true, get: () => S.T, set: () => {} }); return 1;";
    const uhr = await fahre(UHR);
    const du = Object.getOwnPropertyDescriptor(uhr.r, "_bildZeit");
    pruef("Mutante die Bild-Uhr als Getter der Bühne", uhr.ab.anders.includes("r._bildZeit") && !uhr.ab.bleibt.length && du && du.value === 12.5 && du.writable && !du.get && !uhr.haelt.length,
        (uhr.ab.wie["r._bildZeit"] || "nicht genannt") + " → r._bildZeit " + (du ? (du.get ? "Getter" : du.value) : "gelöscht") + ", " + uhr.haelt.length + " Marken leben");
    // die Wache selbst hält die Funktion der Probe (Beweis-Lauf rauch-nan Kopf 1 an der Radeon: der Verdacht „die Wache hält sie in
    // ihrem Gedächtnis“): ihr Gedächtnis darf nur Text tragen — eine Wache, die den Getter der Probe aufhebt, hält die Marke am Leben
    const HALTER = "zurueck(o, k, v, name);\n        }";
    const quelle = String(wirtWache);
    const boese = quelle.includes(HALTER) ? new Function("return (" + quelle.replace(HALTER, "(L.halt = L.halt || []).push(d); " + HALTER) + ")")() : null;
    const gehalten = boese ? await fahre(UHR, false, boese) : { haelt: [] };
    pruef("Mutante die Wache hält die Funktion der Probe", !!boese && gehalten.haelt.length === 1 && !uhr.haelt.length,
        boese ? "die Marke lebt: " + gehalten.haelt.length + " (die echte Wache: " + uhr.haelt.length + ")" : "die Rücknahme `" + HALTER.split("\n")[0] + "` fehlt in der Quelle");
    const zustand = await fahre("r.state.tick = () => 0; r.state.neu = () => 0; return 1;");
    pruef("Mutante r.state", zustand.ab.anders.includes("r.state.tick") && zustand.ab.anders.includes("r.state.neu") && !("neu" in zustand.r.state), zustand.ab.anders.join(", "));
    const fenster = await fahre("W.__halten = (q) => q; return 1;");
    pruef("Mutante window", fenster.ab.anders.includes("window.__halten") && !("__halten" in fenster.W), fenster.ab.anders.join(", "));
    // eine globale Deklaration (nicht löschbar, schreibbar — fahrzeug.medium#1 an der Radeon): sie fällt auf undefined, nie „nicht zurück“
    const dekl = await fahre("Object.defineProperty(W, 'wasserRund', { value: () => 1, writable: true, enumerable: true, configurable: false }); return 1;");
    pruef("Mutante globale Deklaration", dekl.ab.anders.includes("window.wasserRund") && !dekl.ab.bleibt.length && dekl.W.wasserRund === undefined,
        dekl.ab.wie["window.wasserRund"] + " · bleibt " + dekl.ab.bleibt.length);
    const erkl = await fahre("const hs = r._hausHuelleSetzen; const f = function (en) { return hs.call(this, en); }; f.__wirtBleibt = 'der Preis misst mit dem Haken'; r._hausHuelleSetzen = f; return 1;");
    pruef("erklärte Absicht bleibt", !erkl.ab.anders.length && erkl.ab.erklaert.length === 1 && Object.prototype.hasOwnProperty.call(erkl.r, "_hausHuelleSetzen"),
        "erklärt: " + erkl.ab.erklaert.join(", "));
    // ein Abschluss in einem Datenfeld (kein Funktions-Feld): die Wache sieht ihn nicht, die Marke lebt — mit Heap über der Schwelle UNGEMESSEN
    const daten = await fahre("const gebaut = new Array(1e5).fill(1); W.gross = { f: () => gebaut.length }; return 1;");
    const u = wirtUrteil({ ab: daten.ab, haelt: daten.haelt, heapVor: 522.6, heapNach: 1386.3 });
    pruef("Mutante ein Abschluss im Datenfeld hält den Kontext", daten.haelt.length === 1 && /W\.gross/.test(daten.haelt[0]) && /hält noch: .*\+863\.7 > 64/.test(u.ungemessen || ""),
        "lebt: " + daten.haelt.join(" | ") + " → " + u.ungemessen);
    pruef("Mutante Kontext gehalten, Heap ungemessen", /Heap ungemessen/.test(wirtUrteil({ ab: daten.ab, haelt: daten.haelt }).ungemessen || ""), "UNGEMESSEN");
    pruef("gehaltener Kontext unter der Schwelle gemessen", !wirtUrteil({ ab: g.ab, haelt: ["x"], heapVor: 522.6, heapNach: 531.4 }).ungemessen, "+8,8 MB");
    // die Welt wächst, die Probe hält nichts (vegetation.K4#1 an der Radeon, w28-probe-wirt: 239,1 → 548,9 MB, keine Marke lebt): gemessen
    pruef("die Welt wächst ohne gehaltenen Kontext", !wirtUrteil({ ab: haken.ab, haelt: [], heapVor: 239.1, heapNach: 548.9 }).ungemessen, "+309,8 MB ist die Welt");
    pruef("Mutante die Wache blind", /blind/.test(wirtUrteil({ ab: wirtWache(new Welt(), true, {}) }).ungemessen || ""), "ohne nimm UNGEMESSEN");
    return fehler;
}

module.exports = { WIRT_SCHWELLE_MB, wirtWache, wirtCode, evalRumpf, wirtMarke, markenLies, wirtUrteil, wirtSelbsttest };
