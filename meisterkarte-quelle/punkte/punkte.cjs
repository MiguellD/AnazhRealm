#!/usr/bin/env node
// DIE PUNKTE-MASCHINE der Meisterkarte: die Punkte eines Kriteriums sind eine FUNKTION DES SHA, gerechnet wie die CI —
// keine Sitzung misst und bucht mehr von Hand, was hier registriert ist.
//
//   node punkte.cjs run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--bahnen 3] [--port-basis 7700]
//        fährt jede Station des Geräts im Spiel-Baum am SHA, schreibt messung/<sha8>-<geraet>.json
//        --offen: nur die Stationen ohne frische Messung am SHA (das Frische-Urteil der Buchung) · --trocken: nur nennen
//        DIE SITZUNG zuerst (radeon|gtx, fahreSitzung): jede Station mit `probe` in EINER warmen Welt am SHA unter dem ganzen Schloss,
//        die Einträge mit modus "session" und bahn "sitzung", der Kopf der Sitzung als m.sitzung (darin m.sitzung.strom: die Dauerlast
//        jedes Bilds der Sitzung, stromSeite); die Reihe anfang · was die Welt lässt · ende · was sie ändert, die Grundstellung nur nach
//        einer mutierenden Probe oder einem Abbruch; danach die befehl-Stationen
//        --eich (radeon|gtx, DIE EICH-FAHRT, eichEintrag): die Sitzung mit dem Deckel 90 s je Probe über die Proben ohne frische Messung und
//        ohne Eich-Zahl am SHA; je Probe ihre Sekunden (`eich`), ein Urteil zählt nur im Gesetz — die OMEN fährt sie als Station zug/eich-gtx.sh
//        Zwillinge (gleicher Befehl und Umgebung) fahren EINMAL; DER BAHN-PLAN (fahrePlan): jede Zeit-Station allein, die übrigen
//        auf bis zu N Bahnen (Vorgabe 3, höchstens 5) zugleich, jede Bahn mit eigenem Spiel-Baum und eigenem Port-Band (portBand) —
//        auf radeon|gtx über das Platz-Schloss (werkzeug/gpu-lauf.sh: ein Bild-Lauf nimmt einen Platz, ein Zeit-Lauf alle)
//        headless misst nie am Platz: ohne --farm ruft run die Farm (punkte-farm.yml im Spiel-Repo, farmRufen), wartet und holt
//        ihre Messung in diesen Baum; --farm <name> fährt AUF dem Läufer (ohne Schloss des Rechners, host = name)
//   node punkte.cjs scheiben --sha <sha> --geraet headless [--jobs 12] [--offen|--nur id,id]
//        der Plan der Farm: die Läufe in höchstens --jobs Scheiben, die schwersten zuerst (JSON auf stdout = die Matrix)
//   node punkte.cjs vereine --sha <voll> --geraet headless --farm <name> --teile <dir> [--scheiben scheiben.json] [--beginn <s>]
//        die Teil-Messungen der Scheiben zur EINEN messung/<sha8>-<geraet>.json samt Roh-Ausgaben
//   node punkte.cjs buchen --kopf <sha>
//        liest alle messung/*.json, urteilt R6 (Pfad und Linse unberührt seit der Messung) und R10, schreibt stand.json
//   node punkte.cjs liste [--kopf <sha>]   die registrierten Stationen, geprüft gegen src/gN.js und jeder pfad-Glob gegen den
//        Kopf (sonst origin/main des Spiel-Klons)
//   node punkte.cjs gtx-nutzen --kopf <sha>   die GTX-Stationen, deren Messung am Kopf Punkte ändern kann (nur=… für die OMEN):
//        die gtx-Hälften ohne frische Messung am Kopf, deren Ausgang über die Punkte entscheiden kann (Frische-Urteil der Buchung)
//   node punkte.cjs plan --kopf <neu> --vorher <alt>   der Mess-Plan nach einem Zug: je GPU-Gerät die Stationen, die Punkte halten
//        oder gewinnen können (Staffel 1 auf EINEM Gerät, Zeit-Stationen auf der GTX, rote ohne Heil-Versuch nie)
//   node punkte.cjs gruppen --geraet radeon|gtx|headless [--nur id,id]   je Zeile die Ids EINES Laufs (Zwillinge zusammen, Reihe von
//        nur; jede Probe-Station in der ERSTEN Zeile: die Sitzung ist ein Lauf) — der Messplatz der OMEN fährt je Zeile ein
//        `run --nur`, nie einen Zwilling zweimal, nie eine zweite Welt
//   node punkte.cjs grundstellung   (in einer Probe der Sitzung) der Grund der Sitzung (PUNKTE_SITZUNG_GRUND) kehrt in die Welt an
//        WERKBANK_PORT zurück, ohne Neuladen (`_grundstellung` des Spiels); ROT nennt die Größen, die vom Grund abweichen
//   node punkte.cjs grundprobe --baum <Spiel-Baum> [--mutante <zeile>] [--port P]   (Null-Renderer) die Grundstellung der Sitzung
//        an einer Welt des Baums: Grund → graben, bauen, Ritt, Uhr, Brand, Regen, Ort-Takt → zurück, keine Größe weicht ab; die
//        Mutante (ein Wort der GRUND_TAFEL schweigt) ist ROT beim Namen
//   node punkte.cjs eichtafel --sha <sha> --geraet radeon|gtx   je Lauf der Sitzung: sein Deckel, die Zahl der Eich-Fahrt am SHA und der
//        Deckel aus ihr (eichTafel), dazu Σ heute ↔ aus den Zahlen gegen die Fahrt
//   node punkte.cjs selbsttest [--ohne 3c]   jeder Fall beim Namen (ohne (3c) DIE BAHNEN: sie zeugt Bash-Waisen)
//
// FORMAT (stationen/g1.js .. g6.js, module.exports = [ … ]), je Eintrag:
//   kriterium "gelaende.K2" (Bereich-Schlüssel.K<n> wie in src/gN.js) · staffel 1|2 · geraet "radeon"|"gtx"|"headless"
//   oder eine Liste (Staffel 2 einer GPU-Station verlangt ["radeon","gtx"]) · befehl argv im Spiel-Baum (argv[0] "node"
//   oder "bash"; Platzhalter {PORT} {AUS} {BAUM} {KOORD}) · env (optional, dieselben Platzhalter) · gpu true|false (true →
//   über gpu-lauf.sh, nie ohne Schloss) · zeit true|false (true: das Urteil fällt an der Wanduhr — ms, Latenz, Frame-Zeit,
//   Sekunden bis sichtbar —, die Station fährt allein; false: Bild oder Funktion, sie verträgt parallele Bahnen; je Station
//   Pflicht) · minuten (Deckel = 2 × minuten, mindestens 2 min) · urteil (j, lauf) →
//   { gruen, zahl } mit j = JSON aus {AUS} oder null, lauf = { exit, stdout, stderr } · pfad: Globs des gemessenen Pfads
//   (R6) · quelle: der Staffel-Text wörtlich (Teil der Staffel in src/gN.js) · beide (optional, nur true an Staffel 1 auf
//   radeon und gtx: die Staffel nennt beide Geräte, die 1 zählt erst, wenn JEDES grün ist — Pflicht, wo die quelle sie nennt) ·
//   proben (optional): [{ name, stdout, gruen }] Roh-Ausgaben des Befehls mit dem Urteil, das die Station über sie spricht
//   (die Schlupflöcher der Soll-Tafel als Mutanten; der Selbsttest urteilt jede).
//   probe (statt befehl, nur gpu true): { befehl: argv wie oben, sek: Deckel in s (Vorgabe und höchstens PROBE_DECKEL_S, mit ausnahme
//   höchstens PROBE_AUSNAHME_S) } —
//   die Station misst als Probe in der EINEN warmen Welt der Sitzung (fahreSitzung), nie mit eigenem Boot; dazu {PORT} = der Port
//   der Sitzung (save-server {PORT}, Werkbank {PORT}+20000 = WERKBANK_PORT), PUNKTE_SITZUNG_LOG = das Log ihrer Werkbank,
//   PUNKTE_SITZUNG_STROM = der Strom der Sitzung (je Bild eine Zeile, stromSeite; Zapfen, Marke und Leser exportiert diese Maschine),
//   PUNKTE_PROBE = ihr Name. Dazu optional: mutiert (true: sie ändert die Welt — baut, gräbt, Tab-Tod, Speichern/Laden —, nur nach
//   ihr setzt die Sitzung die Welt zurück) · stellung ("anfang" | "ende": die Reihe der Sitzung, sitzungsReihe) · ausnahme (der Grund,
//   warum sie über PROBE_DECKEL_S braucht; nie über PROBE_AUSNAHME_S, nie an einer Probe bis PROBE_DECKEL_S). Eine Station trägt GENAU
//   EINES von befehl und probe; auf radeon|gtx NUR probe (DIE FAHRT, fahrtUrteil).
// DIE FAHRT (29.10., das Gesetz des Schöpfers: „Ein kpl. Fahrt durch jedes System max 30 min, inbegriff ist dann auch die dauerlast"):
//   je Karte (radeon, gtx) die Summe der Deckel ihrer Läufe in der Sitzung (Zwillinge einmal) plus der Boot ≤ FAHRT_MAX_S — sonst
//   ROT mit den drei größten beim Namen (pruefeStationen: liste, run und buchen fallen dort); im Läufer die Wache (fahreSitzung):
//   reißt eine Probe ihren Deckel, fällt sie und ist UNGEMESSEN beim Namen, reißt die Fahrt FAHRT_MAX_S, endet sie und nennt die
//   offenen Proben (m.sitzung.offen).
// Je Kriterium und Staffel EINE Station (Schlüssel "<kriterium>#<staffel>"); ein Kriterium ohne Staffel-1-Station ist ROT.
//
// BUCHUNG (R2 · R6 · R10): je Station und Gerät zählt die JÜNGSTE Messung, deren Abdruck (Befehl, Urteil, Pfad, Hilfen)
// der Station gleicht und deren Pfad und Linse zwischen Mess-SHA und Kopf ohne Stempel unberührt sind (stempelDateien, linsenVon). 1 = jede
// Staffel-1-Station auf mindestens einem ihrer Geräte grün · 2 = dazu jede Staffel-2-Station auf JEDEM ihrer Geräte grün ·
// sonst 0. Ein jüngeres ROT schlägt ein älteres GRÜN.
// DIE RATSCHE (Schöpfer 30.10.: „Tests sichern nur den Rückfall, nie den Fortschritt — das jetzige Minimum sichern und mehr
// hereinholen“): ohne frische Messung (R6-alt, ungemessen, Station neu) gilt je Station und Gerät das GRÜN der letzten Buchung
// weiter („gehalten“, mit Mess-SHA und Zahl von damals); nur ein frisches ROT nimmt es (RÜCKFALL beim Namen), die Wand PFAD
// hält nie. Ohne Vorbuchung (oder `buchen --ohne-ratsche`) ist ungemessen 0.
// ZWEI WÄNDE (24.10., Prüfung der Buchung 61 → 80): (PFAD) jeder `pfad`-Glob trifft am Mess-SHA und am Kopf mindestens eine
// Datei, sonst ist die Station ROT — ein toter Glob macht R6 blind (die KAMPF-Liste nannte einen Schmiede-Kern, den es nicht gab);
// (GPU) eine GPU-Station zählt nur, wenn ihr Lauf beweist, dass eine Linse auf der Karte zeichnete: ein Adapter eines Herstellers
// in `[linse-gpu]` und keine Weiche „zeichnet nie“ (leib.K4#1 war als GPU gebucht, die Linse zeichnete nie — welt-boot
// „das Rezept ist null“). Den Zeugen sammelt gpu-zeuge.cjs aus jedem node-Prozess der Station; eine ältere Messung ohne ihn
// zeugt nur über ihre Roh-Ausgabe (messung/roh), sonst ist sie ungemessen.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawn, spawnSync } = require("child_process");

const DIR = __dirname;
const QUELLE = path.resolve(DIR, "..");
const KOORD = path.resolve(QUELLE, "..");
const GRUPPEN = ["g1", "g2", "g3", "g4", "g5", "g6"];
const GERAETE = ["radeon", "gtx", "headless"];
const TABU_PORT = 4312;

// ───────────────────────────────── Format ─────────────────────────────────
function kriterienDerKarte(srcDir = path.join(QUELLE, "src")) {
    const k = new Map();
    for (const g of GRUPPEN) {
        const m = require(path.join(srcDir, g + ".js"));
        for (const b of m.bereiche) b.kriterien.forEach((x, i) => k.set(b.key + ".K" + (i + 1), { gruppe: g, ...x }));
    }
    return k;
}

const geraeteVon = (st) => (Array.isArray(st.geraet) ? st.geraet : [st.geraet]);
const schluessel = (st) => st.kriterium + "#" + st.staffel;

function hilfeText() {
    return fs.readFileSync(path.join(DIR, "hilfe.cjs"), "utf8");
}
// DIE PROBE der Sitzung (29.10., Takt 19 an b3f9ae95 Radeon: 64 GPU-Stationen 879 Stations-Minuten, Mittel 13,7 min — 282 min am
// Schloss, 103 min Abbau-Schwanz, jede Station ihr eigener Boot; die Welt lädt warm in Sekunden): argv und Deckel; eine Station mit
// probe hat keinen befehl. Der Abdruck einer befehl-Station bleibt Byte für Byte (pr nur an einer Probe)
// DAS BUDGET DER PROBE (29.10., der Schöpfer: „Eine komplette Fahrt durch jedes System max 30 min"): Ziel ≤ 15 s, Deckel 45 s, nur
// mit `ausnahme` (der Grund beim Namen) bis 90 s — darüber ROT, auch mit ausnahme; DIE FAHRT je Karte ≤ FAHRT_MAX_S samt Boot
// DIE DECKEL (30.10., Karte w4-grundstellung) — je Probe ihr `sek`, aus dem Gegenlauf Radeon b3f9ae95 (gegenlauf/fahrt-b3f9ae95-radeon.json,
// die Reihe der Sitzung): der gemessene Lauf; lief die Probe nach einer Grundstellung mit Neuladen (nach einer mutierenden oder einer
// gerissenen — die Kaskade: jeder gerissene Deckel lud die Seite neu, und die nächste riss wieder) und war ROT oder OFFEN, ohne den
// Ring-Neubau (45 s je Probe), OFFEN dort mindestens 15 s (gerissen: die Messung ist zensiert); eine GRÜNE Messung bleibt ganz;
// mindestens 10 s. Selbst getaktet (eigene Uhr, feste Fenster) und darum nach eigenem Bedarf: das Profi-Band (gang 64 s, glätte und
// dauer 45 s). Über dem Budget (FAHRT_MAX_S − SITZUNG_BOOT_S) die EINE Kappe 33 s: Σ 1 656 s in 69 Läufen; 31 Proben stehen dort
// unter ihrem Bedarf (ferne.K1 91, siedlung.K4#2 92, speicher.K2 73, vegetation.K5#2 68, tiere.K2#2 64, licht.K2#2 59, tiere.K3#2 59,
// speicher.K1 57, tiere.K1#2 55, leib.K2 52, siedlung.K1#2 49, fahrzeug.K3#1 47, leib.K1#2, siedlung.K2 47, licht.K5#1, lod.K5#1,
// material.K2#1, material.K3, mensch.K1, mensch.K1#2, studios.K4, tiere.K5#1, vegetation.K4, fahrzeug.K3#2 46, material.K1, wetter.K2#1,
// schatten.K1#1 45, streaming.K3#1, affekt.K1#2 43, oekologie.K4#2, leib.K4 40 s) — die GPU-Fahrt nennt, wer warm am Deckel fällt
// (UNGEMESSEN beim Namen), ihre Zahl ersetzt die Schätzung.
const PROBE_DECKEL_S = 45;
const PROBE_AUSNAHME_S = 90;
const PROBE_SEK = PROBE_DECKEL_S;
const FAHRT_MAX_S = 1800;
const PROBE_SCHLUESSEL = ["befehl", "sek", "mutiert", "ausnahme", "stellung"];
const befehlVon = (st) => (st.probe ? st.probe.befehl : st.befehl);
const probeSek = (st) => (st.probe && st.probe.sek) || PROBE_SEK;
function abdruck(st, hilfe = hilfeText()) {
    const roh = JSON.stringify({
        k: st.kriterium, s: st.staffel, g: geraeteVon(st), b: st.befehl, e: st.env || {}, gpu: !!st.gpu,
        u: String(st.urteil), p: st.pfad, q: st.quelle, h: hilfe,
        ...(st.probe ? { pr: [st.probe.befehl, probeSek(st), ...(st.probe.mutiert ? ["mutiert"] : []), ...(st.probe.stellung ? [st.probe.stellung] : [])] } : {}),
    });
    return crypto.createHash("sha1").update(roh).digest("hex").slice(0, 12);
}
// DIE FEINDE DER SITZUNG: eine Probe, die Ports räumt, eine Welt startet oder stoppt, tötete die Welt aller folgenden Proben —
// der Täter beim Namen (pruefeStationen)
const SITZUNG_FEINDE = [
    [/\bnetstat\b/, "netstat (räumt Ports)"],
    [/\btaskkill\b/, "taskkill"],
    [/save-server\.js/, "ein eigener save-server"],
    [/werkbank\.cjs["']?\s+(start|stop)\b/, "werkbank start|stop"],
    [/(^|[\s;(&|])\$?\{?W\}?\s+(start|stop)\b/m, "werkbank start|stop über $W"],
    [/(wb\(\s*|\[\s*WB\s*,\s*)\[?\s*"(start|stop)"/, "werkbank start|stop aus node"],
    [/werkbankTor\s*\(/, "werkbankTor (eigene Welt)"],
    [/--eigen\b/, "--eigen (eigene Welt)"],
];
const sitzungsFeinde = (argv) => SITZUNG_FEINDE.filter(([re]) => re.test(argv.join("\n"))).map(([, n]) => n);

// prüft die Stationen gegen die Karte; Rückgabe { stationen, fehler }
function pruefeStationen(liste, karte) {
    const fehler = [];
    const gesehen = new Set();
    const ok = [];
    for (const st of liste) {
        const wer = (st && st.kriterium) + "#" + (st && st.staffel);
        const f = [];
        const k = st && karte.get(st.kriterium);
        if (!k) f.push("Kriterium unbekannt");
        if (![1, 2].includes(st.staffel)) f.push("staffel nicht 1|2");
        if (st && st.befehl === null) {
            fehler.push(wer + ": befehl null gehört in module.exports.fehlt (mit grund), nie in die fahrbare Liste");
            continue;
        }
        const ge = geraeteVon(st);
        if (!ge.length || ge.some((g) => !GERAETE.includes(g)) || new Set(ge).size !== ge.length) f.push("geraet ungültig");
        if (ge.includes("headless") && (ge.length > 1 || st.gpu)) f.push("headless läuft allein und ohne GPU");
        if (!ge.includes("headless") && !st.gpu) f.push("ein Gerät radeon|gtx verlangt gpu: true");
        if (st.staffel === 2 && st.gpu && !(ge.includes("radeon") && ge.includes("gtx")))
            f.push("Staffel 2 einer GPU-Station verlangt beide Geräte (R2)");
        if (st.beide !== undefined && !(st.beide === true && st.staffel === 1 && ge.includes("radeon") && ge.includes("gtx")))
            f.push("beide nur als true an Staffel 1 auf radeon und gtx");
        if (st.staffel === 1 && st.beide !== true && /an beiden Geräten|beide Geräte|beider Geräte/.test(st.quelle || ""))
            f.push("die Staffel 1 nennt beide Geräte — beide: true (sonst bucht EIN Gerät die 1)");
        if (st.proben !== undefined && !(Array.isArray(st.proben) && st.proben.every((p) => p && typeof p.name === "string" && typeof p.stdout === "string" && typeof p.gruen === "boolean")))
            f.push("proben ist keine Liste von { name, stdout, gruen }");
        if (st.probe !== undefined) {
            const p = st.probe;
            if (st.befehl !== undefined) f.push("genau eines von befehl und probe");
            if (!p || typeof p !== "object") f.push("probe ist kein { befehl, sek }");
            else {
                // DER DECKEL (die Fahrt, b): bis PROBE_DECKEL_S frei, darüber nur mit ausnahme bis PROBE_AUSNAHME_S, darüber nie
                const sek = probeSek(st);
                if (p.sek !== undefined && !(Number.isInteger(p.sek) && p.sek >= 1)) f.push("probe.sek keine ganze Zahl ≥ 1");
                else if (sek > PROBE_AUSNAHME_S) f.push("Deckel " + sek + " s über " + PROBE_AUSNAHME_S + " s — nie, auch mit ausnahme (die Fahrt ≤ " + FAHRT_MAX_S / 60 + " min)");
                else if (sek > PROBE_DECKEL_S && p.ausnahme === undefined) f.push("Deckel " + sek + " s über " + PROBE_DECKEL_S + " s ohne ausnahme (der Grund beim Namen, bis " + PROBE_AUSNAHME_S + " s)");
                else if (sek <= PROBE_DECKEL_S && p.ausnahme !== undefined) f.push("ausnahme an einem Deckel von " + sek + " s — sie trägt nur einen über " + PROBE_DECKEL_S + " s");
                if (Object.keys(p).some((k) => !PROBE_SCHLUESSEL.includes(k))) f.push("probe trägt nur " + PROBE_SCHLUESSEL.join(", "));
                if (p.mutiert !== undefined && typeof p.mutiert !== "boolean") f.push("probe.mutiert nicht boolesch");
                if (p.stellung !== undefined && !["anfang", "ende"].includes(p.stellung)) f.push("probe.stellung nicht anfang|ende");
                if (p.ausnahme !== undefined && !(typeof p.ausnahme === "string" && p.ausnahme.length >= 12)) f.push("probe.ausnahme ohne Grund");
                if (Array.isArray(p.befehl) && p.befehl.every((a) => typeof a === "string")) {
                    const feind = sitzungsFeinde(p.befehl);
                    if (feind.length) f.push("probe greift die Welt der Sitzung an: " + feind.join(", "));
                }
            }
            if (!st.gpu || ge.includes("headless")) f.push("probe nur an einer GPU-Station (die Sitzung hält die Welt einer Karte)");
        } else if (ge.some((g) => g !== "headless") && st.befehl !== undefined)
            // DIE FAHRT (a): auf einer Karte misst jede Station als Probe der EINEN Welt — ein eigener Boot je Station war die 610 min
            f.push("befehl auf " + ge.filter((g) => g !== "headless").join("+") + " — eine Station der Karte misst nur als Probe der Sitzung (die Fahrt ≤ " + FAHRT_MAX_S / 60 + " min)");
        const argv = befehlVon(st);
        if (!Array.isArray(argv) || !argv.length || argv.some((a) => typeof a !== "string"))
            f.push((st.probe ? "probe." : "") + "befehl ist kein argv");
        else if (!["node", "bash"].includes(argv[0])) f.push((st.probe ? "probe." : "") + "befehl[0] nicht node|bash");
        if (st.env && (typeof st.env !== "object" || Object.values(st.env).some((v) => typeof v !== "string")))
            f.push("env ungültig");
        if (typeof st.gpu !== "boolean") f.push("gpu nicht boolesch");
        if (typeof st.zeit !== "boolean") f.push("zeit nicht boolesch (true: das Urteil fällt in ms, die Station fährt allein)");
        if (!(st.minuten > 0)) f.push("minuten fehlt");
        if (typeof st.urteil !== "function") f.push("urteil ist keine Funktion");
        if (!Array.isArray(st.pfad) || !st.pfad.length || st.pfad.some((p) => typeof p !== "string" || !p))
            f.push("pfad leer (R6 könnte nie fallen)");
        if (typeof st.quelle !== "string" || st.quelle.length < 8) f.push("quelle fehlt");
        else if (k && !String(k.staffel).includes(st.quelle)) f.push("quelle steht nicht wörtlich in der Staffel");
        else if (k && !new RegExp("(^|\\s)" + st.staffel + " =").test(st.quelle)) f.push("quelle nennt nicht die Stufe " + st.staffel + " =");
        if (gesehen.has(wer)) f.push("doppelt");
        gesehen.add(wer);
        if (f.length) fehler.push(wer + ": " + f.join(" · "));
        else ok.push(st);
    }
    const kr = new Set(ok.map((s) => s.kriterium));
    for (const k of kr)
        if (!ok.some((s) => s.kriterium === k && s.staffel === 1)) fehler.push(k + ": keine Staffel-1-Station (eine 2 ohne 1 zählt nie)");
    fehler.push(...fahrtUrteil(ok));
    return { stationen: ok, fehler };
}
// DIE FAHRT einer Karte (c): die Läufe ihrer Sitzung (Zwillinge einmal, gruppiere) mit ihrem Deckel, die größten zuerst, und die
// Summe samt Boot (SITZUNG_BOOT_S) — die Wanduhr, die die Sitzung nie überschreiten kann, außer an der Grundstellung
function fahrtSumme(stationen, geraet) {
    const je = gruppiere(stationen.filter((st) => st.probe && geraeteVon(st).includes(geraet)))
        .map((g) => [g.map(schluessel).join("+"), probeSek(g[0])])
        .sort((a, b) => b[1] - a[1]);
    return { je, deckel: je.reduce((s, x) => s + x[1], 0), boot: SITZUNG_BOOT_S, summe: je.reduce((s, x) => s + x[1], 0) + SITZUNG_BOOT_S };
}
function fahrtUrteil(stationen) {
    return GERAETE.filter((g) => g !== "headless").flatMap((g) => {
        const f = fahrtSumme(stationen, g);
        if (f.summe <= FAHRT_MAX_S) return [];
        return [g + ": die Fahrt " + f.summe + " s über " + FAHRT_MAX_S + " s (Σ Deckel " + f.deckel + " s in " + f.je.length + " Läufen + Boot " + f.boot +
            " s) — die größten: " + f.je.slice(0, 3).map(([n, s]) => n + " " + s + " s").join(", ") +
            ((n) => (n > 3 ? " (" + n + " Läufe am Deckel " + f.je[0][1] + " s)" : ""))(f.je.filter((x) => x[1] === f.je[0][1]).length)];
    });
}

function ladeStationen(dir = path.join(DIR, "stationen"), teil = "liste") {
    const alle = [];
    for (const g of GRUPPEN) {
        const f = path.join(dir, g + ".js");
        if (!fs.existsSync(f)) continue;
        const m = require(f);
        if (!Array.isArray(m)) throw new Error(g + ".js exportiert keine Liste");
        if (m.fehlt != null && !Array.isArray(m.fehlt)) throw new Error(g + ".js: fehlt ist keine Liste");
        for (const st of teil === "fehlt" ? m.fehlt || [] : m) alle.push(st);
    }
    return alle;
}
// die Staffeln OHNE Werkzeug (module.exports.fehlt): beim Namen, mit Grund, nie zugleich eine fahrbare Station
function pruefeFehlt(fehlt, karte, stationen) {
    const fehler = [];
    const fahrbar = new Set(stationen.map(schluessel));
    const gesehen = new Set();
    for (const e of fehlt) {
        const wer = (e && e.kriterium) + "#" + (e && e.staffel);
        const f = [];
        if (!e || !karte.get(e.kriterium)) f.push("Kriterium unbekannt");
        if (!e || ![1, 2].includes(e.staffel)) f.push("staffel nicht 1|2");
        if (!e || e.befehl !== null) f.push("fehlt trägt befehl: null");
        if (!e || typeof e.grund !== "string" || e.grund.length < 8) f.push("grund fehlt");
        if (fahrbar.has(wer)) f.push("zugleich fahrbare Station");
        if (gesehen.has(wer)) f.push("doppelt");
        gesehen.add(wer);
        if (f.length) fehler.push("fehlt " + wer + ": " + f.join(" · "));
    }
    return fehler;
}
// DIE PROBEN (`proben`): jede Station urteilt ihre Roh-Ausgaben, wie sie es sagt — Rückgabe die Abweichungen beim Namen
function probenUrteil(stationen) {
    const falsch = [];
    for (const st of stationen)
        for (const p of st.proben || []) {
            let u;
            try {
                u = st.urteil(null, { exit: 0, stdout: p.stdout, stderr: "" });
            } catch (e) {
                u = { gruen: null, zahl: "Urteil warf: " + e.message };
            }
            if (!u || u.gruen !== p.gruen)
                falsch.push(schluessel(st) + " " + p.name + ": " + (u && u.gruen ? "GRÜN" : "ROT") + " statt " + (p.gruen ? "GRÜN" : "ROT") + " (" + (u ? u.zahl : "kein Urteil") + ")");
        }
    return falsch;
}
function ladeGeprueft() {
    const karte = kriterienDerKarte();
    const r = pruefeStationen(ladeStationen(), karte);
    const fehlt = ladeStationen(undefined, "fehlt");
    return { ...r, fehlt, fehler: [...r.fehler, ...pruefeFehlt(fehlt, karte, r.stationen)] };
}

// ───────────────────────────────── Glob (R6) ─────────────────────────────────
function globRegex(g) {
    let r = "";
    for (let i = 0; i < g.length; i++) {
        const c = g[i];
        if (c === "*" && g[i + 1] === "*") {
            r += g[i + 2] === "/" ? "(?:.*/)?" : ".*";
            i += g[i + 2] === "/" ? 2 : 1;
        } else if (c === "*") r += "[^/]*";
        else if (c === "?") r += "[^/]";
        else r += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
    if (g.endsWith("/")) r += ".*";
    return new RegExp("^" + r + "$");
}
const trifftPfad = (datei, pfad) => pfad.some((g) => globRegex(g).test(datei));
// DIE WAND PFAD: die Globs der Station, die in `dateien` (git ls-tree am SHA) keine Datei treffen
const toteGlobs = (pfad, dateien) => pfad.filter((g) => { const re = globRegex(g); return !dateien.some((f) => re.test(f)); });
const pfadGrund = (tot, wo) => "pfad-Glob trifft " + wo + " keine Datei (R6 blind): " + tot.join(", ");

// ───────────────────────────────── Zeuge der Karte (Wand GPU) ─────────────────────────────────
const ZEUGE_DATEI = path.join(DIR, "gpu-zeuge.cjs");
const KARTE = /^\[linse-gpu\] ((?:amd|nvidia|intel|apple|qualcomm|arm)\/\S+)/i;
const OHNE_KARTE = /^\[linse-gpu\] .*(swiftshader|llvmpipe|software|kein navigator\.gpu|kein Adapter|kein webgl2)/i;
// liest die Zeilen eines Laufs (stdout, stderr, Zeugen-Datei oder Roh-Ausgabe): { karte, fremd, nie }
function gpuZeuge(text) {
    const z = String(text || "").split(/\r?\n/);
    const karten = [...new Set(z.map((l) => (KARTE.exec(l) || [])[1]).filter(Boolean))];
    const fremd = [...new Set(z.filter((l) => OHNE_KARTE.test(l)).map((l) => l.slice(12).trim()))];
    const nie = new Set(z.filter((l) => /^\[welt-boot\] FEHLER klasse:.*zeichnet nie/.test(l))).size; // je Linse EINE Zeile, wie oft gesammelt auch
    return { karte: karten.join(" ") || null, fremd: fremd.join(" ") || null, nie };
}
// null = die Linse zeichnete auf der Karte, sonst der Grund beim Namen
function gpuWand(z) {
    if (!z) return "kein Zeuge der Karte im Lauf";
    if (z.nie) return "die Linse zeichnet nie (welt-boot: das Rezept ist „null“, " + z.nie + "×)";
    if (z.fremd) return "eine Linse zeichnet ohne Karte ([linse-gpu] " + z.fremd + ")";
    if (!z.karte) return "keine Linse nennt eine Karte ([linse-gpu] <Hersteller>/…)";
    return null;
}

// ───────────────────────────────── git ─────────────────────────────────
function git(args, cwd) {
    const r = spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 << 20 });
    if (r.status !== 0) throw new Error("git " + args.join(" ") + ": " + String(r.stderr || r.stdout).trim().split("\n")[0]);
    return r.stdout.trim();
}
function spielRepo() {
    // git < 2.31 kennt --path-format nicht und gibt es als eigene Zeile zurück (OMEN: git 2.30): die letzte Zeile, gegen KOORD aufgelöst
    const common = git(["rev-parse", "--path-format=absolute", "--git-common-dir"], KOORD).split(/\r?\n/).pop();
    return path.dirname(path.resolve(KOORD, common));
}
function voll(repo, sha) {
    try {
        return git(["rev-parse", "--verify", "--quiet", sha + "^{commit}"], repo);
    } catch (_e) {
        git(["fetch", "-q", "origin"], repo);
        return git(["rev-parse", "--verify", sha + "^{commit}"], repo);
    }
}

// ───────────────────────────────── Läufer ─────────────────────────────────
function findeBash() {
    if (process.env.PUNKTE_BASH) return process.env.PUNKTE_BASH;
    if (process.platform === "win32") {
        for (const p of ["C:/Program Files/Git/bin/bash.exe", "C:/Program Files/Git/usr/bin/bash.exe"]) if (fs.existsSync(p)) return p;
        return null; // nie die WSL-bash aus System32
    }
    return "bash";
}

// DAS PORT-BAND je Gerät und Bahn (26.10., Karte gpu-bahnen): {PORT} = Band-Anfang + 4. Die Stationen leiten aus {PORT} ab:
// −1 (Seite der Werkbank), +1 (Ofen, Wasser-Leben), +3 (KI), +10000 (tier-gang), +20000 (Werkbank oder save-server), +20001,
// +30000 (Kreatur-Linse) — jede Ableitung bleibt in den 10 Ports ihres Bands und seiner +10000-Spiegel. Bis dahin trug jede
// Station einen Port aus ihrer Stelle in der Liste: zwei Nachbarn hätten parallel kollidiert (wetter.K2#1 an 7710 sucht die Seite
// auf 7709), und ab Stelle 100 lief die Liste aus dem Block 7700–7799. headless nimmt die Bänder ab Basis, radeon|gtx ab Basis + 50.
const BAND = 10;
const MAX_BAHNEN = 5;
function portBand(basis, geraet, bahn) {
    const a = Number(basis) + (geraet === "headless" ? 0 : MAX_BAHNEN * BAND) + bahn * BAND;
    const alle = [0, 10000, 20000, 30000].flatMap((d) => Array.from({ length: BAND }, (_, i) => a + d + i));
    if (alle.includes(TABU_PORT)) throw new Error("Port-Band " + a + "–" + (a + BAND - 1) + " trifft " + TABU_PORT + " (--port-basis)");
    return { port: a + 4, alle };
}

// räumt jeden lauschenden Prozess auf den Ports (EIN netstat je Aufruf)
function portRaeumen(ports) {
    const ps = [].concat(ports || []).filter(Boolean).map(String);
    if (!ps.length) return;
    if (process.platform === "win32") {
        const r = spawnSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
        const pids = new Set();
        const re = new RegExp(":(" + ps.join("|") + ")$");
        for (const l of String(r.stdout || "").split(/\r?\n/)) {
            const s = l.trim().split(/\s+/);
            if (s.length >= 5 && /^(LISTEN|ABH)/i.test(s[3]) && re.test(s[1]) && s[4] !== "0") pids.add(s[4]);
        }
        for (const pid of pids) spawnSync("taskkill", ["/F", "/T", "/PID", pid], { encoding: "utf8" });
    } else spawnSync("sh", ["-c", "lsof -t -sTCP:LISTEN " + ps.map((p) => "-i tcp:" + p).join(" ") + " | xargs -r kill -9"], { encoding: "utf8" });
}

function baumTot(pid) {
    if (process.platform === "win32") spawnSync("taskkill", ["/F", "/T", "/PID", String(pid)], { encoding: "utf8" });
    else try { process.kill(-pid, "SIGKILL"); } catch (_e) { try { process.kill(pid, "SIGKILL"); } catch (_f) {} }
}

const ersetze = (s, ctx) =>
    s.replace(/\{PORT\}/g, String(ctx.port)).replace(/\{AUS\}/g, ctx.aus).replace(/\{BAUM\}/g, ctx.baum).replace(/\{KOORD\}/g, ctx.koord);

// DIE EINE gpu-lauf.sh (26.10., Prüfung gpu-bahnen): run und Selbsttest fahren dieselbe Datei, die neben dieser Maschine
// (werkzeug/, mit gpu-schloss.sh); eine andere nur ausdrücklich per PUNKTE_GPU_LAUF, und dann prüft der Selbsttest sie. Bis dahin
// fuhr run die alte Ein-Platz-Fassung unter artifacts/profiband/werkzeug/, der Selbsttest die neue: drei Bahnen warteten still
// nacheinander und trugen trotzdem „2/3“.
const GPU_LAUF = process.env.PUNKTE_GPU_LAUF || path.join(DIR, "werkzeug", "gpu-lauf.sh");
// vor dem Schloss wacht gpu-lauf.sh selbst über das Warten (Frist ohne Nachtruhe, Exit 75) und meldet sich alle 60 s; schweigt es
// länger, hängt es — der Lauf fällt, die Station bleibt ungemessen
const SCHLOSS_STILL_S = 600;
const istZeit = (sts) => sts.some((st) => st.zeit === true);
// fährt EINE Station; ctx = { baum, koord, port, band, aus, roh, geraet, bahn, plaetze, gpuLauf, bash, deckelMinS }
// Rückgabe { gruen, zahl, exit, minuten, grund?, ungemessen? } — ein Fehler, ein Absturz, ein Deckel ist ROT mit Grund, nie still;
// ein Schloss, das nie kam, ist ungemessen mit Grund.
function fahreStation(st, ctx) {
    return fahreGruppe([st], ctx).then((r) => r[0]);
}
// fährt den Befehl der ERSTEN Station EINMAL und urteilt jede Station der Gruppe über denselben Lauf — Zwillinge (gleicher
// Befehl, gleiche Umgebung, z. B. Staffel 1 und 2 aus EINER Linse) kosten nie zwei Läufe; Rückgabe je Station ein Ergebnis
// DAS WARTEN (27.10., Karte lange-stationen): `minuten` zählt ab dem Start, auch das Warten am Schloss (e7a28b06 Radeon: speicher.K2#1
// 29,51 min, davon 25,7 vor dem Schloss, die Vorfahrt des echt-Jobs); `warten` nennt die Minuten bis „gpu-lauf: Schloss …“ —
// die Arbeit der Station ist minuten − warten
// IN DER SITZUNG (ctx.sitzung = { log, zeuge }): die Probe läuft ohne Schloss (die Sitzung hält es ganz), ohne Port-Räumen (es
// tötete die Welt), unter ihrem eigenen Deckel probe.sek; der Zeuge ist der der Welt der Sitzung plus der eigene der Probe
function fahreGruppe(sts, ctx) {
    const st = sts[0];
    const sitz = ctx.sitzung || null;
    let tSchloss = null, tEnde = null;
    return new Promise((ganz0) => {
        const t0 = Date.now();
        // DIE SEKUNDEN DER PROBE (w4-sitzung-eichen): in der Sitzung trägt jedes Ergebnis `s`, vom Start bis zum Ende ihres Prozesses (nie
        // das Leerlaufen der Rohre danach) — die gemessene Zahl, die die Schätzung des Deckels ersetzt; `minuten` bleibt, wie es war
        const mitS = (e) => (sitz ? { ...e, s: +(((tEnde || Date.now()) - t0) / 1000).toFixed(1) } : e);
        const ganz = (es) => ganz0((tSchloss ? es.map((e) => ({ ...e, warten: +((tSchloss - t0) / 60000).toFixed(2) })) : es).map(mitS));
        const min = () => +((Date.now() - t0) / 60000).toFixed(2);
        const fertig = (e) => ganz(sts.map(() => e));
        const rot = (grund, exit = null, zahl = "") => fertig({ gruen: false, zahl: zahl || grund, exit, minuten: min(), grund });
        // ein Lauf, der das Schloss nie bekam, ist KEINE Messung: ungemessen beim Grund (eintragen legt ihn nie nach m.je)
        const offen = (grund, exit = null) => fertig({ gruen: false, ungemessen: true, zahl: grund, exit, minuten: min(), grund });
        if (!!sitz !== !!st.probe) return rot(st.probe ? "eine Probe misst nur in der Sitzung (fahreSitzung)" : "ein befehl fährt nie in der Sitzung");
        // in der Sitzung der Deckel der Probe — in der Eich-Fahrt die Ausnahme-Grenze PROBE_AUSNAHME_S (sitz.eich, eichEintrag) —, gekappt
        // am Rest der Fahrt (sitz.restS, fahreSitzung)
        const sitzDeckelS = sitz && sitz.eich ? PROBE_AUSNAHME_S : probeSek(st);
        const fahrtKappt = !!sitz && sitz.restS != null && sitz.restS < sitzDeckelS;
        const deckelS = sitz ? (fahrtKappt ? Math.max(1, Math.floor(sitz.restS)) : sitzDeckelS) : Math.max(ctx.deckelMinS != null ? ctx.deckelMinS : 120, Math.ceil(st.minuten * 60 * 2));
        let argv = befehlVon(st).map((a) => ersetze(a, ctx));
        const env = { ...process.env };
        // die Werkbank der Bahn: wer sie ohne --port ruft, trifft die seines Bands (nie die 4490 einer Nachbar-Bahn)
        if (ctx.port) env.WERKBANK_PORT = String(ctx.port + 20000);
        // in der Sitzung: das Log der Welt (die Karte) und die Grundstellung als Befehl (`node "$PUNKTE_MASCHINE" grundstellung`:
        // eine Probe, die selbst mehrere frische Welten braucht — je nH, je Lauf —, holt sie so, nie mit eigenem Boot)
        if (sitz) Object.assign(env, { PUNKTE_SITZUNG_LOG: sitz.log, PUNKTE_MASCHINE: __filename.split(path.sep).join("/"), PUNKTE_SITZUNG_GRUND: sitz.grund || "",
            ...(sitz.strom ? { PUNKTE_SITZUNG_STROM: sitz.strom, PUNKTE_PROBE: sitz.probe } : {}) });
        // headless läuft ohne Karte: starteBrowser griffe lokal sonst die GPU (scripts/lib/software-gpu.cjs) — ohne Schloss
    if (!st.gpu) env.LINSE_GPU = "software";
    for (const [k, v] of Object.entries(st.env || {})) env[k] = ersetze(v, ctx);
    if (!st.gpu && env.LINSE_GPU !== "software") return rot("headless verlangt LINSE_GPU=software — die Karte nur unter dem Schloss");
        let exe;
        if (argv[0] === "node") exe = process.execPath;
        else {
            exe = ctx.bash;
            if (!exe) return rot("keine Git-bash gefunden (PUNKTE_BASH)");
        }
        argv = argv.slice(1);
        const zeugeDatei = st.gpu ? ctx.aus + ".gpu-zeuge.txt" : null;
        // DAS SCHLOSS DES RECHNERS (27.10., Takt 8): headless fuhr in 3 Bahnen ohne Schloss neben den Zeit-Stationen der Radeon —
        // profiband.K4#1 84 Hänger statt 0 (607d0c73: max 67 ms), klang.K5#2 p95 0,26 statt 0,11 ms. Darum nimmt auch eine
        // headless-Station ihren Platz im Schloss: ein Zeit-Lauf misst allein auf dem RECHNER, nie nur auf der Karte; die Karte bleibt
        // ihr verwehrt (LINSE_GPU=software), der Zeuge gilt nur GPU-Stationen. Ohne gpuLauf (die Läufer des Selbsttests) läuft sie frei.
        const schloss = !sitz && (st.gpu || !!ctx.gpuLauf);
        if (schloss) {
            if (!ctx.gpuLauf || !fs.existsSync(ctx.gpuLauf)) return rot("gpu-lauf.sh fehlt — eine GPU-Station läuft nie ohne Schloss");
            if (!ctx.bash) return rot("keine Git-bash gefunden (PUNKTE_BASH) für gpu-lauf.sh");
            argv = [ctx.gpuLauf, "punkte-" + ctx.geraet + "-" + ((ctx.bahn || 0) + 1), exe, ...argv];
            exe = ctx.bash;
            env.GPU_LAUF_MAX_S = String(deckelS);
            // das Platz-Schloss: ein Zeit-Lauf nimmt alle Plätze, ein Bild-Lauf einen von N (N = 1: das Ein-Platz-Schloss)
            env.GPU_LAUF_ART = istZeit(sts) ? "zeit" : "bild";
            env.GPU_LAUF_PLAETZE = String(ctx.plaetze || 1);
        }
        if (st.gpu) {
            // der Zeuge der Karte in JEDEM node-Prozess der Station (die Werkbank schreibt in ihr eigenes Log)
            env.PUNKTE_GPU_ZEUGE = zeugeDatei;
            env.NODE_OPTIONS = ((env.NODE_OPTIONS || "") + ' --require "' + ZEUGE_DATEI.split(path.sep).join("/") + '"').trim();
        }
        try { fs.rmSync(ctx.aus, { force: true }); } catch (_e) {}
        if (zeugeDatei) try { fs.rmSync(zeugeDatei, { force: true }); } catch (_e) {}
        if (!sitz) portRaeumen(ctx.band || ctx.port);
        let out = "", err = "", tot = false;
        let kind;
        try {
            kind = spawn(exe, argv, { cwd: ctx.baum, env, windowsHide: true, detached: process.platform !== "win32" });
        } catch (e) {
            return rot("Start: " + e.message);
        }
        const kappe = (s, d) => (s.length + d.length > 4 << 20 ? (s + d).slice(-(4 << 20)) : s + d);
        // DIE UHR: der Deckel einer GPU-Station zählt ab dem Schloss (die Zeile „gpu-lauf: Schloss …“) und liegt HINTER dem von
        // gpu-lauf.sh, das selbst beendet und löst (trap); davor ist sie die Wache über ein schweigendes gpu-lauf.sh (Nachtruhe und
        // Frist zählt es selbst — eine feste Summe Deckel + Frist riss jeden Lauf, der über die Nacht wartete)
        const stillS = ctx.stillS || SCHLOSS_STILL_S;
        let uhr = null, amSchloss = !schloss;
        const stelle = (s) => { clearTimeout(uhr); uhr = setTimeout(() => { tot = true; baumTot(kind.pid); }, s * 1000); };
        const lauscht = () => {
            if (amSchloss) return;
            if (/^gpu-lauf: Schloss /m.test(err) || /^gpu-lauf: Schloss /m.test(out)) { amSchloss = true; tSchloss = Date.now(); stelle(deckelS + 120); } else stelle(stillS);
        };
        kind.stdout.on("data", (d) => { out = kappe(out, String(d)); lauscht(); });
        kind.stderr.on("data", (d) => { err = kappe(err, String(d)); lauscht(); });
        stelle(schloss ? stillS : deckelS);
        kind.on("error", (e) => { clearTimeout(uhr); rot("Start: " + e.message); });
        // das Ende der Station ist das Ende ihres Prozesses, nie das Schließen der Rohre: ein Enkel, der sie erbt (der Herzschlag
        // `while sleep 300` in gpu-lauf.sh der OMEN), hielte "close" bis zu seinem Erwachen — 26.10.: jede GTX-Station dauerte
        // k × 5 min (fahrzeug.K3#1 5,02 gegen 1,07 auf der Radeon); nach "exit" bleiben den Rohren 2 s zum Leerlaufen
        let gemeldet = false;
        const ende = (code, sig) => {
            tEnde = tEnde || Date.now();
            if (gemeldet) return;
            gemeldet = true;
            kind.stdout.destroy();
            kind.stderr.destroy();
            abschluss(code, sig);
        };
        kind.on("exit", (code, sig) => ((tEnde = tEnde || Date.now()), setTimeout(() => ende(code, sig), 2000)));
        kind.on("close", ende);
        const abschluss = (code, sig) => {
            clearTimeout(uhr);
            if (!sitz) portRaeumen(ctx.band || ctx.port);
            // die Zeugen-Zeilen gehen in die Roh-Ausgabe (die Buchung liest sie dort), die Datei fällt; in der Sitzung zeugt die
            // Werkbank der Welt (ihr Zeuge zuerst), dazu jeder node-Prozess der Probe
            const zeugeText = (sitz && fs.existsSync(sitz.zeuge) ? fs.readFileSync(sitz.zeuge, "utf8") : "") +
                (zeugeDatei && fs.existsSync(zeugeDatei) ? fs.readFileSync(zeugeDatei, "utf8") : "");
            if (zeugeDatei) try { fs.rmSync(zeugeDatei, { force: true }); } catch (_e) {}
            if (ctx.roh) {
                fs.mkdirSync(path.dirname(ctx.roh), { recursive: true });
                fs.writeFileSync(ctx.roh, "$ " + [exe, ...argv].join(" ") + "\n" + out + (err ? "\n--- stderr ---\n" + err : "") +
                    (zeugeText ? "\n--- gpu-zeuge ---\n" + zeugeText : ""));
            }
            if (tot && !amSchloss) return offen("GPU-Schloss nie bekommen: gpu-lauf.sh schwieg " + stillS + " s beim Warten — beendet, ungemessen", code);
            // der Deckel nennt, wobei er traf: die letzte Zeile der Ausgabe (vegetation.K5#1 hieß an 715754fc und 73bdf938 nur „Deckel 60 s
            // überschritten“ — ihr erster Schuss stand nach 51 s, der zweite trug den Deckel); in der Sitzung ebenso die Wache
            const zuletzt = String(out).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).pop();
            const wobei = zuletzt ? " (zuletzt: " + zuletzt.slice(0, 160) + ")" : "";
            // DIE WACHE DER FAHRT: in der Sitzung ist eine Probe am Deckel UNGEMESSEN beim Namen (sie misst nicht, was sie soll — nie ROT,
            // nie GRÜN); der Rest der Fahrt kappte sie: die Fahrt riss FAHRT_MAX_S
            if (tot && sitz) return offen((fahrtKappt ? "Deckel der Fahrt " + (sitz.fahrtMaxS || FAHRT_MAX_S) + " s gerissen nach " + deckelS + " s der Probe" : "Deckel " + deckelS + " s gerissen") + " — beendet, UNGEMESSEN" + wobei, code);
            if (tot) return rot("Deckel " + (schloss ? deckelS + 120 : deckelS) + " s überschritten — beendet" + wobei, code);
            if (sig) return rot("Absturz: Signal " + sig, code);
            const blockiert = (/^SCHLOSS BLOCKIERT .*$/m.exec(out) || [""])[0].trim();
            if (schloss && code === 75) return offen("GPU-Schloss blockiert (gpu-lauf.sh Exit 75" + (blockiert ? ": " + blockiert : "") + ") — ungemessen", code);
            if (schloss && code === 124) return rot("GPU-Deckel " + deckelS + " s (gpu-lauf.sh Exit 124)", code);
            let j = null;
            if (fs.existsSync(ctx.aus))
                try { j = JSON.parse(fs.readFileSync(ctx.aus, "utf8")); } catch (_e) { j = null; }
            const m = min();
            // DIE WAND GPU: ohne Zeugen der Karte ist das Urteil einer GPU-Station ROT beim Grund
            const zeuge = st.gpu ? gpuZeuge(zeugeText + "\n" + out + "\n" + err) : null;
            const wand = zeuge && gpuWand(zeuge);
            const gz = zeuge ? { gpu: zeuge.karte, ...(zeuge.fremd ? { gpuFremd: zeuge.fremd } : {}), ...(zeuge.nie ? { gpuNie: zeuge.nie } : {}) } : {};
            ganz(sts.map((s) => {
                const r = (grund) => ({ gruen: false, zahl: grund, exit: code, minuten: m, grund, ...gz });
                let u;
                try {
                    // die Zeugen-Zeilen sind Ausgabe der Station, auch aus Kindern mit eigenem Log (werkbank --eigen am werkbankTor
                    // seit tk1-herde): das Urteil liest den Adapter wie die Wand GPU
                    u = s.urteil(j, { exit: code, stdout: out + (zeugeText ? "\n" + zeugeText : ""), stderr: err });
                } catch (e) {
                    return r("Urteil warf: " + String((e && e.message) || e).split("\n")[0]);
                }
                if (!u || typeof u.gruen !== "boolean" || typeof u.zahl !== "string" || !u.zahl)
                    return r("Urteil ungültig (verlangt { gruen: bool, zahl: Text })");
                if (wand) return { gruen: false, zahl: "Wand GPU: " + wand + " · " + u.zahl, exit: code, minuten: m, grund: "Wand GPU: " + wand, ...gz };
                return { gruen: u.gruen, zahl: u.zahl, exit: code, minuten: m, ...(u.gruen ? {} : { grund: "ROT: " + u.zahl }), ...gz };
            }));
        };
    });
}

function baumAmSha(repo, geraet, sha) {
    const baum = path.join(repo, ".claude", "worktrees", "punkte-" + geraet);
    if (!fs.existsSync(path.join(baum, ".git"))) {
        git(["worktree", "add", "--detach", baum, sha], repo);
    } else {
        git(["checkout", "-q", "--detach", "--force", sha], baum);
        git(["clean", "-fdq", "-e", "node_modules"], baum);
    }
    const ist = git(["rev-parse", "HEAD"], baum);
    if (ist !== sha) throw new Error("Spiel-Baum steht auf " + ist + " statt " + sha);
    const nm = path.join(baum, "node_modules");
    const ziel = path.join(repo, "node_modules");
    if (!fs.existsSync(ziel)) throw new Error("node_modules fehlt im Haupt-Klon " + ziel);
    if (!fs.existsSync(nm)) fs.symlinkSync(ziel, nm, "junction");
    return baum;
}

// die Sperre des Spiel-Baums: ein Ordner mit der pid des Halters; eine tote pid gilt als verwaist, gelöst wird beim Prozess-Ende
async function baumSperre(repo, geraet) {
    const sperre = path.join(repo, ".claude", "worktrees", "punkte-" + geraet + ".sperre");
    fs.mkdirSync(path.dirname(sperre), { recursive: true }); // ein frischer Klon trägt den Ordner noch nicht (sonst ENOENT vor dem ersten Baum)
    const lebt = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
    for (let gemeldet = false; ; ) {
        try {
            fs.mkdirSync(sperre);
            fs.writeFileSync(path.join(sperre, "pid"), String(process.pid));
            process.on("exit", () => fs.rmSync(sperre, { recursive: true, force: true }));
            return;
        } catch (e) {
            if (e.code !== "EEXIST") throw e;
            const pid = Number((fs.existsSync(path.join(sperre, "pid")) && fs.readFileSync(path.join(sperre, "pid"), "utf8")) || 0);
            if (pid && !lebt(pid)) { fs.rmSync(sperre, { recursive: true, force: true }); continue; }
            if (!gemeldet) { console.log("Punkte-Maschine: der Spiel-Baum " + geraet + " ist belegt (pid " + pid + "), warte"); gemeldet = true; }
            await new Promise((r) => setTimeout(r, 30000));
        }
    }
}

// ───────────────────────────────── Sitzung ─────────────────────────────────
// DIE SITZUNG (29.10.; der Schöpfer: „eine Messung eines Teilsystems über 10 min heißt, man besichtigt fast alle Funktionen — die Welt
// ist in Sekunden geladen“): je Gerät und SHA EINE Welt — save-server {PORT} und `werkbank start --echt` {PORT}+20000 im Spiel-Baum
// des Geräts, gehalten vom Halter (`punkte.cjs halter`), daneben das GANZE Schloss (gpu-lauf.sh um den Schloss-Halter, zeit, die
// CI-Ruhe einmal; `schlossNehmen`) — und darin jede Station mit `probe` in der Reihe sitzungsReihe. DAS SCHLOSS ZWISCHEN DEN PROBEN
// (Karte w4-grundstellung): wartet ein CI-Job darauf (`ci_wartet`, gpu-schloss.sh), gibt die Sitzung es an der Proben-Grenze frei und
// nimmt es danach neu — die Welt bleibt warm, das Warten zählt nie in die Fahrt. Bis dahin hielt die Sitzung es bis 55 min am Stück.
// DIE GRUNDSTELLUNG OHNE NEULADEN (29.10., Karte w4-grundstellung; der Schöpfer: „Die Welt ist in wenigen Sekunden geladen — das
// Prüftheater hat ein Ende“): nach der Reihe `anfang` nimmt die Sitzung den GRUND der Welt (das Spiel: `_grundstellung`, das
// Speicher-Gesetz samt GRUND_TAFEL), nach jeder mutierenden Probe oder einem Abbruch spielt sie ihn in die laufende Seite zurück
// (sonst nie); Ring, Fern-Ring, Streu, Kronen, Leib und Shader bleiben warm. Bis dahin leerte sie den Spielstand (localStorage, die
// Welten der IndexedDB, die Stand-Dateien des save-servers) und lud die Seite neu — die nächste Probe baute ihren Ring neu (Radeon
// b3f9ae95 29.10.: ~45 s je Probe, die Fahrt ~4 h). DIE TAFEL DER GRUNDSTELLUNG, je Größe ihr Wort zurück:
//   der Stand (Speicher-Gesetz, `_standRueckspielen`): Spieler-Ort und Leben, Uhr, Saison, Wetter und Wetter-Wort, das worldMeta
//     (Taten, Erdbau, Orte, Siedlungen), die Edits (je Reichweite neu, der Faden bekommt die Liste), die Werke (je Id), die Säcke
//     (Baupläne, Stoffe, Werkzeuge je Glied), Inventar, Hotbar, Seele, Regler, Wesen samt Leichen, Pfeile, Tagebuch, Gesetze, DSL;
//   die GRUND_TAFEL des Spiels: Ritt (aussteigen), Sicht, Blick, Nässe und Wetter-Übergang, die Zellen des Brands;
//   GRUND_SEITE (hier): die Globalen der Werkbank an der Seite (`umstellen`: Ort-Takt, Stellgrößen, Bahn, Dorf-Zug) — was beim Grund
//     fehlte, fällt —, das Fenster 1920×1080 (`/fenster`);
//   nie zurück: die Welt-Uhr (`spielZeit`, monoton, feld.K2#2), die Würfe des Gesetzes (sie folgen dem Ort, speicher.K3), die Caches.
// Weicht nach dem Rückspielen eine Größe vom Grund ab, trägt die Welt nicht mehr: die übrigen Proben sind ungemessen beim Namen der
// Größe, nie ROT. Verließ eine Probe die Welt (ein Tor), kehrt die Seite durch die Tür des Spiels zurück (`_weltBetreten`, dann
// `/reload`: ein Welt-Wechsel ist ein Reload, Ring 8) und spielt den Grund danach. Bis dahin fuhr jede Station ihren eigenen Boot
// (Takt 19: 282 min Schloss, 103 min Abbau-Schwanz). DER BOOT der Welt zählt in die Fahrt (fahrtUrteil): Radeon b3f9ae95 29.10.
// stand die Welt nach 10,5 und 40 s — der Deckel 120 s; das Schloss hält der Halter die Fahrt lang samt Abbau (SITZUNG_MAX_S).
// DER DECKEL NACH SEINER MESSUNG (w4-fehlt-acht): jeder Boot einer Sitzung seither 5,8–8,5 s (Radeon, gegenlauf/eich1–6 a53152c2 …
// 1f17e7d1, messung 3ed96b3f · 73bdf938 · 24a0f3ef; „SITZUNG bereit" ist die Werkbank, die Welt wächst danach am Ort der ersten Probe)
// — 60 s, das Anderthalbfache des Größten je gemessenen (40 s); ein Boot darüber ist ROT beim Namen (der Halter)
const SITZUNG_BOOT_S = 60;
const SITZUNG_MAX_S = FAHRT_MAX_S + 600;
const GRUNDSTELLUNG_S = 180;
const STAND_DATEIEN = ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"];
const GRUND_SEITE = ["__ortTakt", "__ortStell", "__ortSchritt", "__ortBahn", "__anazhAutoSettlement"];
// DIE WEGE-LINSE DER GRUNDSTELLUNG (w4-sitzung-reif; der Weg von tempo4 lag nach der Grundstellung weiter über der Mess-Wiese):
// `_stlWegeBuild` malt die Flächen eines Wegs in die Wege-Karte (`state.wegeKarte.siedlungen`), merkt seine Marke (`_stlWegeKeys`) und
// räumt die Natur auf ihm (`_wegeRaeumen`); `_standRueckspielen` lässt Karte und Natur als Caches warm — der Weg einer Probe (tempo4,
// die Straße von fahr-proben, ein erwachtes Dorf, die Stadt) blieb liegen, die Proben danach maßen neben ihm. Der Abdruck je Fläche
// ihr Rechteck auf 0,1 m und die Zahl ihrer Formen, dazu die Marken; läuft in der Seite (r = die Welt).
// DIE TRITTFLÄCHE IST KEIN GRUND (eich5 GTX 379e5f56, eich1 3ed95dcf ebenso: nach vegetation.K5 am Eich-Deckel ging die Grundstellung
// durch die Tür und fand „wege −17“ — 17 Kästen 2,1 m mit EINER Form längs des Wegs, den profiband.K4 vor dem Grund ging; die Sitzung
// endete, 64 Proben UNGEMESSEN): die Trittfläche der Ausstattung (Feuerstelle, Brunnen, Marktstand) setzt das Spiel einmal je Eintrag
// beim ersten Studio-Platz, transient, ohne Snapshot (`_trittFlaecheSetzen`, stamm/siedlung-wege.js) — die neue Seite setzt sie erst,
// wo der Eintrag wieder platziert wird. Der Abdruck trägt sie nie: sie hängt am Eintrag (`_trittBox`), und der Eintrag steht selbst im
// Grund (`architectures`); eine Fläche, die kein Eintrag trägt, bleibt ein Weg.
function wegeAbdruck(r) {
    const wk = r && r.state && r.state.wegeKarte, k = r && r._stlWegeKeys;
    const tritt = new Set(((r && r.state && r.state.architectures) || []).map((e) => e && e._trittBox).filter(Boolean));
    const f = (b) => [b.x0, b.z0, b.x1, b.z1].map((v) => Math.round(v * 10) / 10).join(",") + "/" + (b.formen ? b.formen.length : 0);
    return { flaechen: (wk ? wk.siedlungen : []).filter((b) => !tritt.has(b)).map(f).sort(), keys: k ? [...k].sort() : [] };
}
// die Abweichung vom Abdruck des Grunds beim Namen — „wege +n [Fläche] (neue Marken) −m [Fläche]“ — oder null; eine Marke, die fiel, ist
// keine (die Weltgrenze vergisst das Gedächtnis der Seite, `WELT_GRENZE.gedaechtnis`), eine neue auch ohne Fläche schon (die Natur,
// die ihr Weg räumte, kehrt an Ort und Stelle nicht zurück)
function wegeAbweichung(soll, ist) {
    const zahl = (L) => L.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
    const mehr = (A, B) => [...A.keys()].flatMap((x) => Array(Math.max(0, A.get(x) - (B.get(x) || 0))).fill(x));
    const [S, I] = [zahl(soll.flaechen || []), zahl(ist.flaechen || [])];
    const neu = mehr(I, S), fort = mehr(S, I), marken = (ist.keys || []).filter((x) => !(soll.keys || []).includes(x));
    if (!neu.length && !fort.length && !marken.length) return null;
    const liste = (L) => L.slice(0, 3).map((x) => "[" + x + "]").join(" ") + (L.length > 3 ? " …" : "");
    return "wege" + (neu.length ? " +" + neu.length + " " + liste(neu) : "") + (marken.length ? " (" + marken.slice(0, 4).join(", ") + ")" : "") +
        (fort.length ? " −" + fort.length + " " + liste(fort) : "");
}
const GRUND_NIMM =
    'if (typeof r._grundstellung !== "function") return { fehlt: true }; const t0 = performance.now(); const g = r._grundstellung(); ' +
    "return { grund: g.grund, n: Object.keys(g.abdruck).length, ms: +(performance.now() - t0).toFixed(1), welt: r.state.worldMeta.worldId, " +
    "seite: " + JSON.stringify(GRUND_SEITE) + ".filter((k) => k in window), wege: (" + wegeAbdruck + ")(r) };";
const grundSpielen = (g) =>
    "for (const k of " + JSON.stringify(GRUND_SEITE) + ") if (!" + JSON.stringify(g.seite) + ".includes(k)) delete window[k]; " +
    "const t0 = performance.now(); const z = r._grundstellung(" + JSON.stringify(g.grund) + "); " +
    "const weg = " + (g.wege ? "(" + wegeAbweichung + ")(" + JSON.stringify(g.wege) + ", (" + wegeAbdruck + ")(r))" : "null") + "; return { ok: z.ok, grund: z.grund || null, " +
    "anders: (z.anders || []).concat(" + JSON.stringify(GRUND_SEITE) + ".filter((k) => k in window && !" + JSON.stringify(g.seite) + ".includes(k)).map((k) => \"seite.\" + k), weg ? [weg] : []), " +
    "neu: z.neu || null, ms: +(performance.now() - t0).toFixed(1), welt: r.state.worldMeta && r.state.worldMeta.worldId, wie: (" + grundWie + ")(r, " +
    JSON.stringify(g.grund) + ", z.anders || []) };";
// WIE eine Größe vom Grund abweicht (Heilung 30.10.: „abweichend vom Grund: blueprints“ nannte nie den Täter): je Liste des Stands
// (Baupläne, Werke, Stoffe, Werkzeuge) die Glieder, die fehlen, neu sind oder anders stehen — je anderes Glied seine Felder; je
// worldMeta-Feld seine Länge vorher → nachher. Läuft in der Seite (r = die Welt), nur bei einer Abweichung
function grundWie(r, grund, anders) {
    if (!anders.length || !r || typeof r.buildStateSnapshot !== "function") return null;
    const soll = JSON.parse(grund).stand, ist = r.buildStateSnapshot(), J = (x) => JSON.stringify(x), wie = {};
    for (const k of anders) {
        const [a, b] = k.startsWith("worldMeta.") ? [(soll.worldMeta || {})[k.slice(10)], (ist.worldMeta || {})[k.slice(10)]] : [soll[k], ist[k]];
        if (!Array.isArray(a) && !Array.isArray(b)) {
            wie[k] = String(J(a)).slice(0, 80) + " → " + String(J(b)).slice(0, 80);
            continue;
        }
        const name = (e) => String(e && (e.name != null ? e.name : e.id != null ? e.id : J(e).slice(0, 40)));
        const A = new Map((a || []).map((e) => [name(e), e])), B = new Map((b || []).map((e) => [name(e), e]));
        const felder = (x, y) => Object.keys({ ...x, ...y }).filter((f) => J(x[f]) !== J(y[f])).slice(0, 6).join("/");
        // je Name seine ZAHL (ein Feld gleicher Glieder — Etiketten, „happy“ zweimal — zählt jedes; bis 30.10. faltete die Karte sie zu
        // einem und nannte 1 → 1 Glied gleich, wo 1 → 2 stand)
        const zahl = (L) => (L || []).reduce((m, e) => m.set(name(e), (m.get(name(e)) || 0) + 1), new Map());
        const [ZA, ZB] = [zahl(a), zahl(b)];
        const mehr = (X, Y) => [...X.keys()].filter((n) => X.get(n) > (Y.get(n) || 0)).map((n) => n + (X.get(n) - (Y.get(n) || 0) > 1 ? " ×" + (X.get(n) - (Y.get(n) || 0)) : ""));
        wie[k] = { vorher: (a || []).length, nachher: (b || []).length, fehlt: mehr(ZA, ZB).slice(0, 4),
            neu: mehr(ZB, ZA).slice(0, 4),
            anders: [...A.keys()].filter((n) => B.has(n) && J(A.get(n)) !== J(B.get(n))).slice(0, 4).map((n) => n + ":" + felder(A.get(n) || {}, B.get(n) || {})) };
    }
    return wie;
}
const GRUND_TUER =(g) => "const s = JSON.parse(" + JSON.stringify(g.grund) + ").stand; return r._weltBetreten(s, null, { neuLaden: false });";

// ein Ruf an die Werkbank MIT Frist (werkbankRuf des Spiels wartet ewig): Rückgabe die Antwort, wirft bei Frist und Fehler.
// JE RUF EINE VERBINDUNG (`agent: false`, Heilung 30.10.): der Agent von Node ≥ 19 hält den Socket offen (keepAlive), die Werkbank
// schließt einen ruhenden nach 5 s (keepAliveTimeout) — stand die Schleife des Läufers länger still (ciWartet als spawnSync: 20 s),
// nahm der nächste Ruf im selben Takt den toten Socket: „read ECONNRESET“ am ersten /fenster, die Welt galt als tot, 69 von 69
// Proben ungemessen (Radeon 3ed96b3f). Dieselbe Regel tragen die Rufe der Proben (sitzungTor, sitzungWerkzeug, sitzungLauf).
function rufFrist(port, weg, nutzlast, ms) {
    return new Promise((ja, nein) => {
        const req = require("http").request({ host: "127.0.0.1", port, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (r) => {
            let d = "";
            r.on("data", (c) => (d += c));
            r.on("end", () => { try { ja(JSON.parse(d)); } catch (_e) { ja({ roh: d }); } });
        });
        req.setTimeout(ms, () => req.destroy(new Error(weg + " ohne Antwort binnen " + Math.round(ms / 1000) + " s")));
        req.on("error", nein);
        req.end(JSON.stringify(nutzlast || {}));
    });
}
const lebtPid = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
const warteMs = (ms) => new Promise((r) => setTimeout(r, ms));
const httpDa = (port) => new Promise((r) => require("http").get("http://127.0.0.1:" + port + "/", (x) => (x.resume(), r(true))).on("error", () => r(false)));
// ist der Port zu? EIN Verbindungs-Versuch: abgewiesen heißt, niemand lauscht; ein lauschender Port nimmt sofort an, auch wenn sein
// Prozess gerade rechnet — eine Frist ohne Antwort heißt darum nie „zu“
const portZu = (port, ms = 3000) => new Promise((r) => {
    const s = require("net").connect({ host: "127.0.0.1", port });
    const ende = (zu) => { s.destroy(); r(zu); };
    s.setTimeout(ms, () => ende(false));
    s.once("connect", () => ende(false));
    s.once("error", () => ende(true));
});

// DER HALTER (`punkte.cjs halter --baum B --port P --log L --zeuge Z --stop F --eltern pid [--band p,p] [--welt stub.json]`): startet
// die Welt, meldet „SITZUNG bereit“ und hält sie, bis die Stop-Datei liegt, der Läufer stirbt oder die Werkbank endet; dann stop,
// Abbau, Ports frei. Die Werkbank trägt den Zeugen der Karte (gpu-zeuge.cjs → Z). --welt (nur der Selbsttest): { save, werkbank }
// als argv mit {S} {W}
async function halter(o) {
    const baum = path.resolve(o.baum), S = Number(o.port), W = S + 20000;
    const band = String(o.band || [S, W, W - 1].join(",")).split(",").filter(Boolean);
    const welt = o.welt ? JSON.parse(fs.readFileSync(o.welt, "utf8")) : null;
    const ers = (a) => String(a).replace(/\{S\}/g, String(S)).replace(/\{W\}/g, String(W));
    const exe = (a) => (a[0] === "node" ? process.execPath : a[0]);
    const t0 = Date.now();
    portRaeumen(band);
    for (const d of STAND_DATEIEN) fs.rmSync(path.join(baum, d), { force: true });
    const sl = fs.openSync(o.log + ".save", "w");
    const sa = (welt ? welt.save : ["node", "save-server.js"]).map(ers);
    const sv = spawn(exe(sa), sa.slice(1), { cwd: baum, env: { ...process.env, PORT: String(S) }, stdio: ["ignore", sl, sl], windowsHide: true });
    let wb = null;
    const ab = async (code, zeile) => {
        if (zeile) console.log(zeile);
        if (wb && wb.exitCode == null) {
            await rufFrist(W, "/stop", {}, 30000).catch(() => null);
            for (let i = 0; i < 20 && wb.exitCode == null; i++) await warteMs(500);
            if (wb.exitCode == null) baumTot(wb.pid);
        }
        if (sv.exitCode == null) baumTot(sv.pid);
        portRaeumen(band);
        for (const d of STAND_DATEIEN) fs.rmSync(path.join(baum, d), { force: true });
        process.exit(code);
    };
    for (let i = 0; !(await httpDa(S)); i++) {
        if (sv.exitCode != null || i > 60) return ab(1, "SITZUNG FEHLER der save-server auf " + S + " steht nicht (Exit " + sv.exitCode + ")");
        await warteMs(1000);
    }
    const wl = fs.openSync(o.log, "w");
    // DIE WELT DER SITZUNG OHNE DORF-ZUG (30.10.): `--ort wiese` legt den Dorf-Zug des Orts (haushalt.json `dorfZug: false`) vor das
    // erste Skript JEDER Ladung der Seite (werkbank START_ORT) — wie jede Messung, die mit `start --ort` bootete. Bis dahin bootete die
    // Sitzung ohne Ort: ein Dorf wuchs vom Boot an (`dorfWaechst` in 74 % der Zapfen des Eichlaufs 00763f54, die Foundry mit seinen
    // Häusern belegt — lod.K5#1 92 s Foundry), die Grundstellung spielte es zurück; ein Ort mit Dorf-Zug stellt ihn selbst an
    const wa = (welt ? welt.werkbank : ["node", "scripts/werkbank.cjs", "start", "--echt", "--port", String(W), "--seite", "http://localhost:" + S, "--ort", "wiese"]).map(ers);
    const env = { ...process.env, WERKBANK_PORT: String(W), PUNKTE_GPU_ZEUGE: path.resolve(o.zeuge),
        NODE_OPTIONS: ((process.env.NODE_OPTIONS || "") + ' --require "' + ZEUGE_DATEI.split(path.sep).join("/") + '"').trim() };
    wb = spawn(exe(wa), wa.slice(1), { cwd: baum, env, stdio: ["ignore", wl, wl], windowsHide: true });
    const log = () => (fs.existsSync(o.log) ? fs.readFileSync(o.log, "utf8") : "");
    for (let i = 0; !/WERKBANK bereit/.test(log()); i++) {
        if (wb.exitCode != null || /WERKBANK-FEHLER/.test(log()) || i > SITZUNG_BOOT_S * 2)
            return ab(1, "SITZUNG FEHLER die Werkbank startet nicht (Exit " + wb.exitCode + "): " + log().trim().split(/\r?\n/).slice(-3).join(" | ").slice(0, 400));
        await warteMs(500);
    }
    console.log("SITZUNG bereit :" + W + " nach " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
    const eltern = Number(o.eltern) || 0;
    for (;;) {
        if (fs.existsSync(o.stop)) return ab(0, "SITZUNG Ende");
        if (eltern && !lebtPid(eltern)) return ab(0, "SITZUNG Ende: der Läufer " + eltern + " lebt nicht mehr");
        if (wb.exitCode != null) return ab(1, "SITZUNG tot: die Werkbank endete (Exit " + wb.exitCode + "): " + log().trim().split(/\r?\n/).slice(-2).join(" | ").slice(0, 300));
        await warteMs(1000);
    }
}

// DER SCHLOSS-HALTER der Sitzung (Karte w4-grundstellung): gpu-lauf.sh (zeit, die CI-Ruhe einmal, Deckel SITZUNG_MAX_S) um einen
// Wartenden, der endet, wenn die Datei `los` liegt oder der Läufer stirbt — er hält das Schloss, nie die Welt: sie lebt daneben und
// bleibt warm, wenn die Sitzung das Schloss einem wartenden CI-Job gibt. Rückgabe { ok, kind, los, warten (min), grund?, ungemessen? }
function schlossNehmen(o, nr) {
    return new Promise((fertig) => {
        if (!o.bash) return fertig({ ok: false, grund: "keine Git-bash gefunden (PUNKTE_BASH) für gpu-lauf.sh" });
        const t0 = Date.now(), los = o.stop + ".los-" + nr;
        fs.rmSync(los, { force: true });
        const warte = 'const fs = require("fs"); const [los, p] = process.argv.slice(1); setInterval(() => { let da = true; ' +
            'try { process.kill(Number(p), 0); } catch (e) { da = e.code === "EPERM"; } if (fs.existsSync(los) || !da) process.exit(0); }, 500);';
        const env = { ...process.env, GPU_LAUF_ART: "zeit", GPU_LAUF_PLAETZE: "1", GPU_LAUF_MAX_S: String(SITZUNG_MAX_S) };
        delete env.NODE_OPTIONS;
        const kind = spawn(o.bash, [o.gpuLauf, "punkte-" + o.geraet + "-sitzung", process.execPath, "-e", warte, los, String(process.pid)],
            { cwd: o.baum, env, windowsHide: true, detached: process.platform !== "win32" });
        let out = "", gemeldet = false, uhr = null;
        const h = { kind, los, ende: new Promise((r) => kind.on("exit", (c) => r(c))), aus: () => out };
        const melde = (r) => {
            if (gemeldet) return;
            gemeldet = true;
            clearTimeout(uhr);
            fertig(Object.assign(h, { warten: +((Date.now() - t0) / 60000).toFixed(2) }, r));
        };
        const still = o.stillS || SCHLOSS_STILL_S;
        const lies = (d) => {
            out += String(d);
            if (/^gpu-lauf: Schloss /m.test(out)) return melde({ ok: true });
            clearTimeout(uhr);
            uhr = setTimeout(() => (baumTot(kind.pid), melde({ ok: false, ungemessen: true, grund: "GPU-Schloss nie bekommen: gpu-lauf.sh schwieg " + still + " s beim Warten" })), still * 1000);
        };
        kind.stdout.on("data", lies);
        kind.stderr.on("data", lies);
        lies("");
        kind.on("error", (e) => melde({ ok: false, grund: "gpu-lauf.sh: " + e.message }));
        kind.on("exit", (code) => setTimeout(() => {
            const blockiert = (/^SCHLOSS BLOCKIERT .*$/m.exec(out) || [""])[0].trim();
            if (code === 75) return melde({ ok: false, ungemessen: true, grund: "GPU-Schloss blockiert (gpu-lauf.sh Exit 75" + (blockiert ? ": " + blockiert : "") + ") — ungemessen" });
            melde({ ok: false, grund: "gpu-lauf.sh endete vor dem Schloss (Exit " + code + "): " + out.trim().split(/\r?\n/).slice(-2).join(" | ").slice(0, 300) });
        }, 300));
    });
}
// gibt das Schloss frei: der Wartende endet, gpu-lauf.sh löst (trap); sonst fällt sein Baum
async function schlossLoesen(h) {
    if (!h || !h.kind || h.kind.exitCode != null) return;
    fs.writeFileSync(h.los, "los\n");
    if ((await Promise.race([h.ende, warteMs(30000).then(() => "frist")])) === "frist") baumTot(h.kind.pid);
    fs.rmSync(h.los, { force: true });
}
// wartet ein CI-Job auf das Schloss? (gpu-schloss.sh neben gpu-lauf.sh: `ci_wartet`, die letzte Zeile von hook.log) — EIN Blick als
// eigener Prozess, nie im Takt des Läufers: Rückgabe ein Promise<bool> mit `.kind` (Heilung 30.10.: als spawnSync stand der Läufer an
// jeder Proben-Grenze, bis bash fertig war — Radeon-Laptop 5,2 s, mit Waisen daneben 20 s an der Frist und dann immer „nein“; derweil
// schloss die Werkbank den ruhenden Socket, rufFrist). Die Frist CI_BLICK_S fällt den Baum (ein hängendes bash): „nein“
const CI_BLICK_S = 60;
const ciWartet = (o) => {
    let kind = null;
    const p = new Promise((ja) => {
        try {
            kind = spawn(o.bash, ["-c", '. "$1" && ci_wartet', "ci", path.join(path.dirname(o.gpuLauf), "gpu-schloss.sh")],
                { env: { ...process.env, ...(o.hookLog ? { GPU_HOOK_LOG: o.hookLog } : {}) }, windowsHide: true, stdio: "ignore" });
        } catch (_e) {
            return ja(false);
        }
        const frist = setTimeout(() => baumTot(kind.pid), CI_BLICK_S * 1000);
        kind.on("error", () => (clearTimeout(frist), ja(false)));
        kind.on("exit", (c) => (clearTimeout(frist), ja(c === 0)));
    });
    p.kind = kind;
    return p;
};

// startet den Halter (daneben das GANZE Schloss, wenn gpuLauf: `schlossNehmen`); Rückgabe { ok, kind, schloss, warten (min), bootS, grund?, ungemessen? }
async function sitzungStarten(o) {
    const schloss = o.gpuLauf ? await schlossNehmen(o, 0) : null;
    if (schloss && !schloss.ok) return schloss;
    return new Promise((fertig) => {
        const t0 = Date.now();
        const argv = [__filename, "halter", "--baum", o.baum, "--port", String(o.port), "--log", o.log, "--zeuge", o.zeuge, "--stop", o.stop,
            "--eltern", String(process.pid), "--band", [].concat(o.band || o.port).join(","), ...(o.welt ? ["--welt", o.welt] : [])];
        const env = { ...process.env };
        delete env.NODE_OPTIONS; // der Zeuge sitzt in der Werkbank, nie im Halter (er nennt keine Karte)
        let out = "", gemeldet = false, uhr = null;
        const kind = spawn(process.execPath, argv, { cwd: o.baum, env, windowsHide: true, detached: process.platform !== "win32" });
        const s = { kind, schloss, ende: new Promise((r) => kind.on("exit", (c) => r(c))), aus: () => out, datei: o.log + ".halter" };
        const melde = (r) => {
            if (gemeldet) return;
            gemeldet = true;
            clearTimeout(uhr);
            fs.writeFileSync(o.log + ".halter", out);
            fertig(Object.assign(s, { warten: schloss ? schloss.warten : 0, bootS: +((Date.now() - t0) / 1000).toFixed(1) }, r));
        };
        const lies = (d) => {
            out += String(d);
            if (/^SITZUNG bereit/m.test(out)) return melde({ ok: true });
            clearTimeout(uhr);
            uhr = setTimeout(() => (baumTot(kind.pid), melde({ ok: false, grund: "die Welt der Sitzung steht nach " + (SITZUNG_BOOT_S + 120) + " s nicht" })), (SITZUNG_BOOT_S + 120) * 1000);
        };
        kind.stdout.on("data", lies);
        kind.stderr.on("data", lies);
        lies("");
        kind.on("error", (e) => melde({ ok: false, grund: "Halter: " + e.message }));
        kind.on("exit", (code) => setTimeout(() => {
            const f = (/^SITZUNG FEHLER (.*)$/m.exec(out) || [])[1];
            melde({ ok: false, grund: "die Welt der Sitzung startet nicht" + (f ? ": " + f : " (Halter Exit " + code + "): " + out.trim().split(/\r?\n/).slice(-2).join(" | ").slice(0, 300)) });
        }, 300));
    });
}
// legt die Stop-Datei, wartet auf das Ende des Halters, sonst fällt sein Baum; dann löst das Schloss
async function sitzungStoppen(s, stop) {
    fs.writeFileSync(stop, "stop\n");
    const ende = await Promise.race([s.ende, warteMs(90000).then(() => "frist")]);
    if (ende === "frist") baumTot(s.kind.pid);
    fs.writeFileSync(s.datei, s.aus());
    await schlossLoesen(s.schloss);
    return ende;
}
// DER GRUND der Welt (`_grundstellung` des Spiels) in die Datei `datei` (die Grundstellung der Sitzung und jeder Probe liest sie):
// Rückgabe { ok, n (Größen), s, grund? }
async function grundNehmen(w, datei) {
    const t0 = Date.now();
    try {
        const a = await rufFrist(w, "/eval", { code: GRUND_NIMM }, 60000);
        const e = a && a.ergebnis;
        if (e && e.fehlt) throw new Error("der Kopf trägt `_grundstellung` nicht (Karte w4-grundstellung)");
        if (!e || typeof e.grund !== "string") throw new Error("kein Grund: " + JSON.stringify(a).slice(0, 300));
        fs.writeFileSync(datei, JSON.stringify(e));
        return { ok: true, n: e.n, s: +((Date.now() - t0) / 1000).toFixed(1) };
    } catch (e) {
        return { ok: false, s: +((Date.now() - t0) / 1000).toFixed(1), grund: "der Grund der Welt: " + String((e && e.message) || e).split("\n")[0] };
    }
}
// DIE GRUNDSTELLUNG vor einer Probe: der Grund (`datei`) kehrt in die laufende Seite zurück, ohne Neuladen; hat eine Probe die Welt
// verlassen, durch die Tür und `/reload` (Ring 8). Rückgabe { ok, s, ms, neu, tuer?, grund? } — ROT nennt die abweichenden Größen.
// `o.abbruch` (Heilung 30.10.): die Probe davor fiel (Deckel, Absturz, Start) — ihre Seiten-Funktion lief weiter (Radeon 3ed96b3f:
// licht.K5#1 am Deckel, der Wetter-Zug drehte Tag-Länge, Wetter und Bühne weiter) und verdarb den Stand. Dann geht die Grundstellung
// IMMER durch die Tür: das Neuladen beendet jede Arbeit der gefallenen Probe in der Seite, ehe der Grund greift.
// DER WEG SEIT DEM GRUND (w4-sitzung-reif, die Wege-Linse `wegeAbweichung`): nennt das Rückspielen an Ort und Stelle einen Weg, den die
// Probe legte, geht die Grundstellung durch die Tür — die Lade-Kette des Speicher-Gesetzes baut Wege-Karte und Natur aus dem Grund
// neu (an Ort und Stelle bleiben beide warm, `_standRueckspielen`); steht der Weg auch danach, ist die Welt ROT beim Namen des Wegs.
// Rückgabe dann zusätzlich `wege` (der Weg, der durch die Tür ging)
async function grundstellung(w, datei, o = {}) {
    const t0 = Date.now();
    try {
        if (!datei || !fs.existsSync(datei)) throw new Error("kein Grund der Sitzung (" + datei + ")");
        const g = JSON.parse(fs.readFileSync(datei, "utf8"));
        const spiel = async () => {
            const a = await rufFrist(w, "/eval", { code: grundSpielen(g) }, 120000);
            if (!a || !a.ergebnis) throw new Error("/eval: " + JSON.stringify(a).slice(0, 300));
            return a.ergebnis;
        };
        let z = o.abbruch ? { ok: false, welt: null } : await spiel(), tuer = false;
        const wege = z.ok ? (z.anders || []).find((a) => /^wege\b/.test(a)) || null : null;
        if (wege) z = { ok: false, welt: null };
        if (!z.ok && z.welt !== g.welt) {
            const t = await rufFrist(w, "/eval", { code: GRUND_TUER(g) }, 60000);
            if (!t || !t.ergebnis || !t.ergebnis.ok) throw new Error("die Tür zurück in die Welt " + g.welt + ": " + JSON.stringify(t).slice(0, 300));
            const n = await rufFrist(w, "/reload", {}, GRUNDSTELLUNG_S * 1000);
            if (!n || n.neu !== true) throw new Error("/reload: " + JSON.stringify(n).slice(0, 300));
            (z = await spiel()), (tuer = true);
        }
        if (!z.ok) throw new Error(z.grund || "das Rückspielen scheitert");
        if (z.anders.length) throw new Error("abweichend vom Grund: " + z.anders.join(" ") + (z.wie ? " · wie " + JSON.stringify(z.wie).slice(0, 600) : ""));
        // das Fenster wie beim Start der Welt (1920×1080): eine Probe davor stellte es vielleicht anders
        const f = await rufFrist(w, "/fenster", {}, 30000);
        if (!f || !Array.isArray(f.fenster)) throw new Error("/fenster: " + JSON.stringify(f).slice(0, 300));
        return { ok: true, s: +((Date.now() - t0) / 1000).toFixed(1), ms: z.ms, neu: z.neu, ...(tuer ? { tuer } : {}), ...(wege ? { wege } : {}) };
    } catch (e) {
        return { ok: false, s: +((Date.now() - t0) / 1000).toFixed(1), grund: String((e && e.message) || e).split("\n")[0] };
    }
}
// DIE GRUNDPROBE (`punkte.cjs grundprobe --baum <Spiel-Baum> [--mutante <zeile>] [--port P]`, Null-Renderer, Karte w4-grundstellung):
// eine Welt des Spiel-Baums (welt-boot `nullSeite`), der Grund über DIESELBE Zeile wie die Sitzung (GRUND_NIMM), dann gräbt der
// Spieler, baut einen Block, sieht von außen und wendet den Blick, steigt in einen Wagen, die Uhr springt, ein Feuer fängt, Regen zieht auf,
// die Tag-Länge springt auf 1e9 (der Wetter-Zug von licht.K5#1, am Deckel ohne sein finally: Radeon 30.10.) und ein Ort-Takt der Werkbank
// hängt an der Seite — und die Grundstellung der Sitzung (`grundSpielen`) spielt den Grund zurück: GRÜN, wenn jede Tat geschah und
// danach keine Größe vom Grund abweicht. `--mutante <zeile>`: das Wort dieser Zeile der GRUND_TAFEL schweigt (`uhr`: der EINE
// Uhr-Schreiber des Spiels, eine Größe des Stands) — gefangen nur, wenn genau `augenblick.<zeile>` (`timeOfDay`) abweicht: die Mutante
// ROT beim Namen. Exit 0 GRÜN bzw. gefangen, 1 sonst.
// `--mutante weg` (w4-sitzung-reif): eine Probe legt ihren Weg wie tempo4 (`_stlWegeBuild` mit der Marke `probe:grundprobe`, die Natur
// weicht ihm) und räumt ihn nie — gefangen nur, wenn das Rückspielen an Ort und Stelle genau ihn nennt (die Wege-Linse,
// `wegeAbweichung`); mit `--tuer` spielt die Grundprobe danach wie die Sitzung den Grund durch die Tür zurück, und der Weg ist fort.
async function grundProbe(o) {
    const baum = path.resolve(o.baum || "."), port = Number(o.port || 4741);
    const { statikServer, nullSeite } = require(path.join(baum, "scripts", "lib", "welt-boot.cjs"));
    const server = statikServer();
    await server.lausche(port);
    const { browser, page } = await nullSeite({ frist: 600000 });
    const ev = (code) => page.evaluate((c) => new Function("r", "T", "return (async () => { " + c + " })();")(window.anazhRealm, window.THREE), code);
    try {
        await server.zeige(page);
        await page.evaluate(() => window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId));
        // die Welt läuft an (100 Takte à 100 ms Spielzeit), wie vor der ersten mutierenden Probe der Sitzung
        await ev("let t = performance.now(); for (let i = 1; i <= 100; i++) if ((r._gameLoopTick((t += 100)), i % 5 === 0)) await new Promise((f) => setTimeout(f, 0));");
        // der Grund trägt einen eigenen Bauplan mit einem Teil OHNE opChain — geboren wie die Werke des Fachwerks (bank_sitzbank …)
        // … und ein trauriges Tier (das Gefühls-Etikett, die Projektion, die das Speicher-Gesetz trägt — wie nach oekologie.K4#2)
        await ev("if (r.state.creatureEmotions.length) r.state.creatureEmotions[0] = \"sad\";");
        await ev("r.createBlueprint(\"grundprobe_alt\", \"Grundprobe alt\"); r.state.blueprints.grundprobe_alt.parts.push({ shape: \"box\", material: \"holz\", position: { x: 0, y: 0.5, z: 0 }, size: { x: 1, y: 1, z: 1 } });");
        const g = await ev(GRUND_NIMM);
        if (!g || typeof g.grund !== "string") throw new Error("kein Grund: " + JSON.stringify(g).slice(0, 300));
        const tat = await ev(`const st = r.state, q = st.playerMesh.position.clone(), cs = r.constructor.LIFE_FIELD.cell;
            const y = (dx) => r._terrainMacroSurfaceY(q.x + dx, q.z);
            const edit = r.carveVoxel(q.x + 6, y(6) - 1, q.z, 2);
            const bau = !!r.spawnArchitecture("stein_block", { x: q.x + 20, y: y(20), z: q.z }, { werk: true });
            r.setCameraMode("third");
            [st.yaw, st.pitch] = [st.yaw + 1.3, 0.2];
            const ritt = r.mountArchitecture(r.spawnArchitecture("fahrzeug_gt", { x: q.x - 20, y: y(-20) + 0.5, z: q.z }, { silent: true })).ok;
            // die Hand nimmt ein Schwert (eich8 GTX 379e5f56: halten.K1#2 ließ das Langschwert in der Hand, der Grund trug die leere —
            // die Lade-Kette setzte nur volle Slots, die Sitzung endete an „playerEquipped“)
            const hand = !st.player.equipped?.held && r.equipHeld("klinge_langschwert").ok && st.player.equipped.held === "klinge_langschwert";
            // der Weg der Probe (Mutante weg): 6 m breit, 60 m lang neben dem Spieler — wie tempo4 und die Straße von fahr-proben
            const weg = ${JSON.stringify(o.mutante || null)} === "weg" ? r._stlWegeBuild({ roads: [{ pts: [{ x: 0, z: 0 }, { x: 0, z: 60 }], w: 6 }] }, { x: q.x + 40, z: q.z - 30 }, "probe:grundprobe") : 0;
            const wegFlaeche = weg ? (${wegeAbdruck})(r).flaechen.find((f) => !${JSON.stringify((g.wege && g.wege.flaechen) || [])}.includes(f)) || null : null;
            r.setTimeOfDay(0.9, "regler");
            for (let i = 0; i < 625 && !r._brandEntfachen(q.x + ((i % 25) - 12) * cs, q.z + (((i / 25) | 0) - 12) * cs); i++);
            let t = performance.now();
            for (let i = 1; i <= 30; i++) if ((r._gameLoopTick((t += 100)), i % 5 === 0)) await new Promise((f) => setTimeout(f, 0));
            r._setWeather("rainy", "regler");
            st.dayLengthMinutes = 1e9; // der Wetter-Zug von licht.K5#1 (licht-linsen wetterZug), am Deckel ohne sein finally
            delete st.blueprints.grundprobe_alt;
            const plan = r.createBlueprint("grundprobe_neu", "Grundprobe neu");
            const erd = r._erdbauSetzen("grundprobe", [{ art: "platte", cx: q.x + 30, cz: q.z, phi: 0, ex: 3, ez: 3, y: y(30) }], false);
            // der Bestand weicht ab: JEDES Tier fällt (wie das Rudel von oekologie.K4#2 — die Wiederkehr steht vor einer leeren Liste)
            const tiere0 = st.creatures.length;
            for (const c of st.creatures.slice()) r.removeCreature(c);
            const tiere = tiere0 > 1 && st.creatures.length === 0 && st.creatureEmotions.length === 0;
            window.__ortTakt = [];
            const z = r.constructor.GRUND_TAFEL.find((z) => z[0] === ${JSON.stringify(o.mutante || null)});
            if (z) z[2] = () => {};
            if (${JSON.stringify(o.mutante || null)} === "uhr") r._uhrSetzen = () => false;
            // die Mutanten des Stands: die Kette bringt eine Größe nicht zurück — Baupläne (das Laden), Werke (Abriss und Bau), Erdbau
            const mut = ${JSON.stringify(o.mutante || null)};
            if (mut === "bauplaene") r._deserializeBlueprint = () => null;
            if (mut === "werk") (r._bauAusStand = () => false), (r.removeArchitecture = () => {});
            if (mut === "wesen") r._restoreCreatureFromSnapshot = () => false;
            if (mut === "gefuehl") { const S0 = r.spawnCreatures.bind(r); r.spawnCreatures = (...a) => { const x = S0(...a); r.state.creatureEmotions = r.state.creatureEmotions.map(() => "happy"); return x; }; }
            if (mut === "erdbau") { const L = r.loadState.bind(r), E = st.worldMeta.erdbau; r.loadState = (s) => { const x = L(s); r.state.worldMeta.erdbau = E; return x; }; }
            return { edit, bau, ritt, hand, weg, wegFlaeche, uhr: st.timeOfDay, feuer: st.brandFeld ? st.brandFeld.size : 0, wetter: st.weather, tag: st.dayLengthMinutes, plan, erd, tiere, mutante: !!z || r._uhrSetzen.length === 0 || ["bauplaene", "werk", "erdbau", "wesen", "gefuehl", "weg"].includes(mut) };`);
        const z = await ev(grundSpielen(g));
        const soll = !o.mutante ? [] : { uhr: ["timeOfDay"], bauplaene: ["blueprints"], werk: ["architectures"], erdbau: ["worldMeta.erdbau"], wesen: ["creatures", "creatureEmotions"], gefuehl: ["creatureEmotions"], weg: ["wege +1 [x0,z0,x1,z1/Formen]"] }[o.mutante] || ["augenblick." + o.mutante];
        const taten = tat.edit && tat.bau && tat.ritt && tat.hand && tat.feuer > 0 && tat.wetter === "rainy" && tat.tag === 1e9 && tat.plan && tat.erd && tat.tiere && (!o.mutante || tat.mutante) && (o.mutante !== "weg" || (tat.weg > 0 && !!tat.wegFlaeche));
        // die Wege-Linse nennt den Weg beim Rechteck seiner Fläche (6 × 66 m, 40 m neben dem Spieler; die Tat nennt sie, wie die Karte sie
        // trägt) — seine Marke nur, solange das Gedächtnis der Seite steht (ein anderes worldMeta beim Rückspielen vergisst `_stlWegeKeys`,
        // WELT_GRENZE): gefangen ist er, wenn genau DIESE neue Fläche abweicht
        const passt = (x) => (o.mutante === "weg" ? x.anders.length === 1 && new RegExp("^wege \\+1 \\[" + String(tat.wegFlaeche).replace(/[.]/g, "\\.") + "\\]( \\(probe:grundprobe\\))?$").test(x.anders[0])
            : JSON.stringify(x.anders) === JSON.stringify(soll));
        let z2 = null;
        // DIE TÜR (`--tuer`): die Seite lädt neu wie in der Sitzung nach einer gefallenen Probe — der Grund durch `_weltBetreten` (abgelegt,
        // aktiv), dann die Seite neu, dann das Rückspielen
        if (o.tuer || o.welt) {
            // `--welt <spec-Pfad>`: zuvor betritt die Seite eine andere Welt wie der Messort buehne (`importWorldBeside` mit reload)
            if (o.welt) {
                const j = JSON.parse(fs.readFileSync(path.join(baum, "spec", o.welt), "utf8"));
                const nav = page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 0 });
                const x = await page.evaluate((j) => { const x = window.anazhRealm.importWorldBeside(j, { reload: true }); return x && x.ok ? { id: x.worldId } : { fehler: JSON.stringify(x).slice(0, 200) }; }, j);
                if (x.fehler) throw new Error("die Welt " + o.welt + ": " + x.fehler);
                await nav;
                await page.evaluate(() => window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId));
                await ev("let t = performance.now(); for (let i = 1; i <= 20; i++) if ((r._gameLoopTick((t += 100)), i % 5 === 0)) await new Promise((f) => setTimeout(f, 0));");
            }
            const tuer = await ev(GRUND_TUER(g));
            if (!tuer || !tuer.ok) throw new Error("die Tür: " + JSON.stringify(tuer).slice(0, 300));
            await page.reload({ waitUntil: "domcontentloaded" });
            await page.evaluate(() => window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId));
            await ev("let t = performance.now(); for (let i = 1; i <= 20; i++) if ((r._gameLoopTick((t += 100)), i % 5 === 0)) await new Promise((f) => setTimeout(f, 0));");
            // nach der Tür spielt die Sitzung den Grund noch einmal (grundstellung): ohne Mutante und mit dem Weg steht danach jede Größe im Grund
            if (!o.mutante || o.mutante === "weg") z2 = await ev(grundSpielen(g));
        }
        const gruen = taten && z.ok && passt(z) && (!z2 || (z2.ok && z2.anders.length === 0));
        const wie = o.mutante ? "MUTANTE " + o.mutante + (gruen ? " ROT beim Namen" : " NICHT beim Namen gefangen") : gruen ? "GRÜN" : "ROT";
        console.log("GRUNDPROBE " + wie +
            " · Grund " + g.n + " Größen (" + g.ms + " ms) · Taten " + JSON.stringify(tat) + " · zurück in " + z.ms + " ms, neu " + JSON.stringify(z.neu) +
            " · abweichend: " + (z.anders.join(" ") || "keine") + (z.ok ? "" : " · " + z.grund) + " · Soll " + (soll.join(" ") || "keine") +
            (z2 ? " · nach der Tür abweichend: " + (z2.ok ? z2.anders.join(" ") || "keine" : z2.grund) : ""));
        return gruen;
    } finally {
        await browser.close();
        server.close();
    }
}
// ───────────────────────────────── Der Strom ─────────────────────────────────
// DER AUFNEHMER DER SITZUNG (29.10., der Schöpfer: „Eine komplette Fahrt durch jedes System max 30 min, inbegriffen ist dann auch
// die Dauerlast"): über die GANZE Sitzung je präsentiertem Bild der Welt EINE Zeile — die Bild-Zeit (rAF zu rAF unter derselben
// Schleife, nur gerenderte Bilder: `_gpuLeine.gerendert`, wie `werkbank lauf`), der Takt (der ganze rAF-Rückruf: Spiel-Takt samt
// Ort-Takt), VRAM (`__vram`, der Abgriff), die GPU-Summe des Bilds, wenn der Regler sie neu las (`_gpuTsLast`, dieselbe Quelle
// wie `lauf`), Befehle und Dreiecke (`renderer.info` — das Spiel setzt es je Bild zurück, `_loopRender`), Ort, Sicht, Sattel,
// Regler, Tier-Halt, Drossel, Wetter und die Zelle, die eine Probe gerade misst. Der Haken sitzt an `renderer.setAnimationLoop`
// der Seite: er sieht jedes Bild, das eine Schleife zeigt (lauf, haenger, eval, der Loop der Werkbank), nie die Takte von Hand
// (umstellen, band, gpu-bank — sie zeigen kein Bild). Gezapft wird alle STROM_TAKT_MS und an jeder Proben-Grenze (dann trägt der
// Block die Probe); eine neue Seite (Grundstellung, Welt-Tor) zieht ihn beim nächsten Zapfen neu ein. Ein Fehler des Hakens
// stört nie das Spiel und steht gezählt im Strom (`fehler`). Spalten: STROM_SPALTEN; der Leser: stromLesen.
const STROM_SPALTEN = ["t", "dt", "takt", "vram", "gpu", "befehle", "dreiecke", "x", "z", "sicht", "sattel", "voll", "halt", "last", "wetter", "zelle"];
const STROM_TAKT_MS = 1000;
const STROM_FRIST_MS = 10000;
// in der Seite (werkbank /eval, r = die Welt): zieht den Haken ein (einmal je Seite und Renderer), setzt mit a.zelle die Zelle
// der folgenden Bilder (null: keine) und gibt die Zeilen seit dem letzten Zapfen zurück
function stromSeite(r, a) {
    const st = r && r.state, rend = st && st.renderer;
    if (!rend || typeof rend.setAnimationLoop !== "function") return { bereit: false, grund: "kein Renderer" };
    let S = window.__punkteStrom;
    const neu = !S;
    if (!S)
        S = window.__punkteStrom = { seite: Math.random().toString(36).slice(2, 10), ursprung: Math.round(performance.timeOrigin), zeilen: [],
            namen: { wetter: [], zelle: [] }, zelle: -1, tv: null, gpuAm: null, verloren: 0, fehler: 0, letzterFehler: null, rend: null };
    const nr = (liste, x) => {
        let i = liste.indexOf(x);
        if (i < 0) (i = liste.length), liste.push(x);
        return i;
    };
    // JE RENDERER EIN HAKEN, NIE AN EINER LOSEN LEINWAND (w4-fehlt-acht): eine Probe, die der Welt einen Probe-Renderer leiht (lod.K3#1,
    // `__fimpBacke`: `r.state.renderer` je Bake-Schritt), hakte ihn ein, und der nächste Zapfen hakte den der Welt ein ZWEITES Mal — je
    // Bild zwei Zeilen, die zweite mit dt 0 (das p95 der Dauerlast geschönt). Ein Renderer, dessen Leinwand nicht im Dokument hängt,
    // zeichnet kein Bild des Spielers: der Zapfen liest weiter, hakt ihn nie ein
    S.haken = S.haken || new WeakSet();
    const lose = !!rend.domElement && rend.domElement.isConnected === false;
    if (!lose && S.rend !== rend && S.haken.has(rend)) S.rend = rend;
    if (!lose && S.rend !== rend) {
        S.rend = rend;
        S.haken.add(rend);
        const roh = rend.setAnimationLoop;
        const bild = (t, c0, g0) => {
            const L = r._gpuLeine;
            if (!L || !(L.gerendert > g0)) return;
            const c1 = performance.now(), dt = S.tv == null ? -1 : t - S.tv;
            S.tv = t;
            let gpu = -1;
            if (r._gpuTsAtMs !== S.gpuAm) {
                S.gpuAm = r._gpuTsAtMs;
                if (Number.isFinite(r._gpuTsLast)) gpu = r._gpuTsLast;
            }
            const v = window.__vram, i = rend.info && rend.info.render, p = st.playerMesh && st.playerMesh.position, z = S.zeilen;
            if (z.length >= 120000) (z.splice(0, 20000), (S.verloren += 20000));
            z.push([+t.toFixed(1), dt < 0 ? -1 : +dt.toFixed(2), +(c1 - c0).toFixed(2), v ? +((v.puffer + v.texturen) / 1048576).toFixed(1) : -1,
                gpu >= 0 ? +gpu.toFixed(2) : -1, i ? i.drawCalls : -1, i ? Math.round(i.triangles) : -1, p ? +p.x.toFixed(1) : 0, p ? +p.z.toFixed(1) : 0,
                st.cameraMode === "first" ? 1 : st.cameraMode === "third" ? 2 : 0, st.player && st.player.mountedArch ? 1 : 0, st.perfTargetMs >= 1000 ? 1 : 0,
                Object.getPrototypeOf(r).__tiereGehalten ? 1 : 0, st.perfSense ? +st.perfSense.loadScale.toFixed(2) : -1, nr(S.namen.wetter, String(st.weather)), S.zelle]);
        };
        const huelle = (cb) =>
            function (t, x) {
                const c0 = performance.now(), L = r._gpuLeine, g0 = L ? L.gerendert : 0;
                try {
                    return cb.call(this, t, x);
                } finally {
                    try {
                        bild(t, c0, g0);
                    } catch (e) {
                        S.fehler++;
                        S.letzterFehler = String((e && e.message) || e).slice(0, 160);
                    }
                }
            };
        rend.setAnimationLoop = function (cb) {
            S.tv = null;
            return roh.call(this, typeof cb === "function" ? huelle(cb) : cb);
        };
        // eine Schleife, die vor dem Haken lief, fährt ab jetzt durch ihn
        const a0 = rend._animation && rend._animation._animationLoop;
        if (typeof a0 === "function") rend.setAnimationLoop(a0);
    }
    if (a && "zelle" in a) S.zelle = a.zelle == null ? -1 : nr(S.namen.zelle, String(a.zelle));
    const zeilen = S.zeilen;
    S.zeilen = [];
    const lies = (f) => {
        try {
            return f();
        } catch (_e) {
            return null;
        }
    };
    const m = performance.memory;
    return {
        bereit: true, neu, seite: S.seite, ursprung: S.ursprung, zeilen, namen: S.namen, verloren: S.verloren, fehler: S.fehler, letzterFehler: S.letzterFehler,
        heap: m ? +(m.usedJSHeapSize / 1048576).toFixed(1) : null, skala: lies(() => r._szeneSkalaWirk()),
        buehne: lies(() => st.creatures.filter((c) => c.userData && c.userData.buehne).length),
        stempel: lies(() => (window.__stempelWache ? window.__stempelWache().ueberlauf : null)),
        uhr: Number.isFinite(st.timeOfDay) ? +st.timeOfDay.toFixed(3) : null, chunks: st.voxelChunks ? st.voxelChunks.size : null,
        // der Ort des Spielers und der gebaute Ring je Zapfen (30.10.: wo jede Probe stand und wie lange ihr Ring brauchte — auch ohne Bild)
        ort: lies(() => [+st.playerMesh.position.x.toFixed(1), +st.playerMesh.position.z.toFixed(1)]), ring: lies(() => r._builtRingRadius()),
        // was die Welt noch baut (band-urteil `einschwingOffen`: Foundry, Karten-Bake, Dorf, Streu, Chunks) — die Zeit einer Probe nach Ursache
        offen: lies(() => (typeof window.__einschwingOffen === "function" ? Object.keys(window.__einschwingOffen(r)) : null)),
    };
}
const stromCode = (a) => "return (" + stromSeite.toString() + ")(r, " + JSON.stringify(a || {}) + ");";
// EIN Zapfen: die Zeilen seit dem letzten an den Strom (eine JSON-Zeile je Block, mit der Probe); Rückgabe { ok, n?, grund? } —
// wirft nie (ein Zapfen, der scheitert, ist eine Lücke im Strom, nie ein Bruch der Probe)
async function stromZapfen(w, datei, probe, a = {}) {
    let e;
    try {
        const x = await rufFrist(w, "/eval", { code: stromCode(a) }, STROM_FRIST_MS);
        e = x && x.ergebnis;
        if (!e) throw new Error((x && typeof x.fehler === "string" && x.fehler) || "kein Ergebnis");
    } catch (x) {
        return { ok: false, grund: String((x && x.message) || x).split("\n")[0].slice(0, 200) };
    }
    if (!e.bereit) return { ok: false, grund: e.grund || "nicht bereit" };
    fs.appendFileSync(datei, JSON.stringify({ probe, zeit: new Date().toISOString(), ...e }) + "\n");
    return { ok: true, n: e.zeilen.length, seite: e.seite, fehler: e.fehler };
}
// EINE Marke im Strom (eine Probe nennt einen Stand der Welt beim Namen, z. B. den GC-Stand am Anfang der Dauer)
function stromMarke(datei, probe, marke, wert) {
    fs.appendFileSync(datei, JSON.stringify({ probe, zeit: new Date().toISOString(), marke, wert }) + "\n");
}
// DER LESER des Stroms: { bilder: [{ probe, seite, block, wand, …STROM_SPALTEN, uhr, skala, buehne, heap, stempelOk }], marken: [{ probe,
// zeit, marke, wert, bild }], bloecke, seiten, fehler, verloren } — wand = die Wanduhr des Bilds (ms seit 1970), stempelOk: im Block lief
// der Stempel-Pool nicht über, bild = die Zahl der Bilder vor der Marke
function stromLesen(datei) {
    const o = { bilder: [], marken: [], bloecke: 0, seiten: [], fehler: 0, verloren: 0 };
    if (!fs.existsSync(datei)) return o;
    const stempelVor = new Map();
    for (const zeile of fs.readFileSync(datei, "utf8").split(/\r?\n/)) {
        if (!zeile.trim()) continue;
        let b;
        try {
            b = JSON.parse(zeile);
        } catch (_e) {
            continue;
        }
        if (b.marke) {
            o.marken.push({ probe: b.probe, zeit: b.zeit, marke: b.marke, wert: b.wert, bild: o.bilder.length });
            continue;
        }
        const block = o.bloecke++;
        if (!o.seiten.includes(b.seite)) o.seiten.push(b.seite);
        o.fehler = Math.max(o.fehler, b.fehler || 0);
        o.verloren = Math.max(o.verloren, b.verloren || 0);
        const sv = stempelVor.get(b.seite);
        const stempelOk = b.stempel == null || sv == null || b.stempel === sv;
        if (b.stempel != null) stempelVor.set(b.seite, b.stempel);
        for (const z of b.zeilen || []) {
            const f = { probe: b.probe, seite: b.seite, block, wand: b.ursprung + z[0], uhr: b.uhr, skala: b.skala, buehne: b.buehne, heap: b.heap, stempelOk };
            STROM_SPALTEN.forEach((k, i) => (f[k] = z[i]));
            f.wetter = (b.namen && b.namen.wetter[f.wetter]) || null;
            f.zelle = f.zelle >= 0 ? (b.namen && b.namen.zelle[f.zelle]) || null : null;
            o.bilder.push(f);
        }
    }
    return o;
}
// der Kopf des Stroms für die Mess-Datei (m.sitzung.strom): die Dauerlast der ganzen Sitzung — Bilder, Bild-p95, Takt-p95, VRAM
const p95Von = (a) => {
    const s = a.filter(Number.isFinite).sort((x, y) => x - y);
    return s.length ? s[Math.min(s.length - 1, Math.floor(0.95 * s.length))] : null;
};
function stromKopf(datei, zaehler) {
    const s = stromLesen(datei);
    const dt = s.bilder.filter((b) => b.dt >= 0);
    return { datei: path.basename(datei), bilder: dt.length, frameP95: p95Von(dt.map((b) => b.dt)), taktP95: p95Von(dt.map((b) => b.takt)),
        vramMax: s.bilder.length ? s.bilder.reduce((m, b) => Math.max(m, b.vram), -Infinity) : null, seiten: s.seiten.length, marken: s.marken.length,
        fehler: s.fehler, verloren: s.verloren, ...zaehler };
}

// DIE REIHE DER SITZUNG (29.10., EINE Fahrt durch jedes System ≤ 30 min samt Dauerlast): zuerst `stellung: "anfang"`, dann jede
// Probe, die die Welt lässt, dann `stellung: "ende"`, dann jede mutierende (`mutiert: true`) — die Dauer von anfang bis ende lebt
// in EINER Seite ohne Neuladen; je in der Gruppe die Reihe der Liste
const stellungVon = (g) => (g[0].probe && g[0].probe.stellung) || null;
const mutiertVon = (g) => g.some((st) => !!(st.probe && st.probe.mutiert));
// DER ORT EINER PROBE (30.10., Eichlauf a53152c2: 14 von 19 Proben fielen am ×3-Deckel, sie warteten im eigenen `/umstellen` auf den
// Ring ihres Messorts — nach jeder Tür kalt): der erste Messort, an den ihr Befehl umstellt (`umstellen --ort X` der Werkbank, `/umstellen
// { ort: "X" }` des Tors), aus dem Befehl selbst gelesen — nie eine zweite Liste; null: sie nennt keinen (Koordinaten, ein Ort aus einer
// Variablen). In der Gruppe stehen die Proben eines Orts beieinander (die Reihe ihres ersten Auftritts), die ohne Ort zuletzt
// (der vierte: der Plan eines Vegetations-Laufs, `[[Ort, Sicht, …], …]` als letztes Argument — sein erster Stand, w4-sitzung-reif)
const ORT_MUSTER = [/umstellen\\?",\\?"--ort\\?",\\?"([a-z0-9_-]+)/, /umstellen\\?", \{ ort: \\?"([a-z0-9_-]+)/, /umstellen --ort ([a-z0-9_-]+)/,
    / \[\["([a-z0-9_-]+)","(?:ego|third)",/];
const probeOrt = (st) => {
    const text = [].concat((st.probe && st.probe.befehl) || []).map(String).join(" ");
    for (const re of ORT_MUSTER) {
        const m = re.exec(text);
        if (m) return m[1];
    }
    return null;
};
const nachOrt = (gs) => {
    const orte = [...new Set(gs.map((g) => probeOrt(g[0])).filter(Boolean))];
    const rang = (g) => (probeOrt(g[0]) ? orte.indexOf(probeOrt(g[0])) : orte.length);
    return gs.map((g, i) => [g, i]).sort((a, b) => rang(a[0]) - rang(b[0]) || a[1] - b[1]).map(([g]) => g);
};
const sitzungsReihe = (gruppen) => [
    ...gruppen.filter((g) => stellungVon(g) === "anfang"),
    ...nachOrt(gruppen.filter((g) => !stellungVon(g) && !mutiertVon(g))),
    ...gruppen.filter((g) => stellungVon(g) === "ende"),
    ...nachOrt(gruppen.filter((g) => !stellungVon(g) && mutiertVon(g))),
];
// eine Probe, die abbrach (Deckel, Absturz, Start), ließ die Welt vielleicht mitten im Werk — danach die Grundstellung
const brachAb = (es) => es.some((e) => /^(Deckel |Absturz|Start:)/.test(e.grund || ""));
// DIE WELT STEHT, wo der Spieler steht (DER WARME START, fahreSitzung): das EINE Einschwingen von welt-boot (`__weltStehtNach`, jede Seite
// der Werkbank trägt es, WARTEN_SEITE) — kein Messort, kein Umstellen: der Spieler bleibt, wo Boot, Grundstellung oder Tür ihn ließen
const WELT_STEHT = "await __weltDa(); const takte = await __weltStehtNach(); return { takte, chunks: r.state.voxelChunks ? r.state.voxelChunks.size : 0, ring: r._builtRingRadius() };";

// DIE EICH-FAHRT (w4-sitzung-eichen; takt25c GTX an 6b3da705: 36 von 38 Proben rissen ihren geschätzten Deckel — 10, 15, die Kappe 33 s —
// und standen UNGEMESSEN, die Zahl, die die Schätzung ersetzen soll, war zensiert): `run --eich` fährt die Sitzung mit dem Deckel
// PROBE_AUSNAHME_S je Probe (fahreGruppe) und trägt je Probe `eich` — ihre Sekunden s, ihren Deckel sek, ihr Gesetz gesetzS. Das Gesetz
// steht offen: ein Urteil zählt nur, wenn die Probe darin blieb (≤ PROBE_DECKEL_S, mit ausnahme ≤ PROBE_AUSNAHME_S); darüber ist sie
// UNGEMESSEN beim Namen, mit Urteil und Zahl, nie GRÜN oder ROT; am Eich-Deckel „≥ 90 s“ (gerissen). Was keine Zahl der Probe ist
// (die Welt endete, die Fahrt riss, kein Schloss), bleibt, wie es fiel. Die Fahrt bleibt ≤ FAHRT_MAX_S: den Rest misst die nächste
// Eich-Fahrt (eichOffen: ohne frische Messung und ohne Zahl am SHA)
const gesetzVon = (st) => (st.probe && st.probe.ausnahme !== undefined ? PROBE_AUSNAHME_S : PROBE_DECKEL_S);
function eichEintrag(st, e) {
    const am = !!e.ungemessen && /^Deckel \d+ s gerissen/.test(e.grund || "");
    if (e.ungemessen && !am) return e;
    const eich = { s: e.s, sek: probeSek(st), gesetzS: gesetzVon(st), ...(am ? { gerissen: true } : {}) };
    if (am) return { ...e, eich, grund: "EICH: ≥ " + PROBE_AUSNAHME_S + " s — " + e.grund, zahl: "EICH: ≥ " + PROBE_AUSNAHME_S + " s — " + e.zahl };
    if (e.s <= eich.gesetzS) return { ...e, eich };
    const grund = "EICH: " + e.s + " s über dem Gesetz " + eich.gesetzS + " s" + (eich.gesetzS === PROBE_DECKEL_S ? " (ohne ausnahme)" : "") +
        " — das Urteil zählt nie (" + (e.gruen ? "GRÜN" : "ROT") + ": " + String(e.zahl).slice(0, 200) + ")";
    return { ...e, gruen: false, ungemessen: true, zahl: grund, grund, eich: { ...eich, urteil: e.gruen ? "GRÜN" : "ROT" } };
}
// die Stationen ohne Eich-Zahl am SHA: m = die Mess-Datei des Geräts (oder null), ab(st) = der Abdruck heute — eine Zahl zählt nur zum
// Abdruck, an dem sie fiel (eine geänderte Probe eicht neu)
const eichOffen = (meine, m, sha, ab) =>
    meine.filter((st) => !(m && m.sha === sha && [m.je, m.ungemessen].some((x) => x && x[schluessel(st)] && x[schluessel(st)].eich && x[schluessel(st)].abdruck === ab(st))));
// DIE TAFEL DER EICH-FAHRT (`eichtafel`, der Leser ihrer Zahlen — „ihre Zahl ersetzt die Schätzung“): je Lauf der Sitzung (Zwillinge
// einmal, die Reihe der Fahrt) sein Deckel heute, seine Zahl in der Mess-Datei m (nur zum heutigen Abdruck) und der Deckel aus ihr. DIE
// REGEL wie beim Boot (SITZUNG_BOOT_S, das Anderthalbfache des größten gemessenen): ⌈1,5 × s⌉, mindestens 10 s; liegt das über dem
// Gesetz der Probe oder riss sie den Eich-Deckel, trägt sie kein Deckel — sie muss schneller werden. Σ heute ↔ aus den Zahlen (ohne
// Zahl oder über dem Gesetz zählt der Deckel heute) gegen das Budget der Fahrt
const EICH_FAKTOR = 1.5, DECKEL_MIN_S = 10;
function eichTafel(stationen, m, geraet, hilfe = hilfeText()) {
    const reihe = sitzungsReihe(gruppiere(stationen.filter((st) => st.probe && geraeteVon(st).includes(geraet))));
    const zahl = (st) => [m && m.je, m && m.ungemessen].map((x) => x && x[schluessel(st)]).find((e) => e && e.eich && e.abdruck === abdruck(st, hilfe));
    const zeilen = reihe.map((g) => {
        const e = zahl(g[0]), z = e ? e.eich : null, sek = probeSek(g[0]), gesetzS = gesetzVon(g[0]);
        const aus = z && !z.gerissen ? Math.max(DECKEL_MIN_S, Math.ceil(EICH_FAKTOR * z.s)) : null;
        const neu = aus != null && aus <= gesetzS ? aus : null;
        const urteil = !z ? "ohne Zahl" : z.gerissen ? "≥ " + PROBE_AUSNAHME_S + " s — schneller machen" : neu == null ? "über dem Gesetz " + gesetzS + " s — schneller machen"
            : neu === sek ? "trägt" : neu > sek ? "Deckel zu knapp" : "Deckel zu weit";
        return { ids: g.map(schluessel), sek, s: z ? z.s : null, gerissen: !!(z && z.gerissen), neu, gesetzS, urteil };
    });
    return { zeilen, heute: zeilen.reduce((a, z) => a + z.sek, 0), ausZahlen: zeilen.reduce((a, z) => a + (z.neu != null ? z.neu : z.sek), 0),
        budget: FAHRT_MAX_S - SITZUNG_BOOT_S, geeicht: zeilen.filter((z) => z.s != null).length };
}
function eichtafelCli(o) {
    if (!["radeon", "gtx"].includes(o.geraet)) throw new Error("--geraet radeon|gtx (die Eich-Fahrt misst nur die Sitzung einer Karte)");
    if (!o.sha) throw new Error("--sha fehlt");
    const repo = spielRepo(), sha = voll(repo, o.sha), d = messDatei(sha, o.geraet);
    const m = fs.existsSync(d) ? JSON.parse(fs.readFileSync(d, "utf8")) : null;
    const t = eichTafel(ladeGeprueft().stationen, m && m.sha === sha ? m : null, o.geraet);
    for (const z of t.zeilen)
        console.log("  " + z.ids.join("+") + " · Deckel " + z.sek + " s · " + (z.s == null ? "—" : (z.gerissen ? "≥ " + PROBE_AUSNAHME_S : z.s) + " s") + (z.neu != null ? " → " + z.neu + " s" : "") + " · " + z.urteil);
    console.log("EICHTAFEL " + o.geraet + " am " + sha.slice(0, 8) + ": " + t.geeicht + " von " + t.zeilen.length + " Läufen geeicht · Σ Deckel heute " + t.heute + " s → aus den Zahlen " +
        t.ausZahlen + " s (Budget " + t.budget + " s = Fahrt " + FAHRT_MAX_S + " − Boot " + SITZUNG_BOOT_S + ")");
}

// FÄHRT DIE SITZUNG: gruppen (je Gruppe die Stationen EINER Probe, Zwillinge zusammen) der Reihe nach in EINER Welt;
// ctx = { baum, koord, geraet, bash, gpuLauf, port, band, rohDir, welt?, stillS?, stromTaktMs?, eich? }; melde(gruppe, ergebnisse, aus, zeit) je Gruppe.
// Rückgabe der Kopf der Sitzung für die Mess-Datei: { start, port, warten, bootS, grundstellungS, proben, minuten, strom, orte, eich?, grund? }
// DIE REIHE (`sitzungsReihe`) und DAS ZURÜCKSETZEN (29.10.): die Grundstellung nur nach einer Probe mit `mutiert: true` oder nach einem
// Abbruch (bis dahin vor JEDER Probe: die Dauer lebte nie länger als eine Probe); DER STROM (`stromSeite`): der Zapf-Takt über die
// ganze Sitzung, ein Zapfen an jeder Proben-Grenze, die Probe kennt ihn als PUNKTE_SITZUNG_STROM (ihr Name PUNKTE_PROBE)
async function fahreSitzung(gruppen0, ctx, melde) {
    const t0 = Date.now();
    const gruppen = sitzungsReihe(gruppen0);
    const dir = path.join(ctx.rohDir, "sitzung");
    fs.mkdirSync(dir, { recursive: true });
    const log = path.join(dir, "werkbank.log"), zeuge = path.join(dir, "zeuge.txt"), stop = path.join(dir, "stop"), strom = path.join(dir, "strom.ndjson");
    const grund = path.join(dir, "grund.json");
    for (const f of [stop, zeuge, strom, grund]) fs.rmSync(f, { force: true });
    const kopf = { start: new Date(t0).toISOString(), port: ctx.port, warten: null, bootS: null, grundstellungS: [], proben: 0, freigaben: [] };
    const s = await sitzungStarten({ ...ctx, log, zeuge, stop });
    Object.assign(kopf, { warten: s.warten, bootS: s.bootS });
    const ohne = (grund, ungemessen) => ({ gruen: false, zahl: grund, exit: null, minuten: 0, grund, ...(ungemessen ? { ungemessen: true } : {}) });
    let tot = null;
    if (!s.ok) {
        kopf.grund = s.grund;
        for (const g of gruppen) await melde(g, g.map(() => ohne(s.grund, s.ungemessen)), null, new Date().toISOString());
        if (s.kind && s.kind.exitCode == null) baumTot(s.kind.pid);
        await schlossLoesen(s.schloss);
        kopf.minuten = +((Date.now() - t0) / 60000).toFixed(2);
        return kopf;
    }
    console.log("  SITZUNG " + ctx.geraet + " · die Welt steht nach " + s.bootS + " s (Schloss nach " + s.warten + " min) · " + gruppen.length + " Proben · Welt :" + (ctx.port + 20000));
    // DIE UHR DER FAHRT ab dem Schloss (der Boot zählt mit, das Warten nie): reißt sie FAHRT_MAX_S (ctx.fahrtMaxS nur im Selbsttest),
    // endet die Sitzung — die laufende Probe fällt am Rest, jede folgende ist UNGEMESSEN beim Namen
    const fahrtMaxS = ctx.fahrtMaxS || FAHRT_MAX_S;
    let fahrt0 = Date.now() - (s.bootS || 0) * 1000;
    const restS = () => fahrtMaxS - (Date.now() - fahrt0) / 1000;
    kopf.offen = [];
    kopf.orte = [];
    kopf.wegeTueren = []; // je Grundstellung, die ein Weg seit dem Grund durch die Tür schickte: vor wem, welcher Weg, s
    // aktOrt: wo die Welt zuletzt eingeschwungen stand — ein Messort, „(hier)“ (DER WARME START, ohne Ort) oder null (nirgends: nach
    // dem Boot, jeder Grundstellung und in jeder neuen Seite); stellSeite: die Seite, in der das geschah
    let aktOrt = null, ortNach = null, stellSeite = null;
    // DIE EICH-FAHRT (ctx.eich, `run --eich`, eichEintrag): das Gesetz beim Namen im Kopf und im Log
    if (ctx.eich) {
        kopf.eich = { deckelS: PROBE_AUSNAHME_S, gesetzS: PROBE_DECKEL_S, ausnahmeS: PROBE_AUSNAHME_S, fahrtMaxS };
        console.log("  SITZUNG EICH-FAHRT: jede Probe bis " + PROBE_AUSNAHME_S + " s — das Gesetz: je Probe ≤ " + PROBE_DECKEL_S + " s, mit ausnahme ≤ " +
            PROBE_AUSNAHME_S + " s, die Fahrt ≤ " + fahrtMaxS + " s; ein Urteil zählt nur im Gesetz, je Probe ihre Sekunden (eich)");
    }
    // DER ZAPF-TAKT: nie zwei Zapfen der Sitzung zugleich; während der Grundstellung ruht er. `seite`: die Seite des letzten Zapfens
    // (stromSeite zieht je Seite einen Haken ein) — eine neue Seite hat keinen gebauten Ring (DER WARME START)
    const W = ctx.port + 20000, zz = { zapfen: 0, luecken: 0, letzteLuecke: null };
    let aktuell = "(sitzung)", laeuft = null, ruht = false, seite = null;
    const zapf = (probe) => {
        laeuft = (laeuft || Promise.resolve()).then(() => stromZapfen(W, strom, probe)).then((z) => {
            if (z.ok) (zz.zapfen++, (seite = z.seite));
            else (zz.luecken++, (zz.letzteLuecke = z.grund));
        });
        return laeuft;
    };
    let frei = true;
    const takt = setInterval(() => {
        if (ruht || !frei || tot) return;
        frei = false;
        zapf(aktuell).finally(() => (frei = true));
    }, ctx.stromTaktMs || STROM_TAKT_MS);
    await zapf(aktuell);
    // DIE CI-WACHE (Heilung 30.10.): der Blick `ciWartet` läuft neben der Probe, nie an ihrer Grenze — die Grenze liest den letzten
    // fertigen Blick seit der letzten Nahme des Schlosses und stößt den nächsten an (er läuft in der folgenden Probe); fehlt einer seit
    // der Nahme (die erste Grenze, die nach einer Freigabe), wartet sie auf ihn, sonst nie
    const ci = { seit: t0, fertig: null, laeuft: null, n: 0 };
    const ciFrisch = () => !!ci.fertig && ci.fertig.t0 >= ci.seit;
    const ciLos = () => {
        if (!ci.laeuft) {
            const t = Date.now();
            ci.laeuft = ciWartet(ctx);
            ci.laeuft.then((ja) => ((ci.fertig = { t0: t, ja }), (ci.laeuft = null), ci.n++));
        }
        return ci.laeuft;
    };
    const ciWartetJetzt = async () => {
        while (!ciFrisch()) await ciLos();
        const ja = ci.fertig.ja;
        ciLos();
        return ja;
    };
    let zuruecksetzen = false, abbruch = false, gerissen = null, grundDa = null;
    for (const g of gruppen) {
        // DAS SCHLOSS AN DER PROBEN-GRENZE: fiel es (gpu-lauf.sh endete), trägt die Sitzung nicht mehr; wartet ein CI-Job darauf, geht es
        // an ihn und kommt danach wieder — die Welt bleibt warm, das Warten zählt nie in die Fahrt
        if (!tot && s.schloss && s.schloss.kind.exitCode != null) tot = "das Schloss der Sitzung fiel (gpu-lauf.sh Exit " + s.schloss.kind.exitCode + ")";
        if (tot && !kopf.grund) kopf.grund = "die Sitzung trägt nicht mehr vor " + schluessel(g[0]) + ": " + tot;
        if (!tot && !gerissen && s.schloss && (await ciWartetJetzt())) {
            const tf = Date.now();
            ruht = true;
            await schlossLoesen(s.schloss);
            console.log("  SITZUNG das Schloss geht an den wartenden CI-Job (vor " + schluessel(g[0]) + ")");
            s.schloss = await schlossNehmen({ ...ctx, stop }, kopf.freigaben.length + 1);
            ruht = false;
            ci.seit = Date.now(); // ein Blick von vor der Freigabe sah den CI-Job, dem das Schloss eben gehörte: er zählt nie mehr
            const pause = Date.now() - tf;
            fahrt0 += pause;
            kopf.freigaben.push({ vor: schluessel(g[0]), s: +(pause / 1000).toFixed(1) });
            if (!s.schloss.ok) (tot = s.schloss.grund), (kopf.grund = "die Sitzung trägt nicht mehr vor " + schluessel(g[0]) + ": " + tot);
            else console.log("  SITZUNG das Schloss wieder da nach " + (pause / 1000).toFixed(1) + " s");
        }
        // DER GRUND der Welt nach der Reihe `anfang` (nie davor: anfang misst die frische Welt)
        if (!tot && grundDa === null && stellungVon(g) !== "anfang") {
            // fiel die letzte Probe von anfang (Deckel, Absturz), lief ihre Seiten-Funktion weiter: erst die Seite neu (ihre Arbeit endet),
            // dann der Grund — nie ein Grund aus einer Seite, in der eine gefallene Probe noch arbeitet
            if (abbruch) {
                const n = await rufFrist(W, "/reload", {}, GRUNDSTELLUNG_S * 1000).catch((e) => ({ fehler: String((e && e.message) || e) }));
                abbruch = false;
                if (!n || n.neu !== true) tot = "die Seite nach dem Abbruch von anfang lädt nicht neu (/reload: " + JSON.stringify(n).slice(0, 200) + ")";
            }
        }
        if (!tot && grundDa === null && stellungVon(g) !== "anfang") {
            const gn = await grundNehmen(W, grund);
            grundDa = gn.ok ? true : gn.grund;
            console.log("  SITZUNG " + (gn.ok ? "der Grund der Welt: " + gn.n + " Größen in " + gn.s + " s" : gn.grund));
        }
        if (!gerissen && restS() <= 0) gerissen = "vor " + schluessel(g[0]);
        if (gerissen) {
            kopf.offen.push(...g.map(schluessel));
            await melde(g, g.map(() => ohne("die Fahrt riss " + fahrtMaxS + " s (" + gerissen + ") — offen, UNGEMESSEN", true)), null, new Date().toISOString());
            continue;
        }
        if (!tot && zuruecksetzen) {
            ruht = true;
            await zapf(aktuell);
            const gs = grundDa === true ? await grundstellung(W, grund, { abbruch }) : { ok: false, grund: grundDa || "kein Grund vor " + schluessel(g[0]) };
            ruht = false;
            if (gs.ok) {
                kopf.grundstellungS.push(gs.s);
                if (gs.wege) kopf.wegeTueren.push({ vor: schluessel(g[0]), wege: gs.wege, s: gs.s });
                (aktOrt = null), (ortNach = gs.tuer ? "der Tür" : "der Grundstellung"); // der Grund stellt den Spieler an seinen Ort zurück
                console.log("  SITZUNG Grundstellung vor " + schluessel(g[0]) + ": " + gs.s + " s (im Spiel " + gs.ms + " ms" + (gs.tuer ? ", durch die Tür" + (gs.wege ? " — " + gs.wege : "") : "") + ")");
            } else {
                tot = "Grundstellung: " + gs.grund;
                kopf.grund = "die Welt trägt nicht mehr vor " + schluessel(g[0]) + ": " + gs.grund;
                console.log("  SITZUNG " + kopf.grund);
            }
        } else if (!tot) {
            // ohne Grundstellung: das Fenster wie beim Start (eine Probe davor stellte es vielleicht anders) — und das Lebenszeichen der Welt
            const f = await rufFrist(W, "/fenster", {}, 30000).catch((e) => ({ fehler: String((e && e.message) || e) }));
            if (!f || !Array.isArray(f.fenster)) {
                tot = "die Welt antwortet nicht (/fenster: " + JSON.stringify(f).slice(0, 200) + ")";
                kopf.grund = "die Welt trägt nicht mehr vor " + schluessel(g[0]) + ": " + tot;
                console.log("  SITZUNG " + kopf.grund);
            }
        }
        if (tot) {
            await melde(g, g.map(() => ohne("die Welt der Sitzung trägt nicht mehr (" + tot + ") — ungemessen", true)), null, new Date().toISOString());
            continue;
        }
        // DER ORT (30.10.): wechselt die Probe den Messort, stellt die Sitzung EINMAL um — das Warten auf den Ring dort liegt vor dem
        // Deckel der Probe (er misst ihre Arbeit, nie den Ring) und steht je Ort im Kopf (`orte`: s, Takte, Chunks — Pflicht B, die
        // Ankunft); die Proben des Orts danach finden ihn gebaut. Scheitert das Umstellen, stellt die Probe selbst um (beim Namen im Log)
        // DER WARME START (w4-sitzung-eichen; takt25c GTX an 6b3da705: 36 von 38 Proben UNGEMESSEN am Deckel — nach jedem Riss ging
        // die Grundstellung durch die Tür, die Werkbank hält die neue Seite still (`loopAus`), und jede Probe danach zahlte den Ring:
        // am Ort 15–25 s statt ~3 s warm, eine Probe ohne Ort in ihrem eigenen Deckel — die Kaskade): auch eine Probe OHNE Ort misst in
        // der stehenden Welt. Nach dem Boot, jeder Grundstellung und in jeder neuen Seite (Tür, Neuladen, der Zweit-Boot einer Probe:
        // der Zapfen nennt eine andere Seite) schwingt die Sitzung sie EINMAL ein, wo der Spieler steht (`__weltStehtNach`, das EINE
        // Einschwingen von welt-boot) — vor dem Deckel, im Kopf wie ein Ort (`orte`, ort null); anfang misst die frische Welt, nie warm
        await zapf(aktuell);
        if (seite !== stellSeite && aktOrt !== null) (aktOrt = null), (ortNach = ortNach || "einer neuen Seite");
        const ort = probeOrt(g[0]);
        if (ort ? ort !== aktOrt : aktOrt === null && stellungVon(g) !== "anfang") {
            const tu = Date.now();
            const u = await (ort ? rufFrist(W, "/umstellen", { ort, sicht: "ego" }, 300000)
                : rufFrist(W, "/eval", { code: WELT_STEHT }, 300000).then((a) => (a && a.ergebnis && typeof a.ergebnis === "object" ? a.ergebnis : { fehler: (a && a.fehler) || JSON.stringify(a) })))
                .catch((e) => ({ fehler: String((e && e.message) || e) }));
            const us = +((Date.now() - tu) / 1000).toFixed(1);
            const wo = ort ? "Ort " + ort : "die Welt";
            await zapf(aktuell); // die Bilder des Einschwingens unter „(sitzung)“, nie unter der Probe; der Zapfen nennt die Seite danach
            if (u && !u.fehler) {
                aktOrt = ort || "(hier)";
                stellSeite = seite;
                kopf.orte.push({ ort: ort || null, vor: schluessel(g[0]), s: us, takte: u.takte, chunks: u.chunks, nach: ortNach });
                console.log("  SITZUNG " + wo + " vor " + schluessel(g[0]) + ": " + us + " s (" + u.takte + " Takte, " + u.chunks + " Chunks" + (ortNach ? ", nach " + ortNach : "") + ")");
            } else {
                // ohne Ort EIN Versuch je Grundstellung oder Seite: eine Welt, die nicht steht, kostete sonst jede folgende Probe die Frist
                if (!ort) (aktOrt = "(hier)"), (stellSeite = seite);
                kopf.orte.push({ ort: ort || null, vor: schluessel(g[0]), s: us, fehler: String(u && u.fehler).slice(0, 200), nach: ortNach });
                console.log("  SITZUNG " + wo + " vor " + schluessel(g[0]) + " steht nicht nach " + us + " s: " + JSON.stringify(u).slice(0, 200));
            }
            ortNach = null;
        }
        const name = schluessel(g[0]).replace("#", "_");
        const aus = { aus: path.join(ctx.rohDir, name + ".json"), roh: path.join(ctx.rohDir, name + ".out") };
        const zeit = new Date().toISOString();
        aktuell = schluessel(g[0]);
        const es = await fahreGruppe(g, { ...ctx, ...aus, sitzung: { log, zeuge, strom, grund, probe: aktuell, restS: restS(), fahrtMaxS, eich: !!ctx.eich } });
        if (es.some((e) => /^Deckel der Fahrt /.test(e.grund || ""))) (gerissen = "in " + aktuell), kopf.offen.push(...g.map(schluessel));
        await zapf(aktuell);
        aktuell = "(sitzung)";
        kopf.proben++;
        // DIE WELT ENDETE UNTER DER PROBE (w4-stationen-heil; Takt 23 GTX an 73bdf938: die Vorfahrt der OMEN nahm die Welt nach
        // 7,0 min — „VORFAHRT … verloren 7.0“ —, ferne.K1#2 lief gerade und stand als ROT „keine LUFT-Zeile … read ECONNRESET“ in der
        // Messung): die Werkbank endet nie an einem Fehler des Spiels (eine tote Seite antwortet mit `fehler`), nur an `/stop` oder
        // einem fremden Ende. Ist ihr Steuer-Port nach der Probe zu oder der Halter fort, ist jedes Nicht-GRÜN dieser Probe keine
        // Messung — ungemessen beim Grund, wie die Proben danach; ein GRÜN hielt seine Messung schon in der Hand.
        const weg = s.kind.exitCode != null ? "der Halter endete (Exit " + s.kind.exitCode + ")"
            : (await portZu(W)) ? "die Werkbank :" + W + " nimmt keine Verbindung mehr an" : null;
        if (weg) {
            tot = "sie endete während " + schluessel(g[0]) + ": " + weg;
            kopf.grund = "die Welt trägt nicht mehr nach " + schluessel(g[0]) + ": " + weg;
            console.log("  SITZUNG " + kopf.grund);
        }
        const unter = (e) => (e.gruen || !weg ? e
            : { ...e, ungemessen: true, grund: "die Welt der Sitzung endete während der Probe (" + weg + ") — ungemessen", zahl: "die Welt der Sitzung endete während der Probe (" + weg + ") — ungemessen; die Probe sah: " + String(e.zahl).slice(0, 240) });
        abbruch = brachAb(es);
        zuruecksetzen = mutiertVon(g) || abbruch;
        // die Eich-Fahrt urteilt erst nach Abbruch und Grundstellung (sie lesen den Grund der Probe, wie er fiel): je Probe ihre Zahl
        await melde(g, es.map(unter).map((e, i) => (ctx.eich ? eichEintrag(g[i], e) : e)), aus, zeit);
    }
    clearInterval(takt);
    if (ci.laeuft && ci.laeuft.kind && ci.laeuft.kind.exitCode == null) baumTot(ci.laeuft.kind.pid); // kein Blick überlebt die Sitzung
    kopf.ciBlicke = ci.n;
    await zapf(aktuell);
    kopf.strom = stromKopf(strom, zz);
    kopf.fahrtS = +((Date.now() - fahrt0) / 1000).toFixed(1);
    if (gerissen) {
        kopf.grund = "die Fahrt riss " + fahrtMaxS + " s " + gerissen + " — offen: " + kopf.offen.join(", ");
        console.log("  SITZUNG " + kopf.grund);
    } else delete kopf.offen;
    console.log("  SITZUNG Fahrt " + kopf.fahrtS + " s (Soll ≤ " + fahrtMaxS + " s) · " + kopf.proben + " Proben · Grundstellung " + kopf.grundstellungS.length + "×");
    await sitzungStoppen(s, stop);
    kopf.minuten = +((Date.now() - t0) / 60000).toFixed(2);
    return kopf;
}

const messDatei = (sha, geraet, mdir = path.join(DIR, "messung")) => path.join(mdir, sha.slice(0, 8) + "-" + geraet + ".json");
// die Dateien am Stand (Wand PFAD)
const dateienAm = (repo, sha) => git(["ls-tree", "-r", "--name-only", sha], repo).split(/\r?\n/).filter(Boolean);
// die Roh-Ausgabe einer Messung (Wand GPU für Messungen ohne eigenen Zeugen); "" wenn keine
const rohAus = (mdir = path.join(DIR, "messung")) => (sha, g, id) => {
    const f = path.join(mdir, "roh", String(sha).slice(0, 8) + "-" + g, id.replace("#", "_") + ".out");
    return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
};

// DIE AUSWAHL eines Laufs — EINE Quelle für run und scheiben: die Stationen des Geräts nach --nur und --offen am SHA.
// Rückgabe { repo, sha, meine, tot }; meine leer heißt: am SHA ist nichts zu messen (--offen)
function auswahl(opt) {
    if (!opt.sha) throw new Error("--sha fehlt");
    if (!GERAETE.includes(opt.geraet)) throw new Error("--geraet radeon|gtx|headless");
    const { stationen, fehler } = ladeGeprueft();
    if (fehler.length) throw new Error("Stationen ROT:\n - " + fehler.join("\n - "));
    const nur = opt.nur ? new Set(opt.nur.split(",")) : null;
    let meine = stationen.filter((st) => geraeteVon(st).includes(opt.geraet) && (!nur || nur.has(schluessel(st))));
    if (nur) for (const id of nur) if (!meine.some((st) => schluessel(st) === id)) throw new Error("--nur " + id + ": keine Station auf " + opt.geraet);
    if (!meine.length) throw new Error("keine Station auf " + opt.geraet);
    const repo = spielRepo();
    const sha = voll(repo, opt.sha);
    const dateien = dateienAm(repo, sha);
    const tot = (st) => toteGlobs(st.pfad, dateien);
    // --offen: nur die Stationen, die die Buchung am SHA nicht frisch fände — ein Zug misst, was er berührt, nie die ganze Liste
    // --eich (DIE EICH-FAHRT, eichEintrag): die Proben der Karte ohne frische Messung UND ohne Eich-Zahl am SHA (eichOffen) — jede
    // Eich-Fahrt misst, was die vorige nicht erreichte, bis nichts zu eichen bleibt
    if (opt.eich) {
        if (!["radeon", "gtx"].includes(opt.geraet)) throw new Error("--eich fährt nur die Sitzung einer Karte (radeon|gtx)");
        meine = meine.filter((st) => st.probe);
    }
    if (opt.offen || opt.eich) {
        const frisch = frischUrteil(ladeMessungen(), (s) =>
            stempelDateien(git(["diff", "--name-only", s, sha], repo), git(["diff", "-U0", "--no-color", s, sha], repo)), hilfeText(),
            { tot, roh: rohAus(), linsen: linsenAm(repo, sha) });
        meine = meine.filter((st) => frisch(st, opt.geraet).ungemessen);
    }
    if (opt.eich) {
        const d = messDatei(sha, opt.geraet), hilfe = hilfeText();
        meine = eichOffen(meine, fs.existsSync(d) ? JSON.parse(fs.readFileSync(d, "utf8")) : null, sha, (st) => abdruck(st, hilfe));
    }
    // DIE DAUER BRAUCHT IHREN ANFANG (w4-linsen-b; 3ed95dcf GTX: profiband.K4 fuhr in eich1, profiband.K5 allein in eich2 — „kein Stand des
    // Anfangs“, die Zahl „Dauer undefined min in undefined Seite(n)“): eine Probe mit `stellung: "ende"` urteilt über den Strom seit den
    // Marken der Proben mit `stellung: "anfang"` IN DERSELBEN Sitzung (die Datei des Stroms lebt eine Sitzung) — fährt eine Auswahl (--nur,
    // --offen, --eich) ein Ende, fährt sie jeden Anfang ihres Geräts mit
    if (meine.some((st) => st.probe && st.probe.stellung === "ende"))
        for (const st of stationen)
            if (st.probe && st.probe.stellung === "anfang" && geraeteVon(st).includes(opt.geraet) && !meine.includes(st)) meine.push(st);
    return { repo, sha, meine, tot };
}

// DIE FARM (27.10., Karte punkte-farm; die Regel des Schöpfers: „Die Prüfung darf nie länger dauern als das Erstellen“ — der
// headless-Takt an e7a28b06 fuhr 76 Stationen Σ 266 min in 60 min Wanduhr auf dem Laptop): `run --farm <name>` fährt headless auf
// einem Läufer der Farm (.github/workflows/punkte-farm.yml im Spiel-Repo), der nur diesen Lauf trägt — dort hält kein
// Schloss des Rechners (Takt 8: es schützte die Zeit-Stationen vor den Bahnen der Radeon NEBENAN, die auf dem Läufer nie
// laufen); die Karte bleibt verwehrt (LINSE_GPU=software). Eine GPU-Station fährt nie auf der Farm: sie misst nur unter dem
// Schloss ihrer Karte. Rückgabe: die gpu-lauf.sh des Laufs oder null (frei)
function gpuLaufFuer(geraet, farm) {
    if (!farm) return GPU_LAUF;
    if (geraet !== "headless") throw new Error("--farm fährt nur headless — " + geraet + " misst nur unter dem Schloss seiner Karte");
    return null;
}

// DIE SCHEIBEN DER FARM: die Läufe (Zwillinge EIN Lauf, gruppiere) auf höchstens `jobs` Scheiben, die schwersten zuerst in die
// leichteste (LPT) — die Wanduhr der Farm ist die schwerste Scheibe, also mindestens der längste Lauf. gewicht(gruppe) → Minuten.
// Rückgabe [{ nr, gruppen, min }] ohne leere Scheiben, nr ab 1 in der Reihenfolge der Last
function scheibenPlan(gruppen, jobs, gewicht) {
    const k = Math.max(1, Math.min(Number(jobs) || 1, gruppen.length));
    const sch = Array.from({ length: k }, () => ({ gruppen: [], min: 0 }));
    const last = gruppen.map((g, i) => ({ g, w: Math.max(0, Number(gewicht(g)) || 0), i })).sort((a, b) => b.w - a.w || a.i - b.i);
    for (const { g, w } of last) {
        const s = sch.reduce((a, b) => (b.min < a.min ? b : a));
        s.gruppen.push(g);
        s.min = +(s.min + w).toFixed(2);
    }
    return sch.filter((s) => s.gruppen.length).sort((a, b) => b.min - a.min).map((s, i) => ({ nr: i + 1, ...s }));
}
// das Gewicht eines Laufs: die KÜRZESTE seiner jüngsten 5 Messungen auf dem Gerät (eine mit 0 min — toter Glob — zählt nicht), sonst
// die Soll-Minuten seiner ersten Station. Am Laptop zählen die Minuten das Warten auf das Schloss und die Last der Nachbar-Bahnen mit
// (speicher.K3#2 allein 8,6–10,4 min, in 3 Bahnen neben der Radeon 26,6 und 52,3 min; feld.K3#1 0,7–2,6 und 33,6 min) — Last
// verlängert nur, also schätzt die kürzeste den Lauf allein; der Abdruck zählt hier nicht (er urteilt die Frische, nie die Länge)
function laufGewicht(messungen, geraet) {
    const je = new Map();
    for (const m of messungen) {
        if (m.geraet !== geraet) continue;
        for (const [id, e] of Object.entries(m.je || {})) if (e.minuten > 0) (je.get(id) || je.set(id, []).get(id)).push(e);
    }
    const kuerzeste = (id) => {
        const es = (je.get(id) || []).sort((a, b) => String(b.zeit).localeCompare(String(a.zeit))).slice(0, 5);
        return es.length ? Math.min(...es.map((e) => e.minuten)) : null;
    };
    return (g) => {
        const ms = g.map((st) => kuerzeste(schluessel(st))).filter((x) => x != null);
        return ms.length ? Math.max(...ms) : g[0].minuten;
    };
}
// DER ANBIETER DES LAPTOPS: eine Station, deren KI_ENDPUNKT der lokale Ollama ist (Port 11434), verlangt dessen Modell auf dem
// Läufer ihrer Scheibe — die Farm stellt ihn (punkte-farm.yml, Schritt KI-Anbieter), die Station selbst bleibt byte-gleich
const LOKALER_ANBIETER = /^https?:\/\/(127\.0\.0\.1|localhost):11434(\/|$)/;
const kiModelle = (gruppen) =>
    [...new Set(gruppen.flat().filter((st) => st.env && LOKALER_ANBIETER.test(st.env.KI_ENDPUNKT || "") && st.env.KI_MODELL).map((st) => st.env.KI_MODELL))];

// `scheiben`: der Plan der Farm als JSON auf stdout (die Matrix des Workflows), die Zeilen für Menschen auf stderr
function scheibenCli(opt) {
    const { sha, meine } = auswahl(opt);
    const gruppen = gruppiere(meine);
    const plan = scheibenPlan(gruppen, opt.jobs || 12, laufGewicht(ladeMessungen(), opt.geraet));
    const scheiben = plan.map((s) => ({ nr: s.nr, nur: s.gruppen.flat().map(schluessel).join(","), stationen: s.gruppen.flat().length,
        laeufe: s.gruppen.length, min: s.min, ki: kiModelle(s.gruppen).join(" ") }));
    console.error("SCHEIBEN " + sha.slice(0, 8) + " " + opt.geraet + ": " + meine.length + " Stationen in " + gruppen.length + " Läufen auf " +
        scheiben.length + " Scheiben · schwerste ~" + (scheiben[0] ? scheiben[0].min : 0) + " min · Σ ~" + +plan.reduce((a, s) => a + s.min, 0).toFixed(1) + " min");
    for (const s of scheiben) console.error("  " + s.nr + " · ~" + s.min + " min · " + s.laeufe + " Läufe" + (s.ki ? " · KI " + s.ki : "") + " · " + s.nur);
    const aus = { sha, sha8: sha.slice(0, 8), geraet: opt.geraet, stationen: meine.length, laeufe: gruppen.length, scheiben };
    process.stdout.write(JSON.stringify(aus) + "\n");
    return aus;
}

// DIE VEREINIGUNG der Farm: die Teil-Messungen der Scheiben (je Läufer `run --nur … --farm`) in die EINE Messung m des SHA, über
// `eintragen` wie ein Lauf am Platz (ein Teil-Eintrag ersetzt den alten derselben Station, ungemessen bleibt ungemessen); jeder
// Eintrag trägt den Läufer (host), die Datei die Farm. teile: [{ name, m }]; erwartet: [{ nr, nur }] oder null. Rückgabe
// { m, n, fehlt: [{ nr, ids }] } — eine Scheibe ohne Teil (ihr Läufer fiel) steht beim Namen, ihre Stationen bleiben, wie sie waren.
function vereineMessungen(m, teile, sha, geraet, host, erwartet = null) {
    const ziel = m && m.sha === sha ? { ...m, je: { ...m.je }, ...(m.ungemessen ? { ungemessen: { ...m.ungemessen } } : {}) }
        : { sha, geraet, zeit: null, host, je: {} };
    const gesehen = new Set();
    let n = 0;
    for (const t of teile) {
        if (!t.m || t.m.sha !== sha || t.m.geraet !== geraet)
            throw new Error("Teil " + t.name + " misst " + (t.m && t.m.sha) + " " + (t.m && t.m.geraet) + " statt " + sha + " " + geraet);
        for (const [id, e] of [...Object.entries(t.m.je || {}), ...Object.entries(t.m.ungemessen || {})]) {
            eintragen(ziel, id, { ...e, host: e.host || t.m.host || t.name });
            gesehen.add(id);
            n++;
        }
        if (t.m.zeit && String(t.m.zeit) > String(ziel.zeit || "")) ziel.zeit = t.m.zeit;
    }
    ziel.host = host;
    const fehlt = (erwartet || []).map((s) => ({ nr: s.nr, ids: String(s.nur).split(",").filter((id) => id && !gesehen.has(id)) })).filter((s) => s.ids.length);
    return { m: ziel, n, fehlt };
}

// `vereine --sha <sha> --geraet headless --farm <name> --teile <dir> [--scheiben scheiben.json] [--beginn <epoch s>]`: jedes
// Unterverzeichnis von <dir> (download-artifact: teil-<nr>/) trägt <sha8>-<geraet>.json und roh/<sha8>-<geraet>/
function vereineCli(opt) {
    if (!opt.sha || !opt.geraet || !opt.farm || !opt.teile) throw new Error("vereine --sha <voll> --geraet <g> --farm <name> --teile <dir>");
    const name = opt.sha.slice(0, 8) + "-" + opt.geraet;
    const teile = [];
    for (const d of fs.readdirSync(opt.teile).sort()) {
        const f = path.join(opt.teile, d, name + ".json");
        if (fs.existsSync(f)) teile.push({ name: d, m: JSON.parse(fs.readFileSync(f, "utf8")), roh: path.join(opt.teile, d, "roh", name) });
        else console.log("  Teil " + d + " ohne " + name + ".json");
    }
    const erwartet = opt.scheiben ? JSON.parse(fs.readFileSync(opt.scheiben, "utf8")).scheiben : null;
    const datei = messDatei(opt.sha, opt.geraet);
    const alt = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
    const r = vereineMessungen(alt, teile, opt.sha, opt.geraet, opt.farm, erwartet);
    fs.writeFileSync(datei, JSON.stringify(r.m, null, 1) + "\n");
    const rohZiel = path.join(DIR, "messung", "roh", name);
    for (const t of teile) {
        if (!fs.existsSync(t.roh)) continue;
        fs.mkdirSync(rohZiel, { recursive: true });
        for (const f of fs.readdirSync(t.roh)) fs.copyFileSync(path.join(t.roh, f), path.join(rohZiel, f));
    }
    // die Zahl: je Läufer die Minuten seiner Läufe (ein Zwilling fuhr nie selbst), die Wanduhr ab dem Beginn der Farm
    const neu = teile.flatMap((t) => Object.entries(t.m.je || {}).map(([id, e]) => ({ id, ...e, host: e.host || t.name })));
    const jeHost = {};
    for (const e of neu) if (!e.zwilling) jeHost[e.host] = +((jeHost[e.host] || 0) + (e.minuten || 0)).toFixed(2);
    const ungemessen = teile.reduce((a, t) => a + Object.keys(t.m.ungemessen || {}).length, 0);
    const gruen = neu.filter((e) => e.gruen).length;
    const wanduhr = opt.beginn ? +((Date.now() / 1000 - Number(opt.beginn)) / 60).toFixed(1) : null;
    const laengste = Math.max(0, ...Object.values(jeHost));
    const zeile = "Farm " + opt.geraet + " " + name.slice(0, 8) + ": " + neu.length + " Stationen aus " + teile.length + " Teilen · GRÜN " + gruen +
        " · ROT " + (neu.length - gruen) + (ungemessen ? " · ungemessen " + ungemessen : "") + " · längster Läufer " + laengste + " min · Σ " +
        +Object.values(jeHost).reduce((a, x) => a + x, 0).toFixed(1) + " min" + (wanduhr != null ? " · Wanduhr " + wanduhr + " min" : "");
    console.log(zeile);
    for (const e of neu.sort((a, b) => a.id.localeCompare(b.id))) console.log(stationsZeile(e.id, e) + " · " + e.host);
    for (const s of r.fehlt) console.log("  FEHLT Scheibe " + s.nr + " (" + s.ids.length + " Stationen, kein Teil): " + s.ids.join(","));
    console.log("→ " + path.relative(KOORD, datei));
    return { ...r, zeile };
}

// DER RUF DER FARM — der EINE Weg einer headless-Messung (G4: der Laptop trägt 0 headless-Last; bis 27.10. fuhr `run --geraet
// headless` am Platz und nahm unter dem Schloss des Rechners Plätze neben den Zeit-Läufen der Radeon: takt10-headless an
// dc06b495 trug nach 1 h 08 min 5 von 81 Stationen, 9 ungemessen am blockierten Schloss). `run --geraet headless` ohne --farm
// ruft punkte-farm.yml im Spiel-Repo (workflow_dispatch am Zweig PUNKTE_FARM_REF, Vorgabe main) mit derselben Auswahl, findet
// den Lauf an seiner Marke (run-name), meldet jeden fertigen Läufer, holt nach dem Lauf die gepushte Messung in den Baum der
// Maschine (git checkout origin/<zweig> -- Datei und Roh-Ausgaben: dieselben Bytes wie am Zweig, ein späterer Merge findet
// gleiche Zugänge) und schreibt die Zeilen, die zug.cjs liest. Ein Ruf, den GitHub abweist, ist ROT beim Grund — nie ein Lauf am
// Platz. Der Schlüssel: GH_TOKEN | GITHUB_TOKEN | git credential (github.com).
const FARM_WORKFLOW = "punkte-farm.yml";
function ghSchluessel() {
    if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) return process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    const r = spawnSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8", windowsHide: true });
    const t = (/^password=(.+)$/m.exec(String(r.stdout || "")) || [])[1];
    if (!t) throw new Error("Farm: kein GitHub-Schlüssel (GH_TOKEN, GITHUB_TOKEN oder git credential für github.com)");
    return t.trim();
}
const repoSlug = (url) => {
    const m = /github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?\/?$/.exec(String(url).trim());
    if (!m) throw new Error("Farm: origin " + url + " ist kein GitHub-Repo");
    return m[1];
};
// die Eingaben des Rufs: die Auswahl reist als Liste (nur) — --offen urteilt HIER, am selben Stand der Messungen, den die Buchung
// liest; die Marke findet den Lauf (run-name)
const farmEingaben = (meine, sha, zweig, marke, jobs) => ({ sha, auswahl: "nur", nur: meine.map(schluessel).join(","), jobs: String(jobs || 12), koord: zweig, marke });
async function farmRufen(opt, a, warte = (ms) => new Promise((r) => setTimeout(r, ms))) {
    const { repo, sha, meine } = a;
    const slug = repoSlug(git(["remote", "get-url", "origin"], repo));
    const zweig = git(["rev-parse", "--abbrev-ref", "HEAD"], KOORD);
    if (zweig === "HEAD") throw new Error("Farm: der Baum der Maschine steht auf keinem Zweig (die Farm pusht ihre Messung auf einen Zweig)");
    const ref = process.env.PUNKTE_FARM_REF || "main";
    const marke = os.hostname() + "-" + process.pid + "-" + Date.now();
    const auswahlArt = opt.nur ? "nur" : opt.offen ? "offen" : "alle";
    const schluesselGh = ghSchluessel();
    const api = async (p, init = {}) => {
        const r = await fetch("https://api.github.com/repos/" + slug + p, { ...init, headers: { Authorization: "Bearer " + schluesselGh,
            Accept: "application/vnd.github+json", "User-Agent": "punkte-maschine", ...(init.body ? { "Content-Type": "application/json" } : {}) } });
        const text = await r.text();
        if (!r.ok) throw new Error("Farm: " + (init.method || "GET") + " " + p + " → " + r.status + " " + text.slice(0, 200));
        return text ? JSON.parse(text) : null;
    };
    await api("/actions/workflows/" + FARM_WORKFLOW + "/dispatches", { method: "POST", body: JSON.stringify({ ref, inputs: farmEingaben(meine, sha, zweig, marke, opt.jobs) }) });
    let lauf = null;
    for (let i = 0; i < 60 && !lauf; i++) {
        await warte(5000);
        const l = await api("/actions/workflows/" + FARM_WORKFLOW + "/runs?event=workflow_dispatch&per_page=30");
        lauf = (l.workflow_runs || []).find((r) => String(r.display_title || r.name).includes(marke)) || null;
    }
    if (!lauf) throw new Error("Farm: der Lauf mit der Marke " + marke + " erschien nicht binnen 5 min (" + ref + ")");
    console.log(startZeile(meine.length, gruppiere(meine), "headless", sha, 1) + " · auf der Farm (" + auswahlArt + ") " + lauf.html_url);
    const gemeldet = new Set();
    for (;;) {
        const j = await api("/actions/runs/" + lauf.id + "/jobs?per_page=100");
        for (const x of j.jobs || [])
            if (x.status === "completed" && !gemeldet.has(x.id)) {
                gemeldet.add(x.id);
                console.log("  Farm: " + x.name + " · " + x.conclusion + " · " + ((new Date(x.completed_at) - new Date(x.started_at)) / 60000).toFixed(1) + " min");
            }
        lauf = await api("/actions/runs/" + lauf.id);
        if (lauf.status === "completed") break;
        await warte(30000);
    }
    const datei = messDatei(sha, "headless");
    const rel = (f) => path.relative(KOORD, f).split(path.sep).join("/");
    const roh = path.join(DIR, "messung", "roh", sha.slice(0, 8) + "-headless");
    git(["fetch", "-q", "origin", "+refs/heads/" + zweig + ":refs/remotes/origin/" + zweig], KOORD);
    const da = (p) => spawnSync("git", ["cat-file", "-e", "origin/" + zweig + ":" + p], { cwd: KOORD }).status === 0;
    if (!da(rel(datei))) throw new Error("Farm: der Lauf " + lauf.html_url + " endete " + lauf.conclusion + " ohne " + rel(datei) + " auf " + zweig);
    git(["checkout", "origin/" + zweig, "--", rel(datei), ...(da(rel(roh)) ? [rel(roh)] : [])], KOORD);
    const m = JSON.parse(fs.readFileSync(datei, "utf8"));
    const von = "farm:" + lauf.id;
    for (const st of meine) {
        const id = schluessel(st);
        const e = (m.je[id] && String(m.je[id].host).startsWith(von) && m.je[id]) || (m.ungemessen && m.ungemessen[id] && String(m.ungemessen[id].host).startsWith(von) && m.ungemessen[id]);
        console.log(e ? stationsZeile(id, e) : "  OFFEN " + id + " · der Farm-Lauf trug kein Urteil · Bahn farm · ungemessen, `run --offen` misst neu");
    }
    if (lauf.conclusion !== "success") {
        console.log("Farm-Lauf " + lauf.html_url + " endete " + lauf.conclusion);
        process.exitCode = 1;
    }
    console.log("→ " + rel(datei) + " (von " + zweig + ", Lauf " + lauf.id + ")");
    return m;
}

async function run(opt) {
    if (!opt.sha) throw new Error("--sha fehlt");
    if (!GERAETE.includes(opt.geraet)) throw new Error("--geraet radeon|gtx|headless");
    const gpuLauf = gpuLaufFuer(opt.geraet, opt.farm);
    const bahnenSoll = Number(opt.bahnen || 3);
    if (!(bahnenSoll >= 1 && bahnenSoll <= MAX_BAHNEN && Number.isInteger(bahnenSoll)))
        throw new Error("--bahnen " + opt.bahnen + ": 1 bis " + MAX_BAHNEN + " (je Bahn ein Port-Band)");
    const band = (b) => portBand(opt.portBasis || 7700, opt.geraet, b);
    for (let b = 0; b < bahnenSoll; b++) band(b);
    const a = auswahl(opt);
    const { repo, sha, tot } = a;
    let meine = a.meine;
    if (!meine.length) {
        console.log("Punkte-Maschine: am " + sha.slice(0, 8) + " ist jede Station auf " + opt.geraet + " frisch gemessen" + (opt.eich ? " oder geeicht — nichts zu eichen" : ""));
        return null;
    }
    // headless misst nie am Platz: ohne --farm ruft run die Farm und holt ihre Messung (farmRufen)
    if (opt.geraet === "headless" && !opt.farm && !opt.trocken) return farmRufen(opt, a);
    if (opt.trocken) {
        console.log("Punkte-Maschine (trocken): " + meine.length + " Station(en) auf " + opt.geraet + " am " + sha.slice(0, 8) + ", " +
            planText(gruppiere(meine), bahnenSoll) + (opt.eich ? " · EICH-FAHRT: je Probe bis " + PROBE_AUSNAHME_S + " s, die Fahrt ≤ " + FAHRT_MAX_S + " s" : "") + ": " +
            meine.map((st) => schluessel(st) + (st.zeit ? "(Zeit)" : "")).join(" "));
        return null;
    }
    // EIN Lauf je Spiel-Baum: ein zweiter Lauf auf demselben Gerät checkte sonst seinen SHA in den Baum des ersten
    await baumSperre(repo, opt.geraet);
    const baum = baumAmSha(repo, opt.geraet, sha);
    const datei = messDatei(sha, opt.geraet);
    const rohDir = path.join(DIR, "messung", "roh", sha.slice(0, 8) + "-" + opt.geraet);
    fs.mkdirSync(path.dirname(datei), { recursive: true }); // die Farm checkt messung/ nie aus (ihr Teil trägt nur die Scheibe)
    let m = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
    const host = opt.farm || os.hostname();
    if (!m || m.sha !== sha) m = { sha, geraet: opt.geraet, zeit: null, host, je: {} };
    const hilfe = hilfeText();
    // DIE WAND PFAD: eine Station mit totem Glob am SHA fährt nie — sie ist ROT beim Glob (R6 wäre für ihn blind)
    for (const st of meine.filter((s) => tot(s).length)) {
        const grund = pfadGrund(tot(st), "am " + sha.slice(0, 8));
        m.je[schluessel(st)] = { gruen: false, zahl: grund, exit: null, minuten: 0, grund, zeit: new Date().toISOString(), abdruck: abdruck(st, hilfe), ...(opt.farm ? { host } : {}) };
        console.log("  ROT  " + schluessel(st) + " · " + grund);
    }
    meine = meine.filter((s) => !tot(s).length);
    if (!meine.length) {
        m.zeit = new Date().toISOString();
        fs.writeFileSync(datei, JSON.stringify(m, null, 1) + "\n");
        return m;
    }
    const alle = gruppiere(meine);
    // DIE SITZUNG zuerst (eine Welt, jede Probe darin), danach der Rest auf den Bahnen wie bisher
    const proben = opt.geraet === "headless" ? [] : alle.filter((g) => g[0].probe);
    const gruppen = alle.filter((g) => !proben.includes(g));
    const bahnen = Math.max(1, Math.min(bahnenSoll, gruppen.filter((g) => !istZeit(g)).length));
    const ctx0 = { koord: KOORD, geraet: opt.geraet, bash: findeBash(), plaetze: bahnen, gpuLauf };
    // je Bahn der EIGENE Spiel-Baum (Spielstände, Rohdateien) und das eigene Port-Band
    const baeume = [baum];
    for (let i = 2; i <= bahnen && gruppen.length; i++) baeume.push(baumAmSha(repo, opt.geraet + "-" + i, sha));
    console.log(startZeile(meine.length, alle, opt.geraet, sha, bahnen) + " (Baum " + baeume.join(", ") + ")");
    fs.mkdirSync(rohDir, { recursive: true });
    // je Gruppe die Einträge ihrer Stationen (der Zwilling erbt Lauf und Roh-Ausgabe der ersten)
    const melde = (g, es, aus, wie) => {
        const ids = g.map(schluessel);
        const zeit = wie.zeit;
        g.forEach((st, i) => {
            const id = ids[i];
            if (aus && i > 0 && fs.existsSync(aus.roh)) fs.copyFileSync(aus.roh, path.join(rohDir, id.replace("#", "_") + ".out"));
            const e = stationsEintrag(es[i], { zeit, abdruck: abdruck(st, hilfe), port: wie.port, bahn: wie.bahn, host: opt.farm ? host : null, zwilling: i > 0 ? ids[0] : null, modus: wie.modus });
            eintragen(m, id, e);
            console.log(stationsZeile(id, e));
            // die Zahl der Eich-Fahrt (eichEintrag) — die Sekunden VOR der Id: der Fortschritt liest das Urteil aus „<Urteil> <id>“
            if (e.eich) console.log("  EICH " + (e.eich.gerissen ? "≥ " + PROBE_AUSNAHME_S : e.eich.s) + " s · " + id + " · Deckel " + e.eich.sek + " s · Gesetz " + e.eich.gesetzS + " s · " +
                (e.eich.gerissen ? "am Eich-Deckel" : e.ungemessen ? "über dem Gesetz, das Urteil (" + e.eich.urteil + ") zählt nie" : "im Gesetz, das Urteil zählt") + (e.zwilling ? " (Zwilling von " + e.zwilling + ")" : ""));
        });
        m.zeit = zeit;
        m.host = host;
        fs.writeFileSync(datei, JSON.stringify(m, null, 1) + "\n");
    };
    if (proben.length) {
        const sb = portBand(opt.portBasis || 7700, opt.geraet, MAX_BAHNEN);
        m.sitzung = await fahreSitzung(proben, { ...ctx0, baum, port: sb.port, band: sb.alle, rohDir, eich: !!opt.eich },
            (g, es, aus, zeit) => melde(g, es, aus, { zeit, port: sb.port, bahn: "sitzung", modus: "session" }));
        fs.writeFileSync(datei, JSON.stringify(m, null, 1) + "\n");
    }
    await fahrePlan(gruppen, bahnen, async (g, b) => {
        const name = schluessel(g[0]).replace("#", "_");
        const ctx = { ...ctx0, baum: baeume[b], bahn: b, port: band(b).port, band: band(b).alle,
            aus: path.join(rohDir, name + ".json"), roh: path.join(rohDir, name + ".out") };
        const zeit = new Date().toISOString();
        const es = await fahreGruppe(g, ctx);
        melde(g, es, ctx, { zeit, port: ctx.port, bahn: istZeit(g) ? "allein" : b + 1 + "/" + bahnen });
    });
    console.log("→ " + path.relative(KOORD, datei));
    return m;
}
// DER EINTRAG einer Station in der Mess-Datei — EINE Form für Bahn und Sitzung (die Sitzung trägt modus "session", bahn "sitzung")
const stationsEintrag = (e, o) => ({ ...e, zeit: o.zeit, abdruck: o.abdruck, port: o.port, bahn: o.bahn, ...(o.host ? { host: o.host } : {}),
    ...(o.zwilling ? { zwilling: o.zwilling } : {}), ...(o.modus ? { modus: o.modus } : {}) });

// DER EINTRAG einer gefahrenen Station: ein Urteil (GRÜN/ROT) nach m.je, das Buchung und `run --offen` lesen; ein Lauf ohne
// Schloss (Exit 75, gpu-lauf.sh schwieg beim Warten) nach m.ungemessen mit Grund, NIE als ROT — frischUrteil nähme ihn sonst als
// frische Messung, und `run --offen` mäße die Station an diesem SHA nie neu (26.10., Prüfung gpu-bahnen)
function eintragen(m, id, e) {
    if (e.ungemessen) {
        (m.ungemessen = m.ungemessen || {})[id] = e;
        return;
    }
    m.je[id] = e;
    if (m.ungemessen) delete m.ungemessen[id];
    if (m.ungemessen && !Object.keys(m.ungemessen).length) delete m.ungemessen;
}
// DIE ZEILEN, die der Läufer zug.cjs (artifacts/profiband/werkzeug, Fortschritt nach zug/fortschritt-radeon.txt) liest: Start
// `Punkte-Maschine: <n> Station(en) in `, Station `  GRÜN|ROT  <id> · … · Exit <c> · <min> min[ (Zwilling von <id>)]` — ein neues
// Feld steht VOR „· Exit“ (26.10.: „· allein“ am Zeilenende machte den Fortschritt der Radeon blind); ein ungemessener Lauf heißt
// OFFEN, weder GRÜN noch ROT
const startZeile = (n, gruppen, geraet, sha, bahnen) =>
    "Punkte-Maschine: " + n + " Station(en) in " + gruppen.length + " Läufen auf " + geraet + " am " + sha.slice(0, 8) + " · " + planText(gruppen, bahnen);
const stationsZeile = (id, e) => {
    const bahn = e.bahn === "allein" ? "allein" : e.bahn === "sitzung" ? "Sitzung" : "Bahn " + e.bahn;
    if (e.ungemessen) return "  OFFEN " + id + " · " + e.grund + " · " + bahn + " · ungemessen, `run --offen` misst neu";
    return "  " + (e.gruen ? "GRÜN" : "ROT ") + " " + id + " · " + e.zahl + " · " + bahn + " · Exit " + e.exit + " · " + e.minuten + " min" +
        (e.zwilling ? " (Zwilling von " + e.zwilling + ")" : "");
};

// Zwillinge (gleicher Befehl, gleiche Umgebung, z. B. Staffel 1 und 2 aus EINER Linse) fahren EINMAL: je Lauf eine Gruppe
function gruppiere(meine) {
    const gruppen = [];
    const je = new Map();
    for (const st of meine) {
        const k = JSON.stringify([st.befehl, st.env || {}, !!st.gpu, ...(st.probe ? [st.probe] : [])]);
        if (!je.has(k)) { je.set(k, []); gruppen.push(je.get(k)); }
        je.get(k).push(st);
    }
    return gruppen;
}
// DIE ZWILLINGE EINER LISTE (27.10., Karte lange-stationen): der Messplatz der OMEN fährt Station für Station (`run --nur <id>`) —
// so fuhr der Lauf von speicher.K1#1 und #2 zweimal (e7a28b06 GTX 12,43 + 12,42 min). `gruppen` nennt je Lauf die Ids seiner
// Zwillinge in der Reihe von `nur` (nur Gelistete), der Messplatz fährt je Zeile EIN `--nur`
function zwillingsGruppen(stationen, geraet, nur) {
    if (!GERAETE.includes(geraet)) throw new Error("--geraet radeon|gtx|headless");
    const meine = stationen.filter((st) => geraeteVon(st).includes(geraet));
    const ids = nur ? nur.split(",") : meine.map(schluessel);
    const liste = ids.map((id) => meine.find((st) => schluessel(st) === id) || id);
    const fremd = liste.filter((x) => typeof x === "string");
    if (fremd.length) throw new Error("--nur " + fremd.join(",") + ": keine Station auf " + geraet);
    // DIE SITZUNG ist EIN Lauf: jede Probe-Station in der ersten Zeile (der Messplatz fährt sie mit EINEM `run --nur`, EINE Welt) —
    // je Zeile eine eigene Sitzung bootete die Welt je Station neu
    const gs = gruppiere(liste);
    const sitz = geraet === "headless" ? [] : gs.filter((g) => g[0].probe).flat();
    return [...(sitz.length ? [sitz] : []), ...gs.filter((g) => !sitz.includes(g[0]))].map((g) => g.map(schluessel));
}
const sollMin = (gs) => gs.reduce((s, g) => s + g[0].minuten, 0);
function planText(gruppen, bahnen) {
    const sitz = gruppen.filter((g) => g[0].probe), rest = gruppen.filter((g) => !g[0].probe);
    const zeit = rest.filter(istZeit), bild = rest.filter((g) => !istZeit(g));
    const deckel = Math.round(sitz.reduce((s, g) => s + probeSek(g[0]), 0) / 60);
    return (sitz.length ? "Sitzung " + sitz.length + " Proben in EINER Welt (Deckel Σ " + deckel + " min) · " : "") + "Zeit " + zeit.length + " Läufe ~" +
        sollMin(zeit) + " min allein · Bild " + bild.length + " Läufe ~" + sollMin(bild) + " min auf " + bahnen + " Bahn(en) · erwartet ~" +
        Math.round(sollMin(zeit) + sollMin(bild) / bahnen) + " min (Soll-Minuten" + (sitz.length ? " ohne Sitzung" : "") + ")";
}
// DER BAHN-PLAN (26.10., Karte gpu-bahnen: die Prüfung darf nie länger dauern als das Erstellen — ein Radeon-Takt fuhr 45 Stationen
// einzeln in 151–174 min, die meisten Bild-Urteile ohne ms): jede Zeit-Gruppe fährt ALLEIN auf Bahn 0, erst wenn keine andere
// läuft, und keine startet neben ihr; danach die Bild-Gruppen auf bis zu `bahnen` Bahnen zugleich, die längsten zuerst.
// fahre(gruppe, bahn) → Promise; das Platz-Schloss (gpu-lauf.sh) hält dieselbe Regel gegen fremde Läufe.
async function fahrePlan(gruppen, bahnen, fahre) {
    for (const g of gruppen.filter(istZeit)) await fahre(g, 0);
    const schlange = gruppen.filter((g) => !istZeit(g)).sort((a, b) => sollMin([b]) - sollMin([a]));
    await Promise.all(Array.from({ length: bahnen }, async (_, b) => {
        for (let g = schlange.shift(); g; g = schlange.shift()) await fahre(g, b);
    }));
}

// ───────────────────────────────── Buchung ─────────────────────────────────
// messungen: Liste {sha, geraet, je}; geaendert(messSha) → Liste der Dateien bis zum Kopf ohne Stempel (stempelDateien; wirft,
// wenn unbekannt) — die jüngste frische Messung je Station und Gerät (Abdruck gleich, Linse und Pfad seit der Messung unberührt;
// Werkzeug außerhalb der Linse ist kein Wechsel) — das EINE Frische-Urteil für die Buchung und für `run --offen`. opt.tot(st) →
// die toten Globs am Ziel-Stand (Wand PFAD) · opt.roh(sha, geraet, id) → die Roh-Ausgabe einer Messung ohne eigenen Zeugen (Wand
// GPU; "" wenn keine) · opt.linsen(st, messSha) → die Linse der Station am Mess-SHA und am Ziel (linsenAm; wirft, wenn unlesbar)
function frischUrteil(messungen, geaendert, hilfe = hilfeText(), opt = {}) {
    const diffCache = new Map();
    const diff = (sha) => {
        if (!diffCache.has(sha)) {
            try { diffCache.set(sha, { dateien: geaendert(sha) }); } catch (e) { diffCache.set(sha, { fehler: e.message }); }
        }
        return diffCache.get(sha);
    };
    return (st, g) => {
        const id = schluessel(st);
        const tot = opt.tot ? opt.tot(st) : [];
        if (tot.length) return { gruen: false, ungemessen: true, tot: true, grund: pfadGrund(tot, "am Kopf") };
        const ab = abdruck(st, hilfe);
        let alt = 0, fremd = 0, unbekannt = 0, ohneZeugen = null, taeter = [], linse = 0, linsenTaeter = [], unlesbar = null;
        const frisch = [];
        for (const m of messungen) {
            if (m.geraet !== g || !m.je || !m.je[id]) continue;
            const e = m.je[id];
            if (e.abdruck !== ab) { fremd++; continue; }
            const d = diff(m.sha);
            if (d.fehler) { unbekannt++; continue; }
            let L;
            try { L = new Set(opt.linsen ? opt.linsen(st, m.sha) : []); } catch (e) { unlesbar = e.message; continue; }
            const l = d.dateien.filter((f) => L.has(f));
            if (l.length) { linse++; linsenTaeter = l; continue; }
            const t = d.dateien.filter((f) => !WERKZEUG_PFAD.test(f) && trifftPfad(f, st.pfad));
            if (t.length) { alt++; taeter = t; continue; }
            // ein GRÜN einer GPU-Station trägt den Zeugen der Karte: im Eintrag (seit der Wand) oder in seiner Roh-Ausgabe
            if (st.gpu && e.gruen) {
                const z = "gpu" in e ? { karte: e.gpu, fremd: e.gpuFremd || null, nie: e.gpuNie || 0 } : gpuZeuge(opt.roh ? opt.roh(m.sha, g, id) : "");
                const w = gpuWand(z);
                if (w) { ohneZeugen = w; continue; }
            }
            frisch.push({ ...e, sha: m.sha, geraet: g });
        }
        frisch.sort((a, b) => String(b.zeit).localeCompare(String(a.zeit)));
        if (frisch.length) return frisch[0];
        // der Grund der jüngsten verworfenen Art zuerst: ein GRÜN ohne Zeugen vor dem R6 einer älteren Messung
        const nenne = (xs) => xs.slice(0, 3).join(", ") + (xs.length > 3 ? " +" + (xs.length - 3) : "");
        return { gruen: false, ungemessen: true, grund: ohneZeugen ? "Wand GPU: " + ohneZeugen : linse ? "Linse seit der Messung geändert (R6: " + nenne(linsenTaeter) + ")" : alt ? "Pfad seit der Messung geändert (R6: " + nenne(taeter) + ")" : unlesbar ? "Linse unlesbar — kein R6-Urteil (" + unlesbar + ")" : unbekannt ? "Mess-SHA unbekannt — kein R6-Urteil" : fremd ? "Station seit der Messung geändert" : "ungemessen (R10)" };
    };
}

// DIE PUNKTE-REGEL (R2) eines Kriteriums — die EINE für die Buchung und für gtx-nutzen: sts die Stationen des Kriteriums,
// urteil(st, g) → { gruen } je Station und Gerät. 1 = jede Staffel-1-Station auf mindestens einem Gerät grün (`beide`: auf
// jedem) · 2 = dazu jede Staffel-2-Station auf JEDEM Gerät grün · sonst 0
function stufen(sts, urteil) {
    const stufe = (n, alle) => {
        const xs = sts.filter((s) => s.staffel === n);
        const r = xs.map((s) => ({ s, je: geraeteVon(s).map((g) => ({ g, e: urteil(s, g) })) }));
        const ok = xs.length > 0 && r.every((x) => (alle || x.s.beide ? x.je.every((y) => y.e.gruen) : x.je.some((y) => y.e.gruen)));
        return { ok, r };
    };
    const s1 = stufe(1, false), s2 = stufe(2, true);
    return { s1, s2, punkte: s1.ok && s2.ok ? 2 : s1.ok ? 1 : 0 };
}

function buchen(kopf, stationen, messungen, geaendert, hilfe = hilfeText(), fehlt = [], opt = {}) {
    const frisch = frischUrteil(messungen, geaendert, hilfe, opt);
    // DIE RATSCHE: das GRÜN der letzten Buchung je Station und Gerät (opt.vorher = stand.json der letzten Buchung)
    const vorher = new Map();
    for (const e of Object.values((opt.vorher && opt.vorher.je) || {}))
        for (const x of e.stationen || []) if (x.gruen && x.sha) vorher.set(x.id + "|" + x.geraet, x);
    const rueckfall = [];
    const stand = (st, g) => {
        const e = frisch(st, g), v = vorher.get(schluessel(st) + "|" + g);
        if (!v || e.tot) return e;
        if (!e.ungemessen) {
            if (!e.gruen) rueckfall.push(schluessel(st) + " " + g + ": " + (e.zahl || "ROT") + " an " + String(e.sha).slice(0, 8) + " (grün gebucht an " + v.sha.slice(0, 8) + ")");
            return e;
        }
        return { gruen: true, zahl: v.zahl, sha: v.sha, gehalten: true, grund: e.grund };
    };
    const je = {};
    const kriterien = [...new Set(stationen.map((s) => s.kriterium))].sort();
    for (const k of kriterien) {
        const { s1, s2, punkte } = stufen(stationen.filter((s) => s.kriterium === k), stand);
        const teile = [];
        const offen = [];
        // eine erfüllte Stufe nennt ihre Grünen, eine offene jedes fehlende Gerät beim Grund
        for (const [n, s] of [[1, s1], [2, s2]])
            for (const x of s.r)
                for (const y of x.je) {
                    if (y.e.gruen) teile.push((y.e.gehalten ? "gehalten: " : "") + y.e.zahl + " an " + y.e.sha.slice(0, 8) + " " + y.g);
                    else if (!(n === 1 && s.ok)) offen.push(k + "#" + n + " " + y.g + ": " + (y.e.ungemessen ? y.e.grund : y.e.grund || "ROT: " + y.e.zahl) + (y.e.sha ? " an " + y.e.sha.slice(0, 8) : ""));
                }
        // eine Staffel ohne Werkzeug (fehlt) nennt sich im Beleg — die Maschine bucht sie nie
        if (s1.ok) for (const f of fehlt) if (f.kriterium === k && f.staffel === 2) offen.push(k + "#2: kein Werkzeug (fehlt)");
        je[k] = {
            punkte,
            beleg: "Maschine: " + (teile.length ? teile.join(" · ") : "0") + (offen.length ? " — offen: " + offen.join(" · ") : ""),
            // ungemessen/tot: das Frische-Urteil selbst — keine frische Messung am Kopf (tot: die Wand PFAD, eine Messung heilt sie nie)
            stationen: [s1, s2].flatMap((s) => s.r.flatMap((x) => x.je.map((y) => ({ id: schluessel(x.s), geraet: y.g, gruen: !!y.e.gruen, zahl: y.e.zahl || null, sha: y.e.sha || null, grund: y.e.grund || null,
                ...(y.e.ungemessen ? { ungemessen: true } : {}), ...(y.e.tot ? { tot: true } : {}), ...(y.e.gehalten ? { gehalten: true } : {}),
                ...(x.s.beide ? { beide: true } : {}) })))),
        };
    }
    return { kopf, je, rueckfall };
}

function ladeMessungen(mdir = path.join(DIR, "messung")) {
    if (!fs.existsSync(mdir)) return [];
    return fs.readdirSync(mdir).filter((f) => /\.json$/.test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(mdir, f), "utf8")));
}

// R6 urteilt über die Bytes OHNE Versions-Stempel (?v=, "version", VERSION) — 23.10.: jede Versions-Stufe stempelt index.html
// und die Worker neu, und die Buchung am nächsten Kopf warf darum jede Station mit index.html im Pfad weg, obwohl kein Spiel-Byte
// anders war. Mess-Werkzeug (scripts/, spec/, .github/, docs/, artifacts/, *.md) ist kein Weltwechsel — AUSSER der Linse der
// Station (linsenVon): der Abdruck hasht nur den Befehls-String, nie den Inhalt der Linse (28.10.: nach einem Linsen-Umbau galt
// die Messung mit der alten Linse still als frisch).
const WERKZEUG_PFAD = /^(scripts|spec|\.github|docs|artifacts)\/|\.md$/;
const VERSIONS_STEMPEL = [
    [/\?v=[0-9A-Za-z._-]+/g, "?v="],
    [/("version"\s*:\s*")[^"]*"/g, '$1"'],
    [/(VERSION\s*=\s*["'`])[^"'`]*(["'`])/g, "$1$2"],
];
const ohneStempel = (z) => VERSIONS_STEMPEL.reduce((s, [rx, e]) => s.replace(rx, e), z);
// namen: git diff --name-only · diffText: git diff -U0 über dieselben Stände → die Dateien, deren Bytes ohne Stempel sich änderten
// (Werkzeug eingeschlossen — welches davon zählt, urteilt frischUrteil je Station)
function stempelDateien(namen, diffText) {
    const je = new Map();
    let cur = null;
    for (const z of String(diffText).split("\n")) {
        const m = /^diff --git a\/(.+?) b\//.exec(z);
        if (m) {
            cur = { weg: [], neu: [], bin: false };
            je.set(m[1], cur);
            continue;
        }
        if (!cur || z.startsWith("+++ ") || z.startsWith("--- ")) continue;
        if (/^Binary files /.test(z)) cur.bin = true;
        else if (z[0] === "-") cur.weg.push(ohneStempel(z.slice(1)));
        else if (z[0] === "+") cur.neu.push(ohneStempel(z.slice(1)));
    }
    return String(namen).split("\n").filter(Boolean).filter((f) => {
        const d = je.get(f);
        if (!d || d.bin) return true;
        return d.weg.sort().join("\n") !== d.neu.sort().join("\n");
    });
}

// DIE LINSE EINER STATION (R6 über das Werkzeug, 28.10.): jede Datei unter scripts/, die ihr Befehl oder ihre Umgebung nennt
// ("scripts/…", "./scripts/…", "{BAUM}/scripts/…"), jede Werkzeug-Datei, die ihr pfad trifft, und jede lokale Datei, die diese
// per require("./…") laden — der Aufruf-Gang `rufe` der Stamm-Bibliothek (scripts/lib/stamm.cjs, acorn), kein zweiter Parser.
// dateien: die Dateien am Stand · lies(f) → Text am Stand oder null · rufe: stammAm(…).rufe. Ein unlesbarer Text wirft (beim Namen)
const LINSE_IM_BEFEHL = /(?<![\w$./-])(?:\{BAUM\}\/|\.\/)?(scripts\/[\w./-]*\w)/g;
function linsenVon(st, dateien, lies, rufe) {
    const da = dateien instanceof Set ? dateien : new Set(dateien);
    const text = befehlVon(st).join(" ") + " " + Object.values(st.env || {}).join(" ");
    const offen = [...text.matchAll(LINSE_IM_BEFEHL)].map((m) => m[1]).filter((f) => da.has(f));
    const pfad = st.pfad.map(globRegex);
    for (const f of da) if (WERKZEUG_PFAD.test(f) && pfad.some((re) => re.test(f))) offen.push(f);
    const linse = new Set();
    while (offen.length) {
        const f = offen.shift();
        if (linse.has(f)) continue;
        linse.add(f);
        if (!/\.[cm]?js$/.test(f)) continue;
        const t = lies(f);
        if (t == null) continue;
        let rs;
        try { rs = rufe(t); } catch (e) { throw new Error("Linse " + f + " unlesbar: " + e.message); }
        for (const r of rs) {
            const a = r.ziel === "require" && r.args[0];
            if (!a || a.type !== "Literal" || typeof a.value !== "string" || !/^\.\.?\//.test(a.value)) continue;
            const ziel = path.posix.normalize(path.posix.join(path.posix.dirname(f), a.value));
            const x = [ziel, ziel + ".cjs", ziel + ".js", ziel + ".json", ziel + "/index.js"].find((k) => da.has(k));
            if (x) offen.push(x);
        }
    }
    return [...linse].sort();
}
// DIE STAMM-BIBLIOTHEK des Spiels am Stand rev — aus git, nie aus dem Arbeitsbaum des Klons (er steht auf beliebigem Zweig);
// ihr acorn löst sie aus node_modules des Klons
function stammAm(repo, rev) {
    const Module = require("module");
    const f = path.join(repo, "scripts", "lib", "stamm.cjs");
    const m = new Module(f, module);
    m.filename = f;
    m.paths = Module._nodeModulePaths(path.dirname(f));
    m._compile(git(["show", rev + ":scripts/lib/stamm.cjs"], repo), f);
    return m.exports;
}
// opt.linsen der Buchung am Kopf: (st, messSha) → die Linse der Station am Mess-SHA UND am Kopf (ein require, das dazukam oder
// fiel, zählt), Texte je Blob einmal gelesen und geparst
function linsenAm(repo, kopf) {
    const { rufe } = stammAm(repo, kopf);
    const baeume = new Map(), texte = new Map(), rufeJe = new Map();
    const baum = (sha) => {
        if (!baeume.has(sha)) {
            const b = new Map();
            for (const z of git(["ls-tree", "-r", sha], repo).split(/\r?\n/)) {
                const m = /^\d+ blob ([0-9a-f]+)\t(.+)$/.exec(z);
                if (m) b.set(m[2], m[1]);
            }
            baeume.set(sha, { b, dateien: new Set(b.keys()) });
        }
        return baeume.get(sha);
    };
    const blobRufe = (t) => {
        if (!rufeJe.has(t)) rufeJe.set(t, rufe(t).map((r) => ({ ziel: r.ziel, args: r.args.slice(0, 1).map((a) => ({ type: a.type, value: a.value })) })));
        return rufeJe.get(t);
    };
    const linse = (st, sha) => {
        const { b, dateien } = baum(sha);
        const lies = (f) => {
            const id = b.get(f);
            if (!id) return null;
            if (!texte.has(id)) texte.set(id, git(["cat-file", "-p", id], repo));
            return texte.get(id);
        };
        return linsenVon(st, dateien, lies, blobRufe);
    };
    const je = new Map();
    return (st, sha) => {
        const k = schluessel(st) + "|" + sha;
        if (!je.has(k)) je.set(k, [...new Set([...linse(st, sha), ...linse(st, kopf)])]);
        return je.get(k);
    };
}

// die GTX-Stationen, deren Messung am Kopf Punkte ändern KANN — gefragt am EINEN Frische-Urteil der Buchung (s = buchen(…), je
// Station und Gerät gruen/ungemessen/tot) und an ihrer EINEN Punkte-Regel (stufen): eine gtx-Hälfte steht in der Liste, wenn sie
// am Kopf keine frische Messung trägt und eine Belegung der übrigen ungemessenen Hälften (sie fahren im selben Takt auf Radeon
// und Farm) ihren Ausgang über die Punkte des Kriteriums entscheiden lässt. Frisch Gemessenes ist Tatsache, eine Messung am Kopf
// wiederholte es (26.10.: takt5z maß 43 Stationen in ~6 h, auch Staffel 1 hinter grüner Radeon). 27.10.: das alte Urteil daneben
// verlangte Radeon-Hälfte und Staffel 1 JETZT grün — am Kopf a03b7b06 waren sie R6-alt und fuhren im selben Takt, 9 Staffeln 2
// mit alter gtx-Hälfte fehlten in der Liste, gebucht Σ 113 statt ≥ 123
function gtxNutzen(s) {
    const ja = [], nein = [];
    const wo = (id, g) => id + "|" + g;
    for (const [k, e] of Object.entries(s.je)) {
        const ids = [...new Set(e.stationen.map((x) => x.id))];
        const sts = ids.map((id) => ({ kriterium: k, staffel: Number(id.slice(id.lastIndexOf("#") + 1)), geraet: e.stationen.filter((x) => x.id === id).map((x) => x.geraet),
            ...(e.stationen.some((x) => x.id === id && x.beide) ? { beide: true } : {}) }));
        const ist = new Map(e.stationen.map((x) => [wo(x.id, x.geraet), x]));
        const offen = e.stationen.filter((x) => x.ungemessen && !x.tot).map((x) => wo(x.id, x.geraet));
        for (const id of ids.filter((i) => ist.has(wo(i, "gtx")))) {
            const ich = wo(id, "gtx"), rest = offen.filter((w) => w !== ich);
            let nutzt = false;
            for (let b = 0; offen.includes(ich) && !nutzt && b < 1 << rest.length; b++) {
                const p = (gtx) => stufen(sts, (st, g) => {
                    const w = wo(schluessel(st), g), i = rest.indexOf(w);
                    return { gruen: w === ich ? gtx : i >= 0 ? ((b >> i) & 1) === 1 : ist.get(w).gruen };
                }).punkte;
                nutzt = p(true) !== p(false);
            }
            (nutzt ? ja : nein).push(id);
        }
    }
    return { ja: ja.sort(), nein: nein.sort() };
}

// DER MESS-PLAN nach einem Zug (26.10.: 10 h vom Landen bis zur Buchung, die Prüfung länger als das Bauen): je GPU-Station
// das, was Punkte halten oder gewinnen kann, am Ergebnis des VORIGEN Kopfs — Staffel 1 braucht EIN grünes Gerät (die
// Zeit-Station auf die ruhige GTX, sonst das Gerät, das grün war), Staffel 2 nur über stehender 1 und auf beiden Geräten;
// eine rote Station ohne Heil-Versuch (der Zug nennt ihr Kriterium nicht) bleibt rot und wird nicht gemessen.
// da(id, g): die JÜNGSTE Messung der Station auf dem Gerät über alle Köpfe (ihr Vorwissen), sonst null · genannt: Set der
// Kriterien, die die Commits seit dem vorigen Kopf nennen · zeit(id): die Station urteilt in ms (ihr Merkmal `zeit`)
// DIE PFLICHT (w4-sitzung-reif, 30.10.): eine Station, deren Staffel einen Eintrag von docs/PFLICHT-OFFEN.md trägt (ihre quelle nennt
// „PFLICHT-OFFEN <X>“ — fahrzeug.K2#2, der Verkehr C), misst der Plan an jedem Zug wie einen Heil-Versuch, auch ohne stehende 1: die
// Pflicht ist der EINE Scope (Betriebsgesetz 2), ihr Messen hängt nie an den Punkten
function messPlan(stationen, da, genannt, zeit) {
    const plan = { radeon: [], gtx: [], uebersprungen: [] };
    for (const st of stationen) {
        const ge = geraeteVon(st).filter((g) => g === "radeon" || g === "gtx");
        if (!ge.length) continue;
        const id = schluessel(st), k = st.kriterium;
        const neu = ge.some((g) => !da(id, g));
        const pflicht = /\bPFLICHT-OFFEN [A-Z]\b/.test(st.quelle || "");
        const heil = genannt.has(k) || neu || pflicht;
        // `beide`: die 1 hält nur auf jedem Gerät — gemessen wird wie eine Staffel 2 (ganz grün hält, ein Heil-Versuch misst)
        if (st.staffel === 1 && st.beide) {
            if (ge.every((g) => da(id, g) && da(id, g).gruen) || heil) for (const g of ge) plan[g].push(id);
            else plan.uebersprungen.push(id);
            continue;
        }
        if (st.staffel === 1) {
            const gruen = ge.filter((g) => da(id, g) && da(id, g).gruen);
            if (gruen.length) plan[zeit(id) && gruen.includes("gtx") ? "gtx" : gruen.includes("radeon") ? "radeon" : "gtx"].push(id);
            // ein Heil-Versuch misst auf der GTX — EIN grünes Gerät trägt die 1, die Radeon entwickelt und misst nicht groß (Schöpfer 30.10.)
            else if (heil) plan[ge.includes("gtx") ? "gtx" : ge[0]].push(id);
            else plan.uebersprungen.push(id);
            continue;
        }
        const s1 = stationen.find((x) => x.kriterium === k && x.staffel === 1);
        const s1gruen = s1 && geraeteVon(s1).some((g) => da(schluessel(s1), g) && da(schluessel(s1), g).gruen);
        const allesGruen = ge.every((g) => da(id, g) && da(id, g).gruen);
        if ((s1gruen || genannt.has(k) || pflicht) && (allesGruen || heil)) for (const g of ge) plan[g].push(id);
        else plan.uebersprungen.push(id);
    }
    return plan;
}

function planCli(opt) {
    if (!opt.kopf || !opt.vorher) throw new Error("plan --kopf <neu> --vorher <voriger Kopf>");
    const repo = spielRepo();
    const [neu, alt] = [voll(repo, opt.kopf), voll(repo, opt.vorher)];
    const { stationen } = ladeGeprueft();
    const juengste = {};
    for (const m of ladeMessungen())
        for (const [id, e] of Object.entries(m.je || {})) {
            const w = id + "|" + m.geraet;
            if (!juengste[w] || String(e.zeit) > String(juengste[w].zeit)) juengste[w] = e;
        }
    const ab = Object.fromEntries(stationen.map((st) => [schluessel(st), abdruck(st)]));
    const da = (id, g) => {
        const e = juengste[id + "|" + g];
        return e && (!e.abdruck || e.abdruck === ab[id]) ? e : null;
    };
    // ein Heil-Versuch ist jedes Kriterium, das ein Commit beim Namen nennt, UND jedes, dessen Zweig laut weg.json (wellen: Staffel →
    // Zweig) im Zug landete — 28.10.: „Merge siedlung-k1-innen in integ-probe" nennt kein Kriterium, der Plan übersprang siedlung.K1#2,
    // leib.K2#2 und vegetation.K4#2 als „rot ohne Heil-Versuch", obwohl ihre Zweige gelandet waren
    const genannt = new Set((git(["log", "--format=%B", alt + ".." + neu], repo).match(/\b[a-z]+\.K\d\b/g) || []));
    const gelandet = new Set(git(["log", "--merges", "--format=%s", alt + ".." + neu], repo).split("\n").map((z) => (/^Merge (\S+) in /.exec(z) || [])[1]).filter(Boolean));
    const weg = path.join(DIR, "weg.json");
    for (const w of fs.existsSync(weg) ? JSON.parse(fs.readFileSync(weg, "utf8")).wellen || [] : [])
        for (const [staffel, zweig] of Object.entries(w.staffeln || {})) if (gelandet.has(zweig)) genannt.add(staffel.replace(/#\d+$/, ""));
    const minVon = (id) => Math.max(0, ...["radeon", "gtx"].map((g) => (da(id, g) && da(id, g).minuten - (da(id, g).warten || 0)) || 0));
    const zeit = new Set(stationen.filter((st) => st.zeit).map(schluessel));
    const p = messPlan(stationen, da, genannt, (id) => zeit.has(id));
    const sum = (ids) => Math.round(ids.reduce((a, id) => a + minVon(id), 0));
    console.log("MESS-PLAN " + neu.slice(0, 8) + " nach " + alt.slice(0, 8) + " · genannt: " + ([...genannt].join(" ") || "—"));
    for (const g of ["radeon", "gtx"]) console.log(g + " " + p[g].length + " Stationen ~" + sum(p[g]) + " min · nur=" + p[g].join(","));
    console.log("übersprungen " + p.uebersprungen.length + " (rot ohne Heil-Versuch oder Staffel 2 ohne stehende 1): " + p.uebersprungen.join(" "));
    // DIE RATSCHE im Plan (30.10.): was gebucht GRÜN steht, hält ohne Neumessung — es zu messen ist Rückfall-Probe (die GTX-Hälfte
    // prio 3 im Leerlauf der OMEN, die Radeon-Hälfte nur, wenn die Werkbank ruht); nur der Rest kann gewinnen (prio 1) — sonst misst
    // jeder Kopf ~130 gehaltene Stationen nach (73bdf938: Radeon 72 → 13 Stationen, ~290 → ~23 min)
    const gebucht = new Set();
    for (const e of Object.values((liesStand() || {}).je || {})) for (const x of e.stationen || []) if (x.gruen) gebucht.add(x.id + "|" + x.geraet);
    p.gewinn = {}; p.halten = {};
    for (const g of ["radeon", "gtx"]) {
        p.gewinn[g] = p[g].filter((id) => !gebucht.has(id + "|" + g));
        p.halten[g] = p[g].filter((id) => gebucht.has(id + "|" + g));
        console.log(g + " gewinn " + p.gewinn[g].length + " Stationen ~" + sum(p.gewinn[g]) + " min (prio 1) · nur=" + p.gewinn[g].join(","));
        console.log(g + " halten " + p.halten[g].length + " Stationen ~" + sum(p.halten[g]) + " min (Rückfall-Probe, prio 3) · nur=" + p.halten[g].join(","));
    }
    return p;
}

function gtxNutzenCli(opt) {
    const s = buchenCli({ ...opt, trocken: true });
    const n = gtxNutzen(s);
    console.log("GTX-NUTZEN " + n.ja.length + " von " + (n.ja.length + n.nein.length) + " Stationen am " + s.kopf + " ändern Punkte");
    console.log("nur=" + n.ja.join(","));
    return n;
}

function buchenCli(opt) {
    if (!opt.kopf) throw new Error("--kopf fehlt");
    const { stationen, fehler, fehlt } = ladeGeprueft();
    if (fehler.length) throw new Error("Stationen ROT:\n - " + fehler.join("\n - "));
    const repo = spielRepo();
    const kopfVoll = voll(repo, opt.kopf);
    const dateien = dateienAm(repo, kopfVoll);
    // die Ratsche hält gegen die letzte Buchung (stand.json vor dem Schreiben)
    const vorher = opt.ohneRatsche ? null : liesStand();
    const s = buchen(kopfVoll.slice(0, 8), stationen, ladeMessungen(), (sha) =>
        stempelDateien(git(["diff", "--name-only", sha, kopfVoll], repo), git(["diff", "-U0", "--no-color", sha, kopfVoll], repo)),
        hilfeText(), fehlt, { tot: (st) => toteGlobs(st.pfad, dateien), roh: rohAus(), linsen: linsenAm(repo, kopfVoll), vorher });
    s.kopfVoll = kopfVoll;
    s.zeit = new Date().toISOString();
    if (vorher) s.vorher = vorher.kopf;
    if (opt.trocken) return s;
    fs.writeFileSync(path.join(DIR, "stand.json"), JSON.stringify(s, null, 1) + "\n");
    for (const [k, e] of Object.entries(s.je)) console.log("  " + k + " " + e.punkte + " · " + e.beleg);
    for (const r of s.rueckfall) console.log("  RÜCKFALL " + r);
    const gehalten = Object.values(s.je).reduce((a, e) => a + e.stationen.filter((x) => x.gehalten).length, 0);
    console.log("Kopf " + s.kopf + " · Maschine " + Object.keys(s.je).length + " Kriterien · Σ " + Object.values(s.je).reduce((a, e) => a + e.punkte, 0) +
        (vorher ? " · Ratsche gegen " + vorher.kopf + ": gehalten " + gehalten + ", Rückfall " + s.rueckfall.length : " · ohne Ratsche") + " → stand.json");
    return s;
}

// ───────────────────────────────── Übergang in gen.cjs ─────────────────────────────────
// liest stand.json (falls da); Rückgabe null oder { kopf, je }
function liesStand(datei = path.join(DIR, "stand.json")) {
    return fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
}
// überschreibt in den Kriterien der Quelle (bereichKey, index, kriterium) punkte und beleg der REGISTRIERTEN
function maschinenKriterium(stand, bereichKey, i, k) {
    const e = stand && stand.je[bereichKey + ".K" + (i + 1)];
    return e ? { ...k, punkte: e.punkte, beleg: e.beleg, maschine: true } : k;
}
// Fehler des Übergangs: Kopf ungleich, Kriterium unbekannt
function standPruefen(stand, kopfKarte, bekannt) {
    const f = [];
    if (!stand) return f;
    if (stand.kopf !== String(kopfKarte).slice(0, 8)) f.push("stand.json am Kopf " + stand.kopf + ", die Karte am Kopf " + kopfKarte + " — punkte.cjs buchen --kopf " + kopfKarte);
    for (const id of Object.keys(stand.je)) if (!bekannt.has(id)) f.push("stand.json bucht " + id + ", die Karte kennt es nicht");
    return f;
}

// ───────────────────────────────── Selbsttest ─────────────────────────────────
// `selbsttest --ohne 3c` (w4-sitzung-eichen): ohne den Teil (3c) DIE BAHNEN — er zeugt Bash-Waisen neben einer Sitzung; was fehlt, steht
// in der letzten Zeile beim Namen (bis dahin „Selbsttest ohne (3c)“ von Hand, Exit 1 allein durch den ausgelassenen Teil)
const SELBST_TEILE = ["3c"];
async function selbsttest(o = {}) {
    const ohne = new Set(String(o.ohne || "").split(",").filter(Boolean));
    for (const t of ohne) if (!SELBST_TEILE.includes(t)) throw new Error("--ohne " + t + ": nur " + SELBST_TEILE.join(", "));
    const fall = [];
    const pruef = (name, ok, was) => { fall.push({ name, ok }); console.log((ok ? "  GRÜN " : "  ROT  ") + name + (was ? " — " + was : "")); };
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "punkte-selbst-"));
    const karte = kriterienDerKarte();
    // (1) die echten Stationen gegen die Karte
    const echt = ladeGeprueft();
    pruef("FORMAT echte Stationen gegen src/gN.js", echt.fehler.length === 0 && echt.stationen.length > 0,
        echt.stationen.length + " Stationen, " + echt.fehlt.length + " fehlt, " + echt.fehler.length + " Fehler" + (echt.fehler.length ? ": " + echt.fehler.join(" | ") : ""));
    // (1a) DIE PROBEN: jede Station urteilt ihre Roh-Ausgaben (die Mutanten der Soll-Tafel ROT), eine falsche Probe beim Namen
    {
        const n = echt.stationen.reduce((s, st) => s + (st.proben || []).length, 0);
        const falsch = probenUrteil(echt.stationen);
        pruef("PROBEN jede Station urteilt ihre Roh-Ausgaben wie erwartet (" + n + " Proben)", n > 0 && falsch.length === 0, falsch.join(" | "));
        const luegt = probenUrteil([{ kriterium: "a.K1", staffel: 1, urteil: (j, l) => ({ gruen: /GRÜN/.test(l.stdout), zahl: "z" }),
            proben: [{ name: "Roh", stdout: "GRÜN", gruen: true }, { name: "Mutante", stdout: "ROT", gruen: true }] }]);
        pruef("PROBEN eine Probe, deren Urteil nicht stimmt, beim Namen", luegt.join() === "a.K1#1 Mutante: ROT statt GRÜN (z)", luegt.join());
    }
    // (1b) R6 liest Bytes ohne Stempel: Versions-Stempel fallen, Code, Binär und Werkzeug bleiben (welches Werkzeug zählt, urteilt
    // frischUrteil an der Linse der Station)
    {
        const namen = "index.html\nscripts/lib/welt-boot.cjs\nstamm/kampf.js\ngelaende-core.js\nbild.png\nREADME.md";
        const dt = [
            "diff --git a/index.html b/index.html", "--- a/index.html", "+++ b/index.html", "@@ -1 +1 @@",
            '-<script src="phyto-core.js?v=18.546.73" defer></script>', '+<script src="phyto-core.js?v=18.546.74" defer></script>',
            "diff --git a/stamm/kampf.js b/stamm/kampf.js", "--- a/stamm/kampf.js", "+++ b/stamm/kampf.js", "@@ -9 +9 @@", "-x = 1;", "+x = 2;",
            "diff --git a/gelaende-core.js b/gelaende-core.js", "@@ -1 +1 @@", '-importScripts("a.js?v=1.2");', '+importScripts("a.js?v=1.3");', "+neu();",
            "diff --git a/bild.png b/bild.png", "Binary files a/bild.png and b/bild.png differ",
        ].join("\n");
        const w = stempelDateien(namen, dt).join(",");
        pruef("R6 ohne Stempel: Stempel fallen, Code, Binär und Werkzeug bleiben", w === "scripts/lib/welt-boot.cjs,stamm/kampf.js,gelaende-core.js,bild.png,README.md", w);
    }
    // (2) jede Format-Verletzung beim Namen
    const st0 = { kriterium: "gelaende.K4", staffel: 1, geraet: "headless", befehl: ["node", "-e", "0"], gpu: false, zeit: false, minuten: 1,
        urteil: () => ({ gruen: true, zahl: "x" }), pfad: ["stamm/wasser-*.js"], quelle: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort" };
    const fv = [
        ["FORMAT-ROT Kriterium unbekannt", { kriterium: "gelaende.K9" }, /Kriterium unbekannt/],
        ["FORMAT-ROT Quelle nicht wörtlich", { quelle: "1 = alle Leser folgen irgendwie" }, /nicht wörtlich/],
        ["FORMAT-ROT Quelle andere Stufe", { staffel: 2, quelle: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort" }, /Stufe 2/],
        ["FORMAT-ROT Pfad leer", { pfad: [] }, /pfad leer/],
        ["FORMAT-ROT Staffel 2 GPU an einem Gerät", { staffel: 2, geraet: "radeon", gpu: true, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" }, /beide Geräte/],
        ["FORMAT-ROT radeon ohne gpu", { geraet: "radeon", gpu: false }, /gpu: true/],
        ["FORMAT-ROT GPU-Station ohne zeit", { geraet: "radeon", gpu: true, zeit: undefined }, /zeit nicht boolesch/],
        ["FORMAT-ROT Urteil kein Code", { urteil: "(j) => ({gruen:true})" }, /keine Funktion/],
        ["FORMAT-ROT argv npm", { befehl: ["npm", "run", "x"] }, /node\|bash/],
    ];
    for (const [name, mut, re] of fv) {
        const r = pruefeStationen([{ ...st0, ...mut }, ...(mut.staffel === 2 ? [st0] : [])], karte);
        pruef(name, r.fehler.some((f) => re.test(f)), r.fehler.join(" | "));
    }
    {
        const r = pruefeStationen([{ ...st0, staffel: 2, geraet: ["radeon", "gtx"], gpu: true, befehl: undefined, probe: { befehl: ["node", "-e", "0"], sek: 30 },
            quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" }], karte);
        pruef("FORMAT-ROT Staffel 2 ohne Staffel 1", r.fehler.some((f) => /keine Staffel-1-Station/.test(f)), r.fehler.join(" | "));
        const d = pruefeStationen([st0, st0], karte);
        pruef("FORMAT-ROT doppelte Station", d.fehler.some((f) => /doppelt/.test(f)), d.fehler.join(" | "));
        const n = pruefeStationen([st0, { kriterium: "gelaende.K4", staffel: 2, befehl: null, grund: "kein Werkzeug" }], karte);
        pruef("FORMAT-ROT befehl null in der fahrbaren Liste", n.fehler.some((f) => /gehört in module.exports.fehlt/.test(f)) && n.stationen.length === 1, n.fehler.join(" | "));
        const fl = pruefeFehlt([{ kriterium: "gelaende.K4", staffel: 2, befehl: null }, { kriterium: "gelaende.K4", staffel: 1, befehl: null, grund: "kein Werkzeug" }], karte, [st0]);
        pruef("FORMAT-ROT fehlt ohne Grund · fehlt zugleich fahrbar", fl.length === 2 && /grund fehlt/.test(fl[0]) && /zugleich fahrbare/.test(fl[1]), fl.join(" | "));
        // `beide`: eine Staffel 1, deren Text beide Geräte nennt, trägt es; nie an Staffel 2 oder an einem Gerät
        const pb = { ...st0, kriterium: "profiband.K1", geraet: ["radeon", "gtx"], gpu: true, zeit: true, befehl: undefined, probe: { befehl: ["node", "-e", "0"], sek: 30 },
            quelle: "1 = Frame p95 ≤ 33 ms (der Boden von PFLICHT E) in jeder Bewegungszelle an beiden Geräten" };
        const bf = [pb, { ...pb, beide: true, geraet: "radeon" }, { ...st0, staffel: 2, beide: true, geraet: ["radeon", "gtx"], gpu: true, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" }]
            .map((s) => pruefeStationen([s, ...(s.staffel === 2 ? [st0] : [])], karte).fehler.join(" | "));
        pruef("FORMAT-ROT die Staffel 1 nennt beide Geräte ohne beide · beide an einem Gerät · beide an Staffel 2",
            /nennt beide Geräte — beide: true/.test(bf[0]) && /beide nur als true/.test(bf[1]) && /beide nur als true/.test(bf[2]) && pruefeStationen([{ ...pb, beide: true }], karte).fehler.length === 0, bf.join(" || "));
        // DIE FAHRT (29.10., eine Fahrt durch jedes System ≤ 30 min je Gerät): (a) ein befehl auf einer Karte, (b) eine 80-min-Station und
        // ein Deckel über 45 s ohne ausnahme, (c) die Summe 1 801 s — jede Klasse ROT beim Namen, die Grenze selbst grün
        const fa = (mut) => pruefeStationen([{ ...pb, beide: true, ...mut }], karte).fehler.join(" | ");
        const fb = [fa({ befehl: ["node", "-e", "0"], probe: undefined, geraet: "gtx", beide: undefined }), fa({ probe: { befehl: ["node", "-e", "0"], sek: 4800, ausnahme: "achtzig Minuten eigener Boot" } }),
            fa({ probe: { befehl: ["node", "-e", "0"], sek: 60 } }), fa({ probe: { befehl: ["node", "-e", "0"], sek: 45, ausnahme: "der Grund beim Namen" } }),
            fa({ probe: { befehl: ["node", "-e", "0"], sek: 90, ausnahme: "der Grund beim Namen" } }), fa({ probe: { befehl: ["node", "-e", "0"] } })];
        pruef("FAHRT-ROT (a) ein befehl auf gtx · (b) eine 80-min-Station, 60 s ohne ausnahme, eine ausnahme an 45 s — je beim Namen; 90 s mit ausnahme und die Vorgabe 45 s grün",
            /befehl auf gtx — eine Station der Karte misst nur als Probe/.test(fb[0]) && /Deckel 4800 s über 90 s — nie, auch mit ausnahme/.test(fb[1]) &&
            /Deckel 60 s über 45 s ohne ausnahme/.test(fb[2]) && /ausnahme an einem Deckel von 45 s/.test(fb[3]) && fb[4] === "" && fb[5] === "" && probeSek({ probe: {} }) === PROBE_DECKEL_S, fb.join(" || "));
        const fp = (n, sek, ge = ["radeon", "gtx"], befehl = "p" + n) => ({ kriterium: "f.K" + n, staffel: 1, geraet: ge, gpu: true, probe: { befehl: ["node", befehl], sek } });
        // die Grenze aus den Konstanten: n × 45 + der Rest + Boot = FAHRT_MAX_S (bis w4-fehlt-acht fest 37 × 45 + 15 + Boot 120)
        const nG = Math.floor((FAHRT_MAX_S - SITZUNG_BOOT_S - 1) / PROBE_DECKEL_S), restG = FAHRT_MAX_S - SITZUNG_BOOT_S - nG * PROBE_DECKEL_S;
        const grenze = Array.from({ length: nG }, (_, i) => fp(i + 1, PROBE_DECKEL_S)).concat([fp(nG + 1, restG)]);
        const zw = [fp(90, 45, ["radeon", "gtx"], "zw"), { ...fp(90, 45, ["radeon", "gtx"], "zw"), staffel: 2 }]; // Zwillinge: EIN Lauf
        const uf = [fahrtUrteil(grenze), fahrtUrteil([...grenze.slice(0, -1), fp(nG + 1, restG + 1)]), fahrtUrteil([...grenze.slice(0, nG - 1), ...zw, fp(nG + 1, restG)]),
            fahrtUrteil([...grenze.slice(0, nG - 2), fp(nG - 1, 90), fp(nG, 60), fp(nG + 1, restG)]), fahrtUrteil([...grenze.slice(0, -1), fp(nG + 1, restG + 1, ["radeon"])])];
        const ueber = "radeon: die Fahrt " + (FAHRT_MAX_S + 1) + " s über " + FAHRT_MAX_S + " s (Σ Deckel " + (FAHRT_MAX_S - SITZUNG_BOOT_S + 1) + " s in " + (nG + 1) + " Läufen + Boot " + SITZUNG_BOOT_S +
            " s) — die größten: f.K1#1 45 s, f.K2#1 45 s, f.K3#1 45 s (" + nG + " Läufe am Deckel 45 s)";
        pruef("FAHRT-ROT (c) Σ Deckel + Boot " + SITZUNG_BOOT_S + " s: 1 800 s grün, 1 801 s ROT je Karte mit den drei größten beim Namen, Zwillinge EIN Lauf, eine Karte allein",
            uf[0].length === 0 && uf[1].length === 2 && uf[1][0] === ueber &&
            /^gtx: die Fahrt 1801 s/.test(uf[1][1]) && uf[2].length === 0 && uf[3].length === 2 && uf[3][0].includes("die größten: f.K" + (nG - 1) + "#1 90 s, f.K" + nG + "#1 60 s, f.K1#1 45 s") &&
            uf[4].length === 1 && /^radeon: /.test(uf[4][0]), JSON.stringify(uf));
        const echtGross = ladeStationen().map((s) => (s.probe ? { ...s, probe: { ...s.probe, sek: 90, ausnahme: "der Selbsttest bläht jeden Deckel" } } : s));
        const eg = pruefeStationen(echtGross, karte).fehler.filter((f) => /^(radeon|gtx): die Fahrt/.test(f));
        pruef("FAHRT-ROT an der echten Liste: jeder Deckel auf 90 s gebläht reißt die Fahrt beider Karten (liste, run und buchen fallen dort)",
            eg.length === 2 && eg.every((f) => /die größten: /.test(f)), eg.join(" | "));
    }
    // (3) Läufer: grün / rot / Absturz / Deckel / Urteil ungültig / GPU ohne Schloss / GPU über das Schloss
    const ctx = (n) => ({ baum: tmp, koord: KOORD, port: null, aus: path.join(tmp, n + ".json"), roh: path.join(tmp, n + ".out"), geraet: "radeon", bash: findeBash(), gpuLauf: null, deckelMinS: 0 });
    const schreib = (wert) => ["node", "-e", "require('fs').writeFileSync(process.argv[1], JSON.stringify(" + JSON.stringify(wert) + "))", "{AUS}"];
    const lies = (j) => ({ gruen: j.n === 0, zahl: "n " + j.n });
    let e = await fahreStation({ ...st0, befehl: schreib({ n: 0 }), urteil: lies }, ctx("gruen"));
    pruef("LÄUFER grün", e.gruen === true && e.zahl === "n 0" && e.exit === 0, JSON.stringify(e));
    e = await fahreStation({ ...st0, befehl: schreib({ n: 3 }), urteil: lies }, ctx("rot"));
    pruef("LÄUFER rot", e.gruen === false && /ROT: n 3/.test(e.grund), JSON.stringify(e));
    e = await fahreStation({ ...st0, befehl: ["node", "-e", "process.exit(3)"], urteil: lies }, ctx("absturz"));
    pruef("LÄUFER Absturz ohne Ausgabe", e.gruen === false && e.exit === 3 && /Urteil warf/.test(e.grund), JSON.stringify(e));
    e = await fahreStation({ ...st0, minuten: 0.01, befehl: ["node", "-e", "console.log('SCHRITT /umstellen 41.3 s'); setTimeout(()=>{}, 60000)"], urteil: () => ({ gruen: true, zahl: "still" }) }, ctx("deckel"));
    pruef("LÄUFER Deckel, beim Namen der letzten Zeile", e.gruen === false && /Deckel .* \(zuletzt: SCHRITT \/umstellen 41\.3 s\)$/.test(e.grund), JSON.stringify(e));
    // ein Enkel erbt das Rohr und schläft 20 s (wie ein Herzschlag `( while sleep 300 … ) &` ohne Umleitung): die Station endet
    // mit ihrem Prozess (am alten Läufer: close nach 20,5 s, exit nach 0,46 s)
    e = await fahreStation({ ...st0, befehl: ["bash", "-c", "( sleep 20 ) & echo '{\"n\": 0}' > \"$1\"", "enkel", "{AUS}"], urteil: lies }, ctx("enkel"));
    pruef("LÄUFER ein Enkel mit dem Rohr hält die Station nicht (Ende am Prozess, nie am Rohr)", e.gruen === true && e.minuten < 0.25, JSON.stringify(e));
    e = await fahreStation({ ...st0, env: { LINSE_GPU: "hardware" }, befehl: ["node", "-e", "console.log(process.env.LINSE_GPU)"], urteil: (j, l) => ({ gruen: true, zahl: l.stdout.trim() || "leer" }) }, ctx("karte"));
    const e2 = await fahreStation({ ...st0, befehl: ["node", "-e", "console.log(process.env.LINSE_GPU)"], urteil: (j, l) => ({ gruen: l.stdout.trim() === "software", zahl: l.stdout.trim() || "leer" }) }, ctx("soft"));
    pruef("LÄUFER headless fährt LINSE_GPU=software, nie die Karte", e.gruen === false && /LINSE_GPU=software/.test(e.grund) && e2.gruen === true, JSON.stringify([e, e2]));
    e = await fahreStation({ ...st0, urteil: () => ({ gruen: 1, zahl: "" }) }, ctx("ungueltig"));
    pruef("LÄUFER Urteil ungültig", e.gruen === false && /Urteil ungültig/.test(e.grund), JSON.stringify(e));
    e = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: schreib({ n: 0 }), urteil: lies }, ctx("ohne-schloss"));
    pruef("LÄUFER GPU ohne Schloss läuft nie", e.gruen === false && /gpu-lauf.sh fehlt/.test(e.grund) && !fs.existsSync(path.join(tmp, "ohne-schloss.json")), JSON.stringify(e));
    if (findeBash()) {
        const falsch = path.join(tmp, "gpu-lauf.sh");
        fs.writeFileSync(falsch, '#!/bin/bash\nN="$1"; shift\necho "schloss $N $GPU_LAUF_MAX_S"\n"$@"\n');
        const c = { ...ctx("schloss"), gpuLauf: falsch };
        const mitKarte = (zeilen) => ["node", "-e", "for (const z of " + JSON.stringify(zeilen) + ") console.log(z); require('fs').writeFileSync(process.argv[1], JSON.stringify({ n: 0 }))", "{AUS}"];
        e = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: mitKarte(["[linse-gpu] amd/rdna-3"]), urteil: (j, l) => ({ gruen: j.n === 0 && /schloss punkte-radeon-1 120/.test(l.stdout), zahl: l.stdout.trim().split("\n")[0] }) }, { ...c, deckelMinS: 120 });
        pruef("LÄUFER GPU über das Schloss", e.gruen === true && e.gpu === "amd/rdna-3", JSON.stringify(e));
        // (3c) DAS SCHLOSS DES RECHNERS: headless nimmt einen Platz (bild) neben den Bahnen der Karte, ohne Karte und ohne Zeugen
        e = await fahreStation({ ...st0, befehl: ["node", "-e", "console.log(process.env.LINSE_GPU + ' ' + process.env.GPU_LAUF_ART)"],
            urteil: (j, l) => ({ gruen: /schloss punkte-headless-1 120/.test(l.stdout) && /software bild/.test(l.stdout), zahl: l.stdout.trim().split("\n").join(" | ") }) },
            { ...c, geraet: "headless", deckelMinS: 120 });
        pruef("LÄUFER headless nimmt einen Platz im Schloss des Rechners (ein Zeit-Lauf misst allein), nie die Karte", e.gruen === true && e.gpu === undefined, JSON.stringify(e));
        // (3b) DIE WAND GPU: ohne Zeugen der Karte, mit Software-Adapter, mit „zeichnet nie" ROT; der Zeuge aus dem Log eines Kindes GRÜN
        const gs = { ...st0, geraet: "radeon", gpu: true, urteil: lies };
        e = await fahreStation({ ...gs, befehl: schreib({ n: 0 }) }, { ...ctx("ohne-zeugen"), gpuLauf: falsch });
        pruef("WAND GPU ohne Zeugen der Karte → ROT", e.gruen === false && /Wand GPU: keine Linse nennt eine Karte/.test(e.grund) && e.gpu === null, JSON.stringify(e));
        e = await fahreStation({ ...gs, befehl: mitKarte(["[linse-gpu] google/swiftshader"]) }, { ...ctx("software"), gpuLauf: falsch });
        pruef("WAND GPU Software-Adapter → ROT", e.gruen === false && /ohne Karte \(\[linse-gpu\] google\/swiftshader\)/.test(e.grund), JSON.stringify(e));
        e = await fahreStation({ ...gs, befehl: mitKarte(["[linse-gpu] amd/rdna-3", "[welt-boot] FEHLER klasse: x.cjs startet „linse“ und zeichnet nie (keine seiner 1 Seiten arbeitet auf der GPU): das Rezept ist „null“"]) }, { ...ctx("nie"), gpuLauf: falsch });
        pruef("WAND GPU die Linse zeichnet nie → ROT", e.gruen === false && /Wand GPU: die Linse zeichnet nie/.test(e.grund) && e.gpuNie === 1, JSON.stringify(e));
        const kind = "const cp = require('child_process'), fs = require('fs'); const fd = fs.openSync(process.argv[1] + '.log', 'w'); " +
            "cp.spawnSync(process.execPath, ['-e', " + JSON.stringify("console.log('[linse-gpu] nvidia/pascal')") + "], { stdio: ['ignore', fd, 'inherit'] }); " +
            "fs.writeFileSync(process.argv[1], JSON.stringify({ n: 0 }))";
        e = await fahreStation({ ...gs, befehl: ["node", "-e", kind, "{AUS}"], urteil: (j, l) => ({ gruen: j.n === 0 && /^\[linse-gpu\] nvidia\/pascal$/m.test(l.stdout), zahl: "n " + j.n }) }, { ...ctx("kind"), gpuLauf: falsch });
        pruef("WAND GPU der Zeuge liest das Log eines Kind-Prozesses, das Urteil sieht seinen Adapter → GRÜN", e.gruen === true && e.gpu === "nvidia/pascal", JSON.stringify(e));
        // (3a) EIN BLOCKIERTES SCHLOSS IST KEINE MESSUNG: Exit 75 und ein gpu-lauf.sh, das beim Warten schweigt, sind ungemessen beim
        // Grund — nie ROT in m.je, und `run --offen` (frischUrteil) misst die Station neu; ein Lauf AM Schloss schweigt, so lang er will
        const c2 = { ...ctx("blockiert"), gpuLauf: path.join(tmp, "blockiert.sh") };
        fs.writeFileSync(c2.gpuLauf, "#!/bin/bash\necho 'SCHLOSS BLOCKIERT von Nachtruhe 0325-0415 nach 2701 s Warten'\nexit 75\n");
        const sg = { ...st0, geraet: "radeon", gpu: true, urteil: () => ({ gruen: true, zahl: "x" }) };
        e = await fahreStation(sg, c2);
        const mb = { sha: "b1", geraet: "radeon", je: {} };
        eintragen(mb, "gelaende.K4#1", { ...e, zeit: "2026-10-26T02:11:00Z", abdruck: abdruck(sg, "h") });
        const fr = frischUrteil([mb], () => [], "h")(sg, "radeon");
        const nachher = { ...mb, je: { ...mb.je }, ungemessen: { ...mb.ungemessen } };
        eintragen(nachher, "gelaende.K4#1", { gruen: true, zahl: "z", exit: 0, minuten: 1 });
        pruef("LÄUFER GPU-Schloss blockiert (Exit 75) ist UNGEMESSEN beim Namen, nie ROT in der Messung — run --offen misst neu",
            e.ungemessen === true && e.gruen === false && /Schloss blockiert.*Nachtruhe 0325-0415/.test(e.grund) && !mb.je["gelaende.K4#1"] &&
            !!mb.ungemessen["gelaende.K4#1"] && fr.ungemessen === true && /R10/.test(fr.grund) && nachher.je["gelaende.K4#1"].gruen && !nachher.ungemessen,
            JSON.stringify([e, mb, fr]));
        const c3 = { ...ctx("schweigt"), gpuLauf: path.join(tmp, "schweigt.sh"), stillS: 2 };
        fs.writeFileSync(c3.gpuLauf, "#!/bin/bash\necho 'gpu-lauf: probe (bild) wartet auf ?' >&2\nsleep 60\n");
        e = await fahreStation(sg, c3);
        // der Wächter 12 s, am Schloss 18 s still (29.10.: mit 3 s gegen 9 s riss der Fall am Laptop unter Last — die bash des Stubs
        // startete erst nach 3 s, der Wächter vor dem Schloss schlug zu; Lehre 26, nie die Wanduhr knapp)
        const c4 = { ...ctx("am-schloss"), gpuLauf: path.join(tmp, "am-schloss.sh"), stillS: 12 };
        fs.writeFileSync(c4.gpuLauf, '#!/bin/bash\nN="$1"; shift\necho "gpu-lauf: Schloss $N (bild, Platz 1 von 2) nach 0 s" >&2\nsleep 18\n"$@"\n');
        const e4 = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: mitKarte(["[linse-gpu] amd/rdna-3"]), urteil: lies }, { ...c4, deckelMinS: 120 });
        pruef("LÄUFER ein Schloss, das nie kommt (gpu-lauf.sh schweigt beim Warten), ist UNGEMESSEN; der Deckel zählt erst ab dem Schloss",
            e.ungemessen === true && /nie bekommen: gpu-lauf.sh schwieg 2 s/.test(e.grund) && e4.gruen === true && !e4.ungemessen, JSON.stringify([e, e4]));
        // (3e) DAS WARTEN: die Minuten bis zur Zeile „gpu-lauf: Schloss …“ stehen als `warten` neben `minuten` (die Arbeit ist die Differenz)
        const c5 = { ...ctx("wartet"), gpuLauf: path.join(tmp, "wartet.sh"), stillS: 30 };
        fs.writeFileSync(c5.gpuLauf, '#!/bin/bash\nN="$1"; shift\necho "gpu-lauf: $N (zeit) wartet auf Vorfahrt" >&2\nsleep 3\necho "gpu-lauf: Schloss $N (zeit) nach 3 s" >&2\n"$@"\n');
        const e5 = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: mitKarte(["[linse-gpu] amd/rdna-3"]), urteil: lies }, { ...c5, deckelMinS: 120 });
        pruef("LÄUFER das Warten am Schloss steht als `warten` (3 s vor dem Schloss), ein Lauf ohne Schloss trägt keins",
            e5.gruen === true && e5.warten >= 0.05 && e5.warten <= e5.minuten && typeof e4.warten === "number" && !("warten" in e2), JSON.stringify([e5, e4.warten, e2]));
    } else pruef("LÄUFER GPU über das Schloss", false, "keine Git-bash");
    // (3d) DER LESER zug.cjs (artifacts/profiband/werkzeug/zug.cjs, punkte(): Fortschritt der Radeon nach zug/fortschritt-radeon.txt) —
    // seine Muster wörtlich: Start und Station in dem Format, das er liest; ein ungemessener Lauf ist weder GRÜN noch ROT noch toter
    // Glob (26.10.: „· allein“ am Zeilenende, n blieb 0, jede ROT-Zeile zählte als toter Glob)
    {
        const START = /^Punkte-Maschine: (\d+) Station\(en\) in /, STATION = /^  (GRÜN|ROT ) (\S+) · .* · Exit \S+ · ([\d.]+) min( \(Zwilling von \S+\))?$/, TOT = /^  ROT  (\S+) · /;
        const gs = [[{ ...st0, minuten: 2 }], [{ ...st0, minuten: 3, zeit: true }]];
        const s = startZeile(7, gs, "radeon", "0123456789abcdef", 3) + " (Baum x)";
        const z = [stationsZeile("a.K1#1", { gruen: true, zahl: "z · 3", exit: 0, minuten: 1.5, bahn: "2/3" }),
            stationsZeile("a.K1#2", { gruen: false, zahl: "rot", exit: 1, minuten: 0.4, bahn: "allein", zwilling: "a.K1#1" }),
            stationsZeile("a.K1#3", { gruen: false, ungemessen: true, grund: "GPU-Schloss blockiert", exit: 75, minuten: 45, bahn: "1/3" })];
        const t = z.map((l) => STATION.exec(l));
        pruef("LESER zug.cjs: Start- und Stationszeilen im gelesenen Format, ungemessen ist weder GRÜN noch ROT",
            (START.exec(s) || [])[1] === "7" && !!t[0] && t[0][2] === "a.K1#1" && t[0][3] === "1.5" && !!t[1] && t[1][1] === "ROT " && !!t[1][4] &&
            !t[2] && !TOT.test(z[2]) && !/^  (GRÜN|ROT)/.test(z[2]), JSON.stringify([s, ...z]));
    }
    // (3c) DIE BAHNEN: das Platz-Schloss, das run fährt (GPU_LAUF, EINE Quelle), mit Stub-Befehlen, je Fall ein eigenes Schloss in
    // tmp (nie das der Karte, nie ein echter CI-Job: GPU_WORKER_BILD, GPU_HOOK_LOG, GPU_NACHT eigen). Das Urteil ist die REIHENFOLGE
    // der Ereignisse im Log (S = Start unter dem Schloss, E = Ende), nie die Wanduhr (Lehre 26; 26.10. auf dem Laptop: einen Platz
    // nehmen dauerte 2,9–3,8 s, die Fenster von 500/800 ms rissen): ein Stub hält seinen Platz, bis seine Tür (eine Datei) aufgeht
    // oder sein Partner unter dem Schloss steht; der Test öffnet eine Tür erst, wenn der Wartende sein Warten gemeldet hat. Auch die
    // Wächter zählen Ereignisse (27.10., Karte ci-wackler-zensus: unter Last rissen die 120-s-Fenster von bis und die 60-s-Schleifen
    // des Stubs, ruhig 64/64): bis wartet, solange der Lauf lebt, der das Ereignis bringt, der Stub auf Tür oder Partner (dessen
    // Lauf endet, ohne zu stehen, schreibt der Test „X“); ein Lauf, der nie kommt, endet am Schloss mit Exit 75 beim Namen
    if (ohne.has("3c")) console.log("  OHNE (3c) DIE BAHNEN (--ohne 3c)");
    else if (findeBash()) {
        const wz = GPU_LAUF;
        const fw = (p) => p.split(path.sep).join("/");
        const schlossEnv = (n) => ({ GPU_SCHLOSS: fw(path.join(tmp, "bahn-" + n)), GPU_HOOK_LOG: fw(path.join(tmp, "bahn-" + n + ".hook.log")),
            GPU_NACHT: "", GPU_WORKER_BILD: "Kein.Worker.exe", GPU_LAUF_TAKT_S: "1" });
        // $1 Log · $2 wer · $3 {AUS} oder leer · $4 Tür oder leer · $5 Partner oder leer (er steht „S“ oder kam nie „X“)
        const STUB = 'echo "[linse-gpu] amd/rdna-3"; echo "S $2" >> "$1"; ' +
            'while [ -n "$4" ] && [ ! -e "$4" ]; do sleep 0.1; done; ' +
            'while [ -n "$5" ] && ! grep -qx "[SX] $5" "$1"; do sleep 0.1; done; ' +
            'echo "E $2" >> "$1"; [ -n "$3" ] && echo "{\\"n\\": 0}" > "$3"; true';
        // je Lauf die Zeilen-Stelle seines S und E im Log
        const spannen = (log) => {
            const m = {};
            (fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "").split(/\r?\n/).forEach((z, i) => {
                const x = /^([SE]) (\S+)$/.exec(z.trim());
                if (x) (m[x[2]] = m[x[2]] || {})[x[1]] = i;
            });
            return m;
        };
        const spanne = (a) => !!a && a.S != null && a.E != null;
        const ueber = (a, b) => spanne(a) && spanne(b) && a.S < b.E && b.S < a.E;
        const nach = (a, b) => spanne(a) && spanne(b) && a.S > b.E;
        const warte = (ms) => new Promise((r) => setTimeout(r, ms));
        // wartet auf ein Ereignis, solange der Lauf r lebt, der es bringt — endet er ohne, ist es false (ROT mit seinem Exit)
        const bis = async (f, r) => { while (!f()) { if (r.code !== undefined) return f(); await warte(100); } return true; };
        // ein fremder Lauf: gpu-lauf.sh direkt, wie ein Macher oder ein zweiter Läufer ihn ruft
        const lauf = (env, art, n, wer, log, tuer = "") => {
            const r = { out: "", err: "", code: undefined };
            r.k = spawn(findeBash(), [wz, "probe-" + wer, "bash", "-c", STUB, "stub", fw(log), wer, "", tuer && fw(tuer), ""],
                { env: { ...process.env, ...env, GPU_LAUF_ART: art, GPU_LAUF_PLAETZE: String(n) }, windowsHide: true });
            r.k.stdout.setEncoding("utf8");
            r.k.stderr.setEncoding("utf8");
            r.k.stdout.on("data", (d) => (r.out += d));
            r.k.stderr.on("data", (d) => (r.err += d));
            r.fertig = new Promise((ok) => { r.k.on("close", (c) => ok((r.code = c))); r.k.on("error", () => ok((r.code = -1))); });
            return r;
        };
        const wartet = (r) => () => /wartet auf/.test(r.err);
        const steht = (log, wer) => () => !!spannen(log)[wer];
        // (a) der Bahn-Plan über den Läufer: Zeit allein auf Bahn 0, danach zwei Bild-Gruppen, die einander unter dem Schloss
        // erwarten — sie enden nur, wenn beide zugleich einen Platz halten
        const planFall = (async () => {
            const env = schlossEnv("plan"), log = path.join(tmp, "bahn-plan.log");
            const G = (wer, zeit, partner) => [{ ...st0, geraet: ["radeon", "gtx"], gpu: true, zeit, env, befehl: ["bash", "-c", STUB, "stub", fw(log), wer, "{AUS}", "", partner], urteil: lies }];
            const es = [];
            // der Deckel des Läufers ist nur der Wächter (eine Stunde), nie das Maß: A hält seinen Platz, bis B steht
            await fahrePlan([G("A", false, "B"), G("Z", true, ""), G("B", false, "A")], 2, async (g, b) => {
                es.push(await fahreGruppe(g, { ...ctx("plan-" + g[0].befehl[5]), gpuLauf: wz, bahn: b, plaetze: 2, deckelMinS: 3600 }));
                if (!spannen(log)[g[0].befehl[5]]) fs.appendFileSync(log, "X " + g[0].befehl[5] + "\n");
            });
            const sp = spannen(log);
            return ["BAHNEN der Plan: zwei Bild-Läufe halten zugleich je einen Platz, der Zeit-Lauf fährt allein (Läufer + Platz-Schloss, N = 2)",
                ueber(sp.A, sp.B) && nach(sp.A, sp.Z) && nach(sp.B, sp.Z) && es.length === 3 && es.every((r) => r[0].gruen) && !fs.existsSync(env.GPU_SCHLOSS),
                JSON.stringify(sp) + " " + es.map((r) => r[0].zahl).join(" | ")];
        })();
        // (b) fremde Läufe am Schloss: Bild X hält einen Platz, Zeit Z wartet auf ALLE Plätze, Bild Y kommt danach und tritt nicht bei,
        // solange Z wartet (Vorrang, beim Namen) — Z überlappt nie
        const zeitFall = (async () => {
            const env = schlossEnv("zeit"), log = path.join(tmp, "bahn-zeit.log"), tuer = path.join(tmp, "bahn-zeit.tuer");
            const x = lauf(env, "bild", 2, "X", log, tuer);
            const ev = [await bis(steht(log, "X"), x)];
            const z = lauf(env, "zeit", 2, "Z", log);
            ev.push(await bis(wartet(z), z));
            const y = lauf(env, "bild", 2, "Y", log);
            ev.push(await bis(wartet(y), y));
            fs.writeFileSync(tuer, "");
            const codes = await Promise.all([x.fertig, z.fertig, y.fertig]);
            const sp = spannen(log);
            return ["BAHNEN ein Zeit-Lauf wartet auf alle Plätze, ein späterer Bild-Lauf tritt nicht vor ihm bei und nennt den Vorrang beim Namen",
                ev.every(Boolean) && codes.every((c) => c === 0) && nach(sp.Z, sp.X) && nach(sp.Y, sp.Z) && /wartet auf Vorrang: 'probe-Z'/.test(y.err) && !fs.existsSync(env.GPU_SCHLOSS),
                JSON.stringify(sp) + " Ereignisse " + ev.join("/") + " Exit " + codes.join("/") + " · Y: " + y.err.trim().split("\n")[0]];
        })();
        // (c) N = 1 ist das Ein-Platz-Schloss von vorher: der zweite Bild-Lauf wartet, bis der erste geht
        const einFall = (async () => {
            const env = schlossEnv("eins"), log = path.join(tmp, "bahn-eins.log"), tuer = path.join(tmp, "bahn-eins.tuer");
            const p = lauf(env, "bild", 1, "P", log, tuer);
            const ev = [await bis(steht(log, "P"), p)];
            const q = lauf(env, "bild", 1, "Q", log);
            ev.push(await bis(wartet(q), q));
            fs.writeFileSync(tuer, "");
            const codes = await Promise.all([p.fertig, q.fertig]);
            const sp = spannen(log);
            return ["BAHNEN N = 1: zwei Bild-Läufe überlappen nie (das alte Schloss)",
                ev.every(Boolean) && codes.every((c) => c === 0) && nach(sp.Q, sp.P), JSON.stringify(sp) + " Ereignisse " + ev.join("/") + " Exit " + codes.join("/")];
        })();
        // (d) VORFAHRT: ein wartender CI-Job (hook.log) hält jeden neuen Platz an, auch einen freien; der Hook nimmt das Schloss,
        // sobald der letzte Platz geht, und erst nach ihm fährt der neue Bild-Lauf
        const ciFall = (async () => {
            const env = schlossEnv("ci"), log = path.join(tmp, "bahn-ci.log"), tuer = path.join(tmp, "bahn-ci.tuer");
            const x = lauf(env, "bild", 2, "X", log, tuer);
            const ev = [await bis(steht(log, "X"), x)];
            fs.appendFileSync(env.GPU_HOOK_LOG, "2026-10-26 10:00:00 start ci-probe 1/1 echt: wartet auf Schloss von 'probe-X'\r\n");
            const y = lauf(env, "bild", 2, "Y", log);
            ev.push(await bis(wartet(y), y));
            fs.writeFileSync(tuer, "");
            await x.fertig;
            const hook = await bis(() => { try { fs.mkdirSync(env.GPU_SCHLOSS); return true; } catch (_e) { return false; } }, y);
            if (hook) {
                fs.writeFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "ci-probe 1/1 echt\npid=" + process.pid + "\n");
                fs.appendFileSync(log, "S H\n");
                fs.appendFileSync(env.GPU_HOOK_LOG, "2026-10-26 10:00:05 start ci-probe 1/1 echt: Schloss genommen\r\n");
                fs.appendFileSync(log, "E H\n");
                fs.rmSync(env.GPU_SCHLOSS, { recursive: true, force: true });
            }
            const codes = [x.code, await y.fertig];
            const sp = spannen(log);
            return ["BAHNEN VORFAHRT: ein wartender CI-Job hält den freien Platz an und bekommt das Schloss, der neue Bild-Lauf fährt nach ihm",
                ev.every(Boolean) && hook && codes.every((c) => c === 0) && nach(sp.H, sp.X) && nach(sp.Y, sp.H) && /Vorfahrt: ein CI-Job wartet/.test(y.err),
                JSON.stringify(sp) + " Ereignisse " + ev.join("/") + " Hook " + hook + " Exit " + codes.join("/")];
        })();
        // (e) DER VERTRETER: geht der Erste, nennt besitzer.txt den Bleibenden (die Hooks lösen ein Schloss mit toter pid)
        const vertreterFall = (async () => {
            const env = schlossEnv("vertreter"), log = path.join(tmp, "bahn-vertreter.log");
            const [t1, t2] = [1, 2].map((i) => path.join(tmp, "bahn-vertreter-" + i + ".tuer"));
            const v1 = lauf(env, "bild", 2, "V1", log, t1);
            const ev = [await bis(steht(log, "V1"), v1)];
            const v2 = lauf(env, "bild", 2, "V2", log, t2);
            ev.push(await bis(steht(log, "V2"), v2));
            fs.writeFileSync(t1, "");
            const c1 = await v1.fertig;
            const b = fs.existsSync(path.join(env.GPU_SCHLOSS, "besitzer.txt")) ? fs.readFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "utf8") : "";
            fs.writeFileSync(t2, "");
            const c2 = await v2.fertig;
            const sp = spannen(log);
            return ["BAHNEN DER VERTRETER: geht der Erste, nennt besitzer.txt den Bleibenden mit pid (die Hooks lösen sonst)",
                ev.every(Boolean) && c1 === 0 && c2 === 0 && ueber(sp.V1, sp.V2) && /^probe-V2\r?\npid=\d+/.test(b) && !fs.existsSync(env.GPU_SCHLOSS),
                JSON.stringify(b) + " " + JSON.stringify(sp) + " Exit " + c1 + "/" + c2];
        })();
        // (f) DIE NACHTRUHE zählt nie zur Warte-Frist (26.10.: 50 min Nacht > 45 min Frist, Exit 75 um 04:11, ROT in der Messung):
        // N wartet in der Nacht mit Frist 0 und läuft nie aus, während zwei Läufe ohne Nacht am selben Schloss nacheinander mit
        // Exit 75 enden — beim Namen des Halters
        const nachtFall = (async () => {
            const env = schlossEnv("nacht"), log = path.join(tmp, "bahn-nacht.log");
            fs.mkdirSync(env.GPU_SCHLOSS, { recursive: true });
            fs.writeFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "probe-halter\npid=" + process.pid + "\n");
            const n = lauf({ ...env, GPU_NACHT: "0000-2400", GPU_LAUF_WARTE_S: "0" }, "bild", 2, "N", log);
            const ev = [await bis(() => /wartet auf Nachtruhe 0000-2400/.test(n.err), n)];
            const a1 = lauf({ ...env, GPU_LAUF_WARTE_S: "0" }, "bild", 2, "A1", log);
            const c1 = await a1.fertig;
            const c2 = await lauf({ ...env, GPU_LAUF_WARTE_S: "0" }, "bild", 2, "A2", log).fertig;
            const lebt = n.code === undefined;
            baumTot(n.k.pid);
            await n.fertig;
            fs.rmSync(env.GPU_SCHLOSS, { recursive: true, force: true });
            return ["SCHLOSS die Nachtruhe zählt nie zur Warte-Frist: wer in der Nacht wartet, läuft nicht aus; ohne Nacht endet das Warten mit Exit 75 beim Namen",
                ev[0] && lebt && c1 === 75 && c2 === 75 && /^SCHLOSS BLOCKIERT von probe-halter /m.test(a1.out) && !spannen(log).N,
                "Nacht wartet " + ev[0] + " · lebt " + lebt + " (Exit " + n.code + ") · A " + c1 + "/" + c2 + " · " + a1.out.trim() + " · N: " + n.out.trim()];
        })();
        // (g) DER VORRANG fällt nach derselben Verwaist-Regel wie besitzer.txt und platz.k: ein Eintrag älter als der Systemstart
        // (seine pid lebt, neu vergeben) sperrt nicht; ein haltender Vorrang steht beim Namen in Exit 75
        const vorrangFall = (async () => {
            const env = schlossEnv("vorrang"), log = path.join(tmp, "bahn-vorrang.log");
            const vd = env.GPU_SCHLOSS + ".vorrang", alt = vd + "/" + process.pid;
            fs.mkdirSync(vd, { recursive: true });
            fs.writeFileSync(alt, "probe-alt\npid=" + process.pid + "\n");
            fs.utimesSync(alt, new Date("2001-01-01T00:00:00Z"), new Date("2001-01-01T00:00:00Z"));
            const p = lauf({ ...env, GPU_LAUF_WARTE_S: "20" }, "bild", 2, "P", log);
            const cp = await p.fertig;
            const weg = !fs.existsSync(alt);
            fs.writeFileSync(alt, "probe-zeit\npid=" + process.pid + "\n");
            const q = lauf({ ...env, GPU_LAUF_WARTE_S: "0" }, "bild", 2, "Q", log);
            const cq = await q.fertig;
            fs.rmSync(vd, { recursive: true, force: true });
            const sp = spannen(log);
            return ["SCHLOSS der Vorrang fällt nach der Verwaist-Regel (älter als der Systemstart), ein haltender Vorrang steht beim Namen in Exit 75",
                cp === 0 && weg && spanne(sp.P) && /verwaister Vorrang 'probe-alt' geloest - älter als der Systemstart/.test(p.err) &&
                cq === 75 && /^SCHLOSS BLOCKIERT von Vorrang: 'probe-zeit'/m.test(q.out) && !sp.Q,
                "P Exit " + cp + " weg " + weg + " · " + p.err.trim().split("\n").filter((l) => /Vorrang/.test(l)).join(" ") + " · Q Exit " + cq + " · " + q.out.trim()];
        })();
        for (const [name, ok, was] of await Promise.all([planFall, zeitFall, einFall, ciFall, vertreterFall, nachtFall, vorrangFall])) pruef(name, ok, was);
    } else pruef("BAHNEN Platz-Schloss", false, "keine Git-bash");
    // (4) Glob
    const gl = [["stamm/kreatur-leben.js", ["stamm/kreatur-*.js"], true], ["stamm/x/kreatur-a.js", ["stamm/kreatur-*.js"], false],
        ["scripts/lib/a/b.cjs", ["scripts/**"], true], ["koerper-core.js", ["koerper-core.js"], true], ["koerper-core.jsx", ["koerper-core.js"], false],
        ["worlds/klang/a.js", ["worlds/klang/"], true], ["stamm/a.js", ["**/a.js"], true]];
    pruef("GLOB Abgleich", gl.every(([f, p, s]) => trifftPfad(f, p) === s), gl.filter(([f, p, s]) => trifftPfad(f, p) !== s).map((x) => x[0]).join(", "));
    // (5) Buchung
    const h = "hilfe";
    const s1 = { ...st0, geraet: ["radeon", "gtx"], gpu: true, pfad: ["stamm/wasser-*.js"] };
    const s2 = { ...s1, staffel: 2, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" };
    const M = (sha, g, id, st, gruen, zeit = "2026-10-23T10:00:00Z", gpu = { gpu: "amd/rdna-3" }) => ({ sha, geraet: g, je: { [id]: { gruen, zahl: gruen ? "z" : "rot", zeit, abdruck: abdruck(st, h), ...gpu } } });
    const keine = () => [];
    // DIE WAND PFAD und die Wand GPU an der Buchung
    {
        const tg = toteGlobs(["stamm/kampf.js", "worlds/schmiede/schmiede-core.js", "stamm/kreatur-*.js"], ["stamm/kampf.js", "stamm/kreatur-leben.js", "schmiede-core.js"]);
        pruef("WAND PFAD der tote Glob beim Namen", tg.join() === "worlds/schmiede/schmiede-core.js", tg.join());
        let w = buchen("kopf", [s1], [M("a1", "radeon", "gelaende.K4#1", s1, true)], keine, h, [], { tot: () => ["worlds/schmiede/schmiede-core.js"] });
        pruef("WAND PFAD toter Glob am Kopf → 0", w.je["gelaende.K4"].punkte === 0 && /trifft am Kopf keine Datei \(R6 blind\): worlds\/schmiede/.test(w.je["gelaende.K4"].beleg), w.je["gelaende.K4"].beleg);
        const alt = [M("a1", "radeon", "gelaende.K4#1", s1, true, undefined, {})];
        w = buchen("kopf", [s1], alt, keine, h, [], { roh: () => "" });
        pruef("WAND GPU Grün ohne Zeugen (vor der Wand, Roh leer) → 0", w.je["gelaende.K4"].punkte === 0 && /Wand GPU: keine Linse nennt eine Karte/.test(w.je["gelaende.K4"].beleg), w.je["gelaende.K4"].beleg);
        w = buchen("kopf", [s1], alt, keine, h, [], { roh: () => "$ befehl\n[linse-gpu] amd/rdna-3\nGRÜN\n" });
        pruef("WAND GPU Grün mit dem Zeugen in der Roh-Ausgabe → 1", w.je["gelaende.K4"].punkte === 1, w.je["gelaende.K4"].beleg);
        w = buchen("kopf", [s1], alt, keine, h, [], { roh: () => "[linse-gpu] amd/rdna-3\n[welt-boot] FEHLER klasse: x.cjs startet „linse“ und zeichnet nie (keine seiner 1 Seiten arbeitet auf der GPU): das Rezept ist „null“\n" });
        pruef("WAND GPU Roh zeigt „zeichnet nie“ → 0", w.je["gelaende.K4"].punkte === 0 && /zeichnet nie/.test(w.je["gelaende.K4"].beleg), w.je["gelaende.K4"].beleg);
    }
    let b = buchen("kopf", [s1, s2], [M("a1", "radeon", "gelaende.K4#1", s1, true)], keine, h);
    pruef("BUCHUNG 1 Gerät → 1", b.je["gelaende.K4"].punkte === 1, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], [M("a1", "radeon", "gelaende.K4#1", s1, true), M("a1", "radeon", "gelaende.K4#2", s2, true)], keine, h);
    pruef("BUCHUNG Staffel 2 nur Radeon → 1", b.je["gelaende.K4"].punkte === 1, b.je["gelaende.K4"].beleg);
    const m2 = [M("a1", "radeon", "gelaende.K4#1", s1, true), M("a1", "radeon", "gelaende.K4#2", s2, true), M("b2", "gtx", "gelaende.K4#2", s2, true)];
    b = buchen("kopf", [s1, s2], m2, keine, h);
    pruef("BUCHUNG 2 Geräte → 2", b.je["gelaende.K4"].punkte === 2, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], m2, (sha) => (sha === "b2" ? ["stamm/wasser-hydro.js"] : ["docs/x.md"]), h);
    pruef("BUCHUNG R6 Pfad geändert → GTX alt → 1", b.je["gelaende.K4"].punkte === 1 && /R6/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    // DIE RATSCHE: das GRÜN der letzten Buchung hält ohne frische Messung, ein frisches ROT nimmt es beim Namen, die Wand PFAD hält nie
    {
        const vor = buchen("alt", [s1, s2], m2, keine, h);
        const alt6 = (sha) => (sha === "a1" || sha === "b2" ? ["stamm/wasser-hydro.js"] : []);
        let r = buchen("kopf", [s1, s2], m2, alt6, h, [], { vorher: vor });
        pruef("RATSCHE R6-alt hält das GRÜN der letzten Buchung → 2", r.je["gelaende.K4"].punkte === 2 && /gehalten: z an a1/.test(r.je["gelaende.K4"].beleg) && !r.rueckfall.length, r.je["gelaende.K4"].beleg);
        r = buchen("kopf", [s1, s2], [...m2, M("c3", "gtx", "gelaende.K4#2", s2, false, "2026-10-24T10:00:00Z")], alt6, h, [], { vorher: vor });
        pruef("RATSCHE frisches ROT nimmt die Staffel und nennt den RÜCKFALL → 1", r.je["gelaende.K4"].punkte === 1 && r.rueckfall.length === 1 && /^gelaende\.K4#2 gtx: rot an c3/.test(r.rueckfall[0]), r.rueckfall.join(" | "));
        r = buchen("kopf", [s1, s2], m2, alt6, h, [], { vorher: vor, tot: () => ["stamm/wasser-weg.js"] });
        pruef("RATSCHE die Wand PFAD hält nie → 0", r.je["gelaende.K4"].punkte === 0, r.je["gelaende.K4"].beleg);
        r = buchen("kopf", [s1, s2], m2, alt6, h);
        pruef("RATSCHE ohne Vorbuchung ist ungemessen 0", r.je["gelaende.K4"].punkte === 0, r.je["gelaende.K4"].beleg);
    }
    b = buchen("kopf", [s1, s2], m2, () => ["stamm/klang.js", "README.md"], h);
    pruef("BUCHUNG R6 fremde Datei → bleibt 2", b.je["gelaende.K4"].punkte === 2, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], m2, (sha) => { if (sha === "a1") throw new Error("unbekannt"); return []; }, h);
    pruef("BUCHUNG SHA unbekannt → 0", b.je["gelaende.K4"].punkte === 0 && /SHA unbekannt/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1], [M("a1", "radeon", "gelaende.K4#1", s1, true, "2026-10-23T09:00:00Z"), M("c3", "radeon", "gelaende.K4#1", s1, false, "2026-10-23T11:00:00Z")], keine, h);
    pruef("BUCHUNG jüngeres ROT schlägt älteres GRÜN → 0", b.je["gelaende.K4"].punkte === 0, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [{ ...s1, befehl: ["node", "-e", "1"] }], [M("a1", "radeon", "gelaende.K4#1", s1, true)], keine, h);
    pruef("BUCHUNG Station geändert → alte Messung zählt nicht", b.je["gelaende.K4"].punkte === 0 && /Station seit der Messung geändert/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1], [], keine, h);
    pruef("BUCHUNG ungemessen → 0 (R10)", b.je["gelaende.K4"].punkte === 0 && /R10/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], [M("a1", "radeon", "gelaende.K4#2", s2, true), M("b2", "gtx", "gelaende.K4#2", s2, true)], keine, h);
    pruef("BUCHUNG Staffel 2 grün ohne Staffel 1 → 0", b.je["gelaende.K4"].punkte === 0, b.je["gelaende.K4"].beleg);
    {
        const sb = { ...s1, beide: true };
        const nur = buchen("kopf", [sb], [M("a1", "radeon", "gelaende.K4#1", sb, true)], keine, h);
        const zwei = buchen("kopf", [sb], [M("a1", "radeon", "gelaende.K4#1", sb, true), M("b2", "gtx", "gelaende.K4#1", sb, true)], keine, h);
        pruef("BUCHUNG Staffel 1 mit beide: ein grünes Gerät → 0, beide grün → 1", nur.je["gelaende.K4"].punkte === 0 && /gelaende.K4#1 gtx/.test(nur.je["gelaende.K4"].beleg) && zwei.je["gelaende.K4"].punkte === 1,
            nur.je["gelaende.K4"].beleg + " / " + zwei.je["gelaende.K4"].beleg);
        const gn = gtxNutzen(nur);
        pruef("GTX-NUTZEN Staffel 1 mit beide hinter grüner Radeon bleibt in der Liste", gn.ja.join() === "gelaende.K4#1", JSON.stringify(gn));
    }
    // (5b) DIE LINSE an der Buchung (R6 über das Werkzeug): ein Umbau der Linse — im Befehl genannt oder per require geladen —
    // macht die Messung alt; fremdes Werkzeug nie. Der require-Gang ist rufe der Stamm-Bibliothek am Kopf des Spiel-Klons
    {
        const { rufe } = stammAm(spielRepo(), "origin/main");
        const texte = {
            "scripts/diag-x.cjs": '#!/usr/bin/env node\nconst { pruefer } = require("./lib/y.cjs");\nconst ort = require("../spec/ort.json");\n',
            "scripts/lib/y.cjs": 'module.exports = require("./z");\n', "scripts/lib/z.cjs": "module.exports = 1;\n", "scripts/lib/fremd.cjs": "1;\n",
            "spec/ort.json": "{}", "stamm/wasser-hydro.js": "",
        };
        const sl = { ...s1, befehl: ["node", "scripts/diag-x.cjs", "--port", "{PORT}"] };
        const ls = linsenVon(sl, Object.keys(texte), (f) => (f in texte ? texte[f] : null), rufe);
        pruef("LINSE Befehl und require-Hülle (stamm.cjs rufe)", ls.join() === "scripts/diag-x.cjs,scripts/lib/y.cjs,scripts/lib/z.cjs,spec/ort.json", ls.join());
        const ml = [M("a1", "radeon", "gelaende.K4#1", sl, true)];
        const radeon = (w) => w.je["gelaende.K4"].stationen.find((x) => x.geraet === "radeon");
        let w = buchen("kopf", [sl], ml, () => ["scripts/lib/z.cjs"], h, [], { linsen: () => ls });
        pruef("LINSE geändert → ungemessen mit dem Grund", w.je["gelaende.K4"].punkte === 0 && radeon(w).ungemessen && radeon(w).grund === "Linse seit der Messung geändert (R6: scripts/lib/z.cjs)", JSON.stringify(radeon(w)));
        w = buchen("kopf", [sl], ml, () => ["scripts/lib/fremd.cjs", "README.md"], h, [], { linsen: () => ls });
        pruef("LINSE unverändert (fremdes Werkzeug geändert) → frisch", w.je["gelaende.K4"].punkte === 1 && radeon(w).gruen, w.je["gelaende.K4"].beleg);
        w = buchen("kopf", [sl], ml, () => [], h, [], { linsen: () => { throw new Error("Linse scripts/diag-x.cjs unlesbar: x"); } });
        pruef("LINSE unlesbar → ungemessen beim Namen", w.je["gelaende.K4"].punkte === 0 && /Linse unlesbar — kein R6-Urteil/.test(radeon(w).grund), radeon(w).grund);
    }
    // (6) Übergang in gen.cjs
    const stand = { kopf: "abcd1234", je: { "gelaende.K4": { punkte: 2, beleg: "Maschine: z" } } };
    const k0 = { name: "n", punkte: 1, beleg: "Hand" };
    const k1 = maschinenKriterium(stand, "gelaende", 3, k0), k2 = maschinenKriterium(stand, "gelaende", 1, k0);
    pruef("GEN registriert → Maschine, sonst Hand", k1.punkte === 2 && k1.maschine && k1.beleg === "Maschine: z" && k2 === k0, JSON.stringify([k1, k2]));
    const pf = standPruefen(stand, "ffff0000", new Set(["gelaende.K4"]));
    pruef("GEN Kopf ungleich ist ROT", pf.some((f) => /Kopf abcd1234/.test(f)), pf.join(" | "));
    // X: eine Hälfte am Kopf — gruen frisch gemessen, alt ohne frische Messung (das Frische-Urteil der Buchung: ungemessen)
    const X = (id, geraet, gruen, alt) => ({ id, geraet, gruen: !!gruen, ...(alt ? { ungemessen: true } : {}) });
    const nz = gtxNutzen({ je: {
        "a.K1": { stationen: [X("a.K1#1", "radeon", true), X("a.K1#1", "gtx", false, 1), X("a.K1#2", "radeon", true), X("a.K1#2", "gtx", false, 1)] },
        "b.K1": { stationen: [X("b.K1#1", "radeon", false), X("b.K1#1", "gtx", false, 1), X("b.K1#2", "radeon", true), X("b.K1#2", "gtx", false, 1)] },
        "c.K1": { stationen: [X("c.K1#1", "headless", true), X("c.K1#2", "radeon", false), X("c.K1#2", "gtx", false, 1)] },
        "d.K1": { stationen: [X("d.K1#1", "headless", false), X("d.K1#2", "radeon", true), X("d.K1#2", "gtx", false, 1)] },
        "e.K1": { stationen: [X("e.K1#1", "headless", true), X("e.K1#2", "radeon", true), X("e.K1#2", "gtx", true)] },
        "f.K1": { stationen: [X("f.K1#1", "headless", true), X("f.K1#2", "radeon", true), { ...X("f.K1#2", "gtx", false, 1), tot: true }] },
    } });
    pruef("GTX-NUTZEN Staffel 1 hinter grüner Radeon fällt, Staffel 2 nur, wo Staffel 1 stehen kann und die Radeon-Hälfte nicht frisch rot ist; frisch Gemessenes und die Wand PFAD nie",
        nz.ja.join() === "a.K1#2,b.K1#1,b.K1#2" && nz.nein.join() === "a.K1#1,c.K1#2,d.K1#2,e.K1#2,f.K1#2", JSON.stringify(nz));
    // DIE KLASSE 27.10. (a03b7b06, gebucht Σ 113 statt ≥ 123): eine Staffel 2 mit alter gtx-Hälfte steht in der Liste — vor dem
    // Takt (Radeon-Hälfte und Staffel 1 R6-alt, sie fahren im selben Takt) wie nach ihm (Radeon frisch grün); frisch gemessen nie.
    // Durch die echte Buchung (frischUrteil, R6), nicht an Hand gesetzten Zuständen
    {
        const r6 = (sha) => (sha === "v1" ? ["stamm/wasser-hydro.js"] : []);
        const vorher = ["radeon", "gtx"].flatMap((g) => [M("v1", g, "gelaende.K4#1", s1, true), M("v1", g, "gelaende.K4#2", s2, true)]);
        const amKopf = (g, id, st) => M("k0", g, id, st, true, "2026-10-23T12:00:00Z");
        const nach = [...vorher, amKopf("radeon", "gelaende.K4#1", s1), amKopf("radeon", "gelaende.K4#2", s2), amKopf("gtx", "gelaende.K4#1", s1)];
        const [a, z, c] = [vorher, nach, [...nach, amKopf("gtx", "gelaende.K4#2", s2)]].map((ms) => gtxNutzen(buchen("kopf", [s1, s2], ms, r6, h)));
        pruef("GTX-NUTZEN Staffel 2 mit R6-alter gtx-Hälfte steht in der Liste, gleich ob die Radeon-Hälfte alt oder frisch grün ist; frisch gemessen nie",
            a.ja.join() === "gelaende.K4#1,gelaende.K4#2" && z.ja.join() === "gelaende.K4#2" && c.ja.length === 0, JSON.stringify([a.ja, z.ja, c.ja]));
    }
    const P = (k, s, ge) => ({ kriterium: k, staffel: s, geraet: ge, befehl: ["node"], gpu: true });
    const V = (id, g, gruen) => ({ id, geraet: g, gruen, zahl: gruen ? "ok" : "rot" });
    const vor = [V("a.K1#1", "radeon", true), V("a.K1#1", "gtx", true), V("a.K1#2", "radeon", true), V("a.K1#2", "gtx", true),
        V("b.K1#1", "radeon", false), V("b.K1#1", "gtx", false), V("c.K1#1", "radeon", false), V("c.K1#1", "gtx", false),
        V("d.K1#1", "radeon", false), V("d.K1#1", "gtx", true), V("d.K1#2", "radeon", true), V("d.K1#2", "gtx", false)];
    const mp = messPlan([P("a.K1", 1, ["radeon", "gtx"]), P("a.K1", 2, ["radeon", "gtx"]), P("b.K1", 1, ["radeon", "gtx"]), P("c.K1", 1, ["radeon", "gtx"]), P("d.K1", 1, ["radeon", "gtx"]), P("d.K1", 2, ["radeon", "gtx"])],
        (id, g) => vor.find((x) => x.id === id && x.geraet === g) || null, new Set(["c.K1"]), (id) => id === "d.K1#1");
    pruef("MESS-PLAN Staffel 1 auf EINEM Gerät (Zeit auf der GTX), rot ohne Heil-Versuch fällt, genannt fährt auf der GTX (Radeon = Werkbank), Staffel 2 nur ganz grün oder geheilt",
        mp.radeon.join() === "a.K1#1,a.K1#2" && mp.gtx.join() === "a.K1#2,c.K1#1,d.K1#1" && mp.uebersprungen.join() === "b.K1#1,d.K1#2", JSON.stringify(mp));
    {
        const bv = [V("e.K1#1", "radeon", true), V("e.K1#1", "gtx", true), V("f.K1#1", "radeon", true), V("f.K1#1", "gtx", false)];
        const bp = messPlan([{ ...P("e.K1", 1, ["radeon", "gtx"]), beide: true }, { ...P("f.K1", 1, ["radeon", "gtx"]), beide: true }],
            (id, g) => bv.find((x) => x.id === id && x.geraet === g) || null, new Set(), () => true);
        pruef("MESS-PLAN Staffel 1 mit beide: ganz grün hält auf beiden Geräten, halb rot ohne Heil-Versuch fällt",
            bp.radeon.join() === "e.K1#1" && bp.gtx.join() === "e.K1#1" && bp.uebersprungen.join() === "f.K1#1", JSON.stringify(bp));
    }
    {
        // DIE PFLICHT (w4-sitzung-reif): die Staffel 2 trägt PFLICHT-OFFEN C, ihre 1 ist rot und keiner nennt das Kriterium — der Plan misst
        // sie trotzdem an jedem Zug auf beiden Geräten, auch nach einem frischen ROT; dieselbe Staffel ohne die Pflicht bleibt übersprungen
        const pv = [V("p.K1#1", "radeon", false), V("p.K1#1", "gtx", false), V("p.K1#2", "radeon", false), V("p.K1#2", "gtx", false),
            V("q.K1#1", "radeon", false), V("q.K1#1", "gtx", false), V("q.K1#2", "radeon", false), V("q.K1#2", "gtx", false)];
        const pp = messPlan([P("p.K1", 1, ["radeon", "gtx"]), { ...P("p.K1", 2, ["radeon", "gtx"]), quelle: "2 = auch x, und der Verkehr der Stadt (PFLICHT-OFFEN C): y, beide Geräte" },
            P("q.K1", 1, ["radeon", "gtx"]), { ...P("q.K1", 2, ["radeon", "gtx"]), quelle: "2 = auch x, beide Geräte" }],
        (id, g) => pv.find((x) => x.id === id && x.geraet === g) || null, new Set(), () => false);
        pruef("MESS-PLAN eine Staffel mit PFLICHT-OFFEN misst an jedem Zug auf beiden Geräten (auch ohne stehende 1, auch nach ROT); ohne die Pflicht übersprungen",
            pp.radeon.join() === "p.K1#2" && pp.gtx.join() === "p.K1#2" && pp.uebersprungen.join() === "p.K1#1,q.K1#1,q.K1#2", JSON.stringify(pp));
    }
    pruef("GEN unbekanntes Kriterium ist ROT", standPruefen({ kopf: "abcd1234", je: { "x.K1": {} } }, "abcd1234", new Set()).length === 1);
    // (7) DIE FARM: Scheiben (LPT, Zwillinge zusammen, Gewicht aus der jüngsten Messung), der Anbieter je Scheibe, die Vereinigung
    // der Teile (ersetzt, ungemessen, fehlende Scheibe beim Namen, fremder SHA wirft) und kein Schloss nur für headless
    {
        const S = (k, s, min, extra = {}) => ({ ...st0, kriterium: k, staffel: s, minuten: min, befehl: ["node", k], ...extra });
        const zw = S("a.K1", 2, 1, { befehl: ["node", "a.K1"] });
        const gs = gruppiere([S("a.K1", 1, 1), zw, S("b.K1", 1, 7), S("c.K1", 1, 5), S("d.K1", 1, 4), S("e.K1", 1, 3),
            S("f.K1", 1, 1, { env: { KI_ENDPUNKT: "http://127.0.0.1:11434/", KI_MODELL: "qwen3:4b-instruct" } })]);
        const mess = [{ geraet: "headless", je: { "a.K1#1": { minuten: 10, zeit: "2026-10-27T01:00:00Z" } } },
            { geraet: "headless", je: { "a.K1#1": { minuten: 0, zeit: "2026-10-27T02:00:00Z" } } },
            { geraet: "headless", je: { "a.K1#1": { minuten: 30, zeit: "2026-10-27T02:30:00Z" } } },
            { geraet: "radeon", je: { "b.K1#1": { minuten: 99, zeit: "2026-10-27T03:00:00Z" } } }];
        const p = scheibenPlan(gs, 3, laufGewicht(mess, "headless"));
        const ids = p.map((s) => s.gruppen.flat().map(schluessel).join(","));
        const ki = p.map((s) => kiModelle(s.gruppen).join(" "));
        pruef("FARM die Scheiben: die schwersten zuerst in die leichteste, Zwillinge EIN Lauf, Gewicht = die kürzeste der jüngsten 5 Messungen > 0 auf dem Gerät, sonst Soll",
            p.length === 3 && p.map((s) => s.min).join() === "10,10,10" && ids.join(" | ") === "a.K1#1,a.K1#2 | b.K1#1,e.K1#1 | c.K1#1,d.K1#1,f.K1#1" &&
            ki.join("|") === "||qwen3:4b-instruct" && scheibenPlan(gs, 99, () => 1).length === gs.length, JSON.stringify(p.map((s, i) => [s.min, ids[i], ki[i]])));
        const alt = { sha: "f1", geraet: "headless", host: "laptop", je: { "a.K1#1": { gruen: false, zahl: "rot", minuten: 3 }, "z.K1#1": { gruen: true, zahl: "z", minuten: 1 } } };
        const t1 = { name: "teil-1", m: { sha: "f1", geraet: "headless", host: "farm:7/1", zeit: "2026-10-27T10:00:00Z", je: { "a.K1#1": { gruen: true, zahl: "g", minuten: 2, host: "farm:7/1" }, "a.K1#2": { gruen: true, zahl: "g", minuten: 2, zwilling: "a.K1#1", host: "farm:7/1" } } } };
        const t2 = { name: "teil-2", m: { sha: "f1", geraet: "headless", host: "farm:7/2", zeit: "2026-10-27T10:05:00Z", je: {}, ungemessen: { "b.K1#1": { gruen: false, ungemessen: true, grund: "x" } } } };
        const v = vereineMessungen(alt, [t1, t2], "f1", "headless", "farm:7", [{ nr: 1, nur: "a.K1#1,a.K1#2" }, { nr: 2, nur: "b.K1#1" }, { nr: 3, nur: "c.K1#1,d.K1#1" }]);
        let wirft = "";
        try { vereineMessungen(alt, [{ name: "teil-9", m: { sha: "f2", geraet: "headless", je: {} } }], "f1", "headless", "farm:7"); } catch (e) { wirft = e.message; }
        pruef("FARM die Vereinigung: ein Teil ersetzt den alten Eintrag, Fremdes bleibt, ungemessen bleibt ungemessen, die fehlende Scheibe beim Namen, ein fremder SHA wirft",
            v.n === 3 && v.m.je["a.K1#1"].gruen && v.m.je["a.K1#1"].host === "farm:7/1" && v.m.je["z.K1#1"].gruen && !v.m.je["b.K1#1"] && v.m.ungemessen["b.K1#1"] &&
            v.m.host === "farm:7" && v.m.zeit === "2026-10-27T10:05:00Z" && !alt.je["a.K1#1"].gruen && v.fehlt.length === 1 && v.fehlt[0].nr === 3 &&
            v.fehlt[0].ids.join() === "c.K1#1,d.K1#1" && /teil-9 misst f2 headless statt f1 headless/.test(wirft), JSON.stringify([v, wirft]));
        const fe = farmEingaben([S("a.K1", 1, 1), zw], "f1", "koordination", "laptop-1-2");
        pruef("FARM der Ruf: die hier gewählte Liste reist als nur, die Marke findet den Lauf, origin nennt das Repo",
            JSON.stringify(fe) === JSON.stringify({ sha: "f1", auswahl: "nur", nur: "a.K1#1,a.K1#2", jobs: "12", koord: "koordination", marke: "laptop-1-2" }) &&
            repoSlug("https://github.com/MiguellD/AnazhRealm.git") === "MiguellD/AnazhRealm" && repoSlug("git@github.com:MiguellD/AnazhRealm") === "MiguellD/AnazhRealm",
            JSON.stringify(fe));
        let gpuWirft = "";
        try { gpuLaufFuer("radeon", "farm:7/1"); } catch (e) { gpuWirft = e.message; }
        pruef("FARM headless fährt auf dem Läufer ohne Schloss des Rechners, am Platz mit ihm; eine GPU-Station nie auf der Farm",
            gpuLaufFuer("headless", "farm:7/1") === null && gpuLaufFuer("headless", undefined) === GPU_LAUF && gpuLaufFuer("gtx") === GPU_LAUF && /nur headless/.test(gpuWirft), gpuWirft);
    }
    // (8) DIE ZWILLINGE EINER LISTE (Messplatz der OMEN): je Zeile ein Lauf, Zwillinge zusammen, die Reihe von nur, nur Gelistete
    {
        const Z = (k, s, b, ge = ["radeon", "gtx"]) => ({ kriterium: k, staffel: s, geraet: ge, befehl: ["node", b], env: {}, gpu: true });
        const zs = [Z("a.K1", 1, "x"), Z("a.K1", 2, "x"), Z("b.K1", 1, "y"), Z("c.K1", 1, "x", ["radeon"]), Z("d.K1", 1, "x")];
        const g1 = zwillingsGruppen(zs, "gtx", "b.K1#1,a.K1#2,d.K1#1").map((g) => g.join("+")).join(" ");
        const g2 = zwillingsGruppen(zs, "gtx").map((g) => g.join("+")).join(" ");
        let wirft = "";
        try { zwillingsGruppen(zs, "gtx", "c.K1#1"); } catch (x) { wirft = x.message; }
        pruef("GRUPPEN Zwillinge in EINEM Lauf, Reihe von nur, nur Gelistete, eine Station eines anderen Geräts ist ROT",
            g1 === "b.K1#1 a.K1#2+d.K1#1" && g2 === "a.K1#1+a.K1#2+d.K1#1 b.K1#1" && /c.K1#1: keine Station auf gtx/.test(wirft), JSON.stringify([g1, g2, wirft]));
        const P = (k, s, b) => ({ ...Z(k, s, b), befehl: undefined, probe: { befehl: ["node", b] } });
        const ps = [Z("a.K1", 1, "x"), P("e.K1", 1, "p"), P("e.K1", 2, "p"), Z("b.K1", 1, "y"), P("f.K1", 1, "q")];
        const g3 = zwillingsGruppen(ps, "gtx").map((g) => g.join("+")).join(" ");
        pruef("GRUPPEN die Sitzung ist EIN Lauf: jede Probe-Station in der ersten Zeile, die befehl-Läufe danach", g3 === "e.K1#1+e.K1#2+f.K1#1 a.K1#1 b.K1#1", g3);
    }
    // (9) DIE SITZUNG: das Format der Probe (genau eines, nur GPU, Deckel, die Feinde der Welt beim Namen), der Abdruck einer
    // befehl-Station Byte für Byte, und der Lauf mit einer Stub-Welt — EIN Start, jede Probe darin unter ihrem Deckel, die
    // Grundstellung vor jeder Probe (auch nach dem Fehler: die Seite neu, nie die Sitzung), das Schloss EINMAL für die Sitzung,
    // die Einträge im heutigen Format mit modus "session"; eine Welt, die stirbt, macht den Rest ungemessen, eine, die nie steht, ROT
    {
        const gp = { ...st0, geraet: ["radeon", "gtx"], gpu: true, befehl: undefined, probe: { befehl: ["node", "-e", "0"], sek: 30 } };
        const fe = (mut) => pruefeStationen([{ ...gp, ...mut }], karte).fehler.join(" | ");
        const f = [fe({ befehl: ["node", "-e", "0"] }), fe({ geraet: "headless", gpu: false }), fe({ probe: { befehl: ["node", "-e", "0"], sek: 5000 } }),
            fe({ probe: { befehl: ["bash", "-c", "raeum() { for p in $(netstat -ano); do :; done; }; node scripts/werkbank.cjs start --echt"] } }), fe({})];
        pruef("SITZUNG-FORMAT genau eines von befehl und probe · probe nur an einer GPU-Station · Deckel ≤ " + PROBE_AUSNAHME_S + " s · die Feinde der Welt beim Namen",
            /genau eines von befehl und probe/.test(f[0]) && /probe nur an einer GPU-Station/.test(f[1]) && /Deckel 5000 s über 90 s/.test(f[2]) &&
            /greift die Welt der Sitzung an: netstat \(räumt Ports\), werkbank start\|stop/.test(f[3]) && f[4] === "", f.join(" || "));
        const pb = (p) => fe({ probe: { befehl: ["node", "-e", "0"], sek: 30, ...p } });
        const f2 = [pb({ mutiert: "ja" }), pb({ stellung: "mitte" }), pb({ ausnahme: "weil" }), pb({ ausnahme: "der Grund beim Namen", sek: 91 }), pb({ wache: 1 }),
            pb({ mutiert: true, stellung: "ende", ausnahme: "der Grund beim Namen", sek: 90 })];
        pruef("SITZUNG-FORMAT die Schlüssel der Fahrt: mutiert boolesch · stellung anfang|ende · ausnahme mit Grund und nie über " + PROBE_AUSNAHME_S + " s · nichts sonst",
            /mutiert nicht boolesch/.test(f2[0]) && /stellung nicht anfang\|ende/.test(f2[1]) && /ausnahme ohne Grund/.test(f2[2]) && /Deckel 91 s über 90 s — nie, auch mit ausnahme/.test(f2[3]) &&
            /probe trägt nur befehl, sek, mutiert, ausnahme, stellung/.test(f2[4]) && f2[5] === "", f2.join(" || "));
        const h = "hilfe";
        const alt = (st) => crypto.createHash("sha1").update(JSON.stringify({ k: st.kriterium, s: st.staffel, g: geraeteVon(st), b: st.befehl, e: st.env || {},
            gpu: !!st.gpu, u: String(st.urteil), p: st.pfad, q: st.quelle, h })).digest("hex").slice(0, 12);
        pruef("SITZUNG-ABDRUCK eine befehl-Station Byte für Byte wie vor der Sitzung, eine Probe trägt Befehl und Deckel",
            abdruck(st0, h) === alt(st0) && abdruck(gp, h) !== abdruck({ ...gp, probe: { ...gp.probe, sek: 31 } }, h) &&
            abdruck(gp, h) !== abdruck({ ...gp, probe: { ...gp.probe, befehl: ["node", "-e", "1"] } }, h), abdruck(st0, h) + " " + alt(st0));
        const altP = (st) => crypto.createHash("sha1").update(JSON.stringify({ k: st.kriterium, s: st.staffel, g: geraeteVon(st), b: st.befehl, e: st.env || {},
            gpu: !!st.gpu, u: String(st.urteil), p: st.pfad, q: st.quelle, h, pr: [st.probe.befehl, probeSek(st)] })).digest("hex").slice(0, 12);
        pruef("SITZUNG-ABDRUCK eine Probe ohne mutiert und stellung Byte für Byte wie am Sitzungs-Stand; mutiert und stellung ändern ihn, die ausnahme nie",
            abdruck(gp, h) === altP(gp) && abdruck({ ...gp, probe: { ...gp.probe, mutiert: true } }, h) !== abdruck(gp, h) &&
            abdruck({ ...gp, probe: { ...gp.probe, stellung: "ende" } }, h) !== abdruck(gp, h) && abdruck({ ...gp, probe: { ...gp.probe, ausnahme: "der Grund beim Namen" } }, h) === abdruck(gp, h),
            abdruck(gp, h) + " " + altP(gp));
        e = await fahreStation({ ...gp, urteil: lies }, ctx("probe-allein"));
        pruef("SITZUNG eine Probe fährt nie außerhalb der Sitzung", e.gruen === false && /nur in der Sitzung/.test(e.grund), JSON.stringify(e));
        const P = 41004 + (process.pid % 400) * 10;
        const zaehler = path.join(tmp, "welt-zaehler.txt");
        const stub = path.join(tmp, "welt-stub.cjs");
        fs.writeFileSync(stub, [
            'const http = require("http"), fs = require("fs"); const [W, z, art] = process.argv.slice(2); const n = (x) => fs.appendFileSync(z, x + "\\n");',
            'n("start"); if (art === "kaputt") { console.log("WERKBANK-FEHLER stub"); process.exit(4); }',
            'let seite = null; const neu = () => { const R = { info: { render: { drawCalls: 7, triangles: 900 } }, _animation: { _animationLoop: null }, setAnimationLoop(cb) { this._animation._animationLoop = cb || null; } };',
            '  seite = { win: { __vram: { puffer: 1048576, texturen: 1048576 } }, R, welt: { state: { renderer: R, playerMesh: { position: { x: 1, z: 2 } }, cameraMode: "first",',
            '  player: { mountedArch: null }, perfTargetMs: 1000, perfSense: { loadScale: 1 }, weather: "sunny", creatures: [], timeOfDay: 0.5 }, _gpuLeine: { gerendert: 0 } } }; }; neu();',
            'setInterval(() => { const cb = seite.R._animation._animationLoop; if (cb) cb(performance.now()); }, 16);',
            // der Weg einer Probe (art „weg“): die Grundstellung an Ort und Stelle nennt ihn, bis die Seite neu lud; „weg-bleibt“ trägt ihn
            // auch durch die Tür (die Wege-Linse der Grundstellung, grundSpielen)
            'let geladen = false; const weg = () => (art === "weg-bleibt" || (art === "weg" && !geladen) ? ["wege +1 [-312.4,-1060.2,-87.6,-1015.1/1] (probe:tempo4)"] : []);',
            'http.createServer((q, r) => { let d = ""; q.on("data", (c) => (d += c)); q.on("end", () => { const b = d ? JSON.parse(d) : {}; const s = (o) => r.end(JSON.stringify(o));',
            '  if (q.url === "/eval") { if (/_grundstellung\\(\\)/.test(b.code)) { n("nimm"); return s({ ergebnis: { grund: "{}", n: 3, ms: 1, welt: "w1", seite: [], wege: { flaechen: [], keys: [] } } }); }',
            '    if (/_grundstellung\\("/.test(b.code)) { n("grund"); return s({ ergebnis: { ok: true, anders: (art === "anders" ? ["augenblick.brand"] : []).concat(weg()), neu: {}, ms: 1, welt: "w1" } }); }',
            '    if (/__punkteStrom/.test(b.code)) return s({ ergebnis: new Function("r", "window", "performance", b.code)(seite.welt, seite.win, performance) });',
            '    if (/_weltBetreten\\(/.test(b.code)) { n("tuer"); return s({ ergebnis: { ok: true, worldId: "w1" } }); }',
            // DER WARME START: das Einschwingen der Sitzung vor einer Probe ohne Ort (WELT_STEHT)
            '    if (/__weltStehtNach\\(/.test(b.code)) { n("warm"); return s({ ergebnis: { takte: 31, chunks: 81, ring: 4 } }); }',
            '    if (b.code === "loop an") { seite.R.setAnimationLoop(() => seite.welt._gpuLeine.gerendert++); return s({ ergebnis: 1 }); }',
            '    if (b.code === "loop aus") { seite.R.setAnimationLoop(null); return s({ ergebnis: 0 }); }',
            '    if (b.code === "tod") { n("tod"); return r.end(JSON.stringify({ ergebnis: "tod" }), () => process.exit(3)); }',
            '    if (b.code === "mord") { n("mord"); process.exit(3); } return s({ ergebnis: "warm" }); }',
            '  if (q.url === "/reload") { n("reload"); neu(); geladen = true; return s({ neu: true, ms: 1 }); } if (q.url === "/fenster") return s({ fenster: [1920, 1080] });',
            '  if (q.url === "/umstellen") { n("umstellen:" + b.ort); return s({ takte: 3, steht: true, chunks: 9 }); }',
            '  if (q.url === "/stop") { n("stop"); s({ stop: true }); return setTimeout(() => process.exit(0), 50); } s({ fehler: "unbekannt" }); }); })',
            '  .listen(Number(W), "127.0.0.1", () => { console.log("[linse-gpu] amd/stub-sitzung"); console.log("WERKBANK bereit: Steuer 127.0.0.1:" + W); });',
        ].join("\n"));
        const welt = (art) => {
            const w = path.join(tmp, "welt-" + art + ".json");
            fs.writeFileSync(w, JSON.stringify({ save: ["node", "-e", 'require("http").createServer((q, r) => r.end("ok")).listen(Number(process.env.PORT), "127.0.0.1")'],
                werkbank: ["node", stub, "{W}", zaehler, art] }));
            return w;
        };
        const ruf = ["node", "-e", 'const fs = require("fs"); require("http").request({ host: "127.0.0.1", port: Number(process.env.WERKBANK_PORT), path: "/eval", method: "POST" }, (r) => { let d = ""; ' +
            'r.on("data", (c) => (d += c)); r.on("end", () => fs.writeFileSync(process.argv[1], JSON.stringify({ welt: JSON.parse(d).ergebnis, log: !!process.env.PUNKTE_SITZUNG_LOG }))); })' +
            '.end(JSON.stringify({ code: process.argv[2] }));', "{AUS}"];
        const warm = (j, l) => ({ gruen: !!j && j.welt === "warm" && j.log && /^\[linse-gpu\] amd\/stub-sitzung$/m.test(l.stdout), zahl: "welt " + (j && j.welt) });
        const S = (k, s, probe, urteil) => ({ ...gp, kriterium: k, staffel: s, probe, urteil });
        const hookLog = path.join(tmp, "sitzung-hook.log");
        fs.writeFileSync(hookLog, "2026-10-29 10:00:00 ende ci-probe 1/1 echt\n");
        const lauf = async (gruppen, art, gpuLauf, fahrtMaxS, eich) => {
            fs.rmSync(zaehler, { force: true });
            const rohDir = path.join(tmp, "roh-" + art);
            const es = {}, reihe = [];
            const kopf = await fahreSitzung(gruppen, { koord: KOORD, geraet: "radeon", bash: findeBash(), gpuLauf, baum: tmp, port: P, band: [P, P + 20000, P + 19999],
                rohDir, welt: art === "kein-start" ? undefined : welt(art), stillS: 20, stromTaktMs: 200, hookLog, ...(fahrtMaxS ? { fahrtMaxS } : {}), ...(eich ? { eich } : {}) },
            (g, xs, aus, zeit) => g.forEach((st, i) => { reihe.push(schluessel(st)); es[schluessel(st)] = stationsEintrag(xs[i], { zeit, abdruck: abdruck(st, h), port: P, bahn: "sitzung", zwilling: i ? schluessel(g[0]) : null, modus: "session" }); }));
            return { es, kopf, reihe, rohDir, z: fs.existsSync(zaehler) ? fs.readFileSync(zaehler, "utf8").trim().split("\n") : [] };
        };
        const gl = findeBash() ? path.join(tmp, "sitzung-schloss.sh") : null;
        const glLog = path.join(tmp, "sitzung-schloss.log");
        if (gl) fs.writeFileSync(gl, '#!/bin/bash\nN="$1"; shift\necho "$N $GPU_LAUF_ART $GPU_LAUF_MAX_S" >> "' + glLog.split(path.sep).join("/") + '"\necho "gpu-lauf: Schloss $N (zeit) nach 0 s" >&2\n"$@"\n');
        if (gl) fs.copyFileSync(path.join(DIR, "werkzeug", "gpu-schloss.sh"), path.join(tmp, "gpu-schloss.sh"));
        const g1 = [[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("b.K1", 1, { befehl: ["node", "-e", "console.log('SCHRITT /umstellen 41.3 s'); setTimeout(() => {}, 60000)"], sek: 2 }, lies)],
            [S("c.K1", 1, { befehl: ["node", "-e", "process.exit(1)"], sek: 30 }, (j, l) => ({ gruen: l.exit === 0, zahl: "exit " + l.exit }))],
            [S("d.K1", 1, { befehl: [...ruf, "return 2"], sek: 30 }, warm), S("d.K1", 2, { befehl: [...ruf, "return 2"], sek: 30 }, warm)]];
        const r1 = await lauf(g1, "gut", gl);
        const x = r1.es;
        const zeile = /^  (GRÜN|ROT ) (\S+) · .* · Exit \S+ · ([\d.]+) min( \(Zwilling von \S+\))?$/;
        const schloss = gl && fs.existsSync(glLog) ? fs.readFileSync(glLog, "utf8").trim().split("\n") : [];
        pruef("SITZUNG EINE Welt: jede Probe darin (WERKBANK_PORT, das Log, der Zeuge der Welt), der Deckel der Probe beim Namen ihrer letzten Zeile, nach dem Fehler die nächste in DERSELBEN Welt, Zwillinge EIN Lauf",
            r1.z.filter((l) => l === "start").length === 1 && x["a.K1#1"].gruen && /^Deckel 2 s gerissen — beendet, UNGEMESSEN \(zuletzt: SCHRITT \/umstellen 41\.3 s\)$/.test(x["b.K1#1"].grund) && x["b.K1#1"].ungemessen === true &&
            x["c.K1#1"].gruen === false && x["c.K1#1"].exit === 1 &&
            x["d.K1#1"].gruen && x["d.K1#2"].gruen && x["d.K1#2"].zwilling === "d.K1#1" && x["a.K1#1"].gpu === "amd/stub-sitzung" && r1.kopf.proben === 4, JSON.stringify([r1.z, x]));
        pruef("SITZUNG der Grund nach der Reihe anfang, die Grundstellung nur nach einem Abbruch oder einer mutierenden Probe — nie vor jeder; nach dem Abbruch (b.K1 am Deckel) durch die Tür (die Seite neu: die Arbeit der gefallenen Probe endet in der Seite); nie ein zweiter Start; am Ende stop",
            r1.z.join(",") === "start,nimm,warm,tuer,reload,grund,warm,stop" && r1.kopf.grundstellungS.length === 1 && typeof r1.kopf.bootS === "number", JSON.stringify([r1.z, r1.kopf]));
        // DER WARME START (takt25c GTX 6b3da705: nach jedem Riss die Tür, die neue Seite still, die nächste Probe zahlte den Ring im
        // eigenen Deckel — 36 von 38 UNGEMESSEN): eine Probe ohne Ort misst in der stehenden Welt — nach dem Boot und nach der Tür
        // EINMAL eingeschwungen, nie vor jeder; je Probe ihre Sekunden (s), b.K1 am Deckel 2 s
        pruef("SITZUNG DER WARME START: eine Probe ohne Ort misst in der stehenden Welt — nach dem Boot (vor a) und nach der Tür (vor c) EINMAL eingeschwungen (WELT_STEHT), nie vor jeder (b, d), vor dem Deckel und im Kopf wie ein Ort (ort null)",
            r1.kopf.orte.length === 2 && r1.kopf.orte.every((o) => o.ort === null && o.takte === 31 && o.chunks === 81 && typeof o.s === "number") &&
            r1.kopf.orte[0].vor === "a.K1#1" && r1.kopf.orte[0].nach === null && r1.kopf.orte[1].vor === "c.K1#1" && r1.kopf.orte[1].nach === "der Tür", JSON.stringify(r1.kopf.orte));
        pruef("SITZUNG DIE SEKUNDEN DER PROBE: jedes Ergebnis einer gefahrenen Probe trägt s (Start bis Ende ihres Prozesses) — b.K1 am Deckel 2 s nach 2 s, a.K1 in Sekunden",
            ["a.K1#1", "b.K1#1", "c.K1#1", "d.K1#1", "d.K1#2"].every((id) => typeof x[id].s === "number") && x["b.K1#1"].s >= 2 && x["b.K1#1"].s < 4 && x["a.K1#1"].s < 5,
            JSON.stringify(Object.entries(x).map(([id, e]) => id + " " + e.s)));
        pruef("SITZUNG das Schloss EINMAL für die ganze Sitzung (zeit, die Proben nehmen es nie)",
            !gl || (schloss.length === 1 && /^punkte-radeon-sitzung zeit \d+$/.test(schloss[0])), JSON.stringify(schloss));
        pruef("SITZUNG das Format von heute: je Station gruen, zahl, exit, minuten, zeit, abdruck, port, bahn und modus \"session\"; die Zeile liest zug.cjs",
            Object.values(x).every((e) => ["gruen", "zahl", "exit", "minuten", "zeit", "abdruck", "port", "bahn"].every((k) => k in e) && e.modus === "session" && e.bahn === "sitzung") &&
            Object.entries(x).every(([id, e]) => (e.ungemessen ? /^  OFFEN \S+ · Deckel .* · Sitzung · ungemessen/ : zeile).test(stationsZeile(id, e)) && / · Sitzung · /.test(stationsZeile(id, e))),
            JSON.stringify(Object.entries(x).map(([id, e]) => stationsZeile(id, e))));
        // DIE REIHE und DER STROM: anfang, die Welt lassend, ende, mutierend — die Grundstellung nur nach der mutierenden; jede Probe kennt
        // den Strom und ihren Namen, die Bilder ihres Loops stehen unter ihrem Namen, der Kopf trägt die Dauerlast
        const umw = ["node", "-e", 'require("fs").writeFileSync(process.argv[1], JSON.stringify({ strom: process.env.PUNKTE_SITZUNG_STROM, probe: process.env.PUNKTE_PROBE }))', "{AUS}"];
        const loop = ["node", "-e", 'const h = require("http"); const e = (c) => new Promise((f) => h.request({ host: "127.0.0.1", port: Number(process.env.WERKBANK_PORT), path: "/eval", method: "POST" }, ' +
            '(r) => (r.resume(), r.on("end", f))).end(JSON.stringify({ code: c }))); (async () => { await e("loop an"); await new Promise((f) => setTimeout(f, 400)); await e("loop aus"); ' +
            'require("fs").writeFileSync(process.argv[1], "{}"); })();', "{AUS}"];
        const umwOk = (j) => ({ gruen: !!j && !!j.strom && fs.existsSync(j.strom) && !!j.probe, zahl: JSON.stringify(j) });
        const da = (j) => ({ gruen: !!j, zahl: "da" });
        const r5 = await lauf([[S("m.K1", 1, { befehl: loop, sek: 30, mutiert: true }, da)], [S("n.K1", 1, { befehl: umw, sek: 30 }, umwOk)],
            [S("a.K1", 1, { befehl: loop, sek: 30, stellung: "anfang" }, da)], [S("e.K1", 1, { befehl: umw, sek: 30, stellung: "ende" }, umwOk)],
            [S("o.K1", 1, { befehl: umw, sek: 30, mutiert: true }, umwOk)]], "reihe", null);
        const sr = stromLesen(path.join(r5.rohDir, "sitzung", "strom.ndjson"));
        const je = (p) => sr.bilder.filter((b) => b.probe === p).length;
        pruef("SITZUNG die Reihe: anfang · was die Welt lässt · ende · was sie ändert; die Grundstellung nur nach der mutierenden (m vor o)",
            r5.reihe.join(" ") === "a.K1#1 n.K1#1 e.K1#1 m.K1#1 o.K1#1" && r5.z.join(",") === "start,nimm,warm,grund,warm,stop" && Object.values(r5.es).every((e) => e.gruen), JSON.stringify([r5.reihe, r5.z, r5.es]));
        pruef("SITZUNG DER STROM: der Haken über /eval in der Seite, jede Probe kennt ihn (PUNKTE_SITZUNG_STROM, PUNKTE_PROBE), die Bilder ihres Loops unter ihrem Namen, EINE Seite über die Grundstellung (kein Neuladen), der Kopf trägt die Dauerlast",
            je("a.K1#1") >= 5 && je("m.K1#1") >= 5 && je("n.K1#1") === 0 && sr.seiten.length === 1 && sr.bilder.every((b) => b.vram === 2 && b.befehle === 7 && b.voll === 1) &&
            r5.kopf.strom && r5.kopf.strom.bilder >= 8 && r5.kopf.strom.luecken === 0 && r5.kopf.strom.zapfen >= 10 && r5.kopf.strom.fehler === 0,
            JSON.stringify({ a: je("a.K1#1"), m: je("m.K1#1"), seiten: sr.seiten.length, kopf: r5.kopf.strom }));
        const r2 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "tod"], sek: 30 }, (j) => ({ gruen: !!j && j.welt === "tod", zahl: "tod" }))], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "stirbt", null);
        pruef("SITZUNG eine Welt, die stirbt: die Sitzung startet nie neu, die übrigen Proben sind UNGEMESSEN beim Grund (nie ROT)",
            r2.z.filter((l) => l === "start").length === 1 && r2.es["b.K1#1"].ungemessen === true && /trägt nicht mehr/.test(r2.es["b.K1#1"].grund) && /trägt nicht mehr/.test(r2.kopf.grund), JSON.stringify([r2.z, r2.es, r2.kopf]));
        // DIE WELT ENDET UNTER DER PROBE (Takt 23 GTX an 73bdf938: die Vorfahrt der OMEN nahm sie nach 7,0 min, ferne.K1#2 stand als ROT
        // „read ECONNRESET“ in der Messung): der Ruf der Probe reißt ohne Antwort, die Probe endet nicht GRÜN — das ist keine Messung
        const r12 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "mord"], sek: 30 }, (j, l) => ({ gruen: !!j && j.welt === "warm", zahl: "exit " + l.exit }))],
            [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "mord", null);
        pruef("SITZUNG eine Welt, die UNTER der Probe endet (die Vorfahrt der OMEN): die Probe ist UNGEMESSEN beim Grund, nie ROT; die übrigen ebenso",
            r12.z.join(",") === "start,nimm,warm,mord" && r12.es["a.K1#1"].ungemessen === true && /endete während der Probe/.test(r12.es["a.K1#1"].grund) &&
            /die Probe sah: exit [1-9]/.test(r12.es["a.K1#1"].zahl) && r12.es["b.K1#1"].ungemessen === true && /trägt nicht mehr/.test(r12.es["b.K1#1"].grund),
            JSON.stringify([r12.z, r12.es, r12.kopf]));
        // DER WEG EINER PROBE (w4-sitzung-reif; tempo4 legt seinen Weg über die Wiese, `_standRueckspielen` lässt die Wege-Karte und die
        // Natur, die er räumte, warm): nennt die Grundstellung an Ort und Stelle einen Weg seit dem Grund, geht sie durch die Tür (die
        // Lade-Kette des Speicher-Gesetzes baut Karte und Natur aus dem Grund neu) — die nächste Probe misst im Grund; trägt die Welt ihn
        // auch durch die Tür, sind die übrigen UNGEMESSEN beim Namen des Wegs
        const r13 = await lauf([[S("m.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)]], "weg", null);
        pruef("SITZUNG DER WEG EINER PROBE: die Grundstellung nennt ihn und geht durch die Tür, danach misst die nächste Probe im Grund (die Tür im Kopf beim Namen des Wegs)",
            r13.z.join(",") === "start,nimm,warm,grund,tuer,reload,grund,warm,stop" && r13.es["m.K1#1"].gruen && r13.es["b.K1#1"].gruen &&
            r13.kopf.wegeTueren.length === 1 && /^wege \+1 .*probe:tempo4/.test(r13.kopf.wegeTueren[0].wege), JSON.stringify([r13.z, r13.es, r13.kopf.wegeTueren]));
        const r14 = await lauf([[S("m.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)]], "weg-bleibt", null);
        pruef("SITZUNG MUTANTE ein Weg, der auch die Tür überlebt: die übrigen Proben UNGEMESSEN beim Namen des Wegs (nie ROT, nie still weiter)",
            r14.z.join(",") === "start,nimm,warm,grund,tuer,reload,grund,stop" && r14.es["m.K1#1"].gruen && r14.es["b.K1#1"].ungemessen === true &&
            /abweichend vom Grund: wege \+1 .*probe:tempo4/.test(r14.es["b.K1#1"].grund), JSON.stringify([r14.z, r14.es]));
        // DIE TRITTFLÄCHE IST KEIN GRUND (eich5 GTX 379e5f56: „wege −17“ nach der Tür, die Sitzung endete): der Abdruck trägt die
        // Trittfläche eines Eintrags nie — nach der Tür fehlt sie ohne Abweichung; eine Fläche, die kein Eintrag trägt, bleibt ein Weg
        {
            const kasten = (x) => ({ x0: x, z0: -63.7, x1: x + 2.1, z1: -61.6, formen: [{ typ: "kasten" }] });
            const [weg, t1, t2] = [{ x0: -10, z0: 0, x1: 10, z1: 60, formen: [{}, {}] }, kasten(-119.9), kasten(-3.2)];
            const welt = (fl, arch) => ({ state: { wegeKarte: { siedlungen: fl }, architectures: arch }, _stlWegeKeys: new Set(["dorf:1"]) });
            const grund = wegeAbdruck(welt([weg, t1, t2], [{ _trittBox: t1 }, { _trittBox: t2 }, { _trittBox: false }]));
            const tuer = wegeAbdruck(welt([weg], [{ _trittBox: undefined }, { _trittBox: undefined }, { _trittBox: false }]));
            const waise = wegeAbdruck(welt([weg, t1], [{ _trittBox: undefined }]));
            pruef("SITZUNG DIE TRITTFLÄCHE IST KEIN GRUND: der Abdruck trägt die Trittfläche eines Eintrags nie — nach der Tür fehlt sie ohne Abweichung (eich5: „wege −17“); eine Fläche ohne Eintrag bleibt ein Weg (+1)",
                grund.flaechen.length === 1 && wegeAbweichung(grund, tuer) === null &&
                /^wege \+1 \[-119\.9,-63\.7,-117\.8,-61\.6\/1\]$/.test(String(wegeAbweichung(grund, waise))), JSON.stringify([grund, tuer, waise]));
        }
        // DER ABBRUCH VON ANFANG: fällt die letzte Probe von anfang am Deckel, lädt die Seite neu, ehe der Grund genommen wird
        const r10 = await lauf([[S("a.K1", 1, { befehl: ["node", "-e", "setTimeout(() => {}, 60000)"], sek: 2, stellung: "anfang" }, lies)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "gut", null);
        pruef("SITZUNG DER ABBRUCH VON ANFANG: die Seite neu, ehe der Grund genommen wird (nie ein Grund aus einer Seite, in der eine gefallene Probe arbeitet)",
            r10.z.join(",") === "start,reload,nimm,grund,warm,stop" && r10.es["a.K1#1"].ungemessen === true && r10.es["b.K1#1"].gruen, JSON.stringify([r10.z, r10.es]));
        // DER ORT: die Proben eines Messorts stehen beieinander (die Reihe ihres ersten Auftritts, ohne Ort zuletzt), die Sitzung stellt je
        // Ort EINMAL um (vor dem Deckel der Probe, je Ort im Kopf), nach einer Grundstellung neu (der Grund stellt den Spieler zurück)
        const mitOrt = (o) => [...ruf, "return 1", "umstellen --ort " + o];
        const r11 = await lauf([[S("a.K1", 1, { befehl: mitOrt("wiese"), sek: 30 }, warm)], [S("b.K1", 1, { befehl: mitOrt("genesis"), sek: 30 }, warm)],
            [S("c.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("d.K1", 1, { befehl: mitOrt("wiese"), sek: 30 }, warm)],
            [S("m.K1", 1, { befehl: mitOrt("wiese"), sek: 30, mutiert: true }, warm)], [S("n.K1", 1, { befehl: mitOrt("wiese"), sek: 30, mutiert: true }, warm)]], "gut", null);
        pruef("SITZUNG DER ORT: die Proben eines Messorts beieinander, EIN Umstellen je Ort vor dem Deckel der Probe, nach der Grundstellung neu, je Ort im Kopf",
            r11.reihe.join(" ") === "a.K1#1 d.K1#1 b.K1#1 c.K1#1 m.K1#1 n.K1#1" &&
            r11.z.join(",") === "start,nimm,umstellen:wiese,umstellen:genesis,umstellen:wiese,grund,umstellen:wiese,stop" &&
            r11.kopf.orte.length === 4 && r11.kopf.orte[3].nach === "der Grundstellung" && Object.values(r11.es).every((e) => e.gruen),
            JSON.stringify([r11.reihe, r11.z, r11.kopf.orte]));
        // DIE NEUE SEITE (DER WARME START): eine Probe, die die Seite neu lädt (ein Zweit-Boot, eine Welt durch die Tür), lässt eine Seite
        // ohne Ring — die nächste Probe desselben Orts stellt neu um (vorher fand sie den Ort „gebaut“ und baute ihn im eigenen Deckel)
        const neuLaden = ["node", "-e", 'require("http").request({ host: "127.0.0.1", port: Number(process.env.WERKBANK_PORT), path: "/reload", method: "POST" }, ' +
            '(r) => (r.resume(), r.on("end", () => require("fs").writeFileSync(process.argv[1], "{}")))).end("{}")', "{AUS}", "umstellen --ort wiese"];
        const r15 = await lauf([[S("a.K1", 1, { befehl: neuLaden, sek: 30 }, da)], [S("d.K1", 1, { befehl: mitOrt("wiese"), sek: 30 }, warm)],
            [S("c.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "gut", null);
        pruef("SITZUNG DIE NEUE SEITE: lädt eine Probe die Seite neu, stellt die nächste ihres Orts neu um (der Ring der alten Seite ist fort) — im Kopf nach „einer neuen Seite“; ohne Ort danach kein zweites Einschwingen",
            r15.z.join(",") === "start,nimm,umstellen:wiese,reload,umstellen:wiese,stop" && r15.kopf.orte.length === 2 && r15.kopf.orte[1].nach === "einer neuen Seite" &&
            Object.values(r15.es).every((e) => e.gruen), JSON.stringify([r15.z, r15.kopf.orte, r15.es]));
        // DIE EICH-FAHRT (eichEintrag): ein Urteil zählt nur im Gesetz — 30 s an einem Deckel von 10 s zählt (≤ 45 s), 50 s ohne ausnahme
        // ist UNGEMESSEN beim Namen samt Urteil, 50 s mit ausnahme zählt (≤ 90 s), am Eich-Deckel „≥ 90 s“; die Welt, die endete, und
        // die Fahrt, die riss, tragen keine Zahl der Probe
        const pe = (p) => ({ ...gp, probe: { befehl: ["node", "-e", "0"], sek: 10, ...p } });
        const riss = "Deckel 90 s gerissen — beendet, UNGEMESSEN (zuletzt: SCHRITT /bild 14.5 s)";
        const ee = [eichEintrag(pe({}), { gruen: true, zahl: "z", exit: 0, minuten: 0.5, s: 30 }), eichEintrag(pe({}), { gruen: true, zahl: "z", exit: 0, minuten: 0.8, s: 50 }),
            eichEintrag(pe({ sek: 60, ausnahme: "der Grund beim Namen" }), { gruen: false, zahl: "rot", grund: "ROT: rot", exit: 0, minuten: 0.8, s: 50 }),
            eichEintrag(pe({}), { gruen: false, ungemessen: true, zahl: riss, grund: riss, exit: 1, minuten: 1.5, s: 90.3 }),
            eichEintrag(pe({}), { gruen: false, ungemessen: true, zahl: "w", grund: "die Welt der Sitzung endete während der Probe (x) — ungemessen", s: 3 }),
            eichEintrag(pe({}), { gruen: false, ungemessen: true, zahl: "f", grund: "Deckel der Fahrt 1800 s gerissen nach 12 s der Probe — beendet, UNGEMESSEN", s: 12 })];
        pruef("EICH ein Urteil zählt nur im Gesetz: 30 s am Deckel 10 s zählt · 50 s ohne ausnahme UNGEMESSEN beim Namen samt Urteil · 50 s mit ausnahme zählt · am Eich-Deckel ≥ 90 s · Welt und Fahrt ohne Zahl",
            ee[0].gruen === true && !ee[0].ungemessen && ee[0].eich.s === 30 && ee[0].eich.sek === 10 && ee[0].eich.gesetzS === PROBE_DECKEL_S &&
            ee[1].ungemessen === true && ee[1].gruen === false && /^EICH: 50 s über dem Gesetz 45 s \(ohne ausnahme\) — das Urteil zählt nie \(GRÜN: z\)$/.test(ee[1].grund) && ee[1].eich.urteil === "GRÜN" &&
            ee[2].gruen === false && !ee[2].ungemessen && ee[2].eich.gesetzS === PROBE_AUSNAHME_S && ee[2].eich.sek === 60 &&
            ee[3].ungemessen === true && ee[3].eich.gerissen === true && /^EICH: ≥ 90 s — Deckel 90 s gerissen .*SCHRITT \/bild 14\.5 s\)$/.test(ee[3].grund) &&
            !ee[4].eich && !ee[5].eich && ee[4].grund === "die Welt der Sitzung endete während der Probe (x) — ungemessen", JSON.stringify(ee));
        // DIE EICH-FAHRT in der Stub-Welt: eine Probe, die 3 s braucht, reißt ihren Deckel von 2 s (b.K1 in r1) — in der Eich-Fahrt misst sie
        // bis zur Ausnahme-Grenze, ihr Urteil zählt (3 s ≤ 45 s), ihre Zahl steht beim Namen, der Kopf nennt das Gesetz
        const drei = ["node", "-e", 'setTimeout(() => require("fs").writeFileSync(process.argv[1], JSON.stringify({ n: 0 })), 3000)', "{AUS}"];
        const r16 = await lauf([[S("a.K1", 1, { befehl: drei, sek: 2 }, lies)]], "gut", null, null, true);
        const ea = r16.es["a.K1#1"] || {};
        pruef("EICH-FAHRT die Probe über ihrem Deckel (2 s) misst bis " + PROBE_AUSNAHME_S + " s: GRÜN im Gesetz, eich s ≈ 3 · sek 2 · Gesetz 45; der Kopf nennt Deckel, Gesetz und Fahrt",
            ea.gruen === true && !!ea.eich && ea.eich.sek === 2 && ea.eich.s >= 3 && ea.eich.s < 10 && ea.eich.gesetzS === PROBE_DECKEL_S &&
            !!r16.kopf.eich && r16.kopf.eich.deckelS === PROBE_AUSNAHME_S && r16.kopf.eich.gesetzS === PROBE_DECKEL_S && r16.kopf.eich.fahrtMaxS === FAHRT_MAX_S,
            JSON.stringify([ea, r16.kopf.eich]));
        // DIE AUSWAHL DER EICH-FAHRT (eichOffen): eine Probe mit Zahl am SHA und heutigem Abdruck fällt heraus; ohne Zahl, mit fremdem Abdruck
        // (die Probe änderte sich) oder an einem anderen SHA bleibt sie — die nächste Eich-Fahrt misst den Rest
        const [sa, sb, sc] = ["a", "b", "c"].map((n) => S(n + ".K1", 1, { befehl: ["node", n], sek: 10 }, lies));
        const mo = { sha: "s1", je: { "a.K1#1": { eich: { s: 3 }, abdruck: abdruck(sa, h) } },
            ungemessen: { "b.K1#1": { eich: { s: 50 }, abdruck: "alt" }, "c.K1#1": { grund: "Deckel 10 s gerissen" } } };
        const eo = [eichOffen([sa, sb, sc], mo, "s1", (st) => abdruck(st, h)), eichOffen([sa], mo, "s2", (st) => abdruck(st, h)), eichOffen([sa], null, "s1", (st) => abdruck(st, h))]
            .map((l) => l.map(schluessel).join(","));
        pruef("EICH die Auswahl: mit Zahl am SHA und heutigem Abdruck heraus · ohne Zahl, mit fremdem Abdruck, an einem anderen SHA oder ohne Mess-Datei bleibt sie",
            eo.join(" | ") === "b.K1#1,c.K1#1 | a.K1#1 | a.K1#1", eo.join(" | "));
        // DIE TAFEL (eichTafel, der Leser der Zahlen): ⌈1,5 × s⌉ ≥ 10 s je Lauf, Zwillinge EINE Zeile; über dem Gesetz und am Eich-Deckel kein
        // Deckel (schneller machen), ohne Zahl der Deckel heute; Σ heute ↔ aus den Zahlen
        const tp = (n, sek, extra = {}) => S(n + ".K1", 1, { befehl: ["node", "t" + n], sek, ...extra }, lies);
        const tz = { a: [10, { s: 30 }], b: [33, { s: 50 }], c: [15, { s: 90.4, gerissen: true }], d: [20, null], e: [30, { s: 20 }], f: [40, { s: 6 }], g: [60, { s: 50 }] };
        const ts = Object.entries(tz).map(([n, [sek]]) => tp(n, sek, n === "g" ? { ausnahme: "der Grund beim Namen" } : {}));
        const tw = { ...tp("a", 10), staffel: 2 }; // der Zwilling von a.K1#1: derselbe Befehl, EIN Lauf
        const tm = { sha: "s1", je: {}, ungemessen: {} };
        for (const st of ts) { const z = tz[st.kriterium[0]][1]; if (z) tm[z.gerissen || z.s > 45 ? "ungemessen" : "je"][schluessel(st)] = { abdruck: abdruck(st, h), eich: z }; }
        const tt = eichTafel([...ts, tw], tm, "radeon", h);
        const tzl = tt.zeilen.map((z) => z.ids.join("+") + " " + z.sek + (z.neu != null ? "→" + z.neu : "") + " " + z.urteil).join(" | ");
        pruef("EICH-TAFEL der Deckel aus der Zahl ⌈1,5 × s⌉ ≥ 10 s: zu knapp · über dem Gesetz · ≥ 90 s · ohne Zahl · trägt · zu weit · mit ausnahme bis 90 s; Zwillinge EINE Zeile; Σ heute ↔ aus den Zahlen",
            tzl === "a.K1#1+a.K1#2 10→45 Deckel zu knapp | b.K1#1 33 über dem Gesetz 45 s — schneller machen | c.K1#1 15 ≥ 90 s — schneller machen | d.K1#1 20 ohne Zahl | " +
                "e.K1#1 30→30 trägt | f.K1#1 40→10 Deckel zu weit | g.K1#1 60→75 Deckel zu knapp" && tt.heute === 208 && tt.ausZahlen === 45 + 33 + 15 + 20 + 30 + 10 + 75 && tt.geeicht === 6 &&
                tt.budget === FAHRT_MAX_S - SITZUNG_BOOT_S, tzl + " · Σ " + tt.heute + " → " + tt.ausZahlen);
        // der Ort eines Vegetations-Laufs (w4-sitzung-reif): der erste Stand seines Plans — die Sitzung stellt ihn vor dem Deckel
        const plan = (...p) => ({ probe: { befehl: ["node", "-e", "(async function vegetationLauf() {})()", "{AUS}", "{PORT}", JSON.stringify(p)] } });
        const vo = [plan(["wiese", "third", 0.5, null, "wiese"]), plan(["genesis", "ego", 0.5, null, "wiese"], ["wiese", "ego", 0.3, null, "wiese"]), plan()].map(probeOrt);
        pruef("SITZUNG DER ORT eines Vegetations-Laufs: der erste Stand seines Plans (wiese, genesis), ohne Plan keiner",
            vo.join(",") === "wiese,genesis," && vo[2] === null, JSON.stringify(vo));
        // DIE GRUNDSTELLUNG, DIE NICHT TRÄGT: weicht nach dem Rückspielen eine Größe vom Grund ab, sind die übrigen Proben UNGEMESSEN beim
        // Namen der Größe (nie ROT, nie ein Neuladen)
        const r7 = await lauf([[S("m.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)]], "anders", null);
        pruef("SITZUNG eine Grundstellung, nach der eine Größe vom Grund abweicht: die übrigen Proben UNGEMESSEN beim Namen der Größe",
            r7.es["m.K1#1"].gruen && r7.es["b.K1#1"].ungemessen === true && /abweichend vom Grund: augenblick\.brand/.test(r7.es["b.K1#1"].grund) && r7.z.join(",") === "start,nimm,warm,grund,stop",
            JSON.stringify([r7.z, r7.es]));
        // DAS SCHLOSS ZWISCHEN DEN PROBEN: wartet ein CI-Job (die letzte Zeile von hook.log), geht das Schloss an der Proben-Grenze an ihn und kommt
        // danach wieder — die Welt startet nie neu, das Warten zählt nie in die Fahrt
        if (gl) {
            fs.writeFileSync(glLog, "");
            fs.appendFileSync(hookLog, "2026-10-29 10:00:05 start ci-probe 1/1 echt: wartet auf Schloss von 'punkte-radeon-sitzung'\n");
            const r8 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "gut", gl);
            fs.writeFileSync(hookLog, "2026-10-29 10:00:00 ende ci-probe 1/1 echt\n");
            const sl = fs.readFileSync(glLog, "utf8").trim().split("\n");
            pruef("SITZUNG DAS SCHLOSS ZWISCHEN DEN PROBEN: ein wartender CI-Job bekommt es an jeder Proben-Grenze, die Sitzung nimmt es neu, die Welt bleibt (ein Start)",
                sl.length === 3 && r8.kopf.freigaben.length === 2 && r8.z.filter((l) => l === "start").length === 1 && r8.es["a.K1#1"].gruen && r8.es["b.K1#1"].gruen,
                JSON.stringify([sl, r8.kopf.freigaben, r8.z]));
            // DER LANGSAME BLICK (Heilung 30.10., Radeon 3ed96b3f: 69 von 69 Proben ungemessen, „read ECONNRESET“ am ersten /fenster):
            // ci_wartet braucht hier 7 s (der Laptop 5,2 s, mit Waisen daneben 20 s) — als spawnSync stand der Läufer so lange, die Werkbank
            // schloss den ruhenden Socket (keepAliveTimeout 5 s), der nächste Ruf nahm ihn: die Welt galt als tot. Der Blick läuft neben
            // der Probe, jeder Ruf hat seine Verbindung: die Welt trägt über jede Grenze, beide Proben messen, keine Freigabe
            const langsam = path.join(tmp, "langsam");
            fs.mkdirSync(langsam, { recursive: true });
            fs.copyFileSync(gl, path.join(langsam, "sitzung-schloss.sh"));
            fs.writeFileSync(path.join(langsam, "gpu-schloss.sh"), "ci_wartet() { sleep 7; return 1; }\n");
            const r9 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "gut",
                path.join(langsam, "sitzung-schloss.sh"));
            pruef("SITZUNG DER LANGSAME BLICK: ci_wartet 7 s hält den Läufer nie an — die Welt trägt über jede Proben-Grenze, beide Proben messen, keine Freigabe",
                !!r9.es["a.K1#1"] && r9.es["a.K1#1"].gruen && !!r9.es["b.K1#1"] && r9.es["b.K1#1"].gruen && !r9.kopf.grund && r9.kopf.freigaben.length === 0 && r9.kopf.ciBlicke >= 1,
                JSON.stringify([r9.es, r9.kopf.grund, r9.kopf.freigaben, r9.kopf.ciBlicke]));
        }
        // DIE WACHE DER FAHRT: reißt die Uhr der Fahrt (hier 8 s), fällt die laufende Probe am Rest (UNGEMESSEN beim Namen), jede folgende
        // ist offen, die Sitzung endet und nennt sie; die Fahrt davor misst wie immer
        const r6 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("b.K1", 1, { befehl: ["node", "-e", "setTimeout(() => {}, 60000)"], sek: 30 }, lies)],
            [S("c.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm), S("c.K1", 2, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "fahrt", null, 8);
        pruef("SITZUNG DIE WACHE DER FAHRT: die Probe am Rest der Fahrt UNGEMESSEN (Deckel der Fahrt), die folgenden offen beim Namen, die Sitzung endet und nennt sie",
            r6.es["a.K1#1"].gruen && r6.es["b.K1#1"].ungemessen === true && /^Deckel der Fahrt 8 s gerissen nach \d+ s der Probe — beendet, UNGEMESSEN$/.test(r6.es["b.K1#1"].grund) &&
            ["c.K1#1", "c.K1#2"].every((id) => r6.es[id].ungemessen === true && /^die Fahrt riss 8 s \(in b\.K1#1\) — offen, UNGEMESSEN$/.test(r6.es[id].grund)) &&
            JSON.stringify(r6.kopf.offen) === JSON.stringify(["b.K1#1", "c.K1#1", "c.K1#2"]) && /^die Fahrt riss 8 s in b\.K1#1 — offen: b\.K1#1, c\.K1#1, c\.K1#2$/.test(r6.kopf.grund) &&
            r6.kopf.fahrtS < 14 && r6.z.filter((l) => l === "start").length === 1 && r6.z[r6.z.length - 1] === "stop", JSON.stringify([r6.es, r6.kopf, r6.z]));
        const r3 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "kaputt", null);
        pruef("SITZUNG eine Welt, die nie steht, ist ROT beim Grund (die Station misst, ob das Spiel bootet)",
            r3.es["a.K1#1"].gruen === false && !r3.es["a.K1#1"].ungemessen && /startet nicht: die Werkbank startet nicht/.test(r3.es["a.K1#1"].grund), JSON.stringify(r3));
        if (findeBash()) {
            const bl = path.join(tmp, "sitzung-blockiert.sh");
            fs.writeFileSync(bl, "#!/bin/bash\necho 'SCHLOSS BLOCKIERT von ci-echt nach 2701 s Warten'\nexit 75\n");
            const r4 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "kein-start", bl);
            pruef("SITZUNG ein blockiertes Schloss ist UNGEMESSEN beim Namen, die Welt startet nie", r4.es["a.K1#1"].ungemessen === true && /blockiert.*ci-echt/.test(r4.es["a.K1#1"].grund) && !r4.z.length, JSON.stringify(r4));
        }
    }
    // (10) DER HAKEN DES STROMS in einer gestellten Seite (stromSeite, wie die Werkbank ihn per /eval zieht): nur gerenderte Bilder
    // (die Leine gespannt: kein Bild), die Bild-Zeit nur innerhalb EINER Schleife, die Zelle ab dem Zapfen, der sie setzt, ein Wurf des
    // Hakens gezählt und nie in das Spiel geworfen, eine Schleife von vor dem Haken fährt durch ihn, der Zapfen leert; der Leser
    // nennt Zelle, Wetter, Wanduhr, Marke und den Überlauf des Stempel-Pools
    {
        const welt = () => {
            const uhrMs = { t: 0 };
            const R = { info: { render: { drawCalls: 50, triangles: 1e5 } }, _animation: { _animationLoop: null }, setAnimationLoop(cb) { this._animation._animationLoop = cb || null; } };
            const r = { state: { renderer: R, playerMesh: { position: { x: 3, z: 4 } }, cameraMode: "first", player: { mountedArch: null }, perfTargetMs: 1000,
                perfSense: { loadScale: 1 }, weather: "sunny", creatures: [], timeOfDay: 0.5 }, _gpuLeine: { gerendert: 0 }, _gpuTsAtMs: 1, _gpuTsLast: 9.5,
                _szeneSkalaWirk: () => 0.75 };
            const win = { __vram: { puffer: 50 * 1048576, texturen: 60 * 1048576 }, __stempelWache: () => ({ ueberlauf: uhrMs.ueberlauf || 0 }) };
            const perf = { now: () => uhrMs.t, timeOrigin: 1e12, memory: { usedJSHeapSize: 200 * 1048576 } };
            const zapf = (a) => new Function("r", "window", "performance", stromCode(a))(r, win, perf);
            const bild = (t, leine = false) => {
                uhrMs.t = t;
                const cb = R._animation._animationLoop;
                if (cb) cb(t);
            };
            return { r, R, win, uhrMs, zapf, bild, spiel: (leine) => () => { if (!leine.an) r._gpuLeine.gerendert++; } };
        };
        const W1 = welt(), leine = { an: false };
        const e0 = W1.zapf({});
        W1.R.setAnimationLoop(W1.spiel(leine));
        W1.bild(0);
        W1.bild(16.7);
        leine.an = true;
        W1.bild(25);
        leine.an = false;
        W1.bild(33.4);
        const e1 = W1.zapf({ zelle: "wiese-ego-steht" });
        W1.bild(50.1);
        W1.R.setAnimationLoop(null);
        W1.R.setAnimationLoop(W1.spiel(leine));
        W1.bild(1000);
        W1.r._gpuTsAtMs = 2;
        W1.bild(1016.7);
        const e2 = W1.zapf({ zelle: null });
        Object.defineProperty(W1.r.state, "playerMesh", { get() { throw new Error("kaputt"); }, configurable: true });
        let warf = false;
        try {
            W1.bild(1033.4);
        } catch (_e) {
            warf = true;
        }
        const e3 = W1.zapf({});
        const W2 = welt();
        W2.R.setAnimationLoop(W2.spiel({ an: false }));
        W2.zapf({});
        W2.bild(5);
        W2.bild(21.7);
        const e4 = W2.zapf({});
        const dt = (e) => e.zeilen.map((z) => z[1]).join(",");
        pruef("STROM-HAKEN nur gerenderte Bilder, die Bild-Zeit je Schleife (neue Schleife: −1), die Zelle ab ihrem Zapfen, VRAM · Befehle · Dreiecke · Sicht · Regler je Bild",
            e0.bereit && e0.neu && e0.zeilen.length === 0 && dt(e1) === "-1,16.7,16.7" && e1.zeilen.every((z) => z[15] === -1 && z[3] === 110 && z[5] === 50 && z[9] === 1 && z[11] === 1) &&
            dt(e2) === "16.7,-1,16.7" && e2.zeilen.every((z) => e2.namen.zelle[z[15]] === "wiese-ego-steht") && e2.zeilen[0][4] === -1 && e2.zeilen[2][4] === 9.5 && !e2.neu,
            JSON.stringify([e1.zeilen, e2.zeilen]));
        pruef("STROM-HAKEN ein Wurf des Hakens stört das Spiel nie (gezählt im Strom), eine Schleife von vor dem Haken fährt durch ihn",
            !warf && e3.fehler === 1 && /kaputt/.test(e3.letzterFehler) && e3.zeilen.length === 0 && W1.r._gpuLeine.gerendert === 7 && dt(e4) === "-1,16.7", JSON.stringify([warf, e3, e4.zeilen]));
        const sd = path.join(tmp, "strom-lesen.ndjson");
        const zeile = (probe, e, stempel) => fs.appendFileSync(sd, JSON.stringify({ probe, zeit: "z", ...e, stempel }) + "\n");
        zeile("a.K1#1", e1, 0);
        stromMarke(sd, "a.K1#1", "dauer-anfang", { heapMB: 1 });
        zeile("b.K1#1", e2, 2);
        const L = stromLesen(sd);
        pruef("STROM-LESER je Bild Probe, Seite, Wanduhr, Zelle und Wetter beim Namen, die Marke an ihrer Stelle unter den Bildern, ein Block nach Pool-Überlauf ohne GPU-Gültigkeit",
            L.bilder.length === 6 && L.bloecke === 2 && L.seiten.length === 1 && L.bilder[0].wand === 1e12 && L.bilder[3].zelle === "wiese-ego-steht" && L.bilder[0].zelle === null &&
            L.bilder.every((b) => b.wetter === "sunny") && L.marken.length === 1 && L.marken[0].bild === 3 && L.bilder[0].stempelOk && !L.bilder[3].stempelOk,
            JSON.stringify([L.bilder.map((b) => [b.probe, b.zelle, b.stempelOk]), L.marken]));
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    const rot = fall.filter((f) => !f.ok);
    console.log((rot.length ? "SELBSTTEST ROT — " + rot.map((f) => f.name).join(", ") : "SELBSTTEST GRÜN") + " (" + (fall.length - rot.length) + "/" + fall.length +
        (ohne.size ? ", ohne " + [...ohne].map((t) => "(" + t + ")").join(" ") : "") + ")");
    return rot.length ? 1 : 0;
}

// ───────────────────────────────── CLI ─────────────────────────────────
function opts(argv) {
    const o = {};
    for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) {
        const k = argv[i].slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        o[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    }
    return o;
}

if (require.main === module) {
    const [verb, ...rest] = process.argv.slice(2);
    const o = opts(rest);
    (async () => {
        if (verb === "run") await run(o);
        else if (verb === "halter") await halter(o);
        else if (verb === "grundstellung") {
            // in einer Probe: die Grundstellung der Welt der Sitzung (WERKBANK_PORT, der Grund PUNKTE_SITZUNG_GRUND)
            const g = await grundstellung(Number(o.port || process.env.WERKBANK_PORT), o.grund || process.env.PUNKTE_SITZUNG_GRUND);
            console.log(g.ok ? "GRUNDSTELLUNG " + g.s + " s (im Spiel " + g.ms + " ms, neu " + JSON.stringify(g.neu) + ")" : "GRUNDSTELLUNG ROT: " + g.grund);
            process.exitCode = g.ok ? 0 : 1;
        }
        else if (verb === "grundprobe") process.exitCode = (await grundProbe(o)) ? 0 : 1;
        else if (verb === "scheiben") scheibenCli(o);
        else if (verb === "vereine") vereineCli(o);
        else if (verb === "buchen") buchenCli(o);
        else if (verb === "gtx-nutzen") gtxNutzenCli(o);
        else if (verb === "eichtafel") eichtafelCli(o);
        else if (verb === "plan") planCli(o);
        else if (verb === "gruppen") for (const g of zwillingsGruppen(ladeGeprueft().stationen, o.geraet, o.nur)) console.log(g.join(","));
        else if (verb === "liste") {
            const { stationen, fehler, fehlt } = ladeGeprueft();
            // DIE WAND PFAD am Kopf (--kopf, sonst origin/main des Spiel-Klons): jeder Glob trifft eine Datei
            const repo = spielRepo();
            const kopf = voll(repo, o.kopf || "origin/main");
            const dateien = dateienAm(repo, kopf);
            for (const st of stationen) {
                const t = toteGlobs(st.pfad, dateien);
                if (t.length) fehler.push(schluessel(st) + ": " + pfadGrund(t, "am Kopf " + kopf.slice(0, 8)));
            }
            for (const st of stationen) console.log("  " + schluessel(st) + " · " + geraeteVon(st).join("+") + (st.gpu ? " · GPU" : "") + (st.zeit ? " · Zeit" : " · Bild") + (st.probe ? " · Sitzung ≤ " + probeSek(st) + " s" : "") + " · " + st.minuten + " min · " + befehlVon(st).join(" ") + " · " + abdruck(st));
            for (const e of fehlt) console.log("  FEHLT " + e.kriterium + "#" + e.staffel + " · " + String(e.grund).slice(0, 140));
            for (const f of fehler) console.log("  ROT " + f);
            console.log(stationen.length + " Stationen · " + new Set(stationen.map((s) => s.kriterium)).size + " Kriterien · fehlt " + fehlt.length + " · Fehler " + fehler.length);
            process.exitCode = fehler.length ? 1 : 0;
        } else if (verb === "selbsttest") process.exitCode = await selbsttest(o);
        else {
            console.log("Verben: run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--offen] [--eich] [--trocken] [--bahnen 3] [--port-basis 7700] [--farm <name>] · gruppen --geraet <g> [--nur id,id] · scheiben --sha <sha> --geraet headless [--jobs 12] [--offen|--nur …] · vereine --sha <voll> --geraet headless --farm <name> --teile <dir> [--scheiben <json>] [--beginn <s>] · buchen --kopf <sha> · liste [--kopf <sha>] · eichtafel --sha <sha> --geraet radeon|gtx · selbsttest [--ohne 3c]");
            process.exitCode = 2;
        }
    })().catch((e) => {
        console.error("PUNKTE ROT: " + (e && e.message));
        process.exitCode = 2;
    });
}

module.exports = { liesStand, maschinenKriterium, standPruefen, buchen, pruefeStationen, trifftPfad, toteGlobs, gpuZeuge, gpuWand, abdruck, fahreStation,
    frischUrteil, stempelDateien, linsenVon, linsenAm, ladeGeprueft, ladeMessungen, spielRepo, voll, git, schluessel, geraeteVon, hilfeText,
    // DER STROM für die Probe der Sitzung (require(process.env.PUNKTE_MASCHINE)): EIN Zapfen, EINE Marke, EIN Leser, der Ruf mit Frist
    stromZapfen, stromMarke, stromLesen, rufFrist, STROM_SPALTEN };
