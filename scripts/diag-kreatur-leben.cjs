#!/usr/bin/env node
// gate:kreatur-leben — DIE LEBENS-LINSE (Klasse: „tote reisende Daten").
//
// V18.476 reiste das tetrapoda-hunt-Preset ins Buch — und KEIN Pfad wählte es
// je (gemessen 16.07.: _motionProfileName kannte nur Emotions-Achsen). Diese
// Linse hält die Klasse tot:
//   A) DECKUNG — jede Verhaltens-Aktion/Stimmung des Kerns zeigt auf EXISTIERENDE
//      Aktionen, die Seelen-Blöcke reisen im Buch (kein toter Verweis).
//   B) SELBST-TEST — eine injizierte tote Stimmungs-Aktion wird erkannt.
// Den Konsum im Stamm (Zustand-Stempel, Baum-Gang, Biss, Sprung, Herde) beweisen die Bänder mit Welt am
// Verhalten (gate:kreatur-takt, gate:kampf-gefuehl); hier liest keine Probe Quelltext (D3c).
"use strict";
const path = require("path");
const root = path.resolve(__dirname, "..");

let fails = 0;
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails++;
}

// ── Kern laden (Namensraum-Muster: self/globalThis) ──
global.self = global;
require(path.join(root, "tetrapoda-core.js"));
const core = global.__tetrapodaCore;
check("tetrapoda-core lädt (Namensraum __tetrapodaCore)", !!core);

const MOTION = (core && core.MOTION) || {};
const V = (core && core.VERHALTEN) || null;

check("MOTION trägt hunt UND schwimmen (die einst toten/neuen Gänge)", !!(MOTION.hunt && MOTION.schwimmen));

function stimmungLuecken(V) {
    const missing = [];
    for (const mood in V.stimmung) {
        // SCHLUSS-WELLE 17.07.: "schwellen" ist die Schwellen-DATEN-Zeile
        // der Stimmungs-Tabelle (keine Stimmung) — überspringen.
        if (mood === "schwellen") continue;
        const row = V.stimmung[mood];
        if (!row || !Array.isArray(row.aktionen)) {
            missing.push(mood + ":(leer)");
            continue;
        }
        for (const a of row.aktionen) if (!V.aktionen[a]) missing.push(mood + ":" + a);
        if (!Array.isArray(row.alle) || row.alle.length !== 2 || !(row.alle[0] <= row.alle[1]))
            missing.push(mood + ":alle");
    }
    return missing;
}

// ── A2) DECKUNG: Verhaltens-Seele in sich geschlossen ──
check("fx.verhalten reist im Kern (VERHALTEN: aktionen + stimmung)", !!(V && V.aktionen && V.stimmung));
if (V) {
    const missing = stimmungLuecken(V);
    check(
        "jede Stimmungs-Aktion existiert im Katalog + alle=[min,max] gültig",
        missing.length === 0,
        missing.length ? "TOT: " + missing.join(",") : `${Object.keys(V.stimmung).length} Stimmungen`
    );
    // SELBST-TEST: eine injizierte tote Stimmungs-Aktion fällt auf
    const tot = { ...V, stimmung: { ...V.stimmung, tot: { aktionen: ["gibtsnicht"], alle: [1, 2] } } };
    check(
        "SELBST-TEST: eine injizierte tote Stimmungs-Aktion fällt auf",
        stimmungLuecken(tot).join() === "tot:gibtsnicht"
    );

    const bekannt = new Set([
        "freq",
        "bodyX",
        "bodyZ",
        "headX",
        "headY",
        "ear",
        "tailAmp",
        "tailRate",
        "tension",
        "bob",
        "sway",
        "kpMul",
    ]);
    const fremd = [];
    for (const name in V.aktionen) {
        const p = V.aktionen[name].profil;
        if (!p) continue;
        for (const k in p) if (!bekannt.has(k)) fremd.push(name + ":" + k);
    }
    check("Aktions-Profile nutzen nur bekannte MOTION-Felder", fremd.length === 0, fremd.join(","));
    // (die Blöcke des Buchs prüft der EINE Leser _verhaltenGesetz beim Boot, die Rezepte der Umschlag: gate:studio-vertrag)
    // Die Größen-Bänder sind lückenlos aufsteigend (die letzte Zeile fängt den Rest).
    const gr = Array.isArray(V.groessen) ? V.groessen : [];
    let grOk = gr.length >= 2;
    for (let i = 1; i < gr.length; i++) if (!(gr[i].bis > gr[i - 1].bis)) grOk = false;
    check("groessen-Bänder strikt aufsteigend (bis-Schwellen)", grOk);
}

if (fails > 0) {
    console.log(`\n❌ ROT — ${fails} Verletzung(en).`);
    process.exit(1);
}
console.log(
    "\n✅ GRÜN — DIE KREATUR-SEELE IST GESCHLOSSEN: jede Stimmung zeigt auf eine lebende Aktion, jedes Aktions-Profil auf ein Feld der Haltung."
);
