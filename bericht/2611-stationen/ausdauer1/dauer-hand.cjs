// HAND-LAUF der Dauer-Probe (karte2.same.preis.ausdauer#1, Leser 2, 26.11.): der ECHTE Befehl der Station (`probe.befehl`, wie der
// Läufer ihn fährt: node -e <Programm> dauer <AUS>) gegen eine Attrappe der Werkbank — /umstellen, /eval (Zapfen des Stroms, Tor und
// Bau, Nacht, Probe der Seite, Stand), /lauf (schläft sek, je 50 ms ein Bild im Strom), /puffer (der Heap nach dem Collector) —, der
// Strom der Sitzung eine Datei mit der Marke des Anfangs `vor` s vor dem Start; danach urteilt der ECHTE Richter der Station.
// Die Wolke zeichnet kein Bild (swiftshader verliert beim Lesen das Gerät): das misst die Mechanik der Minute, nie das Spiel.
//   node dauer-hand.cjs <stationen-dir> <spiel-baum> [vor_s=49.2] [deckel_s=60] [haelt_mb_min=30] [name]
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const { spawnSync, spawn } = require("child_process");
const [DIR, BAUM, VOR = "49.2", DECKEL = "60", HAELT = "30", NAME = "gezielt"] = process.argv.slice(2);
const vorS = Number(VOR), haelt = Number(HAELT);
const stationen = require(path.resolve(DIR, "g6.js"));
const st = stationen.find((s) => s.kriterium === "karte2.same.preis.ausdauer" && s.staffel === 1);
const k5 = stationen.find((s) => s.kriterium === "profiband.K5" && s.staffel === 1);
const PUNKTE = path.resolve(DIR, "..", "punkte.cjs");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dauer-hand-"));
const STROM = path.join(tmp, "strom.jsonl"), LOG = path.join(tmp, "sitzung.log"), AUS = path.join(tmp, "aus.json");
fs.writeFileSync(LOG, "[linse-gpu] nvidia/pascal (Attrappe der Werkbank)\n");
// DAS SPIEL DER ATTRAPPE: der gehaltene Heap steigt `haelt` MB/min ab dem Anfang, der rohe trägt dazu die Säge (4 MB/s Müll, alle 15 s
// eingesammelt) — der Collector (/puffer) sieht nur den gehaltenen
const T_ANFANG = Date.now() - vorS * 1000, URSPRUNG = T_ANFANG - 60000;
const gehalten = (t) => 300 + (haelt * (t - T_ANFANG)) / 60000;
const roh = (t) => gehalten(t) + 4 * (((t - T_ANFANG) / 1000) % 15);
const namen = { wetter: ["sunny"], zelle: [] };
const nr = (a, x) => (a.includes(x) ? a.indexOf(x) : a.push(x) - 1);
let zelle = -1, puffer = [];
const bild = (t, zi) => [t - URSPRUNG, 16.7, 4.2, 110, 10, 150, 500000, 0, 0, 1, "0", 1, false, 1, 0, zi];
// die Sitzung vor der Dauer-Probe: die Marke des Anfangs, dann je 3 s ein Block (der erste ein Anker-Fenster der Glätte)
const zeile = (o) => fs.appendFileSync(STROM, JSON.stringify(o) + "\n");
zeile({ probe: "glaette", zeit: new Date(T_ANFANG).toISOString(), marke: "dauer-anfang", wert: { zeit: T_ANFANG, heapMB: +gehalten(T_ANFANG).toFixed(1), vram: { mb: 110 }, puffer: {}, halter: [], tiere: {} } });
for (let t = T_ANFANG + 300, i = 0; t < Date.now() - 3000; t += 3000, i++) {
    const zi = i === 0 ? nr(namen.zelle, "dauer-genesis-ego-geht") : -1, z = [];
    for (let u = t; u < t + 2300; u += 50) z.push(bild(u, zi));
    zeile({ probe: "glaette", zeit: new Date(t + 2300).toISOString(), bereit: true, seite: "s1", ursprung: URSPRUNG, zeilen: z, namen, verloren: 0, fehler: 0, heap: +roh(t + 2300).toFixed(1) });
}
const srv = http.createServer((q, a) => {
    let s = "";
    q.on("data", (c) => (s += c));
    q.on("end", async () => {
        const b = s ? JSON.parse(s) : {}, schick = (o) => (a.setHeader("content-type", "application/json"), a.end(JSON.stringify(o)));
        if (q.url === "/umstellen") return setTimeout(() => schick({ ort: b.ort }), 300);
        if (q.url === "/puffer") return schick({ heapMB: +gehalten(Date.now()).toFixed(1), vram: { mb: 110.2 }, puffer: { ruhend: 0, verwaist: 0 } });
        if (q.url === "/lauf") {
            const t0 = Date.now(), ende = t0 + (Number(b.sek) + Number(b.ein || 0)) * 1000;
            while (Date.now() < ende) {
                puffer.push(bild(Date.now(), zelle));
                await new Promise((f) => setTimeout(f, 50));
            }
            return schick({ sekunden: b.sek, regler: b.regler, belegung: {}, wetterHalt: {}, wetter: "sunny", bahnM: 4 * b.sek, stellgroessen: { loadScale: 1, szeneSkala: 0.75 } });
        }
        if (q.url === "/eval") {
            const c = String(b.code || "");
            if (/stromSeite/.test(c)) {
                const m = /\)\(r, (\{.*\})\);$/.exec(c), arg = m ? JSON.parse(m[1]) : {};
                const zeilen = puffer;
                puffer = [];
                if ("zelle" in arg) zelle = arg.zelle == null ? -1 : nr(namen.zelle, String(arg.zelle));
                return schick({ ergebnis: { bereit: true, seite: "s1", ursprung: URSPRUNG, zeilen, namen, verloren: 0, fehler: 0, heap: +roh(Date.now()).toFixed(1) } });
            }
            if (/enterPortal/.test(c)) return setTimeout(() => schick({ ergebnis: { bau: true, tor: true, heim: true } }), 3000);
            if (/setTimeOfDay/.test(c)) return setTimeout(() => schick({ ergebnis: { nacht: 0, mittag: 0.5 } }), 1000);
            if (/__heapHalter/.test(c)) return schick({ ergebnis: { halter: [], tiere: {} } });
            return schick({ ergebnis: { gehalten: false, sicht: "first", speed: 4.5, sprint: 7.2, skala: 0.75 } });
        }
        schick({ fehler: "Attrappe kennt " + q.url + " nicht" });
    });
});
srv.listen(0, "127.0.0.1", () => {
    const port = srv.address().port, [cmd, ...args] = st.probe.befehl.map((x) => (x === "{AUS}" ? AUS : x));
    const env = { ...process.env, WERKBANK_PORT: String(port), PUNKTE_SITZUNG_STROM: STROM, PUNKTE_PROBE: "karte2.same.preis.ausdauer#1", PUNKTE_MASCHINE: PUNKTE, PUNKTE_SITZUNG_LOG: LOG, PUNKTE_PROBE_DECKEL_S: DECKEL };
    const t0 = Date.now();
    const p = spawn(cmd === "node" ? process.execPath : cmd, args, { cwd: path.resolve(BAUM), env });
    let out = "", err = "";
    p.stdout.on("data", (c) => (out += c));
    p.stderr.on("data", (c) => (err += c));
    p.on("close", (exit) => {
        srv.close();
        const lauf = { exit, stdout: out, stderr: err };
        const u = st.urteil(null, lauf), u5 = k5.urteil(null, lauf);
        const z = JSON.parse((/PROFIBAND (\{.*\})/.exec(out) || [0, "{}"])[1]);
        const d = z.dauer || {};
        console.log("HAND " + NAME + " · vor " + vorS + " s · Deckel " + DECKEL + " s · hält " + haelt + " MB/min · Probe " + ((Date.now() - t0) / 1000).toFixed(1) + " s (Exit " + exit + ")");
        console.log("  Zeuge spielgang " + JSON.stringify(d.spielgang) + " · minuten " + d.minuten + " · Kurve " + JSON.stringify(d.heapKurve) + " · heap " + JSON.stringify(d.heap));
        console.log("  Schritte " + JSON.stringify(z.schritte) + " · Fehler " + JSON.stringify(z.fehler));
        for (const l of out.split("\n").filter((l) => /MESSORT|PROBE ROT/.test(l))) console.log("  " + l.slice(0, 300));
        console.log("  ausdauer#1 " + (u.gruen ? "GRÜN" : "ROT") + " · " + u.zahl);
        console.log("  profiband.K5#1 " + (u5.gruen ? "GRÜN" : "ROT") + " · " + String(u5.zahl));
        if (err.trim()) console.log("  stderr " + err.trim().split("\n").slice(-3).join(" | ").slice(0, 400));
        fs.rmSync(tmp, { recursive: true, force: true });
    });
});
