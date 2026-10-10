// 0910-7: die Bisektion je Stand (zwei Sitzungen): CPU-Takt frei, Streaming-Phase, Stellgrößen, Gesamtzeit-Anteile der Täter
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2];
const STAENDE = [
    ["7dd944e6", "V18.537 (main vorher)"],
    ["d3ebfc79", "fix-ankunft-streu-fall"],
    ["e65e9208", "welle-m-schatten"],
    ["90307589", "studio-s3-kreatur"],
    ["e18c1951", "studio-s3-wiese-gestalten"],
    ["c503eaad", "studio-s3-pflanzen"],
    ["e3836ce3", "gate:profiband"],
    ["70b957f3", "schau2-uhr-wetter"],
    ["76c036b0", "welle-m-host-vram-2"],
    ["66005ca6", "V18.538"],
];
const FN = [
    "_loopVoxelStreaming",
    "_tickArchitectureLOD",
    "_lodTreeVisHeight",
    "_foundrySichtHoehe",
    "_passSicht",
    "_chunkSatzPass",
    "_hoehlenSicht",
    "AnazhRealm._diaetRefresh",
];
const json = (f) => {
    const s = fs.readFileSync(path.join(DIR, f), "utf8");
    return JSON.parse(s.slice(s.indexOf("{")));
};
const zeilen = [];
console.log(
    "| Stand | Zweig | CPU p95 frei | Streaming-EWMA | loadScale · Laub m · Dichte · Schatten s | " +
        FN.map((f) => f.replace("AnazhRealm.", "").replace(/^_/, "")).join(" | ") +
        " |"
);
console.log("|" + "---|".repeat(5 + FN.length));
for (const [c, name] of STAENDE) {
    const je = [1, 2].map((d) => {
        try {
            const l = json(`${c}-${d}-lauf.txt`);
            const p = json(`${c}-${d}-profil.txt`);
            const m = {};
            for (const z of p.gesamt) {
                const t = z.match(/^\s*([\d.]+) %\s+\d+ ms\s+(\S+) (\S+)/);
                if (t && /anazhRealm/.test(t[3]) && m[t[2]] === undefined) m[t[2]] = +t[1];
            }
            return { l, m };
        } catch (e) {
            return null;
        }
    });
    const ok = je.filter(Boolean);
    const zwei = (f) => ok.map(f).join(" · ");
    const r = {
        stand: c,
        zweig: name,
        cpu: ok.map((x) => x.l.cpuTaktMs.p95),
        streaming: ok.map((x) => x.l.phasenEwmaMs.streaming),
        stell: ok.map((x) => x.l.stellgroessen),
        fn: Object.fromEntries(FN.map((f) => [f, ok.map((x) => x.m[f] || 0)])),
    };
    zeilen.push(r);
    console.log(
        `| ${c} | ${name} | ${zwei((x) => x.l.cpuTaktMs.p95)} | ${zwei((x) => x.l.phasenEwmaMs.streaming)} | ` +
            ok
                .map((x) => {
                    const s = x.l.stellgroessen;
                    return `${s.loadScale}/${s.foliageRadius}/${s.foliageDichte}/${s.schattenIntervall}`;
                })
                .join(" · ") +
            " | " +
            FN.map((f) => zwei((x) => x.m[f] || 0)).join(" | ") +
            " |"
    );
}
fs.writeFileSync(path.join(DIR, "auswertung.json"), JSON.stringify(zeilen, null, 1));
