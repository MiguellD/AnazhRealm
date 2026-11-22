// node reihe-lesen.cjs <log…> — die T4-Zeile der Fahr-Linse als Tafel: das Paar (Third · Ego) und die Reihe der Abstiegs-Lagen
const fs = require("fs");
const zeile = (n, a) => {
    const w = a.wer || {};
    const g = w.wagen || {};
    return `  ${String(n).padEnd(14)} v ${String(a.v).padEnd(4)} sprung ${String(a.sprung).padEnd(6)} Bild ${String(w.j).padEnd(3)} von ${String(a.bilder).padEnd(3)} zieht ${String(a.zieht).padEnd(3)} armMin ${String(a.armMin).padEnd(5)} | arm ${String(w.arm).padEnd(5)} t ${String(w.t).padEnd(5)} bau ${String(w.bau).padEnd(5)} frei ${String(w.frei).padEnd(5)} len ${String(w.len).padEnd(5)} rest ${String(w.rest).padEnd(5)} hoch ${String(w.hoch).padEnd(5)} deckel ${String(w.deckel).padEnd(5)} aufBau ${w.aufBau ? 1 : 0} schulter ${String(w.schulter).padEnd(5)} steig ${String(w.steig).padEnd(5)} nick ${g.nick} wank ${g.wank}`;
};
for (const f of process.argv.slice(2)) {
    const t = fs.readFileSync(f, "utf8");
    const k = t.indexOf('{"gestartet"');
    if (k < 0) { console.log(`== ${f}: keine T4-Zeile`); continue; }
    let [tiefe, e] = [0, k];
    for (; e < t.length; e++) {
        if (t[e] === "{") tiefe++;
        else if (t[e] === "}" && --tiefe === 0) break;
    }
    const m = JSON.parse(t.slice(k, e + 1));
    console.log(`== ${f} · ${/❌ T4/.test(t) ? "ROT" : "GRÜN"} · ego ${m.ego} · nach10 ${m.nach10}`);
    (m.abSprung || []).forEach((s, i) => console.log(zeile(i ? "Ego" : "Third", { v: m.abV[i], sprung: s, wer: (m.abWer || [])[i] })));
    for (const a of m.abReihe || []) console.log(zeile(a.lage, a));
    const rot = (m.abReihe || []).filter((a) => a.sprung > 0.5).length;
    if (m.abReihe && m.abReihe.length) console.log(`  Reihe: ${rot} von ${m.abReihe.length} über 0,5 m, in ${m.abReihe.filter((a) => a.zieht > 0).length} Lagen glitt der Arm zum verlassenen Wagen`);
}
