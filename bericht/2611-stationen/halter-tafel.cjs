// halter-tafel.cjs — die Tafel „beansprucht, nicht gebucht“ je Sprosse mit ihrem HALTER (G/U/S/T), Leser 26.11.
// Aufruf (in einem Baum, der vision/ und zug/ von punkte-maschine trägt und dessen git origin/main kennt):
//   node bericht/2611-stationen/halter-tafel.cjs <wurzel-pm> <halter.json> > cloud-post/leser-2611.md
// Liest: zug/anspruch.txt (Ansprüche, Kopf-Kommentar), vision/meisterkarte-2.json (heute/heuteSprossen), vision/richter/*.json
// (jüngste Fahrt je Gerät). Die Landung ist der main-SHA im Kopf-Kommentar; „nach“ heißt: die Landung ist Vorfahr des gemessenen Kopfes
// (git merge-base --is-ancestor), sonst das Datum des Kommentars gegen das Datum der Fahrt. Der HALTER steht in <halter.json> von Hand
// (je Sprosse { h: "G|U|S|T", warum: "…" }) — die Tafel rät nie.
"use strict";
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const [B, HALTER] = process.argv.slice(2);
const K = JSON.parse(fs.readFileSync(path.join(B, "vision/meisterkarte-2.json"), "utf8"));
const L = new Map(); for (const g of K.gruppen) for (const l of g.kriterien) L.set(l.id, l);
const H = JSON.parse(fs.readFileSync(HALTER, "utf8"));
const anc = (a, b) => { try { execFileSync("git", ["merge-base", "--is-ancestor", a, b], { stdio: "ignore" }); return true; } catch (e) { return false; } };
const bekannt = (s) => { try { execFileSync("git", ["cat-file", "-e", s + "^{commit}"], { stdio: "ignore" }); return true; } catch (e) { return false; } };
// Ansprüche
let kopf = ""; const an = new Map();
fs.readFileSync(path.join(B, "zug/anspruch.txt"), "utf8").split("\n").forEach((z, i) => {
    if (!z.trim()) return; if (z.startsWith("#")) { kopf = z.slice(2); return; }
    const [zweig, ids] = z.split(/\s+/);
    for (const id of (ids || "").split(",").filter(Boolean)) {
        const m = /^karte2\.(.+)#(\d+)$/.exec(id); if (!m) continue;
        const k = m[1] + "#" + m[2];
        const nr = (/^(?:z)?(\d{3})\b|\bz(\d{3})\b/.exec(kopf) || []).slice(1).find(Boolean) || "";
        const main = (/main ([0-9a-f]{7,8})/.exec(kopf) || [])[1] || "";
        const dat = (/(\d\d)\.11\.(?: (\d\d:\d\d))?/.exec(kopf) || []);
        (an.get(k) || an.set(k, []).get(k)).push({ zweig, zeile: i + 1, nr, main, datum: dat[1] ? `2026-11-${dat[1]}T${dat[2] || "00:00"}` : "", kopf });
    }
});
const gebucht = (id, n) => { const l = L.get(id); return l.zaehlung === "glieder" ? (l.heuteSprossen || []).includes(n) : n <= l.heute; };
const akten = fs.readdirSync(path.join(B, "vision/richter"));
const zeilen = [];
for (const [k, v] of an) {
    const [id, nrT] = k.split("#"), n = +nrT;
    if (!L.has(id) || gebucht(id, n)) continue;
    const fa = [];
    for (const f of akten) if (f.startsWith(id + "." + n + ".") && f.endsWith(".json"))
        for (const x of [].concat(JSON.parse(fs.readFileSync(path.join(B, "vision/richter", f), "utf8"))))
            for (const g of x.geraete || []) fa.push({ sha: x.sha, datum: x.datum, geraet: g.geraet, u: g.richter && g.richter.urteil, preis: g.preis && g.preis.urteil, wert: g.richter && g.richter.wert });
    fa.sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
    const land = v[v.length - 1]; // die jüngste Landung trägt den Anspruch
    const je = (g) => fa.find((f) => f.geraet === g);
    const zelle = (g) => {
        const f = je(g); if (!f) return "keine Akte";
        let nach = "?";
        if (land.main && bekannt(land.main) && bekannt(f.sha)) nach = anc(land.main, f.sha) ? "nach" : "VOR";
        else if (land.datum) nach = new Date(f.datum) > new Date(land.datum + "+01:00") ? "nach" : "VOR";
        return `${f.u} ${f.sha.slice(0, 8)} ${f.datum.slice(5, 16).replace("T", " ")} (${nach})`;
    };
    const h = H[k] || { h: "?", warum: "nicht sortiert" };
    zeilen.push({ k, h: h.h, row: `| ${k} | ${v.map((a) => `${a.nr ? "#" + a.nr + " " : ""}${a.zweig} (Z ${a.zeile}${a.main ? ", main " + a.main : ""}${a.datum ? ", " + a.datum.slice(5).replace("T", " ") : ""})`).join("<br>")} | ${zelle("GTX 1060")} | ${zelle("Radeon 890M")} | **${h.h}** | ${h.warum} |` });
}
const ord = { G: 0, S: 1, U: 2, T: 3, "?": 4 };
zeilen.sort((a, b) => ord[a.h] - ord[b.h] || a.k.localeCompare(b.k));
const z = { G: 0, U: 0, S: 0, T: 0, "?": 0 }; for (const x of zeilen) z[x.h]++;
console.log(`ZAEHLUNG ${zeilen.length} Sprossen · G ${z.G} · U ${z.U} · S ${z.S} · T ${z.T} · offen ${z["?"]}`);
console.log("| Sprosse | Anspruch (Nr. · Zweig · Zeile · Landung) | GTX 1060 jüngst | Radeon 890M jüngst | Halter | Beleg (Zeile der Akte) und der EINE Schritt |");
console.log("|---|---|---|---|---|---|");
for (const x of zeilen) console.log(x.row);
