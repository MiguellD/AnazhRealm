// richter-akte.cjs — die Mess-Sitzung schreibt die Richter-Akten der Meisterkarte 2 selbst (Form: vision/buche-2.cjs, Kopf).
//
// Gerufen von meisterkarte-quelle/punkte/punkte.cjs (fahreSitzung) nach jeder Probe: kein zweiter Mess-Pfad — Messwert und Urteil
// sind die der Station, der Preis ist der Schnitt des Stroms DERSELBEN Sitzung (strom.ndjson, stromLesen) über genau das Fenster der
// Probe: die Bilder, die die Sitzung unter ihrem Namen zapfte UND deren Wanduhr zwischen Beginn und Ende der Probe liegt. Fehlt der
// Strom im Fenster (weniger als MIN_BILDER Bilder), steht die Akte mit einem Preis ohne Zahl, der beim Namen sagt warum (preisFehlt;
// buche-2: FEHLT) — nie ein Preis aus fremder Zeit, nie ein stilles Urteil ohne Akte.
//
//   akten({ station, probe, eintrag, bilder, von, bis, sha, geraet, adapter, karte, tafel, referenz, posten, stueck }) → [{ datei, akte } | { kein: true, sprosse, grund }]
//   (kein: nur ohne Richter in der Station, ohne Adapter der Klasse, ungemessen — ein leerer Preis ist eine Akte mit preis.fehlt; das
//   Richter-Gerät (geraetVon) schreibt seine Akte mit preis: null und ohnePreis)
//
// DIE ZWILLINGE EINES LAUFS (16.11., Fund g6: pflicht.E#1 und karte2.same.preis.bytes#1 sind zweite Urteile auf einem bestehenden
// Lauf): die Sitzung fährt eine Probe-Gruppe EINMAL, ihr Strom und ihr Preis-Lauf tragen den Namen des Laufs (`probe`, der erste der
// Gruppe). Jede Station der Gruppe urteilt auf DIESEM Lauf — ihr Preis ist das Stück desselben Laufs (R3: Umfang, Tiefe, Preis in
// derselben Fahrt). Ohne `probe` ist die Station selbst der Lauf.
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
// DAS GERÄT NENNT SICH SELBST — DER 1050 TRÄGT RICHTER, NIE PREIS (26.11., der Koordinator). Bis hier hieß jede Sitzung mit
// `--geraet gtx` in ihrer Akte „GTX 1060“ und schrieb nach `<…>-gtx.json`: der GTX 1050 (i7-950, 4 Kerne; Bild p95 50–67 ms im
// Preis-Lauf, nie im Band der Klasse) stand in 22 Akten seiner drei Läufe an e71f2721 · 64fcf12e als Standardgerät — sein roter
// Preis hätte gebuchte Sprossen gesenkt (geruch#1, bevoelkerung#1, absicht#1), und dieselbe Station am selben Kopf trug zwei Rechner
// unter EINEM Dateinamen. Jetzt nennt `--geraet` nur die Klasse (den Hersteller); WELCHES Gerät misst, sagt der Adapter des Rechners,
// wie das System ihn nennt (adapterLesen). Trägt ihn buche-2 STANDARD, ist er das Standardgerät der Klasse (Name und Datei wie
// bisher); jeder andere Adapter der Klasse ist ein RICHTER-GERÄT (geraetVon): eigener Name („GTX 1050“), eigene Datei (`-gtx1050`),
// KEIN Preis-Lauf (brauchtPreisLauf), die Akte trägt `preis: null` und den Grund „kein Preis-Gerät“ — buche-2 liest von ihm nur den
// Richter (Z7: sein ROT nimmt, sein GRÜN hebt nichts). Ohne Adapter der Klasse steht KEINE Akte, der Grund beim Namen — nie ein
// Standardgerät aus der Klasse geraten.
const GERAET = { radeon: "Radeon 890M", gtx: "GTX 1060" }; // Z7, Stand 2026 — das Standardgerät je Klasse (sein Muster: buche-2 STANDARD)
const HERSTELLER = { radeon: /\b(AMD|Radeon)/i, gtx: /\b(NVIDIA|GeForce)\b/i };
// die Grafik-Adapter dieses Rechners (EINE Abfrage je Prozess): { namen: [...] } | { fehler }
let adapterGelesen = null;
function adapterLesen() {
    if (adapterGelesen) return adapterGelesen;
    try {
        if (process.platform !== "win32") throw new Error("die Adapter-Abfrage kennt " + process.platform + " nicht (Win32_VideoController)");
        const aus = require("child_process").execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "Get-CimInstance -ClassName Win32_VideoController | ForEach-Object { $_.Name }"],
            { encoding: "utf8", timeout: 60000, windowsHide: true });
        const namen = aus.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        adapterGelesen = namen.length ? { namen } : { fehler: "Win32_VideoController nennt keinen Adapter" };
    } catch (e) {
        adapterGelesen = { fehler: String((e && e.message) || e).split(/\r?\n/)[0].slice(0, 160) };
    }
    return adapterGelesen;
}
// klasse ("radeon" | "gtx" | …) und der Adapter (adapterLesen) → { klasse, name, datei, preis, adapter?, grund? }; name null: keine Akte
function geraetVon(klasse, adapter) {
    const std = GERAET[klasse], H = HERSTELLER[klasse];
    if (!std || !H) return { klasse, name: null, preis: false, grund: "Gerät " + klasse + " ist kein Standardgerät (Z7)" };
    if (!adapter || !Array.isArray(adapter.namen)) return { klasse, name: null, preis: false, grund: "der Rechner nennt seinen Adapter nicht (" + ((adapter && adapter.fehler) || "keine Abfrage") + ")" };
    const S = buche.STANDARD.find((s) => s.name === std);
    const der = adapter.namen.filter((n) => H.test(n));
    if (!der.length) return { klasse, name: null, preis: false, grund: "kein Adapter der Klasse " + klasse + " im Rechner (" + adapter.namen.join(" · ") + ")" };
    const standard = der.find((n) => S.muster.test(n));
    if (standard) return { klasse, name: std, datei: klasse, preis: true, adapter: standard };
    const name = der[0].replace(/\((TM|R)\)/gi, "").replace(/\b(NVIDIA|GeForce|AMD|Graphics)\b/gi, "").replace(/\s+/g, " ").trim() || der[0];
    return { klasse, name, datei: name.toLowerCase().replace(/[^a-z0-9]/g, ""), preis: false, adapter: der[0],
        grund: "kein Preis-Gerät: " + name + " steht unter dem Preis-Band der Klasse " + klasse + " (Preis trägt " + std + ", buche-2 STANDARD, Z7)" };
}
const MIN_BILDER = 30;
// DER PREIS-LAUF (14.11., Radeon 337846dc: vegetation.K2#1 GRÜN, im Strom 0 Bilder): die Werkbank ruht den Loop zwischen ihren Befehlen
// (Lehre 17), und eine Probe, die ihre Bilder von Hand tickt, zeigt kein Bild des Spielers — der Haken des Stroms sieht nur, was der
// Loop des Spiels zeigt. Darum fährt die Sitzung nach jeder Probe, der die Tafel eine Sprosse gibt, noch im Fenster der Probe, unter
// ihrem Namen und an ihrer Pose den Loop des Spiels (`/lauf` der Werkbank) PREIS_S Sekunden: das ist der Preis derselben Fahrt.
const PREIS_S = 20;
// station: ein Name oder die Namen ALLER Stationen eines Laufs (die Zwillinge einer Probe-Gruppe) — der Lauf braucht den Preis, sobald
// irgendeine von ihnen eine „gleich“-Zeile trägt UND das Gerät der Sitzung (geraetVon) Preis trägt: ein Richter-Gerät fährt ihn nie
const brauchtPreisLauf = (station, tafel, geraet) => {
    if (!geraet || geraet.preis !== true) return false;
    const namen = new Set([].concat(station));
    return (tafel || JSON.parse(fs.readFileSync(TAFEL, "utf8"))).zeilen.some((z) => namen.has(z.station) && z.richter === "gleich");
};

// dasselbe p95 wie der Kopf des Stroms (punkte.cjs p95Von): Rang floor(0,95 · n) der sortierten Werte
const p95 = (a) => {
    const s = a.filter(Number.isFinite).sort((x, y) => x - y);
    return s.length ? s[Math.min(s.length - 1, Math.floor(0.95 * s.length))] : null;
};
const maxVon = (a) => {
    const s = a.filter((x) => Number.isFinite(x) && x >= 0);
    return s.length ? Math.max(...s) : null;
};

// DAS STÜCK DES PREISES (Koordinator 16.11.; löst die feste Spanne von 5 s nach dem Sprung vom 14.11. ab). Der Preis-Lauf ist
// `/lauf` der Werkbank mit `ein` (Einschwingen) und `ruhe`: er SELBST zählt erst danach PREIS_S Sekunden. Die Akte urteilte bis
// hier jedes Bild ab 5 s nach dem Start des Loops — also 25 s Einschwingen, die der Lauf nicht zählt: der Loop ruht während der
// Probe (Lehre 17), sein Anlauf holt nach, was die Probe liegen ließ; das ist die Schuld des Mess-Wegs, nie der Preis des Orts
// (Radeon: 3984539f vegetation.K5#2 Fenster p95 34,27 ms bei 25,65 im Stück · a4d317ca zugang 33,6 bei 25,17 · 3984539f
// wetter.K1#2 50,27 bei 42,04 — das letzte reißt auch im Stück). EINE Quelle: das Stück nennt der Lauf (`stueck.ab` … `stueck.bis`
// auf der Wand-Uhr, punkte.cjs preisLauf); Bild p95 und größtes Bild urteilen die Bilder darin, alles davor steht als Lesewert
// daneben (`einlauf`: Dauer, Bilder, p95, größtes Bild, Heap, VRAM). Ohne Stück kein Preis — nie ein zweites Fenster daneben. Heap
// und VRAM urteilen im selben Stück wie die Bilder. Die Schwellen der Treppe bleiben.

// der Preis einer Probe aus den Bildern des Stroms (stromLesen(...).bilder): leer, wenn das Stück fehlt oder zu wenige Bilder trägt
function preisImFenster(bilder, station, von, bis, stueck) {
    if (!stueck || !Number.isFinite(stueck.ab) || !Number.isFinite(stueck.bis)) return { leer: true, ohneStueck: true, bilder: 0 };
    const im = bilder.filter((b) => b.probe === station && b.wand >= von && b.wand <= bis);
    const davor = im.filter((b) => b.dt >= 0 && b.wand < stueck.ab);
    const dt = im.filter((b) => b.dt >= 0 && b.wand >= stueck.ab && b.wand <= stueck.bis).map((b) => b.dt);
    if (dt.length < MIN_BILDER) return { leer: true, bilder: dt.length };
    const preis = { bild_p95_ms: p95(dt), bild_max_ms: maxVon(dt) };
    // Heap und VRAM urteilen im selben Stück (mensch.K2#2 Radeon 3e4f99cd: 553,1 MB im Fenster — der Zeitraffer der Probe — bei
    // 461,7 MB nach dem GC an der Pose): das Größte davor ist die Schuld der Probe und steht als Lesewert im Einlauf
    const frueh = im.filter((b) => b.wand < stueck.ab),
        stk = im.filter((b) => b.wand >= stueck.ab && b.wand <= stueck.bis);
    preis.einlauf = { s: davor.length ? +((stueck.ab - Math.min(...davor.map((b) => b.wand))) / 1000).toFixed(1) : 0, bilder: davor.length,
        bild_p95_ms: p95(davor.map((b) => b.dt)), bild_max_ms: maxVon(davor.map((b) => b.dt)),
        heap_mb: maxVon(frueh.map((b) => b.heap)), vram_mb: maxVon(frueh.map((b) => b.vram)) };
    const heap = maxVon(stk.map((b) => b.heap)),
        vram = maxVon(stk.map((b) => b.vram));
    if (heap != null) preis.heap_mb = heap; // fehlt er, fehlt die Zahl — buche-2 zählt das als fehlenden Preis (R3), nie geschätzt
    if (vram != null) preis.vram_mb = vram;
    preis.bilder = dt.length;
    preis.fenster = { von: new Date(von).toISOString(), bis: new Date(bis).toISOString() };
    // das Stück beim Namen, samt dem Wort des Laufs über sich selbst (Ruhe, Skala, sein eigenes p95: Lesewerte neben dem Urteil)
    preis.stueck = { ab: new Date(stueck.ab).toISOString(), bis: new Date(stueck.bis).toISOString(), ...(stueck.lauf ? { lauf: stueck.lauf } : {}) };
    preis.quelle = "Loop des Spiels an der Pose der Probe: das Stück des Preis-Laufs nach Einschwingen und Ruhe (" + PREIS_S + " s)";
    return preis;
}
// DER PREIS FEHLT BEIM NAMEN (25.11., der Koordinator: „ein stilles GRÜN ohne Akte ist der fail-soft-Bruch“). Bis hier schrieb ein
// leeres Stück KEINE Akte: das Urteil der Station stand nur in der Mess-Datei, buche-2 sah es nie — 82 GRÜN in 16 Stationen und 39 ROT
// in 26 Stationen an Köpfen, deren Sitzung Akten schrieb (leben.tiere.wanderung#1 an 99f687f3 Radeon: der Lauf zählte 0 Bilder). Die
// Akte steht nun mit dem Urteil des Richters und einem Preis ohne Zahl, der beim Namen sagt, warum: buche-2 urteilt ihn FEHLT (R3:
// fehlende Preis-Zahl nimmt, höchstens Kern, Z5) — nie ein Preis aus fremder Zeit, nie ein Fenster daneben, und nie mehr still.
function preisFehlt(leer, o) {
    const L = o.stueck && o.stueck.lauf;
    const fehlt = leer.ohneStueck
        ? "der Preis-Lauf nannte sein Stück nicht (kein Ergebnis von `/lauf`)"
        : "kein Strom im Stück des Preis-Laufs (" + leer.bilder + " Bilder < " + MIN_BILDER + ")" +
          (L ? " · der Lauf selbst " + L.bilder + " Bilder, p95 " + L.p95 + " ms" + (L.leine ? ", Leine ausgesetzt " + L.leine.ausgesetztPct + " % · im Flug " + L.leine.imFlug : "") : "");
    const p = { fehlt, bilder: leer.bilder, fenster: { von: new Date(o.von).toISOString(), bis: new Date(o.bis).toISOString() } };
    if (!leer.ohneStueck) p.stueck = { ab: new Date(o.stueck.ab).toISOString(), bis: new Date(o.stueck.bis).toISOString(), ...(L ? { lauf: L } : {}) };
    p.quelle = "kein Preis: " + fehlt;
    return p;
}
// der Bericht der Referenz in der Akte: die Zahlen, die buche-2 urteilt, und die, die sie belegen
function referenzFuerAkte(r) {
    if (!r || typeof r !== "object") return { fehler: "die Sitzung fuhr keine Referenz um den Preis-Lauf" };
    if (r.fehler) return { fehler: String(r.fehler).slice(0, 160) };
    // DAS RUHE-TOR (pm-referenz-nach-anlauf, punkte.cjs ruheTor): je Fahrt ihr Tor, und riss es, `anlauf` — buche-2 lastVon nennt ihn
    const tor = (t) => (!t ? null : t.blind ? { blind: String(t.blind).slice(0, 120) } : { ruhig: t.ruhig, s: t.s, kerne: t.kerne, soll: t.soll, reihe: t.reihe });
    const zwei = (x) => (x ? { ein: x.ein, alle: x.alle, ...(x.tor ? { tor: tor(x.tor) } : {}) } : null);
    return { f: r.f, fEin: r.fEin, fAlle: r.fAlle, vor: zwei(r.vor), nach: zwei(r.nach), ruhe: r.ruhe ? { ein: r.ruhe.ein, alle: r.ruhe.alle, n: r.ruhe.n, von: r.ruhe.von } : null,
        ...(r.anlauf ? { anlauf: { wo: r.anlauf.wo, ...tor(r.anlauf) } } : {}),
        // DER LESEWERT „f nach Gründung“ (punkte.cjs referenzVorRuhig, 27.11.): die erste Fahrt vor dem Fenster, wie lange und wie oft „vor“ auf Ruhe wartete
        ...(r.nachGruendung ? { nachGruendung: { f: r.nachGruendung.f, ein: r.nachGruendung.ein, alle: r.nachGruendung.alle, fahrten: r.nachGruendung.fahrten, s: r.nachGruendung.s, ruhig: r.nachGruendung.ruhig } } : {}),
        umfeld: r.umfeld, rechner: r.rechner };
}

function akten(o) {
    const tafel = o.tafel || JSON.parse(fs.readFileSync(TAFEL, "utf8"));
    const zeilen = tafel.zeilen.filter((z) => z.station === o.station);
    if (!zeilen.length) return [];
    const karte = o.karte || JSON.parse(fs.readFileSync(KARTE, "utf8"));
    const G = geraetVon(o.geraet, o.adapter); // DAS GERÄT NENNT SICH SELBST (Kopf): die Klasse aus dem Aufruf, das Gerät aus dem Adapter
    const aus = [];
    for (const z of zeilen) {
        const wo = z.leiter + " S " + z.sprosse;
        if (z.richter !== "gleich") {
            aus.push({ kein: true, sprosse: wo, grund: "der Richter fehlt in der Station: " + (z.grund || "ohne Grund") });
            continue;
        }
        if (!G.name) {
            aus.push({ kein: true, sprosse: wo, grund: G.grund });
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
        const richter = { wert: String(e.zahl || ""), urteil: e.gruen ? "GRÜN" : "ROT", ...(Array.isArray(e.mass) ? { mass: e.mass } : {}) };
        const kopf = { leiter: z.leiter, sprosse: z.sprosse, sha: o.sha, datum: new Date(o.bis).toISOString(), soll: sp.richter, station: o.station,
            ...(o.probe && o.probe !== o.station ? { lauf: o.probe } : {}) };
        const datei = `${z.leiter}.${z.sprosse}.${String(o.sha).slice(0, 8)}-${G.datei}.json`;
        if (!G.preis) {
            // das RICHTER-GERÄT: kein Preis, auch nicht aus einem Strom, der doch Bilder trüge — der Grund steht in der Akte
            aus.push({ datei, akte: { ...kopf, geraete: [{ geraet: G.name, adapter: G.adapter, richter, preis: null, ohnePreis: G.grund }] } });
            continue;
        }
        let preis = preisImFenster(o.bilder || [], o.probe || o.station, o.von, o.bis, o.stueck);
        if (preis.leer) preis = preisFehlt(preis, o);
        preis.referenz = referenzFuerAkte(o.referenz);
        if (o.posten) preis.posten = o.posten;
        if (sp.klasse) {
            // das Urteil trägt die Fassung der Treppe, unter der es fiel (buche-2 prüft den Widerspruch nur unter ihr)
            const T = buche.treppeLesen(karte);
            preis.urteil = buche.preisUrteil(preis, T, wo, sp.klasse);
            if (T.fassung) preis.treppe = T.fassung;
        }
        aus.push({ datei, akte: { ...kopf, geraete: [{ geraet: G.name, richter, preis }] } });
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
        // ZWEI FAHRTEN, EIN NAME, BEIDE BELEGE (Gegner Gesetz F5, 15.11.): steht die Akte desselben SHA und Geräts schon, tritt die
        // neue Fahrt an das Ende ihrer Folge (buche-2 liest eine Folge, je Gerät die jüngste) — bis hier überschrieb die zweite
        // Fahrt die erste, und die Zahl von Schnitt 2 (50564dea: p95 75,58 · max 192,52) fiel unter dem Beleg von Schnitt 3
        const f = path.join(dir, a.datei);
        const alt = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
        const folge = alt ? (Array.isArray(alt) ? alt : [alt]).concat([a.akte]) : null;
        fs.writeFileSync(f, JSON.stringify(folge || a.akte, null, 1) + "\n");
        const p = a.akte.geraete[0].preis;
        if (!p) {
            zeilen.push(`KARTE2 Akte ${a.datei}: Richter ${a.akte.geraete[0].richter.urteil} · ${a.akte.geraete[0].geraet} ${a.akte.geraete[0].ohnePreis}`);
            continue;
        }
        if (p.fehlt) {
            zeilen.push(`KARTE2 Akte ${a.datei}: Richter ${a.akte.geraete[0].richter.urteil} · Preis ${p.urteil || "FEHLT"} — ${p.fehlt}`);
            continue;
        }
        // DIE ZEILE NENNT, WAS URTEILT (16.11., mensch.K2#2 Radeon a42d4720: „Preis ROT … Heap 579,7 MB“ — geurteilt hatte buche-2 die
        // gehaltenen 449,4 MB der Posten (`gehaltenVon`), die Zeile zeigte die Spitze des Stücks samt Müll zwischen zwei GCs): das
        // Gehaltene vorn, die Spitze als Lesewert dahinter; ohne Posten urteilt die Spitze, und die Zeile sagt es.
        const speicher = (name, k) =>
            p.posten && typeof p.posten[k] === "number" ? `${name} ${p.posten[k]} MB gehalten (Spitze ${p[k]})` : `${name} ${p[k]} MB Spitze (kein Aufräumen in der Akte)`;
        zeilen.push(`KARTE2 Akte ${a.datei}: Richter ${a.akte.geraete[0].richter.urteil} · Preis ${p.urteil || "ohne Klasse"}: p95 ${p.bild_p95_ms} ms · max ${p.bild_max_ms} ms · ${speicher("Heap", "heap_mb")} · ${speicher("VRAM", "vram_mb")} · ${p.bilder} Bilder · Referenz ${p.referenz.fehler ? "fehlt (" + p.referenz.fehler + ")" : "f " + p.referenz.f} · Einlauf ${p.einlauf.s} s (Lesewert): p95 ${p.einlauf.bild_p95_ms} ms, max ${p.einlauf.bild_max_ms} ms${p.stueck.lauf ? " · der Lauf selbst p95 " + p.stueck.lauf.p95 + " ms (" + p.stueck.lauf.bilder + " Bilder)" : ""}`);
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
        inT = reihe(0, 80, (a, i) => 10100 + i * 110);
    // 16..20 ms, ein Ausreißer 48 ms im Stück des Laufs (i 60), einer zu 150 ms davor (i 3: nur Lesewert). Das Stück beginnt 5 s
    // nach dem ersten Bild der Probe und endet vor dem Ende des Fensters (danach zählt kein Bild mehr)
    const inDt = inT.map((_, i) => (i === 60 ? 48 : i === 3 ? 150 : 16 + (i % 5)));
    const AB = inT[0] + 5000, BIS = 19000;
    const nachSprung = inDt.filter((_, i) => inT[i] >= AB),
        davor = inDt.filter((_, i) => inT[i] < AB).sort((a, b) => a - b);
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
    const LAUF = { ruhe: { ruhig: true, sek: 3.1 }, skala: [0.5, 0.5], p95: 20, max: 48, bilder: 34 };
    // die Adapter der drei Rechner, wie Win32_VideoController sie nennt (der OMEN trägt dazu einen zweiten Adapter)
    const ADAPTER = { radeon: { namen: ["AMD Radeon(TM) 890M Graphics"] }, omen: { namen: ["Intel(R) UHD Graphics 630", "NVIDIA GeForce GTX 1060"] }, gtx1050: { namen: ["NVIDIA GeForce GTX 1050"] } };
    const basis = { station: "vegetation.K2#1", eintrag: { gruen: true, zahl: "Kamm/Tal 5.93" }, bilder, von: U + 10000, bis: U + 20000, sha: "7f778d44c1aa", geraet: "radeon", adapter: ADAPTER.radeon, karte, referenz: ref(1.05),
        stueck: { ab: U + AB, bis: U + BIS, lauf: LAUF } };
    let ok = 0, fehl = 0;
    const pruefe = (name, f) => {
        let r;
        try { r = f(); } catch (e) { r = e.message; }
        if (r === true) (ok++, console.log("  GRÜN  " + name));
        else (fehl++, console.log("  ROT   " + name + " — " + r));
    };
    let sp = null;
    for (const g of karte.gruppen) for (const L of g.kriterien) if (L.id === "leben.pflanzen.kraft") sp = L.sprossen[0];
    const sorted = [...nachSprung].sort((a, b) => a - b);
    const erwartet = {
        datei: "leben.pflanzen.kraft.1.7f778d44-radeon.json",
        akte: { leiter: "leben.pflanzen.kraft", sprosse: 1, sha: "7f778d44c1aa", datum: new Date(U + 20000).toISOString(), soll: sp.richter, station: "vegetation.K2#1",
            geraete: [{ geraet: "Radeon 890M", richter: { wert: "Kamm/Tal 5.93", urteil: "GRÜN" },
                preis: { bild_p95_ms: sorted[Math.floor(0.95 * sorted.length)], bild_max_ms: 48,
                    einlauf: { s: 5, bilder: 80 - sorted.length, bild_p95_ms: davor[Math.floor(0.95 * davor.length)], bild_max_ms: 150, heap_mb: 312.4, vram_mb: 104.5 },
                    heap_mb: 312.4, vram_mb: 104.5, bilder: sorted.length,
                    fenster: { von: new Date(U + 10000).toISOString(), bis: new Date(U + 20000).toISOString() },
                    stueck: { ab: new Date(U + AB).toISOString(), bis: new Date(U + BIS).toISOString(), lauf: LAUF },
                    quelle: "Loop des Spiels an der Pose der Probe: das Stück des Preis-Laufs nach Einschwingen und Ruhe (" + PREIS_S + " s)",
                    referenz: { f: 1.05, fEin: 1.05, fAlle: 1.05, vor: { ein: 105, alle: 200 }, nach: { ein: 105, alle: 200 }, ruhe: { ein: 100, alle: 190, n: 12, von: "2026-11-14T10:00:00Z" },
                        umfeld: "sitzung", rechner: "win32 · 24 Kerne · Schein" },
                    urteil: "GRÜN", ...(karte.preisFassung ? { treppe: karte.preisFassung } : {}) } }] },
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
    // DAS RUHE-TOR (pm-referenz-nach-anlauf): riss es vor der Fahrt „vor“, heißt dieselbe Zahl „im Anlauf der eigenen Welt“ — nie „unter Last“
    pruefe("LAST Täter Referenz im Anlauf (das Tor riss vor „vor“) + Preis über Soll: UNGEMESSEN im Anlauf der eigenen Welt ×1,84", () => {
        const anlauf = { wo: "vor", ruhig: false, s: 60, kerne: 4.02, soll: 3, reihe: [4.4, 4.1, 3.9] };
        const p = preisVon({ bilder: schwer, referenz: { ...ref(1.84), anlauf } });
        return p.urteil === "UNGEMESSEN im Anlauf der eigenen Welt ×1,84" ? true : JSON.stringify(p).slice(0, 300);
    });
    pruefe("LAST Mutant Preis unter Soll: GRÜN, egal welche Last (ruhig, gerissen, ohne Referenz)", () =>
        [ref(1.05), ref(3.5), undefined].every((r) => preisVon({ referenz: r }).urteil === "GRÜN") ? true : "nicht GRÜN");
    pruefe("LAST Mutant ohne Referenz + Preis über Soll: UNGEMESSEN, nie ROT ohne Maßstab", () => {
        const p = preisVon({ bilder: schwer, referenz: undefined });
        return /^UNGEMESSEN ohne Referenz/.test(p.urteil) && p.referenz.fehler ? true : JSON.stringify(p).slice(0, 300);
    });
    pruefe("LAST Mutant gerissen + Preis über Soll, VRAM über Soll: ROT (VRAM hängt nie an Last)", () => {
        const p = preisVon({ bilder: schwer.map((b) => ({ ...b, vram: 271.6 })), referenz: ref(1.84) }); // über der Decke 256 MB (Fassung 15.11.)
        return p.urteil === "ROT" ? true : JSON.stringify(p).slice(0, 300);
    });
    pruefe("STÜCK Mutant ein Bild über 100 ms IM Stück des Laufs: im Preis, ROT; davor nur Lesewert", () => {
        const spaet = bilder.map((b) => (b.probe === "vegetation.K2#1" && b.dt === 48 ? { ...b, dt: 150 } : b));
        const p = preisVon({ bilder: spaet, referenz: ref(1.05) });
        const q = preisVon({ referenz: ref(1.05) });
        return p.urteil === "ROT" && p.bild_max_ms === 150 && q.urteil === "GRÜN" && q.einlauf.bild_max_ms === 150 ? true : JSON.stringify([p, q]).slice(0, 300);
    });
    pruefe("STÜCK Mutant ein Bild der Probe NACH dem Stück, noch im Fenster (der GC der Posten): nie im Preis", () => {
        const eins = bilder.find((b) => b.probe === "vegetation.K2#1" && b.dt === 48);
        const p = preisVon({ bilder: bilder.concat([{ ...eins, wand: U + BIS + 500, dt: 999, heap: 900, vram: 300 }]), referenz: ref(1.05) });
        return p.urteil === "GRÜN" && p.bild_max_ms === 48 && p.heap_mb === 312.4 && p.vram_mb === 104.5 ? true : JSON.stringify(p).slice(0, 300);
    });
    // 23.11.: der Heap ist keine Schranke der Sprosse mehr (gestuft in same.preis.speicher) — IM Stück reißt der VRAM, der Heap steht als Zahl im Preis
    pruefe("STÜCK Mutant Heap und VRAM der Probe VOR dem Stück über dem Soll (ihr Zeitraffer): Lesewert im Einlauf, nie im Preis; IM Stück reißt der VRAM, der Heap steht als Zahl", () => {
        const vorher = bilder.map((b) => (b.probe === "vegetation.K2#1" && b.wand < U + AB ? { ...b, heap: 900, vram: 300 } : b));
        const drin = bilder.map((b) => (b.probe === "vegetation.K2#1" && b.wand >= U + AB ? { ...b, heap: 900, vram: 300 } : b));
        const p = preisVon({ bilder: vorher, referenz: ref(1.05) }),
            q = preisVon({ bilder: drin, referenz: ref(1.05) });
        return p.urteil === "GRÜN" && p.heap_mb === 312.4 && p.einlauf.heap_mb === 900 && p.einlauf.vram_mb === 300 && q.urteil === "ROT" && q.heap_mb === 900 && q.vram_mb === 300
            ? true : JSON.stringify([p, q]).slice(0, 300);
    });
    pruefe("STÜCK Mutant das Stück beginnt früher (die alte Spanne des ganzen Fensters): das Bild von 150 ms reißt — das Stück urteilt, nie das Fenster", () => {
        const p = preisVon({ stueck: { ab: U + 10000, bis: U + BIS }, referenz: ref(1.05) });
        return p.urteil === "ROT" && p.bild_max_ms === 150 && p.einlauf.bilder === 0 ? true : JSON.stringify(p).slice(0, 300);
    });
    // DER PREIS FEHLT BEIM NAMEN (preisFehlt): die Akte steht mit dem Urteil des Richters, der Preis trägt keine Zahl, nur den Grund
    const ohneZahl = (p) => ["bild_p95_ms", "bild_max_ms", "heap_mb", "vram_mb", "einlauf"].every((k) => p[k] === undefined);
    pruefe("STÜCK Mutant der Lauf nannte kein Stück: Akte mit Richter GRÜN, Preis FEHLT beim Namen, nie ein Fenster daneben", () => {
        const a = akten({ ...basis, stueck: undefined });
        const p = a.length === 1 && a[0].akte && a[0].akte.geraete[0].preis;
        return p && a[0].akte.geraete[0].richter.urteil === "GRÜN" && p.urteil === "FEHLT" && /nannte sein Stück nicht/.test(p.fehlt) && ohneZahl(p) && !p.stueck ? true : JSON.stringify(a).slice(0, 300);
    });
    pruefe("Mutant kein Strom im Stück (das Fenster liegt hinter den Bildern): Akte, Preis FEHLT mit „0 Bilder < 30“ und dem Wort des Laufs", () => {
        const a = akten({ ...basis, von: U + 30000, bis: U + 40000 });
        const p = a.length === 1 && a[0].akte && a[0].akte.geraete[0].preis;
        return p && p.urteil === "FEHLT" && /kein Strom im Stück des Preis-Laufs \(0 Bilder < 30\) · der Lauf selbst 34 Bilder, p95 20 ms/.test(p.fehlt) && ohneZahl(p) && p.bilder === 0 ? true : JSON.stringify(a).slice(0, 300);
    });
    pruefe("Mutant Fenster nur um fremde Bilder unter fremdem Namen: Akte, Preis FEHLT — nie ein Preis aus fremder Zeit", () => {
        const a = akten({ ...basis, von: U, bis: U + 9999 });
        const p = a[0].akte && a[0].akte.geraete[0].preis;
        return p && p.urteil === "FEHLT" && ohneZahl(p) ? true : JSON.stringify(a).slice(0, 300);
    });
    // der Fall von leben.tiere.wanderung#1 an 99f687f3 Radeon: der Lauf selbst zählte 0 Bilder (p95 null), die Leine nennt warum
    const leerLauf = { stueck: { ab: U + AB, bis: U + BIS, lauf: { p95: null, max: null, bilder: 0, leine: { ausgesetztPct: 100, imFlug: 2 } } }, bilder: bilder.filter((b) => b.probe !== "vegetation.K2#1") };
    pruefe("Täter der Lauf zählte 0 Bilder (wanderung#1 an 99f687f3): Akte, Preis FEHLT samt Leine; die Zeile des Logs nennt es", () => {
        const a = akten({ ...basis, ...leerLauf });
        const p = a[0].akte && a[0].akte.geraete[0].preis;
        const dir = path.join(X, "leer");
        const z = schreibe({ ...basis, ...leerLauf, dir });
        return p && p.urteil === "FEHLT" && /der Lauf selbst 0 Bilder, p95 null ms, Leine ausgesetzt 100 % · im Flug 2/.test(p.fehlt) && p.stueck.lauf.leine.ausgesetztPct === 100 &&
            z.length === 1 && /^KARTE2 Akte leben\.pflanzen\.kraft\.1\.7f778d44-radeon\.json: Richter GRÜN · Preis FEHLT — kein Strom/.test(z[0]) && fs.readdirSync(dir).length === 1
            ? true : JSON.stringify([p, z]).slice(0, 300);
    });
    pruefe("Station ROT und Preis leer: Akte mit Richter ROT (die Ratsche liest sie; bis hier fiel auch das ROT still)", () => {
        const a = akten({ ...basis, ...leerLauf, eintrag: { gruen: false, zahl: "Kamm/Tal 1.1" } });
        return a[0].akte && a[0].akte.geraete[0].richter.urteil === "ROT" && a[0].akte.geraete[0].preis.urteil === "FEHLT" ? true : JSON.stringify(a).slice(0, 300);
    });
    pruefe("buche-2 liest die Akte mit fehlendem Preis: Kern, nie Punkt, der Grund im Bericht; ROT mit leerem Preis nimmt", () => {
        const dir = path.join(X, "fehlt");
        const lies = () => {
            const ak = {};
            for (const n of fs.readdirSync(dir)) ak[n.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
            return buche.rechne(JSON.parse(JSON.stringify(karte)), ak, buche.brueckeLesen(fs.readFileSync(path.join(__dirname, "BRUECKE.md"), "utf8")), buche.kopfFolgeFest({ main: [basis.sha] }));
        };
        schreibe({ ...basis, ...leerLauf, dir });
        const g = lies(), b0 = g.bericht.find((x) => x.leiter === "leben.pflanzen.kraft" && x.sprosse === 1);
        fs.rmSync(dir, { recursive: true, force: true });
        schreibe({ ...basis, ...leerLauf, dir, eintrag: { gruen: false, zahl: "Kamm/Tal 1.1" } });
        const r = lies(), b1 = r.bericht.find((x) => x.leiter === "leben.pflanzen.kraft" && x.sprosse === 1);
        return g.heute === 0 && b0.stand === "KERN" && /Preis Radeon 890M FEHLT \(fehlt: kein Strom im Stück/.test(b0.warum) && b1.stand === "NULL" && /Richter ROT/.test(b1.warum)
            ? true : JSON.stringify([g.heute, b0, b1]).slice(0, 400);
    });
    pruefe("Mutant Station ungemessen: KEINE Akte", () => {
        const a = akten({ ...basis, eintrag: { gruen: false, ungemessen: true, grund: "Schloss" } });
        return a[0].kein && /ungemessen/.test(a[0].grund) ? true : JSON.stringify(a);
    });
    pruefe("Station ROT: Akte mit Richter ROT (die Ratsche braucht sie)", () => {
        const a = akten({ ...basis, eintrag: { gruen: false, zahl: "Kamm/Tal 1.1" } });
        return a[0].akte && a[0].akte.geraete[0].richter.urteil === "ROT" ? true : JSON.stringify(a);
    });
    // die zwei Tafel-Proben tragen ihre EIGENE Tafel (bis 16.11. lasen sie die lebende: speicher.K4#2 bekam mit 50eefcd5 seine
    // „gleich“-Zeile, beide Proben standen seither ROT, ohne dass ein Lauf sie fuhr)
    const scheinTafel = { zeilen: [
        { station: "vegetation.K2#1", leiter: "leben.pflanzen.kraft", sprosse: 1, richter: "gleich" },
        { station: "schein.fehlt#1", leiter: "leben.pflanzen.kraft", sprosse: 1, richter: "fehlt", grund: "10² Taten fehlen im Lauf" },
    ] };
    pruefe("Tafel-Zeile „fehlt“: KEINE Akte, der Grund beim Namen", () => {
        const a = akten({ ...basis, station: "schein.fehlt#1", tafel: scheinTafel });
        return a.length === 1 && a[0].kein && /10² Taten/.test(a[0].grund) ? true : JSON.stringify(a);
    });
    pruefe("eine Station, zwei Sprossen (klang.K4#2 → ereignis S 2 und S 1): zwei Akten aus EINER Fahrt", () => {
        const b = [...bilder.filter((x) => x.probe !== "klang.K4#2")].map((x) => (x.probe === "vegetation.K2#1" ? { ...x, probe: "klang.K4#2" } : x));
        const a = akten({ ...basis, station: "klang.K4#2", bilder: b });
        return a.length === 2 && a.every((x) => x.akte) && a.map((x) => x.akte.sprosse).join() === "2,1" ? true : JSON.stringify(a).slice(0, 300);
    });
    pruefe("der Preis-Lauf fährt nur nach Stationen mit einer „gleich“-Zeile der Tafel", () =>
        [geraetVon("radeon", ADAPTER.radeon)].every((G) => brauchtPreisLauf("vegetation.K2#1", scheinTafel, G) && !brauchtPreisLauf("schein.fehlt#1", scheinTafel, G) &&
        !brauchtPreisLauf("schein.ohne-zeile#1", scheinTafel, G) && brauchtPreisLauf("vegetation.K2#1", undefined, G) && brauchtPreisLauf("klang.K4#2", undefined, G) &&
        !brauchtPreisLauf("profiband.K1#1", undefined, G)) ? true : "falsch gewählt");
    pruefe("buche-2 liest die geschriebene Akte: ein Gerät bucht (Z7, 18.11.) — Punkt, die Nachwache der GTX offen", () => {
        const dir = path.join(X, "richter");
        schreibe({ ...basis, dir });
        const k = JSON.parse(JSON.stringify(karte));
        const kern0 = buche.brueckeLesen(fs.readFileSync(path.join(__dirname, "BRUECKE.md"), "utf8"));
        const ak = {};
        for (const n of fs.readdirSync(dir)) ak[n.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
        const z = buche.rechne(k, ak, kern0, buche.kopfFolgeFest({ main: [basis.sha] })); // die Probe-Akte am Schein-Kopf (buche-2 KOPF-FOLGE)
        return z.heute === 1 && z.kern === 18 && z.beide === 0 && z.nachwache === 1 && /an Radeon 890M am 7f778d44 · Nachwache offen: GTX 1060$/.test(z.bericht[0].warum) ? true : JSON.stringify(z.bericht);
    });
    pruefe("buche-2 vereint Radeon- und GTX-Akte desselben SHA mit grünem Preis: Punkt", () => {
        const dir = path.join(X, "richter");
        schreibe({ ...basis, dir, geraet: "gtx", adapter: ADAPTER.omen });
        const k = JSON.parse(JSON.stringify(karte));
        const kern0 = buche.brueckeLesen(fs.readFileSync(path.join(__dirname, "BRUECKE.md"), "utf8"));
        const ak = {};
        for (const n of fs.readdirSync(dir)) ak[n.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
        const z = buche.rechne(k, ak, kern0, buche.kopfFolgeFest({ main: [basis.sha] })); // die Probe-Akte am Schein-Kopf (buche-2 KOPF-FOLGE)
        return z.heute === 1 && z.kern === 18 && z.beide === 1 ? true : JSON.stringify(z.bericht);
    });
    pruefe("Mutant zweite Fahrt desselben SHA und Geräts: die erste bleibt als Beleg, die Folge trägt beide (buche-2 liest sie)", () => {
        const dir = path.join(X, "richter");
        schreibe({ ...basis, dir, geraet: "gtx", adapter: ADAPTER.omen });
        const n = fs.readdirSync(dir).find((x) => x.endsWith("-gtx.json"));
        const inhalt = JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
        const k = JSON.parse(JSON.stringify(karte));
        const kern0 = buche.brueckeLesen(fs.readFileSync(path.join(__dirname, "BRUECKE.md"), "utf8"));
        const ak = {};
        for (const m of fs.readdirSync(dir)) ak[m.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(dir, m), "utf8"));
        const z = buche.rechne(k, ak, kern0, buche.kopfFolgeFest({ main: [basis.sha] })); // die Probe-Akte am Schein-Kopf (buche-2 KOPF-FOLGE)
        return Array.isArray(inhalt) && inhalt.length === 2 && z.heute === 1 ? true : JSON.stringify(inhalt).slice(0, 200);
    });
    // DER 1050 TRÄGT RICHTER, NIE PREIS (Kopf: DAS GERÄT NENNT SICH SELBST). Die Klasse gtx nennt beide Rechner; der Adapter scheidet sie
    const G1050 = geraetVon("gtx", ADAPTER.gtx1050), GOMEN = geraetVon("gtx", ADAPTER.omen);
    pruefe("GERÄT der Adapter nennt das Gerät: OMEN „GTX 1060“ (Datei -gtx, Preis), GTX 1050 Richter-Gerät (Datei -gtx1050, kein Preis-Lauf), ohne Adapter der Klasse keine Akte", () => {
        const ohne = [geraetVon("gtx", ADAPTER.radeon), geraetVon("gtx", { fehler: "Zugriff verweigert" }), geraetVon("gtx", undefined), geraetVon("headless", ADAPTER.gtx1050)];
        const a = akten({ ...basis, geraet: "gtx", adapter: ADAPTER.radeon });
        return GOMEN.name === "GTX 1060" && GOMEN.datei === "gtx" && GOMEN.preis === true && G1050.name === "GTX 1050" && G1050.datei === "gtx1050" && G1050.preis === false &&
            /^kein Preis-Gerät: GTX 1050 steht unter dem Preis-Band der Klasse gtx/.test(G1050.grund) && ohne.every((G) => G.name === null && G.preis === false && G.grund) &&
            brauchtPreisLauf("vegetation.K2#1", undefined, GOMEN) && !brauchtPreisLauf("vegetation.K2#1", undefined, G1050) && !brauchtPreisLauf("vegetation.K2#1") &&
            a.length === 1 && a[0].kein && /kein Adapter der Klasse gtx im Rechner \(AMD Radeon\(TM\) 890M Graphics\)/.test(a[0].grund) ? true : JSON.stringify([GOMEN, G1050, ohne, a]).slice(0, 400);
    });
    pruefe("GERÄT der GTX 1050 schreibt auch aus einem Strom mit roten Bildern KEINEN Preis: preis null, „kein Preis-Gerät“, die Zeile des Logs nennt es", () => {
        const dir = path.join(X, "g1050");
        const a = akten({ ...basis, geraet: "gtx", adapter: ADAPTER.gtx1050, bilder: schwer });
        const z = schreibe({ ...basis, geraet: "gtx", adapter: ADAPTER.gtx1050, bilder: schwer, dir });
        const g = a.length === 1 && a[0].akte && a[0].akte.geraete[0];
        return g && a[0].datei === "leben.pflanzen.kraft.1.7f778d44-gtx1050.json" && g.geraet === "GTX 1050" && g.preis === null && g.richter.urteil === "GRÜN" &&
            /^kein Preis-Gerät/.test(g.ohnePreis) && z.length === 1 && /^KARTE2 Akte leben\.pflanzen\.kraft\.1\.7f778d44-gtx1050\.json: Richter GRÜN · GTX 1050 kein Preis-Gerät/.test(z[0])
            ? true : JSON.stringify([a, z]).slice(0, 400);
    });
    // der Fall von 64fcf12e (geruch#1 · bevoelkerung#1 · absicht#1): die Sprosse steht gebucht (Radeon Richter und Preis GRÜN), am selben
    // Kopf misst die Klasse gtx Richter GRÜN und einen Preis über dem Soll in Ruhe (ROT). Der OMEN senkt, der 1050 nie — auch nicht mit
    // einer Akte, die doch einen roten Preis trägt (eine Akte von Hand oder aus der Zeit vor diesem Schnitt, unter seinem Namen)
    const gebucht = (zweite) => {
        const dir = path.join(X, "gebucht-" + Math.random().toString(36).slice(2, 8));
        schreibe({ ...basis, dir });
        zweite(dir);
        const ak = {};
        for (const n of fs.readdirSync(dir)) ak[n.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
        const z = buche.rechne(JSON.parse(JSON.stringify(karte)), ak, buche.brueckeLesen(fs.readFileSync(path.join(__dirname, "BRUECKE.md"), "utf8")), buche.kopfFolgeFest({ main: [basis.sha] }));
        return { z, b: z.bericht.find((x) => x.leiter === "leben.pflanzen.kraft" && x.sprosse === 1) };
    };
    pruefe("GERÄT gebuchte Sprosse, am selben Kopf der GTX 1050 mit rotem Preis (geschrieben und von Hand): heute bleibt 1; der OMEN mit rotem Preis senkt auf 0 (Kern, beim Namen)", () => {
        const roterPreis = akten({ ...basis, geraet: "gtx", adapter: ADAPTER.omen, bilder: schwer })[0].akte.geraete[0].preis;
        const g1050 = gebucht((dir) => schreibe({ ...basis, geraet: "gtx", adapter: ADAPTER.gtx1050, bilder: schwer, dir }));
        const hand = gebucht((dir) => {
            const a = akten({ ...basis, geraet: "gtx", adapter: ADAPTER.gtx1050 })[0];
            a.akte.geraete[0] = { ...a.akte.geraete[0], preis: roterPreis };
            fs.writeFileSync(path.join(dir, a.datei), JSON.stringify(a.akte));
        });
        const omen = gebucht((dir) => schreibe({ ...basis, geraet: "gtx", adapter: ADAPTER.omen, bilder: schwer, dir }));
        const taeter = [["GTX 1050 geschrieben", g1050], ["GTX 1050 mit rotem Preis von Hand", hand]].filter(([, r]) => r.z.heute !== 1).map(([n, r]) => n + " senkte heute auf " + r.z.heute + ": " + r.b.warum);
        if (taeter.length) return "TÄTER der Preis des 1050 nahm: " + taeter.join(" · ");
        return roterPreis.urteil === "ROT" && g1050.b.stand === "PUNKT" && hand.b.stand === "PUNKT" && omen.z.heute === 0 && omen.b.stand === "KERN" &&
            /Richter GRÜN an GTX 1060, Preis GTX 1060 ROT \(p95 /.test(omen.b.warum) ? true : JSON.stringify([roterPreis.urteil, g1050.b, hand.b, omen.b]).slice(0, 500);
    });
    pruefe("GERÄT buche-2 liest vom GTX 1050 den Richter: sein ROT am selben Kopf nimmt die gebuchte Sprosse (0, beim Namen)", () => {
        const r = gebucht((dir) => schreibe({ ...basis, geraet: "gtx", adapter: ADAPTER.gtx1050, eintrag: { gruen: false, zahl: "Kamm/Tal 1.1" }, dir }));
        return r.z.heute === 0 && r.b.stand === "NULL" && /Richter ROT an GTX 1050/.test(r.b.warum) ? true : JSON.stringify(r.b).slice(0, 300);
    });
    fs.rmSync(X, { recursive: true, force: true });
    console.log(`SELBSTTEST richter-akte: ${ok} GRÜN, ${fehl} ROT`);
    return fehl ? 1 : 0;
}

if (require.main === module) {
    if (process.argv.includes("--selbsttest")) process.exit(selbsttest());
    console.log("Aufruf: node vision/richter-akte.cjs --selbsttest (gerufen wird die Datei von punkte.cjs fahreSitzung)");
}
module.exports = { akten, schreibe, preisImFenster, preisFehlt, brauchtPreisLauf, referenzFuerAkte, geraetVon, adapterLesen, MIN_BILDER, PREIS_S, TAFEL };
