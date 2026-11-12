// Aufruf: node <ort>/zaehl-lesen.cjs <ordner>      (Läufe <buchstabe><nr>.json mit eingriff/zeuge-faeden.js, daneben <lauf>-erstbild.jpg)
// zaehl-lesen.cjs <ordner> — die gezählten Kalt-Boots: je Lauf, ob er HING (der Wald-Faden antwortete nie oder das erste Bild kam
// mit ≤ 14 Term-Wechseln und kleinem JPEG), Bild − Renderer, der Start des Wald-Fadens (Geburt → erste Antwort), Neugeburten;
// je Fall (Buchstabe): hängend von n, das Mittel der gesunden.
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const F = {};
for (const f of fs.readdirSync(D).filter((n) => /^[a-z]\d+[.]json$/.test(n)).sort((a, b) => a[0].localeCompare(b[0]) || Number(a.slice(1, -5)) - Number(b.slice(1, -5)))) {
    let j;
    try {
        j = JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
    } catch (err) {
        console.log(f, "nicht lesbar:", err.message);
        continue;
    }
    const name = f.replace(/[.]json$/, "");
    const x = j.extra || {};
    const P = x.passiv || {};
    const W = (P.faeden || {}).wald || { geboren: [], antwort: [] };
    const jpg = path.join(D, name + "-erstbild.jpg");
    const kb = fs.existsSync(jpg) ? Math.round(fs.statSync(jpg).size / 1000) : 0;
    const terme = (j.terme || []).length;
    const m = j.marken || {};
    const boot = Number.isFinite(m.weltbild) && Number.isFinite(m.rendererReady);
    const letzte = W.antwort.length ? W.antwort[W.antwort.length - 1] : undefined;
    const stumm = W.geboren.length > 0 && letzte === null;
    const hing = !boot || stumm || (terme <= 14 && kb < 120);
    const start = W.geboren.length && letzte != null ? letzte - W.geboren[W.geboren.length - 1] : null;
    const bruch = (P.fehler || []).filter((e) => e[1] === "bruch").map((e) => e[2].slice(0, 150));
    const s = (F[name[0]] = F[name[0]] || { n: 0, hing: 0, dt: [], start: [], neu: 0, bruch: 0, ohneFaden: 0, geburt: [] });
    s.n++;
    if (hing) s.hing++;
    else s.dt.push(m.weltbild - m.rendererReady);
    if (start != null) s.start.push(start);
    if (W.geboren.length) s.geburt.push(W.geboren[0]);
    else s.ohneFaden++;
    s.neu += (x.neu || []).length;
    if (bruch.length) s.bruch++;
    console.log(
        `${name.padEnd(4)} ${hing ? "HING  " : "gesund"} Bild−R ${boot ? m.weltbild - m.rendererReady : "—"} · Terme ${terme} · Bild ${kb} KB · Wald-Faden geboren ${W.geboren.join("/") || "nie"} → Antwort ${W.antwort.map((a) => (a === null ? "NIE" : a)).join("/") || "—"}${(x.neu || []).length ? " · neu geboren " + JSON.stringify(x.neu) : ""}${bruch.length ? " · BRUCH " + bruch.join(" | ") : ""}`
    );
}
const mittel = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : "—");
for (const [k, s] of Object.entries(F))
    console.log(
        `FALL ${k}: hängend ${s.hing} von ${s.n} · gesund Bild−Renderer ${mittel(s.dt)} ms (${s.dt.length ? Math.min(...s.dt) + "–" + Math.max(...s.dt) : "—"}) · Wald-Faden geboren bei ${mittel(s.geburt)} ms, Start ${mittel(s.start)} ms · neu geboren ${s.neu} · Boots mit Bruch-Meldung ${s.bruch}`
    );
