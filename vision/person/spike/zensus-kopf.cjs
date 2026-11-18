// ZENSUS-PROBE „Bytes je Kopf heute“ — Proxy-Messung der Liste in stamm/siedlung-bewohner.js (main b7ed8419).
//
// Was gemessen wird: das Objekt-Literal eines Bewohners mit GENAU den Feldern von siedlung-bewohner.js:887–899
// (73 Felder im Literal) plus den 14 Feldern, die der Wirt später nachträgt (:424, 429, 430, 438, 1029, 1030, 1048,
// 1153, 1426, 1709, 1711, 1833, 2277, 2286). Die Zahlfelder tragen Kommazahlen (in V8 eigene HeapNumber-Kästen wie im
// Spiel, wo sie mit undefined geboren werden und dann Doubles erhalten). Dazu, getrennt, die Unterobjekte je Kopf:
// orte (8 Stände), genom (22 Achsen), bauZu (17 Dials), raumPunkt (14 Werte).
// Was NICHT gemessen wird: die THREE.Group-Hülle (SB:1015), Ton-Zeile (208 B, KL:1556) und Satz-Platz (160 B, SG:199)
// — die stehen als Rechnung aus dem Quelltext daneben. Ein Proxy, kein Heap-Schnappschuss des Spiels.
//
// Lauf: node --expose-gc vision/person/spike/zensus-kopf.cjs
"use strict";
if (typeof global.gc !== "function") {
    console.error("bitte mit --expose-gc starten");
    process.exit(2);
}
const N = 20000;
const PUNKT = { x: 1.5, z: 2.5 }; // geteilte Orte (Tür, Platz …) gehören dem Haus, nicht dem Kopf
let z = 0.123;
const d = () => (z = (z * 9301 + 49297) % 233280) / 233280 + 0.001; // Kommazahl, nie Smi
function kopf(i, mitUnter) {
    const u = undefined;
    // prettier-ignore
    const b = {
        heim: i >>> 0, rolle: "wohnhaus", beruf: "hof", same: "1:2:3",
        orte: mitUnter ? { tuer: PUNKT, vor: PUNKT, heim: PUNKT, platz: PUNKT, werk: PUNKT, mahl: PUNKT, abend: PUNKT, besuch: null } : null,
        seed: "123456:7:" + i, atem: d(), leib: null, uhr: 0, takt: 0, frist: null,
        genom: u, gestalt: u, groesse: u, breite: u, tiefe: u, farben: u, tonZeilen: u, beinL: u, tempo: u, satzOrt: u,
        nr: u, ruht: u, rk: u, uhrAb: u, animDt: u, d2: u, kreis: u, nah: u, lageNeu: u, ankunft: u, x: u, z: u,
        blick: u, begegnet: u, kopfY: u,
        ziel: u, akt: u, drinnenSoll: u, drinnen: u, da: u, hinaus: u, stand: u, tagVon: u, tagAb: u, zielUhr: u,
        drehen: u, platz: u, weichen: null,
        weg: u, wi: u, linie: u, tag: u, wegRest: u, wegRestAb: u, gegangen: u, gehDt: u, gehTakt: u, rueck: u,
        tempoTag: u, tempoJetzt: u, vx: u, vz: u, grundX: u, grundZ: u, grundH: u, grundGx: 0, grundGz: 0, _gait: u, _gaitW: u, walkPhase: u,
        wagen: u, amSteuer: u,
    };
    // die Doubles, die der Takt setzt
    for (const k of ["groesse", "breite", "tiefe", "beinL", "tempo", "uhrAb", "animDt", "d2", "x", "z", "kopfY", "tagVon", "tagAb", "zielUhr", "wegRest", "wegRestAb", "gegangen", "gehDt", "gehTakt", "tempoTag", "tempoJetzt", "vx", "vz", "grundX", "grundZ", "grundH", "walkPhase", "drehen"]) b[k] = d();
    for (const k of ["nr", "rk", "wi", "akt"]) b[k] = i & 1023;
    for (const k of ["ruht", "nah", "lageNeu", "ankunft", "drinnenSoll", "drinnen", "da", "hinaus", "amSteuer"]) b[k] = (i & 1) === 0;
    b.ziel = PUNKT;
    b.stand = "heim";
    // die 14 nachgetragenen Felder (Out-of-object-Eigenschaften wie im Spiel)
    const nach = ["raumSkala", "raumPunkt", "bauZu", "standZeile", "lageAuge", "satzZeilen", "beinMass", "armeOffen", "backt", "bau", "bedeutung", "gemuet", "_feldLageVon", "linieAb"];
    for (const k of nach) b[k] = d();
    if (mitUnter) {
        const g = {};
        for (let a = 0; a < 22; a++) g["a" + a] = d();
        b.genom = g;
        const bz = {};
        for (let a = 0; a < 17; a++) bz["d" + a] = d();
        b.bauZu = bz;
        const rp = {};
        for (let a = 0; a < 14; a++) rp["r" + a] = d();
        b.raumPunkt = rp;
    }
    return b;
}
function miss(mitUnter) {
    const halt = new Array(N);
    global.gc();
    global.gc();
    const vor = process.memoryUsage().heapUsed;
    for (let i = 0; i < N; i++) halt[i] = kopf(i, mitUnter);
    global.gc();
    global.gc();
    const nach = process.memoryUsage().heapUsed;
    const felder = Object.keys(halt[0]).length;
    const proKopf = (nach - vor) / N;
    halt.length = 0;
    return { felder, proKopf };
}
const allein = miss(false);
const mit = miss(true);
const tonZeile = 13 * 16; // KL:1556–1557: 13 Texel × 16 B
const satz = 2 * (64 + 16); // SG:199–204: 2 Senken × (Matrix 64 + aGang 16)
const out = {
    probe: "zensus-kopf",
    node: process.version,
    n: N,
    felderJeKopf: allein.felder,
    bytesKopfAllein: Math.round(allein.proKopf),
    bytesKopfMitUnterobjekten: Math.round(mit.proKopf),
    bytesTonZeile: tonZeile,
    bytesSatz: satz,
    bytesJeKopfOhneHuelle: Math.round(mit.proKopf) + tonZeile + satz,
};
console.log(JSON.stringify(out, null, 1));
