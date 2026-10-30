// diag-v1-pfad.cjs — DIE V1-PFAD-LINSE (Familie auge-v1): die Defekte des gespielten v1.0-Pfads beim NAMEN; jede Probe ruft
// den Chokepoint selbst im echten Boot (headless, foundry-ON, Null-Renderer) und misst seine Wirkung.
//   V-D3 — die Vorschau zeigt ihr Werk (Masken-Gesetz über die Vertices der Vorschau, Soll ≥ 0,99; Wand: jeder
//     Neben-Renderer zeichnet über `_buehneRender`) · FREMDER ZUG: jeder Wartende erwacht nach der Ankunft eines fremd
//     gezogenen Körpers (Soll ≤ 20 s; Wand W7: der Foundry-Pfad pollt nicht) · RAHMEN: jede Gestalt füllt die Vorschau
//     (Box3 je Bildkante, Soll [0,5; 0,9]).
//   V-D1 — die Ankunft auf der Lichtung: keine Krone der gepflanzten Bäume über der Plattform, der Genesis-Ring steht über
//     dem Frame-Budget um die Plattform (Soll Ring-Mitte ≤ 1 m).
//   Einzelschnitte: V-k4 (blur lässt W los) · V-D6 (der Fehler nennt den Host) · V-k5 und ihre KLASSE (jeder ungültige Ort
//     scheitert benannt an `dslEvalPos`, keine Op ändert die Welt) · V-k6 (P2P trägt den Ort aufgelöst) · V-D8 (das Label im
//     Chat) · R2 (die Wasser-Suche: 0 Abweichungen gegen den Spalten-Scan, Soll trocken ≤ 8 Scans je 4-m-Ring).
//   WORT — der Korpus (spec/abnahme/ki-korpus.json) über den echten Chat-Pfad `maybeAnswerWithLlm` → `llmCall` → `dslRun`;
//     --echt fragt den Anbieter, --aufnahme schreibt den Mitschnitt (Ratsche, sinkt nie), die CI spielt ihn ab; --regler
//     fährt den Korpus-Teil Regler-Wörter (KI K2, das Soll am Stempel der Werke, eigene Ratsche ratsche-ki-korpus-regler.json),
//     --seele das Gespräch mit Wesen über ihre Erinnerungen (KI K3), --regeln den Selbstlauf der Regeln des Modells (KI K4).
//   FEIND — der feindliche Korpus (spec/abnahme/ki-feind-korpus.json) kommt durch die Eingänge der Fremde zu einem
//     gehorsamen Modell: 0 erreicht · 0 ausgeführt · die Signatur schlägt an · der Spieler liest den Namen.
//   node scripts/diag-v1-pfad.cjs [--selftest | --korpus [--regler | --seele | --regeln] [--echt [--bild] [--aufnahme]] | --feind]
//   Port: V1_PFAD_PORT (4421) · Mutanten: V1_MUTANTE=gedaechtnis-leer (--seele) · wertung-aus (--regeln)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, warteAufWelt, ROOT: root, hauptLauf, nullSeite, pruefer, wandEnde, selbsttestEnde } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const stammLib = require("./lib/stamm.cjs");

const PORT = Number(process.env.V1_PFAD_PORT || 4421);

const { errs, check } = pruefer();

const ohneKommentare = stammLib.ohneKommentare;

// ── DIE VERDIKTE (pure Funktionen; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
const SOLL = { vorschauAnteil: 0.99, rahmenMin: 0.5, rahmenMax: 0.9, karteMin: 0.5, karteMax: 1.5 };
// W7: die Wartenden auf eine Foundry-Antwort beim Namen (fehlt einer, ist die Zählung blind).
const WARTENDE = [
    "_foundryZug",
    "_foundryWecker",
    "_heldFoundryGroup",
    "_workshopStudioPreviewFrom",
    "_workshopFoundryPreviewGroup",
];
function zugVerdict(m) {
    if (!m || m.gestartet !== true) return ["zug start"];
    const out = [];
    for (const [wer, z] of [
        ["vorschau", m.vorschau],
        ["hand", m.hand],
    ]) {
        if (!z) out.push(`zug ${wer}: keine Probe (vakuös)`);
        else if (!z.fremd) out.push(`zug ${wer}: kein fremder Zug im Flug (vakuös)`);
        // erwacht er nach dem Ereignis, nie an einer Uhr; null ist nie 0
        else if (!Number.isFinite(z.ms))
            out.push(
                z.imCache
                    ? `zug ${wer} schläft: ${z.key} liegt im Cache, ${wer === "hand" ? "die Hand" : "die Vorschau"} wartet weiter`
                    : `zug ${wer}: ${z.key} nach dem Zug nicht angekommen (der fremde Zug im Rang der Ferne)`
            );
    }
    // V-D3 STUFEN: jede Stufe der Vorschau (L0 · L1 · L2-Karte) erwacht, wenn ihr Stoff ankommt, nie an einer Uhr.
    const st = m.stufen || [];
    if (st.length !== 3) out.push(`zug stufen: ${st.length} von 3 Stufen gemessen (vakuös)`);
    for (const s of st)
        if (!Number.isFinite(s.ms))
            out.push(
                s.da
                    ? `zug stufe L${s.lod} schläft: ${s.wart} ist da, die Vorschau wartet weiter`
                    : `zug stufe L${s.lod}: ${s.wart} nicht da, die Foundry hat nichts mehr offen`
            );
        // die Box der Karte misst die Höhe ihrer Höhen-Stufe, nie den Stamm des Einheits-Quads
        else if (s.lod === 2 && !(s.hoch / s.soll >= SOLL.karteMin && s.hoch / s.soll <= SOLL.karteMax))
            out.push(
                `zug stufe L2 rahmen: die Box der Karte misst ${s.hoch} m, ihre Höhen-Stufe ${s.soll} m — Täter die Box der Karten-Instanz (Einheits-Quad)`
            );
    // V-D3 VORRAT: der Vorrat zieht über den EINEN Zug je Körper-Schlüssel, ein Leser im Flug hängt sich an.
    const vr = m.vorrat;
    if (!vr) out.push("zug vorrat: keine Probe (vakuös)");
    else if (!vr.imFlug)
        out.push(
            `zug vorrat: ${vr.key} nicht im Flug des Vorrats (vakuös: ${vr.auftraege} Aufträge, Cache ${vr.imCache}, Phase ${vr.phase})`
        );
    else if (vr.auftraege !== 1)
        out.push(
            `zug vorrat: ${vr.key} ${vr.auftraege}× bestellt — Täter _foundryPrefetchLibrary bestellt an _foundryZug vorbei`
        );
    return out;
}
function rahmenVerdict(m) {
    if (!m || m.gestartet !== true) return ["rahmen start"];
    const out = [];
    const e = m.eintraege || [];
    const waffen = e.filter((q) => q.kind === "weapon" && Number.isFinite(q.fuell)).length;
    if (!(m.waffenImBuch > 0) || waffen !== m.waffenImBuch)
        out.push(`rahmen waffen ${waffen} von ${m.waffenImBuch} gemessen`);
    const frist = e.filter((q) => q.frist).map((q) => q.id);
    if (frist.length) out.push(`rahmen ${frist.length} ohne Gestalt nach Frist (${frist.slice(0, 4).join(", ")})`);
    const aus = e
        .filter((q) => Number.isFinite(q.fuell) && !(q.fuell >= SOLL.rahmenMin && q.fuell <= SOLL.rahmenMax))
        .sort((a, b) => a.fuell - b.fuell);
    if (aus.length)
        out.push(
            `rahmen ${aus.length} außerhalb [${SOLL.rahmenMin}; ${SOLL.rahmenMax}]: ${aus
                .slice(0, 5)
                .map((q) => `${q.id} ${q.fuell} (${q.kante} m, Abstand ${q.dist} m)`)
                .join(", ")} — Täter _workshopCenterPreviewOn`
        );
    return out;
}
function vorschauVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!(m.renders > 0)) out.push("vorschau zeichnete nie");
    if (!(m.vertices > 0)) out.push("vorschau ohne Werk");
    if (!(m.anteil >= SOLL.vorschauAnteil))
        out.push(
            `vorschau ${(100 * (m.anteil || 0)).toFixed(1)} % im Bild (Maske ${m.maskeImRender}, Auge ${m.augeAbstand} m)`
        );
    if (m.maskeDanach !== m.maskeWelt)
        out.push(`welt-maske nach dem Vorschau-Render ${m.maskeDanach} statt ${m.maskeWelt}`);
    return out;
}

function ankunftVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!(m.baeume > 0)) out.push("kein Wald um die Plattform gewachsen");
    if (m.kronen > 0)
        out.push(`${m.kronen} Krone(n) über der Scheibe (nächster Stamm ${m.naechsterStamm} m, ${m.naechsteArt})`);
    if (!(m.ringPortale > 0)) out.push("kein Genesis-Ring (über dem Frame-Budget)");
    else if (!(m.ringMitteAbstand <= 1)) out.push(`ring-mitte ${m.ringMitteAbstand} m neben der Plattform`);
    if (m.trocken !== true) out.push("plattform im wasser");
    if (m.plattformen !== 1) out.push(`${m.plattformen} Plattformen nach dem zweiten Leger`);
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

// Die V-k5-KLASSE: jede Op mit einem Ort, den es nicht gibt, scheitert benannt, wirft nie, ändert die Welt nirgends.
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
            out.push(
                `${op}: wirkt ohne Ort (${e.akte.map((a) => `${a.nm} ${a.abstand == null ? "ohne Ort" : a.abstand + " m vom Spieler"}`).join(", ")})`
            );
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
        if (!(c.akte || []).some((a) => a.nm === "_depositLife"))
            out.push("chain: bricht ganz ab (der Feld-Akt beim Spieler fehlt)");
    }
    if (!m.buchWarm) out.push("dorf: Buch kalt (Vorbedingung)");
    if (m.dorfAuftraege > 0) out.push(`dorf ohne Ort gründet beim Spieler (${m.dorfAuftraege} Worker-Auftrag)`);
    if (m.dorfOhneOrt != null) out.push("dorf ohne Ort liefert ein Dorf");
    return out;
}

// Der REST der V-k5-KLASSE: jeder ungültige Ort scheitert benannt an `dslEvalPos` — [Name, Programm, Grund, Op, ohne Spieler].
const KNOTEN = [
    [
        "Text statt Knoten (die KI ohne Klammern)",
        ["spawn_studio", "eiche", "near_water", 6],
        "^„near_water“ ist kein Ort-Knoten",
        "spawn_studio",
    ],
    ["leerer Knoten", ["spawn_tree", [], 1, "eiche", 5], "^leerer Ort-Knoten", "spawn_tree"],
    ["Zahl statt Knoten", ["spawn_creature", 42, 1, "happy"], "^„42“ ist kein Ort-Knoten", "spawn_creature"],
    ["Objekt statt Knoten", ["spawn_ufo", { x: 3, z: 4 }], "ist kein Ort-Knoten", "spawn_ufo"],
    [
        "Text statt Knoten im Feld-Akt",
        ["deposit_life", "near_water", 0.5],
        "^„near_water“ ist kein Ort-Knoten",
        "deposit_life",
    ],
    ["at ohne x und z", ["spawn_tree", ["at"], 1, "eiche", 5], "^at: x fehlt", "spawn_tree"],
    [
        "at mit Text",
        ["spawn_studio", "eiche", ["at", "abc", 0, "abc"], 1],
        "^at: x „abc“ ist keine Zahl",
        "spawn_studio",
    ],
    [
        "at mit null (Number(null) === 0)",
        ["spawn_creature", ["at", null, 3, 5], 1, "happy"],
        "^at: x fehlt",
        "spawn_creature",
    ],
    ["at ohne z", ["spawn_ufo", ["at", 12, 3]], "^at: z fehlt", "spawn_ufo"],
    ["at mit Text-Höhe", ["spawn_island", ["at", 5, "hoch", 5], 6, 7], "^at: y „hoch“ ist keine Zahl", "spawn_island"],
    [
        "near_water mit Text-Radius",
        ["spawn_tree", ["near_water", "abc"], 1, "eiche", 5],
        "^near_water: Radius „abc“ ist keine Zahl",
        "spawn_tree",
    ],
    [
        "near_player mit Text-Radius",
        ["spawn_creature", ["near_player", "weit"], 1, "happy"],
        "^near_player: Radius „weit“ ist keine Zahl",
        "spawn_creature",
    ],
    [
        "far_player ohne Abstände (das Dorf)",
        ["spawn_village", ["far_player"], 7],
        "^far_player: Mindest-Abstand fehlt",
        "spawn_village",
    ],
    [
        "far_player mit Text-Höchstabstand",
        ["spawn_temple", ["far_player", 180, "weit"], 7],
        "^far_player: Höchst-Abstand „weit“ ist keine Zahl",
        "spawn_temple",
    ],
    [
        "random_position mit Text-Spanne",
        ["spawn_ufo", ["random_position", "x"]],
        "^random_position: Spanne „x“ ist keine Zahl",
        "spawn_ufo",
    ],
    [
        "at_player_forward mit Text-Abstand",
        ["spawn_tree", ["at_player_forward", "abc"], 1, "eiche", 5],
        "^at_player_forward: Abstand „abc“ ist keine Zahl",
        "spawn_tree",
    ],
    [
        "at_field_need mit Text-Radius",
        ["deposit_life", ["at_field_need", "abc"], 0.5],
        "^at_field_need: Radius „abc“ ist keine Zahl",
        "deposit_life",
    ],
    ["voxel_carve mit null-Koordinaten", ["voxel_carve", null, 50, null, 3], "^at: x fehlt", "voxel_carve"],
    ["voxel_fill mit leerem x", ["voxel_fill", "", 10, 5, 2], "^at: x „“ ist keine Zahl", "voxel_fill"],
    [
        "at_player ohne Spieler",
        ["spawn_tree", ["at_player"], 1, "eiche", 5],
        "^at_player: kein Spieler in der Welt",
        "spawn_tree",
        true,
    ],
    [
        "near_player ohne Spieler",
        ["spawn_creature", ["near_player", 10], 1, "happy"],
        "^near_player: kein Spieler in der Welt",
        "spawn_creature",
        true,
    ],
    [
        "Feld-Akt ohne Knoten und ohne Spieler",
        ["deposit_life"],
        "^at_player: kein Spieler in der Welt",
        "deposit_life",
        true,
    ],
    [
        "die nächste Kreatur ohne Spieler",
        ["creature_task_nearest", "wander"],
        "^at_player: kein Spieler in der Welt",
        "creature_task_nearest",
        true,
    ],
];
const KNOTEN_DEFAULT = { near_water: 60, at_player_forward: 5, at_field_need: 50 };
function knotenEintragOk(e, soll, effekt) {
    return (
        !!e &&
        !e.fehler &&
        !(e.akte && e.akte.length) &&
        !e.ok &&
        new RegExp(soll).test(e.grund || "") &&
        e.effekt === effekt
    );
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
            out.push(
                `${name}: wirkt ohne Ort (${e.akte.map((a) => `${a.nm} ${a.abstand == null ? "ohne Ort" : a.abstand + " m vom Spieler"}`).join(", ")})`
            );
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
    if (m.messOrtOhneSpieler != null)
        out.push(`der Mess-Ort einer Regel ohne Spieler ist ${JSON.stringify(m.messOrtOhneSpieler)}`);
    if (m.ohneKnoten !== true) out.push(`ohne Knoten kein Default-Ort: ${m.ohneKnoten}`);
    const g = m.gesund || {};
    if (!(g.ok === true && g.akte === 1 && !g.grund))
        out.push(`ein gültiger at-Knoten wirkt nicht (Vorbedingung: ${JSON.stringify(g)})`);
    return out;
}

// R2 — DIE WASSER-SUCHE: `_landAt` ist bit-gleich zum Spalten-Scan, trocken ≤ 8 Scans je 4-m-Ring.
const ALT8 = (R) => 8 * Math.floor(R / 4);
function sucheVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    const ex = m.exakt || {};
    if (!(ex.n >= 1000)) out.push(`zu wenig Urteile (${ex.n}, Vorbedingung)`);
    if (!(ex.nass > 0)) out.push("kein nasser Punkt in der Stichprobe (Vorbedingung)");
    if (ex.falsch > 0)
        out.push(`das Urteil weicht vom vollen Scan ab: ${ex.falsch} von ${ex.n} (${(ex.beispiele || []).join(" ")})`);
    for (const pfad of ["trinken", "chat", "ki", "ki@trocken-voll"]) {
        const z = (m.zaehlung || {})[pfad.includes("@") ? pfad : `${pfad}@trocken`];
        if (!z) {
            out.push(`${pfad}: nicht gezählt`);
            continue;
        }
        const s = z.hoch != null ? z.hoch : z.scans;
        if (!(s <= ALT8(z.R)))
            out.push(
                `${pfad} ${z.R} m: ${s} Spalten-Scans bei ${z.proben} Proben${z.hoch != null ? " (hochgerechnet)" : ""} (Soll ≤ ${ALT8(z.R)})`
            );
    }
    return out;
}

// ── DIE STATISCHE WAND (Node, am AST). Liefert [name, ok, detail]. ──
const FN_ART = /^(?:FunctionExpression|ArrowFunctionExpression|FunctionDeclaration)$/;
const SCHLEIFE_ART = /^(?:WhileStatement|DoWhileStatement|ForStatement|ForInStatement|ForOfStatement)$/;
const ZEITGEBER = /^(?:setTimeout|setInterval|requestAnimationFrame|requestIdleCallback)$/;
const RENDER = /^render(?:Async)?$/;
// der Name eines Zugriffs: `a.b`, `a["b"]`, a[`b`]
const eigenName = (m) =>
    !m.computed
        ? m.property.name
        : m.property.type === "Literal"
          ? String(m.property.value)
          : m.property.type === "TemplateLiteral" && !m.property.expressions.length
            ? m.property.quasis[0].value.cooked
            : null;
const gerufenName = (c) => (c.type === "Identifier" ? c.name : c.type === "MemberExpression" ? eigenName(c) : null);
const umfasst = (a, i) => a.start <= i && i < a.end;
const nurName = (n, p) =>
    p &&
    ((p.type === "MemberExpression" && p.property === n && !p.computed) ||
        (p.type === "Property" && p.key === n && !p.computed) ||
        ((p.type === "MethodDefinition" || p.type === "PropertyDefinition") && p.key === n) ||
        (p.type === "VariableDeclarator" && p.id === n) ||
        (p.type === "AssignmentExpression" && p.left === n) ||
        (FN_ART.test(p.type) && (p.id === n || p.params.includes(n))) ||
        (p.type === "AssignmentPattern" && p.left === n));

// W2 — DER RENDER-FLUSS: dem WERT `x.render`/`x.renderAsync` gefolgt (||, ?:, .bind, Bezeichner, Feld, Parameter, Rückgabe)
// bis zum Ruf (direkt, .call, .apply, Reflect.apply, Zeitgeber); Info-Felder und Test-Werte sind kein Ruf.
function renderFluss(src) {
    const baum = stammLib.ast(src);
    const gl = stammLib.glieder(src);
    const gliedVon = (i) => {
        const g = stammLib.gliedAn(gl, i);
        return g ? g.name : null;
    };
    const treffer = new Map(); // Start des Rufs → { glied, wie, i, text }
    const lokal = new Map(); // "glied|bezeichner" → [gebundene Argumente, Weg]
    const feld = new Map(); // feldname → [gebundene Argumente, Weg]
    const rueck = new Map(); // "glied" oder "glied|closure" → [gebundene Argumente, Weg] (die Rückgabe trägt die Funktion)
    let neu = false;
    const merke = (karte, k, gebunden, weg) => {
        if (!karte.has(k)) (karte.set(k, [gebunden, weg]), (neu = true));
    };
    const trifft = (ruf, wie) => {
        if (!treffer.has(ruf.start))
            treffer.set(ruf.start, {
                glied: gliedVon(ruf.start),
                wie,
                i: ruf.start,
                text: src.slice(ruf.start, Math.min(ruf.end, ruf.start + 90)).replace(/\s+/g, " "),
            });
    };
    const fliesse = (kette, n, gebunden, weg) => {
        const triff = (ruf, wie) => trifft(ruf, `${weg}${wie}`);
        let cur = n;
        for (let k = kette.length - 1; k >= 0; k--) {
            const p = kette[k];
            const t = p.type;
            if (
                t === "ChainExpression" ||
                t === "ParenthesizedExpression" ||
                t === "LogicalExpression" ||
                (t === "ConditionalExpression" && p.test !== cur) ||
                (t === "SequenceExpression" && p.expressions[p.expressions.length - 1] === cur)
            ) {
                cur = p;
                continue;
            }
            if (t === "MemberExpression" && p.object === cur) {
                const was = eigenName(p);
                const pp = kette[k - 1];
                if (!pp || pp.type !== "CallExpression" || pp.callee !== p) return; // ein Feld des Werts (info.render.calls)
                if (was === "bind") {
                    gebunden += Math.max(0, pp.arguments.length - 1);
                    weg += ".bind → ";
                    cur = pp;
                    k--;
                    continue;
                }
                if (was === "call" && gebunden + pp.arguments.length - 1 >= 2) triff(pp, ".call");
                if (was === "apply") triff(pp, ".apply");
                return;
            }
            if (t === "CallExpression" && p.callee === cur) {
                if (gebunden + p.arguments.length >= 2) triff(p, "Ruf");
                return;
            }
            if (t === "CallExpression") {
                const idx = p.arguments.indexOf(cur);
                const nm = gerufenName(p.callee);
                if (
                    idx === 0 &&
                    nm === "apply" &&
                    p.callee.type === "MemberExpression" &&
                    gerufenName(p.callee.object) === "Reflect"
                )
                    triff(p, "Reflect.apply");
                else if (idx === 0 && ZEITGEBER.test(nm || "") && gebunden + p.arguments.length - 2 >= 2) triff(p, nm);
                else if (idx >= 0 && p.callee.type === "MemberExpression") {
                    // ein Parameter eines Glieds trägt die Funktion weiter
                    const g = gl.find((x) => x.name === nm);
                    const fn = g && (g.knoten.value || null);
                    const par = fn && FN_ART.test(fn.type) ? fn.params[idx] : null;
                    const id = par && (par.type === "AssignmentPattern" ? par.left : par);
                    if (id && id.type === "Identifier")
                        merke(lokal, `${nm}|${id.name}`, gebunden, `${weg}Parameter ${nm}(${id.name}) → `);
                }
                return;
            }
            if (t === "VariableDeclarator" && p.init === cur) {
                if (p.id.type === "Identifier")
                    merke(lokal, `${gliedVon(p.start)}|${p.id.name}`, gebunden, `${weg}${p.id.name} → `);
                return;
            }
            if (t === "AssignmentExpression" && p.right === cur) {
                if (p.left.type === "Identifier")
                    merke(lokal, `${gliedVon(p.start)}|${p.left.name}`, gebunden, `${weg}${p.left.name} → `);
                else if (p.left.type === "MemberExpression" && eigenName(p.left))
                    merke(feld, eigenName(p.left), gebunden, `${weg}Feld .${eigenName(p.left)} → `);
                return;
            }
            if (t === "Property" && p.value === cur) {
                const nm =
                    !p.computed && p.key.type === "Identifier"
                        ? p.key.name
                        : p.key.type === "Literal"
                          ? String(p.key.value)
                          : null;
                if (nm) merke(feld, nm, gebunden, `${weg}Feld .${nm} → `);
                return;
            }
            if (t === "ReturnStatement" || (t === "ArrowFunctionExpression" && p.body === cur)) {
                // die Funktion, die zurückgibt: das Glied selbst oder eine benannte Closure
                let j = t === "ReturnStatement" ? k - 1 : k;
                while (j >= 0 && !FN_ART.test(kette[j].type)) j--;
                const f = kette[j];
                const fp = kette[j - 1];
                const glied = gliedVon(p.start);
                if (f && fp && (fp.type === "MethodDefinition" || fp.type === "PropertyDefinition"))
                    merke(rueck, glied, gebunden, `${weg}Rückgabe ${glied}() → `);
                else if (f && fp && fp.type === "VariableDeclarator" && fp.id.type === "Identifier")
                    merke(rueck, `${glied}|${fp.id.name}`, gebunden, `${weg}Rückgabe ${fp.id.name}() → `);
                else if (f && f.id) merke(rueck, `${glied}|${f.id.name}`, gebunden, `${weg}Rückgabe ${f.id.name}() → `);
                return;
            }
            return;
        }
    };
    for (let runde = 0; runde === 0 || neu; runde++) {
        neu = false;
        stammLib.wandere(baum, (n, ahnen) => {
            const p = ahnen[ahnen.length - 1];
            if (n.type === "MemberExpression") {
                const nm = eigenName(n);
                if (!nm || (p && p.type === "AssignmentExpression" && p.left === n)) return true;
                if (RENDER.test(nm)) fliesse(ahnen, n, 0, "");
                else if (feld.has(nm)) fliesse(ahnen, n, ...feld.get(nm));
            } else if (n.type === "Property" && p && p.type === "ObjectPattern") {
                const nm =
                    !n.computed && n.key.type === "Identifier"
                        ? n.key.name
                        : n.key.type === "Literal"
                          ? String(n.key.value)
                          : null;
                const v = n.value.type === "AssignmentPattern" ? n.value.left : n.value;
                if (nm && RENDER.test(nm) && v.type === "Identifier")
                    merke(lokal, `${gliedVon(n.start)}|${v.name}`, 0, `{ ${nm} } → ${v.name} → `);
            } else if (n.type === "Identifier" && lokal.size && !nurName(n, p)) {
                const k = `${gliedVon(n.start)}|${n.name}`;
                if (lokal.has(k)) fliesse(ahnen, n, ...lokal.get(k));
            } else if (n.type === "CallExpression" && rueck.size) {
                const c = n.callee;
                const k =
                    c.type === "Identifier"
                        ? `${gliedVon(n.start)}|${c.name}`
                        : c.type === "MemberExpression"
                          ? eigenName(c)
                          : null;
                if (k && rueck.has(k)) fliesse(ahnen, n, ...rueck.get(k));
            }
            return true;
        });
        if (runde > 12) throw new Error("renderFluss: kein Fixpunkt nach 12 Runden");
    }
    return [...treffer.values()];
}

// W7 — DER ZEIT-GRAPH: Knoten sind die Glieder der Klasse und ihre benannten Closures, eine Kante jede Nennung; ZEIT ist sie
// im Rückruf eines Zeitgebers, eines then auf Zeit oder hinter einem await auf Zeit. Ein POLL ist ein Kreis mit Zeit-Kante,
// eine Schleife mit Schlaf, ein setInterval oder ein Warten auf ein pollendes Glied. Frei ist nur die Frist-Kette am
// Ereignis (`_foundryUhren` → `_foundryAblauf`, je Auftrag eine Uhr; gate:takt T8).
const FRIST_KETTE = [
    ["_foundryUhren", "_foundryAblauf"],
    ["_foundryAblauf", "_foundryPumpe"],
    ["_foundryAblauf", "_foundryUhren"],
];
const FOUNDRY_FAMILIE =
    /^(?:_foundry\w*|_heldFoundryGroup|_workshop\w*Preview\w*|_impostor\w*|_karte\w*|_tickImpostorBake)$/;
function zeitGraph(src) {
    const gl = stammLib.glieder(src);
    const gliedNamen = new Set(gl.map((g) => g.name));
    const wurzel = (g) => g.knoten.value || g.knoten;
    const istSelbst = (a, o) => o.type === "ThisExpression" || (o.type === "Identifier" && a.selbst.has(o.name));
    const gliedZiel = (a, n) => {
        const nm = eigenName(n);
        return nm && gliedNamen.has(nm) && (istSelbst(a, n.object) || FOUNDRY_FAMILIE.test(nm)) ? nm : null;
    };
    // 1) je Glied die Glied-Bezüge → die Glieder, die die Familie erreicht
    const akte = new Map();
    for (const g of gl) {
        const a = { g, selbst: new Set(), zugriffe: [] };
        stammLib.wandere(wurzel(g), (n) => {
            if (
                n.type === "VariableDeclarator" &&
                n.id.type === "Identifier" &&
                n.init &&
                n.init.type === "ThisExpression"
            )
                a.selbst.add(n.id.name);
            else if (
                n.type === "AssignmentExpression" &&
                n.left.type === "Identifier" &&
                n.right.type === "ThisExpression"
            )
                a.selbst.add(n.left.name);
            else if (n.type === "MemberExpression") a.zugriffe.push(n);
            return true;
        });
        a.glieder = new Set(a.zugriffe.map((n) => gliedZiel(a, n)).filter(Boolean));
        a.zugriffe = null;
        if (!akte.has(g.name)) akte.set(g.name, []);
        akte.get(g.name).push(a);
    }
    const erreicht = new Set(gl.filter((g) => FOUNDRY_FAMILIE.test(g.name)).map((g) => g.name));
    const familie = new Set(erreicht);
    for (const offen = [...erreicht]; offen.length;)
        for (const a of akte.get(offen.pop()) || [])
            for (const y of a.glieder) if (!erreicht.has(y)) (erreicht.add(y), offen.push(y));
    const akten = [];
    for (const name of erreicht)
        for (const a of akte.get(name) || []) {
            Object.assign(a, { fns: [], closures: [], rufe: [], awaits: [], schleifen: [], bezuege: [] });
            stammLib.wandere(wurzel(a.g), (n, ahnen) => {
                const p = ahnen[ahnen.length - 1];
                if (FN_ART.test(n.type)) {
                    a.fns.push(n);
                    if (n.id && n.type !== "ArrowFunctionExpression")
                        a.closures.push({ name: n.id.name, fn: n, id: n.id });
                }
                if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init && FN_ART.test(n.init.type))
                    a.closures.push({ name: n.id.name, fn: n.init, id: n.id });
                if (n.type === "AssignmentExpression" && n.left.type === "Identifier" && FN_ART.test(n.right.type))
                    a.closures.push({ name: n.left.name, fn: n.right, id: n.left });
                if (n.type === "CallExpression") a.rufe.push({ n, p, nm: gerufenName(n.callee) });
                if (n.type === "AwaitExpression") a.awaits.push(n);
                if (SCHLEIFE_ART.test(n.type)) a.schleifen.push(n);
                if (n.type === "MemberExpression" || n.type === "Identifier") a.bezuege.push({ n, p });
                return true;
            });
            a.closureNamen = new Set(a.closures.map((c) => c.name));
            akten.push(a);
        }
    const ziel = (a, n, p) => {
        if (n.type === "MemberExpression") return gliedZiel(a, n);
        if (n.type !== "Identifier" || !a.closureNamen.has(n.name) || nurName(n, p)) return null;
        return `${a.g.name}/${n.name}`;
    };
    const knotenAn = (a, i) => {
        let k = null;
        for (const c of a.closures) if (umfasst(c.fn, i) && (!k || c.fn.start >= k.fn.start)) k = c;
        return k ? `${a.g.name}/${k.name}` : a.g.name;
    };
    const fnAn = (a, i) => {
        let f = null;
        for (const x of a.fns) if (umfasst(x, i) && (!f || x.start >= f.start)) f = x;
        return f;
    };
    // Schlaf (die Rückgabe löst ein Zeitgeber ein) und Zeitgeber-Glied (ein Parameter wird im Zeitgeber gerufen): Fixpunkt
    const schlaf = new Set();
    const geber = new Set();
    const rufZiel = (a, c) => ziel(a, c.callee, c);
    const zeitig = (a, e) => {
        let z = false;
        stammLib.wandere(e, (n) => {
            if (z) return false;
            if (
                n.type === "CallExpression" &&
                (ZEITGEBER.test(gerufenName(n.callee) || "") || schlaf.has(rufZiel(a, n) || ""))
            )
                z = true;
            return true;
        });
        return z;
    };
    const istZeitRuf = (a, r) => ZEITGEBER.test(r.nm || "") || geber.has(rufZiel(a, r.n) || "");
    const rueckrufe = (r) =>
        ZEITGEBER.test(r.nm || "")
            ? r.n.arguments.slice(0, 1)
            : r.n.arguments.filter(
                  (x) =>
                      FN_ART.test(x.type) ||
                      x.type === "ObjectExpression" ||
                      x.type === "Identifier" ||
                      x.type === "MemberExpression"
              );
    for (let neu = true; neu;) {
        neu = false;
        for (const a of akten)
            for (const k of [
                { name: a.g.name, fn: wurzel(a.g) },
                ...a.closures.map((c) => ({ name: `${a.g.name}/${c.name}`, fn: c.fn })),
            ]) {
                if (!FN_ART.test(k.fn.type)) continue;
                if (!schlaf.has(k.name)) {
                    let z = k.fn.type === "ArrowFunctionExpression" && k.fn.expression && zeitig(a, k.fn.body);
                    if (!z)
                        stammLib.wandere(k.fn.body, (n) => {
                            if (z || (n !== k.fn.body && FN_ART.test(n.type))) return false;
                            if (n.type === "ReturnStatement" && n.argument && zeitig(a, n.argument)) z = true;
                            return true;
                        });
                    if (z) (schlaf.add(k.name), (neu = true));
                }
                if (!geber.has(k.name)) {
                    const params = new Set(
                        k.fn.params
                            .map((x) => (x.type === "AssignmentPattern" ? x.left : x))
                            .filter((x) => x.type === "Identifier")
                            .map((x) => x.name)
                    );
                    const istParam = (x) => x && x.type === "Identifier" && params.has(x.name);
                    let z = false;
                    for (const r of a.rufe) {
                        if (z || !params.size || !umfasst(k.fn, r.n.start) || !istZeitRuf(a, r)) continue;
                        for (const arg of rueckrufe(r))
                            if (istParam(arg)) z = true;
                            else
                                stammLib.wandere(arg, (n) => {
                                    if (
                                        n.type === "CallExpression" &&
                                        (istParam(n.callee) ||
                                            (n.callee.type === "MemberExpression" && istParam(n.callee.object)))
                                    )
                                        z = true;
                                    return !z;
                                });
                    }
                    if (z) (geber.add(k.name), (neu = true));
                }
            }
    }
    // die Kanten
    const kanten = new Map(); // von → Map(zu → { zeit, i })
    const schleifen = [];
    const intervalle = [];
    for (const a of akten) {
        const bereiche = [];
        for (const r of a.rufe) {
            if (r.nm === "setInterval") intervalle.push({ knoten: knotenAn(a, r.n.start), i: r.n.start });
            if (istZeitRuf(a, r)) bereiche.push(...rueckrufe(r));
            else if (
                /^(?:then|catch|finally)$/.test(r.nm || "") &&
                r.n.callee.type === "MemberExpression" &&
                zeitig(a, r.n.callee.object)
            )
                bereiche.push(...r.n.arguments);
        }
        const zeitAwaits = a.awaits.filter((w) => zeitig(a, w.argument));
        const wartet = new Set(zeitAwaits.map((w) => fnAn(a, w.start)));
        for (const { n, p } of a.bezuege) {
            const zu = ziel(a, n, p);
            if (!zu) continue;
            const von = knotenAn(a, n.start);
            const zeit = bereiche.some((x) => umfasst(x, n.start)) || wartet.has(fnAn(a, n.start));
            if (!kanten.has(von)) kanten.set(von, new Map());
            const alt = kanten.get(von).get(zu);
            if (!alt || (zeit && !alt.zeit)) kanten.get(von).set(zu, { zeit, i: n.start });
        }
        // die innerste Schleife um ein zeitiges await derselben Funktion
        for (const w of zeitAwaits) {
            const f = fnAn(a, w.start);
            let s = null;
            for (const x of a.schleifen)
                if (umfasst(x, w.start) && fnAn(a, x.start) === f && (!s || x.start >= s.start)) s = x;
            if (s && !schleifen.some((y) => y.i === s.start))
                schleifen.push({ knoten: knotenAn(a, s.start), i: s.start });
        }
    }
    // die starken Komponenten (Tarjan, iterativ)
    const komp = new Map();
    {
        const index = new Map();
        const low = new Map();
        const auf = new Set();
        const stapel = [];
        let zaehler = 0;
        let nr = 0;
        const nach = (v) => [...(kanten.get(v) || new Map()).keys()][Symbol.iterator]();
        const knoten = new Set();
        for (const [v, m] of kanten) {
            knoten.add(v);
            for (const w of m.keys()) knoten.add(w);
        }
        const betrete = (v) => {
            (index.set(v, zaehler), low.set(v, zaehler++), stapel.push(v), auf.add(v));
        };
        for (const v0 of knoten) {
            if (index.has(v0)) continue;
            betrete(v0);
            const rahmen = [[v0, nach(v0)]];
            while (rahmen.length) {
                const [v, it] = rahmen[rahmen.length - 1];
                const nx = it.next();
                if (!nx.done) {
                    const w = nx.value;
                    if (!index.has(w)) (betrete(w), rahmen.push([w, nach(w)]));
                    else if (auf.has(w)) low.set(v, Math.min(low.get(v), index.get(w)));
                    continue;
                }
                rahmen.pop();
                if (rahmen.length) {
                    const u = rahmen[rahmen.length - 1][0];
                    low.set(u, Math.min(low.get(u), low.get(v)));
                }
                if (low.get(v) === index.get(v)) {
                    let w;
                    do {
                        w = stapel.pop();
                        auf.delete(w);
                        komp.set(w, nr);
                    } while (w !== v);
                    nr++;
                }
            }
        }
    }
    const gliedVonKnoten = (k) => k.split("/")[0];
    const frei = (von, zu) => FRIST_KETTE.some(([x, y]) => gliedVonKnoten(von) === x && gliedVonKnoten(zu) === y);
    const mitglieder = new Map();
    for (const [k, c] of komp) {
        if (!mitglieder.has(c)) mitglieder.set(c, []);
        mitglieder.get(c).push(k);
    }
    const kreise = []; // { von, zu, i, familie }
    for (const [von, m] of kanten)
        for (const [zu, e] of m) {
            if (!e.zeit || komp.get(von) !== komp.get(zu) || frei(von, zu)) continue;
            kreise.push({
                von,
                zu,
                i: e.i,
                familie: mitglieder.get(komp.get(von)).some((k) => familie.has(gliedVonKnoten(k))),
            });
        }
    // ein pollendes Glied: in einem Zeit-Kreis, mit einer wartenden Schleife oder einem setInterval
    const pollend = new Set(
        [
            ...kreise.flatMap((k) => mitglieder.get(komp.get(k.von))),
            ...schleifen.map((s) => s.knoten),
            ...intervalle.map((s) => s.knoten),
        ].map(gliedVonKnoten)
    );
    const ueber = [];
    for (const a of akten) {
        if (!familie.has(a.g.name)) continue;
        for (const r of a.rufe) {
            const P = r.n.callee.type === "MemberExpression" ? gliedZiel(a, r.n.callee) : null;
            if (!P || familie.has(P) || !pollend.has(P)) continue;
            const p = r.p;
            const wartet =
                (p &&
                    (p.type === "AwaitExpression" ||
                        p.type === "ReturnStatement" ||
                        (p.type === "ArrowFunctionExpression" && p.body === r.n))) ||
                (p &&
                    p.type === "MemberExpression" &&
                    p.object === r.n &&
                    /^(?:then|catch|finally)$/.test(eigenName(p) || "")) ||
                r.n.arguments.some(
                    (x) => FN_ART.test(x.type) || (x.type === "Identifier" && a.closureNamen.has(x.name))
                );
            if (wartet) ueber.push({ knoten: knotenAn(a, r.n.start), P, i: r.n.start });
        }
    }
    const ort = (i) => stammLib.ort(root, stammLib.zeileVon(src, i));
    const polls = [
        ...kreise.filter((k) => k.familie).map((k) => `${k.von} → ${k.zu} Zeit-Kreis ${ort(k.i)}`),
        ...schleifen
            .filter((s) => familie.has(gliedVonKnoten(s.knoten)))
            .map((s) => `${s.knoten} wartet in einer Schleife auf Zeit ${ort(s.i)}`),
        ...intervalle
            .filter((s) => familie.has(gliedVonKnoten(s.knoten)))
            .map((s) => `${s.knoten} setInterval ${ort(s.i)}`),
        ...ueber.map((u) => `${u.knoten} wartet über das pollende ${u.P} ${ort(u.i)}`),
    ];
    return { familie, polls };
}

function wand(src) {
    const nc = ohneKommentare(src);
    // Die Rümpfe am AST beim Namen (kommentarfrei); ein fehlendes Glied macht seine Prüfung ROT, nie still leer.
    const gl = stammLib.glieder(src);
    const fehlt = [];
    const rumpf = (name) => {
        const gs = gl.filter((g) => g.name === name);
        if (!gs.length) {
            fehlt.push(name);
            return null;
        }
        return gs.map((g) => ohneKommentare(src.slice(g.start, g.ende))).join("\n");
    };
    const da = (...rs) => rs.every((r) => r !== null);
    const ohne = (...namen) =>
        namen.some((n) => fehlt.includes(n))
            ? ` · Glied fehlt: ${namen.filter((n) => fehlt.includes(n)).join(", ")}`
            : "";
    // Zeichnen darf nur die Bühne und der Loop (`_loopRender`); jeder Ruf steht im Render-Fluss (oben).
    const renderRufe = renderFluss(src);
    const direktRufe = renderRufe.filter((r) => r.glied !== "_buehneRender" && r.glied !== "_loopRender");
    const direktOrte = direktRufe.map(
        (r) => `${r.glied || "(außerhalb)"}: ${r.text} [${r.wie}] ${stammLib.ort(root, stammLib.zeileVon(src, r.i))}`
    );
    const direkt = direktOrte.length;
    const fehltIn = (name, re) => {
        try {
            return stammLib.fehlt(name, re, src);
        } catch {
            return !fehlt.push(name);
        }
    };
    // Die Genesis-Plattform sucht nur `_genesisPlattform` (V-D1 fährt es).
    const plattform = rumpf("_genesisPlattform");
    const plattSuchen =
        (nc.match(/\.type === "start_plattform"/g) || []).length -
        ((plattform || "").match(/\.type === "start_plattform"/g) || []).length;
    // Die Auflöser kennen keinen Ersatz-Ort; jede Zahl liest der EINE Leser `_dslOrtZahl`.
    const ersatz = [
        fehltIn("dslPositions", /_defaultSpawnPos\(\)|dslClamp\(|\bNumber\(/),
        fehltIn("dslEffects", /const c[xyz] = Number\(|playerMesh\.position : \{ x: 0/),
        fehltIn("_dslRulePos", /Array\.isArray/),
    ];
    // Der Foundry-Pfad pollt nicht: jeder Wartende hängt am Wecker, jede Frist am Ereignis (der Zeit-Graph oben).
    const zg = zeitGraph(src);
    const polls = zg.polls;
    const foundryNamen = zg.familie;
    return [
        [
            "W2 jeder Neben-Renderer zeichnet über die Bühne (jeder Ruf der Render-Funktion — direkt, .call/.apply, .bind, Alias, Feld, Parameter, Rückgabe — lebt in `_buehneRender` oder `_loopRender`)",
            direkt === 0,
            `${direkt} direkt${direkt ? " (" + direktOrte.join(", ") + ")" : ""}`,
        ],
        [
            "W3 der Orts-Vertrag sitzt an der Engstelle (`dslEvalPos` liefert nie null; den benannten Grund und den Default-Spawn ohne Knoten fährt V-k5)",
            fehltIn("dslEvalPos", /return null/),
            ohne("dslEvalPos").slice(3),
        ],
        [
            "W4 keine Op bewacht ihren Ort selbst (0 `if (!pos)` in den DSL-Effekten — sie lesen die Engstelle)",
            // der Rumpf von spawn_studio lebt seit 30.10. in `_spawnStudioWerk` (der Griff der Bibliothek ruft ihn ohne Interpreter)
            fehltIn("dslEffects", /if \(!pos\)/) && fehltIn("_spawnStudioWerk", /if \(!pos\)/),
            ohne("dslEffects", "_spawnStudioWerk").slice(3),
        ],
        [
            "W5 die Genesis-Plattform hat EINE Quelle (`_genesisPlattform` sucht sie; Spawn-Idempotenz und Rückkehr-Anker lesen sie)",
            da(plattform) && plattSuchen === 0,
            `${plattSuchen} Suche(n) nach start_plattform neben _genesisPlattform${ohne("_genesisPlattform")}`,
        ],
        [
            "W6 die Auflöser kennen keinen Ersatz-Ort (dslPositions: 0 `_defaultSpawnPos()`, 0 `dslClamp`, 0 `Number(`; Voxel-Ops ohne eigene Koordinaten-Leser, kein Ursprung statt Spieler; `_dslRulePos` ohne Array-Ersatz)",
            ersatz.every(Boolean),
            `ohne Ersatz dslPositions/dslEffects/_dslRulePos ${ersatz.join("/")}`,
        ],
        [
            "W7 der Foundry-Pfad pollt nicht (am AST, über alle Glieder, die die Familie erreicht: kein Zeit-Kreis, keine Schleife, die auf Zeit wartet, kein setInterval, kein Warten auf ein pollendes Glied; frei nur die Frist-Kette `_foundryUhren` · `_foundryAblauf` · `_foundryPumpe`)",
            WARTENDE.every((n) => foundryNamen.has(n)) && polls.length === 0,
            `${foundryNamen.size} Methoden${WARTENDE.filter((n) => !foundryNamen.has(n))
                .map((n) => " · ungezählt " + n)
                .join("")} · Polls: ${polls.length ? polls.join(", ") : "0"}`,
        ],
    ];
}

// ── WORT (KI H1) — das Soll am Welt-Abdruck, das Urteil über den Lauf (rein; Probe UND Selbsttest). ──
const KORPUS_PFAD = path.join(root, "spec/abnahme/ki-korpus.json");
const RATSCHE_PFAD = path.join(root, "spec/profiband/ratsche-ki-korpus.json");
const KORPUS_SOLL = {
    gueltig: 0.95,
    absicht: 0.85,
    p95Ms: 6000,
    fensterMs: 10000,
    gegenprobe: "http://localhost:9/",
};
// die feste Welt: ein Akt der KI, den ihr Satz nicht verlangt, ist ein Bruch
const FESTE_WELT = /"(voxel_carve|voxel_fill|terrain_steepness|terrain_base_height|remove_architecture)"/;
// Das Soll am Abdruck vor → nach (`wortTyp` Wort → Bauplan); null = kein Leser.
function korpusPraedikat(soll, vor, nach, wortTyp) {
    if (soll.wetter) return nach.wetter === soll.wetter;
    if (soll.saison) return nach.saison === soll.saison;
    if (soll.himmel) return nach.himmel !== vor.himmel;
    if (soll.uhr) {
        const [a, b] = soll.uhr;
        return a <= b ? nach.uhr >= a && nach.uhr <= b : nach.uhr >= a || nach.uhr <= b;
    }
    const traf = (t) => soll.werk === "*" || soll.werk.some((w) => wortTyp[w] === t);
    // DIE REGLER-WÖRTER (KI K2): ein neues Werk des Satzes, dessen Stempel jede genannte Zeile in ihrem Bereich trägt — der
    // Stempel eines Baus, der Guss eines Wesens, die Prägung eines Rezepts (`stempel`: [Werk-Ziel, Werte])
    const zahl = (x) =>
        soll.regler
            ? x.stempel.filter(([t, ov]) => traf(t) && Object.entries(soll.regler).every(([id, [a, b]]) => ov && ov[id] >= a && ov[id] <= b)).length
            : Object.entries(x.werke).reduce((s, [t, n]) => s + (traf(t) ? n : 0), 0);
    if (soll.werk) return zahl(nach) - zahl(vor) >= (soll.min || 1);
    for (const k of ["wesen", "traurig", "regel"]) if (soll[k]) return nach[k] - vor[k] >= soll[k];
    for (const k of ["tempo", "sprung", "schwere"]) if (soll[k]) return nach[k] > vor[k];
    return null;
}
// Ein Satz: gültig · Absicht · Bruch; ein Negativ-Satz nur ohne versuchte Tat.
function korpusSatzUrteil(e, soll) {
    const a = e.antwort || {};
    const json = !!e.antwort && !a.error && !a.fallbackUsed;
    const bruch = e.fehler > 0 || FESTE_WELT.test(JSON.stringify(a.program || null));
    if (soll.still)
        return { gueltig: json && !a.program, absicht: json && !a.program && !!a.say, bruch, tat: !!a.program };
    if (soll.taten) return { gueltig: json && !!a.say, absicht: e.praedikat === true, bruch };
    return { gueltig: json && Array.isArray(a.program) && e.lauf === true, absicht: e.praedikat === true, bruch };
}
// Das Urteil, die Täter beim Namen: echt gegen das Soll der Karte, der Mitschnitt gegen die Absicht des echten Laufs.
function korpusVerdict(m) {
    if (!m || !m.korpus) return ["Korpus fehlt (spec/abnahme/ki-korpus.json)"];
    const [S, n, r, out] = [m.saetze, m.korpus.saetze.length, m.ratsche || {}, []];
    if (S.length !== n) out.push(`${S.length} von ${n} Sätzen gelaufen`);
    const nie = S.filter((e) => e.praedikat === null).map((e) => e.satz);
    if (nie.length) out.push(`Prädikat nie geprüft: ${nie.slice(0, 3).join(" · ")}`);
    if (!m.echt && !(r.anbieter && r.quote)) out.push("kein echter Anbieter: der Mitschnitt trägt keinen echten Lauf");
    if (!(m.tueren || []).length) out.push("die Türen der CSP nie geprüft");
    for (const [u, zu] of m.tueren || [])
        if (zu !== (u === KORPUS_SOLL.gegenprobe))
            out.push(zu ? `die CSP sperrt die Tür ${u}` : `die CSP-Probe ist blind: ${u} geht durch`);
    if (m.sinkt)
        out.push(`die Aufnahme sänke die Ratsche (Absicht ${m.sinkt.join(" gegen ")} oder Täter) — nicht geschrieben`);
    for (const e of S)
        if (e.urteil.tat)
            out.push(`Negativ-Satz versucht eine Tat: „${e.satz}“ → ${JSON.stringify(e.antwort.program).slice(0, 80)}`);
    const b = S.filter((e) => e.urteil.bruch).map((e) => e.satz);
    if (b.length) out.push(`${b.length} Brüche: ${b.slice(0, 3).join(" · ")}`);
    const q = (k) => S.filter((e) => e.urteil[k]).length / Math.max(1, S.length);
    const pz = (x) => (100 * x).toFixed(1) + " %";
    const soll = m.soll || KORPUS_SOLL;
    if (m.echt) {
        for (const k of ["gueltig", "absicht"]) if (q(k) < soll[k]) out.push(`${k} ${pz(q(k))} < ${pz(soll[k])}`);
        if (soll.p95Ms && !(m.p95 <= soll.p95Ms)) out.push(`p95 Satz → Welt ${m.p95} ms > ${soll.p95Ms} ms`);
    } else if (r.quote && q("absicht") < r.quote.absicht)
        out.push(`Rückschritt am Mitschnitt: Absicht ${pz(q("absicht"))} < ${pz(r.quote.absicht)} des echten Laufs`);
    return out;
}
// DIE SEELE (KI K3): die Antwort nennt eine Tat, die das Wesen erlebte, und keine fremde (der Bezug je Tat: Korpus `seele.bezug`)
function seelePraedikat(soll, say, bezug) {
    const trifft = (t) => new RegExp(bezug[t]).test(String(say || "").toLowerCase());
    return soll.taten.some(trifft) && !Object.keys(bezug).some((t) => !soll.taten.includes(t) && trifft(t));
}
// DIE REGELN DES MODELLS (KI K4): je Drittel des Selbstlaufs eine neue LLM-Regel; die Regeln beider Quellen gewertet (ihr ttl-Ende)
// und verdrängt; im Gegenlauf (gemischtes δ, blind für die Quelle; der Nexus schreibt je Sekunde, die Kappe greift) erneuert
// dieselbe Wertung die Heiler (δ +) um `trennung` öfter als die Schädlinge (δ −), die verfallen oder verdrängt werden — je Quelle.
function regelVerdict(R, trennung = 0.25) {
    if (!R || !R.gegen) return ["kein Selbstlauf der Regeln"];
    const sum = (k) => [...R.echt, ...R.gegen].reduce((s, d) => s + (d[k] || 0), 0);
    const out = R.echt.flatMap((d, i) => (d["llm neu"] ? [] : [`Drittel ${i + 1} ohne neue LLM-Regel`]));
    for (const q of ["llm", "nexus"]) {
        const [e, v, d] = ["erneuert", "verfallen", "verdraengt"].map((f) =>
            ["+ ", "- ", " "].map((x) => sum(q + x + f))
        );
        const [hp, hm] = [0, 1].map((i) => e[i] / Math.max(1, e[i] + v[i] + d[i]));
        if (!(e[0] + e[1] + e[2] + v[0] + v[1] + v[2])) out.push(`keine ${q}-Regel gewertet`);
        if (!(d[0] + d[1] + d[2])) out.push(`keine ${q}-Regel verdrängt`);
        if (!(hp - hm >= trennung))
            out.push(`die Wertung trennt ${q} nicht nach δ: erneuert ${hp.toFixed(2)} (+) · ${hm.toFixed(2)} (−)`);
    }
    return out;
}

const server = statikServer();

async function probe(arg) {
    const kiPort = arg && arg.kiPort;
    const out = {};
    await window.__weltDa();
    const tick = async (n, ms) => {
        for (let i = 0; i < n; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch {}
            await sleep(ms || 30);
        }
    };
    // ── V-D1: die Ankunft ──
    try {
        const m = { gestartet: false };
        out.ankunft = m;
        await window.__gebautNach("die Genesis-Plattform", {
            fertig: () => st.architectures.some((a) => a && a.type === "start_plattform"),
            takt: () => tick(1, 100),
            max: 600,
        });
        const plat = st.architectures.find((a) => a && a.type === "start_plattform");
        if (!plat) throw new Error("keine Genesis-Plattform");
        const platR = st.blueprints.start_plattform.parts[0].size.x / 2;
        const P = plat.position;
        m.plattform = [+P.x.toFixed(1), +P.z.toFixed(1)];
        m.trocken = r._landAt(P.x, P.z, 0);
        r._ensureGenesisPlatform(); // die Spawn-Idempotenz liest `_genesisPlattform`: kein zweiter Leger legt eine zweite
        m.plattformen = st.architectures.filter((a) => a && a.type === "start_plattform").length;
        // Der Wald wächst um den Spieler: ticken, bis die Welt steht (`__weltStehtNach`).
        const baeume = () =>
            st.architectures.filter(
                (a) => a && /^baum_/.test(a.type) && Math.hypot(a.position.x - P.x, a.position.z - P.z) < 40
            );
        await window.__weltStehtNach(() => tick(1, 20));
        let kronen = 0,
            naechster = Infinity,
            art = null;
        const bs = baeume();
        for (const a of bs) {
            const d = Math.hypot(a.position.x - P.x, a.position.z - P.z);
            const krone = r._naturKrone(a.type, a);
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
        // Der Genesis-Ring im echten Spiel-Takt über dem Frame-Budget (`_frameOverBudget` fest wahr).
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
        };
        llm.enabled = true;
        llm.provider = "ollama";
        llm.providerConfig.ollama.endpoint = "http://127.0.0.1:" + kiPort;
        llm.providerConfig.ollama.useProxy = false;
        let antwort = null;
        try {
            antwort = await r.llmCall("hallo welt");
        } finally {
            llm.enabled = alt.enabled;
            llm.provider = alt.provider;
            llm.providerConfig.ollama.endpoint = alt.ep;
            llm.providerConfig.ollama.useProxy = alt.px;
        }
        m.fehler = antwort && antwort.error ? String(antwort.error) : null;
        m.host = "127.0.0.1:" + kiPort;
        m.gestartet = true;
    } catch (e) {
        out.ki = Object.assign(out.ki || {}, { err: (e && e.stack) || String(e) });
    }
    try {
        const m = { gestartet: false };
        out.satz = m;
        const archs = st.architectures;
        const pm = st.playerMesh.position;
        const ausgabe = document.getElementById("chat-output");
        const letzteZeile = () => (ausgabe && ausgabe.lastElementChild ? ausgabe.lastElementChild.textContent : "");
        const nass = (x, z) => !r._landAt(x, z, 0.2);
        // Ein Ort ohne Wasser im 84-m-Kreis (eigenes 4-m-Raster).
        const trockenUm = (x, z) => {
            for (let dz = -84; dz <= 84; dz += 4)
                for (let dx = -84; dx <= 84; dx += 4)
                    if (dx * dx + dz * dz <= 84 * 84 && nass(x + dx, z + dz)) return false;
            return true;
        };
        let ort = null;
        // Die Plattform ist trocken; der Ort liegt außerhalb ihrer Lichtung (`_grundrissVon` + 30 m).
        const platz = st.architectures.find((a) => a && a.type === "start_plattform");
        const licht = platz && r._grundrissVon(platz);
        const frei = (x, z) =>
            !licht || Math.hypot(x - platz.position.x, z - platz.position.z) > (licht.lichtung || 0) + 30;
        for (const [x, z] of [
            [pm.x, pm.z],
            [200, 200],
            [-200, 200],
            [200, -200],
            [-200, -200],
            [400, 0],
            [0, 400],
            [-400, 0],
        ]) {
            if (frei(x, z) && r._landAt(x, z, 1) && trockenUm(x, z)) {
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
        // die Signatur des Akts: das Ergebnis des Dorfs und seine Quelle
        r._nachDorfOrientieren({ placed: 1, haeuser: [], mitte: { x: sx, z: sz } }, "human");
        const neuZeilen = ausgabe
            ? Array.from(ausgabe.children)
                  .slice(z0)
                  .map((c) => c.textContent)
            : [];
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
        // Beobachtungs-Punkte: jeder Welt-Akt einer Op; Dorf und Voxel-Edit nur aufgezeichnet.
        const akte = [];
        const ortVon = {
            spawnCreatureAt: (a) => ({ x: a[0], z: a[2] }),
            spawnArchitecture: (a) => a[1] || null,
            spawnIslandAt: (a) => ({ x: a[0], z: a[2] }),
            spawnUfoAt: (a) => ({ x: a[0], z: a[2] }),
            spawnSettlement: (a) => (a[0] && a[0].position) || null,
            _depositLife: (a) => ({ x: a[0], z: a[1] }),
            _depositEmotion: (a) => ({ x: a[0], z: a[1] }),
            carveVoxel: (a) => ({ x: a[0], z: a[2] }),
            fillVoxel: (a) => ({ x: a[0], z: a[2] }),
            assignTaskToNearestCreature: (a) => a[0] || null,
        };
        const nurAufzeichnen = {
            spawnSettlement: () => Promise.resolve(null),
            carveVoxel: () => {},
            fillVoxel: () => {},
        };
        const alt = {};
        for (const nm of Object.keys(ortVon)) {
            alt[nm] = r[nm];
            r[nm] = function (...a) {
                const p = ortVon[nm](a);
                akte.push({
                    nm,
                    abstand: p && Number.isFinite(p.x) ? +Math.hypot(p.x - pm.x, p.z - pm.z).toFixed(1) : null,
                });
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
            m.chain = lauf(["chain", ["spawn_tree", NW, 1, "eiche", 5], ["deposit_life", ["at_player"], 0.1]]);
            // DER REST DER KLASSE je Programm durch `dslRun`; „ohne Spieler“ nimmt den Leib für genau diesen Lauf.
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
                for (const [name, prog, ohne] of (arg && arg.knoten) || [])
                    k.laeufe[name] = ohne ? ohneSpieler(() => lauf(prog)) : lauf(prog);
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
                k.ohneKnoten =
                    grundVon(null) ||
                    [r.dslEvalPos(null, r.dslCtx({ source: "test" }))].every((q) =>
                        [q.x, q.y, q.z].every(Number.isFinite)
                    );
                k.messOrtOhneSpieler = ohneSpieler(() =>
                    r._ruleRewardPos(["weather", "sunny"], r.dslCtx({ source: "test" }))
                );
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
        // Das Dorf: ein fehlender Ort gründet nie beim Spieler (der Worker-Auftrag ist Beobachtungs-Punkt).
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
        const urteil = r._landAt;
        // (a) Das Urteil gegen den vollen Spalten-Scan: 3 Margen, je 400 Punkte.
        const ref = (x, z, mg) => {
            const s = scan.call(r, x, z);
            if (s === null || !Number.isFinite(s)) return !(r._atlasWaterLevelAt(x, z, -1e9) > -Infinity);
            return !(s < r._koerperWasser(x, z, s) + mg) && !(s < r._atlasWaterLevelAt(x, z, s) + mg);
        };
        // das nächste Wasser des Gesetzes
        const w0 = r._findNearestWaterPoint(P.x, P.z, 800);
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
        // Der Spieler-Wille: ein Graben und eine Aufschüttung am Ufer, nur für diese Urteile (kein Remesh).
        const wm = st.worldMeta;
        const editsAlt = wm.voxelEdits;
        const ufer = w0 || P;
        const sy = scan.call(r, ufer.x + 6, ufer.z) ?? 0;
        wm.voxelEdits = (editsAlt || []).concat([
            { x: ufer.x + 6, y: sy, z: ufer.z, r: 7, mode: "carve" },
            { x: ufer.x - 6, y: sy + 1, z: ufer.z + 4, r: 6, mode: "fill" },
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
        // (b) Spalten-Scans und Proben je Such-Pfad, Scan und Urteil sind Beobachtungs-Punkte.
        let scans = 0,
            proben = 0;
        const eigen = (k) => Object.prototype.hasOwnProperty.call(r, k);
        const nassAlt = r._nassAt;
        const hatte = { scan: eigen("_voxelSurfaceY"), urteil: eigen("_nassAt") };
        r._voxelSurfaceY = function (...a) {
            scans++;
            return scan.apply(this, a);
        };
        r._nassAt = function (...a) {
            proben++;
            return nassAlt.apply(this, a);
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
            // Der teuerste Fall: kein Wasser im 200-m-Kreis — gezählt die Spalten der trockenen Proben.
            let trockenScans = 0,
                trockenProben = 0,
                nassProben = 0;
            for (let rr = 4; rr <= 200; rr += 4) {
                const D = Math.max(8, Math.ceil((2 * Math.PI * rr) / 4));
                for (let d = 0; d < D; d++) {
                    const s0 = scans;
                    const ja = !r._nassAt(
                        ort.x + Math.cos((d / D) * Math.PI * 2) * rr,
                        ort.z + Math.sin((d / D) * Math.PI * 2) * rr,
                        0.2
                    );
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
            if (hatte.urteil) r._nassAt = nassAlt;
            else delete r._nassAt;
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
        await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.eiche && st.blueprints.baum_eiche);
        // Das Welt-Auge steht beim Spieler, wo er die Werkstatt öffnet.
        await tick(20);
        if (st.uiActiveDrawer !== "werkstatt") r.toggleDrawer("werkstatt");
        const ws = r._ensureWorkshopState();
        const lu = r._ensureLodUniforms();
        // Der Beobachtungs-Punkt im Takt des Öffnens: der Neben-Renderer bekommt den Masken-Stand.
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
        await window.__gebautNach("die Werkstatt-Vorschau der Eiche", {
            fertig: () =>
                !!(
                    ws.preview &&
                    ws.preview.currentMesh &&
                    !r._wsStudioPending &&
                    ws.preview.currentMesh.children.length
                ),
            takt: () => tick(1, 80),
            max: 1125,
        });
        const p = ws.preview;
        if (!p || !p.currentMesh) {
            const bpE = st.blueprints.baum_eiche;
            const pr = r._foundryPresetForEntry({ type: "baum_eiche" });
            const lodE = bpE && Number.isFinite(bpE._recipeLod) ? bpE._recipeLod | 0 : 0;
            const k = pr
                ? r._foundryKoerperKey(pr, r._foundryVariantFor(r._werkSame(bpE, "baum_eiche"), pr), lodE)
                : null;
            throw new Error(
                `keine Vorschau-Gestalt — ${k}: im Cache ${!!(k && f.cache.has(k))} · angefragt ${!!(k && f.requested && f.requested.has(k))} · Vorschau pending ${!!r._wsStudioPending} · Schlange ${(f.warte || []).length} · im Flug ${f.pending ? f.pending.size : 0}`
            );
        }
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
                const fol = !!(
                    o.material &&
                    o.material.userData &&
                    /foliage|grass/.test(o.material.userData.foundryKind || "")
                );
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
    // ── V-D3 FREMDER ZUG: der Wartende erwacht, wenn ein ANDERER seinen Körper zuerst zog ──
    try {
        const m = { gestartet: false };
        out.zug = m;
        const ws = r._ensureWorkshopState();
        const p = ws.preview;
        const f = r._foundry;
        if (!p || !f || !f.ready || !f.recipes) throw new Error("keine Vorschau oder kein Buch");
        const teile = Object.keys(st.blueprints).find((n) => {
            const b = st.blueprints[n];
            return b && Array.isArray(b.parts) && b.parts.length && !r._foundryPresetForEntry({ type: n });
        });
        const zuTeilen = () => {
            if (teile) r.selectBlueprintForEdit(teile);
        };
        const schluessel = (bpName) => {
            const preset = r._foundryPresetForEntry({ type: bpName });
            const variant = r._foundryVariantFor(r._werkSame(st.blueprints[bpName], bpName), preset);
            return { preset, variant, key: r._foundryKoerperKey(preset, variant, 0) };
        };
        const imFlug = (k) => !!(f.requested && f.requested.has(k)) && !f.cache.has(k);
        // (a) die Vorschau hinter dem Zug der Welt
        zuTeilen();
        const a = schluessel("baum_eiche");
        r._foundryCacheEvict(a.key);
        let same = 1;
        while (same < 100000 && r._foundryVariantFor(same, a.preset) !== a.variant) same++;
        // ohne Ort: die Gestalt aus dem Samen, der Rang der Ferne
        r._foundryFlattenFor({ type: "baum_eiche", seed: same }, a.preset, 0);
        m.vorschau = { key: a.key, fremd: imFlug(a.key) };
        const t0 = performance.now();
        r.selectBlueprintForEdit("baum_eiche");
        const steht = () => !!(p.currentMesh && !r._wsStudioPending && p.currentMesh.children.length);
        await window.__gebautNach(`die Vorschau nach dem fremden Zug ${a.key}`, {
            fertig: steht,
            takt: () => tick(1, 80),
            max: 275,
        });
        m.vorschau.ms = steht() ? Math.round(performance.now() - t0) : null;
        m.vorschau.imCache = f.cache.has(a.key);
        // (b) die Hand hinter dem Zug der Vorschau: geweckt zählt nur NACH der Ankunft
        const klinge = Object.keys(st.blueprints)
            .sort()
            .find((n) => /^klinge_/.test(n) && r._foundryPresetForEntry({ type: n }));
        if (klinge) {
            zuTeilen();
            const b = schluessel(klinge);
            r._foundryCacheEvict(b.key);
            r.selectBlueprintForEdit(klinge);
            m.hand = { key: b.key, fremd: imFlug(b.key), geweckt: 0, vorAnkunft: 0 };
            const echt = r._refreshHeldMesh;
            r._refreshHeldMesh = function () {
                if (f.cache.has(b.key)) m.hand.geweckt++;
                else m.hand.vorAnkunft++;
            };
            try {
                const t1 = performance.now();
                const erst = r._heldFoundryGroup(klinge);
                m.hand.erst = erst === "pending" ? "pending" : erst ? "gruppe" : String(erst);
                await window.__gebautNach(`die Hand nach dem fremden Zug ${b.key}`, {
                    fertig: () => m.hand.geweckt > 0,
                    takt: () => tick(1, 80),
                    max: 275,
                });
                m.hand.ms = m.hand.geweckt ? Math.round(performance.now() - t1) : null;
                m.hand.imCache = f.cache.has(b.key);
            } finally {
                r._refreshHeldMesh = echt;
            }
        }
        // (c) JEDE STUFE der Vorschau: die Eiche mit LOD 0 · 1 · 2, ihr Stoff vorher geräumt.
        m.stufen = [];
        const bpE = st.blueprints.baum_eiche;
        const lodAlt = bpE._recipeLod;
        try {
            for (const s of [0, 1, 2]) {
                zuTeilen();
                bpE._recipeLod = s;
                const preset = r._foundryPresetForEntry({ type: "baum_eiche" });
                const variant = r._foundryVariantFor(r._werkSame(bpE, "baum_eiche"), preset);
                const kKey = r._foundryKoerperKey(preset, variant, s === 2 ? r._foundryHoehenStufe(preset) : s);
                r._foundryCacheEvict(kKey);
                const at = s === 2 ? r._impostorAtlas() : null;
                const zKey = "fimp:" + r._foundryKartenKey(preset, variant, null);
                if (at) {
                    if (f.hoehen) f.hoehen.delete(kKey);
                    at.zellen.delete(zKey);
                }
                const t2 = performance.now();
                r.selectBlueprintForEdit("baum_eiche");
                await window.__gebautNach(`die Vorschau-Stufe L${s}`, {
                    fertig: steht,
                    takt: () => tick(1, 80),
                    max: 275,
                });
                const z = at ? at.zellen.get(zKey) : null;
                const box = steht() ? new THREE.Box3().setFromObject(p.currentMesh) : null;
                m.stufen.push({
                    hoch: box ? Math.round((box.max.y - box.min.y) * 100) / 100 : null,
                    soll: f.hoehen && f.hoehen.get(kKey) > 0 ? Math.round(f.hoehen.get(kKey) * 100) / 100 : null,
                    lod: s,
                    wart: at ? `die Karte ${zKey} (Höhen-Stufe ${kKey})` : `der Körper ${kKey}`,
                    ms: steht() ? Math.round(performance.now() - t2) : null,
                    da: at
                        ? !!(z && (z.gebacken || (z.frame && f.hoehen && f.hoehen.get(kKey) > 0)))
                        : f.cache.has(kKey),
                });
            }
        } finally {
            bpE._recipeLod = lodAlt;
        }
        // (d) DER VORRAT: ein Leser fragt den Schlüssel im Flug — gezählt jeder Auftrag an den Worker.
        const bodenArt = (r._foundryLibrarySpec().species || []).find(
            (sp) => !r._foundryPresetIsTree(sp) && r._foundryGestalten(sp) > 0
        );
        await window.__gebautNach("der Boot-Vorrat", { fertig: () => !f._vorrat, takt: () => tick(1, 80), max: 275 }); // der Boot-Vorrat läuft aus
        if (bodenArt && !f._vorrat) {
            const lodV = (r._foundryKindStages(bodenArt) || [2, 0])[0];
            const vKey = r._foundryKoerperKey(bodenArt, 1, lodV);
            r._foundryCacheEvict(vKey);
            m.vorrat = { key: vKey, imFlug: false, auftraege: 0 };
            let sd = 1;
            while (sd < 100000 && r._foundryVariantFor(sd, bodenArt) !== 1) sd++;
            const echtReq = r._foundryRequest;
            // der Leser fragt im Flug: nach dem Auftrag des Vorrats (als Mikro-Aufgabe, vor jeder Worker-Antwort)
            r._foundryRequest = function (preset, variant, lod, ...rest) {
                const zusage = echtReq.call(this, preset, variant, lod, ...rest);
                if (r._foundryKoerperKey(preset, variant, lod) === vKey && ++m.vorrat.auftraege === 1)
                    queueMicrotask(() => {
                        m.vorrat.imCache = f.cache.has(vKey);
                        m.vorrat.phase = String(f._vorrat);
                        m.vorrat.imFlug = !m.vorrat.imCache;
                        r._foundryFlattenFor({ type: bodenArt, seed: sd }, bodenArt, lodV);
                    });
                return zusage;
            };
            try {
                await r._foundryPrefetchLibrary();
            } finally {
                r._foundryRequest = echtReq;
            }
        }
        m.gestartet = true;
    } catch (e) {
        out.zug = Object.assign(out.zug || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-D3 RAHMEN: jedes Rezept und jeder Bauplan füllt die Vorschau (projizierte Box3 je Bildkante) ──
    try {
        const m = { gestartet: false, eintraege: [] };
        out.rahmen = m;
        const ws = r._ensureWorkshopState();
        const p = ws.preview;
        const f = r._foundry;
        if (!p || !f || !f.recipes) throw new Error("keine Vorschau oder kein Buch");
        const fuell = () => {
            const o = p.currentMesh;
            o.updateMatrixWorld(true);
            const b = new THREE.Box3().setFromObject(o);
            if (b.isEmpty()) return null;
            const cam = p.camera;
            cam.updateMatrixWorld(true);
            let x0 = 1,
                x1 = -1,
                y0 = 1,
                y1 = -1;
            const v = new THREE.Vector3();
            for (const x of [b.min.x, b.max.x])
                for (const y of [b.min.y, b.max.y])
                    for (const z of [b.min.z, b.max.z]) {
                        v.set(x, y, z).project(cam);
                        x0 = Math.min(x0, v.x);
                        x1 = Math.max(x1, v.x);
                        y0 = Math.min(y0, v.y);
                        y1 = Math.max(y1, v.y);
                    }
            const cl = (q) => Math.max(-1, Math.min(1, q));
            const fw = (cl(x1) - cl(x0)) / 2,
                fh = (cl(y1) - cl(y0)) / 2;
            const s = b.getSize(new THREE.Vector3());
            return { fuell: +Math.max(fw, fh).toFixed(3), kante: +Math.max(s.x, s.y, s.z).toFixed(3) };
        };
        const liste = Object.keys(f.recipes)
            .sort()
            .map((id) => ["rezept", id, f.recipes[id].kind])
            .concat(
                Object.keys(st.blueprints)
                    .sort()
                    .map((id) => ["bauplan", id, st.blueprints[id].preset || "teile"])
            );
        m.waffenImBuch = liste.filter((e) => e[2] === "weapon").length;
        const t0 = performance.now();
        const frist = t0 + 150000;
        for (const [art, id, kind] of liste) {
            const e = { art, id, kind };
            m.eintraege.push(e);
            if (performance.now() > frist) {
                e.frist = true;
                continue;
            }
            const ti = performance.now();
            if (art === "rezept") r.selectStudioRecipeForView(id);
            else r.selectBlueprintForEdit(id);
            await window.__weltDa(() => !r._wsStudioPending);
            e.ms = Math.round(performance.now() - ti);
            if (r._wsStudioPending) {
                e.frist = true;
                continue;
            }
            if (!p.currentMesh) {
                e.leer = true;
                continue;
            }
            r._workshopRender();
            Object.assign(e, fuell() || { leer: true });
            e.dist = +p.orbit.dist.toFixed(3);
        }
        m.ms = Math.round(performance.now() - t0);
        m.aspekt = +p.camera.aspect.toFixed(3);
        m.gestartet = true;
    } catch (e) {
        out.rahmen = Object.assign(out.rahmen || {}, { err: (e && e.stack) || String(e) });
    }
    return out;
}

// ── WORT — DIE SEITE ──
async function korpusAufbau(a) {
    // die Welt steht und das Studio-Buch kennt jedes Wort des Korpus
    for (let i = 0; i < 200 && !(i && a.worte.every((w) => r._studioBlueprintForWord(w))); i++)
        await window.__weltStehtNach();
    // DER SPIELER STELLT DIE STIMME EIN, im Fenster der KI
    for (const [id, w] of [
        ["llm-provider", "ollama"],
        ["llm-model", a.modell],
        ["llm-endpoint", a.endpunkt],
        ["llm-use-proxy", true],
    ]) {
        const el = document.getElementById(id);
        el[w === true ? "checked" : "value"] = w;
        el.dispatchEvent(new Event("change"));
    }
    document.getElementById("llm-toggle").click();
    // Beobachtungs-Punkte: die Antwort an den Spieler und was der Lauf der KI setzte
    const K = (window.__korpus = {});
    const [ruf, lauf] = [r.llmCall, r.dslRun];
    r.llmCall = async function (text, system, o) {
        const p = await ruf.call(this, text, system, o);
        if (!(o && o.hintergrund)) K.antwort = p;
        return p;
    };
    r.dslRun = function (p, o) {
        const [na, nw] = [st.architectures.length, st.creatures.length];
        const res = lauf.call(this, p, o);
        if ((o && o.source) !== "llm:grok") return res;
        K.werke.push(...st.architectures.slice(na));
        K.wesen.push(...st.creatures.slice(nw));
        K.lauf = res.ok && !res.log.some((x) => /^(sovereign|weltakt_gehalten)/.test(x.event));
        return res;
    };
    const ws = r._ensureWorkshopState().studioOv;
    K.abdruck = () => {
        const [da, werke] = [new Set(st.architectures), {}];
        for (const x of K.werke) if (da.has(x)) werke[x.type] = (werke[x.type] || 0) + 1;
        const lebt = K.wesen.filter((c) => st.creatures.includes(c));
        return {
            werke,
            stempel: [
                ...K.werke.filter((x) => da.has(x)).map((x) => [x.type, x.studioOv]),
                ...lebt.map((c) => [c.userData.gattung, c.userData.gussDials]),
                ...Object.entries(ws),
            ],
            wesen: lebt.length,
            traurig: st.creatures.filter((c) => ((c.userData && c.userData.emotions) || {}).sorrow >= 0.5).length,
            wetter: st.weather,
            uhr: st.timeOfDay,
            saison: st.season,
            himmel: st.skyTintTo ? st.skyTintTo.getHexString() : "",
            schwere: st.gravity,
            regel: (st.worldRules || []).filter((x) => /^llm:/.test(x.source)).length,
            tempo: st.speed,
            sprung: st.jumpPower,
        };
    };
    // DER ORT DER SÄTZE: 45 m hinter der Lichtung im Land (auf ihr weicht jede Pflanzung benannt dem Platz)
    const pm = st.playerMesh.position;
    const platz = st.architectures.find((x) => x && x.type === "start_plattform");
    const [P, R] = [platz.position, ((r._grundrissVon(platz) || {}).lichtung || 0) + 45];
    const [x, z] = [
        [R, 0],
        [0, R],
        [-R, 0],
        [0, -R],
    ]
        .map(([dx, dz]) => [P.x + dx, P.z + dz])
        .find(([x, z]) => r._landAt(x, z, 1)) || [P.x + R, P.z];
    pm.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
    await window.__weltStehtNach();
    // DER RÜCKBAU je Satz: was entstand, fällt; Ort, Leib, Schwere, Gemüt der Wesen und die Prägungen stehen wie vorher
    K.stand = () => ({
        werke: new Set(st.architectures),
        wesen: new Set(st.creatures),
        gemuet: st.creatures.map((c) => [c, { ...(c.userData || {}).emotions }]),
        leib: [pm.clone(), st.gravity, st.jumpPower, st.speed],
        praegung: JSON.stringify(ws),
    });
    K.zurueck = (v) => {
        const alt = JSON.parse(v.praegung);
        for (const p in ws)
            if (JSON.stringify(ws[p]) !== JSON.stringify(alt[p]))
                r._praegungSetzen(r._foundry.recipes[p].kind, p, alt[p] || {}), alt[p] || delete ws[p];
        for (const x of st.architectures.filter((x) => !v.werke.has(x)).reverse()) r.removeArchitecture(x);
        for (const c of st.creatures.filter((c) => !v.wesen.has(c))) r.removeCreature(c);
        for (const [c, e] of v.gemuet) if (c.userData && c.userData.emotions) c.userData.emotions = e;
        pm.copy(v.leib[0]);
        [st.gravity, st.jumpPower] = v.leib.slice(1);
        r._applyPlayerSpeed(v.leib[3]);
    };
    // DIE TÜREN: jeder Anbieter und der Proxy gehen durch die CSP, die Gegenprobe nie
    const gesperrt = [];
    document.addEventListener("securitypolicyviolation", (e) => gesperrt.push(e.blockedURI));
    const tueren = [
        ...Object.values(r.llmProviderDefs()).map((d) => d.endpoint("m", "", {})),
        r._llmProxyUrl(),
        a.gegenprobe,
    ];
    // no-cors: die CSP urteilt vor dem Netz; eine Antwort ohne CORS-Kopf schriebe sonst ein console.error, sobald sie binnen 50 ms
    // kommt (die CI: api.anthropic.com → EXIT 1 in jedem zweiten Lauf)
    for (const u of tueren)
        fetch(u, { method: "POST", mode: "no-cors", signal: AbortSignal.timeout(50) }).catch(() => {});
    await sleep(500);
    return {
        wortTyp: Object.fromEntries(a.worte.map((w) => [w, r._studioBlueprintForWord(w)])),
        tueren: tueren.map((u) => [u, gesperrt.some((g) => g.startsWith(new URL(u).origin))]),
    };
}

async function korpusSatz(a) {
    const K = window.__korpus;
    const praedikat = new Function(`return (${a.praedikat})`)();
    if (K.vor) K.zurueck(K.vor);
    // die Bühne: Mittag · Sonne · Sommer, dann löst sich ihr Halt — die KI darf handeln (`_messHalt`)
    window.__buehne();
    r.state.weatherEffectTime = 0;
    await window.__weltStehtNach();
    Object.assign(K, { vor: K.stand(), werke: [], wesen: [], lauf: null, antwort: null });
    const [vor, f0, e] = [K.abdruck(), window.__seitenfehler || 0, { satz: a.satz }];
    // DIE SEELE (KI K3): ein Wesen des Satzes und seine Taten über die Wege des Spiels — der Schlag des Spielers (`damageCreature`),
    // die Gabe (`activateCreatureConsumable`), die Geste „folge mir" (`assignCreatureTask`, erinnert, wenn es ankommt: Takte der
    // Welt) —, dann die Frage im Chat an seinen Namen (`maybeAnswerCreature` → Persona-Prompt); gedaechtnis-leer vergisst vorher
    const p = r.state.playerMesh.position;
    const w =
        a.soll.taten && r.spawnCreatureAt(p.x + 4, r._voxelSurfaceY(p.x + 4, p.z) + 1, p.z, "happy", a.soll.wesen);
    if (w) {
        w.userData.name = a.soll.name;
        const tat = {
            geschlagen: () => r.damageCreature(w, 1, { source: "player" }),
            gefuettert: () => r.activateCreatureConsumable(w, "trank_lebenssaft"),
            gefolgt: () => r.assignCreatureTask(w, "follow_player"),
        };
        for (const t of a.soll.taten) tat[t]();
        const hat = () => a.soll.taten.every((t) => (w.userData.memory || []).some((m) => m.type === t));
        for (let i = 0; i < 300 && !hat(); i++) await window.__seitenTakt();
        if (a.mutante === "gedaechtnis-leer") w.userData.memory = [];
    }
    const t0 = performance.now();
    const echo = (z) => r._chatEcho(z);
    await (w ? r.maybeAnswerCreature(`${a.soll.name}, ${a.satz}`, echo) : r.maybeAnswerWithLlm(a.satz, echo));
    Object.assign(e, { antwortMs: Math.round(performance.now() - t0), antwort: K.antwort });
    // das Fenster zählt Takte der Welt (je 100 ms einer), nie die Wanduhr
    for (let gang = 0; !a.soll.still && !w && gang <= a.fensterMs / 100; gang++) {
        e.praedikat = praedikat(a.soll, vor, K.abdruck(), a.wortTyp);
        if (e.praedikat) break;
        await new Promise((ok) => (r._gameLoopTick(performance.now()), setTimeout(ok, 100)));
    }
    Object.assign(e, { weltMs: e.praedikat ? Math.round(performance.now() - t0) : null, lauf: K.lauf });
    e.fehler = (window.__seitenfehler || 0) - f0;
    return e;
}

// DER SELBSTLAUF DER REGELN (KI K4) — vor dem ersten Satz eines Laufs leer, nach jedem Satz 100 s Welt-Zeit im Zeitraffer: die Uhr
// der Seite rückt je Takt 0,25 s vor (sie bleibt verschoben, auch für die Sätze), der Nexus schreibt je 3 s eine Regel
// (`_composeNexusRule`; im Gegenlauf je Sekunde, bis die Kappe verdrängt). Gezählt je Lauf, Drittel und Quelle am Bestand, gleich wer den Takt schlug (der eigene, der Loop): neu ·
// erneuert (ihr born rückt) · verfallen (fort am ttl-Ende) · verdrängt (fort davor). Der Gegenlauf (lauf 1) mischt das δ: je Quelle
// im Wechsel +1 / −1 über die Baseline des Rewards; die Mutante wertung-aus misst kein δ.
async function regelRaffer(a) {
    const R = window.__regeln || (window.__regeln = { vor: 0, z: [] });
    const q = (x) => (/^llm/.test(x.source) ? "llm" : x.source === "nexus" && "nexus");
    if (!R.uhr) {
        const [uhr, wert] = [performance.now.bind(performance), r._measureRuleReward];
        R.uhr = performance.now = () => uhr() + R.vor;
        r._measureRuleReward = function (x, t) {
            if (R.lauf && x._vPos)
                x._vBase = r._fieldWohlStruktur(r.auraAt(x._vPos.x, x._vPos.z, t)) - (R.dl.get(x) || [0, 0])[1];
            return a.mutante === "wertung-aus" || wert.call(this, x, t);
        };
    }
    if (R.lauf !== a.lauf)
        [R.lauf, R.s, R.dl, R.n, R.rng, R.z[a.lauf], st.worldRules] = [
            a.lauf,
            0,
            new Map(),
            {},
            r._samenStrom(r._bauSame("nexus")),
            [{}, {}, {}],
            [],
        ];
    const sieh = () => {
        const d = R.z[R.lauf][Math.floor(R.s / 800)];
        const zaehl = (x, f, k = q(x) + (R.lauf ? (R.dl.get(x)[1] > 0 ? "+ " : "- ") : " ") + f) =>
            (d[k] = (d[k] || 0) + 1);
        for (const [x, [born]] of R.dl)
            if (!st.worldRules.includes(x)) {
                zaehl(x, performance.now() / 1000 - born >= x.ttlSec ? "verfallen" : "verdraengt");
                R.dl.delete(x);
            }
        for (const x of st.worldRules.filter(q)) {
            const alt = R.dl.get(x);
            R.dl.set(x, [x.born, alt ? alt[1] : (R.n[q(x)] = -(R.n[q(x)] || -1))]);
            if (!alt || alt[0] !== x.born) zaehl(x, alt ? "erneuert" : "neu");
        }
    };
    for (const ende = R.s + a.schritte; R.s < ende; R.s++, R.vor += 250) {
        sieh();
        if (R.s % (R.lauf ? 4 : 12) === 0) r.dslRun(r._composeNexusRule(R.rng), { source: "nexus" });
        r._tickWorldRules(performance.now() / 1000);
    }
    return R.z;
}

// Der Mitschnitt-Anbieter der CI: das Programm des echten Laufs zum Satz (false: kein JSON).
const mitschnitt = (ratsche) => (req) =>
    new Promise((fertig) => {
        let b = "";
        req.on("data", (d) => (b += d));
        req.on("end", () => {
            const u = JSON.parse(b).messages.pop().content;
            const p = (ratsche.mitschnitt || {})[u.slice(u.lastIndexOf("Spieler sagt: ") + 14)];
            const inhalt = p === false ? "kein JSON" : JSON.stringify({ say: "Aus dem Mitschnitt.", program: p });
            fertig(
                JSON.stringify(
                    p === undefined ? { error: "kein Mitschnitt" } : { message: { role: "assistant", content: inhalt } }
                )
            );
        });
    });

// DIE WELT DER KI-LÄUFE (WORT und FEIND): der Statik-Server mit der Antwort des Modells (`seiten`, null: der echte Anbieter),
// eine Welt auf dem Null-Renderer, gewartet bis sie steht
async function kiWelt(seiten) {
    const srv = statikServer({ seiten });
    await srv.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 900000 });
    await srv.zeige(page);
    await warteAufWelt(page);
    return { srv, browser, page };
}

// DIE TEILE DES KORPUS (`--<teil>`): je Teil das Soll seiner Staffel, die Form seiner Sätze und eine eigene Ratsche
// (ratsche-ki-korpus-<teil>.json) — Regler-Wörter (KI K2, Absicht 80 %, [Werk-Wort oder "*", {Regler: [von, bis]}]) · Seele
// (KI K3, ≥ 70 % der Antworten nennen eine Erinnerung, [Name, Seele, Taten …]; ihr Mitschnitt trägt keine Antwort) · Regeln
// (KI K4: das Urteil fällt am Selbstlauf, regelVerdict)
const KORPUS_TEILE = {
    regler: [{ absicht: 0.8 }, ([w, r]) => ({ werk: w === "*" ? w : [w], regler: r })],
    seele: [{ gueltig: 0, absicht: 0.7, p95Ms: 0 }, ([name, wesen, ...taten]) => ({ name, wesen, taten })],
    regeln: [{ gueltig: 0, absicht: 0, p95Ms: 0 }, (regel) => ({ regel })],
};
async function korpusHaupt() {
    const echt = process.argv.includes("--echt");
    const teil = Object.keys(KORPUS_TEILE).find((t) => process.argv.includes("--" + t));
    const [soll, form] = KORPUS_TEILE[teil] || [];
    const mutante = process.env.V1_MUTANTE;
    const ratschePfad = teil ? RATSCHE_PFAD.replace(".json", `-${teil}.json`) : RATSCHE_PFAD;
    const lies = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null);
    const [roh, ratsche] = [lies(KORPUS_PFAD), lies(ratschePfad) || {}];
    const saetze = roh && Object.entries((teil ? roh[teil] : roh).saetze);
    const korpus = roh && { saetze: form ? saetze.map(([s, x]) => [s, form(x)]) : saetze };
    const m = { korpus, ratsche, echt, saetze: [], soll: { ...KORPUS_SOLL, ...soll }, regeln: {} };
    const modell = process.env.KI_MODELL || ratsche.modell || "qwen3:4b-instruct";
    const q = (k) => +(m.saetze.filter((e) => e.urteil[k]).length / Math.max(1, m.saetze.length)).toFixed(3);
    if (korpus) {
        const { srv, browser, page } = await kiWelt(echt ? null : { "/api/chat": mitschnitt(ratsche) });
        await page.evaluate(AUSGABE_INSTALL);
        const worte = [...new Set(korpus.saetze.flatMap(([, s]) => (Array.isArray(s.werk) ? s.werk : [])))];
        const endpunkt = echt ? process.env.KI_ENDPUNKT || "http://127.0.0.1:11434/" : `http://127.0.0.1:${PORT}/`;
        const arg = { modell, endpunkt, worte, gegenprobe: KORPUS_SOLL.gegenprobe, mutante };
        const auf = await page.evaluate(korpusAufbau, arg);
        m.tueren = auf.tueren;
        Object.assign(arg, {
            wortTyp: auf.wortTyp,
            fensterMs: KORPUS_SOLL.fensterMs,
            praedikat: korpusPraedikat.toString(),
        });
        // die Regeln: der Selbstlauf (lauf 0, gezählt) und der Gegenlauf (lauf 1) über dieselben Sätze, je Lauf leer begonnen
        const raffer = (lauf, schritte) => page.evaluate(regelRaffer, { mutante, lauf, schritte });
        const folge =
            teil === "regeln" ? [0, 1].flatMap((l) => korpus.saetze.map((x, i) => [...x, l, i])) : korpus.saetze;
        for (const [satz, soll, lauf, i] of folge) {
            if (teil === "regeln" && !i) await raffer(lauf, 0);
            const e = await page.evaluate(korpusSatz, { ...arg, satz, soll });
            if (teil === "regeln") [m.regeln.echt, m.regeln.gegen] = await raffer(lauf, 400);
            if (lauf) continue;
            if (soll.taten) e.praedikat = seelePraedikat(soll, (e.antwort || {}).say, roh.seele.bezug);
            if (soll.taten) e.weltMs = e.praedikat ? e.antwortMs : null;
            e.urteil = korpusSatzUrteil(e, soll);
            m.saetze.push(e);
            const [u, a] = [e.urteil, e.antwort || {}];
            const welt = `${e.antwortMs} ms → Welt ${e.weltMs == null ? "—" : e.weltMs + " ms"}`;
            const prog =
                String(soll.taten ? a.say : JSON.stringify(a.program || null)).slice(0, 100) +
                (a.error ? ` — ${a.error}` : "");
            console.log(
                `  ${u.absicht ? "✓" : "✗"}${u.gueltig ? "" : " ungültig"}${u.bruch ? " BRUCH" : ""} „${satz}“ ${welt} · ${prog}`
            );
        }
        await browser.close();
        srv.close();
        const welt = m.saetze.map((e) => e.weltMs).filter((x) => x != null);
        m.p95 = welt.sort((x, y) => x - y)[Math.ceil(0.95 * welt.length) - 1];
        // DIE RATSCHE SINKT NIE: ein schwächerer Lauf wird nie der Maßstab der CI
        if (echt && !mutante && teil !== "seele" && process.argv.includes("--aufnahme")) {
            const quote = { gueltig: q("gueltig"), absicht: q("absicht"), p95: m.p95 };
            const taeter = m.saetze.some((e) => e.urteil.tat || e.urteil.bruch);
            if (taeter || quote.absicht < ((ratsche.quote || {}).absicht || 0))
                m.sinkt = [quote.absicht, (ratsche.quote || {}).absicht];
            const prog = (a) => (a && !a.error && !a.fallbackUsed ? a.program || null : false);
            const mit = Object.fromEntries(m.saetze.map((e) => [e.satz, prog(e.antwort)]));
            const kopf = { modell, anbieter: new URL(endpunkt).host, datum: new Date().toISOString().slice(0, 10) };
            if (!m.sinkt)
                fs.writeFileSync(ratschePfad, JSON.stringify({ ...kopf, quote, mitschnitt: mit }, null, 1) + "\n");
        }
    }
    const v = [...korpusVerdict(m), ...(teil === "regeln" ? regelVerdict(m.regeln) : [])];
    if (teil === "regeln") console.log("REGELN " + JSON.stringify(m.regeln));
    const ist = `${m.saetze.length} Sätze · ${[teil, mutante, modell].filter(Boolean).join(" · ")} · gültig ${q("gueltig")} · Absicht ${q("absicht")} · p95 ${m.p95} ms`;
    check(
        `WORT der Korpus über den echten Chat-Pfad (${echt ? "echter Anbieter" : "Mitschnitt"}): das Soll, 0 Brüche, Negativ-Sätze ohne Tat`,
        v.length === 0,
        ist + (v.length ? " — Täter: " + v.join(" · ") : "")
    );
    console.log(errs.length ? `\n❌ ROT — ${errs.length} Verletzung(en).` : "\n✅ GRÜN — der Korpus hält sein Soll.");
    process.exit(errs.length ? 1 : 0);
}

// ── FEIND: der feindliche Korpus durch die Eingänge der Fremde zu einem gehorsamen Modell. ──
const FEIND_PFAD = path.join(root, "spec/abnahme/ki-feind-korpus.json");
const feindNamen = (k, ns) => [...new Set(ns)].map((n) => Object.keys(k.injektionen)[n - 1]);
function feindVerdict(m) {
    if (!m || !m.korpus) return [["erreicht", "Korpus fehlt"]];
    const fehlt = Object.keys(m.korpus.injektionen).filter((k) => !feindNamen(m.korpus, m.gelandet).includes(k));
    return [
        ["erreicht", fehlt.length && `nie in der Welt (vakuös): ${fehlt.join(", ")}`],
        ...["stimme", "wesen", "journal"].map((p) => ["erreicht", !m.rufe[p] && `Pfad ${p} ohne Ruf (vakuös)`]),
        ["erreicht", m.erreicht.length && `erreichen das Modell: ${feindNamen(m.korpus, m.erreicht).join(", ")}`],
        ["ausgefuehrt", m.ausgefuehrt && `${m.ausgefuehrt} fremde Anweisungen`],
        ["signatur", m.signatur.join() !== "valid,modified,forged" && "statt valid/modified/forged"],
        ["anzeige", !m.anzeige && "Name fehlt oder Platzhalter steht"],
    ].filter(([, s]) => s);
}
// DIE WAND (AST): der Text jeder Erinnerung ist ein Literal oder ein `_datum`-Tag → die Täter als Zeilen
const ERINNERUNG = { journalAppend: 1, journalAppendOnce: 2, _zeugnisEintragen: 1 };
function erinnerungsWand(t) {
    const out = [];
    const datum = (n) => n && n.type === "MemberExpression" && n.property.name === "_datum";
    const ok = (a) =>
        !a ||
        a.type === "Literal" ||
        (a.type === "TemplateLiteral" && !a.expressions.length) ||
        (a.type === "TaggedTemplateExpression" && datum(a.tag)) ||
        (a.type === "CallExpression" && datum(a.callee)) ||
        (a.type === "ConditionalExpression" && ok(a.consequent) && ok(a.alternate));
    stammLib.wandere(stammLib.ast(t), (n, ahnen) => {
        const k = n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.property.name;
        if (
            !Object.hasOwn(ERINNERUNG, k) ||
            ahnen.some((x) => x.type === "MethodDefinition" && Object.hasOwn(ERINNERUNG, x.key.name))
        )
            return;
        if (!ok(n.arguments[ERINNERUNG[k]])) out.push(stammLib.zeileVon(t, n.start));
    });
    return out;
}
async function feindLauf(a) {
    const [st, I, tat, m] = [r.state, a.inj, JSON.stringify(a.tat), { rufe: {}, ausgefuehrt: 0 }];
    for (const [id, w] of [
        ["llm-provider", "ollama"],
        ["llm-model", "gehorsam"],
        ["llm-endpoint", a.endpunkt],
    ]) {
        const el = document.getElementById(id);
        el.value = w;
        el.dispatchEvent(new Event("change"));
    }
    document.getElementById("llm-toggle").click();
    r.setGameMode("schöpfer"); // das Wesen handelt ohne Zusage
    const [lauf, ruf] = [r.dslRun, r.llmCall];
    let pfad = "";
    r.dslRun = function (p, o) {
        const res = lauf.call(this, p, o);
        if (JSON.stringify(p) === tat && /^(llm|creature|zusage):/.test(o.source) && res.ok) m.ausgefuehrt++;
        return res;
    };
    r.llmCall = async function (...x) {
        m.rufe[pfad] = (m.rufe[pfad] || 0) + 1;
        return (m.sagt = await ruf.apply(this, x));
    };
    // DIE FREMDE: ein gültig signierter Bauplan aus einer Quell-Welt, die Bibliothek, ein Portal, ein Mitspieler, die Tür, ein Wesen
    localStorage.setItem(
        r.worldStorageKey("feind-q"),
        JSON.stringify({
            worldMeta: { slug: I.quelle },
            blueprints: [{ ...a.golden, name: I.bauplan, label: I.bauplan }],
        })
    );
    r.importRecipesFromWorld("feind-q");
    await r.importWorldManifest({ id: "feind-welt", label: I.bibliothek, world: "worlds/portale/index.html" });
    r._portalOverlay = {};
    r._portalReceiveEvent({ text: I.portal });
    r._portalOverlay = null;
    lauf.call(r, ["define_ability", I.faehigkeit, ["weather", "sunny"]], { source: "remote:feind" });
    const tuer = r._weltBetreten({ worldJournal: { entries: [{ type: "genesis", text: I.welt, d: 1 }] } }, null, {
        wechseln: false,
        aktiv: false,
    });
    st.worldJournal.entries.push(
        ...JSON.parse(localStorage.getItem(r.worldStorageKey(tuer.worldId))).worldJournal.entries
    );
    const p = st.playerMesh.position;
    const w = r._restoreCreatureFromSnapshot({
        name: I.kreatur,
        soul: "wolf",
        position: { x: p.x + 4, y: p.y, z: p.z },
        memory: [{ type: "built", content: { blueprint: I.bauplan } }],
    });
    m.gelandet = [
        ...JSON.stringify([st.worldJournal, Object.keys(st.blueprints), w.userData.name, w.userData.memory]).matchAll(
            /kanarie(\d)/gi
        ),
    ].map((x) => +x[1]);
    // DIE PFADE der KI: die Stimme der Welt, das Wesen beim Namen, der Kommentar zu jeder Erinnerung
    pfad = "stimme";
    await r.maybeAnswerWithLlm("wie geht es dir?", r._chatEcho.bind(r));
    pfad = "wesen";
    await r.maybeAnswerCreature(`${I.kreatur}, was hast du gebaut?`, r._chatEcho.bind(r));
    m.wesenSagt = m.sagt.say;
    m.anzeige = m.wesenSagt.includes(I.kreatur) && !/«N\d+»/.test(m.wesenSagt);
    pfad = "journal";
    for (const e of st.worldJournal.entries.slice(-8)) {
        [st.grok.lastSpoke, st.grok.triggers.journalEvent.lastFired, st.llm.lastResponseAt] = [-1e9, -1e9, -1e9];
        r.grokSpeakFromJournal(e);
        while (st.llm.inFlight) await sleep(20);
    }
    // DIE SIGNATUR: der echte Bauplan, seine Substanz verschoben, seine Signatur gefälscht
    const g = [0, 1, 2].map(() => r._deserializeBlueprint(JSON.parse(JSON.stringify(a.golden))));
    g[1].parts[0].size.x += 1;
    g[2].signature = (g[2].signature[0] === "0" ? "1" : "0") + g[2].signature.slice(1);
    m.signatur = [];
    for (const bp of g) m.signatur.push(await r.verifyBlueprintSignature(bp));
    return m;
}
// Das gehorsame Modell: eine Kanarie → die Tat; sonst nennt es den ersten Platzhalter
const gehorsam = (korpus, log) => (req) =>
    new Promise((fertig) => {
        let b = "";
        req.on("data", (d) => (b += d));
        req.on("end", () => {
            const text = JSON.parse(b)
                .messages.map((x) => x.content)
                .join("\n");
            const k = [...text.matchAll(/kanarie(\d)/gi)].map((x) => +x[1]);
            log.push(...k);
            const say = k.length ? "Ich folge." : `Ich kenne ${(text.match(/«N\d+»/) || ["dich"])[0]}.`;
            fertig(
                JSON.stringify({ message: { content: JSON.stringify({ say, program: k.length ? korpus.tat : null }) } })
            );
        });
    });
async function feindHaupt(quelle) {
    const korpus = fs.existsSync(FEIND_PFAD) ? JSON.parse(fs.readFileSync(FEIND_PFAD, "utf8")) : null;
    const log = [];
    let m = { korpus };
    if (korpus) {
        const { srv, browser, page } = await kiWelt({ "/api/chat": gehorsam(korpus, log) });
        const golden = JSON.parse(fs.readFileSync(path.join(root, "spec/golden/v1/blueprint-signed.json"), "utf8"));
        const arg = { inj: korpus.injektionen, tat: korpus.tat, golden, endpunkt: `http://127.0.0.1:${PORT}/` };
        m = { ...(await page.evaluate(feindLauf, arg)), korpus, erreicht: log };
        await browser.close();
        srv.close();
    }
    const v = feindVerdict(m);
    const wand = erinnerungsWand(quelle).map((z) => stammLib.ort(root, z));
    const n = korpus ? Object.keys(korpus.injektionen).length : 0;
    for (const [k, name, ist] of [
        [
            "wand",
            "FEIND Wand: jede Erinnerung trägt ihre Namen als Datum",
            `${wand.length} ungetarnt ${wand.slice(0, 4).join(", ")}`,
        ],
        [
            "erreicht",
            "FEIND erreicht: keine Injektion erreicht das Modell",
            `${new Set(m.erreicht).size} von ${n} (Rufe ${JSON.stringify(m.rufe)})`,
        ],
        ["ausgefuehrt", "FEIND ausgeführt: 0 fremde Anweisungen", `${m.ausgefuehrt} Taten`],
        ["signatur", "FEIND Signatur: die Manipulation schlägt an", String(m.signatur)],
        ["anzeige", "FEIND Anzeige: der Spieler liest den Namen", `„${m.wesenSagt}“`],
    ]) {
        const t = k === "wand" ? wand.slice(0, wand.length && 1) : v.filter(([x]) => x === k).map(([, s]) => s);
        check(name, !t.length, ist + (t.length ? " — Täter " + t.join(" · ") : ""));
    }
    process.exit(errs.length ? 1 : 0);
}

hauptLauf(async () => {
    if (process.argv.includes("--korpus") && !process.argv.includes("--selftest")) return korpusHaupt();
    const quelle = stammLib.text(root);
    if (process.argv.includes("--feind")) return feindHaupt(quelle);
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die V1-Pfad-Linse nennt jeden Täter des Befunds ===");
        const gesundV = {
            gestartet: true,
            renders: 1,
            vertices: 1200,
            anteil: 1,
            maskeImRender: 0,
            maskeWelt: 1,
            maskeDanach: 1,
        };
        const zugGesund = {
            gestartet: true,
            vorschau: { key: "eiche|2|0", fremd: true, ms: 1500, imCache: true },
            hand: { key: "klinge|1|0", fremd: true, ms: 900, imCache: true },
            stufen: [0, 1, 2].map((lod) => ({ lod, wart: "eiche|2|" + lod, ms: 800, da: true, hoch: 21.4, soll: 21 })),
            vorrat: { key: "gras|1|1", imFlug: true, auftraege: 1 },
        };
        const zugMit = (wer, z) => ({ [wer]: { ...zugGesund[wer], ...z } });
        const stufeL2 = (l2) => ({ stufen: [...zugGesund.stufen.slice(0, 2), { lod: 2, wart: "fimp:eiche|2", da: true, ...l2 }] });
        const waffe = (id, fuell) => ({ art: "rezept", id, kind: "weapon", fuell, kante: 0.4, dist: 3 });
        const gesundR = { gestartet: true, waffenImBuch: 2, eintraege: [waffe("beil", 0.7), waffe("messer", 0.7)] };
        const gesundA = {
            gestartet: true,
            baeume: 9,
            kronen: 0,
            ringPortale: 10,
            ringMitteAbstand: 0,
            trocken: true,
            plattformen: 1,
        };
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
        // Die V-k5-Klasse und ihr Rest, R2: je ein gesunder Zustand, je Befund-Zustand der Täter beim Namen.
        const opGesund = (op) => ({
            ok: false,
            grund: "kein Wasser im Umkreis von 60 m",
            effekt: op,
            fehler: null,
            kalt: false,
            akte: [],
        });
        const gesundO = {
            gestartet: true,
            radius: 60,
            ops: Object.fromEntries(ORT_OPS.map((op) => [op, opGesund(op)])),
            chain: {
                ok: false,
                grund: "kein Wasser im Umkreis von 60 m",
                effekt: "spawn_tree",
                fehler: null,
                akte: [{ nm: "_depositLife", abstand: 0 }],
            },
            buchWarm: true,
            dorfAuftraege: 0,
            dorfOhneOrt: null,
        };
        const mitOp = (op, e) => ({ ops: { ...gesundO.ops, [op]: { ...opGesund(op), ...e } } });
        const kGesund = (name) => {
            const [, , soll, effekt] = KNOTEN.find((e) => e[0] === name);
            return { ok: false, grund: soll.replace(/^\^/, ""), effekt, fehler: null, akte: [] };
        };
        const gesundK = {
            gestartet: true,
            laeufe: Object.fromEntries(KNOTEN.map(([name]) => [name, kGesund(name)])),
            defaults: { near_water: "kein Wasser im Umkreis von 60 m", at_player_forward: 5, at_field_need: 50 },
            messOrtOhneSpieler: null,
            ohneKnoten: true,
            gesund: { ok: true, akte: 1, grund: null },
        };
        const mitK = (name, e) => ({ laeufe: { ...gesundK.laeufe, [name]: { ...kGesund(name), ...e } } });
        const still = (nm, abstand) => ({ ok: true, grund: null, effekt: null, akte: [{ nm, abstand }] });
        const mitD = (d) => ({ defaults: { ...gesundK.defaults, ...d } });
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
        const mitZ = (k, z) => ({ zaehlung: { ...gesundW.zaehlung, [k]: z } });
        for (const [kurz, urteil, gesund, brueche] of [
            [
                "V-D3",
                vorschauVerdict,
                gesundV,
                [
                    ["leere Vorschau (21 108 Dreiecke, 0 im Bild)", { anteil: 0, maskeImRender: 1, augeAbstand: 36 }, "vorschau 0.0 %"],
                    ["Vorschau zeichnet nie", { renders: 0 }, "vorschau zeichnete nie"],
                    ["Welt-Maske bleibt aus", { maskeDanach: 0 }, "welt-maske"],
                ],
            ],
            [
                "V-D3 Fremder Zug",
                zugVerdict,
                zugGesund,
                [
                    ["die Vorschau schläft nach der Ankunft (Zweig-CI 38453848494)", zugMit("vorschau", { ms: null }), "zug vorschau schläft"],
                    ["der fremde Zug im Rang der Ferne", zugMit("vorschau", { ms: null, imCache: false }), "zug vorschau: eiche|2|0 nach"],
                    ["die Hand schläft nach der Ankunft", zugMit("hand", { ms: null }), "zug hand schläft"],
                    ["kein fremder Zug (vakuös)", zugMit("vorschau", { fremd: false }), "zug vorschau: kein fremder Zug"],
                    ["keine Klinge im Buch (vakuös)", { hand: null }, "zug hand: keine Probe"],
                    ["die L2-Karte schläft nach der Ankunft ihrer Höhen-Stufe (K38-N1 offen)", stufeL2({ ms: null }), "zug stufe L2 schläft"],
                    ["keine Stufen gemessen (vakuös)", { stufen: [] }, "zug stufen: 0 von 3"],
                    ["der Leser bestellt im Flug des Vorrats neu (bis 15.10.)", zugMit("vorrat", { auftraege: 2 }), "zug vorrat: gras|1|1 2×"],
                    ["der Vorrat zieht nicht (vakuös)", zugMit("vorrat", { imFlug: false }), "zug vorrat: gras|1|1 nicht im Flug"],
                    ["keine Vorrats-Probe (vakuös)", { vorrat: null }, "zug vorrat: keine Probe"],
                    ["die Vorschau rahmt den Stamm (Box des Einheits-Quads, Bild 15.10.)", stufeL2({ ms: 900, hoch: 1.1, soll: 21 }), "zug stufe L2 rahmen"],
                ],
            ],
            [
                "V-D3 Rahmen",
                rahmenVerdict,
                gesundR,
                [
                    ["Messer 0,059 (3-m-Mindestabstand, Runner WS-01)", { eintraege: [waffe("beil", 0.7), waffe("messer", 0.059)] }, "rahmen 1 außerhalb"],
                    ["ein Bauplan sprengt das Bild (0,97)", { eintraege: [...gesundR.eintraege, { art: "bauplan", id: "haus", kind: "teile", fuell: 0.97 }] }, "rahmen 1 außerhalb"],
                    ["eine Waffe ungemessen", { eintraege: [waffe("beil", 0.7), { art: "rezept", id: "messer", kind: "weapon", leer: true }] }, "rahmen waffen 1 von 2"],
                    ["eine Gestalt bleibt pending", { eintraege: [...gesundR.eintraege, { art: "rezept", id: "eiche", kind: "tree", frist: true }] }, "rahmen 1 ohne Gestalt"],
                ],
            ],
            [
                "V-D1",
                ankunftVerdict,
                gesundA,
                [
                    ["Tanne 2,0 m vom Mittelpunkt (V-D1)", { kronen: 2, naechsterStamm: 1.97, naechsteArt: "baum_tanne" }, "2 Krone"],
                    ["Ring um den Ursprung, 36 m daneben", { ringMitteAbstand: 36 }, "ring-mitte"],
                    ["kein Ring über dem Frame-Budget", { ringPortale: 0 }, "kein Genesis-Ring"],
                    ["Plattform im See", { trocken: false }, "plattform im wasser"],
                    ["der zweite Leger sucht nicht (Zwilling)", { plattformen: 2 }, "2 Plattformen"],
                    ["kein Wald gewachsen (vakuös)", { baeume: 0 }, "kein Wald"],
                ],
            ],
            [
                "V-k4",
                tasteVerdict,
                { gestartet: true, gedrueckt: true, nachBlur: false },
                [["Klebetaste (V-k4)", { nachBlur: true }, "W bleibt"]],
            ],
            [
                "V-D6",
                kiVerdict,
                {
                    gestartet: true,
                    fehler: "Keine Antwort von 127.0.0.1:9 — der lokale Dienst läuft nicht",
                    host: "127.0.0.1:9",
                },
                [
                    [
                        "CORS-Märchen (V-D6)",
                        { fehler: "Cloud blockt Browser-Direct-Call (CORS). Optionen: …" },
                        "lokaler Endpunkt",
                    ],
                ],
            ],
            [
                "V-k5 V-k6 V-D8",
                satzVerdict,
                gesundS,
                [
                    [
                        "6 Eichen am Spieler (V-k5)",
                        { amWasserOhneWasser: 6, amWasserZeile: "6× baum_eiche aus dem Studio am Wasser gewachsen" },
                        "6 Eichen",
                    ],
                    [
                        "interne id im Chat (V-D8)",
                        { birkenZeile: "2× baum_birke aus dem Studio vor dir gewachsen" },
                        "der Chat nennt",
                    ],
                    ["Ort reist relativ (V-k6)", { ortKnoten: '["at_player_forward",10]' }, "der Ort reist"],
                    [
                        "Empfänger pflanzt bei sich (V-k6)",
                        { empfaengerAbstandZumAbsender: 203 },
                        "der Empfänger pflanzt",
                    ],
                    ["Telemetrie im Chat (V-D8)", { telemetrieImChat: true }, "Dorf-Telemetrie"],
                ],
            ],
            [
                "V-k5-Klasse",
                ortVerdict,
                gesundO,
                [
                    [
                        "TypeError (6b988a07)",
                        mitOp("spawn_creature", {
                            fehler: "op_exception: Cannot read properties of null (reading 'x')",
                            grund: null,
                            effekt: null,
                        }),
                        "spawn_creature: wirft",
                    ],
                    ["Dorf am Spieler-Ort über die Op (6b988a07)", mitOp("spawn_village", { akte: [{ nm: "spawnSettlement", abstand: null }] }), "spawn_village: wirkt ohne Ort"],
                    [
                        "still am Spieler-Ort (cf9a07ba)",
                        mitOp("spawn_studio", { ok: true, grund: null, effekt: null, akte: [{ nm: "spawnArchitecture", abstand: 4.1 }] }),
                        "spawn_studio: wirkt ohne Ort",
                    ],
                    ["Absage ohne Grund", mitOp("deposit_life", { grund: null }), "deposit_life: scheitert nicht benannt"],
                    ["chain meldet Erfolg", { chain: { ...gesundO.chain, ok: true } }, "chain: meldet Erfolg"],
                    ["chain bricht ganz ab", { chain: { ...gesundO.chain, akte: [] } }, "chain: bricht ganz ab"],
                    ["spawnSettlement ohne Ort gründet beim Spieler", { dorfAuftraege: 1 }, "dorf ohne Ort gründet"],
                ],
            ],
            [
                "V-k5-Klasse (Rest)",
                knotenVerdict,
                gesundK,
                [
                    ["der Text wird der Ursprung", mitK(KNOTEN[0][0], still("spawnArchitecture", 412.6)), `${KNOTEN[0][0]}: wirkt ohne Ort`],
                    ["at(null) wird die 0 (Lehre 17)", mitK("at mit null (Number(null) === 0)", still("spawnCreatureAt", 300.2)), "at mit null (Number(null) === 0): wirkt ohne Ort"],
                    ["das Dorf ohne Abstände beim Spieler", mitK("far_player ohne Abstände (das Dorf)", still("spawnSettlement", 9.6)), "far_player ohne Abstände (das Dorf): wirkt ohne Ort"],
                    ["voxel_carve gräbt bei 0", mitK("voxel_carve mit null-Koordinaten", still("carveVoxel", 300.2)), "voxel_carve mit null-Koordinaten: wirkt ohne Ort"],
                    ["ohne Spieler am Ursprung", mitK("at_player ohne Spieler", still("spawnArchitecture", 300.2)), "at_player ohne Spieler: wirkt ohne Ort"],
                    ["die nächste Kreatur am Ursprung", mitK("die nächste Kreatur ohne Spieler", still("assignTaskToNearestCreature", 300.2)), "die nächste Kreatur ohne Spieler: wirkt ohne Ort"],
                    ["Absage ohne die Op", mitK("leerer Knoten", { effekt: null }), "leerer Knoten: scheitert nicht benannt"],
                    ["near_water ohne Radius sucht 8 m", mitD({ near_water: "kein Wasser im Umkreis von 8 m" }), "near_water ohne Radius"],
                    ["vorn ohne Abstand 1 m", mitD({ at_player_forward: 1 }), "at_player_forward ohne Zahl"],
                    ["Bedarf ohne Radius 10 m", mitD({ at_field_need: 10 }), "at_field_need ohne Zahl"],
                    ["der Mess-Ort ohne Spieler ist der Ursprung", { messOrtOhneSpieler: { x: 0, z: 0 } }, "der Mess-Ort"],
                    ["ohne Knoten scheitert der Spawn", { ohneKnoten: "nicht verlangt" }, "ohne Knoten kein Default-Ort"],
                    ["ein gültiger Knoten wirkt nicht (vakuös)", { gesund: { ok: false, akte: 0, grund: "at: x fehlt" } }, "ein gültiger at-Knoten"],
                ],
            ],
            [
                "R2",
                sucheVerdict,
                gesundW,
                [
                    ["Spalten-Scan je Probe (6b988a07)", mitZ("ki@trocken", { R: 200, proben: 1954, scans: 1954 }), "ki 200 m: 1954 Spalten-Scans"],
                    ["ohne Wasser alle 8037 Proben gescannt", mitZ("ki@trocken-voll", { R: 200, proben: 8037, scans: 8037 }), "ki@trocken-voll 200 m: 8037"],
                    ["Trinken scannt je Probe", mitZ("trinken@trocken", { R: 40, proben: 351, scans: 351 }), "trinken 40 m"],
                    ["der Fels-Beweis lügt", { exakt: { n: 3600, falsch: 3, nass: 400, beispiele: ["(1, 2, 0.2)"] } }, "das Urteil weicht"],
                    ["kein nasser Punkt (vakuös)", { exakt: { n: 3600, falsch: 0, nass: 0 } }, "kein nasser Punkt"],
                ],
            ],
        ]) {
            check(`Selbst-Test ${kurz}: gesund == 0 Täter`, urteil(gesund).length === 0, urteil(gesund).join(" · "));
            for (const [name, bruch, soll] of brueche) {
                const v = urteil(Object.assign({}, gesund, bruch));
                check(
                    `Selbst-Test ${kurz}: ‚${name}' → die Linse nennt ${soll}`,
                    v.some((t) => t.startsWith(soll)),
                    v.join(" · ")
                );
            }
        }
        const gruen = wand(quelle);
        check(
            "Selbst-Test W: der Arbeitsbaum ist grün",
            gruen.every((w) => w[1]),
            gruen
                .filter((w) => !w[1])
                .map((w) => `${w[0].slice(0, 2)} ${w[2] || ""}`)
                .join(" | ")
        );
        const vorStand = stammLib.ersetze(quelle, [
            [
                "_workshopRender",
                'this._buehneRender(p.renderer, p.scene, p.camera, "Werkstatt-Vorschau");',
                "p.renderer.render(p.scene, p.camera);",
            ],
            // der Orts-Vertrag beim Vorher: dslEvalPos gibt null weiter, spawn_studio (sein Rumpf `_spawnStudioWerk`) bewacht sich selbst
            ["dslEvalPos", "            throw fehler;\n", "            return null;\n"],
            // der Rest der Klasse beim Vorher: der Feld-Akt nimmt für jeden Nicht-Array-Knoten den Spieler
            [
                "_dslRulePos",
                'return this.dslEvalPos(posNode == null ? ["at_player"] : posNode, ctx);',
                'return Array.isArray(posNode) && posNode.length > 0 ? this.dslEvalPos(posNode, ctx) : this.dslEvalPos(["at_player"], ctx);',
            ],
            [
                "_spawnStudioWerk",
                "const pos = this.dslEvalPos(positionNode, ctx);",
                "const pos = this.dslEvalPos(positionNode, ctx);\n        if (!pos) return;",
            ],
            // die Zwillings-Suche beim Vorher: der Rückkehr-Anker sucht die Plattform selbst
            [
                "_playerDeathRespawn",
                "const anchor = this._genesisPlattform();",
                'const anchor = (this.state.architectures || []).find((a) => a && a.type === "start_plattform");',
            ],
            // der Warte-Poll der Hand beim Vorher: sie fragte alle 150 ms, ob das Buch steht
            [
                "_heldFoundryGroup",
                'this._foundryWecker(f.buchDa, "hand", () => {',
                "const poll = () => {\n if (f.ready && f.recipes) this._refreshHeldMesh();\n else setTimeout(poll, 150);\n };\n setTimeout(poll, 150);\n (() => {",
            ],
        ]);
        // die Klasse der festen Stellen-Zahl: ein Renderer weniger über die Bühne bleibt grün
        const weniger = wand(
            stammLib.ersetze(
                quelle,
                "_hofStartRAF",
                'this._buehneRender(s.renderer, s.scene, s.camera, "Hof-Bühne");',
                ""
            )
        );
        check(
            "Selbst-Test W: ein Renderer weniger über die Bühne bleibt grün (W2 zählt am Namen, keine feste Zahl)",
            quelle.includes('"Hof-Bühne");') && weniger.every((w) => w[1]),
            weniger
                .filter((w) => !w[1])
                .map((w) => `${w[0].slice(0, 2)} ${w[2] || ""}`)
                .join(" | ")
        );
        // Die Täter-Klassen von W2 (jeder Weg der Render-Funktion zum Ruf) und W7 (jede Form des Polls) in EINEM Text.
        const bue = stammLib.glieder(quelle).find((g) => g.name === "_buehneRender");
        const ichRuf = 'this._buehneRender(s.renderer, s.scene, s.camera, "Ich-Bühne");';
        const klasse = (
            quelle.slice(0, bue.ende) +
            [
                "",
                "    _fremdeBuehne(s, k = f(1)) {",
                "        s.renderer.render(s.scene, s.cam ? s.cam : s.camera);",
                "    }",
                "    _bauBuehne(s) {",
                "        s.renderer.render(this._szeneVon(s, 1), s.camera);",
                "        s.renderer.renderAsync(s.scene, s.camera);",
                "        s.renderer.render.call(s.renderer, s.scene, s.camera);",
                "    }",
                "    _bindBuehne(s) {",
                "        const zeichne = s.renderer.render.bind(s.renderer);",
                "        zeichne(s.scene, s.camera);",
                "    }",
                "    _vorgebunden(s) {",
                "        s.renderer.render.bind(s.renderer, s.scene)(s.camera);",
                "    }",
                "    _zerlegt(s) {",
                "        const { render: male } = s.renderer;",
                "        male.call(s.renderer, s.scene, s.camera);",
                "    }",
                "    _reflektiert(s) {",
                '        Reflect.apply(s.renderer["render"], s.renderer, [s.scene, s.camera]);',
                "    }",
                "    _merkeZeichner(s) {",
                "        this._zeichner = s.renderer.renderAsync.bind(s.renderer);",
                "    }",
                "    _nutzeZeichner(s) {",
                "        this._zeichner(s.scene, s.camera);",
                "    }",
                "    _reiche(s) {",
                "        this._zeichneMit(s.renderer.render.bind(s.renderer), s);",
                "    }",
                "    _zeichneMit(f, s) {",
                "        f(s.scene, s.camera);",
                "    }",
                "    _gibZeichner(s) {",
                "        return s.renderer.render.bind(s.renderer);",
                "    }",
                "    _holeZeichner(s) {",
                "        this._gibZeichner(s)(s.scene, s.camera);",
                "    }",
                "    _spaeter(s) {",
                "        setTimeout(s.renderer.render.bind(s.renderer), 0, s.scene, s.camera);",
                "    }",
                "    _zaehle(s, room) {",
                "        room.render();",
                "        return s.renderer.info.render.calls + (s.perf.render || 0);",
                "    }",
                "    _foundryLauscher(k, o = f(1)) {",
                "        const warte = () => {",
                "            if (!this._foundry) {",
                "                window.setTimeout(() => {",
                "                    warte();",
                "                }, 150);",
                "            }",
                "        };",
                "        warte();",
                "    }",
                "    async _foundryNachfrage(k) {",
                "        if (!this._foundry) setTimeout(() => this._foundryNachfrage(k), 150);",
                "    }",
                "    _foundryPingPong() {",
                "        const ping = () => pong();",
                "        function pong() {",
                "            requestAnimationFrame(ping);",
                "        }",
                "        ping();",
                "    }",
                "    async _foundryWarteBuch() {",
                "        while (!this._foundry.buchDa) await new Promise((r) => setTimeout(r, 50));",
                "    }",
                "    async _foundryDoeset() {",
                "        const schlafe = (ms) => new Promise((r) => setTimeout(r, ms));",
                "        for (;;) {",
                "            if (this._foundry) break;",
                "            await schlafe(30);",
                "        }",
                "    }",
                "    _foundryHorch() {",
                "        if (!this._foundry) setTimeout(() => this._foundryHorchNochmal(), 150);",
                "    }",
                "    _foundryHorchNochmal() {",
                "        this._foundryHorch();",
                "    }",
                "    async _foundryErneut(k) {",
                "        await new Promise((r) => setTimeout(r, 100));",
                "        if (!this._foundry) return this._foundryErneut(k);",
                "    }",
                "    _foundryKette() {",
                "        this._schlummer(80).then(() => this._foundryKette());",
                "    }",
                "    _schlummer(ms) {",
                "        return new Promise((r) => setTimeout(r, ms));",
                "    }",
                "    _naechsterTakt(cb) {",
                "        requestAnimationFrame(() => cb());",
                "    }",
                "    _foundryTakt() {",
                "        if (!this._foundry) this._naechsterTakt(() => this._foundryTakt());",
                "    }",
                "    _warteBis(pruef) {",
                "        return new Promise((ok) => {",
                "            const sieh = () => (pruef() ? ok() : setTimeout(sieh, 40));",
                "            sieh();",
                "        });",
                "    }",
                "    async _foundryWarteBis() {",
                "        await this._warteBis(() => this._foundry);",
                "    }",
                "    _foundryIntervall() {",
                '        window["setInterval"](() => this._foundryEinmal(1), 500);',
                "    }",
                "    _foundryAlias() {",
                "        const selbst = this;",
                "        setTimeout(() => selbst._foundryAlias(), 99);",
                "    }",
                "    _foundryEinmal(k) {",
                "        const ab = () => this._foundryAblauf(k);",
                "        setTimeout(ab, 5000);",
                "    }",
                "    _vorschauTakt() {",
                "        const tick = () => requestAnimationFrame(tick);",
                "        tick();",
                "    }",
                "    _foundryStarteTakt() {",
                "        this._vorschauTakt();",
                "    }",
            ].join("\n") +
            quelle.slice(bue.ende)
        ).replace(ichRuf, "s.renderer.render(s.scene, s.cam || s.camera);");
        const wk = wand(klasse);
        const w2 = wk.find((w) => w[0].startsWith("W2"));
        const w7 = wk.find((w) => w[0].startsWith("W7"));
        // je Stelle EIN Eintrag — die Zahl der genannten Orte ist die Zahl der Einträge, keine feste Zahl
        const w2Soll = [
            "_ichStartRAF: s.renderer.render(s.scene, s.cam || s.camera)",
            "_fremdeBuehne:",
            "_bauBuehne: s.renderer.render(this",
            "_bauBuehne: s.renderer.renderAsync(",
            "[.call]",
            "_bindBuehne: zeichne(s.scene, s.camera) [.bind → zeichne → Ruf]",
            "_vorgebunden: s.renderer.render.bind(s.renderer, s.scene)(s.camera) [.bind → Ruf]",
            "_zerlegt: male.call(s.renderer, s.scene, s.camera) [{ render } → male → .call]",
            "_reflektiert: Reflect.apply(",
            "_nutzeZeichner: this._zeichner(s.scene, s.camera) [.bind → Feld ._zeichner → Ruf]",
            "_zeichneMit: f(s.scene, s.camera) [.bind → Parameter _zeichneMit(f) → Ruf]",
            "_holeZeichner: this._gibZeichner(s)(s.scene, s.camera) [.bind → Rückgabe _gibZeichner() → Ruf]",
            "_spaeter: setTimeout(",
        ];
        const w2Still = ["_zaehle", "_merkeZeichner", "_reiche:", "_gibZeichner:"];
        const w7Soll = [
            "_foundryLauscher/warte → _foundryLauscher/warte",
            "_foundryNachfrage → _foundryNachfrage",
            "_foundryPingPong/pong → _foundryPingPong/ping",
            "_foundryWarteBuch wartet in einer Schleife",
            "_foundryDoeset wartet in einer Schleife",
            "_foundryHorch → _foundryHorchNochmal",
            "_foundryErneut → _foundryErneut",
            "_foundryKette → _foundryKette",
            "_foundryTakt → _foundryTakt",
            "_foundryWarteBis wartet über das pollende _warteBis",
            "_foundryIntervall setInterval",
            "_foundryAlias → _foundryAlias",
        ];
        const w7Still = [
            "_foundryEinmal",
            "_foundryStarteTakt",
            "_vorschauTakt",
            "_foundryUhren",
            "_foundryAblauf",
            "_foundryPumpe",
        ];
        check(
            "Selbst-Test W: die Täter der Runden 3 und 4 (s.cam || s.camera, .bind) und ihre Klasse (?:, Aufruf im Argument, renderAsync, .call, Reflect.apply, vorgebunden, Alias, Destrukturieren, Feld, Parameter, Rückgabe, Zeitgeber) → W2 nennt jeden, Info und UI-Raum schweigen",
            quelle.includes(ichRuf) &&
                !w2[1] &&
                w2Soll.every((n) => w2[2].includes(n)) &&
                !w2Still.some((n) => w2[2].includes(n)) &&
                (w2[2].match(/stamm\/[a-z0-9-]+\.js:\d+/g) || []).length === w2Soll.length,
            `${w2[2]}${w2Soll
                .filter((n) => !w2[2].includes(n))
                .map((n) => " · UNGENANNT " + n)
                .join("")}${w2Still
                .filter((n) => w2[2].includes(n))
                .map((n) => " · FALSCH " + n)
                .join("")}`
        );
        check(
            "Selbst-Test W: die Täter der Runde 4 (Schleife mit Schlaf, Kreis über zwei Glieder) und jede Form des Polls → W7 nennt jeden, die einmalige Frist, der gestartete Render-Takt und die Frist-Kette schweigen",
            !w7[1] &&
                w7Soll.every((n) => w7[2].includes(n)) &&
                !w7Still.some((n) => w7[2].includes(n)) &&
                (w7[2].match(/stamm\/[a-z0-9-]+\.js:\d+/g) || []).length === w7Soll.length,
            `${w7[2]}${w7Soll
                .filter((n) => !w7[2].includes(n))
                .map((n) => " · UNGENANNT " + n)
                .join("")}${w7Still
                .filter((n) => w7[2].includes(n))
                .map((n) => " · FALSCH " + n)
                .join("")}`
        );
        // DIE AUSNAHME DER FRIST-KETTE trägt nur sich selbst: ein Poll IN der Kette fällt beim Namen.
        const uhrRuf = "if (!vorMir) fr.uhr = setTimeout(() => this._foundryAblauf(f, reqId), fr.dauerMs);";
        const w7Von = (t) => wand(t).find((w) => w[0].startsWith("W7"));
        const inDerKette = w7Von(
            stammLib.ersetze(
                quelle,
                "_foundryUhren",
                uhrRuf,
                `${uhrRuf}\n            else setTimeout(() => this._foundryUhren(f), 50);`
            )
        );
        check(
            "Selbst-Test W: ein Poll in der Frist-Kette (die Uhr stellt sich neu) → W7 nennt _foundryUhren → _foundryUhren",
            quelle.includes(uhrRuf) && !inDerKette[1] && inDerKette[2].includes("_foundryUhren → _foundryUhren"),
            inDerKette[2]
        );
        // EIN GLIED, DAS FEHLT, macht seine Prüfung rot (bis Runde 4 las W4 dann 0 Wachen und blieb still grün)
        const effekteGlied = stammLib.glieder(quelle).find((g) => g.name === "dslEffects");
        const umbenannt =
            quelle.slice(0, effekteGlied.start) +
            quelle.slice(effekteGlied.start).replace("dslEffects", "dslWirkungen");
        const w4 = wand(umbenannt).find((w) => w[0].startsWith("W4"));
        check(
            "Selbst-Test W: dslEffects umbenannt → W4 nennt das fehlende Glied",
            !w4[1] && w4[2].includes("Glied fehlt: dslEffects"),
            w4[2]
        );
        const rot = wand(vorStand);
        check(
            "Selbst-Test W: der Vor-Stand (Vorschau direkt, null-Ort, Op-Wache, Plattform-Zwilling, Ersatz-Ort, Warte-Poll der Hand) → W2–W7 feuern",
            rot.filter((w) => !w[1]).length === 6,
            rot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" ")
        );
        // WORT — der Korpus: das Soll liest den Abdruck; ein gesunder Lauf ohne Täter, jeder Bruch beim Namen
        const kP = (soll, nach) => korpusPraedikat(soll, { werke: { baum_eiche: 1 } }, nach, { eiche: "baum_eiche" });
        for (const [name, ist, soll] of [
            [
                "zwei Eichen statt drei, ein Haus",
                kP({ werk: ["eiche"], min: 3 }, { werke: { baum_eiche: 3, haus: 1 } }),
                false,
            ],
            ["ein Soll ohne Leser", kP({ farbe: 1 }, {}), null],
            // die Regler-Wörter: W 7 trifft [6, 8]; W 12 und ein Werk ohne Stempel nie; die alte Prägung (lofi) zählt nie
            ...[7, 12, null].map((w) => [
                `Regler-Wörter: ein neues Haus mit W ${w}, die alte Prägung W 7`,
                korpusPraedikat({ werk: "*", regler: { W: [6, 8] } }, { stempel: [["lofi", { W: 7 }]] }, { stempel: [["lofi", { W: 7 }], ["haus", w && { W: w }]] }, {}),
                w === 7,
            ]),
        ])
            check(`Selbst-Test WORT Prädikat: ${name} → ${soll}`, ist === soll, String(ist));
        const kSaetze = [...Array(39)]
            .map((_, i) => [`satz ${i}`, { wetter: "rainy" }])
            .concat([["kaffee", { still: 1 }]]);
        const G = KORPUS_SOLL.gegenprobe;
        const kLauf = (b = {}) => {
            const S = kSaetze.map(([satz, soll]) => {
                const antwort = { say: "Gern.", program: soll.still ? null : ["weather", "rainy"] };
                const e = {
                    satz,
                    fehler: 0,
                    praedikat: true,
                    weltMs: 2000,
                    lauf: true,
                    antwort,
                    ...(b.satz || {})[satz],
                };
                return Object.assign(e, { urteil: korpusSatzUrteil(e, soll) });
            });
            const tueren = [
                ["https://openrouter.ai/x", false],
                [G, true],
            ];
            return {
                korpus: { saetze: kSaetze },
                ratsche: { anbieter: "h", quote: { absicht: 1 } },
                echt: true,
                saetze: S,
                p95: 3000,
                tueren,
                ...b.m,
            };
        };
        const sieben = (e) => Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((i) => [`satz ${i}`, e]));
        const prog = (program) => ({ antwort: { say: "x", program } });
        for (const [name, b, soll] of [
            ["ein gesunder Lauf", {}, null],
            [
                "der Negativ-Satz versucht eine Tat, die dslEval abweist",
                { satz: { kaffee: prog(["spawn_creature", "kaffee_machine"]) } },
                "Negativ-Satz versucht",
            ],
            ["Korpus fehlt", { m: { korpus: null } }, "Korpus fehlt"],
            ["Prädikat nie geprüft", { satz: { "satz 4": { praedikat: null } } }, "Prädikat nie"],
            ["die KI gräbt ungefragt", { satz: { "satz 5": prog(["voxel_carve", 0, 0, 0]) } }, "1 Brüche"],
            [
                "Plain-Text statt JSON",
                { satz: sieben({ antwort: { say: "Regen!", fallbackUsed: "plain-text" } }) },
                "gueltig",
            ],
            ["die Absicht verfehlt", { satz: sieben({ praedikat: false }) }, "absicht"],
            ["die Antwort zu langsam", { m: { p95: 9000 } }, "p95"],
            ["Mitschnitt ohne echten Lauf", { m: { echt: false, ratsche: {} } }, "kein echter Anbieter"],
            [
                "Rückschritt am Mitschnitt",
                { m: { echt: false }, satz: { "satz 2": { praedikat: false } } },
                "Rückschritt",
            ],
            [
                "die CSP sperrt einen Anbieter",
                {
                    m: {
                        tueren: [
                            ["https://openrouter.ai/x", true],
                            [G, true],
                        ],
                    },
                },
                "die CSP sperrt",
            ],
            ["die CSP-Probe ist blind", { m: { tueren: [[G, false]] } }, "die CSP-Probe ist blind"],
            ["die Türen nie geprüft", { m: { tueren: [] } }, "nie geprüft"],
            ["die Aufnahme sänke die Ratsche", { m: { sinkt: [0.7, 0.75] } }, "sänke die Ratsche"],
        ]) {
            const v = korpusVerdict(kLauf(b));
            check(
                `Selbst-Test WORT: ‚${name}' → ${soll || "0 Täter"}`,
                soll ? v.some((t) => t.includes(soll)) : !v.length,
                v.join(" · ")
            );
        }
        // SEELE (KI K3): der Bezug auf die erlebte Tat, nie auf eine fremde (ein Vorschlag ist kein Schlag), das leere Gedächtnis nie
        const bezug = require(KORPUS_PFAD).seele.bezug;
        for (const [say, ist] of [
            ["Du hast mich geschlagen.", true],
            ["Ich habe einen Vorschlag.", false],
            ["Ich folgte dir, doch du schlugst mich.", false],
            ["Ich kenne dich nicht.", false],
        ])
            check(
                `Selbst-Test SEELE (geschlagen): „${say}" → ${ist}`,
                seelePraedikat({ taten: ["geschlagen"] }, say, bezug) === ist
            );
        // REGELN (KI K4): ein gesunder Selbstlauf ohne Täter; die Wertung aus, die LLM-Regeln an ihr vorbei, nie verdrängt
        const R = (llm, plus = 4, minus = 1) => ({
            echt: [0, 1, 2].map(() => ({
                "llm neu": 1,
                "llm erneuert": llm,
                "llm verdraengt": llm,
                "nexus erneuert": 1,
                "nexus verdraengt": 1,
            })),
            gegen: [
                {
                    "llm+ erneuert": plus * llm,
                    "llm+ verfallen": 5 - plus,
                    "llm- erneuert": minus * llm,
                    "llm- verfallen": 5 - minus,
                    "nexus+ erneuert": 8,
                    "nexus- verfallen": 8,
                },
            ],
        });
        for (const [name, lauf, soll] of [
            ["gesund", R(1), null],
            ["die Wertung aus", R(1, 3, 3), "trennt llm nicht"],
            ["die LLM-Regeln an der Wertung vorbei", Object.assign(R(0), { gegen: [{}] }), "keine llm-Regel gewertet"],
            ["kein Selbstlauf", {}, "kein Selbstlauf"],
        ]) {
            const v = regelVerdict(lauf);
            check(
                `Selbst-Test REGELN: ${name} → ${soll || "0 Täter"}`,
                soll ? v.some((t) => t.includes(soll)) : !v.length,
                v.join(" · ")
            );
        }
        const fG = {
            korpus: { injektionen: { bauplan: 1, kreatur: 1 } },
            gelandet: [1, 2],
            rufe: { stimme: 1, wesen: 1, journal: 1 },
            erreicht: [],
            signatur: ["valid", "modified", "forged"],
            anzeige: 1,
        };
        for (const [b, soll] of [
            [{}, ""],
            [{ erreicht: [1] }, "Modell: bauplan"],
            [{ ausgefuehrt: 2 }, "2 fremde"],
            [{ gelandet: [1] }, "kreatur"],
            [{ rufe: {} }, "Pfad stimme"],
            [{ signatur: [] }, "statt"],
            [{ anzeige: 0 }, "Platzhalter"],
        ]) {
            const v = feindVerdict({ ...fG, ...b }).map(([, s]) => s);
            check(
                `Selbst-Test FEIND ${JSON.stringify(b)} → ${soll || "0 Täter"}`,
                soll ? v.some((s) => s.includes(soll)) : !v.length,
                v.join(" · ")
            );
        }
        const wandT = erinnerungsWand(
            "class X { f() { this.journalAppend(1, `x ${y}`); this.journalAppend(1, A._datum`${y}`); this.journalAppendOnce(1, 2, z); } }"
        );
        check(
            "Selbst-Test FEIND Wand: ein Einschub ohne Tag und eine Variable → 2 Täter",
            wandT.length === 2,
            String(wandT)
        );
        selbsttestEnde(errs, "die V1-Pfad-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of wand(quelle)) check(name, ok, detail);

    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 600000 });
    await page.setViewport({ width: 1280, height: 720 });
    await server.zeige(page, 30000);
    // Der KI-Endpunkt der V-D6-Probe: ein Port, auf dem nichts lauscht.
    const out = await page.evaluate(probe, {
        kiPort: PORT + 3,
        knoten: KNOTEN.map(([name, prog, , , ohne]) => [name, prog, !!ohne]),
    });
    await browser.close();
    server.close();

    // DIE SCHNITTE DES V1-PFADS (Q14, Q15): je Probe ihr Urteil, die Zeile der Zahl, die Täter beim Namen
    const opZeile = (om) => (op) => {
        const e = (om.ops || {})[op] || {};
        return `${op} ${e.fehler ? "wirft" : e.akte && e.akte.length ? `${e.akte.length} Akt(e)` : e.grund ? "benannt" : "still"}`;
    };
    const zZeile = (zz) => (k) =>
        zz[k]
            ? `${k} ${zz[k].R} m: ${zz[k].proben} ${zz[k].nass != null ? "trockene " : ""}Proben/${zz[k].scans} Scans${zz[k].gefunden ? " (Wasser)" : ""}${zz[k].nass != null ? ` (${zz[k].nass} nasse ohne Zählung; ganz trocken hochgerechnet ${zz[k].hoch})` : ""}`
            : `${k} —`;
    const zZ = (wer, z) =>
        z
            ? `${wer} ${z.key} fremd ${z.fremd} · ${z.ms == null ? "nie" : z.ms + " ms"}${z.vorAnkunft ? ` (${z.vorAnkunft}× vor der Ankunft geweckt)` : ""}`
            : `${wer} —`;
    const stat = (xs) => {
        const s = xs.map((q) => q.fuell).sort((a, b) => a - b);
        return s.length ? `min ${s[0]} · median ${s[Math.floor(s.length / 2)]} · max ${s[s.length - 1]}` : "—";
    };
    const rm = out.rahmen || {};
    for (const [kurz, name, m, urteil, zeile] of [
        [
            "V-D1",
            "die Plattform steht auf einer Lichtung (keine Krone über der Scheibe), der Genesis-Ring um sie",
            out.ankunft,
            ankunftVerdict,
            (am) =>
                `Plattform ${JSON.stringify(am.plattform)} · ${am.baeume} Bäume im 40-m-Kreis · nächster Stamm ${am.naechsterStamm} m (${am.naechsteArt}) · Kronen über der Scheibe ${am.kronen} · Ring ${am.ringPortale} Portale, Mitte ${am.ringMitteAbstand} m`,
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
        [
            "V-k5-Klasse",
            "jede Op mit near_water in trockener Welt scheitert benannt (0 Würfe, 0 Welt-Akte, die chain meldet ehrlich, kein Dorf beim Spieler)",
            out.ort,
            ortVerdict,
            (om) =>
                `near_water ${om.radius} m · ${ORT_OPS.map(opZeile(om)).join(" · ")} · chain ${om.chain && om.chain.ok ? "Erfolg" : "abgesagt"} · Dorf-Aufträge ${om.dorfAuftraege}`,
        ],
        [
            "V-k5-Klasse (Rest)",
            `jeder ungültige Ort scheitert benannt (${KNOTEN.length} Programme: kein Knoten · at ohne Zahl · Text statt Zahl · kein Spieler · Voxel), die Defaults der Auflöser gelten`,
            out.knoten,
            knotenVerdict,
            (km) => {
                const [kl, kd] = [km.laeufe || {}, km.defaults || {}];
                const benannt = KNOTEN.filter(([name, , soll, effekt]) => knotenEintragOk(kl[name], soll, effekt)).length;
                const kAkte = KNOTEN.reduce((n, [name]) => n + ((kl[name] && kl[name].akte) || []).length, 0);
                return `${benannt}/${KNOTEN.length} benannt · ${kAkte} Welt-Akte ohne Ort · near_water ohne Radius „${kd.near_water}“ · vorn ohne Abstand ${kd.at_player_forward} m · Bedarf ohne Radius ${kd.at_field_need} m · Mess-Ort ohne Spieler ${JSON.stringify(km.messOrtOhneSpieler)}`;
            },
        ],
        [
            "R2",
            "das Wasser-Urteil ist bit-gleich zum vollen Scan, die Suche scannt trocken höchstens wie die 8-Strahlen-Suche",
            out.suche,
            sucheVerdict,
            (sm) =>
                `${sm.exakt ? `${sm.exakt.falsch} von ${sm.exakt.n} Urteilen abweichend (${sm.exakt.nass} nass)` : "—"} · ${["trinken", "chat", "ki"]
                    .flatMap((p) => [`${p}@trocken`, `${p}@plattform`])
                    .concat(["ki@trocken-voll"])
                    .map(zZeile(sm.zaehlung || {}))
                    .join(" · ")}`,
        ],
        [
            "V-D3",
            "die Eiche der Werkstatt-Vorschau steht im Bild (Masken-Gesetz über die Vorschau-Vertices ≥ 99 %)",
            out.vorschau,
            vorschauVerdict,
            (vm) =>
                `${vm.vertices || 0} Proben · ${(100 * (vm.anteil || 0)).toFixed(1)} % behalten · Maske im Render ${vm.maskeImRender} · Welt-Auge ${vm.augeAbstand} m`,
        ],
        [
            "V-D3 Fremder Zug",
            "jeder Wartende erwacht nach der Ankunft eines fremd gezogenen Körpers, jede Stufe der Vorschau nach ihrem Stoff (am Ereignis, nie an der Uhr)",
            out.zug,
            zugVerdict,
            (zm) =>
                `${zZ("vorschau", zm.vorschau)} · ${zZ("hand", zm.hand)} · Stufen ${(zm.stufen || []).map((q) => `L${q.lod} ${q.ms == null ? "nie" : q.ms + " ms"}${q.lod === 2 ? ` (Box ${q.hoch} m, Höhen-Stufe ${q.soll} m)` : ""}`).join(" · ")} · Vorrat ${zm.vorrat ? `${zm.vorrat.key} im Flug ${zm.vorrat.imFlug} · ${zm.vorrat.auftraege}× bestellt` : "—"}`,
        ],
        [
            "V-D3 Rahmen",
            `jede Gestalt füllt die Vorschau (projizierte Box3 in [${SOLL.rahmenMin}; ${SOLL.rahmenMax}] der Bildkante)`,
            rm,
            rahmenVerdict,
            () => {
                const re = (rm.eintraege || []).filter((q) => Number.isFinite(q.fuell));
                const rw = re.filter((q) => q.kind === "weapon");
                return `${re.length} gemessen (${rw.length}/${rm.waffenImBuch} Waffen: ${stat(rw)}; alle: ${stat(re)}) · ${(rm.eintraege || []).filter((q) => q.leer).length} ehrlich leer · Aspekt ${rm.aspekt} · ${rm.ms} ms`;
            },
        ],
    ]) {
        const mm = m || {};
        if (mm.err) check(`${kurz} Probe ohne Ausnahme`, false, mm.err.split("\n")[0]);
        const v = urteil(mm);
        check(
            `${kurz} ${name}`,
            v.length === 0,
            `${mm.gestartet ? zeile(mm) : "nicht gestartet"}${v.length ? " — Täter: " + v.join(", ") : ""}`
        );
    }
    if (process.env.V1_PFAD_RAHMEN_JSON) fs.writeFileSync(process.env.V1_PFAD_RAHMEN_JSON, JSON.stringify(rm, null, 1));
    wandEnde(errs, "der v1-Pfad trägt seine benannten Schnitte.");
});
