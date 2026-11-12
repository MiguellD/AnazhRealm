// reihe.cjs <liste,komma> — DIE REIHE EINER MESS-LISTE (12.11., Koordinator: „nie wieder von vorn“, „kurze Stationen zuerst“): die
// Liste aus gtx-nutzen kommt in der Reihe der Tafel, und jede Landung beginnt sie neu — am 12.11. maß die GTX an 3d4ac0ae 5 von 30
// und an 3552f058 8 von 31, beide Male DIESELBEN ersten Stationen (affekt, ankunft, bauen, fahrzeug, ferne), während material.*,
// studios.*, tiere.*, tore.*, vegetation.* seit dem 11.11. früh keine Messung trugen. Die Reihe hier:
//   1  wer am längsten ohne Messung auf der GTX ist, fährt zuerst (nie gemessen = ganz vorn) — jede Lücke erntet, was am ältesten ist;
//   2  wessen letzte Fahrt LANG_MIN Minuten oder länger lief, fährt zuletzt (gelaende.K2#2 lief auf der GTX dreimal ~29 min bis an
//      seinen Deckel und endete UNGEMESSEN; an 3552f058 stand es als neunte Station 2 h 11 min vor dem Rest der Liste).
// Quelle: jede messung/*-gtx.json im Baum der Punkte-Maschine (n0611-pm, vom Dienst eben auf refs/omen/dauer-pm gesetzt): je Station
// der jüngste Eintrag (je oder ungemessen) mit `zeit` und `minuten`. stdout die Komma-Liste, stderr die Reihe mit Grund.
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.env.REIHE_DIR || "C:/Users/micha/Desktop/AnazhRealm-OMEN/n0611-pm/meisterkarte-quelle/punkte/messung";
const LANG_MIN = Number(process.env.REIHE_LANG_MIN || 10);
const liste = String(process.argv[2] || "").split(",").map((x) => x.trim()).filter(Boolean);
const letzt = {};
let dateien = [];
try {
    dateien = fs.readdirSync(DIR).filter((f) => /-gtx\.json$/.test(f));
} catch { /* ohne Baum: die Reihe der Tafel */ }
for (const f of dateien) {
    let m;
    try {
        m = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
    } catch {
        continue;
    }
    for (const o of [m.je || {}, m.ungemessen || {}])
        for (const [id, e] of Object.entries(o)) {
            const z = String((e && e.zeit) || m.zeit || "");
            if (!letzt[id] || z > letzt[id].z) letzt[id] = { z, min: Number(e && e.minuten) || 0, kopf: f.slice(0, 8) };
        }
}
const lang = (id) => (letzt[id] && letzt[id].min >= LANG_MIN ? 1 : 0);
const reihe = liste
    .map((id, i) => ({ id, i }))
    .sort((a, b) => lang(a.id) - lang(b.id) || ((letzt[a.id] || {}).z || "").localeCompare((letzt[b.id] || {}).z || "") || a.i - b.i)
    .map((x) => x.id);
process.stderr.write(
    "Reihe (älteste Messung zuerst, ≥ " + LANG_MIN + " min zuletzt): " +
        reihe.map((id) => id + (letzt[id] ? " " + letzt[id].z.slice(5, 16) + (lang(id) ? " LANG " + letzt[id].min + " min" : "") : " nie")).join(" · ") + "\n"
);
process.stdout.write(reihe.join(",") + "\n");
