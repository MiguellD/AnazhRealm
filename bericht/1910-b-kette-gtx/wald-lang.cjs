// 1910 B-Kette: je Wald-Faden-Antwort — lag „fertig im Faden" in einer LongTask des Haupt-Fadens, und wie nah folgt die
// Ankunft ihrem Ende?   node wald-lang.cjs <roh>/<lauf>.json
"use strict";
const j = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
const KT = j.kt, lang = j.lang || [];
const an = new Map(KT.waldAn.map((x) => [x[1], x]));
const s1 = (ms) => (ms / 1000).toFixed(2);
let n = 0, inLang = 0, sumWart = 0, sumRest = 0;
const z = [];
for (const w of KT.wald) {
    const a = an.get(w[1]);
    if (!a || !a[2]) continue;
    const fertig = a[2][1], ank = a[0];
    const lt = lang.find(([s, d]) => s <= fertig && s + d >= fertig);
    n++;
    sumWart += ank - fertig;
    if (lt) {
        inLang++;
        sumRest += lt[0] + lt[1] - fertig;
        z.push(`${s1(fertig)} fertig in LongTask ${s1(lt[0])}+${lt[1]} ms (Ende ${s1(lt[0] + lt[1])}) → an ${s1(ank)}`);
    } else z.push(`${s1(fertig)} fertig außerhalb einer LongTask → an ${s1(ank)}`);
}
console.log(`${process.argv[2].replace(/.*[\/]/, "")}: ${n} Antworten, ${inLang} fertig mitten in einer LongTask des Haupt-Fadens; fertig→an Σ ${s1(sumWart)} s, davon Rest der LongTask Σ ${s1(sumRest)} s`);
console.log(z.join("\n"));
