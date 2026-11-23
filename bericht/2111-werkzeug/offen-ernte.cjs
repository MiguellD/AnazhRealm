// node offen-ernte.cjs [--seit JJJJ-MM-TT] [--ort pfad,pfad,...] [--liste]
// Die Ernte der Offen-Sätze je LANDUNG (Merge „w28-X in integ-probe“ auf origin/main): je Landung der zuletzt geschriebene Offen-Satz
// ihres Zweigs (er löst die früheren ab), geteilt in Punkte, je Punkt seine ADRESSE — `sprosse` (eine Sprosse der Karte 2: die
// Punkte-Maschine liest sie), `messung` (eine Wand, eine Runde, eine Station, ein pm-Auftrag: ein Dienst liest sie), sonst `ohne` (kein Leser).
// Mit --ort nur die Landungen, deren Dateien einen der Pfade berühren, dazu die Zeilen des FUND-REGISTERs, die einen davon nennen:
// das ist „Offen am Ort“ — der Block, den jeder Brief in diesem Gebiet erbt (Gebot 2: die Klasse fällt in derselben Welle).
const cp = require("child_process");
// der Klon, in dem der Aufruf steht (jedes Gerät, jede Cloud-Sitzung; origin/main und origin/koordination geholt)
const R = cp.execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const seit = arg("--seit", "2026-11-21");
const ort = (arg("--ort", "") || "").split(",").map((s) => s.trim()).filter(Boolean);
const liste = process.argv.includes("--liste");
const git = (...a) => cp.execFileSync("git", a, { cwd: R, encoding: "utf8", maxBuffer: 256 << 20 });

const merges = git("log", "--first-parent", "--merges", "--format=%H %P%x1f%ad%x1f%s", "--date=format:%d.%m %H:%M", `--since=${seit}`, "origin/main")
    .trim().split("\n").filter(Boolean)
    .map((l) => { const [hp, d, s] = l.split("\x1f"); const [m, p1, p2] = hp.split(" "); return { m, p1, p2, d, s }; })
    .filter((x) => /^Merge (w\d+-[^ ]+) in integ-probe/.test(x.s));

const OFFEN = /Offen[^:]{0,20}:\s*(.+?)(?=(Karte 2 gebucht|Co-Authored-By|ZWISCHENSTAND|$))/i;
const SPROSSE = /\b[a-z]+(?:\.[a-z0-9_-]+)*#\d+\b/;
const MESSUNG = /gate:[\w:-]+|\bRunde\b|\bStation\b|\bpm-[\w-]+|\bgemessen\b|\bungemessen\b|\bmisst\b|Radeon|OMEN|GTX/i;
const landungen = [];
for (const x of merges) {
    const name = /^Merge (w\d+-[^ ]+)/.exec(x.s)[1];
    const roh = git("log", "--no-merges", "--format=%x1e%h%x1f%s%x1f%b", `${x.p1}..${x.p2}`);
    let offen = null, von = null;
    for (const blk of roh.split("\x1e").slice(1)) {
        const [h, s, b] = blk.split("\x1f");
        if (/^WIP/.test(s)) continue;
        const m = OFFEN.exec((b || "").replace(/\s+/g, " "));
        if (m) { offen = m[1].trim().replace(/[.\s]+$/, ""); von = h; break; } // jüngster zuerst
    }
    const dateien = git("diff", "--name-only", x.p1, x.m).trim().split("\n").filter(Boolean);
    const punkte = offen ? offen.split(/;\s+|\s+·\s+|\.\s+(?=[A-ZÄÖÜ])/).map((p) => p.trim()).filter((p) => p.length > 3)
        .map((p) => ({ p, adr: SPROSSE.test(p) ? "sprosse" : MESSUNG.test(p) ? "messung" : "ohne" })) : [];
    landungen.push({ name, d: x.d, von, dateien, punkte });
}
const trifft = (L) => !ort.length || L.dateien.some((f) => ort.some((o) => f.startsWith(o) || f.endsWith(o)));
const sicht = landungen.filter(trifft);
const z = { sprosse: 0, messung: 0, ohne: 0 };
for (const L of sicht) for (const q of L.punkte) z[q.adr]++;
if (liste || ort.length)
    for (const L of sicht.filter((L) => L.punkte.length)) {
        console.log(`${L.d} ${L.name} (${L.von})`);
        for (const q of L.punkte) console.log(`   [${q.adr}] ${q.p.slice(0, 220)}`);
    }
const reg = git("show", "origin/koordination:FUND-REGISTER.md").split("\n").filter((l) => /^- \d\d\.\d\d\./.test(l));
const regOrt = ort.length ? reg.filter((l) => ort.some((o) => l.includes(o.split("/").pop()))) : reg;
if (ort.length) { console.log(`FUND-REGISTER am Ort: ${regOrt.length}`); for (const l of regOrt.slice(0, 12)) console.log("   " + l.slice(0, 240)); }
const n = sicht.reduce((a, L) => a + L.punkte.length, 0);
console.log(`LANDUNGEN seit ${seit}: ${sicht.length}, davon mit Offen ${sicht.filter((L) => L.punkte.length).length} · PUNKTE ${n}: sprosse ${z.sprosse} · messung ${z.messung} · OHNE ADRESSE ${z.ohne} · FUND-REGISTER ${regOrt.length} Zeilen (ältste ${reg.length ? reg.map((l) => l.slice(2, 8)).sort((a, b) => a.slice(3) + a.slice(0, 2) < b.slice(3) + b.slice(0, 2) ? -1 : 1)[0] : "—"})`);
