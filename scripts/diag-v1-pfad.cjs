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
//   V-D3 FREMDER ZUG (K38) — DER WARTENDE ERWACHT, WENN EIN ANDERER SEINEN KÖRPER ZUERST ZOG: die Welt zieht den Körper
//     der Eiche über ihren Chokepoint (`_foundryFlattenFor`, 300 m fern, im Rang der Ferne), dann wählt der Spieler die
//     Eiche (`selectBlueprintForEdit`); die Vorschau zeigt sie in der Frist. Dazu die Hand (`_heldFoundryGroup`) hinter dem
//     Zug der Vorschau: sie wird NACH der Ankunft geweckt. Befund Zweig-CI 38453848494 (voll 8/11): die Vorschau fand den
//     Schlüssel in der Dedup-Wache `f.requested` und wartete 90 s auf einen Rückruf, den nur der erste Besteller trug
//     („keine Vorschau-Gestalt"); im Rahmen danach stand dieselbe Eiche sofort (der Körper lag längst im Cache).   Soll ≤ 20 s
//
//   V-D3 RAHMEN (K05, Runner WS-01) — JEDE GESTALT FÜLLT DIE VORSCHAU: jedes Rezept des LIVE-Buchs und jeder Bauplan wird
//     über den Chokepoint des Spielers gewählt (selectStudioRecipeForView · selectBlueprintForEdit), `_workshopRender`
//     stellt die Kamera; gemessen: die projizierte Box3 der Gestalt, größere Kante je Bildkante (NDC, geklemmt), jede
//     Waffe des Buchs gemessen. Befund 32027dc2: Messer 0,059, Waffen-Median 0,146, 71 von 232 unter 0,5 (der
//     3-m-Mindestabstand in `_workshopCenterPreviewOn`).                                          Soll [0,5; 0,9]
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
//     R2 — DIE WASSER-SUCHE: das Urteil des Lands `_landAt` (mit den Fels-Beweisen `_felsUeber`) gegen den vollen Spalten-Scan,
//       3 600 Urteile um den trockenen Ort, die Plattform und das nächste Wasser — 0 Abweichungen; dann
//       `_findNearestWaterPoint` für Trinken (40 m), Chat (80 m), KI (200 m), Spalten-Scans gezählt (Scan und Urteil sind
//       Beobachtungs-Punkte). Soll trocken ≤ 8 je 4-m-Ring (die Strahlen-Suche von cf9a07ba). Befund 6b988a07: 351/1330/8037.
//
//   node scripts/diag-v1-pfad.cjs [--selftest]          Port: V1_PFAD_PORT (Standard 4421)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

const PORT = Number(process.env.V1_PFAD_PORT || 4421);
const root = path.resolve(__dirname, "..");

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
const SOLL = { vorschauAnteil: 0.99, rahmenMin: 0.5, rahmenMax: 0.9, zugMs: 20000, karteMin: 0.5, karteMax: 1.5 };
// W7: die Wartenden auf eine Foundry-Antwort beim Namen — der Zug, der Wecker, die Hand, die Werkstatt-Vorschau (L0/L1 und
// die L2-Karte). Fehlt einer in der Zählung, ist sie blind geworden (oder er umbenannt: die Linse wandert mit).
const WARTENDE = ["_foundryZug", "_foundryWecker", "_heldFoundryGroup", "_workshopStudioPreviewFrom", "_workshopFoundryPreviewGroup"];
// V-D3 FREMDER ZUG (K38): jeder Wartende erwacht nach der Ankunft eines Körpers, den ein ANDERER zuerst zog.
function zugVerdict(m) {
    if (!m || m.gestartet !== true) return ["zug start"];
    const out = [];
    for (const [wer, z] of [
        ["vorschau", m.vorschau],
        ["hand", m.hand],
    ]) {
        if (!z) out.push(`zug ${wer}: keine Probe (vakuös)`);
        else if (!z.fremd) out.push(`zug ${wer}: kein fremder Zug im Flug (vakuös)`);
        else if (!(Number.isFinite(z.ms) && z.ms <= SOLL.zugMs)) // null ist nie 0 (Lehre 17)
            out.push(
                z.imCache
                    ? `zug ${wer} schläft: ${z.key} liegt im Cache, ${wer === "hand" ? "die Hand" : "die Vorschau"} wartet weiter`
                    : `zug ${wer}: ${z.key} nach ${SOLL.zugMs} ms nicht angekommen (der fremde Zug im Rang der Ferne)`
            );
    }
    // V-D3 STUFEN (K38-N2): jede Stufe der Werkstatt-Vorschau (L0 · L1 · die L2-Karte) erwacht, wenn ihr Stoff ankommt —
    // die Karte wartet auf ihre Höhen-Stufe (Rahmen und Sichthöhe) bzw. auf ihren Bake, nie auf eine Uhr.
    const st = m.stufen || [];
    if (st.length !== 3) out.push(`zug stufen: ${st.length} von 3 Stufen gemessen (vakuös)`);
    for (const s of st)
        if (!(Number.isFinite(s.ms) && s.ms <= SOLL.zugMs))
            out.push(
                s.da
                    ? `zug stufe L${s.lod} schläft: ${s.wart} ist da, die Vorschau wartet weiter`
                    : `zug stufe L${s.lod}: ${s.wart} nach ${SOLL.zugMs} ms nicht da`
            );
        // die Karte steht in ihrer Größe: die Box der Vorschau misst die Höhe ihrer Höhen-Stufe (der Rahmen rahmt die Karte,
        // nie den Stamm des Einheits-Quads)
        else if (s.lod === 2 && !(s.hoch / s.soll >= SOLL.karteMin && s.hoch / s.soll <= SOLL.karteMax))
            out.push(
                `zug stufe L2 rahmen: die Box der Karte misst ${s.hoch} m, ihre Höhen-Stufe ${s.soll} m — Täter die Box der Karten-Instanz (Einheits-Quad)`
            );
    // V-D3 VORRAT (K38-N2): der Vorrat zieht über den EINEN Zug je Körper-Schlüssel — ein Leser, der während des
    // Vorrats-Flugs denselben Körper braucht, hängt sich an, nie ein zweiter Auftrag (bis 15.10. bestellte
    // `_foundryPrefetchLibrary` an `_foundryZug` vorbei: der Leser fand keinen Zug und bestellte den Körper ein zweites Mal).
    const vr = m.vorrat;
    if (!vr) out.push("zug vorrat: keine Probe (vakuös)");
    else if (!vr.imFlug) out.push(`zug vorrat: ${vr.key} nicht im Flug des Vorrats (vakuös: ${vr.auftraege} Aufträge, Cache ${vr.imCache}, Phase ${vr.phase})`);
    else if (vr.auftraege !== 1)
        out.push(`zug vorrat: ${vr.key} ${vr.auftraege}× bestellt — Täter _foundryPrefetchLibrary bestellt an _foundryZug vorbei`);
    return out;
}
// V-D3 RAHMEN (K05, WS-01): die projizierte Box3 jeder Gestalt in [0,5; 0,9] der Bildkante, jede Waffe des Buchs gemessen.
// Befund integ-probe 32027dc2 (Runner R10): Messer 0,059, Median 0,157 — Täter der 3-m-Mindestabstand der Vorschau.
function rahmenVerdict(m) {
    if (!m || m.gestartet !== true) return ["rahmen start"];
    const out = [];
    const e = m.eintraege || [];
    const waffen = e.filter((q) => q.kind === "weapon" && Number.isFinite(q.fuell)).length;
    if (!(m.waffenImBuch > 0) || waffen !== m.waffenImBuch) out.push(`rahmen waffen ${waffen} von ${m.waffenImBuch} gemessen`);
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

// R2 — DIE WASSER-SUCHE: das Urteil des Lands `_landAt` ist bit-gleich zum vollen Spalten-Scan, und die dichte Ring-Suche
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
    const buehne = fnBody(nc, /\n {4}_buehneRender\([^)]*\) \{/) || "";
    // Jeder Neben-Renderer (Werkstatt-Vorschau `p`, Feed/Hof/Ich-Bühne `s`) zeichnet nur über die Bühne, und jeder nennt
    // sich (`wer`, K22): ein Render-Fehler der Bühne bricht laut beim Namen des Renderers.
    // Gezählt wird am AST (stammLib.rufe) JEDER Render-Ruf mit ≥ 2 Argumenten bei seinem Glied — `render`/`renderAsync`,
    // auch über `.call`/`.apply`, ein Argument ist ein Knoten (`s.cam || s.camera`, `a ? b : c`, `f(x, y)` je EINES): zeichnen
    // darf nur die Bühne und der Loop (`_loopRender`, die Welt selbst). Bis K38-N2 zählte W2 die Bühnen-Rufe gegen die feste
    // Zahl 4; Runde 2 las die Rufe an einem Muster reiner Bezeichner-Argumente und ordnete sie über ein Kopf-Muster ihrer
    // Methode zu — `s.renderer.render(s.scene, s.cam || s.camera)` blieb still grün (Prüfer K38-N2 Runde 3, mut-w2b).
    const rufe = stammLib.rufe(src);
    const RENDER = /^render(?:Async)?$/;
    const istRender = (r) => {
        if (RENDER.test(r.name || "")) return r.args.length >= 2;
        const c = r.knoten.callee;
        if ((r.name !== "call" && r.name !== "apply") || c.type !== "MemberExpression" || c.object.type !== "MemberExpression") return false;
        const o = c.object;
        const innen = o.computed ? (o.property.type === "Literal" ? String(o.property.value) : "") : o.property.name;
        return RENDER.test(innen) && (r.name === "apply" || r.args.length >= 3);
    };
    const renderRufe = rufe.filter(istRender);
    const renderOrte = renderRufe.map((r) => r.glied || "(außerhalb jeder Methode)");
    const direktRufe = renderRufe.filter((r) => r.glied !== "_buehneRender" && r.glied !== "_loopRender");
    const direktOrte = direktRufe.map((r) => `${r.glied || "(außerhalb)"}: ${r.ziel}(${r.args.map((a) => src.slice(a.start, a.end)).join(", ")}) ${stammLib.ort(root, stammLib.zeileVon(src, r.start))}`);
    const direkt = direktOrte.length;
    const buehnen = rufe
        .filter((r) => r.ziel === "this._buehneRender")
        .map((r) => {
            const wer = r.args[r.args.length - 1];
            return wer && wer.type === "Literal" ? String(wer.value) : wer ? src.slice(wer.start, wer.end) : "?";
        });
    const evalPos = fnBody(nc, /\n {4}dslEvalPos\(node, ctx\) \{/) || "";
    const effekte = fnBody(nc, /\n {4}get dslEffects\(\) \{/) || "";
    const wachen = (effekte.match(/if \(!pos\)/g) || []).length;
    // Die Genesis-Plattform sucht nur `_genesisPlattform` (Spawn-Idempotenz, Rückkehr-Anker, Genesis-Ort lesen sie).
    const plattSuchen = (nc.match(/\.type === "start_plattform"/g) || []).length;
    const plattQuelle = /\.type === "start_plattform"/.test(fnBody(nc, /\n {4}_genesisPlattform\([^)]*\) \{/) || "");
    // Die Auflöser kennen keinen Ersatz-Ort: kein Spieler-/Ursprungs-Ersatz, keine Zahl ohne den EINEN Leser `_dslOrtZahl`
    // (dslClamp gab für jedes Ungültige die Untergrenze, Number(null) ist 0); die Feld-Akte und die Voxel-Ops lesen ihren
    // Ort an der Engstelle.
    const positionen = fnBody(nc, /\n {4}get dslPositions\(\) \{/) || "";
    const regelPos = fnBody(nc, /\n {4}_dslRulePos\([^)]*\) \{/) || "";
    const ersatz = [
        (positionen.match(/_defaultSpawnPos\(\)/g) || []).length,
        (positionen.match(/dslClamp\(/g) || []).length,
        (positionen.match(/\bNumber\(/g) || []).length,
        (effekte.match(/const c[xyz] = Number\(/g) || []).length,
        (effekte.match(/playerMesh\.position : \{ x: 0/g) || []).length,
    ];
    // Der Foundry-Pfad pollt nicht (K38-N2): jeder Wartende auf eine Foundry-Antwort hängt am Wecker (Zug, Buch, Karte),
    // jede Frist startet am Ereignis (`_foundryUhren`). Ein Poll ist eine Closure der Methode, die setTimeout bekommt (sie
    // stellt sich selbst neu: poll · cachePoll · pruefe bis K38), oder ein setInterval.
    // Die Zählung belegt ihre Nicht-Leere am NAMEN der Wartenden (der Zug, der Wecker, die Werkstatt-Vorschau, die Hand),
    // nie an einer Mindestzahl von Methoden: ein Schnitt, der Methoden zusammenlegt, macht sie nie rot.
    // Gelesen am AST (Runde 3): die Glieder der Familie am Namen (stammLib.glieder — ein Kopf mit Default-Parametern, ein
    // umbrochener oder ein async-Kopf fiel aus dem Kopf-Muster und seine Polls blieben ungesehen). Je Glied ein Graph: das
    // Glied und jede Closure darin (const/let = Funktion, function-Deklaration) sind Knoten, eine Kante führt zu jedem Knoten
    // desselben Glieds, den ein Knoten beim Namen nennt (die Closure beim Bezeichner, das Glied über `this.<name>`), eine
    // ZEIT-Kante, wenn die Nennung im Rückruf eines Zeitgebers steht (setTimeout · setInterval · requestAnimationFrame, auch
    // `window.`). Ein Poll ist ein Kreis mit einer Zeit-Kante (die Closure, die sich neu stellt, auch über eine zweite Closure
    // oder einen Block-Rumpf; das Glied, das sich per Zeitgeber neu ruft) oder ein setInterval. Eine Kette über ZWEI Glieder
    // (`_foundryUhren` stellt `_foundryAblauf`, dessen Geist-Fall die Uhr des nächsten Auftrags stellt) ist die Frist am
    // Ereignis je Auftrag, kein Poll.
    const polls = [];
    const foundryNamen = new Set();
    const FAMILIE = /^(?:_foundry\w*|_heldFoundryGroup|_workshop\w*Preview\w*|_impostor\w*|_karte\w*|_tickImpostorBake)$/;
    const ZEITGEBER = /^(?:setTimeout|setInterval|requestAnimationFrame)$/;
    for (const g of stammLib.glieder(src)) {
        if (!FAMILIE.test(g.name)) continue;
        foundryNamen.add(g.name);
        const closures = [];
        const zeit = [];
        stammLib.wandere(g.knoten.value || g.knoten, (n) => {
            if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init && /FunctionExpression$/.test(n.init.type))
                closures.push({ name: n.id.name, start: n.init.start, ende: n.init.end, id: n.id });
            else if (n.type === "FunctionDeclaration" && n.id) closures.push({ name: n.id.name, start: n.start, ende: n.end, id: n.id });
            else if (n.type === "CallExpression") {
                const c = n.callee;
                const nm = c.type === "Identifier" ? c.name : c.type === "MemberExpression" && !c.computed ? c.property.name : "";
                if (nm === "setInterval") polls.push(`${g.name} setInterval`);
                if (ZEITGEBER.test(nm) && n.arguments[0]) zeit.push(n.arguments[0]);
            }
            return true;
        });
        const namen = new Set(closures.map((c) => c.name));
        const knotenAn = (i) => {
            let k = null;
            for (const c of closures) if (c.start <= i && i < c.ende && (!k || c.start >= k.start)) k = c;
            return k ? k.name : g.name;
        };
        const kanten = new Map(); // von → Map(zu → Zeit-Kante?)
        const kante = (von, zu, i) => {
            const z = zeit.some((a) => a.start <= i && i < a.end);
            if (!kanten.has(von)) kanten.set(von, new Map());
            kanten.get(von).set(zu, kanten.get(von).get(zu) || z);
        };
        stammLib.wandere(g.knoten.value || g.knoten, (n, ahnen) => {
            const p = ahnen[ahnen.length - 1];
            if (n.type === "MemberExpression" && n.object.type === "ThisExpression" && !n.computed && n.property.name === g.name)
                kante(knotenAn(n.start), g.name, n.start);
            else if (
                n.type === "Identifier" &&
                namen.has(n.name) &&
                !closures.some((c) => c.id === n) &&
                !(p && p.type === "MemberExpression" && p.property === n && !p.computed) &&
                !(p && p.type === "Property" && p.key === n && !p.computed && !p.shorthand)
            )
                kante(knotenAn(n.start), n.name, n.start);
            return true;
        });
        // ein Kreis mit einer Zeit-Kante: die Kante von → zu, und zu erreicht von
        const erreicht = (a, b) => {
            const offen = [a];
            const gesehen = new Set([a]);
            while (offen.length) {
                const x = offen.pop();
                if (x === b) return true;
                for (const y of (kanten.get(x) || new Map()).keys()) if (!gesehen.has(y)) gesehen.add(y), offen.push(y);
            }
            return false;
        };
        for (const [von, m] of kanten) for (const [zu, z] of m) if (z && erreicht(zu, von)) polls.push(`${g.name} ${zu === g.name ? "stellt sich neu" : zu}`);
    }
    return [
        [
            "W1 die Bühne zeichnet ungemaskt (`_buehneRender`: uLodMaskOn 0 um den Render, im finally zurück)",
            /lu\.uLodMaskOn\.value = 0;/.test(buehne) && /finally\s*\{[^}]*lu\.uLodMaskOn\.value = an;/.test(buehne),
        ],
        [
            "W2 jeder Neben-Renderer zeichnet über die Bühne (jeder `x.render(szene, kamera)` lebt in `_buehneRender` oder `_loopRender`, die Werkstatt-Vorschau ruft die Bühne beim Namen)",
            direkt === 0 && renderOrte.includes("_buehneRender") && buehnen.includes("Werkstatt-Vorschau"),
            `${direkt} direkt${direkt ? " (" + direktOrte.join(", ") + ")" : ""} · über die Bühne: ${buehnen.join(", ") || "keiner"}`,
        ],
        [
            "W3 der Orts-Vertrag sitzt an der Engstelle (`dslEvalPos` wirft `_dslKeinOrt`, liefert nie null; den Default-Spawn nur ohne Knoten, `node == null`)",
            /throw fehler;/.test(evalPos) &&
                /this\._dslKeinOrt\(/.test(evalPos) &&
                !/return null/.test(evalPos) &&
                (evalPos.match(/_defaultSpawnPos\(\)/g) || []).length === 1 &&
                // der Default-Spawn nur für `node == null` — seit 10.10. läuft auch er durch die Feld-Wand der Engstelle
                // (das Feld hat keinen Ort, wo die Wildnis nicht trägt), darum wird er gesetzt statt sofort zurückgegeben
                /if \(node == null\) pos = this\._defaultSpawnPos\(\);\n\s+else if \(!Array\.isArray\(node\)\)/.test(evalPos),
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
        [
            "W7 der Foundry-Pfad pollt nicht (kein setInterval, keine Closure, die sich per setTimeout neu stellt — jeder Wartende am Wecker, jede Frist am Ereignis)",
            WARTENDE.every((n) => foundryNamen.has(n)) && polls.length === 0,
            `${foundryNamen.size} Methoden${WARTENDE.filter((n) => !foundryNamen.has(n)).map((n) => " · ungezählt " + n).join("")} · Polls: ${polls.length ? polls.join(", ") : "0"}`,
        ],
    ];
}

const server = statikServer();

// ── DIE PROBEN IN DER SEITE (Funktionsrumpf; r = die Welt). ──
async function probe(arg) {
    const kiPort = arg && arg.kiPort;
    const zugFrist = (arg && arg.zugMs) + 2000; // die Frist des fremden Zugs (SOLL lebt in Node), 2 s über dem Soll
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
        m.trocken = r._landAt(P.x, P.z, 0);
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
        const nass = (x, z) => !r._landAt(x, z, 0.2);
        // Ein Ort ohne Wasser im 84-m-Kreis (eigenes 4-m-Raster, unabhängig von der Such-Funktion des Spiels).
        const trockenUm = (x, z) => {
            for (let dz = -84; dz <= 84; dz += 4)
                for (let dx = -84; dx <= 84; dx += 4) if (dx * dx + dz * dz <= 84 * 84 && nass(x + dx, z + dz)) return false;
            return true;
        };
        let ort = null;
        // K16 (das Flussnetz-Gelände): die Plattform selbst ist trocken (das nächste Wasser 292 m) — der Ort liegt außerhalb
        // ihrer Lichtung (`_grundrissVon`, + 30 m für die Kronen des Satzes), sonst pflanzt der Absender nichts.
        const platz = st.architectures.find((a) => a && a.type === "start_plattform");
        const licht = platz && r._grundrissVon(platz);
        const frei = (x, z) =>
            !licht || Math.hypot(x - platz.position.x, z - platz.position.z) > (licht.lichtung || 0) + 30;
        for (const [x, z] of [[pm.x, pm.z], [200, 200], [-200, 200], [200, -200], [-200, -200], [400, 0], [0, 400], [-400, 0]]) {
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
        // die Signatur des Akts (welle-m-nexus): das Ergebnis des Dorfs und die Quelle, die es verlangt (der Spieler)
        r._nachDorfOrientieren({ placed: 1, haeuser: [], mitte: { x: sx, z: sz } }, "human");
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
        const urteil = r._landAt;
        // (a) Das Urteil gegen den vollen Spalten-Scan (die Referenz, wie bis 06.10. gerechnet): 3 Margen, je 400 Punkte
        //     um den trockenen Ort, die Plattform und das nächste Wasser (deterministischer Zufall).
        const ref = (x, z, mg) => {
            const s = scan.call(r, x, z);
            // die Definition des Lands ohne Beweise: über dem gezeichneten Wasser am Körper UND über dem des Gesetzes
            if (s === null || !Number.isFinite(s)) return !(r._atlasWaterLevelAt(x, z, -1e9) > -Infinity);
            return !(s < r._koerperWasser(x, z, s) + mg) && !(s < r._atlasWaterLevelAt(x, z, s) + mg);
        };
        // das nächste Wasser des Gesetzes (K16: 292 m von der Plattform, die 200-m-Suche fand keins — die Stichprobe war trocken)
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
        const nassAlt = r._nassAt;
        const hatte = { scan: eigen("_voxelSurfaceY"), urteil: eigen("_nassAt") };
        r._voxelSurfaceY = function (...a) {
            scans++;
            return scan.apply(this, a);
        };
        // die Ring-Suche fragt die Spalten-Probe `_nassAt` (der Beobachtungs-Punkt zählt und reicht durch)
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
                    const ja = !r._nassAt(ort.x + Math.cos((d / D) * Math.PI * 2) * rr, ort.z + Math.sin((d / D) * Math.PI * 2) * rr, 0.2);
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
        if (!p || !p.currentMesh) {
            // Der Zustand beim Namen: liegt der Körper im Cache, schläft die Vorschau; sonst wartet sie auf den Zug.
            const bpE = st.blueprints.baum_eiche;
            const pr = r._foundryPresetForEntry({ type: "baum_eiche" });
            const lodE = bpE && Number.isFinite(bpE._recipeLod) ? bpE._recipeLod | 0 : 0;
            const k = pr ? r._foundryKoerperKey(pr, r._foundryVariantFor(r._werkSame(bpE, "baum_eiche"), pr), lodE) : null;
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
    // ── V-D3 FREMDER ZUG (K38): der Wartende erwacht, wenn ein ANDERER seinen Körper-Schlüssel zuerst zog ──
    // Der fremde Besteller läuft über seinen eigenen Chokepoint (die Welt: `_foundryFlattenFor`; für die Hand: die
    // Vorschau), der Wartende über seinen (`selectBlueprintForEdit` · `_heldFoundryGroup`). Der Körper wird vorher aus dem
    // Cache geräumt (`_foundryCacheEvict`, die EINE Räumungs-Naht), die Vorschau steht dabei auf einem Teile-Bauplan.
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
        const pm = st.playerMesh ? st.playerMesh.position : { x: 0, y: 0, z: 0 };
        // ohne Ort: die Gestalt kommt aus dem Samen (mit Ort wählt der Platz sie, `_foundryGestaltFor`), der Rang ist der
        // der Ferne (`_foundryAuftragD2` ohne Ort = ∞)
        r._foundryFlattenFor({ type: "baum_eiche", seed: same }, a.preset, 0);
        m.vorschau = { key: a.key, fremd: imFlug(a.key) };
        const t0 = performance.now();
        r.selectBlueprintForEdit("baum_eiche");
        const steht = () => !!(p.currentMesh && !r._wsStudioPending && p.currentMesh.children.length);
        while (performance.now() < t0 + zugFrist && !steht()) await tick(1, 80);
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
                while (performance.now() < t1 + zugFrist && !m.hand.geweckt) await tick(1, 80);
                m.hand.ms = m.hand.geweckt ? Math.round(performance.now() - t1) : null;
                m.hand.imCache = f.cache.has(b.key);
            } finally {
                r._refreshHeldMesh = echt;
            }
        }
        // (c) JEDE STUFE der Vorschau (K38-N2): die Eiche mit der LOD-Wahl 0 · 1 · 2, ihr Stoff vorher geräumt — L0/L1 der
        // Körper der Stufe, die L2-Karte ihre Höhen-Stufe (Rahmen + Sichthöhe), ihre Höhe und ihre Zelle im Atlas.
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
                while (performance.now() < t2 + zugFrist && !steht()) await tick(1, 80);
                const z = at ? at.zellen.get(zKey) : null;
                const box = steht() ? new THREE.Box3().setFromObject(p.currentMesh) : null;
                m.stufen.push({
                    hoch: box ? Math.round((box.max.y - box.min.y) * 100) / 100 : null,
                    soll: f.hoehen && f.hoehen.get(kKey) > 0 ? Math.round(f.hoehen.get(kKey) * 100) / 100 : null,
                    lod: s,
                    wart: at ? `die Karte ${zKey} (Höhen-Stufe ${kKey})` : `der Körper ${kKey}`,
                    ms: steht() ? Math.round(performance.now() - t2) : null,
                    da: at ? !!(z && (z.gebacken || (z.frame && f.hoehen && f.hoehen.get(kKey) > 0))) : f.cache.has(kKey),
                });
            }
        } finally {
            bpE._recipeLod = lodAlt;
        }
        // (d) DER VORRAT (K38-N2): eine Boden-Art (kein Baum, der Vorrat wärmt nur sie) wird geräumt, der Vorrat läuft neu
        // an; sobald ihr Körper im Flug ist, fragt ein Leser denselben Schlüssel — gezählt wird jeder Auftrag an den Worker.
        const bodenArt = (r._foundryLibrarySpec().species || []).find(
            (sp) => !r._foundryPresetIsTree(sp) && r._foundryGestalten(sp) > 0
        );
        const tV = performance.now();
        while (f._vorrat && performance.now() < tV + zugFrist) await tick(1, 80); // der Boot-Vorrat läuft aus
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
    // ── V-D3 RAHMEN (K05, WS-01): jedes Rezept und jeder Bauplan füllt die Vorschau ──
    // Die Wahl läuft über die Chokepoints des Spielers (selectStudioRecipeForView · selectBlueprintForEdit), die Kamera
    // stellt `_workshopRender` (der Vorschau-Renderer ist oben der Beobachtungs-Punkt, keine GPU-Arbeit); gemessen wird
    // die projizierte Box3 der Gestalt: größere Kante je Bildkante (NDC, auf das Bild geklemmt) — das Maß des Runners.
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
            .concat(Object.keys(st.blueprints).sort().map((id) => ["bauplan", id, st.blueprints[id].preset || "teile"]));
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
            const dl = performance.now() + 20000;
            while (performance.now() < dl && r._wsStudioPending) await sleep(40);
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

(async () => {
    const quelle = stammLib.text(root);
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
        const zugGesund = {
            gestartet: true,
            vorschau: { key: "eiche|2|0", fremd: true, ms: 1500, imCache: true },
            hand: { key: "klinge|1|0", fremd: true, ms: 900, imCache: true },
            stufen: [0, 1, 2].map((lod) => ({ lod, wart: "eiche|2|" + lod, ms: 800, da: true, hoch: 21.4, soll: 21 })),
            vorrat: { key: "gras|1|1", imFlug: true, auftraege: 1 },
        };
        check("Selbst-Test V-D3 Fremder Zug: gesund == 0 Täter", zugVerdict(zugGesund).length === 0, zugVerdict(zugGesund).join(" · "));
        const zugMit = (wer, z) => Object.assign({}, zugGesund, { [wer]: Object.assign({}, zugGesund[wer], z) });
        for (const [name, bruch, soll] of [
            ["die Vorschau schläft nach der Ankunft (Zweig-CI 38453848494)", zugMit("vorschau", { ms: null, imCache: true }), "zug vorschau schläft"],
            ["der fremde Zug im Rang der Ferne", zugMit("vorschau", { ms: null, imCache: false }), "zug vorschau: eiche|2|0 nach"],
            ["die Hand schläft nach der Ankunft", zugMit("hand", { ms: null, imCache: true }), "zug hand schläft"],
            ["kein fremder Zug (vakuös)", zugMit("vorschau", { fremd: false }), "zug vorschau: kein fremder Zug"],
            ["keine Klinge im Buch (vakuös)", Object.assign({}, zugGesund, { hand: null }), "zug hand: keine Probe"],
            [
                "die L2-Karte schläft nach der Ankunft ihrer Höhen-Stufe (K38-N1 offen)",
                Object.assign({}, zugGesund, { stufen: [...zugGesund.stufen.slice(0, 2), { lod: 2, wart: "fimp:eiche|2", ms: null, da: true }] }),
                "zug stufe L2 schläft",
            ],
            ["keine Stufen gemessen (vakuös)", Object.assign({}, zugGesund, { stufen: [] }), "zug stufen: 0 von 3"],
            ["der Leser bestellt im Flug des Vorrats neu (bis 15.10.)", zugMit("vorrat", { auftraege: 2 }), "zug vorrat: gras|1|1 2×"],
            ["der Vorrat zieht nicht (vakuös)", zugMit("vorrat", { imFlug: false }), "zug vorrat: gras|1|1 nicht im Flug"],
            ["keine Vorrats-Probe (vakuös)", Object.assign({}, zugGesund, { vorrat: null }), "zug vorrat: keine Probe"],
            [
                "die Vorschau rahmt den Stamm (Box des Einheits-Quads, Bild 15.10.)",
                Object.assign({}, zugGesund, { stufen: [...zugGesund.stufen.slice(0, 2), { lod: 2, wart: "fimp:eiche|2", ms: 900, da: true, hoch: 1.1, soll: 21 }] }),
                "zug stufe L2 rahmen",
            ],
        ]) {
            const v = zugVerdict(bruch);
            check(`Selbst-Test V-D3 Fremder Zug: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const waffe = (id, fuell) => ({ art: "rezept", id, kind: "weapon", fuell, kante: 0.4, dist: 3 });
        const gesundR = { gestartet: true, waffenImBuch: 2, eintraege: [waffe("beil", 0.7), waffe("messer", 0.7)] };
        check("Selbst-Test V-D3 Rahmen: gesunde Vorschau == 0 Täter", rahmenVerdict(gesundR).length === 0, rahmenVerdict(gesundR).join(" · "));
        for (const [name, bruch, soll] of [
            ["Messer 0,059 (3-m-Mindestabstand, Runner WS-01)", { eintraege: [waffe("beil", 0.7), waffe("messer", 0.059)] }, "rahmen 1 außerhalb"],
            ["ein Bauplan sprengt das Bild (0,97)", { eintraege: gesundR.eintraege.concat([{ art: "bauplan", id: "haus", kind: "teile", fuell: 0.97 }]) }, "rahmen 1 außerhalb"],
            ["eine Waffe ungemessen", { eintraege: [waffe("beil", 0.7), { art: "rezept", id: "messer", kind: "weapon", leer: true }] }, "rahmen waffen 1 von 2"],
            ["eine Gestalt bleibt pending", { eintraege: gesundR.eintraege.concat([{ art: "rezept", id: "eiche", kind: "tree", frist: true }]) }, "rahmen 1 ohne Gestalt"],
        ]) {
            const v = rahmenVerdict(Object.assign({}, gesundR, bruch));
            check(`Selbst-Test V-D3 Rahmen: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
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
        check("Selbst-Test W: der Arbeitsbaum ist grün", gruen.every((w) => w[1]), gruen.filter((w) => !w[1]).map((w) => `${w[0].slice(0, 2)} ${w[2] || ""}`).join(" | "));
        const vorStand = quelle
            .replace('this._buehneRender(p.renderer, p.scene, p.camera, "Werkstatt-Vorschau");', "p.renderer.render(p.scene, p.camera);")
            .replace("if (an !== null) lu.uLodMaskOn.value = 0;", "")
            // der Orts-Vertrag beim Vorher (6b988a07): dslEvalPos gibt null weiter, spawn_studio bewacht sich selbst
            .replace("            throw fehler;\n", "            return null;\n")
            // der Rest der Klasse beim Vorher (c52089c7): jeder Nicht-Array-Knoten ist „nicht verlangt", der Feld-Akt nimmt
            // für jeden Nicht-Array-Knoten den Spieler
            .replace("if (node == null) pos = this._defaultSpawnPos();", "if (!Array.isArray(node) || node.length === 0) pos = this._defaultSpawnPos();")
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
            )
            // der Warte-Poll der Hand beim Vorher (K38-N1): sie fragte alle 150 ms, ob das Buch steht
            .replace(
                'this._foundryWecker(f.buchDa, "hand", () => {',
                "const poll = () => {\n if (f.ready && f.recipes) this._refreshHeldMesh();\n else setTimeout(poll, 150);\n };\n setTimeout(poll, 150);\n (() => {"
            );
        // die Klasse der festen Stellen-Zahl (K38-N2): ein Renderer weniger über die Bühne bleibt grün
        const weniger = wand(quelle.replace('this._buehneRender(s.renderer, s.scene, s.camera, "Hof-Bühne");', ""));
        check(
            "Selbst-Test W: ein Renderer weniger über die Bühne bleibt grün (W2 zählt am Namen, keine feste Zahl)",
            quelle.includes('"Hof-Bühne");') && weniger.every((w) => w[1]),
            weniger.filter((w) => !w[1]).map((w) => `${w[0].slice(0, 2)} ${w[2] || ""}`).join(" | ")
        );
        // DER TÄTER DER RUNDE 3 (Prüfer K38-N2-3, mut-w2b) und seine Klasse in EINEM Text: zusammengesetzte Argumente (||, ?:,
        // ein Aufruf im Argument), renderAsync, `.call`, ein Kopf mit Default-Parameter direkt hinter der Bühne (das Kopf-Muster
        // gab seinen Ruf `_buehneRender`); dazu die Polls der Familie, die das Kopf- und das setTimeout-Muster übersahen
        // (Default-Parameter, async-Kopf, Block-Rumpf, zwei Closures im Kreis) — jeder fällt beim Namen, die einmalige Frist
        // (`_foundryEinmal`) bleibt still.
        const bue = stammLib.glieder(quelle).find((g) => g.name === "_buehneRender");
        const ichRuf = 'this._buehneRender(s.renderer, s.scene, s.camera, "Ich-Bühne");';
        const klasse = (quelle.slice(0, bue.ende) +
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
                "    _foundryEinmal(k) {",
                "        const ab = () => this._foundryAblauf(k);",
                "        setTimeout(ab, 5000);",
                "    }",
            ].join("\n") +
            quelle.slice(bue.ende)).replace(ichRuf, "s.renderer.render(s.scene, s.cam || s.camera);");
        const wk = wand(klasse);
        const w2 = wk.find((w) => w[0].startsWith("W2"));
        const w7 = wk.find((w) => w[0].startsWith("W7"));
        const w2Soll = ["_ichStartRAF", "_fremdeBuehne", "_bauBuehne: s.renderer.render(this", "renderAsync", "render.call"];
        const w7Soll = ["_foundryLauscher warte", "_foundryNachfrage stellt sich neu", "_foundryPingPong"];
        check(
            "Selbst-Test W: der Täter der Runde 3 (s.cam || s.camera) und seine Klasse (?:, Aufruf im Argument, renderAsync, .call, Default-Parameter im Kopf) → W2 nennt jeden",
            quelle.includes(ichRuf) && !w2[1] && w2Soll.every((n) => w2[2].includes(n)) && (w2[2].match(/stamm\/\d\d[a-z]?\.js:\d+/g) || []).length === 5,
            w2[2]
        );
        check(
            "Selbst-Test W: die Polls hinter Default-Parameter, async-Kopf, Block-Rumpf und zwei Closures im Kreis → W7 nennt jeden, die einmalige Frist schweigt",
            !w7[1] && w7Soll.every((n) => w7[2].includes(n)) && !w7[2].includes("_foundryEinmal"),
            w7[2]
        );
        const rot = wand(vorStand);
        check(
            "Selbst-Test W: der Vor-Stand (Vorschau direkt, Bühne maskiert, null-Ort, Op-Wache, Plattform-Zwilling, Ersatz-Ort, Warte-Poll der Hand) → W1–W7 feuern",
            rot.filter((w) => !w[1]).length === 7,
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
    const browser = await starteBrowser({ art: "linse", frist: 600000 });
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
    const out = await page.evaluate(probe, { kiPort: PORT + 3, zugMs: SOLL.zugMs, knoten: KNOTEN.map(([name, prog, , , ohne]) => [name, prog, !!ohne]) });
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
    const zm = out.zug || {};
    if (zm.err) check("V-D3 Fremder Zug Probe ohne Ausnahme", false, zm.err.split("\n")[0]);
    const vZ = zugVerdict(zm);
    const zZ = (wer, z) => (z ? `${wer} ${z.key} fremd ${z.fremd} · ${z.ms == null ? "nie" : z.ms + " ms"}${z.vorAnkunft ? ` (${z.vorAnkunft}× vor der Ankunft geweckt)` : ""}` : `${wer} —`);
    check(
        `V-D3 Fremder Zug jeder Wartende erwacht nach der Ankunft eines fremd gezogenen Körpers, jede Stufe der Vorschau nach ihrem Stoff (≤ ${SOLL.zugMs} ms)`,
        vZ.length === 0,
        `${zZ("vorschau", zm.vorschau)} · ${zZ("hand", zm.hand)} · Stufen ${(zm.stufen || []).map((q) => `L${q.lod} ${q.ms == null ? "nie" : q.ms + " ms"}${q.lod === 2 ? ` (Box ${q.hoch} m, Höhen-Stufe ${q.soll} m)` : ""}`).join(" · ")} · Vorrat ${zm.vorrat ? `${zm.vorrat.key} im Flug ${zm.vorrat.imFlug} · ${zm.vorrat.auftraege}× bestellt` : "—"}${vZ.length ? " — Täter: " + vZ.join(", ") : ""}`
    );
    const rm = out.rahmen || {};
    if (rm.err) check("V-D3 Rahmen Probe ohne Ausnahme", false, rm.err.split("\n")[0]);
    const vR = rahmenVerdict(rm);
    const re = (rm.eintraege || []).filter((q) => Number.isFinite(q.fuell));
    const stat = (xs) => {
        const s = xs.map((q) => q.fuell).sort((a, b) => a - b);
        return s.length ? `min ${s[0]} · median ${s[Math.floor(s.length / 2)]} · max ${s[s.length - 1]}` : "—";
    };
    const rw = re.filter((q) => q.kind === "weapon");
    check(
        `V-D3 Rahmen jede Gestalt füllt die Vorschau (projizierte Box3 in [${SOLL.rahmenMin}; ${SOLL.rahmenMax}] der Bildkante)`,
        vR.length === 0,
        `${rm.gestartet ? `${re.length} gemessen (${rw.length}/${rm.waffenImBuch} Waffen: ${stat(rw)}; alle: ${stat(re)}) · ${(rm.eintraege || []).filter((q) => q.leer).length} ehrlich leer · Aspekt ${rm.aspekt} · ${rm.ms} ms` : "nicht gestartet"}${vR.length ? " — Täter: " + vR.join(", ") : ""}`
    );
    if (process.env.V1_PFAD_RAHMEN_JSON) fs.writeFileSync(process.env.V1_PFAD_RAHMEN_JSON, JSON.stringify(rm, null, 1));
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
