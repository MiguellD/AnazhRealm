// Auswertung 0710-10 (aus 0710-9): je Boot die Kurzfassung, Tiere, Hänger je Slot, Mediane A gegen B, Profil-Top-10 und
// Gesamtzeit der Takte der Klasse (Affordanzen, Dorf-Rauch, Boosts, Raum-Tags), Wachen (Wetter- und Welt-Halt).
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2];
const log = fs.readFileSync(path.join(DIR, "fortschritt.log"), "utf8");
const boots = ["1A", "2B", "3A", "4B", "5A", "6B", "7A", "8B"];
const med = (a) => {
    const s = a.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
    if (!s.length) return null;
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const f1 = (x) => (x == null ? "–" : (+x).toFixed(1));
const f2 = (x) => (x == null ? "–" : (+x).toFixed(2));
const zeilen = [];
const profil = { A: {}, B: {} };
const inkl = { A: {}, B: {} };
const INKL = ["tickAffordances", "_tickFocusingAffordances", "_tickRadiatingAffordances", "_tickBalancingAffordances", "_tickLiftingAffordances", "_findNearestAffordanceEntry", "_updateDorfRauch", "tickPlayerBoosts", "computeSpatialTags", "_loopFixedStep"];
for (const N of boots) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, N + ".json"), "utf8"));
    const S = N.slice(-1);
    const step = (n) => j.schritte.find((s) => s.name === n);
    const lv = step("lauf-voll").ergebnis,
        lf = step("lauf-frei").ergebnis;
    const gb = step("gpu-bank").ergebnis;
    const bd = step("band").ergebnis;
    const m = bd.messung;
    const verworfen = fs.readdirSync(DIR).filter((d) => d.startsWith(N + "-verworfen") && d.endsWith(".json")).length;
    // verweigerte Wetter-Züge (nur B kennt den Halt) über alle Schritte
    const verw = {};
    for (const s of j.schritte)
        for (const e of (s.wache && s.wache.wetter && s.wache.wetter.buch) || [])
            if (e.art === "verweigert") {
                const k = `${e.quelle}→${e.zu}`;
                verw[k] = (verw[k] || 0) + 1;
            }
    const welt = {};
    for (const st of j.schritte)
        for (const e of (st.wache && st.wache.weltakt && st.wache.weltakt.buch) || []) {
            const k = `${e.art} ${e.quelle}→${e.op}`;
            welt[k] = (welt[k] || 0) + 1;
        }
    const gpuZeile = (log.match(new RegExp(`${N} boot \\(Versuch ${verworfen + 1}\\)\\s+GPU\\[([^\\]]*)\\]`)) || [])[1];
    const L = (l) => ({
        fps: l.fps,
        p50: l.frameMs.p50,
        p95: l.frameMs.p95,
        max: l.frameMs.max,
        cpu50: l.cpuTaktMs.p50,
        cpu95: l.cpuTaktMs.p95,
        render: l.phasenEwmaMs.render,
        creatures: l.phasenEwmaMs.creatures,
        streaming: l.phasenEwmaMs.streaming,
        gpuD50: l.gpuDurchsatzMs && l.gpuDurchsatzMs.p50,
        stempel: l.stempel && l.stempel.gueltig,
        wetter: l.wetterHalt && l.wetterHalt.urteil,
    });
    const tv = (j.kurz.laufVoll && j.kurz.laufVoll.tiere) || {}, tf = (j.kurz.laufFrei && j.kurz.laufFrei.tiere) || {};
    let hg = null;
    try { hg = JSON.parse(fs.readFileSync(path.join(DIR, N + "-haenger.json"), "utf8")); } catch (_e) {}
    const z = {
        N,
        tiereVoll: tv.gesamt, tiereVollSicht: tv.sicht, tiereFrei: tf.gesamt, tiereFreiSicht: tf.sicht,
        hgN: hg ? hg.haengerN : null, hgMax: hg && hg.frameMs ? hg.frameMs.max : null, hgP95: hg && hg.frameMs ? hg.frameMs.p95 : null,
        hgKlasse: hg ? hg.jeKlasse : null, hgUrsachen: hg ? hg.jeUrsache : null, hgBau: hg && hg.knotenBau ? hg.knotenBau.ms : null, hgPipeSync: hg && hg.pipelines ? hg.pipelines.sync : null,
        S,
        verworfen,
        urteil: j.urteil,
        befunde: j.befunde.length,
        voll: L(lv),
        frei: L(lf),
        bank0: gb["0"].gpuJeFrameMs,
        bank0cpu: gb["0"].cpuJeFrameMs,
        bank88: gb["-0.88"].gpuJeFrameMs,
        bank88cpu: gb["-0.88"].cpuJeFrameMs,
        bandBefehle: m.summe.befehle,
        bandTris: m.summe.dreiecke,
        bandVram: m.vram.mb,
        bandGpu: m.gpu && m.gpu.gpuJeFrameMs,
        bandTier: (m.klassen || []).find ? null : null,
        bandStempel: bd.stempel && bd.stempel.urteil,
        wetterEnde: j.schritte[j.schritte.length - 1].wache.wetter.wetter,
        verw,
        welt,
        gpuStart: gpuZeile || "?",
        version: j.stand.version,
    };
    // Tier-Befehle/-Dreiecke aus der Band-Tabelle (Weltzustand: die Tiere wandern)
    const t = /^\s*tier\*\s+(\d+)\/\d+\s+\S+\s+([\d.]+)k?\//m.exec(bd.tabelle || "");
    z.tierBefehle = t ? +t[1] : null;
    z.tierTrisK = t ? +t[2] : null;
    zeilen.push(z);
    const pr = step("profil").ergebnis;
    for (const row of (pr.selbst || []).slice(0, 25)) {
        const mm = /^\s*([\d.]+) %\s+(\d+) ms\s+(.*)$/.exec(row);
        if (!mm) continue;
        const k = mm[3].trim().replace(/(\.js):\d+$/, "$1");
        (profil[S][k] = profil[S][k] || []).push(+mm[1]);
    }
    for (const fn of INKL) {
        let pc = 0;
        for (const row of pr.gesamt || []) {
            const mm = /^\s*([\d.]+) %\s+(\d+) ms\s+(\S+) /.exec(row);
            if (mm && mm[3] === fn) pc = Math.max(pc, +mm[1]);
        }
        (inkl[S][fn] = inkl[S][fn] || []).push(pc);
    }
}
let out = "";
const p = (s) => (out += s + "\n");
p("## Je Boot");
p("");
p(
    "| Boot | Versuch | Wachen | Regler | fps | Frame p50/p95/max | CPU-Takt p50/p95 | render-EWMA | creatures-EWMA | gpu-bank Gier 0 / −0,88 (CPU) | band Befehle · Dreiecke · VRAM · GPU | Tiere im Band (Bef./Dreiecke) | Tiere gesamt / im Sichtkegel | Wetter Ende | GPU vor Boot |"
);
p("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const z of zeilen)
    for (const [rg, l] of [
        ["voll", z.voll],
        ["frei", z.frei],
    ])
        p(
            `| ${rg === "voll" ? z.N : ""} | ${rg === "voll" ? z.verworfen + 1 : ""} | ${rg === "voll" ? z.urteil + (z.befunde ? ` (${z.befunde})` : "") : ""} | ${rg} | ${f1(l.fps)} | ${f1(l.p50)} / ${f1(l.p95)} / ${f1(l.max)} | ${f1(l.cpu50)} / ${f1(l.cpu95)} | ${f2(l.render)} | ${f2(l.creatures)} | ${
                rg === "voll" ? `${f2(z.bank0)} (${f2(z.bank0cpu)}) / ${f2(z.bank88)} (${f2(z.bank88cpu)})` : ""
            } | ${
                rg === "voll"
                    ? `${z.bandBefehle} · ${Math.round(z.bandTris / 1000)}k · ${f1(z.bandVram)} MB · ${f2(z.bandGpu)} ms`
                    : ""
            } | ${rg === "voll" ? `${z.tierBefehle} / ${z.tierTrisK}k` : ""} | ${rg === "voll" ? `${z.tiereVoll} / ${z.tiereVollSicht}` : `${z.tiereFrei} / ${z.tiereFreiSicht}`} | ${rg === "voll" ? z.wetterEnde : ""} | ${rg === "voll" ? z.gpuStart : ""} |`
        );
p("");
p("## Mediane A gegen B (je 4 Boots; Spanne min–max)");
p("");
const seite = (S) => zeilen.filter((z) => z.S === S);
const reihe = (name, get, nk = 1) => {
    const a = seite("A").map(get),
        b = seite("B").map(get);
    const ma = med(a),
        mb = med(b);
    const span = (x) => {
        const s = x.filter(Number.isFinite);
        return s.length ? `${Math.min(...s).toFixed(nk)}–${Math.max(...s).toFixed(nk)}` : "–";
    };
    const d = ma != null && mb != null ? mb - ma : null;
    p(
        `| ${name} | ${ma == null ? "–" : ma.toFixed(nk)} (${span(a)}) | ${mb == null ? "–" : mb.toFixed(nk)} (${span(b)}) | ${
            d == null ? "–" : (d >= 0 ? "+" : "") + d.toFixed(nk) + (ma ? ` (${((d / ma) * 100).toFixed(0)} %)` : "")
        } |`
    );
};
p("| Größe | A (main 76c9624d, V18.536) | B (welle-m-brennglas 3da7e286) | B − A |");
p("|---|---|---|---|");
for (const rg of ["voll", "frei"]) {
    reihe(`fps ${rg}`, (z) => z[rg].fps);
    reihe(`Frame p50 ${rg}`, (z) => z[rg].p50);
    reihe(`Frame p95 ${rg}`, (z) => z[rg].p95);
    reihe(`Frame max ${rg}`, (z) => z[rg].max, 0);
    reihe(`CPU-Takt p50 ${rg}`, (z) => z[rg].cpu50);
    reihe(`CPU-Takt p95 ${rg}`, (z) => z[rg].cpu95);
    reihe(`render-EWMA ${rg}`, (z) => z[rg].render, 2);
    reihe(`creatures-EWMA ${rg}`, (z) => z[rg].creatures, 2);
}
reihe("gpu-bank Gier 0 (GPU ms/Frame)", (z) => z.bank0, 2);
reihe("gpu-bank Gier −0,88 (GPU ms/Frame)", (z) => z.bank88, 2);
reihe("gpu-bank Gier 0 (CPU ms/Frame)", (z) => z.bank0cpu, 2);
reihe("band Befehle", (z) => z.bandBefehle, 0);
reihe("band Dreiecke (k)", (z) => z.bandTris / 1000, 0);
reihe("band VRAM MB", (z) => z.bandVram, 1);
reihe("band GPU ms/Frame", (z) => z.bandGpu, 2);
reihe("Tiere im Band: Befehle", (z) => z.tierBefehle, 0);
reihe("Tiere gesamt (lauf voll)", (z) => z.tiereVoll, 0);
reihe("Tiere im Sichtkegel (lauf voll)", (z) => z.tiereVollSicht, 0);
reihe("Hänger > 100 ms je 30 s (Sitzung)", (z) => z.hgN, 0);
reihe("Hänger: Frame max ms (Sitzung)", (z) => z.hgMax, 0);
reihe("Hänger-Sitzung: Frame p95 ms", (z) => z.hgP95, 1);
reihe("Hänger-Sitzung: Knoten-Bau synchron Σ ms", (z) => z.hgBau, 0);
p("");
p("## Profil-Top-10 (Selbstzeit-Anteil %, Median je Seite über 4 Boots)");
p("");
const alle = new Set([...Object.keys(profil.A), ...Object.keys(profil.B)]);
const rang = [...alle]
    .map((k) => ({ k, a: med(profil.A[k] || []), b: med(profil.B[k] || []), na: (profil.A[k] || []).length, nb: (profil.B[k] || []).length }))
    .sort((x, y) => Math.max(y.a || 0, y.b || 0) - Math.max(x.a || 0, x.b || 0))
    .slice(0, 10);
p("| Funktion | A % (Boots) | B % (Boots) |");
p("|---|---|---|");
for (const r of rang) p(`| ${r.k} | ${f1(r.a)} (${r.na}) | ${f1(r.b)} (${r.nb}) |`);
p("");
p("## Gesamtzeit-Anteil ausgewählter Funktionen (%, Median je Seite über 4 Boots)");
p("");
p("| Funktion | A % | B % |");
p("|---|---|---|");
for (const fn of INKL) p(`| ${fn} | ${f1(med(inkl.A[fn] || []))} | ${f1(med(inkl.B[fn] || []))} |`);
p("");
p("## Hänger > 100 ms je Slot (eigene Sitzung, haenger 30 s, Regler voll; Ursache je Klasse)");
p("");
for (const z of zeilen) p(`- ${z.N}: ${z.hgN == null ? "keine Messung" : `${z.hgN} Hänger, max ${f1(z.hgMax)} ms · ${(z.hgUrsachen || []).map((u) => `${u.ursache} ×${u.n} (Σ ${u.summeMs} ms, max ${u.maxMs})`).join(" · ") || "–"}`}`);
p("");
p("## Wetter-Halt: verweigerte Züge je Quelle (Summe über alle Schritte)");
for (const z of zeilen) p(`- ${z.N}: ${Object.entries(z.verw).map(([k, n]) => `${k} ${n}`).join(" · ") || "keine"}`);
p("");
p("## Welt-Halt: Züge je Quelle (beide halten)");
for (const z of zeilen) p(`- ${z.N}: ${Object.entries(z.welt).map(([k, n]) => `${k} ${n}`).join(" · ") || "keine"}`);
fs.writeFileSync(path.join(DIR, "auswertung.md"), out);
fs.writeFileSync(path.join(DIR, "auswertung.json"), JSON.stringify({ zeilen, profil, inkl }, null, 1));
console.log(out);
