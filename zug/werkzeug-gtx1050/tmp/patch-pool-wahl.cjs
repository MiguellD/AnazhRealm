// patch-pool-wahl.cjs <art> — die Plätze der Pools ohne Reihe im Speicher des Fragments (die Reihe `Te.array(...).toVar()` mit
// dem Zähler der Schleife als Index kostete die GTX 1050 die doppelte GPU-Zeit je Bild: gpu-bank Wiese 12,28 → 23,87 ms)
//   art = kette   : das Glied je Platz über eine Kette von `select` (der Zähler ist in jedem Fragment derselbe)
//   art = puffer  : die Werte der Plätze als Uniform-Reihe (`uniformArray`, ein Blick auf die Uniforms der Plätze, renderGroup)
const fs = require("fs");
const art = process.argv[2];
if (!/^(kette|puffer)$/.test(art || "")) throw new Error("art: kette | puffer");
const ersetze = (datei, alt, neu) => {
    const t = fs.readFileSync(datei, "utf8");
    if (t.split(alt).length !== 2) throw new Error(`${datei}: Anker ${t.split(alt).length - 1}-mal: ${alt.slice(0, 80)}`);
    fs.writeFileSync(datei, t.replace(alt, neu));
    console.log("ok", datei, alt.slice(0, 60).replace(/\n/g, " "));
};
const D = "stamm/stoff-material.js";
// der Pool
ersetze(
    D,
    `            const reihe = (liste) => Te.array(liste).toVar();
            const R = {
                lage: reihe(atmo.lichtLage),
                farbe: reihe(atmo.lichtFarbe),
                ersatz: reihe(atmo.lichtErsatz),
                kern: reihe(atmo.lichtKern),
            };
            const summe = Te.vec3(0).toVar();
            Te.Loop(atmo.lichtLage.length, ({ i: k }) => {
                const platz = {
                    lage: R.lage.element(k),
                    farbe: R.farbe.element(k),
                    ersatz: R.ersatz.element(k),
                    kern: R.kern.element(k),
                };`,
    art === "kette"
        ? `            const summe = Te.vec3(0).toVar();
            Te.Loop(atmo.lichtLage.length, ({ i: k }) => {
                const platz = {
                    lage: AnazhRealm._jePlatz(Te, atmo.lichtLage, k),
                    farbe: AnazhRealm._jePlatz(Te, atmo.lichtFarbe, k),
                    ersatz: AnazhRealm._jePlatz(Te, atmo.lichtErsatz, k),
                    kern: AnazhRealm._jePlatz(Te, atmo.lichtKern, k),
                };`
        : `            const R = this._poolReihen(atmo, ["lichtLage", "lichtFarbe", "lichtErsatz", "lichtKern"]);
            const summe = Te.vec3(0).toVar();
            Te.Loop(atmo.lichtLage.length, ({ i: k }) => {
                const platz = {
                    lage: R.lichtLage.element(k),
                    farbe: R.lichtFarbe.element(k),
                    ersatz: R.lichtErsatz.element(k),
                    kern: R.lichtKern.element(k),
                };`
);
// der Dach-Pool
ersetze(
    D,
    `                const lage = T.array(U.dachLage).toVar();
                const mass = T.array(U.dachMass).toVar();
                const unter = T.float(0).toVar();
                T.Loop(U.dachLage.length, ({ i: k }) => {
                    const L = lage.element(k);
                    const M = mass.element(k);`,
    art === "kette"
        ? `                const unter = T.float(0).toVar();
                T.Loop(U.dachLage.length, ({ i: k }) => {
                    const L = AnazhRealm._jePlatz(T, U.dachLage, k);
                    const M = AnazhRealm._jePlatz(T, U.dachMass, k);`
        : `                const R = this._poolReihen(U, ["dachLage", "dachMass"]);
                const unter = T.float(0).toVar();
                T.Loop(U.dachLage.length, ({ i: k }) => {
                    const L = R.dachLage.element(k);
                    const M = R.dachMass.element(k);`
);
// der Helfer
ersetze(
    D,
    `    // DAS GESETZ EINES PLATZES (K11, der Rumpf der Schleife des Pools)`,
    (art === "kette"
        ? `    // DIE WAHL DES PLATZES (die Schleifen der Pools): das Glied \`k\` (der Zähler der Schleife) einer Reihe von Uniforms als Kette
    // von \`select\` — der Zähler ist in jedem Fragment derselbe, die Zweige laufen gleich; KEINE Reihe im Speicher des Fragments
    // (\`array(...).toVar()\` mit dem Zähler als Index: gpu-bank GTX 1050 an der Wiese 12,28 → 23,87 ms je Bild).
    static _jePlatz(T, reihe, k) {
        let w = reihe[reihe.length - 1];
        for (let j = reihe.length - 2; j >= 0; j--) w = T.select(k.equal(j), reihe[j], w);
        return w;
    }

`
        : `    // DIE REIHEN DER PLÄTZE (die Schleifen der Pools): je Größe EINE Uniform-Reihe (\`uniformArray\`, renderGroup) als BLICK auf die
    // Uniforms der Plätze — ihre Glieder sind deren Werte (vec4: dieselben Objekte; float: gelesen je Render), der EINE Schreiber
    // schreibt weiter die Uniforms der Plätze. Gelesen am Zähler der Schleife (\`element(k)\`) — KEINE Reihe im Speicher des Fragments
    // (\`array(...).toVar()\`: gpu-bank GTX 1050 an der Wiese 12,28 → 23,87 ms je Bild). → { name: Reihe }
    _poolReihen(satz, namen) {
        const T = THREE.TSL;
        const R = satz.__reihen || Object.defineProperty(satz, "__reihen", { value: {} }).__reihen;
        for (const n of namen) {
            if (R[n]) continue;
            const liste = satz[n];
            const vec = liste[0].value && typeof liste[0].value === "object";
            const blick = vec
                ? liste.map((u) => u.value)
                : new Proxy(liste, { get: (t, p) => (typeof p === "string" && /^\\d+$/.test(p) ? t[p].value : t[p]) });
            R[n] = T.uniformArray(blick, vec ? "vec4" : "float").setGroup(T.renderGroup);
        }
        return R;
    }

`) + `    // DAS GESETZ EINES PLATZES (K11, der Rumpf der Schleife des Pools)`
);
