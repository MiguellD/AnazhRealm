// front2.cjs — DIE FRONT DER KARTE 2 über die Richter-Tafel: je Leiter die nächste Sprosse, die zählen würde (lückenlose Folge von unten;
// „glieder“: jede ungebuchte), ihre Station laut vision/richter-tafel.json (punkte-maschine) und deren jüngstes Urteil.
// Aufruf: node front2.cjs <repo> <kopf8…> [--liste <datei>]   (Köpfe jüngster zuerst)
const cp = require("child_process"), fs = require("fs");
const a = process.argv.slice(2), REPO = a[0], KOEPFE = a.slice(1).filter((x) => /^[0-9a-f]{8}$/.test(x));
const AUS = a.includes("--liste") ? a[a.indexOf("--liste") + 1] : null;
const zeig = (ref, p) => { try { return cp.execSync(`git -C "${REPO}" show "${ref}:${p}"`, { maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }).toString(); } catch (e) { return null; } };
const karte = JSON.parse(zeig("origin/koordination", "vision/meisterkarte-2.json"));
const tafel = JSON.parse(zeig("origin/punkte-maschine", "vision/richter-tafel.json")).zeilen;
const T = new Map(Object.values(tafel).map((z) => [z.leiter + "#" + z.sprosse, z]));
const leitern = karte.gruppen.flatMap((g) => g.kriterien);
const M = [];
for (const K of KOEPFE) for (const g of ["gtx", "radeon"]) { const t = zeig("origin/punkte-maschine", `meisterkarte-quelle/punkte/messung/${K}-${g}.json`); if (t) { const m = JSON.parse(t); M.push({ K, g, je: m.je || {}, un: m.ungemessen || {} }); } }
const start = (v) => !!v && /^Start: /.test(String(v.grund || ""));
const juengst = (s) => { // erstes echtes Urteil (GRÜN/ROT) über die Köpfe, sonst der jüngste UNGEMESSEN-Eintrag, sonst nichts
    let un = null;
    for (const m of M) { const v = m.je[s], u = m.un[s]; if (v && !v.ungemessen && !start(v) && !(u && String(u.zeit || "") >= String(v.zeit || ""))) return { ...m, v, k: v.gruen ? "GRÜN" : "ROT" }; if (!un && (u || v)) un = { ...m, v: u || v, k: "UNGEMESSEN" }; }
    return un;
};
const klasse = (j) => { if (!j) return "NIE GEMESSEN"; if (j.k !== "ROT") return j.k; const t = String(j.v.grund || "") + " " + String(j.v.zahl || ""); return /Umfang nicht erzeugbar/.test(t) ? "ROT Umfang" : /Leser fehlt|fehlender Leser/.test(t) ? "ROT Leser fehlt" : "ROT anderes"; };
const front = []; let hinterGruen = [];
for (const L of leitern) {
    const n = L.sprossen.length, h = L.heute || 0;
    const nimm = (nr, glied) => { const z = T.get(L.id + "#" + nr); const f = { sprosse: L.id + "#" + nr, station: z && z.richter === "gleich" ? z.station : null, glied }; f.j = f.station ? juengst(f.station) : null; f.k = f.station ? klasse(f.j) : "RICHTER FEHLT"; return f; };
    if (L.zaehlung === "glieder") { const da = new Set(L.heuteSprossen || []); for (const s of L.sprossen) if (!da.has(s.nr)) front.push(nimm(s.nr, true)); continue; }
    if (h >= n) continue;
    front.push(nimm(L.sprossen[h].nr, false));
    for (let i = h + 1; i < n; i++) { const f = nimm(L.sprossen[i].nr, false); if (f.k === "GRÜN") hinterGruen.push(f.sprosse + " (Front " + front[front.length - 1].sprosse.split("#")[1] + " " + front[front.length - 1].k + ")"); }
}
console.log(`Leitern ${leitern.length} · gebucht ${karte.summe.heute} · FRONT ${front.length} Sprossen an ${new Set(front.map((f) => f.station).filter(Boolean)).size} Stationen · GRÜN hinter der Front ohne Zählung: ${hinterGruen.length}`);
console.log("  " + hinterGruen.join(" · "));
const G = new Map();
for (const f of front) G.set(f.k, (G.get(f.k) || []).concat(f));
for (const [k, xs] of [...G].sort((x, y) => y[1].length - x[1].length)) {
    console.log(`\n== ${k}: ${xs.length}`);
    if (k === "RICHTER FEHLT" || k === "NIE GEMESSEN" || k === "GRÜN") { console.log("  " + xs.map((f) => f.sprosse + (f.station ? " ← " + f.station : "")).join(" · ").slice(0, 1500)); continue; }
    const U = new Map();
    for (const f of xs) { const v = f.j.v; let t = String(k === "UNGEMESSEN" ? v.grund : v.zahl || v.grund || ""); const m = t.match(/Umfang nicht erzeugbar[^·|]{0,60}|Leser fehlt[^·|]{0,60}|fehlender Leser[^·|]{0,60}|die Welt der Sitzung trägt nicht mehr|die Fahrt riss|Last: Referenz|Urteils-Zeile fehlt|ENAMETOOLONG|Werkzeug-Bruch|Frist der Probe|Wirt-Wache|die Messung der Leiter warf/); t = (m ? m[0] : t.slice(0, 50)).replace(/\d+([.,]\d+)?/g, "N").trim(); U.set(t, (U.get(t) || []).concat(f.sprosse)); }
    for (const [t, ids] of [...U].sort((x, y) => y[1].length - x[1].length).slice(0, 9)) console.log(`  ${String(ids.length).padStart(3)} × ${t} · z. B. ${ids.slice(0, 3).join(" ")}`);
}
if (AUS) { fs.writeFileSync(AUS, front.map((f) => [f.sprosse, f.station || "-", f.k, f.j ? f.j.K + "-" + f.j.g : "-"].join("\t")).join("\n") + "\n"); console.log("\n→ " + AUS); }
