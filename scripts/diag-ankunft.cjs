// diag-ankunft.cjs — DIE ANKUNFTS-LINSE (Welle L Folge, v1-Schritte 1–2: ankommen · laufen und sehen). Die Defekte, die die
// SICHTBARE Leben-Schau am 07.10. auf dem Welle-L-Stand fand (artifacts/profiband/leben-schau/befund-v1-pfad.md), je beim
// NAMEN. Jede Probe ruft den Chokepoint selbst im echten Boot (headless, foundry-ON, Null-Renderer) und misst seine Wirkung;
// das Bild der Ankunft beweist die echte GPU (Bild-Paare vorher/nachher), diese Linse die Mechanik.
//
//   L2a DAS ERSTE WELTBILD — `#ladeschirm` steht im HTML ab dem ersten Bild der Seite (kein `hidden`, über allem) und
//       weicht im Spiel nur über `_ankunftsBild`: solange der Boden unter dem Spieler nicht steht (`_builtRingRadius` < 0),
//       bleibt er und sagt es in seiner Stand-Zeile; steht er, weicht er. Befund: das erste Bild war die schwarze Leinwand
//       (Radeon: 1,6 s bis 14,5 s nach dem Laden), kein Ladeschirm.
//   L1  DAS FADENKREUZ — `#fadenkreuz` steht in der Bildmitte (dort trifft `_blickZiel`), weicht einer offenen Schublade.
//       Befund: 0 Fadenkreuz-Elemente.
//   L2b DIE HILFE — „hilfe" / „help" / „?" nennt jedes Beispiel der EINEN Tafeln (`chatDslPatterns`, `chatSystemPatterns`,
//       ihre `hilfe`-Sätze) und jede Taste (`KEYBINDING_LABELS`); der Satz für Unbekanntes trägt keine zweite Liste.
//       Befund: „hilfe" → „Unbekannter Befehl. Meintest du: 'warte'?", „help" eine Liste von Hand ohne v1-Satz.
//   L3  DAS GESPRÄCH — die Chat-Taste (Enter) öffnet das Feld, Enter im Feld sendet und gibt die Welt zurück (W läuft
//       wieder), Esc gibt sie ohne Senden zurück. Befund: Enter, T und „/" öffneten nichts, nach dem Senden tippte W „w".
//   L7  DER START-GURT — die Hotbar eines neuen Spielers liest den Katalog (`_katalogSichtbar`): je Studio-Art EIN
//       platzierbares Werk, kein Alt-Doppel. Befund: Felsblock · Wasserfall · Damm.
//   LK  DIE KRONEN- UND STAMM-HÜLLE DER 3RD-KAMERA — die Stamm-Blocker eines Studio-Baums tragen seine Welt-Skala (der
//       Stamm, wie er gezeichnet wird), und `_loopCamera` hält die Kamera aus jedem Stamm, aus jeder Krone, unter der der
//       Spieler nicht steht, und nie tiefer in einer Krone als er (aber ≥ KAMERA_KRONEN_MIN_M an seiner Brust). Befund: die
//       Kamera 0,53 m von der Achse einer Kiefer (im Stamm), 2,86 m von der Achse einer Tanne, in der der Spieler bei 7,3 m
//       stand — eine Nadelwand.
//   D8  ZWEI KANÄLE — der Spieler-Chat trägt Worte, das Log die Telemetrie: die Siedlungs-Zeile ohne Same und Slots, das
//       KI-Programm als Tat (`describeProgram`), nie als JSON, eine Programm-Absage ohne Ereignis-Namen.
//   D6  DIE KI NENNT DIE URSACHE — „Aktivieren" fragt einen lokalen Dienst (der Status sagt, dass er nicht läuft, nie
//       „Aktiv"), ohne Schlüssel sagt der Chat es, der Proxy ist der Ursprung der Seite (404 dort = „der Proxy fehlt").
//   D9  DAS DORF VOR DIR — „dorf 7 18" an der Plattform: jedes Haus vor dem Spieler und im Bildwinkel der Welt-Kamera; ein
//       Slot, dessen Ort ein Bau sperrt, findet einen Ersatz-Ort. Befund: 13 Häuser, 12 von 25 Slots übersprungen, die drei
//       nächsten HINTER dem Spieler (cos −1,00 / −0,48 / −0,12).
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
    if (m.ohneBoden !== "bleibt") out.push(`ohne Boden unter dem Spieler weicht der Ladeschirm (${m.ohneBoden})`);
    if (!m.standZeile) out.push("ohne Boden schweigt die Stand-Zeile");
    if (m.mitBoden !== "weicht") out.push(`mit Boden bleibt der Ladeschirm (${m.mitBoden})`);
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
    for (const s of m.szenen || []) {
        if (s.imStamm) out.push(`${s.name}: Kamera im Stamm (${s.kameraAchse} m von der Achse)`);
        if (s.inFremderKrone) out.push(`${s.name}: Kamera in einer Krone, unter der der Spieler nicht steht (${s.kameraAchse} m, Krone ${s.krone} m)`);
        if (s.tieferAlsSpieler && !(s.kameraBrust <= s.minM + 0.05)) out.push(`${s.name}: Kamera ${s.kameraAchse} m von der Achse, der Spieler bei ${s.spielerAchse} m (Krone ${s.krone} m) — eine Nadelwand`);
        if (!(s.kameraBrust >= s.minM - 0.05) && !s.stammDavor) out.push(`${s.name}: Kamera ${s.kameraBrust} m an der Brust (Soll ≥ ${s.minM} m)`);
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
    return out;
}

// ── DIE STATISCHE WAND (Node, kommentarfrei). Liefert [name, ok, detail]. ──
function wand(src, html) {
    const nc = ohneKommentare(src);
    const fallback = fnBody(nc, /\n {4}_chatHandleConversationalFallback\(command, appendChatOutput\) \{/) || "";
    const hilfe = fnBody(nc, /\n {4}_hilfeZeilen\(\) \{/) || "";
    const siedlung = fnBody(nc, /\n {4}async spawnSettlement\(opts\) \{/) || "";
    const dorfOp = (nc.match(/spawn_village: \(\[positionNode, seed\], ctx\) => \{[\s\S]*?\n {12}\},/) || [""])[0];
    const kamera = fnBody(nc, /\n {4}_loopCamera\(currentTime\) \{/) || "";
    const ladeIdx = html.indexOf('id="ladeschirm"');
    const ladeTag = ladeIdx >= 0 ? html.slice(html.lastIndexOf("<", ladeIdx), html.indexOf(">", ladeIdx) + 1) : "";
    return [
        [
            "W1 die Hilfe liest die EINEN Tafeln (`_hilfeZeilen`: chatDslPatterns · chatSystemPatterns · KEYBINDING_LABELS), der Satz für Unbekanntes trägt keine Liste von Hand",
            /this\.chatDslPatterns/.test(hilfe) &&
                /this\.chatSystemPatterns/.test(hilfe) &&
                /KEYBINDING_LABELS/.test(hilfe) &&
                !/'Setze Wetter rainy'/.test(fallback),
        ],
        [
            "W2 der Ladeschirm steht im HTML vor allem anderen sichtbar (kein `hidden`), das Spiel nimmt ihn nur über `_ankunftsBild`/`_ladeschirmWeg`",
            ladeIdx >= 0 && !/\bhidden\b/.test(ladeTag) && /this\._ankunftsBild\(\)/.test(fnBody(nc, /\n {4}_loopRender\(currentTime\) \{/) || ""),
        ],
        [
            "W3 die Hotbar trägt im Konstruktor keinen Bauplan-Namen (der Start-Gurt liest den Katalog: `_startGurt`)",
            /hotbar: \[null, null, null, null, null, null, null, null, null\]/.test(nc) && /_katalogSichtbar/.test(fnBody(nc, /\n {4}_startGurt\(\) \{/) || ""),
        ],
        [
            "W4 das Dorf misst seinen Plan (`_siedlungsAnker`), keine Schätzung `_structureSpawnPos(\"haus_basis\")` in spawnSettlement und spawn_village",
            /this\._siedlungsAnker\(plan/.test(siedlung) && !/_structureSpawnPos/.test(siedlung) && !/_structureSpawnPos/.test(dorfOp),
        ],
        [
            "W5 die 3rd-Kamera fragt die Kronen-Hülle (`_kameraKronenGrenze` in `_loopCamera`)",
            /this\._kameraKronenGrenze\(/.test(kamera),
        ],
        [
            "W6 kein rohes Programm und keine Siedlungs-Zahl im Spieler-Chat (kein `JSON.stringify(reply.program)`, kein `Seed ${` an `_chatEcho`)",
            !/JSON\.stringify\(reply\.program\)/.test(nc) && !/_chatEcho\?*\.?\(msg\)/.test(siedlung),
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
        const m = { gestartet: false };
        out.lade = m;
        const ls = document.getElementById("ladeschirm");
        m.nachBootWeg = !ls || ls.hidden || ls.classList.contains("weg");
        if (ls && typeof r._ankunftsBild === "function") {
            // den Ladeschirm wieder stellen, den Spieler in einen Chunk ohne Boden, `_ankunftsBild` fragen
            ls.hidden = false;
            ls.classList.remove("weg");
            const merk = st.lastPlayerVoxelChunk;
            st._weltbildDa = 0;
            st.lastPlayerVoxelChunk = { cx: 9000, cz: 9000 };
            const a = r._ankunftsBild();
            m.ohneBoden = a ? "weicht" : !ls.classList.contains("weg") ? "bleibt" : "weicht";
            m.standZeile = (document.getElementById("ladeschirm-stand") || {}).textContent || "";
            st.lastPlayerVoxelChunk = merk;
            const b = r._ankunftsBild();
            m.mitBoden = b && ls.classList.contains("weg") ? "weicht" : "bleibt";
            await sleep(800);
            if (!st._weltbildDa) st._weltbildDa = performance.now();
        } else m.ohneBoden = ls ? "kein _ankunftsBild" : "kein Ladeschirm";
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
    // ── LK: die Kronen- und Stamm-Hülle der 3rd-Kamera ──
    try {
        const m = { gestartet: false, szenen: [] };
        out.kamera = m;
        const pl = st.architectures.find((a) => a && a.type === "start_plattform");
        const P = pl ? pl.position : st.playerMesh.position;
        // ein Studio-Baum als Eintrag, nah an der Plattform, mit Stamm-Teil und bekannter Krone
        let baum = null;
        const dl = performance.now() + 60000;
        while (!baum && performance.now() < dl) {
            const kand = st.architectures
                .filter((a) => a && /^baum_(tanne|fichte|kiefer|eiche|birke)$/.test(a.type) && a.blockerAABBs && a.blockerAABBs.length)
                .sort((a, b) => Math.hypot(a.position.x - P.x, a.position.z - P.z) - Math.hypot(b.position.x - P.x, b.position.z - P.z));
            baum = kand[0] || null;
            if (!baum) await tick(5, 40);
        }
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
            const krone = r._naturKrone(baum.type, baum);
            const min = r.constructor.KAMERA_KRONEN_MIN_M || 2;
            const bx = baum.position.x;
            const bz = baum.position.z;
            let ux = P.x - bx;
            let uz = P.z - bz;
            const L = Math.hypot(ux, uz) || 1;
            ux /= L;
            uz /= L;
            const kreis = r._kronenStreuAt ? null : null;
            void kreis;
            r.setCameraMode("third");
            const stamm = (x, y, z) =>
                baum.blockerAABBs.some((b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ && y >= (b.minY != null ? b.minY : -1e9) && y <= (b.topY != null ? b.topY : b.maxY));
            for (const [name, d, seit, pitch] of [
                ["Rücken zum Stamm 0,8 × Krone", Math.min(0.8 * krone, krone - 0.5), 0, -0.4],
                ["seitlich in der Krone", Math.min(0.7 * krone, krone - 0.5), 2, -0.6],
                ["vor der Krone", krone + 2.5, 0, -0.3],
            ]) {
                const px = bx + ux * d + uz * seit;
                const pz = bz + uz * d - ux * seit;
                const gy = r.getTerrainHeightAt(px, pz);
                st.playerMesh.position.set(px, gy + 1.0, pz);
                st.yaw = Math.atan2(ux, uz); // Blick vom Baum weg: die Kamera steht hinter dem Spieler, zum Baum hin
                st.pitch = pitch;
                for (let i = 0; i < 3; i++) r._loopCamera(performance.now() / 1000 + i * 0.016);
                const cam = st.camera.position;
                const spAchse = Math.hypot(px - bx, pz - bz);
                const camAchse = Math.hypot(cam.x - bx, cam.z - bz);
                const h = r._lodTreeVisHeight(baum);
                const unterTop = !(h > 0) || cam.y < baum.position.y + h;
                const brust = Math.hypot(cam.x - px, cam.y - (st.playerMesh.position.y + 1.0), cam.z - pz);
                // stand der Stamm zwischen Brust und Wunsch-Position? (dann hält die Struktur die Kamera davor)
                const stammDavor = camAchse <= spAchse && brust < min;
                m.szenen.push({
                    name,
                    krone: +krone.toFixed(2),
                    spielerAchse: +spAchse.toFixed(2),
                    kameraAchse: +camAchse.toFixed(2),
                    kameraBrust: +brust.toFixed(2),
                    minM: min,
                    imStamm: stamm(cam.x, cam.y, cam.z),
                    inFremderKrone: spAchse >= krone && camAchse < krone - 0.31 && unterTop,
                    tieferAlsSpieler: spAchse < krone && camAchse < spAchse - 0.31 && unterTop,
                    stammDavor,
                });
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
        const faelle = [
            [
                "L2a",
                ladeschirmVerdict,
                { gestartet: true, imHtml: true, htmlVersteckt: false, zIndex: 2147483000, ohneBoden: "bleibt", standZeile: "der Boden unter dir wächst", mitBoden: "weicht", nachBootWeg: true },
                [
                    ["kein Ladeschirm (Befund)", { imHtml: false, ohneBoden: "kein Ladeschirm", standZeile: "" }, "kein Ladeschirm im HTML"],
                    ["unter der UI", { zIndex: 5 }, "der Ladeschirm liegt unter der UI"],
                    ["weicht ohne Boden", { ohneBoden: "weicht" }, "ohne Boden unter dem Spieler weicht"],
                    ["bleibt mit Boden", { mitBoden: "bleibt" }, "mit Boden bleibt"],
                    ["blockt die Linsen", { nachBootWeg: false }, "nach dem Boot"],
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
                { gestartet: true, enterFokus: "chat-input", wImFeld: false, gesendet: true, nachSenden: "BODY", wNachSenden: true, nachEsc: "BODY" },
                [
                    ["Enter öffnet nichts (Befund)", { enterFokus: "BODY" }, "Enter öffnet das Gespräch nicht"],
                    ["Fokus bleibt im Feld (Befund)", { nachSenden: "chat-input", wNachSenden: false }, "nach dem Senden bleibt der Fokus im Feld"],
                    ["Esc hält das Feld", { nachEsc: "chat-input" }, "Esc gibt die Welt nicht zurück"],
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
                    szenen: [{ name: "a", krone: 10.8, spielerAchse: 7.3, kameraAchse: 7.0, kameraBrust: 2.0, minM: 2, imStamm: false, inFremderKrone: false, tieferAlsSpieler: true, stammDavor: false }],
                },
                [
                    ["Vorlagen-Maß (Befund)", { stammSkala: 1 }, "Stamm-Hülle im Vorlagen-Maß"],
                    ["im Stamm (Befund)", { szenen: [{ name: "Kiefer", krone: 6.2, spielerAchse: 5, kameraAchse: 0.53, kameraBrust: 6.46, minM: 2, imStamm: true, inFremderKrone: false, tieferAlsSpieler: true, stammDavor: false }] }, "Kiefer: Kamera im Stamm"],
                    ["Nadelwand (Befund)", { szenen: [{ name: "Tanne", krone: 10.8, spielerAchse: 7.28, kameraAchse: 2.86, kameraBrust: 6.62, minM: 2, imStamm: false, inFremderKrone: false, tieferAlsSpieler: true, stammDavor: false }] }, "Tanne: Kamera 2.86 m von der Achse"],
                    ["Kopf füllt das Bild", { szenen: [{ name: "Kopf", krone: 10.8, spielerAchse: 7.28, kameraAchse: 6.98, kameraBrust: 0.42, minM: 2, imStamm: false, inFremderKrone: false, tieferAlsSpieler: false, stammDavor: false }] }, "Kopf: Kamera 0.42 m an der Brust"],
                    ["fremde Krone", { szenen: [{ name: "vor", krone: 6, spielerAchse: 8.5, kameraAchse: 4, kameraBrust: 6, minM: 2, imStamm: false, inFremderKrone: true, tieferAlsSpieler: false, stammDavor: false }] }, "vor: Kamera in einer Krone"],
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
                { gestartet: true, buch: true, haeuser: 20, hinten: 0, cosHinten: [], ausserBild: 0, ersatz: true, ersatzImBau: false },
                [
                    ["umringt (Befund)", { haeuser: 13, hinten: 7, cosHinten: ["-0.61", "-0.86", "-0.70"] }, "7 Häuser hinter dem Spieler"],
                    ["Slot fällt (Befund)", { ersatz: false, ersatzGrund: "der Slot fiel" }, "ein gesperrter Slot fällt"],
                    ["am Bildrand vorbei", { ausserBild: 3 }, "3 Häuser außerhalb des Bildwinkels"],
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
            .replace("hotbar: [null, null, null, null, null, null, null, null, null],", 'hotbar: ["stein_block", "waterfall", "damm", null, null, null, null, null, null],')
            .replace("const anchor = this._siedlungsAnker(plan, o.position || null);", 'const anchor = this._structureSpawnPos("haus_basis", base, { state: this.state }, 3);')
            .replace("t = Math.min(t, this._kameraKronenGrenze(tx, ty, tz, camX, camY, camZ));", "")
            .replace("(Welt verändert: ${compName} ${this.describeProgram(reply.program)}.)", "(Welt verändert: ${JSON.stringify(reply.program)})")
            .replace("for (const z of this._hilfeZeilen()) append(z);", "append(\"'Setze Wetter rainy'\");")
            .replace(/_hilfeZeilen\(\) \{[\s\S]*?\n {4}\}\n/, "_hilfeZeilen() {\n        return [];\n    }\n");
        const vorHtml = html.replace('<div id="ladeschirm" role="status" aria-live="polite">', '<div id="ladeschirm" role="status" aria-live="polite" hidden>');
        const rot = wand(vorStand, vorHtml);
        check(
            "Selbst-Test W: der Vor-Stand (kein Ankunfts-Bild, Alt-Gurt, geschätzter Dorf-Anker, Kamera ohne Krone, Hilfe von Hand, Ladeschirm versteckt, rohes Programm) → W1–W6 feuern",
            rot.filter((w) => !w[1]).length === 6,
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
    zeige("L2a", "das erste Bild ist der Ladeschirm, er weicht dem ersten Weltbild (Boden unter dem Spieler)", out.lade, ladeschirmVerdict, (m) => `im HTML ${m.imHtml} · z ${m.zIndex} · ohne Boden ${m.ohneBoden} („${m.standZeile}") · mit Boden ${m.mitBoden}`);
    zeige("L1", "das Fadenkreuz steht in der Bildmitte und weicht der Schublade", out.kreuz, kreuzVerdict, (m) => `da ${m.da} · Mitte ${m.dx}/${m.dy} px · mit Werkstatt ${m.mitSchublade} · danach ${m.nachSchublade}`);
    zeige("L2b", "„hilfe\" nennt die EINEN Tafeln und die Tasten", out.hilfe, hilfeVerdict, (m) => Object.entries(m.antworten || {}).map(([w, z]) => `„${w}": ${z.unbekannt ? "unbekannt" : `${(z.fehlt || []).length} fehlen`}`).join(" · "));
    zeige("L3", "Enter öffnet das Gespräch, Enter sendet und gibt die Welt zurück", out.gespraech, gespraechVerdict, (m) => `Enter → ${m.enterFokus} · gesendet ${m.gesendet} · danach ${m.nachSenden} · W ${m.wNachSenden} · Esc → ${m.nachEsc}`);
    zeige("L7", "der Start-Gurt liest den Katalog (je Studio-Art ein Werk)", out.gurt, gurtVerdict, (m) => `${(m.hotbar || []).filter(Boolean).join(" · ")} (Arten im Katalog: ${(m.katalogArten || []).join(", ")})`);
    console.log("=== LK — DIE KAMERA UND DER BAUM ===");
    zeige("LK", "die 3rd-Kamera steht nie im Stamm, nie in einer fremden Krone, nie tiefer als der Spieler", out.kamera, kameraVerdict, (m) => `${m.baum} · Stamm × ${m.stammSkala} (Welt × ${m.weltSkala}) · ${(m.szenen || []).map((s) => `${s.name}: Achse ${s.kameraAchse} m (Spieler ${s.spielerAchse}, Krone ${s.krone}), Brust ${s.kameraBrust} m`).join(" · ")}`);
    console.log("=== D8 · D6 · D9 — DIE STIMME UND DAS DORF ===");
    zeige("D8", "der Spieler-Chat trägt Worte, das Log die Zahlen", out.kanal, kanalVerdict, (m) => `${(m.zeilen || []).filter((z) => !/^> /.test(z)).length} Zeilen · Log ${m.siedlungImLog}`);
    zeige("D6", "die KI nennt die Ursache (Dienst · Schlüssel · Proxy)", out.ki, kiVerdict, (m) => `Status „${(m.status || "").slice(0, 60)}" · ohne Schlüssel „${(m.ohneSchluessel || "—").slice(0, 60)}" · Proxy ${m.proxyUrl}`);
    zeige("D9", "das Dorf steht vor dir, ein gesperrter Slot findet einen Ersatz-Ort", out.dorf, dorfVerdict, (m) => `${m.haeuser} Häuser (Log: ${m.platziert} platziert, ${m.ersatzOrte} am Ersatz-Ort, ${m.uebersprungen} übersprungen) · hinten ${m.hinten} · außer Bild ${m.ausserBild} · Ersatz ${m.ersatz} (${m.ersatzAbstand} m) · „${m.dorfZeile}"`);
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
