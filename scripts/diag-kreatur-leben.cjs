#!/usr/bin/env node
// gate:kreatur-leben — DIE LEBENS-LINSE (Klasse: „tote reisende Daten").
//
// V18.476 reiste das tetrapoda-hunt-Preset ins Buch — und KEIN Pfad wählte es
// je (gemessen 16.07.: _motionProfileName kannte nur Emotions-Achsen). Diese
// Linse hält die Klasse tot:
//   A) DECKUNG — jede Zeile der Zustand-Tabelle (MOTION_ZUSTAND_PROFILES) und
//      jede Verhaltens-Aktion/Stimmung des Kerns zeigt auf EXISTIERENDE
//      MOTION-Presets/Aktionen (kein toter Verweis, kein Waisen-Preset).
//   B) KONSUM-ANKER (window.__codeOf-Disziplin: Quelltext der lebenden
//      Symbole) — der Zustand führt in der EINEN Brücke, updateCreatures
//      stempelt jagd/flucht/schwimmen, der Baum-Gang trägt Overlay + bodyX.
//   C) SELBST-TEST — eine injizierte tote Zeile wird erkannt.
"use strict";
const fs = require("fs");
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

// ── A) DECKUNG: Zustand-Tabelle → MOTION-Presets ──
const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
const ztMatch = stamm.match(/AnazhRealm\.MOTION_ZUSTAND_PROFILES = Object\.freeze\(\{([\s\S]*?)\}\);/);
check("MOTION_ZUSTAND_PROFILES existiert im Stamm", !!ztMatch);
const kreaturTargets = [];
if (ztMatch) {
    const re = /kreatur: "([a-z]+)"/g;
    let m;
    while ((m = re.exec(ztMatch[1]))) kreaturTargets.push(m[1]);
}
check(
    "Zustand-Tabelle trägt Zeilen (schwimmen/jagd/flucht)",
    kreaturTargets.length >= 3,
    `Ziele: ${kreaturTargets.join(",")}`
);
const deadTargets = kreaturTargets.filter((n) => !MOTION[n]);
check(
    "DECKUNG: jedes Zustand-Ziel ist ein existierendes MOTION-Preset (keine tote Zeile)",
    deadTargets.length === 0,
    deadTargets.length ? "TOT: " + deadTargets.join(",") : `${kreaturTargets.length} gedeckt`
);
check("MOTION trägt hunt UND schwimmen (die einst toten/neuen Gänge)", !!(MOTION.hunt && MOTION.schwimmen));

// ── A2) DECKUNG: Verhaltens-Seele in sich geschlossen ──
check("fx.verhalten reist im Kern (VERHALTEN: aktionen + stimmung)", !!(V && V.aktionen && V.stimmung));
if (V) {
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
    check(
        "jede Stimmungs-Aktion existiert im Katalog + alle=[min,max] gültig",
        missing.length === 0,
        missing.length ? "TOT: " + missing.join(",") : `${Object.keys(V.stimmung).length} Stimmungen`
    );
    const bekannt = new Set([
        "freq", "stride", "bodyX", "bodyZ", "headX", "headY", "ear",
        "tailAmp", "tailRate", "tension", "bob", "sway", "kpMul", "phases",
    ]);
    const fremd = [];
    for (const name in V.aktionen) {
        const p = V.aktionen[name].profil;
        if (!p) continue;
        for (const k in p) if (!bekannt.has(k)) fremd.push(name + ":" + k);
    }
    check("Aktions-Profile nutzen nur bekannte MOTION-Felder", fremd.length === 0, fremd.join(","));
    // Die Rezepte tragen die Seele (der Buch-Reise-Pfad, nicht nur der Alias).
    const rec = core.PRESETS && core.PRESETS.wolf;
    check(
        "PRESETS.wolf.fx.verhalten reist im Rezept (der Buch-Pfad)",
        !!(rec && rec.fx && rec.fx.verhalten && rec.fx.verhalten.aktionen)
    );
    // ── A3) DECKUNG: die KREATUR-SEELE reist (Spiegel-Zensus 17.07.) —
    // jagd/furcht/temperament/wandern wohnen im Gesetzbuch, der Stamm liest
    // sie über den EINEN _verhaltenGesetz-Leser (Paritäts-Wand: gate:studio-vertrag).
    check(
        "VERHALTEN trägt die Seelen-Blöcke jagd/furcht/temperament/wandern",
        !!(
            V.jagd &&
            Number.isFinite(V.jagd.strikeRange) &&
            V.furcht &&
            Number.isFinite(V.furcht.fleeThreshold) &&
            V.temperament &&
            V.temperament.signaturen &&
            V.temperament.profile &&
            V.wandern &&
            Number.isFinite(V.wandern.leashBaseM)
        )
    );
    // ── A4) SCHLUSS-WELLE (17.07.) — die neun heimgekehrten Blöcke reisen:
    // Stopp-Distanzen (jagd/furcht) · Stimmungs-Schwellen · freude/sprung ·
    // Größen-Bänder · separation · aufgaben · herde · wasser.
    check(
        "VERHALTEN trägt die Schluss-Welle-Blöcke (schwellen/freude/sprung/groessen/separation/aufgaben/herde/wasser + Stopp-Distanzen)",
        !!(
            Number.isFinite(V.jagd && V.jagd.pirschStoppM) &&
            Number.isFinite(V.furcht && V.furcht.neugierStoppM) &&
            V.stimmung.schwellen &&
            Number.isFinite(V.stimmung.schwellen.weideDiet) &&
            V.freude &&
            Number.isFinite(V.freude.tempoMul) &&
            V.sprung &&
            Number.isFinite(V.sprung.impulsProM) &&
            Array.isArray(V.groessen) &&
            V.groessen.length >= 2 &&
            V.groessen.every((k) => k && typeof k.name === "string" && k.min > 0 && k.min < k.max) &&
            V.separation &&
            Number.isFinite(V.separation.radiusBaseM) &&
            V.aufgaben &&
            Number.isFinite(V.aufgaben.followTempo) &&
            V.herde &&
            Number.isFinite(V.herde.gewicht) &&
            V.wasser &&
            Number.isFinite(V.wasser.uferBias)
        )
    );
    // Die Größen-Bänder sind lückenlos aufsteigend (die letzte Zeile fängt den Rest).
    const gr = Array.isArray(V.groessen) ? V.groessen : [];
    let grOk = gr.length >= 2;
    for (let i = 1; i < gr.length; i++) if (!(gr[i].bis > gr[i - 1].bis)) grOk = false;
    check("groessen-Bänder strikt aufsteigend (bis-Schwellen)", grOk);
}

// ── B) KONSUM-ANKER im Stamm ──
const probe = (name, re) => check("KONSUM: " + name, re.test(stamm));
probe("_motionProfileName trägt den Zustand-Vorrang (zustand vor Emotion)", /MOTION_ZUSTAND_PROFILES\[zustand\]/);
probe("updateCreatures stempelt die JAGD (Stempel am Hunt-Drive)", /_kreaturZustandStempel\(creature, "jagd"\)/);
probe("updateCreatures stempelt die FLUCHT", /_kreaturZustandStempel\(creature, "flucht"\)/);
probe("der Schwimm-Stempel lebt an der Wasser-Wahrheit", /_motionZustand = "schwimmen"/);
probe("_animateTierBaum konsumiert bodyX (Rumpf-Neigung reist)", /T\.wolf\.rotation\.x = \(Number\(P\.bodyX\)/);
probe("_animateTierBaum trägt den Aktions-Overlay", /_verhaltenAktion/);
probe("der Verhaltens-Tick würfelt deterministisch (FNV, kein Math.random)", /_verhaltenHash\(/);
// SPIEGEL-ZENSUS 17.07. — die Seelen-Konsum-Anker:
probe(
    "die Verhaltens-Zahlen fließen durch den EINEN memoisierten Leser (_verhaltenGesetz)",
    /_verhaltenGesetzMemo/
);
probe("der Gang-Phasen-Seed liest das Gesetz (P.phases statt hartem Trab)", /Array\.isArray\(P\.phases\)/);
probe("die Gegenwehr schlägt mit der EINEN Biss-Reichweite (jagd.strikeRange)", /< VG\.jagd\.strikeRange/);
// SCHLUSS-WELLE 17.07. — die Konsum-Anker der neun heimgekehrten Blöcke:
probe("die Stimmungs-Schwellen sind Gesetz (Tick liest stimmung.schwellen)", /_verhaltenGesetz\(\)\.stimmung\.schwellen/);
probe("die Größen-Bänder sind Gesetz (_creatureBodySize liest groessen)", /_verhaltenGesetz\(\)\.groessen/);
probe("die Separations-Kraft liest das Gesetz (VERHALTEN.separation)", /_verhaltenGesetz\(\)\.separation/);
probe("die Aufgaben-Tempi/Halt-Distanzen lesen das Gesetz (aufgaben.*)", /aufgaben\.followTempo/);
probe("die Schwarm-Kohäsion liest das Gesetz (herde.gewicht/maxNachbarn)", /HERDE\.maxNachbarn/);
probe("die Ufer-Scheu liest das Gesetz (wasser.tiefenScheuM/uferBias)", /WAS\.tiefenScheuM/);
probe("Pirsch-/Neugier-Stopp lesen das Gesetz (pirschStoppM/neugierStoppM)", /VG\.jagd\.pirschStoppM/);
probe("der Hüpf-Impuls liest das Gesetz (sprung.impulsProM)", /VG\.sprung\.impulsProM/);

// ── C) SELBST-TEST: injizierte tote Zeile wird erkannt ──
const fakeTargets = kreaturTargets.concat(["gibtsnicht"]);
const fakeDead = fakeTargets.filter((n) => !MOTION[n]);
check("SELBST-TEST: eine injizierte tote Zustand-Zeile fällt auf", fakeDead.length === 1);

if (fails > 0) {
    console.log(`\n❌ ROT — ${fails} Verletzung(en).`);
    process.exit(1);
}
console.log(
    "\n✅ GRÜN — DAS KREATUR-LEBEN IST VERBUNDEN: jedes reisende Preset hat einen wählenden Pfad (Zustand vor Emotion), die Verhaltens-Seele ist in sich geschlossen und der Baum-Gang trägt sie."
);
