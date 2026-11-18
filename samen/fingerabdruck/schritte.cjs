"use strict";
// node schritte.cjs <baum> <geaendert: D3,D4,...> [--aus x.json]
// Abbildung CI-Schritt → Domänen: die Linse an der Quelle gelesen (ihre Datei + eigene scripts/lib-Helfer, ohne die Boot-Infrastruktur):
// jeder Ruf r.X / st.X / r["X"] / AnazhRealm.X → die Stamm-Datei, die X definiert → ihre Domäne. Kein Treffer → aus dem Namen geraten.
// Leser: die Domänen, deren Stamm-Code Glieder der geänderten Domäne ruft (Ruf-Graph auf Datei-Ebene, this.X / AnazhRealm.X).
const fs = require("fs");
const path = require("path");
const BAUM = path.resolve(process.argv[2]);
const GEAENDERT = new Set((process.argv[3] || "").split(",").filter(Boolean));
const rd = (p) => { try { return fs.readFileSync(path.join(BAUM, p), "utf8"); } catch { return ""; } };

const DATEI_DOM = (f) => {
    const b = path.basename(f);
    if (/^(siedlung-verkehr|koerper-fahrt|vehicle-core)/.test(b)) return "D6";
    if (/^(siedlung-bewohner|koerper-|koerper-core|kampf)/.test(b)) return "D5";
    if (/^(kreatur-|tetrapoda-core)/.test(b)) return "D4";
    if (/^(siedlung-|bau-|fachwerk-core|werkstatt-bauen|werkstatt-hof)/.test(b)) return "D3";
    if (/^(vegetation-|phyto-core)/.test(b)) return "D2";
    if (/^(gelaende-|wasser-|voxel-worker|planet-core)/.test(b)) return "D1";
    if (/^(bild-|stoff-|welt-licht)/.test(b)) return "D7";
    if (/^(studio-|foundry-|schmiede-core|porta-core|klang)/.test(b)) return "D8";
    return "D9";
};
const DATEIEN = [...fs.readdirSync(path.join(BAUM, "stamm")).filter((f) => f.endsWith(".js")).map((f) => "stamm/" + f),
    ...fs.readdirSync(BAUM).filter((f) => /-core\.js$|^voxel-worker\.js$|^welt-licht\.js$|^foundry-bruecke\.js$/.test(f))];
// Glied → Domäne (die erste definierende Datei)
const GLIED = new Map();
const def = /^\s{4}(?:async\s+)?(_?[A-Za-z]\w*)\s*\([^)]*\)\s*\{|^\s*(?:AnazhRealm|self|window)\.([A-Za-z_]\w*)\s*=|^\s{4}([A-Za-z_]\w*)\s*:/gm;
const TEXT = {};
for (const f of DATEIEN) {
    const t = (TEXT[f] = rd(f));
    for (const m of t.matchAll(def)) { const n = m[1] || m[2] || m[3]; if (n && !GLIED.has(n) && n.length > 3) GLIED.set(n, DATEI_DOM(f)); }
}
// state-Felder: der erste Schreiber `this.state.X =`
for (const f of DATEIEN) for (const m of TEXT[f].matchAll(/this\.state\.([A-Za-z_]\w*)\s*=[^=]/g)) if (!GLIED.has("st." + m[1])) GLIED.set("st." + m[1], DATEI_DOM(f));
// Ruf-Graph der Domänen: wer ruft wen
const LIEST = {}; // LIEST[d] = Set der Domänen, die d liest
for (const f of DATEIEN) {
    const d = DATEI_DOM(f);
    for (const m of TEXT[f].matchAll(/(?:this|AnazhRealm|r)\.(_?[A-Za-z]\w*)\s*\(/g)) { const z = GLIED.get(m[1]); if (z && z !== d) (LIEST[d] ||= new Set()).add(z); }
    for (const m of TEXT[f].matchAll(/this\.state\.([A-Za-z_]\w*)/g)) { const z = GLIED.get("st." + m[1]); if (z && z !== d) (LIEST[d] ||= new Set()).add(z); }
}
const LESER = new Set([...GEAENDERT]);
for (const [d, s] of Object.entries(LIEST)) for (const g of GEAENDERT) if (s.has(g)) LESER.add(d);

// die Schritte
const SCHRITTE = JSON.parse(fs.readFileSync(path.join(__dirname, "schritte.json"), "utf8")).filter((s) => s.job !== "puls");
const ZEITEN = JSON.parse(rd("spec/ci/ci-zeiten.json")).schritte;
const PKG = JSON.parse(rd("package.json")).scripts;
const INFRA = /welt-boot|urteil-zeile|software-gpu|stamm\.cjs|band-urteil|ausgabe-aufnahme|gpu-schloss|ci-|selbsttest/;
const dateienVon = (run) => {
    const aus = new Set();
    const nimm = (cmd, tiefe = 0) => {
        for (const m of cmd.matchAll(/npm run ([\w:.-]+)/g)) if (PKG[m[1]] && tiefe < 4) nimm(PKG[m[1]], tiefe + 1);
        for (const m of cmd.matchAll(/node\s+([\w./-]+\.c?js)/g)) aus.add(m[1].replace(/^\.\//, ""));
    };
    nimm(run);
    for (const f of [...aus]) for (const m of rd(f).matchAll(/require\(["']\.\/(lib\/[\w.-]+)["']\)|require\(["']\.\/([\w.-]+\.cjs)["']\)/g)) {
        const p = "scripts/" + (m[1] || m[2]); if (!INFRA.test(p)) aus.add(p.endsWith(".cjs") || p.endsWith(".js") ? p : p + ".cjs");
    }
    return [...aus];
};
const NAMEN = [["D4", /kreatur|tier|herde|rudel|gehege/i], ["D5", /mensch|koerper|körper|bewohner|leib|anatomie|kampf|hand/i], ["D6", /fahr|verkehr|wagen|ritt|kamera/i], ["D3", /haus|siedlung|settlement|dorf|stadt|bau|werkstatt|asset-vertrag|regler/i], ["D2", /baum|wald|vegetation|laub|gras|wiese|strauch/i], ["D1", /wasser|boden|gelände|gelaende|dichte|chunk|fluss|höhle|fall-waechter|kollision/i], ["D7", /licht|albedo|stoff|schatten|frost|himmel|bild|schirm/i], ["D8", /studio|foundry|ofen|portal|klang|prägung|praegung/i]];
const zeilen = [];
for (const s of SCHRITTE) {
    const z = ZEITEN[s.name];
    const sek = z ? z.p90 || z.s : 0;
    const dat = dateienVon(s.run);
    const doms = new Set();
    const zahl = {};
    let gelesen = 0;
    for (const f of dat) {
        const t = rd(f);
        for (const m of t.matchAll(/\b(?:r|anazhRealm|AnazhRealm|this\.r|realm)\.(_?[A-Za-z]\w*)|\bst\.([A-Za-z_]\w*)|r\[["'](_?\w+)["']\]/g)) {
            const n = m[1] || m[3], sn = m[2];
            const d = n ? GLIED.get(n) : GLIED.get("st." + sn);
            if (d) { doms.add(d); gelesen++; zahl[d] = (zahl[d] || 0) + 1; }
        }
    }
    let art = gelesen ? "an der Quelle gelesen" : "aus dem Namen geraten";
    if (!gelesen) for (const [d, re] of NAMEN) if (re.test(s.name)) doms.add(d);
    const statisch = !dat.length || /prettier|eslint|syntax|cache|libs|install|checkout|setup|artefakt|upload|hochladen/i.test(s.name);
    const ANTEIL = Number(process.env.ANTEIL || 0.15);
    const dom = gelesen ? Object.keys(zahl).filter((d) => zahl[d] / gelesen >= ANTEIL) : [...doms];
    const dominant = dom.some((d) => GEAENDERT.has(d));
    const direkt = [...doms].some((d) => GEAENDERT.has(d));
    const mitLeser = [...doms].some((d) => LESER.has(d));
    zeilen.push({ job: s.job, name: s.name, sek, dateien: dat, domaenen: [...doms].sort(), dom: dom.sort(), zahl, dominant, art, gelesen, statisch, direkt, mitLeser });
}
const voll = zeilen.filter((z) => z.job === "voll" && z.sek > 0);
const summe = (a) => a.reduce((x, z) => x + z.sek, 0);
const S = summe(voll);
const lies = voll.filter((z) => z.art === "an der Quelle gelesen");
const top30 = [...voll].sort((a, b) => b.sek - a.sek).slice(0, 30);
console.log("Leser-Graph:", Object.entries(LIEST).map(([d, s]) => d + "←" + [...s].sort().join("")).sort().join("  "));
console.log("geändert", [...GEAENDERT].join(","), "· mit Lesern", [...LESER].sort().join(","));
console.log(`voll-Schritte mit Zeit: ${voll.length}, Summe ${(S / 60).toFixed(0)} min; an der Quelle gelesen ${lies.length}; der 30 teuersten an der Quelle: ${top30.filter((z) => z.art === "an der Quelle gelesen").length}`);
const DO = voll.filter((z) => z.dominant);
console.log(`dominant (Anteil ≥ ${process.env.ANTEIL || 0.15}): ${DO.length} Schritte, ${(summe(DO) / 60).toFixed(0)} min = ${((100 * summe(DO)) / S).toFixed(0)} %; echt ${zeilen.filter((z) => z.job === "echt" && !z.statisch && z.dominant).length}`);
const D = voll.filter((z) => z.direkt), L = voll.filter((z) => z.mitLeser);
console.log(`direkt: ${D.length} Schritte, ${(summe(D) / 60).toFixed(0)} min = ${((100 * summe(D)) / S).toFixed(0)} %`);
console.log(`mit Lesern: ${L.length} Schritte, ${(summe(L) / 60).toFixed(0)} min = ${((100 * summe(L)) / S).toFixed(0)} %`);
const echt = zeilen.filter((z) => z.job === "echt" && !z.statisch);
console.log(`echt (je Bein dieselben ${echt.length} Schritte): direkt ${echt.filter((z) => z.direkt).length}, mit Lesern ${echt.filter((z) => z.mitLeser).length}`);
const suche = process.env.SUCHE ? new RegExp(process.env.SUCHE, "i") : null;
if (suche) for (const z of zeilen.filter((z) => suche.test(z.name) || z.dateien.some((f) => suche.test(f)))) console.log("  >", z.job, z.name.slice(0, 70), "|", z.dom.join(","), JSON.stringify(z.zahl), "|", z.art, z.gelesen, "| direkt", z.direkt, "leser", z.mitLeser);
const ai = process.argv.indexOf("--aus");
if (ai > 0) fs.writeFileSync(process.argv[ai + 1], JSON.stringify({ leser: Object.fromEntries(Object.entries(LIEST).map(([d, s]) => [d, [...s]])), zeilen }, null, 1));
