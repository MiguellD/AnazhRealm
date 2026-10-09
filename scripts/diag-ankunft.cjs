// diag-ankunft.cjs — DIE ANKUNFTS-LINSE (Welle L Folge, v1-Schritte 1–2: ankommen · laufen und sehen). Die Defekte, die die
// SICHTBARE Leben-Schau am 07.10. auf dem Welle-L-Stand fand (artifacts/profiband/leben-schau/befund-v1-pfad.md), je beim
// NAMEN. Jede Probe ruft den Chokepoint selbst im echten Boot (headless, foundry-ON, Null-Renderer) und misst seine Wirkung;
// das Bild der Ankunft beweist die echte GPU (Bild-Paare vorher/nachher), diese Linse die Mechanik.
//
//   L2a DAS ERSTE WELTBILD — `#ladeschirm` steht im HTML ab dem ersten Bild der Seite (kein `hidden`, über allem) und
//       weicht im Spiel nur über `_ankunftsBild`: solange dem Weltbild etwas fehlt — der Boden bis zum Existenz-Boden des
//       Rings, ein Baum oder Bau der Mesh-Zone ohne Gestalt, eine Streu-Region ohne ihr Asset, die Karte eines fernen
//       Baums —, bleibt er und nennt die Lücke in seiner Stand-Zeile; steht alles, weicht er; ruht eine Lücke, weicht er
//       laut (WARN). Befund: das erste Bild war die schwarze Leinwand (Radeon: 1,6 s bis 14,5 s nach dem Laden);
//       Gegenprüfung Runde 1: der Ladeschirm wich beim eigenen Chunk, das erste Weltbild zeigte keinen Baum. Befund 09.10.
//       (CI 37942425121): bei langsamem Takt lief der Streu-Streamer vor dem Weltbild nie, die fehlende Regionen-Karte galt
//       als „nichts wartet" — jeder Fall wird hergestellt, einer, der fehlt, ist ROT bei seinem Grund (`ohneFall`).
//   L1  DAS FADENKREUZ — `#fadenkreuz` steht in der Bildmitte (dort trifft `_blickZiel`), weicht einer offenen Schublade.
//       Befund: 0 Fadenkreuz-Elemente.
//   L2b DIE HILFE — „hilfe" / „help" / „?" nennt jedes Beispiel der EINEN Tafeln (`chatDslPatterns`, `chatSystemPatterns`,
//       ihre `hilfe`-Sätze) und jede Taste (`KEYBINDING_LABELS`); der Satz für Unbekanntes trägt keine zweite Liste.
//       Befund: „hilfe" → „Unbekannter Befehl. Meintest du: 'warte'?", „help" eine Liste von Hand ohne v1-Satz.
//   L3  DAS GESPRÄCH — die Chat-Taste (Enter) öffnet das Feld, Enter im Feld sendet und gibt die Welt zurück (W läuft
//       wieder), Esc gibt sie ohne Senden zurück; Enter auf einem fokussierten Knopf gehört dem Knopf. Befund: Enter, T und
//       „/" öffneten nichts, nach dem Senden tippte W „w"; Gegenprüfung Runde 1: Enter auf einem Knopf öffnete den Chat.
//   L7  DER START-GURT — die Hotbar eines neuen Spielers liest den Katalog (`_katalogSichtbar`): je Studio-Art EIN
//       platzierbares Werk, kein Alt-Doppel. Befund: Felsblock · Wasserfall · Damm.
//   LK  DIE KAMERA UND DIE PFLANZEN — die Stamm-Blocker eines Studio-Baums tragen seine Welt-Skala (der Körper stößt an den
//       Stamm, wie er gezeichnet wird); die 3rd-Kamera (zu Fuß und die Verfolger-Kamera des Ritts) rückt nur vor Boden und
//       Bau ein, nie vor einer Pflanze (Stamm, Krone), und fährt nach einem Hindernis gleitend hinaus, nie im Sprung; jeder
//       Pflanzen-Stoff in der Szene trägt die DURCHSICHT (maskNode: was zwischen Auge und Spieler liegt, dithert aus), der
//       Schatten-Pass liest sie nie (maskShadowNode). Befund 07.10.: die Kamera stand 0,53 m von der Achse einer Kiefer (im
//       Stamm) und 2,86 m von der Achse einer Tanne, in der der Spieler bei 7,3 m stand — eine Nadelwand; Gegenprüfung
//       Runde 1 (Kronen-Hülle 5167fd85): beim Ritt 641 von 2400 Proben unter 3 m Arm (die Kamera am Wagendach), 137 Sprünge
//       > 2 m, zu Fuß 43 % der Proben in Baumnähe auf dem 2-m-Minimum, 5 Sprünge > 1 m auf 80 m; das Fadenkreuz stand in
//       3rd auf dem Kopf der Figur (die Brust ≥ 0,35 m neben dem Strahl der Bildmitte). Gegenprüfung Runde 2: (1) jede Probe
//       durch die Bildmitte (Bau-Pick, Welt-Treffer, Blick-Ziel, Bau-Phantom, Kreatur-Pick) trifft nie, was zwischen Kamera
//       und Spieler liegt — 12 Bäume × 8 Richtungen, der Spieler 2,5 m vor dem Baum mit dem Rücken zu ihm: die Strahlen ab
//       der Kamera trafen die durchsichtige Pflanze HINTER ihm (Bau-Pick 76, Welt-Treffer 67 von 96); (2) die Durchsicht
//       nimmt nur, was zwischen Auge und Spieler liegt — die EINE Formel (`_durchsichtGewicht`) an der Rinde: im 1st am
//       Stamm (die Ankunfts-Sicht) schnitt die Kugel um das Auge die Rinde bis 1,1 m (8 von 8 Anläufen), in 3rd die Kugel um
//       die Brust den Stamm VOR dem Spieler; der Stamm zwischen Kamera und Spieler fällt weiter.
//   D8  ZWEI KANÄLE — der Spieler-Chat trägt Worte, das Log die Telemetrie: die Siedlungs-Zeile ohne Same und Slots, das
//       KI-Programm als Tat (`describeProgram`), nie als JSON, eine Programm-Absage ohne Ereignis-Namen.
//   D6  DIE KI NENNT DIE URSACHE — „Aktivieren" fragt einen lokalen Dienst (der Status sagt, dass er nicht läuft, nie
//       „Aktiv"), ohne Schlüssel sagt der Chat es, der Proxy ist der Ursprung der Seite (404 dort = „der Proxy fehlt").
//   D9  DAS DORF VOR DIR — „dorf 7 18" an der Plattform: jedes Haus vor dem Spieler und im Bildwinkel der Welt-Kamera; ein
//       Slot, dessen Ort ein Bau sperrt, findet einen Ersatz-Ort; „baue dorf hier" baut bei einem Mitspieler (anderer Ort,
//       andere Gier, Quelle remote) dasselbe Dorf an derselben Stelle. Befund: 13 Häuser, 12 von 25 Slots übersprungen, die
//       drei nächsten HINTER dem Spieler (cos −1,00 / −0,48 / −0,12); Gegenprüfung Runde 1: beim Mitspieler ~60 m daneben.
//
//   node scripts/diag-ankunft.cjs [--selftest]          Port: ANKUNFT_PORT (Standard 4601)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");

const PORT = Number(process.env.ANKUNFT_PORT || 4601);
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
function ladeschirmVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.imHtml) out.push("kein Ladeschirm im HTML (das erste Bild ist die schwarze Leinwand)");
    else {
        if (m.htmlVersteckt) out.push("der Ladeschirm steht im HTML versteckt");
        if (!(m.zIndex >= 1000000)) out.push(`der Ladeschirm liegt unter der UI (z-index ${m.zIndex})`);
    }
    const f = m.faelle || {};
    if (f.fehler) return out.concat([f.fehler]);
    // Ein Fall, den die Probe nicht herstellen konnte, ist ROT beim Grund, den sie nennt (`ohneFall`) — nie still „kein Fall"
    // (Befund 09.10.: der Streu-Fall fehlte je nach Boot-Takt, CI 37942425121).
    const ohne = (k) => `${(m.ohneFall || {})[k] || "die Probe stellte den Fall nicht her und nennt keinen Grund"} (Vorbedingung)`;
    // eine Lücke hält den Ladeschirm und die Stand-Zeile nennt sie
    for (const [k, name, wort] of [
        ["ohneBoden", "ohne Boden unter dem Spieler", /Boden/],
        ["baumUngebaut", "mit einem Baum der Mesh-Zone ohne Gestalt", /Bäume und Bauten/],
        ["streuWartet", "mit einer Streu-Region, die auf ihr Asset wartet", /Wald-Stück/],
        ["streuNie", "ohne eine gestreamte Streu-Region (der Streamer lief noch nie)", /Wald-Stück/],
        ["karteOffen", "mit der offenen Karte eines fernen Baums", /ferne Bäume/],
    ]) {
        const z = f[k];
        if (!z) out.push(`${name}: ${ohne(k)}`);
        else if (z.weg) out.push(`${name} weicht der Ladeschirm (das halbe Weltbild)`);
        else if (!wort.test(z.stand || "")) out.push(`${name} nennt die Stand-Zeile die Lücke nicht („${z.stand}")`);
    }
    if (!f.allesSteht || !f.allesSteht.weg) out.push(`steht alles, bleibt der Ladeschirm („${(f.allesSteht && f.allesSteht.stand) || ""}"${m.fehltNachBoot && m.fehltNachBoot.length ? `, nach dem Boot fehlt ${m.fehltNachBoot.join(" · ")}` : ""})`);
    if (!f.lueckeRuht) out.push(`eine ruhende Lücke: ${ohne("lueckeRuht")}`);
    else if (!f.lueckeRuht.weg) out.push("eine ruhende Lücke hält den Spieler vor der Welt fest");
    else if (!f.lueckeRuht.warn) out.push("eine ruhende Lücke weicht ohne Wort im Log");
    if (!f.lueckeFlackert) out.push(`eine flackernde Lücke: ${ohne("lueckeFlackert")}`);
    else if (!f.lueckeFlackert.weg) out.push("eine flackernde Lücke hält den Ladeschirm ohne Grenze (kein Deckel)");
    else if (!f.lueckeFlackert.warn) out.push("eine flackernde Lücke weicht ohne Wort im Log");
    const g = m.weichtGanz;
    if (!g) out.push("das Weichen des Ladeschirms: kein Fall (Vorbedingung)");
    else if (!g.hidden || g.display !== "none" || g.animationen)
        out.push(
            `der Ladeschirm weicht nicht aus dem Layout (hidden ${g.hidden}, display ${g.display}, ${g.animationen} laufende ` +
                "Animationen) — er liegt unsichtbar über der Leinwand"
        );
    const th = m.tastenHinter;
    if (!th) out.push("Tasten hinter dem Ladeschirm: keine Probe (Vorbedingung)");
    else {
        if (th.w) out.push("hinter dem Ladeschirm läuft W den Spieler");
        if (th.enter === "chat-input") out.push("hinter dem Ladeschirm öffnet Enter das Gespräch");
        if (th.omnibox == null) out.push("Strg+K hinter dem Ladeschirm: keine Omnibox (Vorbedingung)");
        else if (th.omnibox) out.push("hinter dem Ladeschirm öffnet Strg+K die Omnibox");
    }
    if (!m.nachBootWeg) out.push("nach dem Boot (Null-Renderer) steht der Ladeschirm über der UI");
    return out;
}
function kreuzVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.da) return ["kein Fadenkreuz"];
    if (!m.sichtbar) out.push("das Fadenkreuz ist unsichtbar");
    if (!(Math.abs(m.dx) <= 1 && Math.abs(m.dy) <= 1)) out.push(`das Fadenkreuz steht ${m.dx}/${m.dy} px neben der Mitte`);
    if (m.mitSchublade) out.push("das Fadenkreuz steht über der offenen Werkstatt");
    if (!m.nachSchublade) out.push("nach der Werkstatt fehlt das Fadenkreuz");
    return out;
}
function hilfeVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    for (const wort of ["hilfe", "help", "?"]) {
        const z = (m.antworten || {})[wort] || {};
        if (z.unbekannt) out.push(`„${wort}" ist unbekannt („${z.erste}")`);
        else if (z.fehlt && z.fehlt.length) out.push(`„${wort}" nennt ${z.fehlt.length} Beispiel(e) der Tafeln nicht (${z.fehlt.slice(0, 3).join(" · ")})`);
        if (z.tastenFehlen && z.tastenFehlen.length) out.push(`„${wort}" nennt ${z.tastenFehlen.length} Taste(n) nicht (${z.tastenFehlen.slice(0, 3).join(" · ")})`);
        if (!z.v1) out.push(`„${wort}" nennt keinen v1-Satz`);
    }
    if (m.unbekanntListe) out.push("der Satz für Unbekanntes trägt eine Liste von Hand");
    return out;
}
function gespraechVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (m.enterFokus !== "chat-input") out.push(`Enter öffnet das Gespräch nicht (Fokus ${m.enterFokus})`);
    if (m.wImFeld) out.push("W läuft beim Tippen im Feld");
    if (!m.gesendet) out.push("Enter im Feld sendet nicht");
    if (m.nachSenden === "chat-input") out.push("nach dem Senden bleibt der Fokus im Feld (W tippt „w\")");
    if (!m.wNachSenden) out.push("nach dem Senden läuft W nicht");
    if (m.nachEsc === "chat-input") out.push("Esc gibt die Welt nicht zurück");
    if (m.enterAufKnopf == null) out.push("kein Knopf für die Probe (Vorbedingung)");
    else if (m.enterAufKnopf !== "knopf") out.push(`Enter auf einem fokussierten Knopf öffnet das Gespräch und nimmt ihm den Fokus (${m.enterAufKnopf})`);
    return out;
}
function gurtVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.buch) return ["Buch kalt (Vorbedingung)"];
    const belegt = (m.hotbar || []).filter(Boolean);
    if (!belegt.length) out.push("der Start-Gurt ist leer");
    for (const e of m.eintraege || []) {
        if (!e.sichtbar) out.push(`${e.name} ist im Katalog versteckt${e.altDoppel ? ` (Alt-Doppel → ${e.altDoppel})` : ""}`);
        else if (!e.art) out.push(`${e.name} ist kein Studio-Werk`);
        else if (!e.platzierbar) out.push(`${e.name} lässt sich nicht setzen`);
    }
    const arten = (m.eintraege || []).map((e) => e.art).filter(Boolean);
    const doppelt = arten.filter((a, i) => arten.indexOf(a) !== i);
    if (doppelt.length) out.push(`Studio-Art doppelt im Gurt: ${doppelt.join(", ")}`);
    const fehlt = (m.katalogArten || []).filter((a) => !arten.includes(a));
    if (fehlt.length) out.push(`Studio-Art ohne Werk im Gurt: ${fehlt.join(", ")}`);
    return out;
}
function kameraVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.baum) return ["kein Studio-Baum als Eintrag (Vorbedingung)"];
    if (!(m.stammSkala >= 0.95 * m.weltSkala)) out.push(`Stamm-Hülle im Vorlagen-Maß (× ${m.stammSkala} statt × ${m.weltSkala})`);
    for (const k of ["fuss", "ritt"]) {
        const z = (m.wege || {})[k];
        if (!z || !(z.proben > 0)) {
            out.push(`${k}: keine Probe (Vorbedingung${z && z.grund ? ": " + z.grund : ""})`);
            continue;
        }
        if (z.pflanzeHaelt > 0)
            out.push(`${k}: eine Pflanze hält die Kamera in ${z.pflanzeHaelt} von ${z.proben} Proben (Arm ${z.armIst} statt ${z.armSoll} m im Median, Täter ${(z.taeter || []).join(", ")})`);
        if (z.spruengePflanze > 0) out.push(`${k}: ${z.spruengePflanze} Sprünge > ${z.sprungM} m je Bild, die keine Bau- oder Boden-Kante erzwingt (${z.spruenge} gegen ${z.spruengeSoll})`);
        if (z.hinausSprung > 0) out.push(`${k}: die Kamera springt ${z.hinausSprung}× hinaus (> ${z.sprungM} m je Bild)`);
    }
    if (!(m.stoffe > 0)) out.push("kein Pflanzen-Stoff in der Szene (Vorbedingung)");
    if (m.stoffeOhne > 0) out.push(`${m.stoffeOhne} von ${m.stoffe} Pflanzen-Stoffen ohne Durchsicht (${(m.stoffeOhneArten || []).join(", ")})`);
    if (m.schattenGeschnitten > 0) out.push(`${m.schattenGeschnitten} Pflanzen-Stoff(e) schneiden die Durchsicht auch in den Schatten`);
    if (m.zielFolgt === false) out.push(`das Ziel der Durchsicht folgt der Brust nicht (${m.zielAbstand} m daneben)`);
    if (!(m.kreuzAbstand >= 0.35)) out.push(`das Fadenkreuz steht in 3rd auf der Figur (${m.kreuzAbstand} m vom Strahl der Bildmitte)`);
    const fk = m.fadenkreuz || {};
    if (!(fk.stellungen > 0)) out.push("Fadenkreuz-Strahl: keine Stellung (Vorbedingung)");
    for (const [fn, n] of Object.entries(fk.hinten || {}))
        if (n > 0) out.push(`Fadenkreuz-Strahl: \`${fn}\` trifft in ${n} von ${fk.stellungen} Stellungen HINTER dem Spieler (was zwischen Kamera und Spieler liegt)`);
    if (fk.kreatur && fk.kreaturVornProben > 0 && fk.kreaturVorn < fk.kreaturVornProben)
        out.push(`Fadenkreuz-Strahl: eine Kreatur VOR dem Spieler trifft er nur in ${fk.kreaturVorn} von ${fk.kreaturVornProben} Stellungen`);
    // Das Ziel der Kamera liegt auf ihrem Blick (Integration V18.536, Gelb 1 der dritten Gegenprüfung): dann steht die Ebene
    // des Strahls senkrecht zum Blick und er beginnt bei jedem Arm am Blickpunkt.
    if (fk.stellungen > 0 && !(fk.zielAchse <= 0.01))
        out.push(`Fadenkreuz-Strahl: das Ziel der Kamera liegt ${fk.zielAchse} m neben ihrem Blick (bei kurzem Arm beginnt der Strahl hinter dem Blickpunkt)`);
    const ds = m.durchsicht || {};
    if (!ds.formel) out.push("Durchsicht: keine EINE Formel (`_durchsichtGewicht` + `DURCHSICHT_ZAHLEN`), die Linse und Stoff teilen");
    else {
        for (const [k, name] of [
            ["first", "1st am Stamm"],
            ["third", "3rd, der Stamm VOR dem Spieler"],
        ]) {
            const z = ds[k];
            if (!z || !(z.anlaeufe > 0)) out.push(`Durchsicht ${name}: kein Anlauf (Vorbedingung)`);
            else if (z.faellt > 0)
                out.push(`Durchsicht ${name}: die Rinde fällt in ${z.faellt} von ${z.anlaeufe} Anläufen (Auge ${Math.min(...z.abstand)}–${Math.max(...z.abstand)} m vom Stamm, Gewicht ab ${z.wMin})`);
        }
        const zw = ds.zwischen;
        if (!zw || !(zw.stellungen > 0)) out.push("Durchsicht 3rd, der Stamm zwischen Kamera und Spieler: keine Stellung (Vorbedingung)");
        else if (zw.wirkt < zw.stellungen) out.push(`Durchsicht 3rd: der Stamm zwischen Kamera und Spieler steht in ${zw.stellungen - zw.wirkt} von ${zw.stellungen} Stellungen (Gewicht bis ${zw.wMax})`);
    }
    return out;
}
const ID_RE = /\b(?:baum|haus|fahrzeug|tor|klinge|welt|ruestung|trank|koerper|reittier)_[a-z0-9_]+/;
const TELE_RE = /\b[a-zA-Z]+=\S|FOUNDRY|\bSeed\b|Slots? übersprungen|export-settlement|BLOCKIERT|\["[a-z_]+",|op_exception|budget_exceeded|unknown_op/;
function kanalVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    for (const z of m.zeilen || []) {
        if (/^> /.test(z)) continue;
        if (ID_RE.test(z)) out.push(`interne id im Chat („${z.slice(0, 80)}")`);
        else if (TELE_RE.test(z)) out.push(`Telemetrie im Chat („${z.slice(0, 80)}")`);
    }
    if (!m.siedlungImLog) out.push("die Siedlungs-Zahlen fehlen im Log (Vorbedingung: das Log trägt sie)");
    return out;
}
function kiVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (/^Aktiv/.test(m.status || "")) out.push(`der Status sagt „${m.status}" ohne Dienst`);
    else if (!/läuft nicht/.test(m.status || "")) out.push(`der Status nennt die Ursache nicht („${(m.status || "").slice(0, 70)}")`);
    if (!m.ohneSchluessel) out.push("ohne Schlüssel schweigt der Chat");
    else if (!/Schlüssel/.test(m.ohneSchluessel)) out.push(`ohne Schlüssel nennt der Chat ihn nicht („${m.ohneSchluessel.slice(0, 70)}")`);
    if (!(m.proxyUrl || "").startsWith(m.ursprung)) out.push(`der Proxy fragt einen fremden Server (${m.proxyUrl})`);
    if (!/Proxy fehlt/.test(m.proxyFehler || "")) out.push(`der fehlende Proxy heißt „${(m.proxyFehler || "").slice(0, 70)}"`);
    return out;
}
function dorfVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.buch) return ["Buch kalt (Vorbedingung)"];
    if (!(m.haeuser > 0)) return ["kein Haus gegründet"];
    if (m.hinten > 0) out.push(`${m.hinten} Häuser hinter dem Spieler (cos ${m.cosHinten.join(" / ")})`);
    if (m.ausserBild > 0) out.push(`${m.ausserBild} Häuser außerhalb des Bildwinkels`);
    if (!m.ersatz) out.push(`ein gesperrter Slot fällt (kein Ersatz-Ort: ${m.ersatzGrund})`);
    else if (m.ersatzImBau) out.push("der Ersatz-Ort liegt im Bau");
    if (m.mpAbweichung == null) out.push(`der Mitspieler: kein Vergleich (Häuser ${(m.mpHaeuser || []).join(" / ")})`);
    else if (m.mpAbweichung > 1) out.push(`beim Mitspieler steht das Dorf ${m.mpAbweichung} m daneben (Häuser ${(m.mpHaeuser || []).join(" / ")})`);
    return out;
}

// ── DIE STATISCHE WAND (Node, kommentarfrei). Liefert [name, ok, detail]. ──
function wand(src, html) {
    const nc = ohneKommentare(src);
    const fallback = fnBody(nc, /\n {4}_chatHandleConversationalFallback\(command, appendChatOutput\) \{/) || "";
    const hilfe = fnBody(nc, /\n {4}_hilfeZeilen\(\) \{/) || "";
    const siedlung = fnBody(nc, /\n {4}async spawnSettlement\(opts\) \{/) || "";
    const dorfOp = (nc.match(/spawn_village: \(\[positionNode, seed[^\]]*\], ctx\) => \{[\s\S]*?\n {12}\},/) || [""])[0];
    const autoDorf = fnBody(nc, /\n {4}_autoSettlementSpawnCell\(cx, cz, info\) \{/) || "";
    const kamera = fnBody(nc, /\n {4}_loopCamera\(currentTime\) \{/) || "";
    const stoff = fnBody(nc, /\n {4}_foundryTreeMaterial\(kind, mp, wiegen\) \{/) || "";
    const ladeIdx = html.indexOf('id="ladeschirm"');
    const ladeTag = ladeIdx >= 0 ? html.slice(html.lastIndexOf("<", ladeIdx), html.indexOf(">", ladeIdx) + 1) : "";
    // die Proben durch die Bildmitte (Gegenprüfung Runde 2): jede nimmt den EINEN Strahl
    const kreuzOhne = [
        "_pickArchitectureAtCrosshair()",
        "_raycastWorldHit(maxDist = 30)",
        "_resolvePhantomTarget()",
        "_pickCreatureAtCrosshair()",
        "_pickScatterAtCrosshair()",
        "_hasMagnifyingInSight()",
        "_blickZiel(maxDist)",
        "_kampfKlingenAchse(ox, oy, oz, reach)",
    ].filter((sig) => {
        const b = fnBody(nc, new RegExp("\\n {4}" + sig.replace(/[()=]/g, (c) => "\\" + c) + " \\{")) || "";
        return !/this\._fadenkreuzStrahl\(\)/.test(b) || /getWorldDirection\(/.test(b);
    });
    const durchNode = fnBody(nc, /\n {4}_kameraDurchsichtNode\(T\) \{/) || "";
    return [
        [
            "W1 die Hilfe liest die EINEN Tafeln (`_hilfeZeilen`: chatDslPatterns · chatSystemPatterns · KEYBINDING_LABELS), der Satz für Unbekanntes trägt keine Liste von Hand",
            /this\.chatDslPatterns/.test(hilfe) &&
                /this\.chatSystemPatterns/.test(hilfe) &&
                /KEYBINDING_LABELS/.test(hilfe) &&
                !/'Setze Wetter rainy'/.test(fallback),
        ],
        [
            "W2 der Ladeschirm steht im HTML vor allem anderen sichtbar (kein `hidden`), das Spiel nimmt ihn nur über `_ankunftsBild`/`_ladeschirmWeg`, und `_ankunftsBild` fragt, was dem Weltbild fehlt (`_weltbildFehlt`)",
            ladeIdx >= 0 &&
                !/\bhidden\b/.test(ladeTag) &&
                /this\._ankunftsBild\(\)/.test(fnBody(nc, /\n {4}_loopRender\(currentTime\) \{/) || "") &&
                /this\._weltbildFehlt\(\)/.test(fnBody(nc, /\n {4}_ankunftsBild\(\) \{/) || ""),
        ],
        [
            "W3 die Hotbar trägt im Konstruktor keinen Bauplan-Namen (der Start-Gurt liest den Katalog: `_startGurt`)",
            /hotbar: \[null, null, null, null, null, null, null, null, null\]/.test(nc) && /_katalogSichtbar/.test(fnBody(nc, /\n {4}_startGurt\(\) \{/) || ""),
        ],
        [
            "W4 das Dorf misst seinen Plan (`_siedlungsAnker`), keine Schätzung `_structureSpawnPos(\"haus_basis\")` in spawnSettlement, spawn_village und dem Welt-Dorf (`_autoSettlementSpawnCell`); spawn_village trägt den Blick des Sprechers",
            /this\._siedlungsAnker\(plan/.test(siedlung) &&
                !/_structureSpawnPos/.test(siedlung) &&
                !/_structureSpawnPos/.test(dorfOp) &&
                /blick/.test(dorfOp) &&
                /this\._siedlungsAnker\(plan/.test(autoDorf) &&
                !/_structureSpawnPos/.test(autoDorf),
        ],
        [
            "W5 die 3rd-Kamera rückt nur vor Boden und Bau ein (der Strahl in `_loopCamera` geht `durchPflanzen`, keine Kronen-Grenze), jeder Pflanzen-Stoff trägt die Durchsicht (`_kameraDurchsichtNode` in `_foundryTreeMaterial`)",
            /durchPflanzen: true/.test(kamera) && !/_kameraKronenGrenze/.test(kamera) && /this\._kameraDurchsichtNode\(/.test(stoff),
        ],
        [
            "W6 kein rohes Programm und keine Siedlungs-Zahl im Spieler-Chat (kein `JSON.stringify(reply.program)`, kein `Seed ${` an `_chatEcho`)",
            !/JSON\.stringify\(reply\.program\)/.test(nc) && !/_chatEcho\?*\.?\(msg\)/.test(siedlung),
        ],
        [
            `W7 der Strahl des Fadenkreuzes ist EINER (\`_fadenkreuzStrahl\`): jede Probe durch die Bildmitte nimmt ihn und rechnet keine eigene Richtung ab der Kamera (\`getWorldDirection\`)${kreuzOhne.length ? " — ohne: " + kreuzOhne.join(", ") : ""}`,
            kreuzOhne.length === 0,
        ],
        [
            "W8 die Durchsicht rechnet die EINE Formel (`_durchsichtGewicht` in `_kameraDurchsichtNode`, die Linse rechnet sie über `DURCHSICHT_ZAHLEN`), das Ziel im 1st ist das Auge ohne Radius (kein `egoM`)",
            /AnazhRealm\._durchsichtGewicht\(/.test(durchNode) && /AnazhRealm\.DURCHSICHT_ZAHLEN = /.test(nc) && !/egoM/.test(nc),
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

// ── DIE PROBEN IN DER SEITE (r = die Welt). ──
async function probe(arg) {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const out = {};
    const dl0 = performance.now() + 90000;
    while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl0) await sleep(100);
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
    const zeilen = () => Array.from(document.querySelectorAll("#chat-output > div")).map((d) => d.textContent);
    const buch = await r._foundryAwaitBook(45000);
    await tick(30, 30);
    // ── L2a: das erste Weltbild ──
    try {
        const m = { gestartet: false, faelle: {}, ohneFall: {} };
        out.lade = m;
        const ls = document.getElementById("ladeschirm");
        m.nachBootWeg = !ls || ls.hidden || ls.classList.contains("weg");
        if (ls && typeof r._ankunftsBild === "function") {
            // Die Welt wächst, bis sie steht (das Weltbild ist fertig: `_weltbildFehlt` leer) — höchstens 90 s.
            if (typeof r._weltbildFehlt === "function") {
                const dlW = performance.now() + 90000;
                while (r._weltbildFehlt().length && performance.now() < dlW) await tick(5, 60);
                m.fehltNachBoot = r._weltbildFehlt();
            }
            const stand = () => (document.getElementById("ladeschirm-stand") || {}).textContent || "";
            // ein Fall: den Ladeschirm wieder stellen, die Lücke schaffen, `_ankunftsBild` fragen, die Lücke schließen
            const fall = (name, schaffe, heile, vorbereiten) => {
                ls.hidden = false;
                ls.classList.remove("weg");
                st._weltbildDa = 0;
                st._weltbildLuecke = null;
                st._weltbildErsteFrage = null;
                // der Puffer rollt (maxLogEntries): gesucht wird in seinem Ende, vorher und nachher
                const warnt = () => st.logBuffer.slice(-30).filter((z) => /erste Weltbild steht ohne/.test(z)).length;
                const w0 = warnt();
                schaffe();
                if (vorbereiten) vorbereiten();
                r._ankunftsBild();
                const weg = ls.classList.contains("weg");
                m.faelle[name] = { weg, stand: stand(), warn: Math.max(0, warnt() - w0) };
                heile();
            };
            const nichts = () => {};
            // (1) ohne Boden: der Spieler in einem Chunk ohne Mesh
            const merkChunk = st.lastPlayerVoxelChunk;
            fall("ohneBoden", () => (st.lastPlayerVoxelChunk = { cx: 9000, cz: 9000 }), () => (st.lastPlayerVoxelChunk = merkChunk));
            // (2) ein Baum der Mesh-Zone ohne Gestalt (sein Mesh, seine Instanz beiseite)
            const pm = st.playerMesh.position;
            const baum = st.architectures
                .filter((a) => a && /^baum_/.test(a.type || "") && r._archIsRendered(a))
                .sort((a, b) => Math.hypot(a.position.x - pm.x, a.position.z - pm.z) - Math.hypot(b.position.x - pm.x, b.position.z - pm.z))[0];
            let merkBaum = null;
            const baumWeg = () => {
                merkBaum = { mesh: baum.mesh, instanced: baum.instanced };
                baum.mesh = null;
                baum.instanced = null;
            };
            const baumHer = () => {
                baum.mesh = merkBaum.mesh;
                baum.instanced = merkBaum.instanced;
            };
            if (baum) {
                m.baumD = +Math.hypot(baum.position.x - pm.x, baum.position.z - pm.z).toFixed(1);
                fall("baumUngebaut", baumWeg, baumHer);
            } else {
                const n = st.architectures.filter((a) => a && /^baum_/.test(a.type || "")).length;
                m.ohneFall.baumUngebaut = m.ohneFall.lueckeRuht = m.ohneFall.lueckeFlackert = `kein gezeichneter Baum in der Welt (${n} Baum-Einträge, keiner gezeichnet)`;
            }
            // (3) die Streu-Region des Spielers wartet auf ihr Asset. Die Region steht nach dem Boot IMMER: der Spieler-Ort ist
            // stets in Reichweite (`_streuRegionInReichweite`), und das Weltbild gilt erst als fertig, wenn sie gebaut ist — fehlt
            // sie, ist das der Täter beim Namen (Befund 09.10.: bei langsamem Takt lief der Streamer nie, `_weltbildFehlt` las
            // die fehlende Regionen-Karte als „nichts wartet", der Ladeschirm wich ohne Wald und der Fall fehlte).
            const SC = r.constructor.SCATTER;
            const regKey = `${Math.floor(pm.x / SC.regionM)},${Math.floor(pm.z / SC.regionM)}`;
            const reg = st.scatterRegions ? st.scatterRegions.get(regKey) : null;
            if (reg) fall("streuWartet", () => (reg._deferredFoundry = true), () => delete reg._deferredFoundry);
            else
                m.ohneFall.streuWartet =
                    `die Streu-Region des Spielers (${regKey}) steht nach dem Boot nicht (Regionen-Karte: ` +
                    (st.scatterRegions ? `${st.scatterRegions.size} Regionen` : "keine, der Streamer lief nie") +
                    (st.atmosphere && st.atmosphere.gpuScatter === false ? ", die Streu ist aus" : "") +
                    (m.fehltNachBoot && m.fehltNachBoot.length ? `; nach dem Boot fehlt ${m.fehltNachBoot.join(" · ")})` : "; das Weltbild galt ohne sie als fertig)");
            // (3b) der Streamer lief noch nie (keine Regionen-Karte) — der Fall des Befunds, in jedem Boot hergestellt
            const merkKarte = st.scatterRegions;
            fall("streuNie", () => delete st.scatterRegions, () => (st.scatterRegions = merkKarte));
            // (4) die Karte eines fernen Baums ist offen
            fall(
                "karteOffen",
                () => (r._impostorBakeQueue = (r._impostorBakeQueue || []).concat(["linse:karte"])),
                () => (r._impostorBakeQueue = (r._impostorBakeQueue || []).filter((k) => k !== "linse:karte"))
            );
            // (5) alles steht
            fall("allesSteht", nichts, nichts);
            // (6) eine Lücke ruht (dieselbe Lücke länger als WELTBILD_STILL_MS): der Ladeschirm weicht LAUT
            if (baum)
                fall("lueckeRuht", baumWeg, baumHer, () => {
                    const sig = typeof r._weltbildFehlt === "function" ? r._weltbildFehlt().join(" · ") : "";
                    st._weltbildLuecke = sig;
                    st._weltbildLueckeSeit = performance.now() - (r.constructor.WELTBILD_STILL_MS || 0) - 1;
                });
            // (7) eine Lücke flackert (Gegenprüfung Runde 2: ihre Zahl wechselt je Frage, die Ruhe-Uhr beginnt je Wechsel neu)
            // seit über einer Minute: der Ladeschirm weicht LAUT
            if (baum)
                fall("lueckeFlackert", baumWeg, baumHer, () => {
                    st._weltbildLuecke = "eine andere Zahl";
                    st._weltbildErsteFrage = performance.now() - (r.constructor.WELTBILD_DECKEL_MS || 60000) - 1;
                });
            // (8) Tasten hinter dem Ladeschirm (Gegenprüfung Runde 2: W lief den Spieler vom Ankunfts-Ort, Enter öffnete das
            // Gespräch dahinter): solange er steht, gehört keine Taste der Welt
            {
                ls.hidden = false;
                ls.classList.remove("weg");
                if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
                st.keys.w = false;
                document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "w", code: "KeyW", bubbles: true }));
                const wLief = st.keys.w === true;
                document.body.dispatchEvent(new KeyboardEvent("keyup", { key: "w", code: "KeyW", bubbles: true }));
                document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
                const ae = document.activeElement;
                if (ae && ae.id === "chat-input") ae.blur();
                // jeder Eingang (Integration V18.536, Gelb 2 der dritten Gegenprüfung): Strg+K öffnete die Omnibox hinter
                // dem Ladeschirm, sie führte Befehle aus
                const omni = document.getElementById("omnibox-overlay");
                const omniVor = omni ? omni.hidden : null;
                if (omni) omni.hidden = true;
                document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK", ctrlKey: true, bubbles: true }));
                const omniAuf = omni ? !omni.hidden : null;
                if (omni) omni.hidden = omniVor;
                m.tastenHinter = { w: wLief, enter: ae ? ae.id || ae.tagName : null, omnibox: omniAuf };
            }
            // (9) DER LADESCHIRM WEICHT GANZ (0710-11, OMEN Werkbank): nach `_ladeschirmWeg` (Klasse `weg`, nach 750 ms
            // `hidden`) fällt er aus dem Layout — `display: none`, keine laufende Animation. Befund: `#ladeschirm` setzt
            // `display: flex`, ohne `[hidden]`-Regel lag er nach der Ankunft unsichtbar und bildschirmfüllend mit der endlosen
            // Glut-Animation über der Leinwand (an der Mess-Wiese die render-Phase 3,00/3,10 → 2,85/2,85 ms ohne ihn).
            {
                ls.hidden = false;
                ls.classList.remove("weg");
                r._ladeschirmWeg();
                await sleep(1000);
                const cs = getComputedStyle(ls);
                const laufen = ls.getAnimations
                    ? ls.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length
                    : null;
                m.weichtGanz = { hidden: ls.hidden, display: cs.display, animationen: laufen };
            }
            await sleep(800);
            if (!st._weltbildDa) st._weltbildDa = performance.now();
            ls.classList.add("weg");
        } else m.faelle = { fehler: ls ? "kein _ankunftsBild" : "kein Ladeschirm" };
        m.gestartet = true;
    } catch (e) {
        out.lade = Object.assign(out.lade || {}, { err: (e && e.stack) || String(e) });
    }
    // ── L1: das Fadenkreuz ──
    try {
        const m = { gestartet: false };
        out.kreuz = m;
        const k = document.getElementById("fadenkreuz");
        m.da = !!k;
        const sicht = () => {
            if (!k) return false;
            const cs = getComputedStyle(k);
            return cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0.05;
        };
        if (k) {
            const b = k.getBoundingClientRect();
            m.dx = +(b.x + b.width / 2 - innerWidth / 2).toFixed(1);
            m.dy = +(b.y + b.height / 2 - innerHeight / 2).toFixed(1);
            m.sichtbar = sicht();
            r.toggleDrawer("werkstatt");
            await sleep(100);
            m.mitSchublade = sicht();
            r.closeAllDrawers();
            await sleep(100);
            m.nachSchublade = sicht();
        }
        m.gestartet = true;
    } catch (e) {
        out.kreuz = Object.assign(out.kreuz || {}, { err: (e && e.stack) || String(e) });
    }
    // ── L2b: die Hilfe ──
    try {
        const m = { gestartet: false, antworten: {} };
        out.hilfe = m;
        const beispiele = r.chatDslPatterns.map((p) => p.example).concat(r.chatSystemPatterns.map((p) => p.example));
        const v1 = [];
        for (const p of r.chatDslPatterns.concat(r.chatSystemPatterns)) if (Array.isArray(p.hilfe)) v1.push(...p.hilfe);
        const tasten = Object.values(r.constructor.KEYBINDING_LABELS || {});
        for (const wort of ["hilfe", "help", "?"]) {
            const n0 = zeilen().length;
            r.processChatCommand(wort);
            const neu = zeilen().slice(n0 + 1);
            const text = neu.join("\n");
            m.antworten[wort] = {
                erste: (neu[0] || "").slice(0, 80),
                unbekannt: /Unbekannter Befehl/.test(text),
                fehlt: beispiele.filter((b) => !text.includes(b)),
                tastenFehlen: tasten.filter((t) => !text.includes(t)),
                v1: /pflanz mir|bau mir/.test(text),
            };
        }
        const n1 = zeilen().length;
        r.processChatCommand("blubbern sie laut");
        const unb = zeilen().slice(n1 + 1).join(" ");
        m.unbekanntListe = /Setze Wetter rainy|DSL-Befehle:/.test(unb);
        m.v1Saetze = v1.length;
        m.gestartet = true;
    } catch (e) {
        out.hilfe = Object.assign(out.hilfe || {}, { err: (e && e.stack) || String(e) });
    }
    // ── L3: das Gespräch ──
    try {
        const m = { gestartet: false };
        out.gespraech = m;
        const ci = document.getElementById("chat-input");
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
        m.enterFokus = document.activeElement ? document.activeElement.id || document.activeElement.tagName : null;
        if (m.enterFokus !== "chat-input") ci.focus();
        ci.dispatchEvent(new KeyboardEvent("keydown", { key: "w", code: "KeyW", bubbles: true }));
        m.wImFeld = st.keys.w === true;
        const n0 = zeilen().length;
        ci.value = "setze uhrzeit mittag";
        ci.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
        ci.dispatchEvent(new KeyboardEvent("keypress", { key: "Enter", code: "Enter", bubbles: true }));
        m.gesendet = zeilen().slice(n0).some((z) => z === "> setze uhrzeit mittag");
        m.nachSenden = document.activeElement ? document.activeElement.id || document.activeElement.tagName : null;
        const ziel = document.activeElement || document.body;
        ziel.dispatchEvent(new KeyboardEvent("keydown", { key: "w", code: "KeyW", bubbles: true }));
        m.wNachSenden = st.keys.w === true;
        ziel.dispatchEvent(new KeyboardEvent("keyup", { key: "w", code: "KeyW", bubbles: true }));
        ci.value = "";
        ci.focus();
        ci.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
        m.nachEsc = document.activeElement ? document.activeElement.id || document.activeElement.tagName : null;
        if (document.activeElement === ci) ci.blur();
        // Enter auf einem fokussierten Knopf gehört dem Knopf (Gegenprüfung Runde 1: er öffnete zusätzlich den Chat und
        // nahm ihm den Fokus — die Tastatur-Bedienung brach)
        const knopf = document.getElementById("camera-mode-toggle") || document.querySelector("button");
        if (knopf) {
            knopf.focus();
            knopf.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
            const a = document.activeElement;
            m.enterAufKnopf = a === knopf ? "knopf" : a ? a.id || a.tagName : null;
            if (a && a.blur) a.blur();
        }
        m.gestartet = true;
    } catch (e) {
        out.gespraech = Object.assign(out.gespraech || {}, { err: (e && e.stack) || String(e) });
    }
    // ── L7: der Start-Gurt ──
    try {
        const m = { gestartet: false };
        out.gurt = m;
        m.buch = !!(buch && buch.ok);
        m.hotbar = st.hotbar.slice();
        const f = r._foundry;
        const artVon = (name) => {
            const pr = r._foundryPresetFor(name);
            const rec = pr && f && f.recipes ? f.recipes[pr] : null;
            return rec && typeof rec.kind === "string" ? rec.kind : null;
        };
        const AD = r.constructor.ALT_DOPPEL || {};
        m.eintraege = m.hotbar.filter(Boolean).map((name) => {
            const bp = st.blueprints[name];
            return {
                name,
                sichtbar: !!bp && r._katalogSichtbar(name, bp),
                altDoppel: AD[name] || null,
                art: bp ? artVon(name) : null,
                platzierbar: !!bp && r._isPlaceableBlueprint(bp),
            };
        });
        const arten = new Set();
        for (const name of Object.keys(st.blueprints))
            if (r._katalogSichtbar(name) && r._isPlaceableBlueprint(st.blueprints[name])) {
                const a = artVon(name);
                if (a) arten.add(a);
            }
        m.katalogArten = Array.from(arten);
        m.gestartet = true;
    } catch (e) {
        out.gurt = Object.assign(out.gurt || {}, { err: (e && e.stack) || String(e) });
    }
    // ── LK: die Kamera und die Pflanzen ──
    try {
        const m = { gestartet: false, wege: {} };
        out.kamera = m;
        const pl = st.architectures.find((a) => a && a.type === "start_plattform");
        const P = pl ? pl.position : st.playerMesh.position;
        const natur = (a) => (typeof r._istNatur === "function" ? r._istNatur(a) : /^(baum_|busch_|grown_)/.test((a && a.type) || ""));
        const naheBaeume = () =>
            st.architectures
                .filter((a) => a && /^baum_/.test(a.type) && a.blockerAABBs && a.blockerAABBs.length)
                .sort((a, b) => Math.hypot(a.position.x - P.x, a.position.z - P.z) - Math.hypot(b.position.x - P.x, b.position.z - P.z));
        let baeume = naheBaeume();
        const dlB = performance.now() + 60000;
        while (!baeume.length && performance.now() < dlB) {
            await tick(5, 40);
            baeume = naheBaeume();
        }
        const baum = baeume[0] || null;
        if (baum) {
            m.baum = baum.type;
            m.weltSkala = +r._foundryWorldScaleMatrix(r._foundryPresetForEntry(baum)).elements[0].toFixed(3);
            // die Skala des Stamm-Blockers gegen die Vorlage: die Breiten-Summe der Blocker-Boxen gegen dieselben festen Teile
            // im Vorlagen-Maß (`_blockerComputePartAABB` ohne Welt-Skala)
            const bp = st.blueprints[baum.type];
            const vorlage = (bp.parts || [])
                .filter((p) => r._isPartSolid(p))
                .map((p) => r._blockerComputePartAABB(baum, p))
                .filter(Boolean);
            const breite = (bs) => bs.reduce((s2, b) => s2 + (b.maxX - b.minX), 0);
            m.stammSkala = +(breite(baum.blockerAABBs.slice(0, vorlage.length)) / Math.max(1e-6, breite(vorlage))).toFixed(3);
            // DIE WEGE: deterministische Linien durch den Wald der Ankunft (je an einem Baum vorbei, Richtung aus einer festen
            // Folge), 30 m lang.
            let same = 20251007;
            const zufall = () => ((same = (Math.imul(same, 1103515245) + 12345) >>> 0) / 4294967296);
            const linien = [];
            for (let i = 0; i < 16 && baeume.length; i++) {
                const b = baeume[Math.floor(zufall() * Math.min(baeume.length, 40))];
                const gier = zufall() * Math.PI * 2;
                linien.push({ x0: b.position.x - Math.sin(gier) * 15 + 2.5, z0: b.position.z - Math.cos(gier) * 15, gier });
            }
            const hh = (x, z) => r.getTerrainHeightAt(x, z);
            // Die Pflanzen beiseite (die Blocker der Natur-Einträge) und die Kronen-Grenze eines Vor-Stands neutral: das Soll,
            // das nur Boden und Bau erzwingen. Der Täter beim Namen: Stamm (Blocker) oder Krone (die Kronen-Grenze).
            const pflanzen = st.architectures.filter((a) => a && natur(a) && a.blockerAABBs);
            const hatKronen = typeof r._kameraKronenGrenze === "function";
            const ohneStaemme = (an) => {
                for (const a of pflanzen) {
                    if (an) {
                        a.__lkBlocker = a.blockerAABBs;
                        a.blockerAABBs = null;
                    } else if (a.__lkBlocker) {
                        a.blockerAABBs = a.__lkBlocker;
                        delete a.__lkBlocker;
                    }
                }
            };
            const ohneKronen = (an) => {
                if (!hatKronen) return;
                if (an) r._kameraKronenGrenze = () => 1;
                else delete r._kameraKronenGrenze; // die Methode der Klasse gilt wieder
            };
            let T = 1000;
            const arm = () => {
                const c = st.camera.position;
                const p = st.playerMesh.position;
                return Math.hypot(c.x - p.x, c.y - (p.y + 1.0), c.z - p.z);
            };
            // eine Kamera-Stellung bis zur Ruhe (ein gleitender Arm hat Zeit, hinauszufahren)
            const ruhig = () => {
                for (let i = 0; i < 10; i++) r._loopCamera((T += 0.1));
                return arm();
            };
            const med = (a) => (a.length ? +a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)].toFixed(2) : null);
            // EIN WEG zu Fuß (3rd, Neigung 0) oder im Ritt (die Verfolger-Kamera des GT): `stelle(x, z, gier)` setzt Spieler/Wagen.
            const weg = (name, stelle, schritt, sprungM, bildM) => {
                const z = { proben: 0, pflanzeHaelt: 0, taeter: [], sprungM };
                const ist = [];
                const soll = [];
                const taeter = new Set();
                for (const L of linien) {
                    for (let s = 0; s <= 30; s += schritt) {
                        const x = L.x0 + Math.sin(L.gier) * s;
                        const zz = L.z0 + Math.cos(L.gier) * s;
                        if (!Number.isFinite(hh(x, zz))) continue;
                        stelle(x, zz, L.gier);
                        ohneStaemme(true);
                        ohneKronen(true);
                        const aSoll = ruhig();
                        ohneKronen(false);
                        const aOhneStamm = ruhig();
                        ohneStaemme(false);
                        const aIst = ruhig();
                        z.proben++;
                        ist.push(aIst);
                        soll.push(aSoll);
                        if (aIst < aSoll - 0.3) {
                            z.pflanzeHaelt++;
                            if (aOhneStamm < aSoll - 0.3) taeter.add("Krone (`_kameraKronenGrenze`)");
                            if (aIst < aOhneStamm - 0.3) taeter.add("Stamm (Natur-Blocker am Kamera-Strahl)");
                        }
                    }
                }
                z.armIst = med(ist);
                z.armSoll = med(soll);
                z.unter3 = ist.filter((a) => a < 3).length;
                z.taeter = Array.from(taeter);
                // DIE SPRÜNGE: dieselben Linien im Takt eines Bilds (1/60 s), einmal ohne die Pflanzen (Soll), einmal mit (Ist):
                // ein Sprung > sprungM je Bild, den Boden und Bau nicht erzwingen, ist ein Pflanzen-Sprung; ein Sprung HINAUS
                // ist nie erlaubt (der Arm gleitet).
                const fahre = (mitPflanzen) => {
                    let n = 0;
                    let hinaus = 0;
                    if (!mitPflanzen) {
                        ohneStaemme(true);
                        ohneKronen(true);
                    }
                    for (const L of linien.slice(0, 8)) {
                        let vor = null;
                        for (let s = 0; s <= 30; s += bildM) {
                            const x = L.x0 + Math.sin(L.gier) * s;
                            const zz = L.z0 + Math.cos(L.gier) * s;
                            if (!Number.isFinite(hh(x, zz))) continue;
                            stelle(x, zz, L.gier);
                            r._loopCamera((T += 1 / 60));
                            const a = arm();
                            if (vor != null && Math.abs(a - vor) > sprungM) {
                                n++;
                                if (a > vor) hinaus++;
                            }
                            vor = a;
                        }
                        ruhig();
                    }
                    if (!mitPflanzen) {
                        ohneKronen(false);
                        ohneStaemme(false);
                    }
                    return { n, hinaus };
                };
                const jSoll = fahre(false);
                const jIst = fahre(true);
                z.spruenge = jIst.n;
                z.spruengeSoll = jSoll.n;
                z.spruengePflanze = Math.max(0, jIst.n - jSoll.n);
                z.hinausSprung = Math.max(0, jIst.hinaus - jSoll.hinaus);
                m.wege[name] = z;
            };
            r.setCameraMode("third");
            st.pitch = 0;
            weg(
                "fuss",
                (x, zz, gier) => {
                    st.playerMesh.position.set(x, hh(x, zz) + 1.0, zz);
                    st.yaw = gier;
                },
                1.0,
                1.0,
                0.1
            );
            // DER RITT: ein GT, aufgesessen; der Wagen fährt die Linien (die Verfolger-Kamera hinter ihm, Kern-Gesetz kamera)
            const gt = r.spawnArchitecture("fahrzeug_gt", { x: P.x + 30, y: hh(P.x + 30, P.z) + 0.5, z: P.z }, { silent: true, precise: true });
            if (gt) {
                const dlG = performance.now() + 45000;
                while (!gt.instanced && !gt.mesh && performance.now() < dlG) {
                    r._rebuildArchitectureMesh(gt);
                    if (gt.instanced || gt.mesh) break;
                    await sleep(200);
                }
                const mr = r.mountArchitecture(gt);
                if (mr && mr.ok) {
                    weg(
                        "ritt",
                        (x, zz, gier) => {
                            const y = hh(x, zz) + 0.5;
                            gt.position.x = x;
                            gt.position.y = y;
                            gt.position.z = zz;
                            gt._rideYaw = gier;
                            st.yaw = gier;
                            st.playerMesh.position.set(x, y + 0.5, zz);
                        },
                        1.0,
                        2.0,
                        0.25
                    );
                    r.dismountArchitecture();
                } else m.wege.ritt = { proben: 0, grund: "Aufsitzen scheiterte" };
                r.removeArchitecture(gt);
            } else m.wege.ritt = { proben: 0, grund: "kein GT" };
            // DIE DURCHSICHT: jeder Pflanzen-Stoff in der Szene (Foundry-Art Laub · Blatt-Karte · Rinde · Stiel) trägt sie im
            // maskNode, der Schatten-Pass liest seinen eigenen maskShadowNode (die Durchsicht schneidet nie den Schatten).
            const PFLANZE = new Set(["foliage", "foliageTex", "bark", "stem"]);
            const stoffe = new Set();
            st.scene.traverse((o) => {
                const mats = o && o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
                for (const mt of mats) if (mt && mt.userData && PFLANZE.has(mt.userData.foundryKind)) stoffe.add(mt);
            });
            m.stoffe = stoffe.size;
            const ohne = Array.from(stoffe).filter((mt) => !(mt.maskNode && mt.maskNode.isNode));
            m.stoffeOhne = ohne.length;
            m.stoffeOhneArten = Array.from(new Set(ohne.map((mt) => mt.userData.foundryKind)));
            m.schattenGeschnitten = Array.from(stoffe).filter((mt) => mt.maskNode && mt.maskNode.isNode && !(mt.maskShadowNode && mt.maskShadowNode.isNode)).length;
            // das Ziel der Durchsicht ist der Blickpunkt (3rd: die Brust, zu Fuß um die Schulter versetzt) — gelesen, wo die
            // Uniform es trägt: höchstens KAMERA_SCHULTER_M neben der Brust, und AUF dem Blick der Kamera (Integration V18.536,
            // Gelb 1 der dritten Gegenprüfung: mit der Brust als Ziel stand die Ebene des Fadenkreuz-Strahls schräg, bei kurzem
            // Arm begann er 0,52–0,78 m hinter dem Blickpunkt)
            const lu = st.lodUniforms;
            if (lu && lu.uKamZiel) {
                st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
                r._loopCamera((T += 0.1));
                const v = lu.uKamZiel.value;
                const p = st.playerMesh.position;
                m.zielAbstand = +Math.hypot(v.x - p.x, v.y - (p.y + 1.0), v.z - p.z).toFixed(2);
                m.zielFolgt = m.zielAbstand <= (r.constructor.KAMERA_SCHULTER_M || 0) + 0.05;
            }
            // DAS FADENKREUZ IN 3RD (Gegenprüfung Runde 1: es stand auf dem Kopf der Figur): der Abstand der Brust vom Strahl
            // durch die Bildmitte
            {
                st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
                st.pitch = 0;
                ruhig();
                const c = st.camera.position;
                const f = st.camera.getWorldDirection(new THREE.Vector3());
                const b = new THREE.Vector3(st.playerMesh.position.x - c.x, st.playerMesh.position.y + 1.0 - c.y, st.playerMesh.position.z - c.z);
                m.kreuzAbstand = +b.cross(f).length().toFixed(2);
            }
            // DER STRAHL DES FADENKREUZES (Gegenprüfung Runde 2, ROT 1): der Spieler 2,5 m vor einem Baum, der Blick von ihm weg
            // — der Baum steht zwischen Kamera und Spieler und ist durchsichtig. Kein Treffer-Strahl durch die Bildmitte trifft
            // HINTER dem Spieler: Bau-Pick, Welt-Treffer (Pfeil · Graben · Aufschütten), Blick-Ziel, Bau-Phantom, Kreatur-Pick
            // (eine Kreatur zwischen Kamera und Spieler) — und eine Kreatur VOR ihm trifft er.
            {
                const fk = (m.fadenkreuz = { stellungen: 0, hinten: {}, kreaturVorn: 0, kreaturVornProben: 0 });
                const zaehl = (k) => (fk.hinten[k] = (fk.hinten[k] || 0) + 1);
                const kreatur = (st.creatures || []).find((c) => c && c.position && typeof c.traverse === "function");
                fk.kreatur = !!kreatur;
                const kMerk = kreatur ? kreatur.position.clone() : null;
                const kBox = new THREE.Box3();
                // die Kreatur so stellen, dass die Mitte ihres Leibs auf dem Strahl der Bildmitte liegt, s Meter vor der Kamera
                const kreaturAuf = (s) => {
                    const c = st.camera.position;
                    const d = st.camera.getWorldDirection(new THREE.Vector3());
                    kreatur.updateMatrixWorld(true);
                    kBox.setFromObject(kreatur);
                    const mitte = kBox.getCenter(new THREE.Vector3());
                    kreatur.position.add(new THREE.Vector3(c.x + d.x * s, c.y + d.y * s, c.z + d.z * s).sub(mitte));
                    kreatur.updateMatrixWorld(true);
                };
                for (const b of baeume.slice(0, 12))
                    for (let k = 0; k < 8; k++) {
                        const g = (k / 8) * Math.PI * 2;
                        const x = b.position.x + Math.sin(g) * 2.5;
                        const zz = b.position.z + Math.cos(g) * 2.5;
                        if (!Number.isFinite(hh(x, zz))) continue;
                        st.playerMesh.position.set(x, hh(x, zz) + 1.0, zz);
                        st.yaw = g;
                        st.pitch = 0;
                        ruhig();
                        fk.stellungen++;
                        // das Ziel der Kamera auf ihrem Blick: sein Abstand von der Achse durch die Bildmitte (jeder Arm)
                        {
                            const kz = st._kamZiel;
                            const c = st.camera.position;
                            if (kz && Math.abs(kz.ex - c.x) + Math.abs(kz.ey - c.y) + Math.abs(kz.ez - c.z) < 1e-6) {
                                const f = st.camera.getWorldDirection(new THREE.Vector3());
                                const a = new THREE.Vector3(kz.x - c.x, kz.y - c.y, kz.z - c.z).cross(f).length();
                                fk.zielAchse = Math.max(fk.zielAchse || 0, +a.toFixed(3));
                            }
                        }
                        const p = st.playerMesh.position;
                        const fx = Math.sin(g);
                        const fz = Math.cos(g);
                        const hinter = (q) => !!q && (q.x - p.x) * fx + (q.z - p.z) * fz < -0.2;
                        const pick = r._pickArchitectureAtCrosshair();
                        if (pick && hinter(pick.point)) zaehl("_pickArchitectureAtCrosshair");
                        const wh = r._raycastWorldHit(30);
                        if (wh && wh.hit && hinter(wh)) zaehl("_raycastWorldHit");
                        if (hinter(r._blickZiel(r.constructor.BLICK_ZIEL_M))) zaehl("_blickZiel");
                        const ph = r._resolvePhantomTarget();
                        if (ph && ph.hit && hinter(ph)) zaehl("_resolvePhantomTarget");
                        if (kreatur) {
                            const c = st.camera.position;
                            const arm2 = Math.hypot(c.x - p.x, c.y - (p.y + 1.0), c.z - p.z);
                            kreaturAuf(0.5 * arm2);
                            const kp = r._pickCreatureAtCrosshair();
                            if (kp && kp.creature === kreatur) zaehl("_pickCreatureAtCrosshair");
                            kreaturAuf(arm2 + 4);
                            const kv = r._pickCreatureAtCrosshair();
                            fk.kreaturVornProben++;
                            if (kv && kv.creature === kreatur) fk.kreaturVorn++;
                            kreatur.position.copy(kMerk);
                            kreatur.updateMatrixWorld(true);
                        }
                    }
            }
            // DIE DURCHSICHT NUR ZWISCHEN AUGE UND ZIEL (Gegenprüfung Runde 2, ROT 2): die EINE Formel des Stoffs
            // (`_durchsichtGewicht`, hier über den Zahlen `DURCHSICHT_ZAHLEN`) an der Rinde, je Punkt der Stamm-Hülle bis 3 m vom
            // Ziel — (a) 1st, der Spieler läuft an den Stamm (die Ankunfts-Sicht): keine Rinde fällt; (b) 3rd, derselbe Anlauf (der
            // Stamm VOR dem Spieler, jenseits der Ebene des Ziels): keine Rinde fällt; (c) 3rd, der Spieler 2,5 m vor dem Baum mit dem Rücken zu ihm (der Stamm
            // zwischen Kamera und Brust): die Rinde am Sicht-Strahl fällt ganz — die Durchsicht wirkt.
            {
                const K = r.constructor;
                const ds = (m.durchsicht = { formel: typeof K._durchsichtGewicht === "function" && !!K.DURCHSICHT_ZAHLEN });
                // das Ziel und sein Auge, wie `_kamZielSetzen` sie schreibt (dieselben Werte wie uKamZiel · uKamAuge)
                const ziel = () => {
                    const k = st._kamZiel;
                    return k ? { x: k.x, y: k.y, z: k.z, w: k.r, auge: { x: k.ex, y: k.ey, z: k.ez } } : null;
                };
                const gewicht = (q) => {
                    const z = ziel();
                    return K._durchsichtGewicht(K.DURCHSICHT_ZAHLEN, q, z.auge, { x: z.x, y: z.y, z: z.z }, z.w);
                };
                // die Punkte der Stamm-Hülle (die Seiten jeder Blocker-Box, 0,1 m Raster) bis 3 m vom Ziel (1st das Auge, 3rd
                // die Brust)
                const rinde = (baum) => {
                    const c = ziel();
                    const pts = [];
                    for (const bb of baum.blockerAABBs || []) {
                        const n = (a, b2) => Math.max(1, Math.ceil((b2 - a) / 0.1));
                        const nx = n(bb.minX, bb.maxX);
                        const nz = n(bb.minZ, bb.maxZ);
                        const y0 = Math.max(bb.botY, c.y - 3);
                        const y1 = Math.min(bb.topY, c.y + 3);
                        for (let y = y0; y <= y1; y += 0.1)
                            for (let i = 0; i <= nx; i++)
                                for (let j = 0; j <= nz; j++) {
                                    if (i > 0 && i < nx && j > 0 && j < nz) continue; // nur die Seiten
                                    const q = { x: bb.minX + ((bb.maxX - bb.minX) * i) / nx, y, z: bb.minZ + ((bb.maxZ - bb.minZ) * j) / nz };
                                    if (Math.hypot(q.x - c.x, q.y - c.y, q.z - c.z) <= 3) pts.push(q);
                                }
                    }
                    return pts;
                };
                const augeZuStamm = (baum) => {
                    const c = st.camera.position;
                    let d = Infinity;
                    for (const bb of baum.blockerAABBs || []) {
                        const qx = Math.max(bb.minX, Math.min(c.x, bb.maxX));
                        const qy = Math.max(bb.botY, Math.min(c.y, bb.topY));
                        const qz = Math.max(bb.minZ, Math.min(c.z, bb.maxZ));
                        d = Math.min(d, Math.hypot(qx - c.x, qy - c.y, qz - c.z));
                    }
                    return d;
                };
                // ein Anlauf: 3 m vor dem Stamm, der Blick zum Stamm, W bis der Körper hält
                const anlauf = async (baum, modus) => {
                    const box = baum.blockerAABBs[0];
                    const cx = (box.minX + box.maxX) / 2;
                    const cz = (box.minZ + box.maxZ) / 2;
                    let ux = P.x - cx;
                    let uz = P.z - cz;
                    const L = Math.hypot(ux, uz) || 1;
                    ux /= L;
                    uz /= L;
                    r.setCameraMode(modus);
                    const x = cx + ux * 3;
                    const zz = cz + uz * 3;
                    st.playerMesh.position.set(x, hh(x, zz) + 1.0, zz);
                    if (st.playerVel && st.playerVel.setValue) st.playerVel.setValue(0, 0, 0);
                    const gier = Math.atan2(-ux, -uz);
                    st.yaw = gier;
                    st.pitch = 0;
                    st.keys.w = true;
                    for (let i = 0; i < 120; i++) {
                        st.yaw = gier;
                        try {
                            r._gameLoopTick(performance.now());
                        } catch (_e) {}
                        await sleep(16);
                    }
                    st.keys.w = false;
                    st.pitch = 0;
                    ruhig();
                };
                // im 1st jeder Punkt; in 3rd nur, was jenseits der Ebene des Ziels liegt (vor dem Spieler — was zwischen Kamera
                // und Spieler liegt, ein Wurzel-Ast hinter seinem Rücken, darf fallen)
                const jenseits = (q) => {
                    const z = ziel();
                    const ex = z.x - z.auge.x;
                    const ey = z.y - z.auge.y;
                    const ez = z.z - z.auge.z;
                    const L = Math.hypot(ex, ey, ez);
                    if (L < 1e-6) return true;
                    return ((q.x - z.auge.x) * ex + (q.y - z.auge.y) * ey + (q.z - z.auge.z) * ez) / L >= L;
                };
                const urteil = (baum) => {
                    const pts = rinde(baum).filter(jenseits);
                    let wMin = 1;
                    let fallen = 0;
                    for (const q of pts) {
                        const w = gewicht(q);
                        if (w < wMin) wMin = w;
                        if (w < 0.999) fallen++;
                    }
                    return { punkte: pts.length, fallen, wMin };
                };
                if (ds.formel && ziel()) {
                    for (const [modus, n] of [
                        ["first", 8],
                        ["third", 4],
                    ]) {
                        const z = (ds[modus] = { anlaeufe: 0, faellt: 0, abstand: [], wMin: 1, punkte: 0 });
                        for (const baum of baeume.slice(0, n)) {
                            await anlauf(baum, modus);
                            const u = urteil(baum);
                            if (!u.punkte) continue;
                            z.anlaeufe++;
                            z.punkte += u.punkte;
                            z.abstand.push(+augeZuStamm(baum).toFixed(2));
                            if (u.fallen) z.faellt++;
                            z.wMin = Math.min(z.wMin, +u.wMin.toFixed(3));
                        }
                    }
                    // (c) der Stamm zwischen Kamera und Brust: wo der Sicht-Strahl Auge → Ziel durch die Stamm-Hülle geht
                    const zw = (ds.zwischen = { stellungen: 0, wirkt: 0, wMax: 0 });
                    r.setCameraMode("third");
                    for (const b of baeume.slice(0, 12))
                        for (let k = 0; k < 8; k++) {
                            const g = (k / 8) * Math.PI * 2;
                            const x = b.position.x + Math.sin(g) * 2.5;
                            const zz = b.position.z + Math.cos(g) * 2.5;
                            if (!Number.isFinite(hh(x, zz))) continue;
                            st.playerMesh.position.set(x, hh(x, zz) + 1.0, zz);
                            st.yaw = g;
                            st.pitch = 0;
                            ruhig();
                            const c = st.camera.position;
                            const z = ziel();
                            const innen = [];
                            for (let i = 1; i < 100; i++) {
                                const t = i / 100;
                                const q = { x: c.x + (z.x - c.x) * t, y: c.y + (z.y - c.y) * t, z: c.z + (z.z - c.z) * t };
                                if (b.blockerAABBs.some((bb) => q.x >= bb.minX && q.x <= bb.maxX && q.y >= bb.botY && q.y <= bb.topY && q.z >= bb.minZ && q.z <= bb.maxZ)) innen.push(q);
                            }
                            if (!innen.length) continue;
                            zw.stellungen++;
                            const wMax = Math.max(...innen.map(gewicht));
                            zw.wMax = Math.max(zw.wMax, +wMax.toFixed(3));
                            if (wMax < 0.001) zw.wirkt++;
                        }
                }
            }
            r.setCameraMode("first");
            st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
        }
        m.gestartet = true;
    } catch (e) {
        out.kamera = Object.assign(out.kamera || {}, { err: (e && e.stack) || String(e) });
    }
    // ── D6: die KI nennt die Ursache ──
    try {
        const m = { gestartet: false };
        out.ki = m;
        const llm = st.llm;
        const alt = JSON.parse(JSON.stringify({ enabled: llm.enabled, provider: llm.provider, oll: llm.providerConfig.ollama }));
        // (a) „Aktivieren" mit einem lokalen Endpunkt ohne Dienst
        llm.provider = "ollama";
        llm.enabled = false;
        llm.lastError = null;
        llm.providerConfig.ollama.endpoint = "http://127.0.0.1:" + arg.kiPort;
        llm.providerConfig.ollama.useProxy = false;
        const tg = document.getElementById("llm-toggle");
        if (tg) tg.click();
        await sleep(1500);
        if (typeof r._llmErreichbarkeit === "function") await r._llmErreichbarkeit();
        m.status = (document.getElementById("llm-status") || {}).textContent || "";
        // (b) ein Cloud-Begleiter ohne Schlüssel, der Schalter steht an
        const defs = r.llmProviderDefs();
        const ohne = Object.keys(defs).find((k) => defs[k].requiresKey);
        llm.provider = ohne;
        llm.enabled = true;
        llm.lastResponseAt = -1e9;
        if (llm.providerConfig[ohne]) llm.providerConfig[ohne].apiKey = "";
        const n0 = zeilen().length;
        r.processChatCommand("lass mir ein paar birken und ein fachwerkhaus wachsen");
        await sleep(600);
        m.ohneSchluessel = zeilen().slice(n0 + 1).find((z) => /schweigt|Fehler/.test(z)) || null;
        // (c) der Proxy: der Ursprung der Seite (der Linsen-Server kennt /api/proxy/llm nicht → 404)
        m.ursprung = location.origin;
        m.proxyUrl = typeof r._llmProxyUrl === "function" ? r._llmProxyUrl() : "http://localhost:4312/api/proxy/llm";
        llm.provider = "ollama";
        llm.enabled = true;
        llm.providerConfig.ollama.endpoint = "https://ollama.com";
        llm.providerConfig.ollama.useProxy = true;
        llm.lastResponseAt = -1e9;
        const ant = await r.llmCall("hallo welt");
        m.proxyFehler = ant && ant.error ? String(ant.error) : "";
        llm.enabled = alt.enabled;
        llm.provider = alt.provider;
        llm.providerConfig.ollama = alt.oll;
        llm.lastError = null;
        m.gestartet = true;
    } catch (e) {
        out.ki = Object.assign(out.ki || {}, { err: (e && e.stack) || String(e) });
    }
    // ── D9 + D8: das Dorf vor dir, zwei Kanäle ──
    try {
        const m = { gestartet: false };
        out.dorf = m;
        const k = { gestartet: false };
        out.kanal = k;
        m.buch = !!(buch && buch.ok);
        const pl = st.architectures.find((a) => a && a.type === "start_plattform");
        const P = pl.position;
        // die Gier der leeren Richtung (wenig Bäume, flach) — dieselbe Wahl wie die sichtbare Schau
        const baeume = st.architectures.filter((a) => /^baum_/.test(a.type || ""));
        let best = null;
        for (let i = 0; i < 16; i++) {
            const yaw = (i / 16) * Math.PI * 2;
            const sx = Math.sin(yaw);
            const sz = Math.cos(yaw);
            const h0 = r.getTerrainHeightAt(P.x + sx * 8, P.z + sz * 8);
            let maxDh = 0;
            for (let d = 8; d <= 40; d += 4) maxDh = Math.max(maxDh, Math.abs(r.getTerrainHeightAt(P.x + sx * d, P.z + sz * d) - h0));
            let nb = 0;
            for (const b of baeume) {
                const dx = b.position.x - P.x;
                const dz = b.position.z - P.z;
                const t = dx * sx + dz * sz;
                if (t > 2 && t < 40 && Math.abs(dx * sz - dz * sx) < 6) nb++;
            }
            const w = nb * 3 + maxDh;
            if (!best || w < best.w) best = { yaw, w };
        }
        st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
        st.yaw = best.yaw;
        const cam = st.camera;
        const tanH = Math.tan(((cam.fov || 75) * Math.PI) / 360) * (cam.aspect || 16 / 9);
        const vor = new Set(st.architectures);
        const z0 = zeilen().length;
        r.processChatCommand("dorf 7 18");
        const dl = performance.now() + 60000;
        while (performance.now() < dl && !zeilen().slice(z0).some((z) => /steht vor dir|Häuser platziert|kein Haus|Werkstatt der Welt|FOUNDRY/.test(z))) await sleep(200);
        const neu = st.architectures.filter((a) => !vor.has(a) && /^haus_/.test(a.type || ""));
        const fx = Math.sin(best.yaw);
        const fz = Math.cos(best.yaw);
        const cos = neu.map((a) => {
            const dx = a.position.x - P.x;
            const dz = a.position.z - P.z;
            const L = Math.hypot(dx, dz) || 1;
            return { c: (dx * fx + dz * fz) / L, quer: Math.abs(dx * fz - dz * fx), vorn: dx * fx + dz * fz };
        });
        m.haeuser = neu.length;
        m.hinten = cos.filter((c) => c.c < 0).length;
        m.cosHinten = cos.filter((c) => c.c < 0).map((c) => c.c.toFixed(2));
        // im Bildwinkel: der Abstand quer zur Achse ≤ tan(halber Winkel) × vorn (mit einem Haus Reichweite als Rand)
        m.ausserBild = cos.filter((c) => c.quer > tanH * c.vorn + 12).length;
        // der Puffer rollt (maxLogEntries): gesucht wird im ganzen, die letzte Gründung
        const logNeu = st.logBuffer.filter((z) => /Siedlung „/.test(z)).slice(-1).join("\n");
        k.siedlungImLog = /Siedlung „[^"]*" \([^)]*Seed 7\)/.test(logNeu);
        k.zeilen = zeilen().slice(z0);
        m.dorfZeile = (k.zeilen.find((z) => /vor dir|platziert/.test(z)) || "").slice(0, 120);
        // die Mitte des Plans aus dem Log (Platziert / Ersatz / übersprungen)
        const mz = /(\d+) Häuser platziert(?: \((\d+) am Ersatz-Ort\))?, (\d+) Slots übersprungen/.exec(logNeu);
        if (mz) {
            m.platziert = +mz[1];
            m.ersatzOrte = mz[2] != null ? +mz[2] : null;
            m.uebersprungen = +mz[3];
        }
        for (const a of st.architectures.filter((a) => !vor.has(a)).reverse()) r.removeArchitecture(a);
        // DER MITSPIELER (Gegenprüfung Runde 1: der Anker hing am EIGENEN Spieler, Blick und Fenster jedes Peers — etwa
        // 60 m Versatz): „baue dorf hier", gesprochen an der Plattform, läuft beim Sprecher (Quelle human) und bei einem
        // Mitspieler 200 m weiter mit anderer Gier (Quelle remote) — dasselbe Dorf an derselben Stelle.
        {
            const satz = r.parseChatToDsl("baue dorf hier");
            const haeuserVon = async (quelle, wo, gier) => {
                st.playerMesh.position.set(wo.x, wo.y, wo.z);
                st.yaw = gier;
                const vorM = new Set(st.architectures);
                r.dslRun(satz.program, { source: quelle });
                const dlM = performance.now() + 60000;
                let n = -1;
                let ruhig = 0;
                while (performance.now() < dlM && ruhig < 6) {
                    await sleep(250);
                    const k = st.architectures.filter((a) => !vorM.has(a) && /^haus_/.test(a.type || "")).length;
                    ruhig = k > 0 && k === n ? ruhig + 1 : 0;
                    n = k;
                }
                const neuM = st.architectures.filter((a) => !vorM.has(a) && /^haus_/.test(a.type || ""));
                const orte = neuM.map((a) => ({ x: a.position.x, z: a.position.z }));
                for (const a of st.architectures.filter((a) => !vorM.has(a)).reverse()) r.removeArchitecture(a);
                return orte;
            };
            st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
            st.yaw = best.yaw;
            const sprecher = await haeuserVon("human", { x: P.x, y: P.y + 2.2, z: P.z }, best.yaw);
            const mx = P.x + 200;
            const mz = P.z + 140;
            const mitspieler = await haeuserVon("remote:linse", { x: mx, y: r.getTerrainHeightAt(mx, mz) + 1.2, z: mz }, best.yaw + 2.1);
            m.mpHaeuser = [sprecher.length, mitspieler.length];
            let maxD = 0;
            for (const a of sprecher) {
                let dmin = Infinity;
                for (const b of mitspieler) dmin = Math.min(dmin, Math.hypot(a.x - b.x, a.z - b.z));
                maxD = Math.max(maxD, dmin);
            }
            m.mpAbweichung = sprecher.length && mitspieler.length ? +maxD.toFixed(2) : null;
            m.hierNaechstes = sprecher.length ? +Math.min(...sprecher.map((a) => Math.hypot(a.x - P.x, a.z - P.z))).toFixed(1) : null;
            m.hierWeitestes = sprecher.length ? +Math.max(...sprecher.map((a) => Math.hypot(a.x - P.x, a.z - P.z))).toFixed(1) : null;
            st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
            st.yaw = best.yaw;
        }
        // DER ERSATZ-ORT: ein Slot am Rand der Genesis-Plattform (sein Grundriss reicht 2 m in ihre Scheibe; die Rückseite
        // des Hauses, lokal +z, zeigt von ihr weg) — sein Ort fällt, ein Ersatz-Ort draußen trägt ihn.
        const f = r._foundry;
        const kultur = Object.keys(f.recipes).find((id) => f.recipes[id] && f.recipes[id].kind === "haus" && st.blueprints["haus_" + id]);
        const R = (st.blueprints.start_plattform.parts[0].size.x / 2) * (pl.scale || 1);
        const HALB = 3;
        const rand = R + HALB - 2;
        const slot = { kultur, x: fx * rand, z: fz * rand, phi: best.yaw, seed: 7, obb: { cx: fx * rand, cz: fz * rand, ex: HALB, ez: HALB } };
        const vor2 = new Set(st.architectures);
        const ok = r._spawnSettlementSlot(slot, { x: P.x, z: P.z }, f, { zaehler: { ersatz: 0 } });
        const haus = st.architectures.find((a) => !vor2.has(a) && /^haus_/.test(a.type || ""));
        m.ersatz = !!ok && !!haus;
        m.ersatzGrund = ok ? "" : "der Slot fiel";
        if (haus) {
            m.ersatzAbstand = +Math.hypot(haus.position.x - P.x, haus.position.z - P.z).toFixed(2);
            m.ersatzImBau = m.ersatzAbstand < R + HALB - 0.05; // der Grundriss des Hauses reicht in die Scheibe
            r.removeArchitecture(haus);
        }
        // D8: ein KI-Programm und eine Absage im Chat
        const z1 = zeilen().length;
        const llm = st.llm;
        const altE = llm.enabled;
        const altCall = r.llmCall;
        const altProv = llm.provider;
        llm.enabled = true;
        llm.provider = "ollama";
        r.llmCall = async () => ({ say: "Gern.", program: ["spawn_studio", "birke", ["at", P.x + 60, P.y, P.z + 60], 1] });
        try {
            await r.maybeAnswerWithLlm("pflanz eine birke weit weg", (t) => r._chatEcho(t));
        } finally {
            r.llmCall = altCall;
            llm.enabled = altE;
            llm.provider = altProv;
        }
        if (typeof r._dslAbsageSatz === "function") r._chatEcho(r._dslAbsageSatz([{ event: "op_exception", fehler: "x" }]));
        k.zeilen = k.zeilen.concat(zeilen().slice(z1));
        for (const a of st.architectures.filter((a) => !vor.has(a) && /^baum_birke/.test(a.type)).reverse()) r.removeArchitecture(a);
        k.gestartet = true;
        m.gestartet = true;
    } catch (e) {
        out.dorf = Object.assign(out.dorf || {}, { err: (e && e.stack) || String(e) });
    }
    return out;
}

(async () => {
    const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST — die Ankunfts-Linse nennt ihre Täter ===");
        const l2aFaelle = {
            ohneBoden: { weg: false, stand: "der Boden wächst (Ring 0 von 3)", warn: 0 },
            baumUngebaut: { weg: false, stand: "1 Bäume und Bauten wachsen", warn: 0 },
            streuWartet: { weg: false, stand: "1 Wald-Stücke warten auf ihre Gestalt", warn: 0 },
            streuNie: { weg: false, stand: "6 Wald-Stücke warten auf ihre Gestalt", warn: 0 },
            karteOffen: { weg: false, stand: "1 ferne Bäume werden gemalt", warn: 0 },
            allesSteht: { weg: true, stand: "", warn: 0 },
            lueckeRuht: { weg: true, stand: "", warn: 1 },
            lueckeFlackert: { weg: true, stand: "", warn: 1 },
        };
        const faelle = [
            [
                "L2a",
                ladeschirmVerdict,
                {
                    gestartet: true,
                    imHtml: true,
                    htmlVersteckt: false,
                    zIndex: 2147483000,
                    nachBootWeg: true,
                    tastenHinter: { w: false, enter: "BODY", omnibox: false },
                    weichtGanz: { hidden: true, display: "none", animationen: 0 },
                    faelle: l2aFaelle,
                },
                [
                    [
                        "die Streu-Region fehlt nach dem Boot (Befund 09.10., CI 37942425121)",
                        {
                            faelle: Object.assign({}, l2aFaelle, { streuWartet: undefined }),
                            ohneFall: { streuWartet: "die Streu-Region des Spielers (0,0) steht nach dem Boot nicht (Regionen-Karte: keine, der Streamer lief nie; das Weltbild galt ohne sie als fertig)" },
                        },
                        "mit einer Streu-Region, die auf ihr Asset wartet: die Streu-Region des Spielers (0,0) steht nach dem Boot nicht",
                    ],
                    ["ohne Streamer weicht der Ladeschirm (Befund 09.10.)", { faelle: Object.assign({}, l2aFaelle, { streuNie: { weg: true, stand: "", warn: 0 } }) }, "ohne eine gestreamte Streu-Region (der Streamer lief noch nie) weicht der Ladeschirm"],
                    ["ein Fall ohne Grund", { faelle: Object.assign({}, l2aFaelle, { karteOffen: undefined }) }, "mit der offenen Karte eines fernen Baums: die Probe stellte den Fall nicht her und nennt keinen Grund"],
                    ["kein Ladeschirm (Befund)", { imHtml: false }, "kein Ladeschirm im HTML"],
                    ["unter der UI", { zIndex: 5 }, "der Ladeschirm liegt unter der UI"],
                    [
                        "halbes Weltbild (Gegenprüfung: der eigene Chunk reicht)",
                        { faelle: { ohneBoden: { weg: false, stand: "der Boden unter dir wächst" }, baumUngebaut: { weg: true, stand: "" }, streuWartet: { weg: true, stand: "" }, karteOffen: { weg: true, stand: "" }, allesSteht: { weg: true }, lueckeRuht: { weg: true, warn: 0 } } },
                        "mit einem Baum der Mesh-Zone ohne Gestalt weicht der Ladeschirm",
                    ],
                    ["weicht ohne Boden", { faelle: { ohneBoden: { weg: true, stand: "" }, baumUngebaut: { weg: false, stand: "1 Bäume und Bauten wachsen" }, streuWartet: { weg: false, stand: "1 Wald-Stücke" }, karteOffen: { weg: false, stand: "1 ferne Bäume" }, allesSteht: { weg: true }, lueckeRuht: { weg: true, warn: 1 } } }, "ohne Boden unter dem Spieler weicht"],
                    ["stumme Stand-Zeile", { faelle: { ohneBoden: { weg: false, stand: "" }, baumUngebaut: { weg: false, stand: "1 Bäume und Bauten wachsen" }, streuWartet: { weg: false, stand: "1 Wald-Stücke" }, karteOffen: { weg: false, stand: "1 ferne Bäume" }, allesSteht: { weg: true }, lueckeRuht: { weg: true, warn: 1 } } }, "ohne Boden unter dem Spieler nennt die Stand-Zeile"],
                    ["bleibt, wenn alles steht", { faelle: { ohneBoden: { weg: false, stand: "Boden" }, baumUngebaut: { weg: false, stand: "1 Bäume und Bauten wachsen" }, streuWartet: { weg: false, stand: "1 Wald-Stücke" }, karteOffen: { weg: false, stand: "1 ferne Bäume" }, allesSteht: { weg: false, stand: "?" }, lueckeRuht: { weg: true, warn: 1 } } }, "steht alles, bleibt der Ladeschirm"],
                    ["ruhende Lücke hält fest", { faelle: { ohneBoden: { weg: false, stand: "Boden" }, baumUngebaut: { weg: false, stand: "1 Bäume und Bauten wachsen" }, streuWartet: { weg: false, stand: "1 Wald-Stücke" }, karteOffen: { weg: false, stand: "1 ferne Bäume" }, allesSteht: { weg: true }, lueckeRuht: { weg: false, warn: 0 } } }, "eine ruhende Lücke hält den Spieler"],
                    ["ruhende Lücke still", { faelle: { ohneBoden: { weg: false, stand: "Boden" }, baumUngebaut: { weg: false, stand: "1 Bäume und Bauten wachsen" }, streuWartet: { weg: false, stand: "1 Wald-Stücke" }, karteOffen: { weg: false, stand: "1 ferne Bäume" }, allesSteht: { weg: true }, lueckeRuht: { weg: true, warn: 0 } } }, "eine ruhende Lücke weicht ohne Wort"],
                    ["blockt die Linsen", { nachBootWeg: false }, "nach dem Boot"],
                    [
                        "flackernde Lücke ohne Deckel (Gegenprüfung Runde 2)",
                        { faelle: { ohneBoden: { weg: false, stand: "Boden" }, baumUngebaut: { weg: false, stand: "1 Bäume und Bauten wachsen" }, streuWartet: { weg: false, stand: "1 Wald-Stücke" }, karteOffen: { weg: false, stand: "1 ferne Bäume" }, allesSteht: { weg: true }, lueckeRuht: { weg: true, warn: 1 }, lueckeFlackert: { weg: false, warn: 0 } } },
                        "eine flackernde Lücke hält den Ladeschirm ohne Grenze",
                    ],
                    ["W hinter dem Ladeschirm (Gegenprüfung Runde 2)", { tastenHinter: { w: true, enter: "BODY", omnibox: false } }, "hinter dem Ladeschirm läuft W"],
                    ["Enter hinter dem Ladeschirm (Gegenprüfung Runde 2)", { tastenHinter: { w: false, enter: "chat-input", omnibox: false } }, "hinter dem Ladeschirm öffnet Enter"],
                    ["Strg+K hinter dem Ladeschirm (Gelb 2 der dritten Gegenprüfung)", { tastenHinter: { w: false, enter: "BODY", omnibox: true } }, "hinter dem Ladeschirm öffnet Strg+K die Omnibox"],
                    ["weicht nicht aus dem Layout (0710-11)", { weichtGanz: { hidden: true, display: "flex", animationen: 1 } }, "der Ladeschirm weicht nicht aus dem Layout"],
                ],
            ],
            [
                "L1",
                kreuzVerdict,
                { gestartet: true, da: true, sichtbar: true, dx: 0, dy: 0, mitSchublade: false, nachSchublade: true },
                [
                    ["kein Fadenkreuz (Befund)", { da: false }, "kein Fadenkreuz"],
                    ["daneben", { dx: 7 }, "das Fadenkreuz steht 7/0 px"],
                    ["über der Werkstatt", { mitSchublade: true }, "das Fadenkreuz steht über der offenen Werkstatt"],
                ],
            ],
            [
                "L2b",
                hilfeVerdict,
                {
                    gestartet: true,
                    unbekanntListe: false,
                    antworten: { hilfe: { unbekannt: false, fehlt: [], tastenFehlen: [], v1: true }, help: { unbekannt: false, fehlt: [], tastenFehlen: [], v1: true }, "?": { unbekannt: false, fehlt: [], tastenFehlen: [], v1: true } },
                },
                [
                    ["hilfe unbekannt (Befund)", { antworten: { hilfe: { unbekannt: true, erste: "Unbekannter Befehl. Meintest du: 'warte'?", fehlt: [], tastenFehlen: [], v1: false }, help: { unbekannt: false, fehlt: [], tastenFehlen: [], v1: true }, "?": { unbekannt: false, fehlt: [], tastenFehlen: [], v1: true } } }, "„hilfe\" ist unbekannt"],
                    ["Liste von Hand (Befund)", { unbekanntListe: true }, "der Satz für Unbekanntes trägt eine Liste von Hand"],
                    ["Tafel halb", { antworten: { hilfe: { unbekannt: false, fehlt: ["folge mir"], tastenFehlen: [], v1: true }, help: { unbekannt: false, fehlt: [], tastenFehlen: [], v1: true }, "?": { unbekannt: false, fehlt: [], tastenFehlen: [], v1: true } } }, "„hilfe\" nennt 1 Beispiel"],
                ],
            ],
            [
                "L3",
                gespraechVerdict,
                { gestartet: true, enterFokus: "chat-input", wImFeld: false, gesendet: true, nachSenden: "BODY", wNachSenden: true, nachEsc: "BODY", enterAufKnopf: "knopf" },
                [
                    ["Enter öffnet nichts (Befund)", { enterFokus: "BODY" }, "Enter öffnet das Gespräch nicht"],
                    ["Fokus bleibt im Feld (Befund)", { nachSenden: "chat-input", wNachSenden: false }, "nach dem Senden bleibt der Fokus im Feld"],
                    ["Esc hält das Feld", { nachEsc: "chat-input" }, "Esc gibt die Welt nicht zurück"],
                    ["Enter stiehlt dem Knopf den Fokus (Gegenprüfung)", { enterAufKnopf: "chat-input" }, "Enter auf einem fokussierten Knopf öffnet das Gespräch"],
                ],
            ],
            [
                "L7",
                gurtVerdict,
                {
                    gestartet: true,
                    buch: true,
                    hotbar: ["baum_eiche", "fahrzeug_gt", "tor_drachentor", "haus_alemannisch"],
                    eintraege: [
                        { name: "baum_eiche", sichtbar: true, art: "tree", platzierbar: true },
                        { name: "fahrzeug_gt", sichtbar: true, art: "vehicle", platzierbar: true },
                        { name: "tor_drachentor", sichtbar: true, art: "gate", platzierbar: true },
                        { name: "haus_alemannisch", sichtbar: true, art: "haus", platzierbar: true },
                    ],
                    katalogArten: ["tree", "vehicle", "gate", "haus"],
                },
                [
                    [
                        "Alt-Gurt (Befund)",
                        {
                            hotbar: ["stein_block", "waterfall", "damm"],
                            eintraege: [
                                { name: "stein_block", sichtbar: false, altDoppel: "basalt", art: null, platzierbar: true },
                                { name: "waterfall", sichtbar: true, art: null, platzierbar: true },
                                { name: "damm", sichtbar: true, art: null, platzierbar: true },
                            ],
                        },
                        "stein_block ist im Katalog versteckt (Alt-Doppel → basalt)",
                    ],
                    ["leer", { hotbar: [], eintraege: [] }, "der Start-Gurt ist leer"],
                ],
            ],
            [
                "LK",
                kameraVerdict,
                {
                    gestartet: true,
                    baum: "baum_tanne",
                    weltSkala: 3.6,
                    stammSkala: 3.6,
                    wege: {
                        fuss: { proben: 300, pflanzeHaelt: 0, armIst: 4.1, armSoll: 4.1, taeter: [], spruenge: 0, spruengeSoll: 0, spruengePflanze: 0, hinausSprung: 0, sprungM: 1 },
                        ritt: { proben: 300, pflanzeHaelt: 0, armIst: 9.6, armSoll: 9.6, taeter: [], spruenge: 1, spruengeSoll: 1, spruengePflanze: 0, hinausSprung: 0, sprungM: 2 },
                    },
                    stoffe: 6,
                    stoffeOhne: 0,
                    stoffeOhneArten: [],
                    schattenGeschnitten: 0,
                    zielFolgt: true,
                    kreuzAbstand: 0.6,
                    zielAbstand: 0.6,
                    fadenkreuz: { stellungen: 96, hinten: {}, kreatur: true, kreaturVorn: 96, kreaturVornProben: 96, zielAchse: 0 },
                    durchsicht: {
                        formel: true,
                        first: { anlaeufe: 8, faellt: 0, abstand: [0.3, 0.8], wMin: 1, punkte: 900 },
                        third: { anlaeufe: 4, faellt: 0, abstand: [3.8, 5.6], wMin: 1, punkte: 400 },
                        zwischen: { stellungen: 40, wirkt: 40, wMax: 0 },
                    },
                },
                [
                    ["Vorlagen-Maß (Befund)", { stammSkala: 1 }, "Stamm-Hülle im Vorlagen-Maß"],
                    [
                        "Wagendach (Gegenprüfung)",
                        { wege: { fuss: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 0 }, ritt: { proben: 2400, pflanzeHaelt: 641, armIst: 2.0, armSoll: 9.6, taeter: ["Krone (`_kameraKronenGrenze`)"], spruenge: 137, spruengeSoll: 0, spruengePflanze: 137, hinausSprung: 60, sprungM: 2 } } },
                        "ritt: eine Pflanze hält die Kamera in 641 von 2400",
                    ],
                    [
                        "2-m-Minimum zu Fuß (Gegenprüfung)",
                        { wege: { fuss: { proben: 400, pflanzeHaelt: 172, armIst: 2.0, armSoll: 4.1, taeter: ["Krone (`_kameraKronenGrenze`)"], spruenge: 5, spruengeSoll: 0, spruengePflanze: 5, hinausSprung: 2, sprungM: 1 }, ritt: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 0 } } },
                        "fuss: eine Pflanze hält die Kamera",
                    ],
                    ["Sprung hinaus", { wege: { fuss: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 3, sprungM: 1 }, ritt: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 0 } } }, "fuss: die Kamera springt 3× hinaus"],
                    ["Nadelwand ohne Durchsicht (Befund)", { stoffeOhne: 6, stoffeOhneArten: ["foliageTex", "bark"] }, "6 von 6 Pflanzen-Stoffen ohne Durchsicht"],
                    ["Durchsicht im Schatten", { schattenGeschnitten: 2 }, "2 Pflanzen-Stoff(e) schneiden die Durchsicht auch in den Schatten"],
                    ["Ziel ohne Brust", { zielFolgt: false, zielAbstand: 3.2 }, "das Ziel der Durchsicht folgt der Brust nicht"],
                    ["Fadenkreuz auf dem Kopf (Gegenprüfung)", { kreuzAbstand: 0.02 }, "das Fadenkreuz steht in 3rd auf der Figur"],
                    [
                        "das Ziel ist die Brust, nicht der Blickpunkt (Gelb 1 der dritten Gegenprüfung)",
                        { fadenkreuz: { stellungen: 96, hinten: {}, kreatur: true, kreaturVorn: 96, kreaturVornProben: 96, zielAchse: 0.597 } },
                        "Fadenkreuz-Strahl: das Ziel der Kamera liegt 0.597 m neben ihrem Blick",
                    ],
                    [
                        "Fadenkreuz trifft hinten (Gegenprüfung Runde 2)",
                        { fadenkreuz: { stellungen: 96, hinten: { _pickArchitectureAtCrosshair: 76, _raycastWorldHit: 67 }, kreatur: true, kreaturVorn: 96, kreaturVornProben: 96, zielAchse: 0 } },
                        "Fadenkreuz-Strahl: `_pickArchitectureAtCrosshair` trifft in 76 von 96 Stellungen HINTER dem Spieler",
                    ],
                    ["Kreatur vorn verfehlt", { fadenkreuz: { stellungen: 96, hinten: {}, kreatur: true, kreaturVorn: 0, kreaturVornProben: 96, zielAchse: 0 } }, "Fadenkreuz-Strahl: eine Kreatur VOR dem Spieler"],
                    [
                        "Loch im Stamm im 1st (Gegenprüfung Runde 2)",
                        { durchsicht: { formel: true, first: { anlaeufe: 8, faellt: 8, abstand: [0.12, 0.82], wMin: 0 }, third: { anlaeufe: 4, faellt: 0, abstand: [4], wMin: 1 }, zwischen: { stellungen: 40, wirkt: 40, wMax: 0 } } },
                        "Durchsicht 1st am Stamm: die Rinde fällt in 8 von 8 Anläufen",
                    ],
                    [
                        "Loch im Stamm vor dem Spieler",
                        { durchsicht: { formel: true, first: { anlaeufe: 8, faellt: 0, abstand: [0.3], wMin: 1 }, third: { anlaeufe: 4, faellt: 4, abstand: [3.8], wMin: 0 }, zwischen: { stellungen: 40, wirkt: 40, wMax: 0 } } },
                        "Durchsicht 3rd, der Stamm VOR dem Spieler: die Rinde fällt",
                    ],
                    [
                        "Durchsicht wirkt nicht",
                        { durchsicht: { formel: true, first: { anlaeufe: 8, faellt: 0, abstand: [0.3], wMin: 1 }, third: { anlaeufe: 4, faellt: 0, abstand: [3.8], wMin: 1 }, zwischen: { stellungen: 40, wirkt: 0, wMax: 1 } } },
                        "Durchsicht 3rd: der Stamm zwischen Kamera und Spieler steht in 40 von 40",
                    ],
                    ["keine EINE Formel", { durchsicht: { formel: false } }, "Durchsicht: keine EINE Formel"],
                ],
            ],
            [
                "D8",
                kanalVerdict,
                { gestartet: true, siedlungImLog: true, zeilen: ["> dorf 7 18", "„Villaalto\" steht vor dir: 20 Häuser.", "(Welt verändert: Grok lässt 1× „Birke\" aus dem Studio wachsen bei (96, 59, 60).)"] },
                [
                    ["Siedlungs-Zahlen im Chat (Befund)", { zeilen: ["Siedlung „Villaalto\" (markt, Seed 7): 13 Häuser platziert, 12 Slots übersprungen."] }, "Telemetrie im Chat"],
                    ["rohes Programm", { zeilen: ['(Welt verändert: ["spawn_studio","birke",["at",1,2,3],1])'] }, "Telemetrie im Chat"],
                    ["interne id", { zeilen: ["3× baum_birke aus dem Studio vor dir gewachsen"] }, "interne id im Chat"],
                    ["Ereignis-Name", { zeilen: ["Befehl lief, aber mit Auffälligkeit: op_exception"] }, "Telemetrie im Chat"],
                ],
            ],
            [
                "D6",
                kiVerdict,
                { gestartet: true, status: "Fehler (Ollama): Keine Antwort von 127.0.0.1:4604 — der lokale Dienst läuft nicht", ohneSchluessel: "(Grok schweigt: für Claude fehlt der Schlüssel …)", ursprung: "http://127.0.0.1:4601", proxyUrl: "http://127.0.0.1:4601/api/proxy/llm", proxyFehler: "der Proxy fehlt: … antwortet 404" },
                [
                    ["Aktiv ohne Dienst (Befund)", { status: "Aktiv: Ollama (lokal oder gehostet) (llama3.2)." }, "der Status sagt"],
                    ["Schweigen ohne Schlüssel (Befund)", { ohneSchluessel: null }, "ohne Schlüssel schweigt der Chat"],
                    ["Proxy fest auf 4312 (Befund)", { proxyUrl: "http://localhost:4312/api/proxy/llm", proxyFehler: "Proxy nicht erreichbar (läuft 'npm run dev' / save-server auf Port 4312?)." }, "der Proxy fragt einen fremden Server"],
                ],
            ],
            [
                "D9",
                dorfVerdict,
                { gestartet: true, buch: true, haeuser: 20, hinten: 0, cosHinten: [], ausserBild: 0, ersatz: true, ersatzImBau: false, mpAbweichung: 0, mpHaeuser: [20, 20] },
                [
                    ["umringt (Befund)", { haeuser: 13, hinten: 7, cosHinten: ["-0.61", "-0.86", "-0.70"] }, "7 Häuser hinter dem Spieler"],
                    ["Slot fällt (Befund)", { ersatz: false, ersatzGrund: "der Slot fiel" }, "ein gesperrter Slot fällt"],
                    ["am Bildrand vorbei", { ausserBild: 3 }, "3 Häuser außerhalb des Bildwinkels"],
                    ["Mitspieler 60 m daneben (Gegenprüfung)", { mpAbweichung: 61.4, mpHaeuser: [20, 20] }, "beim Mitspieler steht das Dorf 61.4 m daneben"],
                ],
            ],
        ];
        for (const [kurz, urteil, gesund, brueche] of faelle) {
            check(`Selbst-Test ${kurz}: gesund == 0 Täter`, urteil(gesund).length === 0, urteil(gesund).join(" · "));
            for (const [name, bruch, soll] of brueche) {
                const v = urteil(Object.assign({}, gesund, bruch));
                check(`Selbst-Test ${kurz}: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
            }
        }
        const gruen = wand(quelle, html);
        check("Selbst-Test W: der Arbeitsbaum ist grün", gruen.every((w) => w[1]), gruen.filter((w) => !w[1]).map((w) => w[0]).join(" | "));
        const vorStand = quelle
            .replace("if (!this.state._weltbildDa) this._ankunftsBild();", "")
            .replace("const fehlt = this._weltbildFehlt();", 'const fehlt = this._builtRingRadius() >= 0 ? [] : ["Boden"];')
            .replace("hotbar: [null, null, null, null, null, null, null, null, null],", 'hotbar: ["stein_block", "waterfall", "damm", null, null, null, null, null, null],')
            .replace("const anchor = this._siedlungsAnker(plan, o.position || null, o.blick || null);", 'const anchor = this._structureSpawnPos("haus_basis", base, { state: this.state }, 3);')
            .replace("{ durchPflanzen: true }", "{}")
            .replace("const _durch = this._kameraDurchsichtNode(TSL);", "const _durch = null;")
            .replace(/(\n {4}_raycastWorldHit\(maxDist = 30\) \{[\s\S]*?)this\._fadenkreuzStrahl\(\)/, "$1this._alterStrahl()")
            .replace("AnazhRealm._durchsichtGewicht(A,", "AnazhRealm._alteDurchsicht(A,")
            .replace("(Welt verändert: ${compName} ${this.describeProgram(reply.program)}.)", "(Welt verändert: ${JSON.stringify(reply.program)})")
            .replace("for (const z of this._hilfeZeilen()) append(z);", "append(\"'Setze Wetter rainy'\");")
            .replace(/_hilfeZeilen\(\) \{[\s\S]*?\n {4}\}\n/, "_hilfeZeilen() {\n        return [];\n    }\n");
        const vorHtml = html.replace('<div id="ladeschirm" role="status" aria-live="polite">', '<div id="ladeschirm" role="status" aria-live="polite" hidden>');
        const rot = wand(vorStand, vorHtml);
        check(
            "Selbst-Test W: der Vor-Stand (kein Ankunfts-Bild, Alt-Gurt, geschätzter Dorf-Anker, Kamera ohne Durchsicht, Hilfe von Hand, Ladeschirm versteckt, rohes Programm, ein Strahl ab der Kamera, eine zweite Formel) → W1–W8 feuern",
            rot.filter((w) => !w[1]).length === 8,
            rot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" ")
        );
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Ankunfts-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of wand(quelle, html)) check(name, ok, detail);

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
    // Der statische Ladeschirm (vor dem Spiel): sichtbar, über allem
    const ladeHtml = await page.evaluate(() => {
        const l = document.getElementById("ladeschirm");
        return l ? { imHtml: true, htmlVersteckt: !!l.hidden, zIndex: +getComputedStyle(l).zIndex || 0 } : { imHtml: false };
    });
    // Der KI-Endpunkt der D6-Probe: ein Port, auf dem nichts lauscht.
    const out = await page.evaluate(probe, { kiPort: PORT + 3 });
    await browser.close();
    server.close();
    Object.assign(out.lade || (out.lade = {}), ladeHtml);

    const zeige = (kurz, name, m, urteil, zeile) => {
        const mm = m || {};
        if (mm.err) check(`${kurz} Probe ohne Ausnahme`, false, mm.err.split("\n")[0]);
        const v = urteil(mm);
        check(`${kurz} ${name}`, v.length === 0, `${mm.gestartet ? zeile(mm) : "nicht gestartet"}${v.length ? " — Täter: " + v.join(", ") : ""}`);
    };
    console.log("=== L2a · L1 · L2b · L3 · L7 — ANKOMMEN ===");
    zeige(
        "L2a",
        "das erste Bild ist der Ladeschirm, er weicht dem FERTIGEN Weltbild (Boden, Bäume und Bauten der Mesh-Zone, Streu, ferne Karten)",
        out.lade,
        ladeschirmVerdict,
        (m) =>
            `im HTML ${m.imHtml} · z ${m.zIndex} · ` +
            Object.entries(m.faelle || {})
                .map(([k, z]) => `${k}: ${z.weg ? "weicht" : "bleibt"}${z.stand ? ` („${z.stand}")` : ""}${z.warn ? " + WARN" : ""}`)
                .join(" · ") +
            (m.baumD != null ? ` · Baum ${m.baumD} m` : "") +
            (m.tastenHinter ? ` · hinter dem Ladeschirm: W ${m.tastenHinter.w ? "läuft" : "ruht"}, Enter → ${m.tastenHinter.enter}, Strg+K → Omnibox ${m.tastenHinter.omnibox ? "offen" : "zu"}` : "")
    );
    zeige("L1", "das Fadenkreuz steht in der Bildmitte und weicht der Schublade", out.kreuz, kreuzVerdict, (m) => `da ${m.da} · Mitte ${m.dx}/${m.dy} px · mit Werkstatt ${m.mitSchublade} · danach ${m.nachSchublade}`);
    zeige("L2b", "„hilfe\" nennt die EINEN Tafeln und die Tasten", out.hilfe, hilfeVerdict, (m) => Object.entries(m.antworten || {}).map(([w, z]) => `„${w}": ${z.unbekannt ? "unbekannt" : `${(z.fehlt || []).length} fehlen`}`).join(" · "));
    zeige("L3", "Enter öffnet das Gespräch, Enter sendet und gibt die Welt zurück, Enter auf einem Knopf gehört dem Knopf", out.gespraech, gespraechVerdict, (m) => `Enter → ${m.enterFokus} · gesendet ${m.gesendet} · danach ${m.nachSenden} · W ${m.wNachSenden} · Esc → ${m.nachEsc} · Enter auf dem Knopf → ${m.enterAufKnopf}`);
    zeige("L7", "der Start-Gurt liest den Katalog (je Studio-Art ein Werk)", out.gurt, gurtVerdict, (m) => `${(m.hotbar || []).filter(Boolean).join(" · ")} (Arten im Katalog: ${(m.katalogArten || []).join(", ")})`);
    console.log("=== LK — DIE KAMERA UND DER BAUM ===");
    zeige(
        "LK",
        "die 3rd-Kamera rückt nur vor Boden und Bau ein, gleitet hinaus, jeder Pflanzen-Stoff trägt die Durchsicht",
        out.kamera,
        kameraVerdict,
        (m) =>
            `${m.baum} · Stamm × ${m.stammSkala} (Welt × ${m.weltSkala}) · ` +
            ["fuss", "ritt"]
                .map((k) => {
                    const z = (m.wege || {})[k] || {};
                    return `${k}: ${z.proben} Proben, Pflanze hält ${z.pflanzeHaelt}, Arm ${z.armIst}/${z.armSoll} m (Ist/Soll), < 3 m ${z.unter3}, Sprünge ${z.spruenge} (Soll ${z.spruengeSoll}, hinaus ${z.hinausSprung})`;
                })
                .join(" · ") +
            ` · Pflanzen-Stoffe ${m.stoffe}, ohne Durchsicht ${m.stoffeOhne}, Ziel ${m.zielAbstand} m neben der Brust, Fadenkreuz ${m.kreuzAbstand} m neben der Brust` +
            ((fk) => ` · Fadenkreuz-Strahl: ${fk.stellungen} Stellungen, hinter dem Spieler ${JSON.stringify(fk.hinten || {})}, Kreatur vorn ${fk.kreaturVorn}/${fk.kreaturVornProben}, Ziel neben dem Blick ${fk.zielAchse} m`)(m.fadenkreuz || {}) +
            ((ds) =>
                ds.formel
                    ? ` · Durchsicht: 1st ${(ds.first || {}).faellt}/${(ds.first || {}).anlaeufe} Anläufe mit fallender Rinde (Auge ${((ds.first || {}).abstand || []).join("/")} m), 3rd vor dem Spieler ${(ds.third || {}).faellt}/${(ds.third || {}).anlaeufe}, zwischen Kamera und Spieler fällt ${(ds.zwischen || {}).wirkt}/${(ds.zwischen || {}).stellungen}`
                    : " · Durchsicht: keine EINE Formel")(m.durchsicht || {})
    );
    console.log("=== D8 · D6 · D9 — DIE STIMME UND DAS DORF ===");
    zeige("D8", "der Spieler-Chat trägt Worte, das Log die Zahlen", out.kanal, kanalVerdict, (m) => `${(m.zeilen || []).filter((z) => !/^> /.test(z)).length} Zeilen · Log ${m.siedlungImLog}`);
    zeige("D6", "die KI nennt die Ursache (Dienst · Schlüssel · Proxy)", out.ki, kiVerdict, (m) => `Status „${(m.status || "").slice(0, 60)}" · ohne Schlüssel „${(m.ohneSchluessel || "—").slice(0, 60)}" · Proxy ${m.proxyUrl}`);
    zeige("D9", "das Dorf steht vor dir, ein gesperrter Slot findet einen Ersatz-Ort", out.dorf, dorfVerdict, (m) => `${m.haeuser} Häuser (Log: ${m.platziert} platziert, ${m.ersatzOrte} am Ersatz-Ort, ${m.uebersprungen} übersprungen) · hinten ${m.hinten} · außer Bild ${m.ausserBild} · Ersatz ${m.ersatz} (${m.ersatzAbstand} m) · „${m.dorfZeile}" · baue dorf hier: ${m.hierNaechstes}–${m.hierWeitestes} m, beim Mitspieler ${m.mpAbweichung} m daneben (Häuser ${(m.mpHaeuser || []).join(" / ")})`);
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — die Ankunft trägt ihre benannten Schnitte.");
    process.exit(0);
})().catch((e) => {
    console.error("Ankunfts-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
