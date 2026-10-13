// messung.cjs — DIE MESSUNG IST DA (Meta-Wand V5 Leer-Grün, Plan der Prüf-Verdichtung 13.10. §3): ein Urteil prüft
// zuerst, ob seine Messung die Glieder trägt, die es liest, und urteilt dann ROT mit dem fehlenden Glied — nie grün auf
// einer leeren Messung (`{}` oder tief-leer), nie ein Wurf aus dem Urteil. Die Vakuum-Klinge (gate:apparat) füttert jedes
// Urteil der diag-Linsen mit beidem.
//
// Ein Glied ist ein Pfad mit Form-Zeichen am Ende:
//   "a.b"      vorhanden (nicht null/undefined)       "a.b#"    endliche Zahl
//   "a.b[]"    ein Array (leer erlaubt)               "a.b[+]"  ein Array mit mindestens einem Eintrag
//   "a.b{}"    ein Objekt (auch Map/Set)              "a.b{+}"  ein Objekt mit mindestens einem Schlüssel/Eintrag
//   "a.b?"     ein Wahrheitswert
// Ein Glied ohne Pfad ("{+}", "[]" …) prüft die Messung selbst.
// Ein leeres Glied (false, null, "") zählt nicht — so trägt ein Urteil Glieder je Phase (`P.has("w4") && "w4{}"`).
// Rückgabe: null (alle Glieder da) oder der Satz „Messung fehlt: <pfad> (<Soll>)".
"use strict";

const FORM = [
    ["[+]", (x) => Array.isArray(x) && x.length > 0, "Array mit Einträgen"],
    ["[]", (x) => Array.isArray(x), "Array"],
    ["{+}", (x) => istObjekt(x) && groesse(x) > 0, "Objekt mit Einträgen"],
    ["{}", (x) => istObjekt(x), "Objekt"],
    ["#", (x) => typeof x === "number" && Number.isFinite(x), "endliche Zahl"],
    ["?", (x) => typeof x === "boolean", "Wahrheitswert"],
];

function istObjekt(x) {
    return typeof x === "object" && x !== null && !Array.isArray(x);
}
function groesse(x) {
    if (x instanceof Map || x instanceof Set) return x.size;
    return Object.keys(x).length;
}

function fehlendesGlied(messung, glieder) {
    if (messung == null || (typeof messung !== "object" && typeof messung !== "function"))
        return `Messung fehlt ganz (${messung === null ? "null" : typeof messung})`;
    for (const glied of glieder) {
        if (!glied) continue;
        let pfad = glied;
        let form = null;
        for (const f of FORM)
            if (glied.endsWith(f[0])) {
                form = f;
                pfad = glied.slice(0, -f[0].length);
                break;
            }
        let x = messung;
        if (pfad)
            for (const k of pfad.split(".")) {
                x = x == null ? undefined : x[k];
                if (x == null) break;
            }
        if (x == null) return `Messung fehlt: ${pfad}`;
        if (form && !form[1](x)) return `Messung fehlt: ${pfad || "die Messung"} (Soll ${form[2]})`;
    }
    return null;
}

module.exports = { fehlendesGlied };
