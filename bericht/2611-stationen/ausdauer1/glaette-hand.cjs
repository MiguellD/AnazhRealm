// HAND-LAUF der Glätte (profiband.K4#1 = der Anfang der Dauer, Leser 2, 26.11.): der ECHTE Befehl der Station gegen eine Attrappe der
// Werkbank, die jede Bitte der Probe in ihrer Folge nennt — der Zeuge, dass jedes Fenster der Tasten (H) seine Uhren beendet (SEITE.k4ende
// nach dem Hänger), auch wenn der Hänger wirft (MUTANTE: /haenger antwortet mit `fehler`).
//   node glaette-hand.cjs <stationen-dir> <spiel-baum> [wirft=0]
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const { spawn } = require("child_process");
const [DIR, BAUM, WIRFT = "0"] = process.argv.slice(2);
const st = require(path.resolve(DIR, "g6.js")).find((s) => s.kriterium === "profiband.K4" && s.staffel === 1);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "glaette-hand-"));
const STROM = path.join(tmp, "strom.jsonl"), LOG = path.join(tmp, "sitzung.log"), AUS = path.join(tmp, "aus.json");
fs.writeFileSync(LOG, "[linse-gpu] nvidia/pascal (Attrappe der Werkbank)\n");
fs.writeFileSync(STROM, "");
const URSPRUNG = Date.now() - 60000, namen = { wetter: ["sunny"], zelle: [] };
const bild = (t) => [t - URSPRUNG, 16.7, 4.2, 110, 10, 150, 500000, 0, 0, 1, "0", 1, false, 1, 0, -1];
let puffer = [];
const folge = [];
const art = (c) => (/stromSeite/.test(c) ? "zapfen" + (/"zelle":null/.test(c) ? "(null)" : /"zelle":"([^"]+)"/.test(c) ? "(" + /"zelle":"([^"]+)"/.exec(c)[1] + ")" : "")
    : /k4ende|delete window\.__k4t/.test(c) ? "K4ENDE" : /window\.__k4 = \{ v: 0 \}/.test(c) ? "k4geh" : /wagen: "-"/.test(c) ? "k4fahrt" : /return window\.__k4 \|\| null/.test(c) ? "tasten-lesen" : "eval");
const srv = http.createServer((q, a) => {
    let s = "";
    q.on("data", (c) => (s += c));
    q.on("end", async () => {
        const b = s ? JSON.parse(s) : {}, schick = (o) => (a.setHeader("content-type", "application/json"), a.end(JSON.stringify(o)));
        if (q.url === "/eval") {
            const c = String(b.code || ""), k = art(c);
            if (k !== "eval") folge.push(k);
            if (k.startsWith("zapfen")) { const z = puffer; puffer = []; return schick({ ergebnis: { bereit: true, seite: "s1", ursprung: URSPRUNG, zeilen: z, namen, verloren: 0, fehler: 0, heap: 300 } }); }
            if (k === "K4ENDE" || k === "tasten-lesen") return schick({ ergebnis: { v: 3, wagen: "werkbank-fahrt", aus: null, ein: "werkbank-fahrt" } });
            if (/__heapHalter/.test(c)) return schick({ ergebnis: { halter: [], tiere: {} } });
            return schick({ ergebnis: { gehalten: false, sicht: "first", speed: 4.5, sprint: 7.2, skala: 0.75 } });
        }
        folge.push(q.url.slice(1));
        if (q.url === "/umstellen") return setTimeout(() => schick({ ort: b.ort }), 200);
        if (q.url === "/puffer") return schick({ heapMB: 300, vram: { mb: 110 }, puffer: {} });
        if (q.url === "/lauf" || q.url === "/haenger") {
            const ende = Date.now() + (Number(b.sek) + Number(b.ein || 0)) * 1000;
            while (Date.now() < ende) { puffer.push(bild(Date.now())); await new Promise((f) => setTimeout(f, 50)); }
            if (q.url === "/haenger" && WIRFT === "1") return schick({ fehler: "Attrappe: der Hänger warf" });
            return schick(q.url === "/haenger" ? { befunde: [], bilder: 50 } : { sekunden: b.sek, regler: b.regler, belegung: {}, wetter: "sunny", bahnM: 4 * b.sek, stellgroessen: { loadScale: 1 } });
        }
        schick({ fehler: "Attrappe kennt " + q.url + " nicht" });
    });
});
srv.listen(0, "127.0.0.1", () => {
    const port = srv.address().port, [cmd, ...args] = st.probe.befehl.map((x) => (x === "{AUS}" ? AUS : x));
    const env = { ...process.env, WERKBANK_PORT: String(port), PUNKTE_SITZUNG_STROM: STROM, PUNKTE_PROBE: "profiband.K4#1", PUNKTE_MASCHINE: path.resolve(DIR, "..", "punkte.cjs"), PUNKTE_SITZUNG_LOG: LOG, PUNKTE_PROBE_DECKEL_S: "90" };
    const p = spawn(process.execPath, args, { cwd: path.resolve(BAUM), env });
    let out = "";
    p.stdout.on("data", (c) => (out += c));
    p.on("close", (exit) => {
        srv.close();
        const z = JSON.parse((/PROFIBAND (\{.*\})/.exec(out) || [0, "{}"])[1]);
        const fenster = folge.join(" ").split(/(?=k4geh|k4fahrt)/).filter((x) => /^k4/.test(x)).map((x) => x.split(" ").slice(0, 6).join(" "));
        console.log("GLÄTTE " + path.basename(path.resolve(DIR, "..", "..", "..")) + (WIRFT === "1" ? " · MUTANTE der Hänger wirft" : "") + " · Exit " + exit + " · Schritte " + JSON.stringify(z.schritte));
        for (const f of fenster) console.log("  Fenster: " + f.trim() + (/K4ENDE/.test(f) ? "   ← die Uhren enden" : "   ← KEIN Ende der Uhren"));
        console.log("  Tasten im Zeugen " + JSON.stringify(Object.fromEntries(Object.entries(z.glaette || {}).map(([k, v]) => [k, v.tasten]))) + " · Fehler " + JSON.stringify(z.fehler));
        fs.rmSync(tmp, { recursive: true, force: true });
    });
});
