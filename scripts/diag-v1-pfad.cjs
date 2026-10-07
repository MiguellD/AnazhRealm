// diag-v1-pfad.cjs — DIE V1-PFAD-LINSE (Welle L, Familie auge-v1): die Defekte, die die Leben-Prüfung am 06.10. auf dem
// gespielten v1.0-Pfad fand (artifacts/profiband/leben/befund-v1-pfad.md, synthese.md Q14/Q15), je beim NAMEN. Jede
// Probe ruft den Chokepoint selbst (die Methode, in der der Defekt saß) im echten Boot (headless, foundry-ON,
// Null-Renderer der Welt) und misst seine Wirkung — keine Probe ersetzt die Stelle, an der der Defekt sitzt (Q0).
//
//   V-D3 (Q14) — DIE VORSCHAU ZEIGT IHR WERK: die Werkstatt öffnet, die Eiche wird gewählt, die Vorschau zeichnet über
//     `_workshopRender`. Die Linse liest am Vorschau-Renderer, mit welchem Masken-Stand er gerufen wird (der
//     Neben-Renderer ist der Beobachtungs-Punkt — er bekommt den Stand, die GPU-Arbeit bleibt aus), und rechnet mit dem
//     EINEN Masken-Gesetz (`__phytoCore.lodCrossfadeMask`) über die Vertices der Vorschau, welcher Anteil der Eiche
//     im Bild bleibt. Befund: 21 108 Dreiecke in der Szene, 0 im Bild (das Welt-Auge stand 36 m weit).   Soll ≥ 0,99
//     Dazu die Wand: jeder Neben-Renderer zeichnet nur über `_buehneRender`, und der setzt die Maske um den Render aus.
//
//   V-D1 (Q15) — DIE ANKUNFT AUF DER LICHTUNG: der echte Boot legt die Genesis-Plattform, der Wald wächst um den
//     Spieler (Chunk-Strom + Pflanz-Schlange). Gemessen an den GEPFLANZTEN Bäumen: Stamm-Abstand zur Plattform-Mitte und
//     ihre Krone in der Welt (Kronen-Radius der Art × Größe × Welt-Skala — auf der echten GPU gegen die weiteste Ast-Spitze
//     der gezeichneten Instanz geprüft). Befund: eine Tanne 2,0 m vom Mittelpunkt, der erste Blick eine Nadelwand.
//     Soll: keine Krone über der Scheibe. Dazu der Genesis-Ring im echten Spiel-Takt auf einem Gerät über dem
//     Frame-Budget (`_frameOverBudget` fest wahr — die Werkbank-GPU: 160 von 160 Proben): er steht (Existenz vor
//     Framerate) und um die Plattform (Schöpfer V18.486), nicht um den Ursprung 36 m daneben.     Soll Ring-Mitte ≤ 1 m
//
//   Q15-EINZELSCHNITTE, je der Chokepoint selbst gerufen:
//     V-D5 — `renderRecipeBook` in frieden, dann in schöpfer: der Mach-Knopf der Eiche wird frei (Befund: gesperrt).
//     V-k4 — keydown W, dann das blur-Ereignis des Fensters: W ist los (Befund: 4,63 m in 278 Frames ohne Taste).
//     V-D6 — `llmCall` gegen einen lokalen Endpunkt ohne Dienst: der Fehler nennt den Host, nie CORS.
//     V-k5 — „pflanz mir einen eichenhain am wasser" an einem Ort ohne Wasser im 84-m-Kreis (eigenes 4-m-Raster):
//       0 Eichen, die Absage im Chat (Befund: 6 Eichen um den Spieler, „am Wasser gewachsen").
//     V-k6 — „pflanz mir zwei birken" mit P2P an: das gesendete Programm trägt den Ort aufgelöst (["at", …]), der
//       Empfänger 200 m weiter pflanzt beim Absender (Befund: 203/206 m vom Absender). Der Sende-Punkt `p2pSend` ist
//       der Beobachtungs-Punkt (das Netz), der Chokepoint `dslRun` → `_dslMitOrten` läuft echt.
//     V-D8 — das Label der Art im Chat („Birke", nie „baum_birke"), die Dorf-Zählung nur im Log.
//     V-k5-KLASSE — an demselben trockenen Ort läuft JEDE Op mit ["near_water", 60] (spawn_creature · tree · studio ·
//       island · ufo · village · temple · waterfall · blueprint · fractal · deposit_life · deposit_emotion) und eine chain
//       durch `dslRun`: jede scheitert benannt an der Engstelle `dslEvalPos` („kein Wasser im Umkreis von 60 m", die Op im
//       Eintrag), keine wirft, keine ändert die Welt (die Welt-Akte sind Beobachtungs-Punkte), die chain bricht nur die Op
//       ohne Ort ab; `spawnSettlement({ position: null })` gründet nie beim Spieler. Befund 6b988a07: neun Ops warfen
//       TypeError, spawn_village rief spawnSettlement ohne Ort (→ Spieler-Ort); cf9a07ba: jede Op am Spieler-Ort.
//     V-k5-KLASSE, DER REST (Gegenprüfung pruef3) — jeder UNGÜLTIGE Ort scheitert benannt an derselben Engstelle: ein
//       Text, eine Zahl, ein Objekt oder [] statt Knoten (die KI schreibt "near_water" ohne Klammern), `at` mit fehlendem
//       oder nicht-numerischem x/y/z (Number(null) === 0), jeder Auflöser mit einem Text statt seiner Zahl (Radius,
//       Abstand, Spanne), `far_player` ohne Abstände, die Koordinaten von voxel_carve/voxel_fill, jeder spieler-relative
//       Ort ohne Spieler (auch der Feld-Akt ohne Knoten, die nächste Kreatur, der Mess-Ort einer Regel). Dazu die Defaults:
//       ein FEHLENDER Radius/Abstand ist der dokumentierte (near_water 60 m, at_player_forward 5 m, at_field_need 50 m),
//       nie die Untergrenze von `dslClamp`. Befund c52089c7: der Text wird der Ursprung, at(null) die 0, das Dorf ohne
//       Abstände steht beim Spieler, voxel_carve(null) gräbt bei 0, near_water ohne Radius sucht 8 m.
//     R2 — DIE WASSER-SUCHE: das Urteil `_isAboveWaterAt` (mit dem Fels-Beweis `_felsUeber`) gegen den vollen Spalten-Scan,
//       3 600 Urteile um den trockenen Ort, die Plattform und das nächste Wasser — 0 Abweichungen; dann
//       `_findNearestWaterPoint` für Trinken (40 m), Chat (80 m), KI (200 m), Spalten-Scans gezählt (Scan und Urteil sind
//       Beobachtungs-Punkte). Soll trocken ≤ 8 je 4-m-Ring (die Strahlen-Suche von cf9a07ba). Befund 6b988a07: 351/1330/8037.
//
//   node scripts/diag-v1-pfad.cjs [--selftest]          Port: V1_PFAD_PORT (Standard 4421)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");

const PORT = Number(process.env.V1_PFAD_PORT || 4421);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

function ohneKommentare(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index + m[0].length - 1);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}

// ── DIE VERDIKTE (pure Funktionen; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
const SOLL = { vorschauAnteil: 0.99 };
function vorschauVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!(m.renders > 0)) out.push("vorschau zeichnete nie");
    if (!(m.vertices > 0)) out.push("vorschau ohne Werk");
    if (!(m.anteil >= SOLL.vorschauAnteil))
        out.push(`vorschau ${(100 * (m.anteil || 0)).toFixed(1)} % im Bild (Maske ${m.maskeImRender}, Auge ${m.augeAbstand} m)`);
    if (m.maskeDanach !== m.maskeWelt) out.push(`welt-maske nach dem Vorschau-Render ${m.maskeDanach} statt ${m.maskeWelt}`);
    return out;
}

function ankunftVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!(m.baeume > 0)) out.push("kein Wald um die Plattform gewachsen");
    if (m.kronen > 0) out.push(`${m.kronen} Krone(n) über der Scheibe (nächster Stamm ${m.naechsterStamm} m, ${m.naechsteArt})`);
    if (!(m.ringPortale > 0)) out.push("kein Genesis-Ring (über dem Frame-Budget)");
    else if (!(m.ringMitteAbstand <= 1)) out.push(`ring-mitte ${m.ringMitteAbstand} m neben der Plattform`);
    if (m.trocken !== true) out.push("plattform im wasser");
    return out;
}

function rezeptVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.friedenGesperrt) out.push("frieden: der Knopf ist ohne Material frei (Vorbedingung)");
    if (!m.schoepferFrei) out.push(`schöpfer: der Knopf bleibt gesperrt („${m.titel}")`);
    return out;
}
function tasteVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.gedrueckt) out.push("keydown kam nicht an (Vorbedingung)");
    if (m.nachBlur) out.push("W bleibt nach dem Fensterwechsel gedrückt");
    return out;
}
function kiVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.fehler) out.push("kein Fehler gemeldet (Vorbedingung: der Dienst läuft nicht)");
    else {
        if (/CORS/i.test(m.fehler)) out.push(`lokaler Endpunkt als CORS gemeldet („${m.fehler.slice(0, 60)}…")`);
        if (!m.fehler.includes(m.host)) out.push("der Fehler nennt den Host nicht");
    }
    return out;
}
function satzVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.trockenOrt) out.push("kein Ort ohne Wasser gefunden (Vorbedingung)");
    else if (m.amWasserOhneWasser > 0) out.push(`${m.amWasserOhneWasser} Eichen „am Wasser" ohne Wasser`);
    else if (!/Kein Wasser/.test(m.amWasserZeile || "")) out.push(`die Absage fehlt („${m.amWasserZeile}")`);
    if (!(m.birkenAbsender > 0)) out.push("der Absender pflanzte keine Birke (Vorbedingung)");
    if (/baum_/.test(m.birkenZeile || "") || (m.birkenLabel && !(m.birkenZeile || "").includes(m.birkenLabel)))
        out.push(`der Chat nennt die interne id („${m.birkenZeile}")`);
    if (!m.gesendet) out.push("nichts gesendet (Vorbedingung)");
    else if (!/^\["at",/.test(m.ortKnoten || "")) out.push(`der Ort reist spieler-relativ: ${m.ortKnoten}`);
    if (m.gesendet && !(m.birkenEmpfaenger > 0)) out.push("der Empfänger pflanzte nichts");
    else if (m.gesendet && !(m.empfaengerAbstandZumAbsender <= 40))
        out.push(`der Empfänger pflanzt ${m.empfaengerAbstandZumAbsender} m vom Absender`);
    if (m.telemetrieImChat) out.push("Dorf-Telemetrie im Spieler-Chat");
    return out;
}

// Die V-k5-KLASSE: jede Op mit einem verlangten Ort, den es nicht gibt (near_water in trockener Welt), scheitert benannt
// („kein Wasser im Umkreis von 60 m", die Op im Eintrag), wirft nie, ändert die Welt nirgends; die chain meldet ehrlich; das
// Dorf ohne Ort gründet nie beim Spieler.
const ORT_OPS = [
    "spawn_creature",
    "spawn_tree",
    "spawn_studio",
    "spawn_island",
    "spawn_ufo",
    "spawn_village",
    "spawn_temple",
    "spawn_waterfall",
    "spawn_blueprint",
    "spawn_fractal",
    "deposit_life",
    "deposit_emotion",
];
function ortVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    const soll = new RegExp(`kein Wasser im Umkreis von ${m.radius} m`);
    for (const op of ORT_OPS) {
        const e = m.ops && m.ops[op];
        if (!e) {
            out.push(`${op}: nicht gelaufen`);
            continue;
        }
        if (e.kalt) out.push(`${op}: Buch kalt (Vorbedingung)`);
        else if (e.fehler) out.push(`${op}: wirft (${e.fehler.slice(0, 80)})`);
        if (e.akte && e.akte.length)
            out.push(`${op}: wirkt ohne Ort (${e.akte.map((a) => `${a.nm} ${a.abstand == null ? "ohne Ort" : a.abstand + " m vom Spieler"}`).join(", ")})`);
        if (!e.kalt && !(soll.test(e.grund || "") && e.effekt === op)) out.push(`${op}: scheitert nicht benannt`);
        if (e.ok) out.push(`${op}: meldet Erfolg`);
    }
    const c = m.chain;
    if (!c) out.push("chain: nicht gelaufen");
    else {
        if (c.ok) out.push("chain: meldet Erfolg ohne Ort");
        if (c.fehler) out.push(`chain: wirft (${c.fehler.slice(0, 80)})`);
        if (!(soll.test(c.grund || "") && c.effekt === "spawn_tree")) out.push("chain: nennt den Grund nicht");
        const spawns = (c.akte || []).filter((a) => a.nm !== "_depositLife");
        if (spawns.length) out.push(`chain: wirkt ohne Ort (${spawns.map((a) => a.nm).join(", ")})`);
        if (!(c.akte || []).some((a) => a.nm === "_depositLife")) out.push("chain: bricht ganz ab (der Feld-Akt beim Spieler fehlt)");
    }
    if (!m.buchWarm) out.push("dorf: Buch kalt (Vorbedingung)");
    if (m.dorfAuftraege > 0) out.push(`dorf ohne Ort gründet beim Spieler (${m.dorfAuftraege} Worker-Auftrag)`);
    if (m.dorfOhneOrt != null) out.push("dorf ohne Ort liefert ein Dorf");
    return out;
}

// Der REST der V-k5-KLASSE: jeder UNGÜLTIGE Ort (kein Knoten, at ohne Zahl, ein Text statt der Zahl eines Auflösers, kein
// Spieler) scheitert benannt an `dslEvalPos` — [Name, Programm, Soll-Grund (RegExp), die Op im Eintrag, ohne Spieler].
const KNOTEN = [
    ["Text statt Knoten (die KI ohne Klammern)", ["spawn_studio", "eiche", "near_water", 6], "^„near_water“ ist kein Ort-Knoten", "spawn_studio"],
    ["leerer Knoten", ["spawn_tree", [], 1, "eiche", 5], "^leerer Ort-Knoten", "spawn_tree"],
    ["Zahl statt Knoten", ["spawn_creature", 42, 1, "happy"], "^„42“ ist kein Ort-Knoten", "spawn_creature"],
    ["Objekt statt Knoten", ["spawn_ufo", { x: 3, z: 4 }], "ist kein Ort-Knoten", "spawn_ufo"],
    ["Text statt Knoten im Feld-Akt", ["deposit_life", "near_water", 0.5], "^„near_water“ ist kein Ort-Knoten", "deposit_life"],
    ["at ohne x und z", ["spawn_tree", ["at"], 1, "eiche", 5], "^at: x fehlt", "spawn_tree"],
    ["at mit Text", ["spawn_studio", "eiche", ["at", "abc", 0, "abc"], 1], "^at: x „abc“ ist keine Zahl", "spawn_studio"],
    ["at mit null (Number(null) === 0)", ["spawn_creature", ["at", null, 3, 5], 1, "happy"], "^at: x fehlt", "spawn_creature"],
    ["at ohne z", ["spawn_ufo", ["at", 12, 3]], "^at: z fehlt", "spawn_ufo"],
    ["at mit Text-Höhe", ["spawn_island", ["at", 5, "hoch", 5], 6, 7], "^at: y „hoch“ ist keine Zahl", "spawn_island"],
    ["near_water mit Text-Radius", ["spawn_tree", ["near_water", "abc"], 1, "eiche", 5], "^near_water: Radius „abc“ ist keine Zahl", "spawn_tree"],
    ["near_player mit Text-Radius", ["spawn_creature", ["near_player", "weit"], 1, "happy"], "^near_player: Radius „weit“ ist keine Zahl", "spawn_creature"],
    ["far_player ohne Abstände (das Dorf)", ["spawn_village", ["far_player"], 7], "^far_player: Mindest-Abstand fehlt", "spawn_village"],
    ["far_player mit Text-Höchstabstand", ["spawn_temple", ["far_player", 180, "weit"], 7], "^far_player: Höchst-Abstand „weit“ ist keine Zahl", "spawn_temple"],
    ["random_position mit Text-Spanne", ["spawn_ufo", ["random_position", "x"]], "^random_position: Spanne „x“ ist keine Zahl", "spawn_ufo"],
    ["at_player_forward mit Text-Abstand", ["spawn_tree", ["at_player_forward", "abc"], 1, "eiche", 5], "^at_player_forward: Abstand „abc“ ist keine Zahl", "spawn_tree"],
    ["at_field_need mit Text-Radius", ["deposit_life", ["at_field_need", "abc"], 0.5], "^at_field_need: Radius „abc“ ist keine Zahl", "deposit_life"],
    ["voxel_carve mit null-Koordinaten", ["voxel_carve", null, 50, null, 3], "^at: x fehlt", "voxel_carve"],
    ["voxel_fill mit leerem x", ["voxel_fill", "", 10, 5, 2], "^at: x „“ ist keine Zahl", "voxel_fill"],
    ["at_player ohne Spieler", ["spawn_tree", ["at_player"], 1, "eiche", 5], "^at_player: kein Spieler in der Welt", "spawn_tree", true],
    ["near_player ohne Spieler", ["spawn_creature", ["near_player", 10], 1, "happy"], "^near_player: kein Spieler in der Welt", "spawn_creature", true],
    ["Feld-Akt ohne Knoten und ohne Spieler", ["deposit_life"], "^at_player: kein Spieler in der Welt", "deposit_life", true],
    ["die nächste Kreatur ohne Spieler", ["creature_task_nearest", "wander"], "^at_player: kein Spieler in der Welt", "creature_task_nearest", true],
];
const KNOTEN_DEFAULT = { near_water: 60, at_player_forward: 5, at_field_need: 50 };
function knotenEintragOk(e, soll, effekt) {
    return !!e && !e.fehler && !(e.akte && e.akte.length) && !e.ok && new RegExp(soll).test(e.grund || "") && e.effekt === effekt;
}
function knotenVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    for (const [name, , soll, effekt] of KNOTEN) {
        const e = m.laeufe && m.laeufe[name];
        if (!e) {
            out.push(`${name}: nicht gelaufen`);
            continue;
        }
        if (e.fehler) out.push(`${name}: wirft (${e.fehler.slice(0, 80)})`);
        if (e.akte && e.akte.length)
            out.push(`${name}: wirkt ohne Ort (${e.akte.map((a) => `${a.nm} ${a.abstand == null ? "ohne Ort" : a.abstand + " m vom Spieler"}`).join(", ")})`);
        if (!(new RegExp(soll).test(e.grund || "") && e.effekt === effekt))
            out.push(`${name}: scheitert nicht benannt (${e.grund ? `„${e.grund}“ an ${e.effekt}` : "kein Grund"})`);
        if (e.ok) out.push(`${name}: meldet Erfolg`);
    }
    const d = m.defaults || {};
    if (d.near_water !== `kein Wasser im Umkreis von ${KNOTEN_DEFAULT.near_water} m`)
        out.push(`near_water ohne Radius: „${d.near_water}“ (Soll ${KNOTEN_DEFAULT.near_water} m)`);
    for (const k of ["at_player_forward", "at_field_need"])
        if (!(Math.abs((d[k] == null ? NaN : d[k]) - KNOTEN_DEFAULT[k]) < 0.05))
            out.push(`${k} ohne Zahl: ${d[k]} m vom Spieler (Soll ${KNOTEN_DEFAULT[k]} m)`);
    if (m.messOrtOhneSpieler != null) out.push(`der Mess-Ort einer Regel ohne Spieler ist ${JSON.stringify(m.messOrtOhneSpieler)}`);
    const g = m.gesund || {};
    if (!(g.ok === true && g.akte === 1 && !g.grund)) out.push(`ein gültiger at-Knoten wirkt nicht (Vorbedingung: ${JSON.stringify(g)})`);
    return out;
}

// R2 — DIE WASSER-SUCHE: das Urteil `_isAboveWaterAt` ist bit-gleich zum vollen Spalten-Scan, und die dichte Ring-Suche
// scannt am trockenen Ort (kein Wasser im Kreis, der teuerste Fall) nicht mehr Spalten als die 8-Strahlen-Suche von
// cf9a07ba (8 je 4-m-Ring). Befund 6b988a07: 351/1330/8037 Spalten für 40/80/200 m.
const ALT8 = (R) => 8 * Math.floor(R / 4);
function sucheVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    const ex = m.exakt || {};
    if (!(ex.n >= 1000)) out.push(`zu wenig Urteile (${ex.n}, Vorbedingung)`);
    if (!(ex.nass > 0)) out.push("kein nasser Punkt in der Stichprobe (Vorbedingung)");
    if (ex.falsch > 0) out.push(`das Urteil weicht vom vollen Scan ab: ${ex.falsch} von ${ex.n} (${(ex.beispiele || []).join(" ")})`);
    for (const pfad of ["trinken", "chat", "ki", "ki@trocken-voll"]) {
        const z = (m.zaehlung || {})[pfad.includes("@") ? pfad : `${pfad}@trocken`];
        if (!z) {
            out.push(`${pfad}: nicht gezählt`);
            continue;
        }
        const s = z.hoch != null ? z.hoch : z.scans;
        if (!(s <= ALT8(z.R)))
            out.push(`${pfad} ${z.R} m: ${s} Spalten-Scans bei ${z.proben} Proben${z.hoch != null ? " (hochgerechnet)" : ""} (Soll ≤ ${ALT8(z.R)})`);
    }
    return out;
}

// ── DIE STATISCHE WAND (Node, kommentarfrei). Liefert [name, ok, detail]. ──
function wand(src) {
    const nc = ohneKommentare(src);
    const buehne = fnBody(nc, /\n {4}_buehneRender\(renderer, scene, camera\) \{/) || "";
    // Jeder Neben-Renderer (Werkstatt-Vorschau `p`, Feed/Hof/Ich-Bühne `s`) zeichnet nur über die Bühne.
    const direkt = (nc.match(/\b[ps]\.renderer\.render\(/g) || []).length;
    const ueber = (nc.match(/this\._buehneRender\([ps]\.renderer, [ps]\.scene, [ps]\.camera\)/g) || []).length;
    const evalPos = fnBody(nc, /\n {4}dslEvalPos\(node, ctx\) \{/) || "";
    const effekte = fnBody(nc, /\n {4}get dslEffects\(\) \{/) || "";
    const wachen = (effekte.match(/if \(!pos\)/g) || []).length;
    // Die Genesis-Plattform sucht nur `_genesisPlattform` (Spawn-Idempotenz, Rückkehr-Anker, Genesis-Ort lesen sie).
    const plattSuchen = (nc.match(/\.type === "start_plattform"/g) || []).length;
    const plattQuelle = /\.type === "start_plattform"/.test(fnBody(nc, /\n {4}_genesisPlattform\(\) \{/) || "");
    // Die Auflöser kennen keinen Ersatz-Ort: kein Spieler-/Ursprungs-Ersatz, keine Zahl ohne den EINEN Leser `_dslOrtZahl`
    // (dslClamp gab für jedes Ungültige die Untergrenze, Number(null) ist 0); die Feld-Akte und die Voxel-Ops lesen ihren
    // Ort an der Engstelle.
    const positionen = fnBody(nc, /\n {4}get dslPositions\(\) \{/) || "";
    const regelPos = fnBody(nc, /\n {4}_dslRulePos\(posNode, ctx\) \{/) || "";
    const ersatz = [
        (positionen.match(/_defaultSpawnPos\(\)/g) || []).length,
        (positionen.match(/dslClamp\(/g) || []).length,
        (positionen.match(/\bNumber\(/g) || []).length,
        (effekte.match(/const c[xyz] = Number\(/g) || []).length,
        (effekte.match(/playerMesh\.position : \{ x: 0/g) || []).length,
    ];
    return [
        [
            "W1 die Bühne zeichnet ungemaskt (`_buehneRender`: uLodMaskOn 0 um den Render, im finally zurück)",
            /lu\.uLodMaskOn\.value = 0;/.test(buehne) && /finally\s*\{[^}]*lu\.uLodMaskOn\.value = an;/.test(buehne),
        ],
        [
            "W2 jeder Neben-Renderer zeichnet über die Bühne (0 direkte p/s.renderer.render, 4 über `_buehneRender`)",
            direkt === 0 && ueber === 4,
            `${direkt} direkt · ${ueber} über die Bühne`,
        ],
        [
            "W3 der Orts-Vertrag sitzt an der Engstelle (`dslEvalPos` wirft `_dslKeinOrt`, liefert nie null; den Default-Spawn nur ohne Knoten, `node == null`)",
            /throw fehler;/.test(evalPos) &&
                /this\._dslKeinOrt\(/.test(evalPos) &&
                !/return null/.test(evalPos) &&
                (evalPos.match(/_defaultSpawnPos\(\)/g) || []).length === 1 &&
                /if \(node == null\) return this\._defaultSpawnPos\(\);/.test(evalPos),
        ],
        ["W4 keine Op bewacht ihren Ort selbst (0 `if (!pos)` in den DSL-Effekten — sie lesen die Engstelle)", wachen === 0, `${wachen} Wache(n)`],
        [
            "W5 die Genesis-Plattform hat EINE Quelle (`_genesisPlattform` sucht sie; Spawn-Idempotenz und Rückkehr-Anker lesen sie)",
            plattQuelle && plattSuchen === 1,
            `${plattSuchen} Suche(n) nach start_plattform`,
        ],
        [
            "W6 die Auflöser kennen keinen Ersatz-Ort (dslPositions: 0 `_defaultSpawnPos()`, 0 `dslClamp`, 0 `Number(`; Voxel-Ops ohne eigene Koordinaten-Leser, kein Ursprung statt Spieler; `_dslRulePos` setzt at_player nur für `== null`)",
            ersatz.every((n) => n === 0) && /posNode == null/.test(regelPos) && !/Array\.isArray/.test(regelPos),
            `Ersatz-Stellen ${ersatz.join("/")}`,
        ],
    ];
}

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// ── DIE PROBEN IN DER SEITE (Funktionsrumpf; r = die Welt). ──
async function probe(arg) {
    const kiPort = arg && arg.kiPort;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const out = {};
    const dl0 = performance.now() + 90000;
    while (
        (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
        performance.now() < dl0
    )
        await sleep(100);
    const r = window.anazhRealm;
    const st = r.state;
    const tick = async (n, ms) => {
        for (let i = 0; i < n; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(ms || 30);
        }
    };
    // ── V-D1: die Ankunft ──
    try {
        const m = { gestartet: false };
        out.ankunft = m;
        const dl0b = performance.now() + 60000;
        while (performance.now() < dl0b && !st.architectures.some((a) => a && a.type === "start_plattform")) await tick(1, 100);
        const plat = st.architectures.find((a) => a && a.type === "start_plattform");
        if (!plat) throw new Error("keine Genesis-Plattform");
        const platR = st.blueprints.start_plattform.parts[0].size.x / 2;
        const P = plat.position;
        m.plattform = [+P.x.toFixed(1), +P.z.toFixed(1)];
        m.trocken = r._isAboveWaterAt(P.x, P.z, 0);
        // Der Wald wächst um den Spieler: ticken, bis die Bäume im 40-m-Kreis ruhen.
        const baeume = () =>
            st.architectures.filter((a) => a && /^baum_/.test(a.type) && Math.hypot(a.position.x - P.x, a.position.z - P.z) < 40);
        let stabil = 0,
            last = -1;
        const dl = performance.now() + 150000;
        const t0 = performance.now();
        while (performance.now() < dl) {
            await tick(4, 20);
            const n = baeume().length;
            if (n === last) stabil++;
            else {
                stabil = 0;
                last = n;
            }
            if (stabil >= 15 && n > 0 && performance.now() - t0 > 8000) break;
        }
        const F = r.constructor.FOREST;
        let kronen = 0,
            naechster = Infinity,
            art = null;
        const bs = baeume();
        for (const a of bs) {
            const d = Math.hypot(a.position.x - P.x, a.position.z - P.z);
            const k = r._foundryWorldScaleMatrix(r._foundryPresetFor(a.type)).elements[0] || 1;
            const krone = (F.crown[a.type] || 4) * (a.scale || 1) * k;
            if (d < platR + krone) kronen++;
            if (d < naechster) {
                naechster = d;
                art = a.type;
            }
        }
        m.baeume = bs.length;
        m.kronen = kronen;
        m.naechsterStamm = Number.isFinite(naechster) ? +naechster.toFixed(2) : null;
        m.naechsteArt = art;
        // Der Genesis-Ring: der Kreis der Kern-Portale um den Genesis-Ort — im ECHTEN Spiel-Takt auf einem Gerät, dessen
        // Frame-Budget immer überschritten ist (die Radeon 890M der Werkbank: 160 von 160 Proben über 40 s). Headless ruht
        // der Auto-Zug; der Hook öffnet ihn wie im Spiel, `_frameOverBudget` steht fest auf wahr (das langsame Gerät).
        const hookAlt = window.__anazhAutoSettlement;
        window.__anazhAutoSettlement = true;
        Object.defineProperty(st, "_frameOverBudget", { configurable: true, get: () => true, set: () => {} });
        try {
            for (let i = 0; i < 40 && !(st.worldMeta && st.worldMeta.genesisPortalRing); i++) await tick(1, 60);
        } finally {
            delete st._frameOverBudget;
            st._frameOverBudget = false;
            if (hookAlt === undefined) delete window.__anazhAutoSettlement;
            else window.__anazhAutoSettlement = hookAlt;
        }
        const ring = st.architectures.filter(
            (a) => a && /^welt_/.test(a.type) && Math.hypot(a.position.x - P.x, a.position.z - P.z) < 80
        );
        m.ringPortale = ring.length;
        if (ring.length) {
            const cx = ring.reduce((s2, a) => s2 + a.position.x, 0) / ring.length;
            const cz = ring.reduce((s2, a) => s2 + a.position.z, 0) / ring.length;
            m.ringMitteAbstand = +Math.hypot(cx - P.x, cz - P.z).toFixed(2);
        }
        m.gestartet = true;
    } catch (e) {
        out.ankunft = Object.assign(out.ankunft || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-D5: das Rezeptbuch urteilt nach dem Spielmodus ──
    try {
        const m = { gestartet: false };
        out.rezept = m;
        const host = document.getElementById("inventory-recipes");
        if (!host) throw new Error("kein #inventory-recipes");
        const lbl = (st.blueprints.baum_eiche && st.blueprints.baum_eiche.label) || "baum_eiche";
        const knopf = () => {
            for (const row of host.querySelectorAll(".recipe-row")) {
                const nm = row.querySelector(".recipe-name");
                if (nm && nm.textContent === lbl) return row.querySelector("button");
            }
            return null;
        };
        const modusAlt = r.getGameMode();
        r.setGameMode("frieden");
        r.renderRecipeBook();
        const k0 = knopf();
        m.friedenGesperrt = !!k0 && k0.disabled === true;
        r.setGameMode("schöpfer");
        r.renderRecipeBook();
        const k1 = knopf();
        m.schoepferFrei = !!k1 && k1.disabled === false;
        m.titel = k1 ? k1.title || "" : "kein Knopf";
        r.setGameMode(modusAlt);
        m.gestartet = true;
    } catch (e) {
        out.rezept = Object.assign(out.rezept || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-k4: der Fensterwechsel löst die Tasten ──
    try {
        const m = { gestartet: false };
        out.taste = m;
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "w", code: "KeyW", bubbles: true }));
        m.gedrueckt = st.keys.w === true;
        window.dispatchEvent(new Event("blur"));
        m.nachBlur = st.keys.w === true;
        window.dispatchEvent(new KeyboardEvent("keyup", { key: "w", code: "KeyW", bubbles: true }));
        m.gestartet = true;
    } catch (e) {
        out.taste = Object.assign(out.taste || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-D6: der KI-Fehler nennt die Ursache ──
    try {
        const m = { gestartet: false };
        out.ki = m;
        const llm = st.llm;
        const alt = {
            enabled: llm.enabled,
            provider: llm.provider,
            ep: llm.providerConfig.ollama.endpoint,
            px: llm.providerConfig.ollama.useProxy,
            last: llm.lastResponseAt,
        };
        llm.enabled = true;
        llm.provider = "ollama";
        llm.providerConfig.ollama.endpoint = "http://127.0.0.1:" + kiPort;
        llm.providerConfig.ollama.useProxy = false;
        llm.lastResponseAt = -1e9;
        let antwort = null;
        try {
            antwort = await r.llmCall("hallo welt");
        } finally {
            llm.enabled = alt.enabled;
            llm.provider = alt.provider;
            llm.providerConfig.ollama.endpoint = alt.ep;
            llm.providerConfig.ollama.useProxy = alt.px;
            llm.lastResponseAt = alt.last;
        }
        m.fehler = antwort && antwort.error ? String(antwort.error) : null;
        m.host = "127.0.0.1:" + kiPort;
        m.gestartet = true;
    } catch (e) {
        out.ki = Object.assign(out.ki || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-k5 · V-k6 · V-D8: der Satz trifft die Welt ──
    try {
        const m = { gestartet: false };
        out.satz = m;
        const archs = st.architectures;
        const pm = st.playerMesh.position;
        const ausgabe = document.getElementById("chat-output");
        const letzteZeile = () => (ausgabe && ausgabe.lastElementChild ? ausgabe.lastElementChild.textContent : "");
        const nass = (x, z) => !r._isAboveWaterAt(x, z, 0.2);
        // Ein Ort ohne Wasser im 84-m-Kreis (eigenes 4-m-Raster, unabhängig von der Such-Funktion des Spiels).
        const trockenUm = (x, z) => {
            for (let dz = -84; dz <= 84; dz += 4)
                for (let dx = -84; dx <= 84; dx += 4) if (dx * dx + dz * dz <= 84 * 84 && nass(x + dx, z + dz)) return false;
            return true;
        };
        let ort = null;
        for (const [x, z] of [[pm.x, pm.z], [200, 200], [-200, 200], [200, -200], [-200, -200], [400, 0], [0, 400], [-400, 0]]) {
            if (r._isAboveWaterAt(x, z, 1) && trockenUm(x, z)) {
                ort = { x, z };
                break;
            }
        }
        m.trockenOrt = ort;
        const setze = (x, z) => {
            pm.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            st.yaw = 0;
        };
        const neue = (vorher, typ) => archs.slice(vorher).filter((a) => a && a.type === typ);
        if (ort) {
            setze(ort.x, ort.z);
            const v0 = archs.length;
            r.processChatCommand("pflanz mir einen eichenhain am wasser");
            const n0 = neue(v0, "baum_eiche");
            m.amWasserOhneWasser = n0.length;
            m.amWasserZeile = letzteZeile();
            for (const a of n0.reverse()) r.removeArchitecture(a);
        }
        // V-D8 + V-k6: „pflanz mir zwei birken" beim Absender — das Label im Chat, der Ort reist aufgelöst.
        const p2p = st.p2p;
        const p2pAlt = { enabled: p2p.enabled, connected: p2p.connected };
        const sendAlt = r.p2pSend;
        const gesendet = [];
        p2p.enabled = true;
        p2p.connected = true;
        r.p2pSend = (o) => gesendet.push(o);
        const sx = ort ? ort.x : pm.x,
            sz = ort ? ort.z : pm.z;
        setze(sx, sz);
        const v1 = archs.length;
        try {
            r.processChatCommand("pflanz mir zwei birken");
        } finally {
            r.p2pSend = sendAlt;
            p2p.enabled = p2pAlt.enabled;
            p2p.connected = p2pAlt.connected;
        }
        const nB = neue(v1, "baum_birke");
        m.birkenAbsender = nB.length;
        m.birkenZeile = letzteZeile();
        m.birkenLabel = (st.blueprints.baum_birke && st.blueprints.baum_birke.label) || null;
        const msg = gesendet.find((o) => o && o.type === "dsl");
        m.gesendet = !!msg;
        m.ortKnoten = msg && Array.isArray(msg.program) ? JSON.stringify(msg.program[2]) : null;
        for (const a of nB.slice().reverse()) r.removeArchitecture(a);
        // Der Empfänger steht 200 m weiter: seine Birken stehen dort, wo der Absender sie wollte.
        if (msg) {
            setze(sx + 200, sz);
            const v2 = archs.length;
            r._p2pMsgDsl({ type: "dsl", peerId: "peer-empfaenger-probe", program: msg.program }, { peerId: "self" });
            const nE = neue(v2, "baum_birke");
            m.birkenEmpfaenger = nE.length;
            m.empfaengerAbstandZumAbsender = nE.length
                ? +Math.max(...nE.map((a) => Math.hypot(a.position.x - sx, a.position.z - sz))).toFixed(1)
                : null;
            for (const a of nE.reverse()) r.removeArchitecture(a);
        }
        setze(sx, sz);
        // V-D8: die Dorf-Zählung bleibt im Log.
        const z0 = ausgabe ? ausgabe.childElementCount : 0;
        r._nachDorfOrientieren({ x: sx, z: sz }, { placed: 1 });
        const neuZeilen = ausgabe ? Array.from(ausgabe.children).slice(z0).map((c) => c.textContent) : [];
        m.telemetrieImChat = neuZeilen.some((t) => /Bauten n=/.test(t));
        m.gestartet = true;
    } catch (e) {
        out.satz = Object.assign(out.satz || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-k5-KLASSE: jede Op, deren verlangter Ort fehlt, scheitert benannt — an dem trockenen Ort der Satz-Probe ──
    try {
        const m = { gestartet: false, ops: {} };
        out.ort = m;
        const ort = out.satz && out.satz.trockenOrt;
        if (!ort) throw new Error("kein Ort ohne Wasser im 84-m-Kreis (Vorbedingung)");
        const pm = st.playerMesh.position;
        pm.set(ort.x, r._voxelSurfaceY(ort.x, ort.z) + 1.8, ort.z);
        st.yaw = 0;
        // Beobachtungs-Punkte: jeder Welt-Akt einer Op (er wird aufgezeichnet und läuft weiter); das Dorf und der Voxel-Edit
        // werden nur aufgezeichnet (der Dorf-Bau ist ein Worker-Rundlauf, ein Edit gräbt die Mess-Welt um — gezählt wird,
        // ob eine Op ohne Ort wirken will); die nächste Kreatur wird mit ihrem Bezugs-Ort aufgezeichnet.
        const akte = [];
        const ortVon = {
            spawnCreatureAt: (a) => ({ x: a[0], z: a[2] }),
            spawnArchitecture: (a) => a[1] || null,
            spawnIslandAt: (a) => ({ x: a[0], z: a[2] }),
            spawnUfoAt: (a) => ({ x: a[0], z: a[2] }),
            spawnSettlement: (a) => (a[0] && a[0].position) || null,
            _depositLife: (a) => ({ x: a[0], z: a[1] }),
            _depositEmotion: (a) => ({ x: a[0], z: a[1] }),
            carveVoxelSphere: (a) => ({ x: a[0], z: a[2] }),
            fillVoxelSphere: (a) => ({ x: a[0], z: a[2] }),
            assignTaskToNearestCreature: (a) => a[0] || null,
        };
        const nurAufzeichnen = { spawnSettlement: () => Promise.resolve(null), carveVoxelSphere: () => {}, fillVoxelSphere: () => {} };
        const alt = {};
        for (const nm of Object.keys(ortVon)) {
            alt[nm] = r[nm];
            r[nm] = function (...a) {
                const p = ortVon[nm](a);
                akte.push({ nm, abstand: p && Number.isFinite(p.x) ? +Math.hypot(p.x - pm.x, p.z - pm.z).toFixed(1) : null });
                return nurAufzeichnen[nm] ? nurAufzeichnen[nm]() : alt[nm].apply(this, a);
            };
        }
        const NW = ["near_water", 60];
        const baum = Object.keys(st.blueprints).find((k) => k.startsWith("baum_")) || "baum_eiche";
        const OPS = [
            ["spawn_creature", NW, 2, "happy"],
            ["spawn_tree", NW, 2, "eiche", 5],
            ["spawn_studio", "eiche", NW, 3, 5],
            ["spawn_island", NW, 10, 5, 12],
            ["spawn_ufo", NW],
            ["spawn_village", NW, 7],
            ["spawn_temple", NW, 7],
            ["spawn_waterfall", NW, 7],
            ["spawn_blueprint", baum, NW, 7],
            ["spawn_fractal", NW, "temple", 0, 0.5, 7],
            ["deposit_life", NW, 0.5],
            ["deposit_emotion", "joy", 0.5, NW],
        ];
        const lauf = (prog) => {
            const a0 = akte.length;
            const res = r.dslRun(prog, { source: "test" });
            const ohne = res.log.find((e) => e.event === "invalid_position");
            const wurf = res.log.find((e) => /exception/.test(e.event));
            return {
                ok: res.ok,
                grund: ohne ? ohne.grund || null : null,
                effekt: ohne ? ohne.effekt || null : null,
                fehler: wurf ? `${wurf.event}: ${wurf.message}` : null,
                kalt: res.log.some((e) => e.event === "skipped"),
                akte: akte.slice(a0),
            };
        };
        try {
            for (const prog of OPS) m.ops[prog[0]] = lauf(prog);
            // Die chain bricht genau die Op ohne Ort ab, läuft weiter (der Feld-Akt beim Spieler) und meldet ehrlich.
            m.chain = lauf(["chain", ["spawn_tree", NW, 1, "eiche", 5], ["deposit_life", ["at_player"], 0.1]]);
            // DER REST DER KLASSE: jeder ungültige Ort (kein Knoten, at ohne Zahl, Text statt Zahl, kein Spieler) — je
            // Programm durch `dslRun`; „ohne Spieler" nimmt den Spieler-Leib für genau diesen Lauf aus der Welt (synchron,
            // kein Takt dazwischen).
            const k = { gestartet: false, laeufe: {} };
            out.knoten = k;
            try {
                const leib = st.playerMesh;
                const ohneSpieler = (fn) => {
                    st.playerMesh = null;
                    try {
                        return fn();
                    } finally {
                        st.playerMesh = leib;
                    }
                };
                for (const [name, prog, ohne] of (arg && arg.knoten) || []) k.laeufe[name] = ohne ? ohneSpieler(() => lauf(prog)) : lauf(prog);
                // Die Defaults der Auflöser: ein FEHLENDER Radius/Abstand ist der dokumentierte, nie die Untergrenze.
                const grundVon = (node) => {
                    try {
                        r.dslEvalPos(node, r.dslCtx({ source: "test" }));
                        return null;
                    } catch (e) {
                        return e && e.dslKeinOrt ? e.dslKeinOrt.grund : String(e);
                    }
                };
                const abstandVon = (node) => {
                    const q = r.dslEvalPos(node, r.dslCtx({ source: "test" }));
                    return +Math.hypot(q.x - pm.x, q.z - pm.z).toFixed(2);
                };
                k.defaults = {
                    near_water: grundVon(["near_water"]),
                    at_player_forward: abstandVon(["at_player_forward"]),
                    at_field_need: abstandVon(["at_field_need"]),
                };
                // Der Mess-Ort einer Regel ohne Positions-Knoten (Wetter) ohne Spieler: keiner — nie der Ursprung.
                k.messOrtOhneSpieler = ohneSpieler(() => r._ruleRewardPos(["weather", "sunny"], r.dslCtx({ source: "test" })));
                // Gegenprobe: ein gültiger at-Knoten wirkt genau einmal.
                const g = lauf(["deposit_life", ["at", pm.x + 3, pm.y, pm.z + 4], 0.1]);
                k.gesund = { ok: g.ok, akte: g.akte.length, grund: g.grund };
                k.gestartet = true;
            } catch (e) {
                k.err = (e && e.stack) || String(e);
            }
        } finally {
            for (const nm of Object.keys(alt)) r[nm] = alt[nm];
        }
        // Das Dorf selbst: ein verlangter, fehlender Ort gründet nie beim Spieler (der Worker-Auftrag ist der
        // Beobachtungs-Punkt; die Absage kommt vor ihm).
        const anfrage = r._foundryRequestSettlement;
        let auftraege = 0;
        r._foundryRequestSettlement = function () {
            auftraege++;
            return Promise.resolve(null);
        };
        m.buchWarm = !!(r._foundry && r._foundry.ready && r._foundry.recipes);
        try {
            m.dorfOhneOrt = await r.spawnSettlement({ position: null, seed: 7, nH: 9 });
        } finally {
            r._foundryRequestSettlement = anfrage;
        }
        m.dorfAuftraege = auftraege;
        m.radius = NW[1];
        m.gestartet = true;
    } catch (e) {
        out.ort = Object.assign(out.ort || {}, { err: (e && e.stack) || String(e) });
    }
    // ── R2: DIE WASSER-SUCHE SCANNT NUR, WO WASSER SEIN KANN — gezählt werden Spalten-Scans (`_voxelSurfaceY`) ──
    try {
        const m = { gestartet: false, zaehlung: {} };
        out.suche = m;
        const ort = out.satz && out.satz.trockenOrt;
        if (!ort) throw new Error("kein Ort ohne Wasser im 84-m-Kreis (Vorbedingung)");
        const plat = st.architectures.find((a) => a && a.type === "start_plattform");
        const P = plat ? { x: plat.position.x, z: plat.position.z } : { x: 0, z: 0 };
        const scan = r._voxelSurfaceY;
        const urteil = r._isAboveWaterAt;
        // (a) Das Urteil gegen den vollen Spalten-Scan (die Referenz, wie bis 06.10. gerechnet): 3 Margen, je 400 Punkte
        //     um den trockenen Ort, die Plattform und das nächste Wasser (deterministischer Zufall).
        const ref = (x, z, mg) => {
            const s = scan.call(r, x, z);
            return s !== null && Number.isFinite(s) && s > r._waterLevelAt(x, z) + mg;
        };
        const w0 = r._findNearestWaterPoint(P.x, P.z, 200);
        const zentren = [ort, P].concat(w0 ? [w0] : []);
        let seed = 12345;
        const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
        let n = 0,
            falsch = 0,
            nass = 0;
        const beispiele = [];
        for (const c of zentren)
            for (let i = 0; i < 400; i++) {
                const a = rnd() * Math.PI * 2,
                    d = Math.sqrt(rnd()) * 220;
                const x = c.x + Math.cos(a) * d,
                    z = c.z + Math.sin(a) * d;
                for (const mg of [0.2, 0.4, 1.5]) {
                    const soll = ref(x, z, mg);
                    n++;
                    if (!soll) nass++;
                    if (urteil.call(r, x, z, mg) !== soll) {
                        falsch++;
                        if (beispiele.length < 3) beispiele.push(`(${x.toFixed(1)}, ${z.toFixed(1)}, ${mg})`);
                    }
                }
            }
        // Der Spieler-Wille: ein Graben und eine Aufschüttung (voxelEdits) am Ufer — das Urteil liest dieselbe Dichte samt
        // Edits. Die Edits leben nur für diese Urteile (kein Remesh), danach ist die Liste wie vorher.
        const wm = st.worldMeta;
        const editsAlt = wm.voxelEdits;
        const ufer = w0 || P;
        const sy = scan.call(r, ufer.x + 6, ufer.z) ?? 0;
        wm.voxelEdits = (editsAlt || []).concat([
            { x: ufer.x + 6, y: sy, z: ufer.z, r: 7, strength: 48, mode: "carve" },
            { x: ufer.x - 6, y: sy + 1, z: ufer.z + 4, r: 6, strength: 48, mode: "fill" },
        ]);
        try {
            for (let i = 0; i < 300; i++) {
                const a = rnd() * Math.PI * 2,
                    d = Math.sqrt(rnd()) * 16;
                const x = ufer.x + Math.cos(a) * d,
                    z = ufer.z + Math.sin(a) * d;
                for (const mg of [0.2, 0.4, 1.5]) {
                    const soll = ref(x, z, mg);
                    n++;
                    if (!soll) nass++;
                    if (urteil.call(r, x, z, mg) !== soll) {
                        falsch++;
                        if (beispiele.length < 3) beispiele.push(`Edit (${x.toFixed(1)}, ${z.toFixed(1)}, ${mg})`);
                    }
                }
            }
        } finally {
            wm.voxelEdits = editsAlt;
        }
        m.exakt = { n, falsch, nass, beispiele, wasserGefunden: !!w0 };
        // (b) Spalten-Scans und Proben je Such-Pfad: die Suche selbst gerufen; Scan und Urteil sind Beobachtungs-Punkte
        //     (sie zählen und reichen durch). Trocken = kein Wasser im Kreis, der teuerste Fall.
        let scans = 0,
            proben = 0;
        const eigen = (k) => Object.prototype.hasOwnProperty.call(r, k);
        const hatte = { scan: eigen("_voxelSurfaceY"), urteil: eigen("_isAboveWaterAt") };
        r._voxelSurfaceY = function (...a) {
            scans++;
            return scan.apply(this, a);
        };
        r._isAboveWaterAt = function (...a) {
            proben++;
            return urteil.apply(this, a);
        };
        try {
            for (const [pfad, R] of [
                ["trinken", r.constructor.CREATURE_DRINK_SEARCH_RADIUS],
                ["chat", 80],
                ["ki", 200],
            ])
                for (const [wo, c] of [
                    ["trocken", ort],
                    ["plattform", P],
                ]) {
                    scans = proben = 0;
                    const w = r._findNearestWaterPoint(c.x, c.z, R);
                    m.zaehlung[`${pfad}@${wo}`] = { R, proben, scans, gefunden: !!w };
                }
            // Der teuerste Fall ganz: kein Wasser im 200-m-Kreis heißt, die Suche fragt ALLE Proben ihrer Ringe (4-m-Ringe,
            // Bogen ≤ 4 m), und jede ist trocken. Am trockenen Ort jede dieser Proben gefragt; gezählt die Spalten, die die
            // TROCKENEN zahlen (eine nasse beendet die Suche) — so viele zahlt die KI-Suche in einer Welt ohne Wasser.
            let trockenScans = 0,
                trockenProben = 0,
                nassProben = 0;
            for (let rr = 4; rr <= 200; rr += 4) {
                const D = Math.max(8, Math.ceil((2 * Math.PI * rr) / 4));
                for (let d = 0; d < D; d++) {
                    const s0 = scans;
                    const ja = r._isAboveWaterAt(ort.x + Math.cos((d / D) * Math.PI * 2) * rr, ort.z + Math.sin((d / D) * Math.PI * 2) * rr, 0.2);
                    if (ja) {
                        trockenProben++;
                        trockenScans += scans - s0;
                    } else nassProben++;
                }
            }
            const alle = trockenProben + nassProben;
            m.zaehlung["ki@trocken-voll"] = {
                R: 200,
                proben: trockenProben,
                scans: trockenScans,
                nass: nassProben,
                // hochgerechnet auf alle Proben der Ringe (eine Welt, in der jede trocken ist)
                hoch: trockenProben ? Math.round((trockenScans * alle) / trockenProben) : null,
                gefunden: false,
            };
        } finally {
            if (hatte.scan) r._voxelSurfaceY = scan;
            else delete r._voxelSurfaceY;
            if (hatte.urteil) r._isAboveWaterAt = urteil;
            else delete r._isAboveWaterAt;
        }
        m.gestartet = true;
    } catch (e) {
        out.suche = Object.assign(out.suche || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-D3: die Werkstatt-Vorschau ──
    try {
        const m = { gestartet: false };
        out.vorschau = m;
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 60000;
        while (performance.now() < dl && !(f && f.ready && f.recipes && f.recipes.eiche && st.blueprints.baum_eiche))
            await sleep(80);
        // Das Welt-Auge steht beim Spieler (der Loop spiegelt es je Frame) — dort, wo der neue Spieler die Werkstatt öffnet.
        await tick(20);
        if (st.uiActiveDrawer !== "werkstatt") r.toggleDrawer("werkstatt");
        const ws = r._ensureWorkshopState();
        const lu = r._ensureLodUniforms();
        // Der Beobachtungs-Punkt, im selben Takt wie das Öffnen (vor dem async init() des Vorschau-Renderers): der
        // Neben-Renderer bekommt den Masken-Stand, die GPU-Arbeit bleibt aus.
        const rec = [];
        if (!ws.preview) throw new Error("keine Vorschau nach dem Öffnen der Werkstatt");
        ws.preview.renderer.render = () => {
            rec.push({
                an: lu.uLodMaskOn.value,
                auge: lu.uLodAuge.value.clone(),
                perf: lu.uLodPerf.value,
                ref: lu.uLodRef.value,
                cfg: { d0: lu.uLodD0.value, d1: lu.uLodD1.value, fade: lu.uLodFade.value, fade0: lu.uLodFade0.value },
            });
        };
        r.selectBlueprintForEdit("baum_eiche");
        const dl2 = performance.now() + 90000;
        while (performance.now() < dl2) {
            const p = ws.preview;
            if (p && p.currentMesh && !r._wsStudioPending && p.currentMesh.children.length) break;
            await tick(1, 80);
        }
        const p = ws.preview;
        if (!p || !p.currentMesh) throw new Error("keine Vorschau-Gestalt");
        p.rendererReady = true;
        m.maskeWelt = lu.uLodMaskOn.value;
        r._workshopRender();
        m.maskeDanach = lu.uLodMaskOn.value;
        m.renders = rec.length;
        m.gestartet = true;
        const R = rec[rec.length - 1];
        if (R) {
            m.maskeImRender = R.an;
            const law = globalThis.__phytoCore.lodCrossfadeMask;
            const v = new THREE.Vector3();
            let n = 0,
                behalten = 0,
                dSum = 0;
            p.currentMesh.updateMatrixWorld(true);
            p.currentMesh.traverse((o) => {
                if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                const g = o.geometry;
                const pos = g.attributes.position;
                const aL = g.attributes.aLodLevel,
                    aH = g.attributes.aH0,
                    aHL = g.attributes.aH0L;
                const fol = !!(o.material && o.material.userData && /foliage|grass/.test(o.material.userData.foundryKind || ""));
                const schritt = Math.max(1, Math.floor(pos.count / 400));
                for (let j = 0; j < pos.count; j += schritt) {
                    v.fromBufferAttribute(pos, j).applyMatrix4(o.matrixWorld);
                    const stufe = aL ? aL.getX(j) : 0;
                    const cd = Math.hypot(R.auge.x - v.x, R.auge.z - v.z) * R.perf;
                    dSum += cd / R.perf;
                    const lk = Math.min(R.ref / Math.max(aH ? aH.getX(j) : 1, 1e-3), 1);
                    const lkL = Math.min(R.ref / Math.max(aHL ? aHL.getX(j) : 1, 1e-3), 1);
                    let k = 0;
                    for (let d = 0; d < 16; d++) {
                        const dh = (d + 0.5) / 16;
                        let keep = true;
                        if (R.an > 0.5 && stufe > 0.5) {
                            const L = law(cd * lk, dh, R.cfg, stufe > 1.5 ? 1 : 0, fol, cd * lkL);
                            keep = stufe > 2.5 ? L.f1o < dh : L.keep;
                        }
                        if (keep) k++;
                    }
                    behalten += k / 16;
                    n++;
                }
            });
            m.vertices = n;
            m.anteil = n ? behalten / n : 0;
            m.augeAbstand = n ? +(dSum / n).toFixed(1) : null;
        }
    } catch (e) {
        out.vorschau = Object.assign(out.vorschau || {}, { err: (e && e.stack) || String(e) });
    }
    return out;
}

(async () => {
    const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die V1-Pfad-Linse nennt jeden Täter des Befunds ===");
        const gesund = { gestartet: true, renders: 1, vertices: 1200, anteil: 1, maskeImRender: 0, maskeWelt: 1, maskeDanach: 1 };
        check("Selbst-Test V-D3: gesunde Vorschau == 0 Täter", vorschauVerdict(gesund).length === 0);
        for (const [name, bruch, soll] of [
            ["leere Vorschau (21 108 Dreiecke, 0 im Bild)", { anteil: 0, maskeImRender: 1, augeAbstand: 36 }, "vorschau 0.0 %"],
            ["Vorschau zeichnet nie", { renders: 0 }, "vorschau zeichnete nie"],
            ["Welt-Maske bleibt aus", { maskeDanach: 0 }, "welt-maske"],
        ]) {
            const v = vorschauVerdict(Object.assign({}, gesund, bruch));
            check(`Selbst-Test V-D3: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const gesundA = { gestartet: true, baeume: 9, kronen: 0, ringPortale: 10, ringMitteAbstand: 0, trocken: true };
        check("Selbst-Test V-D1: gesunde Ankunft == 0 Täter", ankunftVerdict(gesundA).length === 0);
        for (const [name, bruch, soll] of [
            ["Tanne 2,0 m vom Mittelpunkt (V-D1)", { kronen: 2, naechsterStamm: 1.97, naechsteArt: "baum_tanne" }, "2 Krone"],
            ["Ring um den Ursprung, 36 m daneben", { ringMitteAbstand: 36 }, "ring-mitte"],
            ["kein Ring über dem Frame-Budget", { ringPortale: 0 }, "kein Genesis-Ring"],
            ["Plattform im See", { trocken: false }, "plattform im wasser"],
            ["kein Wald gewachsen (vakuös)", { baeume: 0 }, "kein Wald"],
        ]) {
            const v = ankunftVerdict(Object.assign({}, gesundA, bruch));
            check(`Selbst-Test V-D1: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        // Die Einzelschnitte: je ein gesunder Zustand ohne Täter, je der Befund-Zustand mit Täter beim Namen.
        const gesundS = {
            gestartet: true,
            trockenOrt: { x: 0, z: 0 },
            amWasserOhneWasser: 0,
            amWasserZeile: "Kein Wasser in Reichweite — am Wasser wächst hier nichts.",
            birkenAbsender: 2,
            birkenZeile: "2× Birke aus dem Studio vor dir gewachsen",
            birkenLabel: "Birke",
            gesendet: true,
            ortKnoten: '["at",1,2,3]',
            birkenEmpfaenger: 2,
            empfaengerAbstandZumAbsender: 12,
            telemetrieImChat: false,
        };
        for (const [kurz, urteil, gesund, brueche] of [
            ["V-D5", rezeptVerdict, { gestartet: true, friedenGesperrt: true, schoepferFrei: true }, [["schöpfer gesperrt (V-D5)", { schoepferFrei: false, titel: "Es fehlt: 44× holz" }, "schöpfer"]]],
            ["V-k4", tasteVerdict, { gestartet: true, gedrueckt: true, nachBlur: false }, [["Klebetaste (V-k4)", { nachBlur: true }, "W bleibt"]]],
            [
                "V-D6",
                kiVerdict,
                { gestartet: true, fehler: "Keine Antwort von 127.0.0.1:9 — der lokale Dienst läuft nicht", host: "127.0.0.1:9" },
                [["CORS-Märchen (V-D6)", { fehler: "Cloud blockt Browser-Direct-Call (CORS). Optionen: …" }, "lokaler Endpunkt"]],
            ],
            [
                "V-k5 V-k6 V-D8",
                satzVerdict,
                gesundS,
                [
                    ["6 Eichen am Spieler (V-k5)", { amWasserOhneWasser: 6, amWasserZeile: "6× baum_eiche aus dem Studio am Wasser gewachsen" }, "6 Eichen"],
                    ["interne id im Chat (V-D8)", { birkenZeile: "2× baum_birke aus dem Studio vor dir gewachsen" }, "der Chat nennt"],
                    ["Ort reist relativ (V-k6)", { ortKnoten: '["at_player_forward",10]' }, "der Ort reist"],
                    ["Empfänger pflanzt bei sich (V-k6)", { empfaengerAbstandZumAbsender: 203 }, "der Empfänger pflanzt"],
                    ["Telemetrie im Chat (V-D8)", { telemetrieImChat: true }, "Dorf-Telemetrie"],
                ],
            ],
        ]) {
            check(`Selbst-Test ${kurz}: gesund == 0 Täter`, urteil(gesund).length === 0, urteil(gesund).join(" · "));
            for (const [name, bruch, soll] of brueche) {
                const v = urteil(Object.assign({}, gesund, bruch));
                check(`Selbst-Test ${kurz}: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
            }
        }
        const gruen = wand(quelle);
        check("Selbst-Test W: der Arbeitsbaum ist grün", gruen.every((w) => w[1]), gruen.filter((w) => !w[1]).map((w) => w[0]).join(" | "));
        const vorStand = quelle
            .replace("const renderResult = this._buehneRender(p.renderer, p.scene, p.camera);", "const renderResult = p.renderer.render(p.scene, p.camera);")
            .replace("if (an !== null) lu.uLodMaskOn.value = 0;", "")
            // der Orts-Vertrag beim Vorher (6b988a07): dslEvalPos gibt null weiter, spawn_studio bewacht sich selbst
            .replace("            throw fehler;\n", "            return null;\n")
            // der Rest der Klasse beim Vorher (c52089c7): jeder Nicht-Array-Knoten ist „nicht verlangt", der Feld-Akt nimmt
            // für jeden Nicht-Array-Knoten den Spieler
            .replace("if (node == null) return this._defaultSpawnPos();", "if (!Array.isArray(node) || node.length === 0) return this._defaultSpawnPos();")
            .replace(
                'return this.dslEvalPos(posNode == null ? ["at_player"] : posNode, ctx);',
                'return Array.isArray(posNode) && posNode.length > 0 ? this.dslEvalPos(posNode, ctx) : this.dslEvalPos(["at_player"], ctx);'
            )
            .replace(
                "const pos = this.dslEvalPos(positionNode, ctx); // kein Ort",
                "const pos = this.dslEvalPos(positionNode, ctx);\n                if (!pos) return; // kein Ort"
            )
            // die Zwillings-Suche beim Vorher: der Rückkehr-Anker sucht die Plattform selbst
            .replace(
                "const anchor = this._genesisPlattform();",
                'const anchor = (this.state.architectures || []).find((a) => a && a.type === "start_plattform");'
            );
        const rot = wand(vorStand);
        check(
            "Selbst-Test W: der Vor-Stand (Vorschau direkt, Bühne maskiert, null-Ort, Op-Wache, Plattform-Zwilling, Ersatz-Ort) → W1–W6 feuern",
            rot.filter((w) => !w[1]).length === 6,
            rot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" ")
        );
        // Die V-k5-Klasse: gesund ohne Täter, je Befund-Zustand der Täter beim Namen.
        const opGesund = (op) => ({ ok: false, grund: "kein Wasser im Umkreis von 60 m", effekt: op, fehler: null, kalt: false, akte: [] });
        const gesundO = {
            gestartet: true,
            radius: 60,
            ops: Object.fromEntries(ORT_OPS.map((op) => [op, opGesund(op)])),
            chain: { ok: false, grund: "kein Wasser im Umkreis von 60 m", effekt: "spawn_tree", fehler: null, akte: [{ nm: "_depositLife", abstand: 0 }] },
            buchWarm: true,
            dorfAuftraege: 0,
            dorfOhneOrt: null,
        };
        check("Selbst-Test V-k5-Klasse: gesund == 0 Täter", ortVerdict(gesundO).length === 0, ortVerdict(gesundO).join(" · "));
        const mitOp = (op, e) => Object.assign({}, gesundO, { ops: Object.assign({}, gesundO.ops, { [op]: Object.assign(opGesund(op), e) }) });
        for (const [name, bruch, soll] of [
            ["TypeError (6b988a07)", mitOp("spawn_creature", { fehler: "op_exception: Cannot read properties of null (reading 'x')", grund: null, effekt: null }), "spawn_creature: wirft"],
            ["Dorf am Spieler-Ort über die Op (6b988a07)", mitOp("spawn_village", { akte: [{ nm: "spawnSettlement", abstand: null }] }), "spawn_village: wirkt ohne Ort"],
            ["still am Spieler-Ort (cf9a07ba)", mitOp("spawn_studio", { ok: true, grund: null, effekt: null, akte: [{ nm: "spawnArchitecture", abstand: 4.1 }] }), "spawn_studio: wirkt ohne Ort"],
            ["Absage ohne Grund", mitOp("deposit_life", { grund: null }), "deposit_life: scheitert nicht benannt"],
            ["chain meldet Erfolg", Object.assign({}, gesundO, { chain: Object.assign({}, gesundO.chain, { ok: true }) }), "chain: meldet Erfolg"],
            ["chain bricht ganz ab", Object.assign({}, gesundO, { chain: Object.assign({}, gesundO.chain, { akte: [] }) }), "chain: bricht ganz ab"],
            ["spawnSettlement ohne Ort gründet beim Spieler", Object.assign({}, gesundO, { dorfAuftraege: 1 }), "dorf ohne Ort gründet"],
        ]) {
            const v = ortVerdict(bruch);
            check(`Selbst-Test V-k5-Klasse: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        // Der Rest der V-k5-Klasse: gesund ohne Täter, je Befund-Zustand (c52089c7) der Täter beim Namen.
        const kGesund = (name) => {
            const [, , soll, effekt] = KNOTEN.find((e) => e[0] === name);
            return { ok: false, grund: soll.replace(/^\^/, ""), effekt, fehler: null, akte: [] };
        };
        const gesundK = {
            gestartet: true,
            laeufe: Object.fromEntries(KNOTEN.map(([name]) => [name, kGesund(name)])),
            defaults: { near_water: "kein Wasser im Umkreis von 60 m", at_player_forward: 5, at_field_need: 50 },
            messOrtOhneSpieler: null,
            gesund: { ok: true, akte: 1, grund: null },
        };
        check("Selbst-Test V-k5-Klasse (Rest): gesund == 0 Täter", knotenVerdict(gesundK).length === 0, knotenVerdict(gesundK).join(" · "));
        const mitK = (name, e) => Object.assign({}, gesundK, { laeufe: Object.assign({}, gesundK.laeufe, { [name]: Object.assign(kGesund(name), e) }) });
        const still = (nm, abstand) => ({ ok: true, grund: null, effekt: null, akte: [{ nm, abstand }] });
        const mitD = (d) => Object.assign({}, gesundK, { defaults: Object.assign({}, gesundK.defaults, d) });
        for (const [name, bruch, soll] of [
            ["der Text wird der Ursprung", mitK(KNOTEN[0][0], still("spawnArchitecture", 412.6)), `${KNOTEN[0][0]}: wirkt ohne Ort`],
            ["at(null) wird die 0 (Lehre 17)", mitK("at mit null (Number(null) === 0)", still("spawnCreatureAt", 300.2)), "at mit null (Number(null) === 0): wirkt ohne Ort"],
            ["das Dorf ohne Abstände beim Spieler", mitK("far_player ohne Abstände (das Dorf)", still("spawnSettlement", 9.6)), "far_player ohne Abstände (das Dorf): wirkt ohne Ort"],
            ["voxel_carve gräbt bei 0", mitK("voxel_carve mit null-Koordinaten", still("carveVoxelSphere", 300.2)), "voxel_carve mit null-Koordinaten: wirkt ohne Ort"],
            ["ohne Spieler am Ursprung", mitK("at_player ohne Spieler", still("spawnArchitecture", 300.2)), "at_player ohne Spieler: wirkt ohne Ort"],
            ["die nächste Kreatur am Ursprung", mitK("die nächste Kreatur ohne Spieler", still("assignTaskToNearestCreature", 300.2)), "die nächste Kreatur ohne Spieler: wirkt ohne Ort"],
            ["Absage ohne die Op", mitK("leerer Knoten", { effekt: null }), "leerer Knoten: scheitert nicht benannt"],
            ["near_water ohne Radius sucht 8 m", mitD({ near_water: "kein Wasser im Umkreis von 8 m" }), "near_water ohne Radius"],
            ["vorn ohne Abstand 1 m", mitD({ at_player_forward: 1 }), "at_player_forward ohne Zahl"],
            ["Bedarf ohne Radius 10 m", mitD({ at_field_need: 10 }), "at_field_need ohne Zahl"],
            ["der Mess-Ort ohne Spieler ist der Ursprung", Object.assign({}, gesundK, { messOrtOhneSpieler: { x: 0, z: 0 } }), "der Mess-Ort"],
            ["ein gültiger Knoten wirkt nicht (vakuös)", Object.assign({}, gesundK, { gesund: { ok: false, akte: 0, grund: "at: x fehlt" } }), "ein gültiger at-Knoten"],
        ]) {
            const v = knotenVerdict(bruch);
            check(`Selbst-Test V-k5-Klasse (Rest): ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        // R2: gesund (Urteil exakt, trocken wenige Scans), je Befund-Zustand der Täter beim Namen.
        const gesundW = {
            gestartet: true,
            exakt: { n: 3600, falsch: 0, nass: 400, beispiele: [] },
            zaehlung: {
                "trinken@trocken": { R: 40, proben: 351, scans: 0 },
                "chat@trocken": { R: 80, proben: 1330, scans: 12 },
                "ki@trocken": { R: 200, proben: 1954, scans: 90 },
                "ki@trocken-voll": { R: 200, proben: 8037, scans: 300 },
            },
        };
        check("Selbst-Test R2: gesund == 0 Täter", sucheVerdict(gesundW).length === 0, sucheVerdict(gesundW).join(" · "));
        const mitZ = (k, z) => Object.assign({}, gesundW, { zaehlung: Object.assign({}, gesundW.zaehlung, { [k]: z }) });
        for (const [name, bruch, soll] of [
            ["Spalten-Scan je Probe (6b988a07)", mitZ("ki@trocken", { R: 200, proben: 1954, scans: 1954 }), "ki 200 m: 1954 Spalten-Scans"],
            ["ohne Wasser alle 8037 Proben gescannt", mitZ("ki@trocken-voll", { R: 200, proben: 8037, scans: 8037 }), "ki@trocken-voll 200 m: 8037"],
            ["Trinken scannt je Probe", mitZ("trinken@trocken", { R: 40, proben: 351, scans: 351 }), "trinken 40 m"],
            ["der Fels-Beweis lügt", Object.assign({}, gesundW, { exakt: { n: 3600, falsch: 3, nass: 400, beispiele: ["(1, 2, 0.2)"] } }), "das Urteil weicht"],
            ["kein nasser Punkt (vakuös)", Object.assign({}, gesundW, { exakt: { n: 3600, falsch: 0, nass: 0 } }), "kein nasser Punkt"],
        ]) {
            const v = sucheVerdict(bruch);
            check(`Selbst-Test R2: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die V1-Pfad-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of wand(quelle)) check(name, ok, detail);

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Der KI-Endpunkt der V-D6-Probe: ein Port, auf dem nichts lauscht (der Linsen-Server liegt auf PORT).
    const out = await page.evaluate(probe, { kiPort: PORT + 3, knoten: KNOTEN.map(([name, prog, , , ohne]) => [name, prog, !!ohne]) });
    await browser.close();
    server.close();

    console.log("=== V-D1 (Q15) — DIE ANKUNFT AUF DER LICHTUNG ===");
    const am = out.ankunft || {};
    if (am.err) check("V-D1 Probe ohne Ausnahme", false, am.err.split("\n")[0]);
    const vA = ankunftVerdict(am);
    check(
        "V-D1 die Plattform steht auf einer Lichtung (keine Krone über der Scheibe), der Genesis-Ring um sie",
        vA.length === 0,
        `Plattform ${JSON.stringify(am.plattform)} · ${am.baeume} Bäume im 40-m-Kreis · nächster Stamm ${am.naechsterStamm} m (${am.naechsteArt}) · Kronen über der Scheibe ${am.kronen} · Ring ${am.ringPortale} Portale, Mitte ${am.ringMitteAbstand} m${vA.length ? " — Täter: " + vA.join(", ") : ""}`
    );
    console.log("=== V-D5 · V-k4 · V-D6 · V-k5 · V-k6 · V-D8 (Q15) — DIE EINZELSCHNITTE DES V1-PFADS ===");
    for (const [kurz, name, m, urteil, zeile] of [
        [
            "V-D5",
            "das Rezeptbuch urteilt nach dem Spielmodus (schöpfer gibt den Knopf frei)",
            out.rezept,
            rezeptVerdict,
            (m) => `frieden gesperrt ${m.friedenGesperrt} · schöpfer frei ${m.schoepferFrei}`,
        ],
        [
            "V-k4",
            "der Fensterwechsel löst die gehaltene Taste",
            out.taste,
            tasteVerdict,
            (m) => `W gedrückt ${m.gedrueckt} · nach blur ${m.nachBlur}`,
        ],
        [
            "V-D6",
            "der KI-Fehler nennt die Ursache (lokaler Dienst läuft nicht, nicht CORS)",
            out.ki,
            kiVerdict,
            (m) => `„${(m.fehler || "").slice(0, 90)}"`,
        ],
        [
            "V-k5 V-k6 V-D8",
            "der Satz trifft die Welt: kein Wasser → laute Absage · der Ort reist aufgelöst · das Label im Chat · keine Telemetrie",
            out.satz,
            satzVerdict,
            (m) =>
                `ohne Wasser ${m.amWasserOhneWasser} Eichen („${m.amWasserZeile}") · Absender ${m.birkenAbsender} Birken („${m.birkenZeile}") · Ort ${m.ortKnoten} · Empfänger ${m.birkenEmpfaenger} Birken ${m.empfaengerAbstandZumAbsender} m vom Absender · Telemetrie ${m.telemetrieImChat}`,
        ],
    ]) {
        const mm = m || {};
        if (mm.err) check(`${kurz} Probe ohne Ausnahme`, false, mm.err.split("\n")[0]);
        const v = urteil(mm);
        check(`${kurz} ${name}`, v.length === 0, `${mm.gestartet ? zeile(mm) : "nicht gestartet"}${v.length ? " — Täter: " + v.join(", ") : ""}`);
    }
    console.log("=== V-k5-KLASSE (Q15) — DER VERLANGTE ORT, DEN ES NICHT GIBT ===");
    const om = out.ort || {};
    if (om.err) check("V-k5-Klasse Probe ohne Ausnahme", false, om.err.split("\n")[0]);
    const vO = ortVerdict(om);
    const opZeile = (op) => {
        const e = (om.ops || {})[op] || {};
        return `${op} ${e.fehler ? "wirft" : e.akte && e.akte.length ? `${e.akte.length} Akt(e)` : e.grund ? "benannt" : "still"}`;
    };
    check(
        `V-k5-Klasse jede Op mit near_water ${om.radius || "?"} m in trockener Welt scheitert benannt (0 Würfe, 0 Welt-Akte, die chain meldet ehrlich, kein Dorf beim Spieler)`,
        vO.length === 0,
        `${om.gestartet ? ORT_OPS.map(opZeile).join(" · ") + ` · chain ${om.chain && om.chain.ok ? "Erfolg" : "abgesagt"} · Dorf-Aufträge ${om.dorfAuftraege}` : "nicht gestartet"}${vO.length ? " — Täter: " + vO.join(", ") : ""}`
    );
    console.log("=== V-k5-KLASSE, DER REST — JEDER UNGÜLTIGE ORT SCHEITERT BENANNT ===");
    const km = out.knoten || {};
    if (km.err) check("V-k5-Klasse (Rest) Probe ohne Ausnahme", false, km.err.split("\n")[0]);
    const vK = knotenVerdict(km);
    const kl = km.laeufe || {};
    const benannt = KNOTEN.filter(([name, , soll, effekt]) => knotenEintragOk(kl[name], soll, effekt)).length;
    const kAkte = KNOTEN.reduce((n, [name]) => n + ((kl[name] && kl[name].akte) || []).length, 0);
    const kd = km.defaults || {};
    check(
        `V-k5-Klasse (Rest) jeder ungültige Ort scheitert benannt (${KNOTEN.length} Programme: kein Knoten · at ohne Zahl · Text statt Zahl · kein Spieler · Voxel), die Defaults der Auflöser gelten`,
        vK.length === 0,
        `${km.gestartet ? `${benannt}/${KNOTEN.length} benannt · ${kAkte} Welt-Akte ohne Ort · near_water ohne Radius „${kd.near_water}“ · vorn ohne Abstand ${kd.at_player_forward} m · Bedarf ohne Radius ${kd.at_field_need} m · Mess-Ort ohne Spieler ${JSON.stringify(km.messOrtOhneSpieler)}` : "nicht gestartet"}${vK.length ? " — Täter: " + vK.join(", ") : ""}`
    );
    console.log("=== R2 — DIE WASSER-SUCHE SCANNT NUR, WO WASSER SEIN KANN ===");
    const sm = out.suche || {};
    if (sm.err) check("R2 Probe ohne Ausnahme", false, sm.err.split("\n")[0]);
    const vS = sucheVerdict(sm);
    const zz = sm.zaehlung || {};
    const zZeile = (k) =>
        zz[k]
            ? `${k} ${zz[k].R} m: ${zz[k].proben} ${zz[k].nass != null ? "trockene " : ""}Proben/${zz[k].scans} Scans${zz[k].gefunden ? " (Wasser)" : ""}${zz[k].nass != null ? ` (${zz[k].nass} nasse ohne Zählung; ganz trocken hochgerechnet ${zz[k].hoch})` : ""}`
            : `${k} —`;
    check(
        "R2 das Wasser-Urteil ist bit-gleich zum vollen Scan, die Suche scannt trocken höchstens wie die 8-Strahlen-Suche",
        vS.length === 0,
        `${sm.exakt ? `${sm.exakt.falsch} von ${sm.exakt.n} Urteilen abweichend (${sm.exakt.nass} nass)` : "—"} · ${["trinken", "chat", "ki"]
            .flatMap((p) => [zZeile(`${p}@trocken`), zZeile(`${p}@plattform`)])
            .concat([zZeile("ki@trocken-voll")])
            .join(" · ")}${vS.length ? " — Täter: " + vS.join(", ") : ""}`
    );
    console.log("=== V-D3 (Q14) — DIE WERKSTATT-VORSCHAU ZEIGT IHR WERK ===");
    const vm = out.vorschau || {};
    if (vm.err) check("V-D3 Probe ohne Ausnahme", false, vm.err.split("\n")[0]);
    const vV = vorschauVerdict(vm);
    check(
        "V-D3 die Eiche der Werkstatt-Vorschau steht im Bild (Masken-Gesetz über die Vorschau-Vertices ≥ 99 %)",
        vV.length === 0,
        `${vm.vertices || 0} Proben · ${(100 * (vm.anteil || 0)).toFixed(1)} % behalten · Maske im Render ${vm.maskeImRender} · Welt-Auge ${vm.augeAbstand} m${vV.length ? " — Täter: " + vV.join(", ") : ""}`
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der v1-Pfad trägt seine benannten Schnitte.");
    process.exit(0);
})().catch((e) => {
    console.error("V1-Pfad-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
