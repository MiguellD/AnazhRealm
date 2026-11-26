// kosmos-hadley Kopf 3 am Prüfstand — bahn-klima#3 (rLaskar) und klimageschichte#2/#3 (das Meer in Erd-Metern), WIE AM GERÄT:
// der Befehl der Station (`node -e` seiteLauf + der Text der Leitern, den die Maschine fährt) läuft als eigener Prozess im
// Spiel-Baum gegen eine Werkbank der Sitzung (save-server + `werkbank.cjs start --port W --seite … --ort wiese`, wie punkte.cjs
// sitzung, ohne --echt: der Null-Renderer misst die Mechanik, die Bilder schießt das Gerät). Der Prüfstand ändert am Befehl nur
// den Umfang: die EINE Leiter (Object.keys(LEITERN) gefiltert) und kein Dorf. Das Urteil spricht die Station selbst (`urteil`
// der Sprosse) über das JSON, das der Befehl schrieb — die Zeile der Karte trägt die Probe der Maschine `[linse-gpu]`, hier als
// Text gesetzt (die Karte ist ein anderes Urteil als die Zahl). Vier Fälle:
//   EICHUNG-B  die alte Station bahn-klima#3 (punkte-maschine): rLaskar fehlt → ROT
//   NEU-B      der Kandidat: rLaskar ≥ 0,7 gegen La2004, zyklenMeer ≥ 20 → GRÜN
//   EICHUNG-B2 die alte Station bahn-klima#2: das bedingungslose `nicht` → ROT „Umfang nicht erzeugbar“, was immer gemessen ist
//   NEU-B2     der Kandidat bahn-klima#2 urteilt am Soll: kein „Umfang nicht erzeugbar“, amp0 und Schneelinie ✓, amp45Faktor beim Namen
//   EICHUNG-K  die alte Station klimageschichte#2: das Meer in Spiel-Metern (≈ −7 m) → ROT; #3 urteilt schon (r skaleninvariant)
//   NEU-K      der Kandidat: #2 Meer −120 ±10 Erd-m, global −6 ±2 °C → GRÜN; #3 GRÜN
// Aufruf: node pruefstand-milankovic.cjs <Spiel-Baum> <punkte-Verzeichnis> <git-Rev der alten Stationen im punkte-Baum> [Port]
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process"), http = require("http"), os = require("os");
const [SPIEL, PUNKTE, ALT_REV, PORT] = process.argv.slice(2);
if (!SPIEL || !PUNKTE || !ALT_REV) throw new Error("Aufruf: <Spiel-Baum> <punkte-Verzeichnis> <git-Rev der alten Stationen> [Port]");
const SD = path.join(PUNKTE, "stationen"), P = require(path.join(PUNKTE, "punkte.cjs"));
const S = Number(PORT) || 4710, W = S + 20000;
const FAELLE = [
    { datei: "k2-zusammenspiel.js", leiter: "planet.kopplung.bahn-klima", sprossen: [2, 3] },
    { datei: "k2-planet.js", leiter: "planet.zeit.klimageschichte", sprossen: [2, 3] },
];
const KARTE = "[linse-gpu] amd/rdna-3 (Probe)", DECKEL_MAL = 10;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "pruef-milankovic-"));

// die Stationen einer Datei (alt aus dem git des punkte-Baums, neu aus dem Baum) → je Sprosse { st, befehl }
function stationen(datei, alt) {
    let f = path.join(SD, datei), weg = null;
    if (alt) {
        f = weg = path.join(SD, ".alt-" + process.pid + "-" + datei);
        fs.writeFileSync(f, cp.execFileSync("git", ["show", ALT_REV + ":meisterkarte-quelle/punkte/stationen/" + datei], { cwd: PUNKTE, encoding: "utf8", maxBuffer: 64 << 20 }));
    }
    delete require.cache[require.resolve(f)];
    const m = require(f);
    if (weg) fs.unlinkSync(weg);
    return m;
}
const get = (port, weg) => new Promise((ja) => { const q = http.get({ host: "127.0.0.1", port, path: weg, timeout: 2000 }, (a) => { a.resume(); ja(true); }); q.on("error", () => ja(false)); q.on("timeout", () => { q.destroy(); ja(false); }); });
const warte = (ms) => new Promise((ja) => setTimeout(ja, ms));

async function lauf(fall, alt) {
    const m = stationen(fall.datei, alt);
    const erste = m.find((s) => P.schluessel(s) === "karte2." + fall.leiter + "#" + fall.sprossen[0]);
    if (!erste) throw new Error(fall.datei + (alt ? " (alt)" : "") + " trägt keine Sprosse " + fall.leiter + "#" + fall.sprossen[0]);
    const b = erste.probe.befehl.slice();
    const art = b[b.length - 1];
    const schleife = "for (const id of Object.keys(LEITERN)) {", deckel = "L.sek * 1000))";
    for (const t of [schleife, "if (DORF) {", deckel]) if (art.split(t).length !== 2) throw new Error("der Befehl trägt „" + t + "“ nicht genau einmal");
    // der Deckel der Leiter × DECKEL_MAL: der Container (Null-Renderer, CPU-Faden) misst langsamer als das Gerät — der Deckel urteilt
    // am Gerät, hier zählt die Zahl (die Laufzeit steht im Ergebnis)
    b[b.length - 1] = art.replace(schleife, "for (const id of Object.keys(LEITERN).filter((x) => x === " + JSON.stringify(fall.leiter) + ")) {").replace("if (DORF) {", "if (false) {").replace(deckel, "L.sek * 1000 * " + DECKEL_MAL + "))");
    const aus = path.join(TMP, (alt ? "alt-" : "neu-") + fall.leiter.replace(/\W+/g, "-") + ".json");
    const argv = b.slice(1).map((x) => String(x).replace("{AUS}", aus).replace("{PORT}", String(S)).replace("{SEK}", String(erste.probe.sek)));
    const t = Date.now();
    const r = cp.spawnSync(b[0], argv, { cwd: SPIEL, encoding: "utf8", maxBuffer: 64 << 20, env: { ...process.env, PUNKTE_PROBE_DECKEL_S: String(erste.probe.sek * DECKEL_MAL) }, timeout: (erste.probe.sek * DECKEL_MAL + 60) * 1000 });
    const j = fs.existsSync(aus) ? JSON.parse(fs.readFileSync(aus, "utf8")) : null;
    const urteile = fall.sprossen.map((nr) => {
        const st = m.find((s) => P.schluessel(s) === "karte2." + fall.leiter + "#" + nr);
        const u = st.urteil(j, { stdout: KARTE + "\n" + (r.stdout || "") });
        const roh = j && j.leitern && j.leitern[fall.leiter] && j.leitern[fall.leiter].sprossen ? j.leitern[fall.leiter].sprossen[nr] : null;
        return { nr, gruen: !!u.gruen, zahl: String(u.zahl || ""), werte: roh && roh.werte };
    });
    return { s: (Date.now() - t) / 1000, exit: r.status, stdoutEnde: String(r.stdout || "").trim().split("\n").slice(-2).join(" | ").slice(0, 300), warf: j && j.leitern && j.leitern[fall.leiter] && j.leitern[fall.leiter].warf, urteile };
}

(async () => {
    const t0 = Date.now();
    const sl = fs.openSync(path.join(TMP, "save.log"), "w"), wl = fs.openSync(path.join(TMP, "werkbank.log"), "w");
    const sv = cp.spawn("node", ["save-server.js"], { cwd: SPIEL, env: { ...process.env, PORT: String(S) }, stdio: ["ignore", sl, sl] });
    for (let i = 0; !(await get(S, "/")); i++) { if (i > 60) throw new Error("der save-server steht nicht auf " + S); await warte(1000); }
    const wb = cp.spawn("node", ["scripts/werkbank.cjs", "start", "--port", String(W), "--seite", "http://localhost:" + S, "--ort", "wiese"], { cwd: SPIEL, env: { ...process.env, WERKBANK_PORT: String(W) }, stdio: ["ignore", wl, wl] });
    const wlog = () => fs.readFileSync(path.join(TMP, "werkbank.log"), "utf8");
    for (let i = 0; !/WERKBANK bereit/.test(wlog()); i++) {
        if (wb.exitCode != null || /WERKBANK-FEHLER/.test(wlog()) || i > 600) throw new Error("die Werkbank startet nicht: " + wlog().trim().split("\n").slice(-3).join(" | "));
        await warte(500);
    }
    const tBoot = (Date.now() - t0) / 1000;
    const E = {};
    for (const fall of FAELLE) { E["alt " + fall.leiter] = await lauf(fall, true); E["neu " + fall.leiter] = await lauf(fall, false); }
    wb.kill("SIGTERM"); sv.kill("SIGTERM");
    const u = (k, nr) => E[k].urteile.find((x) => x.nr === nr);
    const B = "planet.kopplung.bahn-klima", K = "planet.zeit.klimageschichte";
    const pruef = [
        ["EICHUNG-B die alte Station bahn-klima#3 urteilt ROT (rLaskar fehlt)", !u("alt " + B, 3).gruen && !(u("alt " + B, 3).werte || {}).rLaskar, u("alt " + B, 3)],
        ["NEU-B der Kandidat bahn-klima#3 urteilt GRÜN: rLaskar ≥ 0,7 gegen La2004, zyklenMeer ≥ 20", u("neu " + B, 3).gruen && (u("neu " + B, 3).werte || {}).rLaskar >= 0.7, u("neu " + B, 3)],
        ["EICHUNG-B2 die alte Station bahn-klima#2 urteilt ROT „Umfang nicht erzeugbar“ (das bedingungslose nicht)", !u("alt " + B, 2).gruen && /Umfang nicht erzeugbar/.test(u("alt " + B, 2).zahl), u("alt " + B, 2)],
        ["NEU-B2 der Kandidat bahn-klima#2 urteilt am Soll: kein „Umfang nicht erzeugbar“, amp0 ✓ und Schneelinie ✓, amp45Faktor beim Namen", !/Umfang nicht erzeugbar/.test(u("neu " + B, 2).zahl) && /amp0Prozent [^·]*✓/.test(u("neu " + B, 2).zahl) && /schneelinieVersatzM [^·]*✓/.test(u("neu " + B, 2).zahl) && /amp45Faktor [\d,]+ gegen Soll ≥ 2 (✓|✗)/.test(u("neu " + B, 2).zahl), u("neu " + B, 2)],
        ["EICHUNG-K die alte Station klimageschichte#2 urteilt ROT (das Meer in Spiel-Metern)", !u("alt " + K, 2).gruen && Math.abs((u("alt " + K, 2).werte || {}).meerM) < 20, u("alt " + K, 2)],
        ["NEU-K der Kandidat klimageschichte#2 urteilt GRÜN: Meer −120 ±10 Erd-m, global −6 ±2 °C", u("neu " + K, 2).gruen, u("neu " + K, 2)],
        ["NEU-K klimageschichte#3 urteilt GRÜN (Gipfel 41/100 ka, r ≤ −0,8 über 3 Ma)", u("neu " + K, 3).gruen, u("neu " + K, 3)],
    ];
    for (const [name, ok, beleg] of pruef) console.log((ok ? "✅ " : "❌ ") + name + "\n     " + JSON.stringify(beleg).slice(0, 400));
    console.log(JSON.stringify({ bootS: tBoot, laufS: Object.fromEntries(Object.entries(E).map(([k, v]) => [k, v.s])), exit: Object.fromEntries(Object.entries(E).map(([k, v]) => [k, v.exit])), warf: Object.fromEntries(Object.entries(E).map(([k, v]) => [k, v.warf || null])), altK3: u("alt " + K, 3) }));
    const rot = pruef.filter((p) => !p[1]).length;
    console.log(rot ? "PRÜFSTAND ROT: " + rot + " von " + pruef.length : "PRÜFSTAND GRÜN: " + pruef.length + " von " + pruef.length);
    process.exit(rot ? 1 : 0);
})().catch((e) => {
    console.log("PRÜFSTAND WARF: " + ((e && e.stack) || e));
    process.exit(2);
});
