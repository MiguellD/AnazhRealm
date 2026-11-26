// /eval an der Werkbank (WERKBANK_PORT, 24600): node ev.cjs <datei-mit-code | -e code> [frist_s]
const http = require("http"), fs = require("fs");
const a = process.argv.slice(2);
const code = a[0] === "-e" ? a[1] : fs.readFileSync(a[0], "utf8");
const frist = Number(a[a[0] === "-e" ? 2 : 1] || 60);
const d = JSON.stringify({ code, frist });
const q = http.request({ host: "127.0.0.1", port: Number(process.env.WERKBANK_PORT || 24600), path: process.env.WEG || "/eval", method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(d) }, timeout: (frist + 30) * 1000 }, (r) => {
  let s = ""; r.on("data", (c) => (s += c)); r.on("end", () => { try { const j = JSON.parse(s); console.log(JSON.stringify(j.ergebnis !== undefined ? j.ergebnis : j, null, 0)); } catch (e) { console.log(s.slice(0, 2000)); } });
});
q.on("error", (e) => console.log("FEHLER " + e.message)); q.on("timeout", () => q.destroy(new Error("frist")));
q.end(d);
