// start-lesen.cjs <lauf.json> — NAVIGATION → RENDERER: aus der Start-Spur neben dem Lauf (<lauf>.trace.json; devtools.timeline,
// loading, blink.user_timing) der Haupt-Faden der Seite im Fenster Navigation → `rendererReady` (Marke der Sonde):
// je Abschnitt (bis Klasse · Klasse → Spieler · Spieler → Renderer) belegt/frei, die größten Ereignisse beim Namen
// (EvaluateScript und v8.compile je Datei, ParseHTML, FunctionCall), und das Netz der Skripte (erste Anfrage → letzte Antwort).
const fs = require("fs");
const lauf = process.argv[2];
const b = JSON.parse(fs.readFileSync(lauf, "utf8"));
const j = JSON.parse(fs.readFileSync(lauf.replace(/[.]json$/, ".trace.json"), "utf8"));
const ev = j.traceEvents || j;
const M = b.marken || {};
const nav = ev.filter((e) => e.name === "navigationStart" && e.args && e.args.data && /index[.]html/.test(String(e.args.data.documentLoaderURL || ""))).sort((x, y) => x.ts - y.ts)[0];
if (!nav) throw new Error("kein navigationStart der Seite in der Spur");
const [pid, tid, t0] = [nav.pid, nav.tid, nav.ts];
const ms = (ts) => (ts - t0) / 1000;
const ENDE = M.rendererReady;
const X = ev.filter((e) => e.ph === "X" && e.pid === pid && e.tid === tid && e.dur > 0 && ms(e.ts) < ENDE && ms(e.ts + e.dur) > 0);
// die Aufgaben der obersten Ebene (RunTask) → belegt je Abschnitt
const aufgaben = X.filter((e) => e.name === "RunTask" || e.name === "ThreadControllerImpl::RunTask");
const belegt = (a, z) => aufgaben.reduce((s, e) => s + Math.max(0, Math.min(ms(e.ts + e.dur), z) - Math.max(ms(e.ts), a)), 0);
const abschnitte = [["Navigation → Klasse", 0, M.klasse], ["Klasse → Spieler", M.klasse, M.spieler], ["Spieler → Renderer", M.spieler, M.rendererReady]];
console.log(`MARKEN ${JSON.stringify(M)} · Haupt-Faden pid ${pid} tid ${tid} · ${X.length} Ereignisse im Fenster`);
for (const [n, a, z] of abschnitte) console.log(`  ${n.padEnd(22)} ${Math.round(z - a).toString().padStart(5)} ms · belegt ${Math.round(belegt(a, z)).toString().padStart(5)} ms · frei ${Math.round(z - a - belegt(a, z)).toString().padStart(5)} ms`);
const datei = (e) => String((e.args && e.args.data && (e.args.data.url || e.args.data.fileName)) || "").replace(/^https?:\/\/[^/]+\//, "").replace(/[?].*$/, "");
const summe = (name, schluessel) => {
    const je = new Map();
    for (const e of X.filter((e) => e.name === name)) {
        const k = schluessel ? schluessel(e) : name;
        const o = je.get(k) || { ms: 0, n: 0, ab: ms(e.ts) };
        [o.ms, o.n] = [o.ms + e.dur / 1000, o.n + 1];
        je.set(k, o);
    }
    return [...je].sort((x, y) => y[1].ms - x[1].ms);
};
for (const name of ["EvaluateScript", "v8.compile", "v8.compileModule", "v8.evaluateModule", "ParseHTML", "FunctionCall", "v8.produceCache", "V8.DeserializeContext", "MinorGC", "MajorGC"]) {
    const s = summe(name, datei);
    const tot = s.reduce((a, [, o]) => a + o.ms, 0);
    if (!tot) continue;
    console.log(`${name}: Σ ${Math.round(tot)} ms in ${s.reduce((a, [, o]) => a + o.n, 0)} · ` + s.slice(0, 6).map(([k, o]) => `${k || "(ohne Datei)"} ${Math.round(o.ms)} ms@${Math.round(o.ab)}`).join(" · "));
}
// die längsten Ereignisse der zweiten Ebene je Abschnitt (ohne RunTask), nach Dauer
for (const [n, a, z] of abschnitte) {
    const top = X.filter((e) => !/RunTask/.test(e.name) && ms(e.ts) >= a && ms(e.ts) < z && e.dur >= 30000).sort((x, y) => y.dur - x.dur).slice(0, 8);
    console.log(`  ${n}: ` + top.map((e) => `${e.name}${datei(e) ? "[" + datei(e).split("/").pop() + "]" : ""} ${Math.round(e.dur / 1000)} ms@${Math.round(ms(e.ts))}`).join(" · "));
}
// das Netz: je Anfrage ResourceSendRequest → ResourceFinish (Renderer-Prozess der Seite)
const send = new Map();
const netz = [];
for (const e of ev.filter((e) => e.pid === pid && (e.name === "ResourceSendRequest" || e.name === "ResourceFinish")).sort((x, y) => x.ts - y.ts)) {
    const d = (e.args && e.args.data) || {};
    if (e.name === "ResourceSendRequest") send.set(d.requestId, { url: String(d.url || "").replace(/^https?:\/\/[^/]+\//, "").replace(/[?].*$/, ""), ab: ms(e.ts) });
    else if (send.has(d.requestId)) netz.push({ ...send.get(d.requestId), bis: ms(e.ts), bytes: d.encodedDataLength || 0 });
}
const vorR = netz.filter((r) => r.ab < ENDE);
const js = vorR.filter((r) => /[.]js$/.test(r.url));
if (js.length)
    console.log(
        `NETZ bis zum Renderer: ${vorR.length} Antworten, davon ${js.length} Skripte ${(js.reduce((a, r) => a + r.bytes, 0) / 1e6).toFixed(2)} MB · erste Anfrage ${Math.round(Math.min(...js.map((r) => r.ab)))} ms → letzte Antwort ${Math.round(Math.max(...js.map((r) => r.bis)))} ms · die längsten: ` +
            js.sort((x, y) => y.bis - y.ab - (x.bis - x.ab)).slice(0, 5).map((r) => `${r.url.split("/").pop()} ${Math.round(r.bis - r.ab)} ms (${Math.round(r.bytes / 1000)} KB)`).join(" · ")
    );
