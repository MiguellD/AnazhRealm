// richter-akte.cjs — die Mess-Sitzung schreibt die Richter-Akten der Meisterkarte 2 selbst (Form: vision/buche-2.cjs, Kopf).
//
// Gerufen von meisterkarte-quelle/punkte/punkte.cjs (fahreSitzung) nach jeder Probe: kein zweiter Mess-Pfad — Messwert und Urteil
// sind die der Station, der Preis ist der Schnitt des Stroms DERSELBEN Sitzung (strom.ndjson, stromLesen) über genau das Fenster der
// Probe: die Bilder, die die Sitzung unter ihrem Namen zapfte UND deren Wanduhr zwischen Beginn und Ende der Probe liegt. Fehlt der
// Strom im Fenster (weniger als MIN_BILDER Bilder), entsteht KEINE Akte — nie ein Preis aus fremder Zeit.
//
//   akten({ station, eintrag, bilder, von, bis, sha, geraet, karte, tafel, referenz, posten }) → [{ datei, akte } | { kein: true, sprosse, grund }]
//
// DIE LAST AM PREIS (der Schöpfer 11.11.: nie Ruhe erzwingen, Messung relativ). Die Sitzung fährt vor und nach dem Preis-Lauf die
// Referenzfahrt der Punkte-Maschine (punkte.cjs referenzFahrt · referenzBericht, Umfeld „sitzung“ — kein zweiter Messer); ihr Bericht
// steht in preis.referenz. Das Urteil spricht buche-2 (preisUrteil · lastVon): eine Zeit-Zahl über dem Soll ist nur ROT, wenn die
// Referenz im Band der Ruhe lag, sonst „UNGEMESSEN unter Last ×f“; Heap und VRAM urteilen wie gemessen. Die Akte trägt das Urteil
// (preis.urteil), buche-2 rechnet es nach. DIE POSTEN (preis.posten): nach dem Preis-Lauf, an derselben Pose, VRAM je Erzeuger und
// Heap nach erzwungenem GC (werkbank /puffer, derselbe Zensus wie die Band-Wand) und die Typed-Array-Halter des Heaps (__heapHalter).
//   schreibe(o) — dasselbe, schreibt jede Akte nach vision/richter/<leiter>.<sprosse>.<sha8>-<gerät>.json, gibt die Zeilen fürs Log
//   node vision/richter-akte.cjs --selbsttest
"use strict";
const fs = require("fs");
const path = require("path");
const buche = require("./buche-2.cjs");

const TAFEL = path.join(__dirname, "richter-tafel.json");
const KARTE = path.join(__dirname, "meisterkarte-2.json");
const AKTEN = path.join(__dirname, "richter");
const GERAET = { radeon: "Radeon 890M", gtx: "GTX 1060" }; // Z7, Stand 2026 — die Namen, die buche-2 als Standardgeräte erkennt
const MIN_BILDER = 30;
// DER PREIS-LAUF (14.11., Radeon 337846dc: vegetation.K2#1 GRÜN, im Strom 0 Bilder): die Werkbank ruht den Loop zwischen ihren Befehlen
// (Lehre 17), und eine Probe, die ihre Bilder von Hand tickt, zeigt kein Bild des Spielers — der Haken des Stroms sieht nur, was der
// Loop des Spiels zeigt. Darum fährt die Sitzung nach jeder Probe, der die Tafel eine Sprosse gibt, noch im Fenster der Probe, unter
// ihrem Namen und an ihrer Pose den Loop des Spiels (`/lauf` der Werkbank) PREIS_S Sekunden: das ist der Preis derselben Fahrt.
const PREIS_S = 20;
const brauchtPreisLauf = (station, tafel) =>
    (tafel || JSON.parse(fs.readFileSync(TAFEL, "utf8"))).zeilen.some((z) => z.station === station && z.richter === "gleich");

// dasselbe p95 wie der Kopf des Stroms (punkte.cjs p95Von): Rang floor(0,95 · n) der sortierten Werte
const p95 = (a) => {
    const s = a.filter(Number.isFinite).sort((x, y) => x - y);
    return s.length ? s[Math.min(s.length - 1, Math.floor(0.95 * s.length))] : null;
};
const maxVon = (a) => {
    const s = a.filter((x) => Number.isFinite(x) && x >= 0);
    return s.length ? Math.max(...s) : null;
};

// der Preis einer Probe aus den Bildern des Stroms (stromLesen(...).bilder): null, wenn das Fenster leer ist
function preisImFenster(bilder, station, von, bis) {
    const im = bilder.filter((b) => b.probe === station && b.wand >= von && b.wand <= bis);
    const dt = im.filter((b) => b.dt >= 0).map((b) => b.dt);
    if (dt.length < MIN_BILDER) return { leer: true, bilder: dt.length };
    const preis = { bild_p95_ms: p95(dt), bild_max_ms: maxVon(dt) };
    const heap = maxVon(im.map((b) => b.heap)),
        vram = maxVon(im.map((b) => b.vram));
    if (heap != null) preis.heap_mb = heap; // fehlt er, fehlt die Zahl — buche-2 zählt das als fehlenden Preis (R3), nie geschätzt
    if (vram != null) preis.vram_mb = vram;
    preis.bilder = dt.length;
    preis.fenster = { von: new Date(von).toISOString(), bis: new Date(bis).toISOString() };
    preis.quelle = "Loop des Spiels an der Pose der Probe, im Fenster der Probe (Preis-Lauf " + PREIS_S + " s)";
    return preis;
}
// der Bericht der Referenz in der Akte: die Zahlen, die buche-2 urteilt, und die, die sie belegen
function referenzFuerAkte(r) {
    if (!r || typeof r !== "object") return { fehler: "die Sitzung fuhr keine Referenz um den Preis-Lauf" };
    if (r.fehler) return { fehler: String(r.fehler).slice(0, 160) };
    const zwei = (x) => (x ? { ein: x.ein, alle: x.alle } : null);
    return { f: r.f, fEin: r.fEin, fAlle: r.fAlle, vor: zwei(r.vor), nach: zwei(r.nach), ruhe: r.ruhe ? { ein: r.ruhe.ein, alle: r.ruhe.alle, n: r.ruhe.n, von: r.ruhe.von } : null,
        umfeld: r.umfeld, rechner: r.rechner };
}

function akten(o) {
    const tafel = o.tafel || JSON.parse(fs.readFileSync(TAFEL, "utf8"));
    const zeilen = tafel.zeilen.filter((z) => z.station === o.station);
    if (!zeilen.length) return [];
    const karte = o.karte || JSON.parse(fs.readFileSync(KARTE, "utf8"));
    const geraet = GERAET[o.geraet];
    const aus = [];
    for (const z of zeilen) {
        const wo = z.leiter + " S " + z.sprosse;
        if (z.richter !== "gleich") {
            aus.push({ kein: true, sprosse: wo, grund: "der Richter fehlt in der Station: " + (z.grund || "ohne Grund") });
            continue;
        }
        if (!geraet) {
            aus.push({ kein: true, sprosse: wo, grund: "Gerät " + o.geraet + " ist kein Standardgerät (Z7)" });
            continue;
        }
        const e = o.eintrag || {};
        if (e.ungemessen || typeof e.gruen !== "boolean") {
            aus.push({ kein: true, sprosse: wo, grund: "die Station ist ungemessen: " + String(e.grund || "ohne Urteil").slice(0, 160) });
            continue;
        }
        let sp = null;
        for (const g of karte.gruppen) for (const L of g.kriterien) if (L.id === z.leiter) sp = L.sprossen.find((s) => s.nr === z.sprosse);
        if (!sp) throw new Error("richter-tafel: " + wo + " steht nicht in der Karte");
        const preis = preisImFenster(o.bilder || [], o.station, o.von, o.bis);
        if (preis.leer) {
            aus.push({ kein: true, sprosse: wo, grund: "kein Strom im Fenster der Probe (" + preis.bilder + " Bilder < " + MIN_BILDER + ") — keine Akte, nie ein Preis aus fremder Zeit" });
            continue;
        }
        preis.referenz = referenzFuerAkte(o.referenz);
        if (o.posten) preis.posten = o.posten;
        if (sp.klasse) preis.urteil = buche.preisUrteil(preis, buche.treppeLesen(karte), wo, sp.klasse);
        const akte = {
            leiter: z.leiter,
            sprosse: z.sprosse,
            sha: o.sha,
            datum: new Date(o.bis).toISOString(),
            soll: sp.richter,
            station: o.station,
            geraete: [{ geraet, richter: { wert: String(e.zahl || ""), urteil: e.gruen ? "GRÜN" : "ROT", ...(Array.isArray(e.mass) ? { mass: e.mass } : {}) }, preis }],
        };
        aus.push({ datei: `${z.leiter}.${z.sprosse}.${String(o.sha).slice(0, 8)}-${o.geraet}.json`, akte });
    }
    return aus;
}

function schreibe(o) {
    const dir = o.dir || AKTEN;
    const zeilen = [];
    for (const a of akten(o)) {
        if (a.kein) {
            zeilen.push("KARTE2 keine Akte " + a.sprosse + " (" + o.station + "): " + a.grund);
            continue;
        }
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, a.datei), JSON.stringify(a.akte, null, 1) + "\n");
        const p = a.akte.geraete[0].preis;
        zeilen.push(`KARTE2 Akte ${a.datei}: Richter ${a.akte.geraete[0].richter.urteil} · Preis ${p.urteil || "ohne Klasse"}: p95 ${p.bild_p95_ms} ms · max ${p.bild_max_ms} ms · Heap ${p.heap_mb} MB · VRAM ${p.vram_mb} MB · ${p.bilder} Bilder · Referenz ${p.referenz.fehler ? "fehlt (" + p.referenz.fehler + ")" : "f " + p.referenz.f}`);
    }
    return zeilen;
}

// ───────────────────────── Selbsttest ─────────────────────────
function selbsttest() {
    const os = require("os");
    const { stromLesen } = require(path.join(__dirname, "..", "meisterkarte-quelle", "punkte", "punkte.cjs"));
    const buche = require("./buche-2.cjs");
    const X = fs.mkdtempSync(path.join(os.tmpdir(), "richter-akte-"));
    const strom = path.join(X, "strom.ndjson");
    // Schein-Strom: ursprung 1 000 000 ms, t relativ; vor der Probe 40 Bilder unter „(sitzung)“, dann 40 Bilder der Probe im
    // Fenster [1 010 000, 1 020 000], ein Bild der Probe NACH dem Fenster (dt 999 — darf nie zählen), dann eine fremde Probe
    const U = 1000000;
    const zeile = (probe, ts, dt, vram, heap) =>
        JSON.stringify({ probe, zeit: "x", bereit: true, seite: "s1", ursprung: U, heap, verloren: 0, fehler: 0, namen: { wetter: ["klar"], zelle: [] },
            zeilen: ts.map((t, i) => [t, dt[i], 1, vram, -1, 100, 1000, 0, 0, 1, 0, 0, 0, 1, 0, -1]) });
    const reihe = (a, n, f) => Array.from({ length: n }, (_, i) => f(a, i));
    const vorT = reihe(0, 40, (a, i) => 1000 + i * 100),
        inT = reihe(0, 40, (a, i) => 10100 + i * 200);
    const inDt = inT.map((_, i) => (i === 7 ? 48 : 16 + (i % 5))); // 16..20 ms, ein Ausreißer 48 ms
    fs.writeFileSync(strom, [
        zeile("(sitzung)", vorT, vorT.map(() => 500), 90, 250), // fremde Zeit mit riesigen Bildern
        zeile("vegetation.K2#1", inT, inDt, 104.5, 312.4),
        zeile("vegetation.K2#1", [20500], [999], 300, 900), // derselbe Name, aber nach dem Fenster
        zeile("klang.K4#2", [21000, 21100], [700, 700], 400, 900),
    ].join("\n") + "\n");
    const bilder = stromLesen(strom).bilder;
    const karte = JSON.parse(fs.readFileSync(KARTE, "utf8"));
    // die Referenz der Sitzung (punkte.cjs referenzBericht): ruhig f 1,05 — gerissen f 1,84 (Faden 1,84, alle Kerne 1,6)
    const ref = (f) => ({ vor: { ein: 100 * f, alle: 200, cpuEin: 90 }, nach: { ein: 100 * f, alle: 200 }, ruhe: { ein: 100, alle: 190, n: 12, von: "2026-11-14T10:00:00Z" },
        f, fEin: f, fAlle: 1.05, verdraengt: 1, schwankt: false, rechner: "win32 · 24 Kerne · Schein", umfeld: "sitzung" });
    const basis = { station: "vegetation.K2#1", eintrag: { gruen: true, zahl: "Kamm/Tal 5.93" }, bilder, von: U + 10000, bis: U + 20000, sha: "7f778d44c1aa", geraet: "radeon", karte, referenz: ref(1.05) };
    let ok = 0, fehl = 0;
    const pruefe = (name, f) => {
        let r;
        try { r = f(); } catch (e) { r = e.message; }
        if (r === true) (ok++, console.log("  GRÜN  " + name));
        else (fehl++, console.log("  ROT   " + name + " — " + r));
    };
    let sp = null;
    for (const g of karte.gruppen) for (const L of g.kriterien) if (L.id === "leben.pflanzen.kraft") sp = L.sprossen[0];
    const sorted = [...inDt].sort((a, b) => a - b);
    const erwartet = {
        datei: "leben.pflanzen.kraft.1.7f778d44-radeon.json",
        akte: { leiter: "leben.pflanzen.kraft", sprosse: 1, sha: "7f778d44c1aa", datum: new Date(U + 20000).toISOString(), soll: sp.richter, station: "vegetation.K2#1",
            geraete: [{ geraet: "Radeon 890M", richter: { wert: "Kamm/Tal 5.93", urteil: "GRÜN" },
                preis: { bild_p95_ms: sorted[Math.floor(0.95 * 40)], bild_max_ms: 48, heap_mb: 312.4, vram_mb: 104.5, bilder: 40,
                    fenster: { von: new Date(U + 10000).toISOString(), bis: new Date(U + 20000).toISOString() },
                    quelle: "Loop des Spiels an der Pose der Probe, im Fenster der Probe (Preis-Lauf " + PREIS_S + " s)",
                    referenz: { f: 1.05, fEin: 1.05, fAlle: 1.05, vor: { ein: 105, alle: 200 }, nach: { ein: 105, alle: 200 }, ruhe: { ein: 100, alle: 190, n: 12, von: "2026-11-14T10:00:00Z" },
                        umfeld: "sitzung", rechner: "win32 · 24 Kerne · Schein" },
                    urteil: "GRÜN" } }] },
    };
    pruefe("Schein-Station mit Schein-Strom ergibt genau die erwartete Akte (nur Bilder der Probe im Fenster)", () => {
        const a = akten(basis);
        return a.length === 1 && JSON.stringify(a[0]) === JSON.stringify(erwartet) ? true : JSON.stringify(a).slice(0, 400);
    });
    // DIE LAST AM PREIS: derselbe Strom, die Bilder der Probe um 40 ms schwerer (p95 über 33 ms), Heap und VRAM unter dem Soll
    const schwer = bilder.map((b) => (b.probe === "vegetation.K2#1" && b.dt >= 0 ? { ...b, dt: b.dt + 40 } : b));
    const preisVon = (o) => { const a = akten({ ...basis, ...o }); return a[0].akte ? a[0].akte.geraete[0].preis : a[0]; }; // prettier-ignore
    pruefe("LAST Mutant Referenz im Band + Preis über Soll: ROT", () => {
        const p = preisVon({ bilder: schwer, referenz: ref(1.05) });
        return p.urteil === "ROT" && p.bild_p95_ms > 33 ? true : JSON.stringify(p).slice(0, 300);
    });
    pruefe("LAST Mutant Referenz gerissen + Preis über Soll: UNGEMESSEN unter Last ×1,84", () => {
        const p = preisVon({ bilder: schwer, referenz: ref(1.84) });
        return p.urteil === "UNGEMESSEN unter Last ×1,84" ? true : JSON.stringify(p).slice(0, 300);
    });
    pruefe("LAST Mutant Preis unter Soll: GRÜN, egal welche Last (ruhig, gerissen, ohne Referenz)", () =>
        [ref(1.05), ref(3.5), undefined].every((r) => preisVon({ referenz: r }).urteil === "GRÜN") ? true : "nicht GRÜN");
    pruefe("LAST Mutant ohne Referenz + Preis über Soll: UNGEMESSEN, nie ROT ohne Maßstab", () => {
        const p = preisVon({ bilder: schwer, referenz: undefined });
        return /^UNGEMESSEN ohne Referenz/.test(p.urteil) && p.referenz.fehler ? true : JSON.stringify(p).slice(0, 300);
    });
    pruefe("LAST Mutant gerissen + Preis über Soll, VRAM über Soll: ROT (VRAM hängt nie an Last)", () => {
        const p = preisVon({ bilder: schwer.map((b) => ({ ...b, vram: 141.6 })), referenz: ref(1.84) });
        return p.urteil === "ROT" ? true : JSON.stringify(p).slice(0, 300);
    });
    pruefe("Mutant kein Strom im Fenster: KEINE Akte", () => {
        const a = akten({ ...basis, von: U + 30000, bis: U + 40000 });
        return a.length === 1 && a[0].kein && /kein Strom im Fenster/.test(a[0].grund) ? true : JSON.stringify(a);
    });
    pruefe("Mutant Fenster nur um fremde Bilder unter fremdem Namen: KEINE Akte", () => {
        const a = akten({ ...basis, von: U, bis: U + 9999 });
        return a[0].kein ? true : JSON.stringify(a);
    });
    pruefe("Mutant Station ungemessen: KEINE Akte", () => {
        const a = akten({ ...basis, eintrag: { gruen: false, ungemessen: true, grund: "Schloss" } });
        return a[0].kein && /ungemessen/.test(a[0].grund) ? true : JSON.stringify(a);
    });
    pruefe("Station ROT: Akte mit Richter ROT (die Ratsche braucht sie)", () => {
        const a = akten({ ...basis, eintrag: { gruen: false, zahl: "Kamm/Tal 1.1" } });
        return a[0].akte && a[0].akte.geraete[0].richter.urteil === "ROT" ? true : JSON.stringify(a);
    });
    pruefe("Tafel-Zeile „fehlt“: KEINE Akte, der Grund beim Namen", () => {
        const a = akten({ ...basis, station: "speicher.K4#2" });
        return a.length === 1 && a[0].kein && /10² Taten/.test(a[0].grund) ? true : JSON.stringify(a);
    });
    pruefe("eine Station, zwei Sprossen (klang.K4#2 → ereignis S 2 und S 1): zwei Akten aus EINER Fahrt", () => {
        const b = [...bilder.filter((x) => x.probe !== "klang.K4#2")].map((x) => (x.probe === "vegetation.K2#1" ? { ...x, probe: "klang.K4#2" } : x));
        const a = akten({ ...basis, station: "klang.K4#2", bilder: b });
        return a.length === 2 && a.every((x) => x.akte) && a.map((x) => x.akte.sprosse).join() === "2,1" ? true : JSON.stringify(a).slice(0, 300);
    });
    pruefe("der Preis-Lauf fährt nur nach Stationen mit einer „gleich“-Zeile der Tafel", () =>
        brauchtPreisLauf("vegetation.K2#1") && brauchtPreisLauf("klang.K4#2") && !brauchtPreisLauf("speicher.K4#2") && !brauchtPreisLauf("profiband.K1#1") ? true : "falsch gewählt");
    pruefe("buche-2 liest die geschriebene Akte: ein Gerät — kein Punkt, nur ein Gerät", () => {
        const dir = path.join(X, "richter");
        schreibe({ ...basis, dir });
        const k = JSON.parse(JSON.stringify(karte));
        const kern0 = buche.brueckeLesen(fs.readFileSync(path.join(__dirname, "BRUECKE.md"), "utf8"));
        const ak = {};
        for (const n of fs.readdirSync(dir)) ak[n.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
        const z = buche.rechne(k, ak, kern0);
        return z.heute === 0 && z.kern === 19 && /kein Punkt, nur ein Gerät/.test(z.bericht[0].warum) ? true : JSON.stringify(z.bericht);
    });
    pruefe("buche-2 vereint Radeon- und GTX-Akte desselben SHA mit grünem Preis: Punkt", () => {
        const dir = path.join(X, "richter");
        schreibe({ ...basis, dir, geraet: "gtx" });
        const k = JSON.parse(JSON.stringify(karte));
        const kern0 = buche.brueckeLesen(fs.readFileSync(path.join(__dirname, "BRUECKE.md"), "utf8"));
        const ak = {};
        for (const n of fs.readdirSync(dir)) ak[n.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
        const z = buche.rechne(k, ak, kern0);
        return z.heute === 1 && z.kern === 18 ? true : JSON.stringify(z.bericht);
    });
    fs.rmSync(X, { recursive: true, force: true });
    console.log(`SELBSTTEST richter-akte: ${ok} GRÜN, ${fehl} ROT`);
    return fehl ? 1 : 0;
}

if (require.main === module) {
    if (process.argv.includes("--selbsttest")) process.exit(selbsttest());
    console.log("Aufruf: node vision/richter-akte.cjs --selbsttest (gerufen wird die Datei von punkte.cjs fahreSitzung)");
}
module.exports = { akten, schreibe, preisImFenster, brauchtPreisLauf, referenzFuerAkte, MIN_BILDER, PREIS_S, TAFEL };
