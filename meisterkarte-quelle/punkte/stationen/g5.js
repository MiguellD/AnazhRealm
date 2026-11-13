// Stationen der Gruppe V (src/g5.js) — Welten und Wege. Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst: jedes Kriterium mit Punkten > 0 und jede Staffel, die ein Zweig kippen soll — den Zweig nennt der Kommentar-Kopf
// des Eintrags (die Aufzählung hier war bei jedem Stations-Merge ein Konflikt). Was sich nicht als Station fassen lässt, steht in
// `module.exports.fehlt` (befehl null, grund) — außerhalb der Liste, damit `run` der anderen Gruppen nicht an ihr bricht.
"use strict";
const { jsonBlock, jsonZeile } = require("../hilfe.cjs");
const PW = require("./proben-welt.cjs"); // die Proben der Welt in der Sitzung (fahrzeug.K5#1, fahrzeug.K2#1)
const { seiteProbe, knapp } = require("./seite.cjs");

// DIE PROBE IN DER SITZUNG (punkte.cjs fahreSitzung, 29.10.): die Welt steht schon — save-server {PORT}, `werkbank start --echt`
// auf {PORT}+20000 (WERKBANK_PORT), eine Linse neben ihr auf {PORT}+20001. `boot` holt eine FRISCHE Welt: die erste ist es schon
// (die Sitzung stellt vor jeder Probe den Grund: Spielstand weg, die Seite neu im warmen Browser), jede weitere über
// `punkte.cjs grundstellung` (dieselbe Grundstellung) — nie ein eigener Boot; `boot --ort X` stellt danach um. Die Schritte
// schreiben ihre Ausgabe unter „@@PUNKTE@@ NAME" (nie „=== " — damit beginnen die Überschriften der Linsen); das Urteil liest die
// Abschnitte. Bis 29.10. bootete jede Station hier ihre eigene Welt (weg/boot: save-server, werkbank start, netstat je Boot).
const KOPF = [
    "set -u",
    "WP=$(({PORT} + 20000)); LP=$(({PORT} + 20001)); export WERKBANK_PORT=$WP",
    'L="${TEMP:-/tmp}/punkte-g5-$WP"; mkdir -p "$L"; W="node scripts/werkbank.cjs"; FRISCH=1',
    'boot() { if [ -z "$FRISCH" ]; then node "$PUNKTE_MASCHINE" grundstellung > "$L/grund.txt" 2>&1 || { echo "@@PUNKTE@@ START ROT"; cat "$L/grund.txt"; exit 3; }; fi; FRISCH=; ' +
        'if [ $# -gt 0 ]; then timeout 300 $W umstellen "$@" > "$L/boot.txt" 2>&1 || { echo "@@PUNKTE@@ START ROT"; tail -5 "$L/boot.txt"; exit 3; }; fi; }',
    'teil() { echo "@@PUNKTE@@ $1"; shift; timeout 900 "$@"; echo "@@PUNKTE@@ EXIT $?"; }',
];
// die Probe einer Station: Deckel sek, die Schritte nach dem KOPF
const sitzung = (sek, ...zeilen) => ({ sek, befehl: ["bash", "-c", [...KOPF, ...zeilen].join("\n")] });
// (DER EIGENE BOOT von siedlung.K5 fiel am 29.10.: auch dort misst die Kälte der EINE Start der Sitzung — `dorfErwachen` unten.)
const K = { K: "{KOORD}" }; // die Mess-Skripte der Berichte liegen im Koordinations-Baum (bericht/…)

// ───────── DIE LEBENDE SPRACH-ZÄHLUNG (spielgang.K5#1, w6-spielgang-decke) — läuft als `node -e` im Spiel-Baum, Null-Renderer ─────────
// Den CODE zählt die EINE Wand des Baums (`scripts/diag-sprache.cjs`, per require `befund(baum())`: jede UI-Senke mit Wort-Text, jedes
// Daten-Etikett, jeder fehlende oder ungelesene Schlüssel); das DOM zählt diese Probe (bis w6-spielgang-decke als `diag-sprache
// --lebend` im Baum, dort ohne Leser in der CI — die Decke scripts/ zahlte +1895 Atome für Code, den nur die Station liest).
async function sprachLauf(port, aus) {
    const path = require("path");
    const fs = require("fs");
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const S = require(path.resolve("scripts/diag-sprache.cjs")); // ohne Export (der Stand vor w6-spielgang-decke) endet hier der Lauf
    // die Erzeuger-Wache (vor jedem Skript der Seite): je Schreiber von Sprache der erste Rahmen in stamm/ ohne die Helfer
    function ZEUGE() {
        const zeugen = (window.__sprachZeugen = new WeakMap());
        const merke = (o, v) => {
            if (!o || typeof v !== "string" || !/[A-Za-zÄÖÜäöüß]{2,}/.test(v)) return;
            for (const z of String(new Error().stack).split("\n")) {
                const m = /\/((?:stamm|worlds)\/[^\s:)?]+)[^:]*:(\d+)/.exec(z);
                const fn = (/at (?:async )?([\w.$]+) \(/.exec(z) || [])[1] || "";
                if (m && !/(^|\.)(_el|_elAppend|_tSetze|_chatEcho)$/.test(fn))
                    return zeugen.set(o, `${m[1]}:${m[2]} ${fn.replace(/^AnazhRealm[\w$]*\./, "")}`.trim());
            }
        };
        const haken = (proto, feld, ziel = (o) => o) => {
            const d = Object.getOwnPropertyDescriptor(proto, feld);
            Object.defineProperty(proto, feld, { ...d, set(v) { merke(ziel(this), v); d.set.call(this, v); } });
        };
        haken(Node.prototype, "textContent");
        haken(Element.prototype, "innerHTML");
        haken(CharacterData.prototype, "data", (n) => n.parentElement || n);
        haken(HTMLElement.prototype, "title");
        const [ctn, sa] = [Document.prototype.createTextNode, Element.prototype.setAttribute];
        Document.prototype.createTextNode = function (v) { const n = ctn.call(this, v); merke(n, v); return n; };
        Element.prototype.setAttribute = function (a, v) { merke(this, v); return sa.call(this, a, v); };
    }
    // die Zählung im Fenster: je Zeile Erzeuger · Ort · Text, Daten, Marke; `wechsel` gibt die stehenden
    function ZAEHLE(wechsel) {
        const zeugen = window.__sprachZeugen || new WeakMap();
        const ort = (el) => (el.closest("[id]") ? "#" + el.closest("[id]").id + " " : "") + el.tagName.toLowerCase();
        const zeilen = [];
        const zeile = (n, el, wo, t) => {
            t = String(t).replace(/\s+/g, " ").trim();
            if (!/[A-Za-zÄÖÜäöüß]{2,}/.test(t)) return;
            const name = `${zeugen.get(n) || zeugen.get(el) || "index.html"} · ${ort(el)}${wo}: ${t.slice(0, 90)}`;
            const daten = !!el.closest('[translate="no"]');
            const marke = t.includes("⟦");
            zeilen.push({ name, daten, marke, hart: daten ? marke : /[A-Za-zÄÖÜäöüß]{2,}/.test(t.replace(/⟦[^⟧]*⟧|⁨[^⁩]*⁩/g, " ")) });
        };
        const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode())
            if (!/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(n.parentElement.tagName)) zeile(n, n.parentElement, "", n.textContent);
        zeile(document.documentElement, document.documentElement, " <title>", document.title);
        for (const el of document.body.querySelectorAll("[title],[placeholder],[aria-label],[alt]"))
            for (const a of ["title", "placeholder", "aria-label", "alt"]) if (el.hasAttribute(a)) zeile(el, el, " @" + a, el.getAttribute(a));
        if (wechsel) return zeilen.filter((z) => z.marke && !z.daten).map((z) => z.name);
        const C = window.anazhRealm.constructor;
        const [de, en] = [C.TEXTE.de, C.TEXTE.en || {}];
        return {
            sprache: C._sprache(),
            glieder: Object.getOwnPropertyNames(C.prototype).length,
            zeilen: zeilen.length,
            markiert: zeilen.filter((z) => z.marke && !z.hart).length,
            hart: zeilen.filter((z) => z.hart).map((z) => z.name),
            daten: zeilen.filter((z) => z.daten).length,
            quelle: Object.keys(de).every((k) => k in en) && `AnazhRealm.TEXTE (de ${Object.keys(de).length}, en ${Object.keys(en).length})`,
        };
    }
    const statisch = S.befund(S.baum());
    const out = { glieder: 0, code: statisch.length, beispiele: statisch.slice(0, 3) };
    const server = WB.statikServer();
    await server.lausche(Number(port));
    const { browser, page } = await WB.nullSeite({ frist: 300000 });
    try {
        await page.evaluateOnNewDocument(ZEUGE);
        await server.zeige(page, 120000, "index.html?sprache=pseudo");
        await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa > 0));
        Object.assign(out, await page.evaluate(ZAEHLE, false));
        // der Selbsttest im Lauf: eine harte Zeile am Leib, eine Zeile der Tafel, die beim Wechsel niemand neu liest
        const [mit, stehen] = await page.evaluate((f) => {
            const C = window.anazhRealm.constructor;
            const zeile = (id, t) => document.body.appendChild(Object.assign(document.createElement("i"), { id, hidden: true, textContent: t }));
            zeile("sprach-mutante-hart", "Hallo Welt");
            zeile("sprach-mutante-steht", C._t(Object.keys(C.TEXTE.de).find((k) => /^[A-Za-zÄÖÜäöüß ]{4,}$/.test(C.TEXTE.de[k]))));
            const Z = new Function("return " + f)();
            const mit = Z(false).hart;
            document.getElementById("sprach-mutante-hart").remove();
            window.anazhRealm._spracheSetzen("en");
            return [mit, Z(true)];
        }, String(ZAEHLE));
        const muss = (liste, id) => liste.some((h) => h.includes("#" + id));
        out.blind = ["sprach-mutante-hart", "sprach-mutante-steht"].filter((id, i) => !muss(i ? stehen : mit, id));
        out.stehenNamen = stehen.filter((h) => !h.includes("#sprach-mutante-steht"));
        out.stehen = out.stehenNamen.length;
        out.dom = out.hart.length;
    } catch (e) {
        out.fehler = String(e.message).split("\n")[0].slice(0, 300);
    } finally {
        fs.writeFileSync(aus, JSON.stringify(out));
        console.log("TEXTE " + JSON.stringify(out));
        await browser.close().catch(() => {});
        server.close();
        process.exit(0);
    }
}

// ───────── DIE KI SPRICHT DIE SPRACHE DES SPIELERS (spielgang.K5#2, w8-sprache) — läuft als `node -e` im Spiel-Baum, Null-Renderer ─────────
// Die Sprache des Spielers ist EIN Zustand der Welt (die Spalte der Tafel, `_spracheSetzen`); je Sprache (de · en) geht JEDER Satz
// ihres Korpus-Teils (spec/abnahme/ki-korpus.json: `saetze` und `en.saetze`, dieselben Prädikate an derselben Stelle) zwei Wege:
//   REGEL — ohne KI über den Chat des Spielers (`processChatCommand`: die Sätze der Welt, ihre Gesetze, ihre Absagen, die Antwort
//           der Welt auf „warum regnet es?") · NEXUS — über den Weg der KI (`maybeAnswerWithLlm` → `llmCall` → `dslRun`) gegen den
//           Prüf-Anbieter der Probe: er antwortet in der Sprache, die der System-Prompt verlangt (die Zeile `ki.welt.say` der Tafel
//           in ihrer Spalte), mit dem Programm des Mitschnitts (spec/profiband/ratsche-ki-korpus.json, der DE-Satz derselben Stelle).
// Dazu der Fehler-Fall des Nexus-Wegs: der Prüf-Anbieter antwortet leer (die Tür der KI nennt den Fehler).
// Gemessen je Satz jede neue Zeile des Chats und der Stimme (`grokRender`): ihre Sprache an ihren Funktions-Wörtern (Text in
// Anführung ist Datum: ein Befehl der Welt, das Wort des Spielers) — eine Zeile mit Wörtern der anderen Sprache ist FREMD; dazu je
// Satz des Nexus-Wegs die Sprache, die der Prompt verlangte. Bei „warum regnet es?" schreibt die Probe den Regen je Fall (das Wort
// des Spielers `_setWeather` „human" · der Wunsch des Nexus, den der Zug zieht): der Kontext der KI und die Antwort der Welt nennen
// den wahren Schreiber (affekt.K4#2). DAS MODELL: trägt der lokale Anbieter (KI_ENDPUNKT, KI_MODELL — am Laptop ollama) das Modell,
// fragt die Probe es mit jedem Satz in beiden Sprachen; sonst steht MODELL mit seinem Grund (ungemessen, nie still grün).
// DER SELBSTTEST IM LAUF (EN): „prompt-de" (der Prompt verlangt Deutsch) · „tafel-de" (die Welt liest die DE-Spalte) · „schreiber"
// (der Kontext nennt die Front) — jeder muss ROT messen, sonst ist die Probe blind.
async function kiSpracheLauf(port, aus) {
    const path = require("path");
    const fs = require("fs");
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const { AUSGABE_INSTALL } = require(path.resolve("scripts/lib/ausgabe-aufnahme.cjs"));
    const K = JSON.parse(fs.readFileSync(path.resolve("spec/abnahme/ki-korpus.json"), "utf8"));
    const R = JSON.parse(fs.readFileSync(path.resolve("spec/profiband/ratsche-ki-korpus.json"), "utf8"));
    const TEIL = { de: Object.keys(K.saetze || {}), en: Object.keys((K.en && K.en.saetze) || {}) };
    const soll = (sp, i) => (sp === "en" ? K.en.saetze : K.saetze)[TEIL[sp][i]];
    const out = { saetze: { de: TEIL.de.length, en: TEIL.en.length }, gleich: TEIL.de.length === TEIL.en.length, laeufe: {}, mutanten: {}, schreiber: {}, modell: null };
    out.gleich = out.gleich && TEIL.de.every((s, i) => JSON.stringify(soll("de", i)) === JSON.stringify(soll("en", i)));
    let SAY = null;
    const LEER = "(leer)";
    const anfragen = [];
    // der Prüf-Anbieter: die Sprache, die der Prompt verlangt, und das Programm des Mitschnitts
    const pruefer = (req) =>
        new Promise((ok) => {
            let b = "";
            req.on("data", (d) => (b += d));
            req.on("end", () => {
                const j = JSON.parse(b);
                const sys = String(j.messages[0].content);
                const u = String(j.messages[j.messages.length - 1].content);
                const satz = u.slice(u.lastIndexOf("Spieler sagt: ") + 14);
                const sp = SAY ? Object.keys(SAY).find((s) => sys.includes(SAY[s])) || null : null;
                const i = Math.max(TEIL.de.indexOf(satz), TEIL.en.indexOf(satz));
                const p = i >= 0 ? (R.mitschnitt || {})[TEIL.de[i]] : undefined;
                anfragen.push({ satz, sp, kontext: u.slice(0, u.lastIndexOf("Spieler sagt: ")) });
                // der Fehler-Fall: eine leere Antwort (die Tür der KI sagt es in der Sprache des Spielers)
                if (satz === LEER) return ok(JSON.stringify({ message: { role: "assistant", content: "" } }));
                const say = { de: "Ich höre dich, und die Welt antwortet dir.", en: "I hear you, and the world answers you." }[sp];
                ok(JSON.stringify(say ? { message: { role: "assistant", content: JSON.stringify({ say, program: p || null }) } } : { error: "kein Prompt mit Sprache" }));
            });
        });
    // das Modell der Sitzung (am Laptop): trägt der Anbieter es?
    const ep = String(process.env.KI_ENDPUNKT || "").replace(/\/+$/, "");
    const modell = process.env.KI_MODELL || "";
    let modellDa = null;
    if (ep && modell)
        try {
            const t = await fetch(ep + "/api/tags", { signal: AbortSignal.timeout(4000) }).then((x) => x.json());
            modellDa = (t.models || []).some((m) => m.name === modell || m.name === modell + ":latest") ? true : "trägt " + modell + " nicht";
        } catch (e) {
            modellDa = ep + " antwortet nicht (" + String(e.message).slice(0, 60) + ")";
        }
    else modellDa = "kein KI_ENDPUNKT/KI_MODELL (der Läufer stellt kein Modell)";
    const server = WB.statikServer({ seiten: { "/api/chat": pruefer } });
    await server.lausche(Number(port));
    const { browser, page } = await WB.nullSeite({ frist: 900000 });
    // IN DER SEITE: die Stimme stellen (Anbieter, Modell, Endpunkt — wie der Spieler im Fenster der KI), die Mutanten
    const STIMME = (a) => {
        const r = window.anazhRealm;
        const st = r.state;
        if (!window.__kiStimme) {
            const gr = r.grokRender;
            window.__kiStimme = [];
            r.grokRender = function (t) {
                window.__kiStimme.push(String(t));
                return gr.call(this, t);
            };
            window.__kiOrig = { t: r.constructor._t, ki: r.constructor._spracheKi, sch: r._wetterSchreiberZeile };
        }
        const C = r.constructor;
        const O = window.__kiOrig;
        [C._t, C._spracheKi, r._wetterSchreiberZeile] = [O.t, O.ki, O.sch];
        if (a.mutante === "prompt-de") C._spracheKi = () => "de";
        if (a.mutante === "tafel-de") C._t = (k, w) => C._tIn("de", k, w);
        if (a.mutante === "schreiber") r._wetterSchreiberZeile = () => ["wetter.schreiber.front"];
        if (a.sprache) r._spracheSetzen(a.sprache);
        if (a.endpunkt) {
            for (const [id, w] of [["llm-provider", "ollama"], ["llm-model", a.modell], ["llm-endpoint", a.endpunkt], ["llm-use-proxy", true]]) {
                const el = document.getElementById(id);
                el[w === true ? "checked" : "value"] = w;
                el.dispatchEvent(new Event("change"));
            }
        }
        if (!!st.llm.enabled !== !!a.ki) document.getElementById("llm-toggle").click();
        return { sprache: C._sprache(), ki: !!st.llm.enabled, say: { de: C.TEXTE.de["ki.welt.say"], en: C.TEXTE.en["ki.welt.say"] }, schreiber: { de: { spieler: C.TEXTE.de["wetter.schreiber.spieler"], nexus: C.TEXTE.de["feldstimme.wer.nexus"] }, en: { spieler: C.TEXTE.en["wetter.schreiber.spieler"], nexus: C.TEXTE.en["feldstimme.wer.nexus"] } } };
    };
    // IN DER SEITE: ein Satz auf einem Weg — die neuen Zeilen des Chats (ohne das Echo des Satzes) und der Stimme
    const SATZ = async (a) => {
        const r = window.anazhRealm;
        const st = r.state;
        const box = document.getElementById("chat-output");
        const [n0, s0] = [box.children.length, window.__kiStimme.length];
        if (a.fall) {
            st.weatherEffectTime = 0;
            st.wetterWort = null;
            st.wetterWuensche = [];
            r._setWeather("sunny", "auto-zug");
            if (a.fall === "spieler") r._setWeather("rainy", "human");
            // der Wunsch des Nexus zieht DER Zug (w28-station-quelle; bis dahin „auto-zug“ ohne Zug: Schreiber „front“)
            else r._setWeather("rainy", "nexus"), r._wetterZugZiehen(Math.floor(st.spielZeit / r.constructor.WETTER_ZUG_SEK) + 1);
        }
        const t0 = performance.now();
        if (a.weg === "regel") r.processChatCommand(a.satz);
        else await r.maybeAnswerWithLlm(a.satz, (z) => r._chatEcho(z));
        const ms = Math.round(performance.now() - t0);
        for (let i = 0; i < 6; i++) {
            r._gameLoopTick(performance.now());
            await new Promise((ok) => setTimeout(ok, 20));
        }
        const zeilen = [...box.children]
            .slice(n0)
            .map((el) => el.textContent.replace(/[⁦-⁩]/g, "").replace(/\s+/g, " ").trim())
            .filter((t) => t && !t.startsWith("> "));
        return { zeilen, stimme: window.__kiStimme.slice(s0), ms, schreiber: st.wetterSchreiber };
    };
    const lauf = async (sp, weg, opt = {}) => {
        const satze = opt.saetze || [...TEIL[sp], ...(weg === "nexus" && !opt.endpunkt.includes(":11434") ? [LEER] : [])];
        const a0 = anfragen.length;
        const S = await page.evaluate(STIMME, { sprache: sp, ki: weg !== "regel", mutante: opt.mutante || null, endpunkt: opt.endpunkt || null, modell: opt.modell || "pruefer" });
        if (S.sprache !== sp) throw new Error("die Welt spricht " + S.sprache + ", nicht " + sp);
        const e = [];
        for (const satz of satze) {
            const i = TEIL[sp].indexOf(satz);
            const faelle = soll(sp, i) && soll(sp, i).schreiber ? Object.keys(soll(sp, i).schreiber) : [null];
            for (const fall of faelle) {
                const n = anfragen.length;
                const x = await page.evaluate(SATZ, { satz, weg: weg === "regel" ? "regel" : "ki", fall });
                const q = anfragen.slice(n);
                e.push({ satz, fall, ...x, prompt: q.map((z) => z.sp), kontext: q.map((z) => z.kontext.slice(0, 400)) });
            }
        }
        return { sprache: sp, weg, mutante: opt.mutante || null, anfragen: anfragen.length - a0, saetze: e };
    };
    try {
        await server.zeige(page, 120000);
        await page.evaluate(() => window.__weltDa((r) => r.state && r.state.rendererReady && r.state.blueprints && r.nexus));
        await page.evaluate(AUSGABE_INSTALL);
        const S0 = await page.evaluate(STIMME, { ki: false });
        SAY = S0.say;
        out.schreiberNamen = S0.schreiber;
        const pruef = "http://127.0.0.1:" + port + "/";
        for (const sp of ["de", "en"]) {
            out.laeufe[sp + ".regel"] = await lauf(sp, "regel");
            out.laeufe[sp + ".nexus"] = await lauf(sp, "nexus", { endpunkt: pruef });
        }
        // DER SELBSTTEST IM LAUF (EN, je Mutante die ersten acht Sätze und „warum regnet es?")
        const wenige = [...TEIL.en.slice(0, 8), TEIL.en[TEIL.en.length - 1]];
        out.mutanten["prompt-de"] = await lauf("en", "nexus", { endpunkt: pruef, mutante: "prompt-de", saetze: wenige });
        out.mutanten["tafel-de"] = await lauf("en", "regel", { mutante: "tafel-de", saetze: wenige });
        out.mutanten["schreiber"] = await lauf("en", "nexus", { endpunkt: pruef, mutante: "schreiber", saetze: wenige.slice(-1) });
        await page.evaluate(STIMME, { ki: false });
        // DAS MODELL (am Laptop): jeder Satz in beiden Sprachen über den Weg der KI
        if (modellDa === true) {
            out.modell = { endpunkt: ep, name: modell, laeufe: {} };
            for (const sp of ["de", "en"]) out.modell.laeufe[sp] = await lauf(sp, "modell", { endpunkt: ep + "/", modell });
        } else out.modell = { grund: modellDa };
    } catch (e) {
        out.fehler = String((e && e.message) || e).split("\n")[0].slice(0, 300);
    } finally {
        fs.writeFileSync(aus, JSON.stringify(out));
        console.log("KISPRACHE " + JSON.stringify(out));
        await browser.close().catch(() => {});
        server.close();
        process.exit(0);
    }
}

// DIE SPRACHE EINER ZEILE (rein; Probe, Urteil und Proben): ihre Funktions-Wörter je Sprache — Text in Anführung („…“ “…” "…" '…')
// ist Datum (ein Befehl der Welt, das Wort des Spielers, ein Name), ein Wort mit Umlaut oder ß ist Deutsch.
const SPRACH_WORT = {
    de: new Set("der das den dem des und ist nicht ein eine einen einem einer ich du er es wir ihr sie mit auf für von zu zum zur im vom nach wird werden sich sind kein keine keinen noch nur wie aber oder wenn dann hier dir mir dich mich bei aus vor nichts kennt steht welt gesetzt gebaut gewachsen dein deine weil auch schon jetzt wetter gesetz geschrieben hat".split(" ")),
    en: new Set("the and is not of to you your it its with for from this that there here nothing world are be been has have can cannot does doesn't don't i i'm my me into at on by or if then no just more than shore water creature creatures grows built placed weather law written which what".split(" ")),
};
function zeilenSprache(t) {
    const frei = String(t)
        .replace(/„[^“”"]*[“”"]|“[^”]*”|"[^"]*"|(^|[\s(:])'[^'\n]*'/g, " ")
        .toLowerCase();
    const n = { de: 0, en: 0 };
    for (const w of frei.split(/[^a-zäöüß']+/)) {
        if (!w) continue;
        if (/[äöüß]/.test(w) || SPRACH_WORT.de.has(w)) n.de++;
        if (SPRACH_WORT.en.has(w)) n.en++;
    }
    return n;
}
// das Urteil eines Laufs: je Satz die Zeilen in der Sprache des Laufs, keine fremde, der Prompt (Nexus-Weg) in ihr; „warum regnet es?"
// nennt den wahren Schreiber (Kontext der KI, Antwort der Welt)
function kiSpracheLaufUrteil(l, namen) {
    const sp = l.sprache;
    const anders = sp === "de" ? "en" : "de";
    const r = { saetze: l.saetze.length, zeilen: 0, eigen: 0, fremd: [], stumm: [], prompt: 0, promptFalsch: [], schreiber: [] };
    for (const e of l.saetze) {
        let eigen = 0;
        for (const z of [...e.zeilen, ...e.stimme]) {
            const n = zeilenSprache(z);
            r.zeilen++;
            if (n[anders] > 0) r.fremd.push("„" + e.satz + "“ → " + z.slice(0, 120));
            else if (n[sp] > 0) eigen++;
        }
        r.eigen += eigen;
        if (!eigen) r.stumm.push(e.satz);
        if (l.weg === "nexus") {
            if (e.prompt.length && e.prompt.every((p) => p === sp)) r.prompt++;
            else r.promptFalsch.push("„" + e.satz + "“ verlangt " + (e.prompt.join("/") || "nichts"));
        }
        if (e.fall && namen && l.weg !== "modell") {
            const wahr = namen[sp][e.fall];
            const falsch = namen[sp][e.fall === "spieler" ? "nexus" : "spieler"];
            const text = l.weg === "regel" ? e.zeilen.join(" ") : (e.kontext || []).join(" ");
            if (!(text.includes(wahr) && !text.includes(falsch))) r.schreiber.push(e.fall + " (" + l.weg + ")");
        }
    }
    r.gruen = r.saetze > 0 && !r.fremd.length && !r.stumm.length && !r.promptFalsch.length && !r.schreiber.length;
    return r;
}
function kiSpracheUrteil(j) {
    if (!j || !j.laeufe) return { gruen: false, zahl: "keine KISPRACHE-Zeile" };
    if (j.fehler) return { gruen: false, zahl: "Lauf: " + j.fehler };
    const rot = [];
    if (!(j.saetze.de > 0) || j.saetze.de !== j.saetze.en) rot.push("der Korpus trägt keinen EN-Teil (de " + j.saetze.de + ", en " + j.saetze.en + ")");
    else if (!j.gleich) rot.push("der EN-Teil trägt nicht dieselben Prädikate an derselben Stelle");
    const zahl = [];
    for (const k of ["de.regel", "de.nexus", "en.regel", "en.nexus"]) {
        const l = j.laeufe[k];
        if (!l) {
            rot.push(k + " nicht gelaufen");
            continue;
        }
        const u = kiSpracheLaufUrteil(l, j.schreiberNamen);
        zahl.push(k + " " + u.saetze + " Sätze · " + u.zeilen + " Zeilen, fremd " + u.fremd.length + (l.weg === "nexus" ? " · Prompt " + u.prompt + "/" + u.saetze : ""));
        if (u.fremd.length) rot.push(k + " fremd: " + u.fremd.slice(0, 2).join(" | "));
        if (u.stumm.length) rot.push(k + " ohne Zeile in " + l.sprache + ": " + u.stumm.slice(0, 3).join(" · "));
        if (u.promptFalsch.length) rot.push(k + " Prompt: " + u.promptFalsch.slice(0, 2).join(" · "));
        if (u.schreiber.length) rot.push(k + " nennt nicht den wahren Schreiber: " + u.schreiber.join(", "));
    }
    const blind = ["prompt-de", "tafel-de", "schreiber"].filter((m) => !(j.mutanten[m] && !kiSpracheLaufUrteil(j.mutanten[m], j.schreiberNamen).gruen));
    if (blind.length) rot.push("Selbsttest blind: " + blind.join(", ") + " misst GRÜN");
    let modell = "MODELL ungemessen: " + ((j.modell && j.modell.grund) || "kein Lauf");
    if (j.modell && j.modell.laeufe) {
        const m = ["de", "en"].map((sp) => [sp, kiSpracheLaufUrteil(j.modell.laeufe[sp] || { sprache: sp, weg: "modell", saetze: [] }, j.schreiberNamen)]);
        modell = "MODELL " + j.modell.name + " @ " + j.modell.endpunkt + ": " + m.map(([sp, u]) => sp + " " + u.saetze + " Sätze, " + u.eigen + "/" + u.zeilen + " Zeilen in " + sp + ", fremd " + u.fremd.length).join(" · ");
        for (const [sp, u] of m) {
            if (u.fremd.length) rot.push("Modell " + sp + " fremd: " + u.fremd.slice(0, 2).join(" | "));
            if (u.stumm.length) rot.push("Modell " + sp + " ohne Antwort in " + sp + ": " + u.stumm.slice(0, 3).join(" · "));
        }
    }
    return { gruen: !rot.length, zahl: zahl.join(" · ") + " · Selbsttest " + (blind.length ? "BLIND" : "3/3 ROT") + " · " + modell + (rot.length ? " · ROT " + rot.join("; ") : "") };
}

// DIE PROBEN des Urteils (knapp erzeugt): je Lauf ein Satz und die zwei Fälle von „warum regnet es?"
const KS_NAMEN = {
    de: { spieler: "Du selbst — dein Wort steht, bis du es freigibst", nexus: "Der Nexus" },
    en: { spieler: "You yourself — your word stands until you release it", nexus: "The Nexus" },
};
const KS_ZEILE = { de: "Grok: Ich höre dich, und die Welt antwortet dir.", en: "Grok: I hear you, and the world answers you." };
const ksWarum = (sp, f) => (sp === "de" ? "Das Wetter ist „Regen“. Geschrieben hat es: " : "The weather is “rain”. Written by: ") + KS_NAMEN[sp][f] + ".";
function ksLauf(sp, weg, o = {}) {
    const ki = weg !== "regel";
    const satz = (satz, fall, zeile) => ({ satz, fall, zeilen: [zeile], stimme: [], prompt: ki ? [o.prompt || sp] : [], kontext: ki && fall ? ["Das Wetter schrieb: " + KS_NAMEN[sp][fall]] : [] });
    return { sprache: sp, weg, saetze: [satz("s1", null, o.zeile || KS_ZEILE[sp]), ...["spieler", "nexus"].map((f) => satz("w", f, ki ? KS_ZEILE[sp] : o.warum || ksWarum(sp, f)))] };
}
function ksRoh(o = {}) {
    const laeufe = {};
    for (const sp of ["de", "en"]) for (const weg of ["regel", "nexus"]) laeufe[sp + "." + weg] = ksLauf(sp, weg, (o.lauf || {})[sp + "." + weg]);
    const mutanten = { "prompt-de": ksLauf("en", "nexus", { prompt: "de", zeile: KS_ZEILE.de }), "tafel-de": ksLauf("en", "regel", { zeile: "Unbekannter Befehl — sag „hilfe“, dann zeigt dir die Welt, was sie versteht." }), schreiber: ksLauf("en", "nexus", { warum: ksWarum("en", "spieler") }) };
    mutanten.schreiber.saetze.forEach((e) => (e.kontext = e.fall ? ["Das Wetter schrieb: The world's weather front (its drift)"] : []));
    const j = { saetze: { de: 42, en: o.en == null ? 42 : o.en }, gleich: true, laeufe, mutanten: { ...mutanten, ...(o.mutanten || {}) }, schreiberNamen: KS_NAMEN, modell: o.modell || { grund: "kein KI_ENDPUNKT/KI_MODELL (der Läufer stellt kein Modell)" } };
    return "KISPRACHE " + JSON.stringify(j);
}
const KS_PROBEN = [
    { name: "die Welt antwortet in de und en, der Prompt verlangt die Sprache des Spielers, ohne Modell beim Namen", stdout: ksRoh(), gruen: true },
    { name: "die Tat in Worten steht deutsch im englischen Chat", stdout: ksRoh({ lauf: { "en.nexus": { zeile: "(World changed: Grok lässt das Wetter zu „Regen“ wechseln.)" } } }), gruen: false },
    { name: "der Prompt verlangt Deutsch, der Spieler spricht EN", stdout: ksRoh({ lauf: { "en.nexus": { prompt: "de" } } }), gruen: false },
    { name: "eine Antwort des Regel-Wegs ohne Zeile in der Sprache des Spielers", stdout: ksRoh({ lauf: { "de.regel": { zeile: "→ 3" } } }), gruen: false },
    { name: "der Korpus trägt keinen EN-Teil", stdout: ksRoh({ en: 0 }), gruen: false },
    { name: "der Selbsttest ist blind (eine Mutante misst grün)", stdout: ksRoh({ mutanten: { "tafel-de": ksLauf("en", "regel") } }), gruen: false },
    { name: "„warum regnet es?“ nennt nicht den wahren Schreiber", stdout: ksRoh({ lauf: { "de.regel": { warum: ksWarum("de", "spieler") } } }), gruen: false },
    { name: "das Modell antwortet in jeder Sprache des Spielers", stdout: ksRoh({ modell: { endpunkt: "http://127.0.0.1:11434", name: "qwen3:4b-instruct", laeufe: { de: ksLauf("de", "modell"), en: ksLauf("en", "modell") } } }), gruen: true },
    { name: "das Modell antwortet deutsch, der Spieler spricht EN", stdout: ksRoh({ modell: { endpunkt: "http://127.0.0.1:11434", name: "qwen3:4b-instruct", laeufe: { de: ksLauf("de", "modell"), en: ksLauf("en", "modell", { zeile: "Grok: Ich lasse es regnen, weil du es wolltest." }) } } }), gruen: false },
    { name: "kein Lauf (die Welt kam nicht)", stdout: 'KISPRACHE {"fehler":"Welt kam nicht","laeufe":{}}', gruen: false },
];

// ───────── DER SPIELGANG AUS DER SPUR (spielgang.K1#1, w8-spielgang-k1) — `node -e` im Spiel-Baum, Null-Renderer ─────────
// Die Spur `spec/spielgang/k1-spur.json` trägt die aufgenommenen Eingaben eines Spielers (Tasten, Maus, Gamepad — echte
// CDP-Ereignisse, die Aufnahme nimmt nur isTrusted), gestempelt mit dem Sim-Schritt seit der Kontrolle; der Abspieler des Spiels
// (`_spurAnlegen`/`_spurTakt`, `?spur=<pfad>`) wirft sie in DIESELBEN Hörer zurück. Die Station lädt EINE Welt, ruft nie eine
// Methode, die die Welt stellt (kein eval, kein umstellen): sie gibt dem Null-Renderer seine Uhr (`__handTakt`, je 20 ms ein Takt
// — er tickt nicht selbst) und LIEST je Takt Lage, Blick und Sicht und an jeder Marke der Spur den Stand. Je Schritt die Zahl seines
// Bereichs: ankommen (die Kontrolle in ms, die erste Eingabe fängt den Zeiger) · laufen und sehen (Meter des Wegs, Grad des Blicks,
// Sicht Ego → Third → Ego) · bauen (das Werk der Werkstatt steht, die Eingaben bis dahin) · mit der KI erschaffen (der Satz stellt
// ein Werk der Studio-Art: spawn_studio, die Grundstufe ohne Schlüssel) · benutzen (der Leib sitzt auf der gebauten Bank).
const SPIELGANG = { spur: "spec/spielgang/k1-spur.json", werk: "bank_sitzbank", wegM: 5, blickGrad: 45, mindest: 3 };
async function spielgangLauf(port, aus, G) {
    const path = require("path");
    const fs = require("fs");
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const out = { spur: G.spur, laden: 0, schritte: {} };
    const server = WB.statikServer();
    await server.lausche(Number(port));
    const { browser, page } = await WB.nullSeite({ frist: 300000 });
    page.on("framenavigated", (f) => f === page.mainFrame() && out.laden++);
    try {
        const spur = JSON.parse(fs.readFileSync(G.spur, "utf8"));
        const marken = Object.entries(spur.marken).sort((a, b) => a[1] - b[1]);
        out.marken = marken.map(([m]) => m);
        await page.setViewport({ width: spur.schirm[0], height: spur.schirm[1] });
        await server.zeige(page, 120000, "index.html?spur=" + G.spur);
        await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa > 0 || (r._spur && r._spur.fehler)));
        if (!(await page.evaluate(() => !!r._spur))) throw new Error("kein Abspieler im Spiel: ?spur= liest niemand (r._spur fehlt)");
        // DIE UHR und DER LESER: je Takt [Schritt, x, z, Gier, Sicht] — gelesen, nie gestellt
        await page.evaluate(() => {
            window.__lese = [];
            setInterval(() => {
                __handTakt();
                window.__lese.push([r._spur.schritt, pm.position.x, pm.position.z, st.yaw, st.cameraMode]);
            }, 20);
        });
        const stand = () =>
            page.evaluate((werk) => {
                const [sp, bank] = [r._spur, st.architectures.find((a) => a.type === werk)];
                return {
                    s: sp.schritt, i: sp.i, fehler: sp.fehler || null, verfehlt: sp.verfehlt.length, kontrolleMs: Math.round(st._weltbildDa || 0),
                    lade: r._ladeschirmSteht(), zeiger: st.isPointerLocked, modus: r.getGameMode(),
                    werke: st.architectures.filter((a) => a.type === werk).length,
                    studio: st.architectures.filter((a) => /^w-/.test(String(a.id))).map((a) => a.type),
                    sitzt: !!bank && st.player.mountedArch === bank.id,
                    satz: ([...document.querySelectorAll("#chat-output > div")].pop() || { textContent: "" }).textContent,
                };
            }, G.werk);
        const am = {};
        for (const [m, s] of marken) {
            await page.waitForFunction((n) => r._spur.fehler || r._spur.schritt >= n, { timeout: 180000, polling: 10 }, s);
            am[m] = await stand();
            if (am[m].fehler) throw new Error("die Spur lädt nicht: " + am[m].fehler);
        }
        const lese = await page.evaluate(() => window.__lese);
        const ende = am[marken[marken.length - 1][0]];
        Object.assign(out, { abgespielt: ende.i, eingaben: spur.zeilen.length, verfehlt: ende.verfehlt, kontrolleMs: am[marken[0][0]].kontrolleMs });
        const folgt = (m) => out.marken[out.marken.indexOf(m) + 1];
        const nach = (m) => am[folgt(m)];
        const S = out.schritte;
        // die Eingaben eines Schritts: je Taste, Knopf und Raste eine (keydown ohne Wiederholung, mousedown, wheel)
        const eingaben = (m) =>
            spur.zeilen.map((z) => z.split(" ")).filter(([s, art, , , , mods]) => +s >= spur.marken[m] && +s < spur.marken[folgt(m)] && (art === "mousedown" || art === "wheel" || (art === "keydown" && !(+mods & 16)))).length;
        if (am.ankommen) S.ankommen = { kontrolleMs: am.ankommen.kontrolleMs, zeiger: nach("ankommen").zeiger };
        if (am.laufen) {
            const teil = lese.filter(([s]) => s >= spur.marken.laufen && s <= spur.marken[folgt("laufen")]);
            let weg = 0;
            for (let k = 1; k < teil.length; k++) weg += Math.hypot(teil[k][1] - teil[k - 1][1], teil[k][2] - teil[k - 1][2]);
            const gier = teil.length ? Math.abs(teil[teil.length - 1][3] - teil[0][3]) : 0;
            const sichten = teil.map((t) => t[4]).filter((v, k, l) => v !== l[k - 1]);
            S.laufen = { wegM: Math.round(weg * 100) / 100, blickGrad: Math.round((gier * 180) / Math.PI), sicht: sichten.join("→") };
        }
        if (am.bauen) S.bauen = { werk: nach("bauen").werke - am.bauen.werke, modus: nach("bauen").modus, eingaben: eingaben("bauen") };
        if (am.ki) S.ki = { werke: nach("ki").studio.length - am.ki.studio.length, art: nach("ki").studio.slice(am.ki.studio.length).join(","), satz: nach("ki").satz };
        if (am.benutzen) S.benutzen = { sitzt: nach("benutzen").sitzt };
    } catch (e) {
        out.fehler = String(e.message).split("\n")[0].slice(0, 300);
    } finally {
        fs.writeFileSync(aus, JSON.stringify(out));
        console.log("SPIELGANG " + JSON.stringify(out));
        await browser.close().catch(() => {});
        server.close();
        process.exit(0);
    }
}
// DAS URTEIL je Schritt: die Zahl seines Bereichs hält, oder der Schritt steht beim Namen
function spielgangSchritte(j, G) {
    const S = j.schritte || {};
    const halten = {
        ankommen: (x) => [x.kontrolleMs > 0 && x.zeiger === true, `Kontrolle ${x.kontrolleMs} ms, Zeiger ${x.zeiger ? "gefangen" : "frei"}`],
        laufen: (x) => [x.wegM >= G.wegM && x.blickGrad >= G.blickGrad && /^first→third→first$/.test(x.sicht), `${x.wegM} m, Blick ${x.blickGrad}°, Sicht ${x.sicht || "—"}`],
        bauen: (x) => [x.werk === 1, `${G.werk} ${x.werk === 1 ? "steht" : "steht nicht (" + x.werk + ")"} in ${x.modus}, ${x.eingaben} Eingaben`],
        ki: (x) => [x.werke === 1 && /gebaut/.test(x.satz), `der Satz stellt ${x.werke} Studio-Werk${x.art ? " (" + x.art + ")" : ""}: „${String(x.satz).slice(0, 60)}“`],
        benutzen: (x) => [x.sitzt === true, x.sitzt ? "der Leib sitzt auf der gebauten Bank" : "sitzt nicht"],
    };
    return (j.marken || []).filter((m) => halten[m]).map((m) => {
        const [ok, zahl] = S[m] ? halten[m](S[m]) : [false, "ungemessen"];
        return { m, ok, zahl };
    });
}

// die Mutanten der Station: der gesunde Lauf (w8-spielgang-k1, headless) und je Klausel ein Bruch
const SG_GESUND = {
    spur: SPIELGANG.spur, laden: 1, marken: ["ankommen", "laufen", "bauen", "ki", "benutzen", "ende"], abgespielt: 93, eingaben: 93, verfehlt: 0, kontrolleMs: 941,
    schritte: {
        ankommen: { kontrolleMs: 941, zeiger: true },
        laufen: { wegM: 12.81, blickGrad: 141, sicht: "first→third→first" },
        bauen: { werk: 1, modus: "schöpfer", eingaben: 8 },
        ki: { werke: 1, art: "haus_alemannisch", satz: "1× Alemannisch aus dem Studio vor dir gebaut" },
        benutzen: { sitzt: true },
    },
};
const sgProbe = (name, bruch, gruen = false) => {
    const j = JSON.parse(JSON.stringify(SG_GESUND));
    bruch(j);
    return { name, stdout: "SPIELGANG " + JSON.stringify(j), gruen };
};
// DIE AUFNAHME DER SPUR (von Hand, im Spiel-Baum): `node -e "require('<punkte>/stationen/g5.js').spurAufnahme(4712)"` — eine Welt mit
// `?spur=aufnahme`, die Schritte als echte CDP-Eingaben (page.keyboard · page.mouse) und ein Gamepad als Gerät (sein Stand
// `window.__pad`, gelesen über navigator.getGamepads), je Schritt eine Marke; schreibt die Spur nach SPIELGANG.spur.
async function spurAufnahme(port) {
    const path = require("path");
    const fs = require("fs");
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const server = WB.statikServer();
    await server.lausche(Number(port));
    const { browser, page } = await WB.nullSeite({ frist: 300000 });
    await page.evaluateOnNewDocument(() => {
        window.__pad = null;
        Object.defineProperty(navigator, "getGamepads", { configurable: true, value: () => [window.__pad] });
    });
    const lies = (f, ...a) => page.evaluate(f, ...a);
    const schritte = async (n) => {
        const ziel = (await lies(() => r._spur.schritt)) + n;
        await page.waitForFunction((z) => r._spur.schritt >= z, { timeout: 120000, polling: 20 }, ziel);
    };
    const marke = (m) => lies((m) => r._spurMarke(m), m);
    const taste = async (code, n = 3) => (await page.keyboard.press(code), schritte(n));
    const pad = (rx) => lies((rx) => (window.__pad = { connected: true, axes: [0, 0, rx, 0], buttons: [] }), rx);
    const klick = async (sel) => {
        const el = await page.waitForSelector(sel, { timeout: 20000 });
        for (let i = 0; i < 40 && !(await el.isIntersectingViewport({ threshold: 1 })); i++) {
            const b = await el.boundingBox();
            await page.mouse.move(b.x + b.width / 2, 300);
            await page.mouse.wheel({ deltaY: b.y < 300 ? -100 : 100 });
            await schritte(2);
        }
        const b = await el.boundingBox();
        await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
        await schritte(3);
    };
    try {
        await page.setViewport({ width: 800, height: 600 });
        await server.zeige(page, 120000, "index.html?spur=aufnahme");
        await lies(() => window.__weltDa((r) => r.state._weltbildDa > 0));
        await lies(() => setInterval(() => __handTakt(), 20));
        await schritte(10);
        await marke("ankommen"); // ein Klick in die Welt fängt den Zeiger
        await page.mouse.click(400, 300);
        await schritte(10);
        await marke("laufen"); // W, die Maus dreht, Umschalt sprintet, V wechselt die Sicht, der rechte Stick dreht, V zurück
        await page.keyboard.down("KeyW");
        await schritte(60);
        for (let i = 1; i <= 4; i++) await page.mouse.move(400 + i * 75, 300), await schritte(3);
        await page.keyboard.down("ShiftLeft");
        await schritte(90);
        await page.keyboard.up("ShiftLeft");
        await taste("KeyV", 30);
        await pad(0.9);
        await schritte(40);
        await pad(0);
        await schritte(30);
        await taste("KeyV", 10);
        await page.keyboard.up("KeyW");
        await schritte(10);
        await marke("bauen"); // I: die Welt-Beziehung Schöpfer, ein Klick in die Welt, B: die Werkstatt, die Bank, Fertigen
        await taste("KeyI", 15);
        await klick("#game-mode-radios label:nth-child(3)");
        await page.mouse.click(8, 592);
        await schritte(5);
        await taste("KeyB", 15);
        await klick('#workshop-list .workshop-list-row[data-blueprint="bank_sitzbank"]');
        await klick("#workshop-action-zone .workshop-fertigen");
        await page.waitForFunction(() => st.architectures.some((a) => a.type === "bank_sitzbank"), { timeout: 60000 });
        await marke("ki"); // Enter, der Satz, Enter
        await taste("Enter", 5);
        for (const c of "bau ein haus") await page.keyboard.type(c);
        await taste("Enter", 30);
        await marke("benutzen"); // W bis vor die Bank, E setzt sich
        const abstand = () => lies(() => { const b = st.architectures.find((a) => a.type === "bank_sitzbank"); return Math.hypot(b.position.x - pm.position.x, b.position.z - pm.position.z); });
        await page.keyboard.down("KeyW");
        while ((await abstand()) > 1.6) await schritte(2);
        await page.keyboard.up("KeyW");
        await schritte(5);
        await taste("KeyE", 20);
        await marke("ende");
        fs.mkdirSync(path.dirname(SPIELGANG.spur), { recursive: true });
        fs.writeFileSync(SPIELGANG.spur, (await lies(() => r._spurText())) + "\n");
        console.log("SPUR " + SPIELGANG.spur + " · sitzt " + (await lies(() => st.player.mountedArch != null)));
    } finally {
        await browser.close().catch(() => {});
        server.close();
    }
}

// ───────── DIE PROBEN AN DER SEITE (Zweig proben-leib, stationen/seite.cjs): leib.K2 · leib.K4 · halten.K1#2 · halten.K5 · tore.K3 ─────────
// Bis 29.10. bootete jede dieser Stationen ihre Linse mit eigener Welt (Takt 19 an b3f9ae95: 4–10 Soll-Minuten je Lauf); jetzt
// ruft die Probe in der Welt der Sitzung die Seiten-Funktionen der Linse selbst (aus ihrer Datei am SHA, `H.quelle`) und nur
// die Teile, die das Kriterium urteilt. Wo die Messung Takte zählt und kein Pixel des Fensters, misst sie im Fenster 640×360
// (die Karte zeichnet jeden Takt, das Fenster kostet nur GPU-Zeit; die Grundstellung der nächsten Probe stellt 1920×1080).

// leib.K2 #1 + #2 (Zwillinge, EIN Lauf): K8 und K9 von gate:koerper-stand (`rollen`, die Seiten-Funktion der Linse) an Mess-Wiese
// und 25°-Hang — der Fuß auf drei Bahnen je Ort und der Sprung je Sicht und Leib. Der Huf (je Größen-Band ein Reh) und das Rad
// (der GT in Fahrt) urteilt gelaende.K5, nie diese Station: die Probe reicht ihnen keinen Leib (spawnCreatureAt des Bands und
// spawnArchitecture des GT geben null — `rollen` überspringt beide beim Namen). Der Dorf-Zug ruht wie im Haushalt der Wiese
// (`__anazhAutoSettlement` false, die Linse setzte ihn vor dem Boot). Das Urteil liest {AUS} { k8 } wie bisher.
async function leibK2Seite(H) {
    const D = H.quelle("scripts/diag-koerper-stand.cjs", ["K8_UMFANG", "eignerKarte", "gezeichnet", "rollen"]);
    await H.ruf("/fenster", { w: 640, h: 360 });
    await H.frist();
    const o = await H.seite(
        "window.__anazhAutoSettlement = false; window.__eignerKarte = " + D.eignerKarte + "; window.__gezeichnet = " + D.gezeichnet + "; " +
            "await window.__weltStehtNach(() => { try { r._gameLoopTick(performance.now()); } catch (e) {} }); " +
            "const sc = r.spawnCreatureAt, sa = r.spawnArchitecture; " +
            "r.spawnCreatureAt = function (...a) { return a[4] === \"wesen\" && a[5] && a[5].bodySize ? null : sc.apply(this, a); }; " +
            "r.spawnArchitecture = function (t, ...a) { return t === \"fahrzeug_gt\" ? null : sa.call(this, t, ...a); }; " +
            "try { return await (" + D.rollen + ")(" + D.K8_UMFANG + "); } finally { r.spawnCreatureAt = sc; r.spawnArchitecture = sa; }"
    );
    H.schritt("rollen");
    fs.writeFileSync(H.aus, JSON.stringify({ k8: o }, null, 1));
    const m = (t) => (t ? t.p95 + " cm (n " + t.n + ", stecken " + t.stecken + ")" : "—");
    for (const ort of ["wiese", "hang"])
        if (o && o[ort]) console.log("K8 " + ort + " " + o[ort].x + "/" + o[ort].z + " " + o[ort].neig + "° · fuss " + m(o[ort].fuss) + " · falllinie " + m(o[ort].falllinie) + " · stufe " + m(o[ort].stufe));
    if (o && o.sprung) console.log("K9 " + JSON.stringify(o.sprung));
    return 0;
}

// leib.K4 #1 + #2 (Zwillinge, EIN Lauf): K4 von gate:kamera-leib — `leibInstall`, die Anker der Mess-Wiese aus `leibWiese` (die
// Quote der Posen 0: die 40 Posen und der Ritt sind K2, nie diese Station) und `leibGang` mit der Vorgabe GANG der Linse und dem
// Teil gang2 (im Haus, am Steilhang, im Sprint). Die Zeilen und Urteile wie die Linse (`urteilGang`, `pruefer`).
async function leibK4Seite(H) {
    const D = H.quelle("scripts/diag-kamera-laub.cjs", ["ORTE", "LEIB_R", "pct", "quantil", "GANG", "GANG_ARTEN", "urteilGang", "leibInstall", "leibWiese", "leibGang"]);
    const M = require(path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
    const zusatz = require(path.resolve("scripts/lib/kamera-nah.cjs")).KAMERA_NAH_INSTALL + "\n" + require(path.resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL;
    await H.ruf("/fenster", { w: 640, h: 360 });
    await H.frist();
    const x = await H.seite(
        "window.__anazhAutoSettlement = false;\n" + zusatz + "\nwindow.__buehne(); await (" + D.leibInstall + ")(" + JSON.stringify({ R: D.LEIB_R }) + "); " +
            "const w = await (" + D.leibWiese + ")(" + JSON.stringify({ x: M.x, z: M.z, quote: { haus: 0, fels: 0, baum: 0 } }) + "); " +
            "const g = await (" + D.leibGang + ")(" + JSON.stringify(Object.assign({}, D.GANG, { zwei: true })) + "); " +
            "return { anker: w.anker, fehlt: w.fehlt, err: w.err, g };"
    );
    H.schritt("gang");
    const gang = x.g;
    console.log("=== K4 DER GANG DER KAMERA (Third zu Fuß im echten Takt, Kugel " + D.GANG.R + " m): Mess-Wiese " + M.x + "/" + M.z + " · Anker " + JSON.stringify(x.anker) + (x.err ? " · " + String(x.err).split("\n")[0] : ""));
    const n = (a) => JSON.stringify(a.reduce((h, k) => ((h[k] = (h[k] || 0) + 1), h), {}));
    for (const g of (gang && gang.gaenge) || [])
        console.log("  " + g.art.padEnd(5) + " " + g.typ + ": " + g.bilder + " Bilder · heran " + g.heran.d0 + " → " + g.heran.d1 + " m" + (g.drinnen == null ? "" : " · im Haus " + g.drinnen) +
            " · Kugel " + n(g.taeter.flatMap((t) => t.taeter.map((y) => t.phase + ": " + y))) + " · Nah-Pixel " + n(g.nah.flatMap((t) => Object.keys(t.jeKlasse).map((y) => t.phase + ": " + y))) +
            " · Ruck p95 " + (g.ruck.length ? D.quantil(g.ruck, 0.95).toFixed(4) : "—") + " höchstens " + (g.ruck.length ? Math.max(...g.ruck).toFixed(3) : "—") + " m");
    console.log("  der Arm ohne Flügel-Leib: " + (gang && gang.schmuggel) + " Proben mit Bau");
    if (gang && gang.hang) console.log("  Steilhang " + JSON.stringify(gang.hang) + " (Weltbild fehlt " + gang.fehlt + ") · die Kamera im Hang: " + gang.senk + " von 10 Bildern mit Täter");
    const { errs, check } = H.WB.pruefer();
    for (const [stufe, name] of [
        [1, "K4 der Gang in Third: die Kugel der Linse nie in Fels oder Bau, 0 Nah-Pixel von Fels, Gelände, Rinde und Bau, Ruck p95 ≤ 0,02 m, die Linse nennt den Arm ohne Flügel-Leib"],
        [2, "K4 Staffel 2: der Gang auch im Haus, am Steilhang, beim Sprint"],
    ]) {
        const v = D.urteilGang(gang, stufe);
        check(name, v.length === 0, v.length ? "Täter: " + v.join(" · ") : "");
    }
    return errs.length ? 1 : 0;
}

// halten.K5 #1 + #2 (Zwillinge, EIN Lauf): Q13/Q14 von gate:kampf-gefuehl --k5 — K5_VOR (der Takt von Hand: fünf Stürze, zwei
// Tod-Lagen, der Tod durch den Wolf, die Werte je Werk und Nahrung, saveState), der Reload der Seite (die Werkbank lädt neu, der
// Spielstand bleibt: die Grundstellung kommt erst vor der nächsten Probe), der Abdruck danach; Urteil und Zeilen aus der Linse
// (`k5Bericht` mit S17 · S18 · S20). Mutiert: Tod, Inventar, Speichern.
async function haltenK5Seite(H) {
    const KP = require(path.resolve("scripts/lib/kampf-proben.cjs"));
    // `hash` der Linse liest `stammLib` (seit w4-verkehr-c2 EINE sha-Quelle) — der freie Name kommt mit (Radeon 25ac4c0c: „stammLib is not
    // defined“, die Urteils-Zeile fehlte)
    const D = H.quelle("scripts/diag-kampf-gefuehl.cjs", ["hash", "json", "zeig", "k5Verdict", "q14Verdict", "k5Bericht"], { stammLib: require(path.resolve("scripts/lib/stamm.cjs")) });
    await H.frist();
    await H.seite("await window.__weltStehtNach(); return 1;");
    H.schritt("welt");
    const K = await H.seite("return (" + KP.K5_VOR + ")(" + KP.K5_ABDRUCK + ");");
    H.schritt("k5");
    await new Promise((ok) => setTimeout(ok, 1500)); // der IDB-Put landet (wie die Linse)
    await H.ruf("/reload");
    K.nachReload = await H.seite("return window.__seitenTakt().then(" + KP.K5_ABDRUCK + ");");
    H.schritt("reload");
    let ok = true;
    D.k5Bericht(K, (c, msg) => {
        console.log("  " + (c ? "✅" : "❌") + " " + msg);
        if (!c) ok = false;
    });
    return ok ? 0 : 1;
}

// halten.K1 #2: Q15 von gate:kampf-gefuehl --k1 — je Lauf (vor · masse · schneide) K1_BILD im ewigen Loop der Seite (die Probe
// schaltet ihn ein, `__loop`), das Bild des Treffers als PNG {AUS}-<lauf>.png, K1_LABOR im Labor worlds/schmiede (ein Rahmen der
// Seite, verborgen wie der Hintergrund-Tab der Linse). Das Urteil `k1Verdict` der Linse, S21 wie die Linse.
async function haltenK1Seite(H) {
    const KP = require(path.resolve("scripts/lib/kampf-proben.cjs"));
    const D = H.quelle("scripts/diag-kampf-gefuehl.cjs", ["json", "zeig", "K1_SOLL", "k1Verdict"]);
    await H.frist();
    await H.seite(
        "await window.__weltStehtNach(); const f = document.createElement(\"iframe\"); f.id = \"k1-labor\"; f.style.display = \"none\"; " +
            "const da = new Promise((ok) => (f.onload = ok)); f.src = \"/worlds/schmiede/index.html\"; document.body.appendChild(f); " +
            "await Promise.race([da, sleep(60000).then(() => { throw new Error(\"das Labor worlds/schmiede lädt nicht in 60 s\"); })]); window.__loop(1); return 1;"
    );
    H.schritt("welt und labor");
    const page = await H.cdp().catch((e) => (console.log("@@PUNKTE@@ BILD ohne Seite: " + e.message), null));
    // DAS LABOR IN SEINEM RAHMEN über CDP, wie die Linse (`lab.evaluate(K1_LABOR, l)`): ein `contentWindow.eval` aus der Seite
    // fiel an der CSP des Labors (worlds/schmiede: script-src 'self', kein unsafe-eval) — die Erlaubnis der Auswertung gilt nur im
    // Kontext der Welt, nie im Rahmen (GTX 3ed95dcf: „keine Zeile Q15 (Exit 2)“ nach 5,4 s — seit die Probe in der Sitzung misst)
    const labor = page && page.frames().find((f) => f.url().includes("/worlds/schmiede/index.html"));
    const K = { welt: {}, labor: {} };
    for (const l of ["vor", "masse", "schneide"]) {
        K.welt[l] = await H.seite("return (" + KP.K1_BILD + ")(" + JSON.stringify(l) + ");").catch((e) => ({ abbruch: String(e.message).split("\n")[0] }));
        if (K.welt[l].traf && page) await page.screenshot({ path: H.aus + "-" + l + ".png" });
        K.labor[l] = labor ? await labor.evaluate(KP.K1_LABOR, l) : { abbruch: "das Labor steht in keinem Rahmen der Seite (CDP)" };
        H.schritt(l);
    }
    await H.seite("window.__loop(); return 1;");
    const { errs, check } = H.WB.pruefer();
    D.zeig("Q15", K);
    const v = D.k1Verdict(K);
    check("Q15 halten.K1 Staffel 2: Masse × Schneide × Tempo im Bild und am Labor-Werk " + v, !v.length);
    const [W, L] = [K.welt, K.labor];
    check(
        "SELBST-TEST (S21): die Breitseite im Bild, ein Bild ohne Frame, ein Labor ohne Mutation",
        !!W.vor.traf &&
            D.k1Verdict({ ...K, welt: { ...W, vor: { ...W.vor, schneideBild: 0.18 } } }).includes("vor-bahn") &&
            D.k1Verdict({ ...K, welt: { ...W, vor: { abbruch: "x" } } }).includes("vor-abbruch: x") &&
            D.k1Verdict({ ...K, labor: { ...L, masse: L.vor } }).includes("masse-labor")
    );
    return errs.length ? 1 : 0;
}

// tore.K3 #1 + #2 (Zwillinge, EIN Lauf): K8 von gate:portal-konformanz — der Spieler trägt, was die Linse ihm gibt (Kiesel,
// Laterne, Brustpanzer, Inventar, Hotbar, die Gestalt des Leibs, das Pferd), holt sein Werk aus der Garage (`werkHolen`) und geht
// durch jedes Tor des Genesis-Rings (`betreten`: W durch die Apertur, sonst E), der Handshake klingt durch die Schleuse aus, der
// Abdruck drüben aus der Hülle, Esc bringt heim (`schleuse` esc), der Abdruck daheim — die Tafel `K8 [[welt, weg, vor, drüben,
// nach, esc], …]` wie die Linse; K1–K7 und die Ratschen der übrigen Welten urteilt gate:portal-konformanz, nie diese Station.
// Die Seite der Sitzung als puppeteer-Page (die Linse liest den Rahmen der Welt und hält Tasten). Mutiert: Pferd, Hand, Inventar.
async function toreK3Seite(H) {
    const D = H.quelle(
        "scripts/diag-portal-konformanz.cjs",
        ["WELTEN", "probefahrt", "stromZeichnet", "MITGEBRACHT", "TEILE", "abdruck", "UEBERSETZT", "betreten", "bereitBis", "werkHolen", "zaehlerAus", "schleuseNr", "schleusenZeit", "hinFrame", "seitenHelfer", "rueckHoerer", "schleuse"],
        { halteBis: H.WB.halteBis, waitFor: H.WB.waitFor, sleep: H.WB.sleep },
        "rahmen: () => hinFrame"
    );
    await H.ruf("/fenster", { w: 1280, h: 720 });
    const page = await H.cdp();
    await page.evaluate(() => window.__weltDa((r) => !!r.state.vibePass?.ready));
    // DIE AUSSTATTUNG des Reisenden wie die Linse (`lauf` von diag-portal-konformanz: Ring, Pferd, Hand, Rüstung, Inventar, Hotbar, Leib)
    await page.evaluate((M) => {
        st.materials[M.material] = { builtIn: false, color: M.farbe, label: M.material, tags: {} };
        st.tools.konformanz_feile = { builtIn: false, label: M.werkzeug, opName: "konformanz_op", opClass: "subtractive" };
        r._genesisPortalRing(r._genesisMitte());
        r.mountArchitecture(r.spawnArchitecture("reittier_holzross", st.playerMesh.position));
        r.equipHeld("kiesel");
        r.equipArmor("ruestung_brustpanzer");
        st.player.equipped.offhand = "laterne_dorf";
        for (const n of ["stein_block", "stein_block", "trank_lebenssaft"]) r.addToInventory(n);
        st.hotbar[2] = "stein_block";
        r._ensureWorkshopState().studioOv[r.constructor.KOERPER_HOST_RECIPE] = { height: 1.12, hairColor: "kupfer" };
    }, D.MITGEBRACHT);
    await page.evaluate(D.seitenHelfer);
    await D.werkHolen(page);
    H.schritt("werk");
    const ids = await page.evaluate(
        (ws) => ws.filter((id) => r.state.architectures.some((e) => /^welt_/.test(e.type) && r.state.blueprints[e.type].portalMeta.world === "worlds/" + id + "/index.html")),
        D.WELTEN.map((w) => w.id)
    );
    const ring = [];
    for (const w of D.WELTEN.filter((x) => ids.includes(x.id))) {
        const vor = await page.evaluate(D.abdruck, true);
        const b = await D.betreten(page, w);
        if (!b || !b.weg) {
            // DAS TOR, DAS NICHT AUFGING, beim Ort und im Bild: wo der Spieler stehen blieb, wie weit vom Tor, der Boden unter dem Tor
            const wo = await page.evaluate(() => {
                const t = window.__tor, p = r.state.playerMesh.position, f = (v) => +v.toFixed(1);
                return t ? { tor: [f(t.position.x), f(t.position.y), f(t.position.z)], spieler: [f(p.x), f(p.y), f(p.z)], d: f(Math.hypot(p.x - t.position.x, p.z - t.position.z)),
                    boden: f(r.getTerrainHeightAt(t.position.x, t.position.z) - t.position.y) } : null;
            }).catch(() => null);
            await page.screenshot({ path: H.aus + "-" + w.id + ".png" }).catch(() => {});
            console.log("  " + w.id + ": " + ((b && b.fehler) || "kein Tor") + (wo ? " · " + JSON.stringify(wo) : ""));
            ring.push([w.id, null, vor, {}, {}, false]);
            continue;
        }
        await D.bereitBis(page, w.id);
        let s = await D.schleuse(page, "heimat", w);
        while (s.enterImFenster && s.zaehler.enters <= 3) s = await D.schleuse(page, "heimat", w);
        const fr = D.rahmen();
        const drueben = fr ? await fr.evaluate(D.abdruck, false) : {};
        await D.zaehlerAus(page);
        const esc = fr ? !(await D.schleuse(page, "esc", null)).offen : false;
        if (!esc) await page.evaluate(() => r._portalOverlay && r.exitPortal());
        ring.push([w.id, b.weg, vor, drueben, await page.evaluate(D.abdruck, true), esc]);
        H.schritt(w.id);
    }
    console.log("K8 " + JSON.stringify(ring));
    return ring.length >= 10 ? 0 : 1;
}
// tore.K1 #1 (w16-tor-durchgang-pm): DER DURCHGANG DURCH EIN WELT-TOR — der Spieler hält W (`state.verbTafel.gehalten.vor`, nie
// state.keys) und geht durch ein Welt-Tor des Ultiversums: zuerst in die Ferne (`obtainPortalForWorld("ferne")`, die Geburt, kalt,
// nicht gezählt), dann fünfmal hin und her durch das Heimtor der Ferne (`_heimTorSetzen`) und das Tor daheim, das seine Welt kennt —
// jede Ziel-Welt schon besucht, andere worldId, Ego und Third im Wechsel; die Probe endet daheim. t beginnt am Kreuzen der Apertur
// (das Spiel ruft `enterPortal` selbst, stamm/siedlung-ort.js Tor-Takt) und endet am ersten Bild der Ziel-Welt, in dem der Spieler
// unter gehaltenem W weiterging und das Bild der Leinwand sich gegen ihr erstes Bild änderte (32 × 18 Luma je Bild über
// `createImageBitmap`, ohne Halt im Takt); jedes Bild dazwischen trägt seine Luma — der Ladeschirm mit seiner Deckkraft und seiner
// eigenen Luma (der Verlauf aus `getComputedStyle`) über der Leinwand —, jeder Frame seine Dauer (rAF), dazu die Zahl der
// Welt-Wechsel (ein Tor, das zurückwirft, wechselt dreimal) und je Lauf die Lücken des ersten Weltbilds (`_weltbildLuecken`, der Täter
// beim Namen). Die Zeile `TOR_K1 {…}`; das Urteil `toreK1Urteil`. Der Anlauf zum Tor (W mit Sprint) misst nie; nach einem Bruch kehrt
// die Probe ungemessen heim (die Grundstellung der Sitzung gilt nur in ihrer Welt). Am main 8efb6318 (Radeon, werkbank headless
// 640 × 360) ROT: das Heimtor der Ferne fällt am Ring (`_genesisUmzug`) — kein Tor zurück; mit gesetztem Heimtor t 5,8–12,3 s, bis
// drei Wechsel je Durchgang, 300–840 Bilder unter dem Ladeschirm (Luma 0,043), Frame bis 1 402 ms; am Zweig w16-tor-durchgang
// t 5,3–6,4 s, ein Wechsel, Frame bis 598 ms, die Probe 55 s. Mutiert: eine Welt mehr im Speicher, das Tor daheim.
async function toreK1Seite(H) {
    const GANG = async function toreK1Gang(o) {
        const R = window.anazhRealm;
        const jetzt = () => performance.now();
        const rahmen = () => new Promise(requestAnimationFrame);
        const warte = async (f, ms, was) => {
            const t0 = jetzt();
            for (;;) {
                if (f()) return true;
                if (jetzt() - t0 > ms) throw new Error("nach " + ms + " ms nicht: " + was);
                await rahmen();
            }
        };
        const lumaVon = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
        const schirmEl = () => document.getElementById("ladeschirm");
        if (o.schritt === "an") {
            const el = schirmEl();
            let schirmLuma = null;
            if (el) {
                const cs = getComputedStyle(el);
                const bg = cs.backgroundImage;
                const lin = bg.lastIndexOf("linear-gradient") >= 0 ? bg.slice(bg.lastIndexOf("linear-gradient")) : "";
                const c = [...lin.matchAll(/rgba?\(([^)]+)\)/g)].map((m) => m[1].split(",").map(Number)).filter((x) => x.length < 4 || x[3] >= 0.99);
                const b = (/rgba?\(([^)]+)\)/.exec(cs.backgroundColor) || [])[1];
                const bc = b ? b.split(",").map(Number) : null;
                schirmLuma = c.length ? c.reduce((s, x) => s + lumaVon(x), 0) / c.length : bc && (bc.length < 4 || bc[3] > 0) ? lumaVon(bc) : null;
            }
            window.__loop(1);
            await window.__weltDa((r) => r.state._weltbildDa > 0);
            const K = (window.__torK1 = { B: [], laeufe: [], lauf: null, halte: false, an: true, vorT: null, schirmLuma, heim: R.state.worldMeta.worldId, luecken: [] });
            const bild = () => {
                if (!K.an) return;
                const n = jetzt();
                const st = R.state;
                if (K.halte) st.verbTafel.gehalten.vor = true;
                if (K.sprint) st.verbTafel.gehalten.sprint = true;
                const s = schirmEl();
                const p = st.playerMesh ? st.playerMesh.position : null;
                // was der Schirm zeigt: ein Bild in ihm (eine Leinwand, die er hält) oder seine Tafel (der Verlauf, schirmLuma)
                const sb = s && !s.hidden ? s.querySelector("canvas") : null;
                let schirmL = null;
                if (sb && sb.width > 0 && getComputedStyle(sb).display !== "none") {
                    K.kg = K.kg || Object.assign(document.createElement("canvas"), { width: 8, height: 5 }).getContext("2d", { willReadFrequently: true });
                    K.kg.drawImage(sb, 0, 0, 8, 5);
                    const d = K.kg.getImageData(0, 0, 8, 5).data;
                    schirmL = 0;
                    for (let i = 0; i < 40; i++) schirmL += lumaVon([d[4 * i], d[4 * i + 1], d[4 * i + 2]]) / 40;
                }
                K.B.push({
                    t: n,
                    dt: K.vorT == null ? 0 : n - K.vorT,
                    nr: K.lauf ? K.lauf.nr : -1,
                    welt: st.worldMeta ? st.worldMeta.worldId : null,
                    tausch: !!R._weltTausch,
                    schirm: s && !s.hidden ? +getComputedStyle(s).opacity : 0,
                    schirmL,
                    x: p ? p.x : NaN,
                    z: p ? p.z : NaN,
                    bmp: K.lauf && K.lauf.t0 != null ? createImageBitmap(st.renderer.domElement, { resizeWidth: 32, resizeHeight: 18 }).catch(() => null) : null,
                });
                if (K.luecken && K.lauf && s && !s.hidden && K.B.length % 10 === 0 && !R._weltTausch) {
                    let l = "?";
                    try { l = R._weltbildLuecken().map((x) => x.satz).join(" · "); } catch (e) { l = "!" + e.message; }
                    const v = K.luecken[K.luecken.length - 1];
                    if (!v || v.l !== l || v.nr !== K.lauf.nr) K.luecken.push({ nr: K.lauf.nr, t: n, l });
                }
                K.vorT = n;
                requestAnimationFrame(bild);
            };
            requestAnimationFrame(bild);
            const hol = R.obtainPortalForWorld(o.gesetz || "ferne");
            if (!hol || !hol.ok) throw new Error("obtainPortalForWorld " + JSON.stringify(hol));
            const st = R.state;
            const p = st.playerMesh.position;
            const g = st.yaw;
            const x = p.x + Math.sin(g) * 5;
            const z = p.z + Math.cos(g) * 5;
            const e = R.spawnArchitecture(hol.blueprint, { x, y: R.getTerrainHeightAt(x, z), z }, { id: "tore-k1-" + Math.round(jetzt()), precise: true, rotationY: g });
            if (!e) throw new Error("das Tor in die Ferne steht nicht");
            K.erstesTor = e.id;
            for (let i = 0; i < 30; i++) await rahmen();
            window.__loop();
            return { tor: e.id, heim: K.heim.slice(0, 8), schirmLuma };
        }
        const K = window.__torK1;
        if (!K) throw new Error("der Gang ist nicht angelegt (schritt an)");
        if (o.schritt === "lauf") {
            const vorig = K.laeufe[K.laeufe.length - 1];
            const ziel = vorig ? vorig.von : null;
            const tor = !vorig
                ? (R.state.architectures || []).find((a) => a && a.id === K.erstesTor)
                : (R.state.architectures || []).find((a) => a && a.affordances && a.affordances.isPortal && a.portalMeta && a.portalMeta.weltId === ziel);
            if (!tor) {
                const F = { nr: K.laeufe.length, sicht: o.sicht, von: R.state.worldMeta.worldId, ziel, geboren: !vorig, t0: null, fehler: "kein Tor nach " + (ziel ? ziel.slice(0, 8) : "der Ferne") + " in " + R.state.worldMeta.worldId.slice(0, 8) };
                K.laeufe.push(F);
                return { nr: F.nr, von: F.von.slice(0, 8), ziel: null, ms: null, fehler: F.fehler };
            }
            window.__loop(1);
            R.setCameraMode(o.sicht);
            const p = R.state.playerMesh.position;
            // DER ANLAUF misst nie (W mit Sprint, bis die Apertur gekreuzt ist): wer im Tor steht, durch das er ankam, tritt erst heraus —
            // ein Tor nimmt nur, wer seine Zone von außen betritt
            const weg = () => Math.hypot(tor.position.x - p.x, tor.position.z - p.z);
            const anlauf = (an) => ((K.halte = an), (K.sprint = an), (R.state.verbTafel.gehalten.vor = an), (R.state.verbTafel.gehalten.sprint = an));
            if (weg() < 3) {
                R.state.yaw = Math.atan2(p.x - tor.position.x, p.z - tor.position.z);
                anlauf(true);
                await warte(() => weg() >= 3, 3000, "aus dem Tor getreten").catch(() => null);
                anlauf(false);
                for (let i = 0; i < 5; i++) await rahmen();
            }
            R.state.yaw = Math.atan2(tor.position.x - p.x, tor.position.z - p.z);
            const pm = tor.portalMeta || {};
            const L = { nr: K.laeufe.length, sicht: o.sicht, von: R.state.worldMeta.worldId, tor: tor.id, ziel: pm.weltId || null, geboren: !pm.weltId, t0: null };
            K.lauf = L;
            L.start = jetzt();
            const proto = Object.getPrototypeOf(R).enterPortal;
            R.enterPortal = function (e) {
                if (L.t0 == null) (L.t0 = jetzt()), (K.sprint = false), (R.state.verbTafel.gehalten.sprint = false);
                return proto.call(this, e);
            };
            K.halte = K.sprint = true;
            try {
                await warte(() => L.t0 != null, 15000, "die Apertur gekreuzt (enterPortal)");
                if (Object.prototype.hasOwnProperty.call(R, "enterPortal")) delete R.enterPortal;
                await warte(() => !R._weltTausch && R.state.worldMeta.worldId !== L.von, 60000, "die Ziel-Welt angekommen");
                L.ziel = R.state.worldMeta.worldId;
                L.ankunft = jetzt();
                const a = R.state.playerMesh.position.clone();
                await warte(() => !R._ladeschirmSteht() && Math.hypot(R.state.playerMesh.position.x - a.x, R.state.playerMesh.position.z - a.z) > 0.3, 30000, "der Spieler geht in der Ziel-Welt");
                for (let i = 0; i < 12; i++) await rahmen();
            } catch (x) {
                L.fehler = String((x && x.message) || x).split("\n")[0];
            } finally {
                if (Object.prototype.hasOwnProperty.call(R, "enterPortal")) delete R.enterPortal;
                K.halte = K.sprint = false;
                R.state.verbTafel.gehalten.vor = R.state.verbTafel.gehalten.sprint = false;
                L.ende = jetzt();
                K.lauf = null;
                K.laeufe.push(L);
            }
            for (let i = 0; i < 5; i++) await rahmen();
            window.__loop();
            return { nr: L.nr, von: L.von.slice(0, 8), ziel: L.ziel && L.ziel.slice(0, 8), ms: L.ende && L.t0 ? Math.round(L.ende - L.t0) : null, fehler: L.fehler || null };
        }
        // schritt "ende": die Bilder (32 x 18 Luma), je Lauf t bis zur ersten sichtbaren Eingabe, die Zwischenbilder und die Frames
        K.an = false;
        const k = document.createElement("canvas");
        k.width = 32;
        k.height = 18;
        const gx = k.getContext("2d", { willReadFrequently: true });
        for (const f of K.B) {
            if (!f.bmp) continue;
            const bm = await f.bmp;
            f.bmp = null;
            if (!bm) continue;
            gx.clearRect(0, 0, 32, 18);
            gx.drawImage(bm, 0, 0);
            bm.close();
            const d = gx.getImageData(0, 0, 32, 18).data;
            const l = new Float32Array(576);
            let s = 0;
            for (let i = 0; i < 576; i++) s += l[i] = lumaVon([d[4 * i], d[4 * i + 1], d[4 * i + 2]]);
            f.l = l;
            f.luma = s / 576;
        }
        const SL = K.schirmLuma;
        const laeufe = K.laeufe.map((L) => {
            const z = K.B.filter((f) => f.nr === L.nr && L.t0 != null && f.t >= L.t0);
            const ankunft = z.find((f) => f.welt === L.ziel && !f.tausch && f.l);
            let t1 = null;
            let prev = null;
            for (const f of z) {
                if (ankunft && f.t > ankunft.t && f.welt === L.ziel && !f.tausch && f.schirm < 0.05 && f.l && prev &&
                    Math.hypot(f.x - prev.x, f.z - prev.z) > 0.005 && Math.hypot(f.x - ankunft.x, f.z - ankunft.z) > 0.05) {
                    let dsum = 0;
                    for (let i = 0; i < 576; i++) dsum += Math.abs(f.l[i] - ankunft.l[i]);
                    if (dsum / 576 > 0.002) {
                        t1 = f;
                        break;
                    }
                }
                prev = f;
            }
            const bis = z.filter((f) => !t1 || f.t <= t1.t);
            const lum = bis.map((f) => (f.luma == null ? null : f.schirm * (f.schirmL != null ? f.schirmL : SL == null ? f.luma : SL) + (1 - f.schirm) * f.luma));
            const bek = lum.filter((v) => v != null);
            const dts = bis.slice(1).map((f) => f.dt);
            let wechsel = 0;
            let wo = L.von;
            for (const f of z) if (f.welt && f.welt !== wo) (wechsel++, (wo = f.welt));
            return {
                nr: L.nr,
                sicht: L.sicht === "third" ? "third" : "ego",
                geboren: L.geboren,
                von: L.von && L.von.slice(0, 8),
                ziel: L.ziel && L.ziel.slice(0, 8),
                ms: t1 ? Math.round(t1.t - L.t0) : null,
                anlaufMs: L.t0 ? Math.round(L.t0 - L.start) : null,
                ankunftMs: L.ankunft && L.t0 ? Math.round(L.ankunft - L.t0) : null,
                schirmMs: Math.round(bis.filter((f) => f.schirm >= 0.05).reduce((s, f) => s + f.dt, 0)),
                bilder: bis.length,
                lumaMin: bek.length ? +Math.min(...bek).toFixed(3) : null,
                lumaMax: bek.length ? +Math.max(...bek).toFixed(3) : null,
                dunkel: bek.filter((v) => v < 0.05).length,
                hell: bek.filter((v) => v > 0.95).length,
                ohneBild: lum.length - bek.length,
                frameMax: dts.length ? Math.round(Math.max(...dts)) : null,
                ueber100: dts.filter((v) => v > 100).length,
                wechsel,
                fehler: L.fehler || null,
            };
        });
        window.__torK1 = null;
        const daheim = R.state.worldMeta.worldId === K.heim;
        // DIE HEIMKEHR nach einem Bruch (ungemessen): die Sitzung stellt ihren Grund nur in IHRER Welt zurück
        if (R.state.worldMeta.worldId !== K.heim && !R._weltTausch) {
            window.__loop(1);
            await Promise.race([R._weltWechsel(K.heim).then(() => window.__weltDa((r) => r.state._weltbildDa > 0)), new Promise((ok) => setTimeout(ok, 20000))]).catch(() => null);
        }
        window.__loop();
        const luecken = K.luecken.map((v) => { const L = K.laeufe[v.nr]; return [v.nr, L && L.t0 ? Math.round(v.t - L.t0) : null, v.l.slice(0, 160)]; }) ;
        return { luecken, schirmLuma: SL == null ? null : +SL.toFixed(3), heim: daheim, laeufe };
    };
    await H.frist();
    const lauf = (o) => H.seite("return (" + GANG + ")(" + JSON.stringify(o) + ");");
    const an = await lauf({ schritt: "an" });
    H.schritt("an " + an.tor);
    // die Geburt der Ferne (kalt) und fünf Läufe in schon besuchte Welten: die sechste Reise endet daheim (die Grundstellung danach)
    for (const sicht of ["first", "first", "third", "first", "third", "first"]) {
        const l = await lauf({ schritt: "lauf", sicht });
        H.schritt("lauf " + l.nr + " " + l.von + " → " + l.ziel + (l.fehler ? " " + l.fehler : ""));
        if (l.fehler) break;
    }
    const e = await lauf({ schritt: "ende" });
    H.schritt("ende");
    console.log("TOR_K1 " + JSON.stringify(e));
    return 0;
}
// die Proben (Zwillinge tragen DIESELBE Probe: punkte.cjs gruppiere fährt sie einmal)
// DIE FAHRT (Eichlauf Radeon b3f9ae95 29.10.: 52,2 s GRÜN am Deckel 60): der Deckel steht in der Tafel der Fahrt (punkte.cjs DIE DECKEL)
const LEIB_K2 = seiteProbe(33, leibK2Seite, {
    mutiert: true,
    
});
// LEIB_K4 ÜBER DEM BUDGET (07.11., w18-kamera-haus): seit 04.11. riss die Probe an Radeon und GTX ihre Frist 39 s (Deckel 45) ohne
// Gang-Zeile. Der Gang ist volle Abdeckung im echten Takt: sieben Gänge zu je zwei 360°-Orbits à 6 s, rückwärts heran, der Schmuggel
// (seit w18 endet er beim ersten genannten Bau-Pixel: 1091 → 438 Bilder) und der Weg zum Steilhang (318 m, ~8 s Strom) — 7 920 Bilder;
// die Nah-Frage rechnet seit w18 ihren Kugel-Test über die Vektor-Rechnung (4,8 → 3,4 ms je Frage, 0 Abweichungen in 364 Fragen).
// Headless (Null-Renderer, Cloud-CPU) der ganze Linsen-Lauf 87–91 → 57–62 s, der Takt allein ~26 s. Weniger Bilder bei gleicher
// Abdeckung gibt es nicht: der Orbit in 3 s (die Nah-Frage je Grad gleich dicht) misst eine andere Maus (headless neu ROT: haus
// orbit fern Bau 34 %, Ruck innen 0,024 m).
const LEIB_K4 = seiteProbe(33, leibK4Seite, {
    mutiert: true,
});
const HALTEN_K5 = seiteProbe(19, haltenK5Seite, { mutiert: true });
const HALTEN_K1 = seiteProbe(10, haltenK1Seite, { mutiert: true });
const TORE_K3 = seiteProbe(10, toreK3Seite, {
    mutiert: true,
    
});
// DER DURCHGANG (tore.K1): die Geburt der Ferne und fünf Läufe, Radeon am Zweig w16-tor-durchgang 55 s (je Wechsel 5–7 s unter dem
// Ladeschirm), im Soll höchstens 2 s je Lauf — der Deckel trägt die Messung von heute, nicht das Soll
const TORE_K1 = seiteProbe(90, toreK1Seite, {
    mutiert: true,
});

// Pfade (R6): die Dateien, die die Messung liest
const FAHRT = [
    "vehicle-core.js",
    "stamm/koerper-*.js",
    "stamm/dirigent-takt.js",
    "stamm/daten.js",
    "scripts/werkbank.cjs",
    "scripts/lib/welt-orte.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "save-server.js",
];
const LATENZ = [
    "stamm/koerper-*.js",
    "stamm/dirigent-*.js",
    "stamm/kampf.js",
    "stamm/studio-bruecke.js",
    "stamm/kreatur-*.js",
    "stamm/daten.js",
    "vehicle-core.js",
    "koerper-core.js",
    "scripts/werkbank.cjs",
    "scripts/lib/haenger-linse.cjs",
    "scripts/lib/welt-orte.cjs",
    "save-server.js",
];
const DORF = [
    "stamm/siedlung-*.js",
    "stamm/dienst.js",
    "stamm/dirigent-*.js",
    "stamm/gelaende-*.js",
    "stamm/daten.js",
    "fachwerk-core.js",
    "foundry-core.js",
    "foundry-bruecke.js",
    "scripts/werkbank.cjs",
    "save-server.js",
];
const KAMPF = [
    "stamm/kampf.js",
    "stamm/studio-bruecke.js",
    "stamm/bau-buch.js",
    "stamm/kreatur-*.js",
    "stamm/koerper-*.js",
    "stamm/daten.js",
    "schmiede-core.js",
    "scripts/diag-kampf-gefuehl.cjs",
    "scripts/lib/kampf-proben.cjs",
    "scripts/lib/welt-boot.cjs",
];
const PAD = [
    "stamm/koerper-*.js",
    "stamm/dirigent-*.js",
    "stamm/kampf.js",
    "stamm/klang.js",
    "stamm/feld-leben.js",
    "stamm/netz-p2p.js",
    "stamm/netz-portal.js",
    "stamm/werkstatt-*.js",
    "stamm/daten.js",
    "vehicle-core.js",
    "scripts/playtest.cjs",
    "scripts/playtest/koerper.cjs",
];

// DIE STADT VOM HÜGEL (siedlung.K2, Zweig stadt-tor-k2; das Muster von stadt-tor-k2-bild/stadt-bild.sh): die nächste Stadt
// des Rang-Gesetzes binnen 2 km vom Genesis-Ort mit Ort (`_autoSettlementFindSite`), der Spieler auf den höchsten Land-Punkt
// 180–260 m vor ihr, bis die Mauer steht und kein Zug mehr läuft; dann der Schuss vom höchsten Acker oder Feldweg 70–260 m
// vor der Stadt-Mitte auf ihre Mitte (+5 m). Der Code trägt kein einfaches Hochkomma (bash '…').
const STADT_WAHL =
    "const g = r._genesisMitte(); const out = []; " +
    "for (let cx = -10; cx <= 10; cx++) for (let cz = -10; cz <= 10; cz++) { const i = r._autoSettlementCellInfo(cx, cz); " +
    "if (!i || !(i.stufe > 0)) continue; const d = Math.hypot(i.x - g.x, i.z - g.z); if (d > 2000) continue; " +
    "out.push({ cx, cz, nH: i.nH, stufe: i.stufe, d: Math.round(d), site: r._autoSettlementFindSite(i) }); } " +
    "out.sort((a, b) => a.d - b.d); const c = out.find((o) => o.site); let hill = null; " +
    "if (c) for (const R of [180, 220, 260]) for (let k = 0; k < 32; k++) { const a = (k / 32) * 2 * Math.PI, " +
    "x = c.site.x + Math.cos(a) * R, z = c.site.z + Math.sin(a) * R, y = r.getTerrainHeightAt(x, z); " +
    "if (Number.isFinite(y) && r._landAt(x, z, 0.2) && (!hill || y > hill.y)) hill = { x, y, z, R }; } " +
    "window.__stadtWahl = { c, hill }; " +
    "return { seed: r.state.worldMeta && r.state.worldMeta.seed, staedte: out.length, wahl: c ? { cx: c.cx, cz: c.cz, nH: c.nH, stufe: c.stufe, d: c.d } : null, hill };";
// DIE STADT WÄCHST IM TAKT (w4-ssa-C): die Welt der Sitzung steht an einem Ort ohne Dorf-Zug (`start --ort wiese`: der Haken
// `__anazhAutoSettlement` false vor jeder Ladung) — die Stadt am Hügel wuchs dort nie, und der Stand fragte 60-mal je 1 s (GTX b4bcf19c
// ≥ 90 s). Der Stand stellt den Spieler auf den Hügel, leiht der Welt den Zug wie im Spiel und die Decke des Umstellens
// (`perfTargetMs` 1000: über dem Budget trüge der Zug je 8 Takte ein Haus) — `leihe`, zurück im finally: kein Zug überlebt die Probe —
// und wartet im Bau-Ereignis (`__gebautNach`, der Takt der Werkbank je Bild), bis die Mauer steht und kein Zug und kein Export mehr läuft. Den Ring am Hügel baut er nicht ab (bis dahin `umstellen` dorthin: kein Bild sah ihn) — das Bild stellt am
// Acker um und wartet dort, bis die Welt steht.
const STADT_STAND =
    "const c = window.__stadtWahl.c.site, h = window.__stadtWahl.hill, M = () => r.state.stlMauer; " +
    "const steht = () => (M() ? M().top : 0) > 0 && !(r._autoSettlementQueue && r._autoSettlementQueue.plan) && !r._autoSettlementPendingKey; " +
    "r.state.playerMesh.position.set(h.x, r._voxelSurfaceY(h.x, h.z) + 1.8, h.z); " +
    "const zurueck = leihe(window, { __anazhAutoSettlement: true }), decke = leihe(r.state, { perfTargetMs: 1000 }); let takte = null; " +
    "try { takte = await __gebautNach(\"die Stadt vom Hügel\", { fertig: steht, bau: () => {}, takt: async () => { __werkTakt(); await new Promise((ok) => requestAnimationFrame(ok)); }, max: 1800 }); } " +
    "catch (e) { takte = String((e && e.message) || e).slice(0, 300); } finally { zurueck(); decke(); } " +
    "const P = M(), q = r._autoSettlementQueue; let haeuser = 0; " +
    "for (const e of r.state.architectures) if (e && /^haus_/.test(e.type) && Math.hypot(e.position.x - c.x, e.position.z - c.z) < 400) haeuser++; " +
    "return { mauer: P ? P.top : 0, zug: !!(q && q.plan), pending: r._autoSettlementPendingKey || null, haeuser, takte, zugHaken: window.__anazhAutoSettlement };";
const STADT_KAMERA =
    "const c = window.__stadtWahl.c.site; let v2 = null; " +
    "for (const p of r._ortPlaene.values()) if (p && p.ort && p.mauer && (!v2 || Math.hypot(p.ort.x - c.x, p.ort.z - c.z) < Math.hypot(v2.ort.x - c.x, v2.ort.z - c.z))) v2 = p; " +
    "if (!v2) return { fehler: \"kein Ortsplan mit Mauer\" }; const o = v2.ort, cand = []; " +
    "for (const f of v2.felder || []) cand.push({ x: o.x + f.cx, z: o.z + f.cz, art: \"acker\" }); " +
    "for (const fw of v2.feldwege || []) for (const q of fw.pts) cand.push({ x: o.x + q.x, z: o.z + q.z, art: \"feldweg\" }); " +
    "let best = null; for (const q of cand) { const d = Math.hypot(q.x - o.x, q.z - o.z); if (d < 70 || d > 260) continue; " +
    "const y = r.getTerrainHeightAt(q.x, q.z); if (!Number.isFinite(y)) continue; if (!best || y > best.y) best = Object.assign({ y, d: Math.round(d) }, q); } " +
    "if (!best) return { fehler: \"kein Acker oder Feldweg 70–260 m vor der Stadt\" }; const cy = r.getTerrainHeightAt(o.x, o.z); " +
    "return { pose: [best.x, best.y + 1.7, best.z, o.x, cy + 5, o.z].map((v) => +v.toFixed(2)), art: best.art, d: best.d, " +
    "hoeher: Math.round((best.y - cy) * 10) / 10, segs: v2.mauer.segs.length, tuerme: v2.mauer.towers.length };";
const LIES = (feld) =>
    "node -e 'const t = require(\"fs\").readFileSync(process.argv[1], \"utf8\"); const e = JSON.parse(t.slice(t.indexOf(\"{\"))).ergebnis; " + feld + "'";

// der Weg zur Stadt vom Hügel (siedlung.K2 Staffel 1 und 2): Boot, Wahl, Hügel, bis die Mauer steht, die Kamera
const STADT_HUEGEL = [
    "boot",
    "timeout 60 $W fenster 1600 900 > /dev/null 2>&1",
    "timeout 120 $W eval '" + STADT_WAHL + "' > \"$L/wahl.json\" 2>&1; echo '@@PUNKTE@@ WAHL'; cat \"$L/wahl.json\"; echo",
    "HILL=$(" + LIES("console.log(e.hill ? e.hill.x.toFixed(1) + \" \" + e.hill.z.toFixed(1) : \"\")") + " \"$L/wahl.json\" 2> /dev/null)",
    "[ -n \"$HILL\" ] || { echo '@@PUNKTE@@ KEINE STADT MIT ORT BINNEN 2 KM'; exit 4; }",
    "timeout 300 $W eval '" + STADT_STAND + "' > \"$L/stand.json\" 2>&1",
    "echo '@@PUNKTE@@ STAND'; cat \"$L/stand.json\"; echo",
    "timeout 60 $W eval '" + STADT_KAMERA + "' > \"$L/kamera.json\" 2>&1; echo '@@PUNKTE@@ KAMERA'; cat \"$L/kamera.json\"; echo",
    "K=$(" + LIES("console.log(e.pose ? e.pose.join(\" \") : \"\")") + " \"$L/kamera.json\" 2> /dev/null)",
    "[ -n \"$K\" ] || { echo '@@PUNKTE@@ KEINE KAMERA'; exit 5; }",
];
// DIE STADT IN EINEM LAUF (siedlung.K2#1 und #2, Zwillinge, 29.10.): Teil Z mit dem Zipf-Fit (`diag-settlement --nur-z --zipf`, Node,
// 8 Saaten) läuft NEBEN der Stadt der Sitzung (seine Zeilen danach, Z), der Weg zum Hügel, bis die Mauer steht (STADT_HUEGEL), das
// Bild mittags und in der Dämmerung; {AUS} = { mittag, daemmerung }. Bis dahin fuhr jede Staffel Teil Z und die Stadt für sich,
// der Stand fragte alle 5 s (bis w4-ssa-C 60-mal je 1 s, ohne Zug). Die Stadt wächst am Hügel (mutiert).
const SIEDLUNG_SITZUNG = sitzung(10,
    "A=$(cygpath -m '{AUS}')",
    '( node scripts/diag-settlement.cjs --nur-z --zipf; echo "@@PUNKTE@@ EXIT $?" ) > "$L/zipf.out" 2>&1 &',
    ...STADT_HUEGEL,
    "rm -f \"$L/stadt-mittag.abnahme.json\" \"$L/stadt-daemmerung.abnahme.json\"",
    "teil MITTAG $W bild $K --uhr 0.5 --datei \"$L/stadt-mittag.png\" --w 1600 --h 900",
    "teil DAEMMERUNG $W bild $K --uhr 0.25 --datei \"$L/stadt-daemmerung.png\" --w 1600 --h 900",
    "node -e 'const f = require(\"fs\"), l = (n) => { try { return JSON.parse(f.readFileSync(process.argv[2] + \"/stadt-\" + n + \".abnahme.json\", \"utf8\")); } catch (e) { return null; } }; " +
        "f.writeFileSync(process.argv[1], JSON.stringify({ mittag: l(\"mittag\"), daemmerung: l(\"daemmerung\") }))' \"$A\" \"$L\"",
    "wait",
    'echo "@@PUNKTE@@ Z"; cat "$L/zipf.out"'
);
// DER RING VOM HÜGEL (siedlung.K4 Staffel 2, w3w-jahrhunderte): ein Ort von 1320 (der Akt `spawnSettlement` mit Jahr, Same 7) auf
// dem ebensten Land 500–800 m vor dem Genesis-Ort; der Hügel ist der höchste Land-Punkt 140–240 m vor ihm. Am Ort: ein gesetztes
// Haus 6 m vor seinem Rand zum Hügel hin (Werk, `haus_alemannisch`), die Welt-Uhr 1500 s vor — jedes `umstellen` tickt die Welt,
// bis sie steht (der Ort im Wachstum zählt in `_dorfOffen`). Der Code trägt kein einfaches Hochkomma (bash '…').
// DIE ROH-AUSGABE DER PROBE (die Proben von siedlung.K4#2): die Schritte von GTX a4dc2a45 (Ort, Haus, Uhr, Stand, Kamera, Teil W) mit
// einem Teil BILD nach Wahl — `bild` null lässt ihn fehlen
const K4_ROH = (bild) => {
    const b = (n, e) => ["@@PUNKTE@@ " + n, JSON.stringify(e, null, 1)].join("\n");
    return [
        "[linse-gpu] nvidia/pascal",
        b("ORT", { ms: 13, ergebnis: { S: { x: 400, z: 692.82, hang: 3.97 }, hill: { x: 446.82, y: 48.05, z: 457.43 } } }),
        b("VOR", { ms: 103, ergebnis: { k: "d:7@400,693", groesse: "dorf", jahr: 1412, slots: 12, haeuser: 12, haus: [411.55, 634.76], hill: { x: 446.82, y: 48.05, z: 457.43 } } }),
        b("UHR", { ms: 3, ergebnis: { kern: true, jahr: 1412, haeuser: 12, uhr: 1543.1 } }),
        b("STAND", { ms: 4, ergebnis: { jahr: [1412, 1744], haeuser: [12, 20], slots: 21, bleiben: 0.917, ring: { neu: 9, zumHaus: 22, zumOrt: 59 }, offen: 0 } }),
        b("KAMERA", { ms: 3, ergebnis: { pose: [446.82, 49.75, 457.43, 405.77, 40.34, 663.79], d: 210, hoeher: 11.7 } }),
        ...(bild ? [b("BILD", bild), "@@PUNKTE@@ EXIT 1"] : []),
        "@@PUNKTE@@ W",
        "  ✅ W1 WACHSTUM in 10800 s: 1/- 12→37 37/37 1993 · 2/- 12→36 36/36 2011 · 3/- 12→37 37/37 1981 · 5/24 24→73 73/73 2019",
        "  ✅ W2 AUS BEWOHNERN (wohl 0, ohne Leute halten; Gewalt bremst): 1,1,1 1,1,1 1,1,1 1,1,1 1,1,1 1,1,1",
        "@@PUNKTE@@ EXIT 0",
    ].join("\n");
};
const K4_ROT_GTX =
    "ABNAHME ROT [Vordergrund 29.3 % näher als 8 m (der halbe Ziel-Abstand): Laub baum_birke 28.6 %, Rinde baum_birke 0.7 % · Ziel Blickziel " +
    "verdeckt von siedlung-mauer in 139.26 m · Ziel Blickziel nicht gezeichnet: wandlaterne_dorf 609 UNGEZEICHNET] · beweis · Sicht 0.0 % · " +
    "Ziel Blickziel im Bild VERDECKT 210.61 m · Luma 57.5 σ 36.3 schwarz 0.0 % weiß 0.0 % · Stand 18.546.198 · Bühne summer sunny 0.50 · " +
    "Gerät WebGPU nvidia pascal · Blick-Wahl 42 Posen — die Blick-Wahl fand in 42 Posen keine freie — die Aufnahme speichert nichts";
const K4_ORT =
    "const g = r._genesisMitte(), land = (x, z) => r._landAt(x, z, 0.2), hoch = (x, z) => r.getTerrainHeightAt(x, z); let S = null; " +
    "for (const R of [500, 650, 800]) for (let k = 0; k < 24; k++) { const a = (k / 24) * 2 * Math.PI, x = g.x + Math.cos(a) * R, z = g.z + Math.sin(a) * R; " +
    "const ys = [0, 1, 2, 3, 4, 5, 6, 7].map((j) => [x + Math.cos(j * 0.785) * 80, z + Math.sin(j * 0.785) * 80]); " +
    "if (!land(x, z) || !ys.every(([u, v]) => land(u, v))) continue; const h = ys.map(([u, v]) => hoch(u, v)), hang = Math.max(...h) - Math.min(...h); " +
    "if (!S || hang < S.hang) S = { x, z, hang }; } if (!S) return { fehler: \"kein ebenes Land 500–800 m vor dem Genesis-Ort\" }; " +
    "const huegel = (c) => { let b = null; for (const R of [140, 190, 240]) for (let k = 0; k < 32; k++) { const a = (k / 32) * 2 * Math.PI, x = c.x + Math.cos(a) * R, z = c.z + Math.sin(a) * R, y = hoch(x, z); " +
    "if (Number.isFinite(y) && land(x, z) && (!b || y > b.y)) b = { x, y, z }; } return b; }; " +
    "window.__k4 = { S, huegel, land, hoch, hill: huegel(S) }; r.spawnSettlement({ seed: 7, jahr: 1320, position: { x: S.x, y: 0, z: S.z } }); " +
    "return { S, hill: window.__k4.hill };";
const K4_VOR =
    "const K = window.__k4, Z = r.state.worldMeta.settlementCells; " +
    "const k = Object.keys(Z).find((q) => q.startsWith(\"d:7@\") && Math.hypot(Z[q].x - K.S.x, Z[q].z - K.S.z) < 250); if (!k) return { fehler: \"der Ort von 1320 steht nicht\" }; " +
    "const c = Z[k], S = r._bewohnerSiedlungen.get(k), P = S && S.plan; if (!P) return { fehler: \"der Ort trägt keinen Plan\" }; " +
    "K.haeuser = () => S.plan.slots.map((s) => r._dorfHaus(S.ox + s.x, S.oz + s.z, s.seed >>> 0)).filter(Boolean); " +
    "Object.assign(K, { k, c, E0: K.haeuser(), hill: K.huegel(c) }); const R = 6 + Math.max(...P.slots.map((s) => Math.hypot(s.obb.cx, s.obb.cz) + Math.hypot(s.obb.ex, s.obb.ez))); " +
    "const a0 = Math.atan2(K.hill.z - c.z, K.hill.x - c.x); for (let i = 0; i < 16 && !K.haus; i++) { const a = a0 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.39, x = c.x + Math.cos(a) * R, z = c.z + Math.sin(a) * R; " +
    "if (K.land(x, z) && r.spawnArchitecture(\"haus_alemannisch\", { x, y: K.hoch(x, z) + 0.5, z }, { seed: 4711, werk: true })) K.haus = [x, z]; } " +
    "return { k, groesse: P.groesse, jahr: P.jahr + P.spanne, slots: P.slots.length, haeuser: K.E0.length, haus: K.haus || null, hill: K.haus ? K.hill : null };";
// DIE UHR GEHT MIT DEM DORF-TAKT DES SPIELS (w4-urteile-6a57, wie STADT_STAND): die Sitzung bootet mit `start --ort wiese`, der Haken
// legt `__anazhAutoSettlement` false vor JEDE Ladung — `_tickAutoSettlement` kehrt am `_dorfTaktLebt` um, `_ortWachstumTakt` lief nie:
// Radeon 25ac4c0c „1500 s: 1412 → 1412, Häuser 12 → 12/12, Ring 0 neu" (bis 29.10., vor dem Haken, 715754fc: 1412 → 1744). Headless
// am Kopf 6a571e3b nachgestellt (Null-Renderer, der Haken gesetzt, dieselben vier Schritte): ohne das Wort 1412 → 1412, Ring 0; mit
// ihm 1412 → 1744, 12 → 20/21, die alten 0,917, Ring 9 neu, Median 22 m vom Haus / 59 m vom Ort (die Zahl von 715754fc).
// Erst an der Uhr: Ort, Haus und Hügel stehen wie bisher ohne fremde Dörfer. Die Probe ist `mutiert`: die Tür danach lädt die
// Seite neu, der Haken steht wieder.
const K4_UHR =
    "const K = window.__k4; window.__anazhAutoSettlement = true; K.E1 = K.haeuser(); K.j0 = K.c.wachs && K.c.wachs.jahr; r.state.spielZeit += 1500; " +
    "return { kern: !!K.c.kern, jahr: K.j0, haeuser: K.E1.length, uhr: r.state.spielZeit };";
const K4_STAND =
    "const K = window.__k4, c = K.c, E = K.haeuser(), ring = E.filter((e) => !K.E1.includes(e)).map((e) => [e.position.x, e.position.z]); " +
    "const med = (q) => (ring.length ? Math.round(ring.map(([x, z]) => Math.hypot(x - q[0], z - q[1])).sort((a, b) => a - b)[ring.length >> 1]) : null); " +
    "return { jahr: [K.j0, c.wachs && c.wachs.jahr], haeuser: [K.E1.length, E.length], slots: r._bewohnerSiedlungen.get(K.k).plan.slots.length, " +
    "bleiben: +(K.E1.filter((e) => E.includes(e)).length / K.E1.length).toFixed(3), ring: { neu: ring.length, zumHaus: med(K.haus), zumOrt: med([c.x, c.z]) }, offen: r._dorfOffen() };";
const K4_KAMERA =
    "const K = window.__k4, h = K.hill, mx = (K.c.x + K.haus[0]) / 2, mz = (K.c.z + K.haus[1]) / 2, my = K.hoch(mx, mz); " +
    "return { pose: [h.x, h.y + 1.7, h.z, mx, my + 4, mz].map((v) => +v.toFixed(2)), d: Math.round(Math.hypot(h.x - mx, h.z - mz)), hoeher: Math.round((h.y - my) * 10) / 10 };";
const K4_SCHRITT = (name, code, sek) =>
    "timeout " + sek + " $W eval '" + code + "' > \"$L/k4-" + name + ".json\" 2>&1; echo '@@PUNKTE@@ " + name.toUpperCase() + "'; cat \"$L/k4-" + name + ".json\"; echo";
const K4_HUEGEL = (datei) => "HILL=$(" + LIES("console.log(e.hill ? e.hill.x.toFixed(1) + \" \" + e.hill.z.toFixed(1) : \"\")") + " \"$L/k4-" + datei + ".json\" 2> /dev/null)";

// DER HIT-STOP DES SPIELS neben der Linse (halten.K2, 23.10.): latenz zählt den Halt im Bild (stehende Schwung-Uhr UND Hand);
// die Haken zählen daneben, was das Spiel tut — jeder Treffer, der den Halt setzt (`_kampfHitJuice`, seine Dauer), und wie weit
// die Hand im gesetzten Halt je Takt noch gleitet. So heißt ein ROT beim Namen: kein Treffer am Ziel (gesetzt 0) ist das
// Werkzeug, ein gesetzter Halt mit gleitender Hand das Spiel. Der Code trägt kein einfaches Hochkomma (bash '…').
const HIT_HAKEN =
    "const L = (window.__hs = { n: 0, dauer: [], takte: 0, gleit: 0 }); const pj = r._kampfHitJuice.bind(r); " +
    "r._kampfHitJuice = function (c, now, u, ke) { const v = pj(c, now, u, ke); L.n++; L.dauer.push(r.state.player._hitStopUntil - now); return v; }; " +
    "const pm = r.state.playerMesh, V = new T.Vector3(); let vor = null; const tick = r._gameLoopTick.bind(r); " +
    "r._gameLoopTick = function (t) { const v = tick(t); const p = r.state.player; " +
    "if (p && p._hitStopUntil > performance.now() / 1000) { const w = pm.userData.rig.armR.wrist.getWorldPosition(V).sub(pm.position).toArray(); " +
    "if (vor && vor.id === p._hitStopUntil) { L.takte++; L.gleit = Math.max(L.gleit, Math.hypot(w[0] - vor.w[0], w[1] - vor.w[1], w[2] - vor.w[2])); } " +
    "vor = { id: p._hitStopUntil, w }; } return v; }; return 1;";
const HIT_LESEN =
    "const L = window.__hs; return { gesetzt: L.n, dauerMs: [Math.min(...L.dauer), Math.max(...L.dauer)].map((x) => Math.round(x * 1000)), haltTakte: L.takte, gleitMm: Math.round(L.gleit * 10000) / 10 };";

// latenz-Reihen: je Sicht × Verb fehlt 0 und p95 ≤ 50 ms
// DIE LATENZ IST BILDRATEN-FEST (24.10., Prüfung der Buchung 61 → 80: leib.K1#1 kippte an EINEM SHA 056330d8 von ROT auf GRÜN,
// p95 75,8 ms bei Bildzeit 32,9 ms gegen 43,3 ms bei 16,6 ms an 1d9164e9): die Bildzeit eines Laufs hängt an Gerät und Last
// (8,7–32,9 ms an der Radeon), das Kriterium an keiner. Jede Latenz-Station fährt LAEUFE eigene Boots (Sitzung je Boot,
// `{N}` = die Nummer) und urteilt über den SCHLECHTESTEN; jede Bildzeit steht in der Zahl.
// IN DER SITZUNG (29.10., ≤ 30 min je Gerät): EIN Lauf in der Welt der Sitzung, kein zweiter Boot (bis dahin 3 Boots × 50 Proben je
// Reihe, 6–15 min je Station); LATENZ_PROBEN je Sicht × Verb, p95 ≤ 50 ms und fehlt 0 wie vorher — die Bildzeit des Laufs steht in
// der Zahl, ein Lauf bei hoher Bildzeit bleibt ROT beim Namen
const LAEUFE = 1;
const LATENZ_PROBEN = 15;
const lauf = (n, zeilen) => zeilen.map((z) => z.replace(/\{N\}/g, String(n)));
const latenzLaeufe = (...zeilen) => {
    const json = Array.from({ length: LAEUFE }, (_, i) => '"{AUS}.lauf' + (i + 1) + '.json"').join(" ");
    return [
        "rm -f " + json,
        ...Array.from({ length: LAEUFE }, (_, i) => lauf(i + 1, zeilen)).flat(),
        // die Läufe in EINE Datei {AUS}: { laeufe: [ latenz-JSON | null ] }
        "node -e 'const fs = require(\"fs\"); const [aus, ...f] = process.argv.slice(1); fs.writeFileSync(aus, JSON.stringify({ laeufe: " +
            "f.map((x) => { try { return JSON.parse(fs.readFileSync(x, \"utf8\")); } catch (_e) { return null; } }) }));' \"{AUS}\" " + json,
    ];
};
// über alle Läufe: GRÜN nur, wenn JEDER Lauf jede Reihe hält; die Zahl nennt je Reihe das schlechteste p95 und jede Bildzeit
function latenzSchlechtester(j, ids, n, soll = 50) {
    const da = ((j && j.laeufe) || []).filter((l) => l && l.reihen);
    if (da.length < LAEUFE) return { gruen: false, zahl: "latenz-JSON in " + da.length + " von " + LAEUFE + " Läufen" };
    const haelt = (l) => ids.every((id) => l.reihen[id] && l.reihen[id].fehlt === 0 && l.reihen[id].n >= n && l.reihen[id].p95 <= soll);
    const schlecht = (id) => {
        const r = da.map((l) => l.reihen[id]);
        if (r.some((x) => !x)) return id + " —";
        const fehlt = r.reduce((s, x) => s + x.fehlt, 0);
        return id + " " + Math.max(...r.map((x) => x.p95)) + (fehlt ? " (fehlt " + fehlt + ")" : "");
    };
    return {
        gruen: da.every(haelt),
        zahl: "schlechtester von " + LAEUFE + " Läufen p95 ms " + ids.map(schlecht).join(" · ") + " · Bild " + da.map((l) => l.bildMs).join("/") + " ms",
        da,
    };
}
// DIE LATENZ DER VERBEN UND DER HIT-STOP IN EINEM LAUF (leib.K1#2 und halten.K2#1, Zwillinge, 29.10.): die Haken des Spiels, die
// Linse über gehen, springen, einsteigen, hieb in Ego und Third, das Lesen der Haken — bis dahin fuhr jede Station ihre drei Boots
// (halten.K2#1 hieb allein, 30 Proben je Reihe); einsteigen und hieb lassen Wagen und Treffer in der Welt (mutiert)
// OFFEN (w4-stationen-schnell-b; GTX b4bcf19c 79 s, Bild 14,9 ms): 120 Proben, je Probe Leib-Dynamik in präsentierten Bildern — der
// Abstand zweier Proben (Radeon eeaff9d6, `t0` je Probe): gehen 0,45 s, springen 0,68 s, einsteigen 0,21 / 0,72 s, hieb 0,80 / 0,96 s
// (Ego / Third). Nach dem Zurücksetzen an den Start läuft der Leib mit seiner Geschwindigkeit nach (der Sprungbogen, der Schwung bis
// zu seinem Ende), dann 8 ruhige Bilder; weniger Proben schönten das p95 (aus 15 ist es das Maximum). Der Hebel liegt in `latenzAn`
// (scripts/lib/haenger-linse.cjs `L.bereit`: mit der Lage auch Geschwindigkeit, Luft und Gleiten des Leibs zurück) — ungebaut, ohne Karte
// unprüfbar
const LATENZ_HALT_SITZUNG = sitzung(33,
    ...latenzLaeufe(
        "boot",
        "timeout 120 $W umstellen --ort wiese > /dev/null 2>&1",
        "teil HAKEN{N} $W eval '" + HIT_HAKEN + "'",
        "teil LATENZ{N} $W latenz --proben " + LATENZ_PROBEN + ' --sicht ego,third --verb gehen,springen,einsteigen,hieb --json "{AUS}.lauf{N}.json"',
        "teil SPIEL{N} $W eval '" + HIT_LESEN + "'"
    )
);
// DIE AUSNAHME (w12-proben-frist): acht Reihen zu LATENZ_PROBEN (zwei Sichten × vier Verben, 120 Proben), je Probe die Taste bis zum
// bewegten Ausgabe-Bild an der Wanduhr — doppelt so viele wie leib.K1#1 (60 Proben: Radeon p90 36,7 s, GTX 26,3 s); Radeon 8ef49bef
// riss 45 s in LATENZ1
// DIE FAHRT IN EINEM LAUF (fahrzeug.K3#2, fahrzeug.K4#1, fahrzeug.K4#2, Zwillinge, 29.10.): der Ritt (tempo4.js auf dem Weg der Probe,
// WELT — w4-heil-fahrzeug 30.10.), T5, der Blick am Steilhang (blick.js, BLICK) und T4 von gate:fahr-leben (FAHR) — alle in der EINEN
// Welt der Sitzung (proben-welt.cjs `fahrWelt`; bis w4-ssa-E lief die Linse ganz in einer eigenen Null-Welt daneben, und `wait` hielt
// die Probe an ihr fest: GTX ≥ 90 s). Bis 29.10. fuhr jede der drei Stationen die Linse und ihren Boot für sich.
// DIE EINGABE DER PROBEN (richter-hand 13.11.): tempo4.js und blick.js schrieben `state.keys`, das w12-menue (d66731b4, 05.11.) fällte —
// jeder Ritt und jeder Blick warf „Cannot set properties of undefined (setting 'w')“ und ließ den GT aufgesessen stehen; jetzt halten
// beide die Aktionen der EINEN Verb-Tafel (`verbTafel.gehalten`: vor · zurueck · links · rechts), wie scripts/lib/fahr-proben.cjs
const FAHR_SITZUNG = { befehl: PW.torBefehl(PW.fahrWelt, "4b2d3844504e59b529d1909e9875bb3b0e630157", "8994f2f32f5bbe4e9b541b0df6ddf40174ab10b7"), sek: 33 };
// ───────────────────────── DIE PROBEN DER STADT IN DER SITZUNG (29.10., stationen/sitzung-seite.js) ─────────────────────────
// Das Gesetz des Schöpfers: eine Fahrt durch jedes System ≤ 30 min samt Dauerlast — keine dieser Stationen bootet mehr eine Welt.
const { probeBefehl } = require("./sitzung-seite.js");

// ───────── fahrzeug.K3#1 IN DER SITZUNG: Garage UND Welt in der warmen Welt (proben-schnell, 30.10.) ─────────
// DIE GARAGE ist die Labor-Linse des Spiels (scripts/diag-garage-labor.cjs als Bibliothek, `H.linse`) mit dem Mess-Patch MK2110
// (Ruhe und Spitze aus v/vmax, koordination bericht/2110-mk-kopf/garage-mk.diff) als ANKER an der Linse — nie mehr ein Patch im
// Spiel-Baum. Ihr Browser ist der der Sitzung (ein Fenster neben der Welt, die Seite vom save-server der Sitzung). Bis 30.10. startete
// sie ihren eigenen Chrome samt Server (`LINSE_GPU=hardware`, Port {PORT}+20001) nach `git apply` im Spiel-Baum: an der Radeon
// (379e5f56, die Probe allein in ihrer Sitzung) 55,5 s — die Garage 27,6 s, der Ritt 33,4 s, dazu git und die Kommandozeile der
// Werkbank. DIE WELT fährt tempo4.js über die Werkbank bis zum Plateau (`__tempoNur = "vmax"`); Orbit, Drift und die Schüsse misst
// fahrzeug.K3#2 (FAHR_SITZUNG). Beide nebeneinander, ihre Zeilen danach in der Reihe, die das Urteil liest (WELT, dann GARAGE).
// DIE RUHE steht an der Zeile, die G2 und G6 in der Probefahrt vor dem Gas abschließt (seit w4-fahrzeug2-leicht b6aef7f5 lesen
// G2–G6 + G8 das EINE Verdikt; bis dahin `m.schilderNamen` an derselben Stelle — die alte Zeile fehlte, fahrzeug.K3#1 UNGEMESSEN)
const MK_ANKER = [
    [
        "    Object.assign(m, b, { schilderFahrt: b.namen.length });\n",
        "    Object.assign(m, b, { schilderFahrt: b.namen.length });\n" +
            '    m.mkRuhe = await page.evaluate(() => ({ fov: cam.fov, arm: cam.position.distanceTo(vehicle.position), v: Math.abs(car.speed) }));\n',
    ],
    [
        '    await page.keyboard.up("KeyW");\n    m.tempo = await page.evaluate(',
        "    m.mkTop = await page.evaluate(() => new Promise((res) => { const vm = fahrGesetzLab().vmax; let best = null, t0 = performance.now(), last = []; const tick = () => { const v = Math.abs(car.speed); const p = { fov: cam.fov, arm: cam.position.distanceTo(vehicle.position), v, vmax: vm }; if (!best || v > best.v) best = p; last.push(v); if (last.length > 60) last.shift(); const stabil = last.length === 60 && Math.max(...last) - Math.min(...last) < 0.05; if (v >= 0.95 * vm || stabil || performance.now() - t0 > 60000) res(Object.assign(best, { nach: +((performance.now() - t0) / 1000).toFixed(1), stabil })); else requestAnimationFrame(tick); }; tick(); }));\n" +
            '    console.log("MK2110 " + JSON.stringify({ ruhe: m.mkRuhe, top: m.mkTop }));\n    await page.keyboard.up("KeyW");\n    m.tempo = await page.evaluate(',
    ],
];
async function probeTempoGarage(H) {
    const { fs, path } = H;
    const { browser } = await H.verbinde();
    const fenster = [];
    let lauf = null;
    const L = H.linse("scripts/diag-garage-labor.cjs", ["laborVerdict"], {
        ersetze: H.seite.MK,
        stumm: {
            hauptLauf: (f) => (lauf = f),
            statikServer: () => ({
                lausche: async () => {},
                zeige: (seite, frist, rest, warte) => seite.goto("http://localhost:" + H.S + "/" + rest, { waitUntil: warte, timeout: frist }),
                close: () => {},
            }),
            // DAS FENSTER DER GARAGE kleiner als das der Welt (1940 × 1200, werkbank --echt): ein Fenster, das sie ganz deckt, lässt
            // Windows die Welt verdeckt nennen — sie zeichnet dann kein Bild (rAF ruht), und der Ritt stand, solange die Garage lief
            starteBrowser: async () => ({
                newPage: async () => {
                    const p = await browser.newPage({ type: "window", windowBounds: { left: 0, top: 0, width: 1300, height: 820 } });
                    fenster.push(p);
                    return p;
                },
                close: async () => {
                    for (const p of fenster.splice(0)) await p.close().catch(() => {});
                },
            }),
            urteilEnde: (rot, roteZeile, grueneZeile) => console.log(rot ? roteZeile : grueneZeile),
        },
    });
    if (!L.laborVerdict || !lauf) throw new Error("die Labor-Linse trägt keinen Lauf (hauptLauf)");
    const tempo = fs.readFileSync(path.join(process.env.K, "bericht", "3010-heil-fahrzeug", "tempo4.js"), "utf8");
    const tw = Date.now();
    // DER ORT DER PROBE (w4-proben-tempo2): die Mess-Wiese stellt und beruhigt die Sitzung VOR dem Deckel (ihr Ort steht hier im Befehl,
    // punkte.cjs `probeOrt`), der Ritt sucht seine Bahn, wo der Spieler steht (`__messWiese`) — bis dahin stand die Welt dort, wo die
    // Probe davor sie ließ, tempo4.js sprang an die Mess-Wiese (W0) und schwang dort im Deckel ein (GTX e0139769: ortStandS 17,9 s
    // von 38,9 s, 617 Takte)
    await H.wb("/umstellen", { ort: "wiese", sicht: "ego" }, Math.max(5, H.rest() - 4) * 1000);
    const ritt = H.wb("/eval", { code: 'window.__tempoNur = "vmax"; window.__messWiese = [r.state.playerMesh.position.x, r.state.playerMesh.position.z];\n' + tempo }, Math.max(5, H.rest() - 4) * 1000).catch((e) => ({ fehler: String((e && e.message) || e) }));
    // die Zeilen der Garage gesammelt, solange beide laufen (der Ritt schreibt erst am Ende)
    const log = console.log, puffer = [];
    console.log = (...a) => puffer.push(a.map(String).join(" "));
    console.error = console.log;
    const tg = Date.now();
    const garage = lauf().then(
        () => ({ exit: 0, s: (Date.now() - tg) / 1000 }),
        (e) => (puffer.push("GARAGE ABSTURZ " + String((e && e.stack) || e).split("\n").slice(0, 3).join(" | ")), { exit: 2, s: (Date.now() - tg) / 1000 })
    );
    const welt = await ritt;
    const ms = Date.now() - tw;
    const g = await H.binnen(garage, Math.max(1, H.rest() - 2) * 1000, { exit: 124, s: (Date.now() - tg) / 1000 });
    console.log = log;
    console.error = log;
    // KEIN URTEIL IST KEIN ROT (w4-sitzung-urteil, hier w4-proben-tempo2): riss der Ritt oder die Garage die Frist der Probe, misst die
    // Probe nichts — UNGEMESSEN beim Namen (FRIST_MARKE), nie ROT (GTX takt27b 94c079cb: „Welt: kein Ergebnis von tempo4.js — /eval ohne
    // Antwort binnen 22 s“ stand als frisches ROT)
    if (welt && /ohne Antwort binnen/.test(String(welt.fehler))) H.fristRiss("der Ritt (tempo4.js): " + welt.fehler);
    if (g.exit === 124) H.fristRiss("die Garage nach " + g.s.toFixed(1) + " s");
    log("@@PUNKTE@@ WELT");
    log(JSON.stringify(Object.assign({ ms }, welt), null, 1));
    log("@@PUNKTE@@ EXIT " + (welt && welt.ergebnis && !welt.fehler ? 0 : 1));
    log("@@PUNKTE@@ GARAGE");
    for (const z of puffer) log(z);
    log("@@PUNKTE@@ EXIT " + g.exit);
    log("  (Welt " + (ms / 1000).toFixed(1) + " s · Garage " + g.s.toFixed(1) + " s im Fenster neben ihr)");
    return { welt: !!(welt && welt.ergebnis), garage: g };
}
const TEMPO_GARAGE_PROBE = probeBefehl(probeTempoGarage, 60, { MK: JSON.stringify(MK_ANKER) });

// DAS ERWACHEN DER ZELLE (siedlung.K5, Seite: r = Welt, T = THREE — ein Rumpf an `werkbank eval`): die Messung M36 (Zweig
// koordination bericht/2410-siedlung-k5/m36-stufe.js) ohne ihren Anmarsch. Die Zell-Info der Zelle M.zelle trägt nH = M.nH; der
// Spieler steht M.vor m vor ihrem Rand (`nearM` + `mehrM`), also im Vorlauf-Ring, und der Loop läuft, bis der Vorrat der Zelle da
// ist (Export und Ort-Wahl, `_dorfVorraete`) und die Foundry M.ruhig Bilder in Folge ruht (höchstens M.vorlaufMs) — der Stand eines
// Spielers, der mit 4 m/s durch den Ring kam; dann geht er mit 4 m/s auf den Anker zu, bis sie erwacht (`_autoSettlementSpawnCell`).
// Gezählt wie M36: Erwachen → erstes Haus der Zelle im Sichtkegel in der Stufe seiner Kette für seinen Abstand (in der Mesh-Zone sein
// Mesh, dahinter die Hülle seines Gesetzbuchs im Welt-March), dazu der Bau-Hash. Die Probe endet am ersten Haus (bis 29.10. ging der
// Spieler 450 m an und weiter bis zum ersten Mesh: je nH ein eigener Boot, 6,3 min Radeon b3f9ae95). Eine schon wache Zelle meldet
// `wach` (die Probe holt eine frische Welt).
// DIE ZELLE UND NUR SIE (w4-sitzung-urteil; Radeon b3f9ae95 und GTX 3ed95dcf: in der Sitzung erwachte nH 12 im Gang nie oder galt ein
// `haus_chinesisch` in 13,7–14,9 m als ihr erstes Haus — das Haus der Nachbarzelle −3,−5; der Einzel-Lauf maß `haus_alemannisch`, Hülle
// in 234 m, Bau-Hash 175269cc): M36 ging 450 m an, die Nachbarn, durch deren Nah-Ring der Weg führt, erwachten unterwegs und standen
// fertig, als die Zelle erwachte. Die Probe beginnt M.vor m vor dem Rand, bis dahin aus der Richtung, in der die Sitzung den Spieler
// ließ — im Nah-Ring von −3,−5 (193 m): sie erwachte zuerst, ihr Export und ihr Zug hielten den Dorf-Zug (EIN Akt je Takt; ein Ruf der
// Zelle fiel ab und galt doch als Erwachen), und jedes neue Haus im Umkreis von 260 m zählte. Darum (a) der ANMARSCH aus der Richtung
// (je 5°), deren Bahn vom Start bis zum Rand am weitesten vor dem Nah-Ring jeder Nachbarzelle des Zell-Gesetzes bleibt
// (`_autoSettlementCellInfo` der 5 × 5 Zellen); (b) gegangen wird erst, wenn auch der DORF-ZUG FREI ist (kein Zug, kein Export im
// Flug, keine Wiederkehr) — wird er es im Vorlauf nicht, hat die Probe kein Urteil (`frist`, die Marke beim Namen); (c) das ERWACHEN
// ist der Ruf, den das Spiel annimmt (die Zelle ist danach der Export im Flug oder im Gedächtnis); (d) gezählt wird nur ein Haus
// IHRES PLANS (Same und Ort eines Slots aus dem Zug der Zelle, `cellKey`). Der Dorf-Zug steht danach, wie die Probe ihn fand.
async function dorfErwachen(M) {
    const st = r.state;
    const A = r.constructor.AUTO_SETTLEMENT;
    const rend = st.renderer;
    const zugVorher = "__anazhAutoSettlement" in window ? { wert: window.__anazhAutoSettlement } : null;
    const zugZurueck = () => (zugVorher ? (window.__anazhAutoSettlement = zugVorher.wert) : delete window.__anazhAutoSettlement);
    delete window.__anazhAutoSettlement; // der Dorf-Zug lebt wie im Spiel (ein Messort davor hielt ihn vielleicht an)
    const info0 = r._autoSettlementCellInfo(M.zelle[0], M.zelle[1]);
    if (!info0) return (zugZurueck(), { fehler: "die Zelle trägt kein Dorf", zelle: M.zelle });
    if ((st.worldMeta.settlementCells || {})[info0.key] || (r._dorfVorraete && r._dorfVorraete.has(info0.key)) || (r._autoSettlementRejected && r._autoSettlementRejected.has(info0.key)))
        return (zugZurueck(), { wach: true, zelle: M.zelle });
    const info = Object.assign({}, info0, { nH: M.nH });
    const orig = r._autoSettlementCellInfo;
    r._autoSettlementCellInfo = function (x, z) {
        return x === M.zelle[0] && z === M.zelle[1] ? info : orig.call(this, x, z);
    };
    const nah = A.nearM + (info.mehrM || 0);
    const start = nah + M.vor;
    const pm = st.playerMesh.position;
    const nachbarn = [];
    for (let dx = -2; dx <= 2; dx++)
        for (let dz = -2; dz <= 2; dz++) {
            const n = dx || dz ? orig.call(r, M.zelle[0] + dx, M.zelle[1] + dz) : null;
            if (n) nachbarn.push(n);
        }
    let anmarsch = null;
    for (let g = 0; g < 360; g += 5) {
        const u = [Math.cos((g * Math.PI) / 180), Math.sin((g * Math.PI) / 180)];
        let rand = Infinity;
        for (const d of [start, nah])
            for (const n of nachbarn) rand = Math.min(rand, Math.hypot(info.x + u[0] * d - n.x, info.z + u[1] * d - n.z) - (A.nearM + (n.mehrM || 0)));
        if (!anmarsch || rand > anmarsch.rand) anmarsch = { grad: g, u, rand };
    }
    const sx = info.x + anmarsch.u[0] * start, sz = info.z + anmarsch.u[1] * start;
    pm.set(sx, r._voxelSurfaceY(sx, sz) + 1.8, sz);
    let erwacht = null, erstes = null, gesetzt = null, imRadius = null, bild = 0, hash = null, bereit = null, taktFehler = null, frist = null, abgewiesen = 0;
    const vorher = new Set(st.architectures);
    const spawn = r._autoSettlementSpawnCell;
    r._autoSettlementSpawnCell = function (cx, cz, i) {
        const ruf = { t: performance.now(), bild, d: Math.hypot(pm.x - info.x, pm.z - info.z) };
        const p = spawn.call(this, cx, cz, i);
        if (cx === M.zelle[0] && cz === M.zelle[1] && !erwacht) {
            if (this._autoSettlementPendingKey === info.key || (st.worldMeta.settlementCells || {})[info.key]) erwacht = ruf;
            else abgewiesen++;
        }
        return p;
    };
    // der Plan der Zelle: der Zug mit ihrem Schlüssel — oder ihr Ort im Gedächtnis (`_ortPlaene`) — trägt je Slot Same und Ort
    // (`_spawnSettlementSlot`: origin + slot, seed); je Bild nach dem Erwachen geholt, bis er steht
    let plan = null;
    const planHolen = () => {
        const q = r._autoSettlementQueue, c = (st.worldMeta.settlementCells || {})[info.key];
        const [v, o] = q && q.plan && q.cellKey === info.key ? [q.plan, q.origin] : c && r._ortPlaene && r._ortPlaene.get(c.ort) ? [r._ortPlaene.get(c.ort), { x: c.x, z: c.z }] : [];
        if (v && Array.isArray(v.slots)) plan = { o, slots: new Map(v.slots.map((s) => [s.seed >>> 0, s])) };
    };
    const derZelle = (e) => {
        const sl = plan && plan.slots.get(e.seed >>> 0);
        return !!sl && Math.hypot(e.position.x - plan.o.x - sl.x, e.position.z - plan.o.z - sl.z) < 1;
    };
    const zugFrei = () => !r._autoSettlementQueue && !r._autoSettlementPendingKey && !r._stlWegePending && !r._ortWachsFlug;
    const fnv = (s) => {
        let h = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
        return h.toString(16);
    };
    const vorrat = () => {
        const v = r._dorfVorraete && r._dorfVorraete.get(info.key);
        return !!(v && v.da);
    };
    const ruhig = () => {
        try {
            return !r._weltOffen().foundry;
        } catch (_e) {
            return false;
        }
    };
    const cam = st.camera, frust = new T.Frustum(), mat = new T.Matrix4();
    try {
        await new Promise((ok) => {
            let t0 = null, tGeh = null, still = 0;
            const halt = () => (rend.setAnimationLoop(null), ok());
            rend.setAnimationLoop((t) => {
                try {
                    bild++;
                    t0 ??= t;
                    if (tGeh == null) {
                        still = vorrat() && ruhig() && zugFrei() ? still + 1 : 0;
                        if (still >= M.ruhig || t - t0 > M.vorlaufMs) {
                            bereit = { ms: Math.round(t - t0), bilder: bild, vorrat: vorrat(), ruhig: ruhig(), zugFrei: zugFrei() };
                            const q = r._autoSettlementQueue;
                            // ohne freien Dorf-Zug erwachte die Zelle nie im Gang (der Zug eines Nachbarn hält ihn): kein Urteil
                            if (!bereit.zugFrei) {
                                frist = "der Dorf-Zug wurde im Vorlauf von " + M.vorlaufMs + " ms nicht frei (Zug " + ((q && q.cellKey) || "—") + ", Export " +
                                    (r._autoSettlementPendingKey || "—") + (r._stlWegePending ? ", Wiederkehr" : "") + ")";
                                return halt();
                            }
                            tGeh = t;
                        }
                    }
                    // die gehende Pose wie M36: 4 m/s auf den Anker zu, die Lage absolut je Bild gesetzt
                    const weg = tGeh == null ? 0 : Math.min(start - 30, (4 * (t - tGeh)) / 1000);
                    pm.set(sx - ((sx - info.x) / start) * weg, pm.y, sz - ((sz - info.z) / start) * weg);
                    st.yaw = Math.atan2(info.x - pm.x, info.z - pm.z);
                    st.pitch = 0;
                    r._gameLoopTick(t);
                    if (erwacht && !plan) planHolen();
                    if (erwacht && !erstes) {
                        cam.updateMatrixWorld(true);
                        frust.setFromProjectionMatrix(mat.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
                        const jetzt = () => ({ ms: +(performance.now() - erwacht.t).toFixed(1), bilder: bild - erwacht.bild });
                        for (const e of st.architectures) {
                            if (vorher.has(e) || !/^haus_/.test(e.type) || !derZelle(e)) continue;
                            gesetzt ??= jetzt();
                            if (!frust.containsPoint(e.position)) continue;
                            const d = Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
                            const nahZone = d <= st.architectureCullingRadius;
                            if (nahZone) imRadius ??= Object.assign(jetzt(), { radius: st.architectureCullingRadius });
                            const h = e._ziegelSlot, L = st.weltMarch && st.weltMarch.listeDaten, fp = h && r._archFoundryPreset(e);
                            const stufe = nahZone
                                ? r._archIsRendered(e) ? "mesh" : null
                                : h && L && L[h.feld * 32 + 3] !== 0 && fp && r._foundryFernForm(fp) === "huelle" ? "huelle" : null;
                            if (!stufe) continue;
                            erstes = Object.assign(jetzt(), {
                                stufe,
                                typ: e.type,
                                same: e.seed,
                                ort: [+e.position.x.toFixed(2), +e.position.z.toFixed(2)],
                                abstand: +d.toFixed(1),
                                auge: [+pm.x.toFixed(1), +pm.y.toFixed(1), +pm.z.toFixed(1)],
                            });
                            hash = fnv([info.seed, info.nH, info.x.toFixed(2), info.z.toFixed(2), e.type, e.seed, erstes.ort].join("|"));
                            break;
                        }
                    }
                    const ohneErwachen = tGeh != null && !erwacht && t - tGeh > 1000 * (M.vor / 4 + 6);
                    if (erstes || ohneErwachen || (erwacht && performance.now() - erwacht.t > M.nachMs)) halt();
                } catch (e) {
                    taktFehler = String((e && e.message) || e);
                    halt();
                }
            });
        });
    } finally {
        r._autoSettlementCellInfo = orig;
        r._autoSettlementSpawnCell = spawn;
        rend.setAnimationLoop(null);
        zugZurueck();
    }
    const zelle = (st.worldMeta.settlementCells || {})[info.key] || null;
    return {
        gesetzt, imRadius, erstes, hash, bereit, taktFehler, frist, nah, start, zelle: M.zelle, nH: M.nH, same: info.seed,
        anker: [+info.x.toFixed(1), +info.z.toFixed(1)], anmarsch: { grad: anmarsch.grad, rand: +anmarsch.rand.toFixed(1), nachbarn: nachbarn.length },
        erwacht: erwacht && { bild: erwacht.bild, d: +erwacht.d.toFixed(1) }, abgewiesen, plan: plan ? plan.slots.size : null, bilder: bild, reserviert: zelle,
    };
}
// die Probe: nH 12 in der Welt, wie die Sitzung sie hält (eine schon wache Zelle holt eine frische), nH 300 in einer frischen Welt
// (`punkte.cjs grundstellung`, Spielstand weg, die Seite neu — wie bis 29.10. je nH ein frischer Boot); je nH der Abschnitt
// „@@PUNKTE@@ NH<n>" mit dem JSON-Block, den das Urteil liest
async function probeDorf(H) {
    const j = (H.teil = { je: {} });
    for (const [i, nh] of [12, 300].entries()) {
        let e = null;
        // ein nH, das die Frist nicht mehr trägt, oder ein Vorlauf ohne freien Dorf-Zug: kein Urteil (die EINE Marke, punkte.cjs FRIST_MARKE)
        if (!(H.rest() > 12)) H.fristRiss("nH " + nh + " ausgelassen (" + H.rest().toFixed(1) + " s Rest)");
        for (let v = 0; v < 2 && H.rest() > 12; v++) {
            if (i > 0 || v > 0) {
                const tg = Date.now();
                H.grundstellung();
                H.zeile("frische Welt (Grundstellung) nach " + ((Date.now() - tg) / 1000).toFixed(1) + " s");
            }
            const M = { zelle: [-4, -6], nH: nh, vor: 8, ruhig: 20, vorlaufMs: 10000, nachMs: 8000 };
            e = await H.evalWelt("return await (" + H.seite.DORF + ")(" + JSON.stringify(M) + ");", Math.max(5, H.rest() - 2) * 1000);
            if (!e || !e.wach) break;
            H.zeile("die Zelle " + M.zelle.join(",") + " ist schon wach — eine frische Welt");
        }
        if (e && e.frist) H.fristRiss("nH " + nh + ": " + e.frist);
        j.je["nH" + nh] = e;
        console.log("@@PUNKTE@@ NH" + nh);
        console.log(JSON.stringify({ ergebnis: e }, null, 1));
        console.log("@@PUNKTE@@ EXIT 0");
    }
    return j;
}
const DORF_PROBE = probeBefehl(probeDorf, 45, { DORF: dorfErwachen });

// DAS START-DORF VON INNEN (siedlung.K1#2, Seite: r = Welt, T = THREE — ein Rumpf an `werkbank eval`): die Messung von gate:haus-welt
// W10 für die Häuser des Start-Dorfs (scripts/diag-haus-welt.cjs `proben`, Phasen start + haus und `--bild` grund), ohne das
// Drehbuch-Dorf 7/18 am Hang, ohne W9 je Box und ohne die Proben daneben (Wasser, Abbau, Waise, Slot) — sie urteilen bauen.K2 und
// gate:haus-welt. Der Takt der Welt hebt das Start-Dorf am Genesis-Ort (der Dorf-Zug an, bis der Ort steht); je Haus-Slot seines Plans
// v2 (`_ortPlaene` unter `settlementCells.start.ort`) das Haus an seinem Ort — ein Slot ohne Haus ist ROT. Je Haus (1) DER SPIELGANG
// über den Sim-Schritt (W-Taste, `_stepFixedSim`): von der Tür bis Keller und Dachboden, um den Schacht, je Lauf der Spur-Rand, je
// Schritt der Hub; (2) DAS INNEN-BILD aus dem Ausgabe-Pfad (Mittag der Bühne, der Loop ruht): je Box des Körper-Satzes (fachwerk
// `grundVon`) bis zwei freie Blicke, das Auge 1,3 m über der Diele, der dunkelste Median (Luminanz linear) gegen den Boden im Schatten
// derselben Stunde (von DIESEM Haus gegen die Sonne der erste Boden 1 m vor jedem Bau, dessen Strahl zur Sonne einen Werfer trifft,
// das Auge 1,6 m hoch 3 m davor, 13 × 13 px). Bis 29.10. zwei Läufe der Linse in eigenen Browsern (Radeon b3f9ae95 10,72 min).
// Seit w4-ssa-C die EINE Quelle des Innen-Bilds: die Kopie in gate:haus-welt (`--bild`) fiel, sie lief in keiner Wand mehr.
async function startDorfInnen(o) {
    const THREE = window.THREE || T;
    const s = r.state, A = r.constructor, FC = window.__fachwerkCore, cam = s.camera, pm = s.playerMesh;
    const ende = performance.now() + o.fristMs;
    const aus = { haeuser: [], startDorf: null };
    if (!FC || typeof FC.HAUS !== "function" || typeof FC.grundVon !== "function") return Object.assign(aus, { fehler: "__fachwerkCore fehlt" });
    if (typeof window.__ausgabeAufnahme !== "function") return Object.assign(aus, { fehler: "der Ausgabe-Pfad fehlt in der Seite" });
    const DT = A.FIXED_DT || 1 / 60;
    const FUSS = A.PLAYER_FOOT_OFFSET;
    let t = 5000;
    const rund = (v, k = 100) => Math.round(v * k) / k;
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    const pumpe = async (n) => {
        for (let k = 0; k < n; k++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (k % 8 === 0) await sleep(10);
        }
    };
    const warteBis = async (bis, n, max, ms) => {
        let ja = false;
        try {
            for (let k = 0, weiter = window.__deckel("start-dorf-innen", max); !(ja = bis()) && weiter() && k++ < 4 * max && performance.now() < ende; )
                await pumpe(n).then(() => ms && sleep(ms));
        } catch (_e) {}
        return ja;
    };
    const welt = (e, lx, lz) => {
        const c = Math.cos(e.rotationY || 0), sn = Math.sin(e.rotationY || 0);
        return { x: e.position.x + lx * c + lz * sn, z: e.position.z - lx * sn + lz * c };
    };
    const stell = (x, y, z) => {
        pm.position.set(x, y, z);
        s._fieldVy = 0;
        if (s.playerVel && s.playerVel.setValue) s.playerVel.setValue(0, 0, 0);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm.position);
        for (let k = 0; k < 20; k++) r._stepFixedSim((t += DT), DT);
    };
    // das Gesetzbuch je Haus EINMAL (w4-ssa-C: Gang und Innen-Bild bauten es je Haus zweimal — `HAUS(…).build`, das Teuerste der
    // Seite neben dem Sim-Schritt; dasselbe Haus, dieselben Größen)
    const gebaut = new Map();
    const gesetz = (e) => {
        if (gebaut.has(e)) return gebaut.get(e);
        const pre = FC.PRESETS && FC.PRESETS[e.type.slice(5)];
        if (!pre) return null;
        const P = FC.hausParams(pre, e.studioOv || null);
        if (!(e.studioOv && e.studioOv.seed != null)) P.seed = e.seed;
        const Hh = FC.HAUS(THREE, FC.mat, P);
        Hh.build({ gelaende: false });
        // NUR WAS DIE PROBE LIEST (OMEN 12.11., siedlung.K1#2 schwieg 170 s bei lebender Seite: die Halden-Stichprobe fand 451–501 MB
        // unter `gesetz` — jedes HAUS samt jedem Ziegel und Balken der Stufe 0 als eigene Geometrie, `beam` allein 299 MB, gehalten bis
        // zum Bild des letzten Hauses; das Spiel hielt daneben ~140 MB): der Gang liest `dims`, das Bild `solids` und über FC.grundVon
        // `masse` und `cellar` — Zahlen und Kästen; die Geometrie fällt mit dem Bau
        const leicht = { dims: Hh.dims, solids: Hh.solids, masse: Hh.masse, cellar: Hh.cellar };
        gebaut.set(e, leicht);
        return leicht;
    };
    // DAS START-DORF
    const g = r._genesisMitte();
    stell(g.x, hh(g.x, g.z) + 2, g.z);
    const takt = window.__anazhAutoSettlement;
    window.__anazhAutoSettlement = true;
    const zelle = () => ((s.worldMeta && s.worldMeta.settlementCells) || {}).start;
    await warteBis(() => !!zelle() && !r._autoSettlementQueue && !r._stlWegePending, 1, 1200);
    window.__anazhAutoSettlement = takt;
    const c = zelle();
    const plan = c && r._ortPlaene && r._ortPlaene.get(c.ort);
    const slots = ((plan && plan.slots) || []).filter((sl) => /^haus_/.test(r._slotBauplan(sl, r._foundry) || ""));
    aus.startDorf = { slots: slots.length, fehlt: [] };
    const SD = [];
    for (const sl of slots) {
        const [x, z] = [c.x + sl.x, c.z + sl.z];
        const e = s.architectures.find((a) => a.tuer && Math.hypot(a.position.x - x, a.position.z - z) < 0.05);
        if (e) SD.push(e);
        else aus.startDorf.fehlt.push(`${sl.kultur}@${Math.round(x)}/${Math.round(z)}`);
    }
    // (1) DER SPIELGANG je Haus (W10 wörtlich: Tür, Keller, jeder Lauf bis zum Dachboden, der Spur-Rand) — die Eingabe hält die
    // Verb-Tafel (`gehalten.vor`, unten); das tote `s.keys = s.keys || {}` (seit w12-menue liest es kein Verb) fiel
    for (const e of SD) {
        const h = { typ: e.type, start: true, gierGrad: Math.round((((e.rotationY || 0) * 180) / Math.PI) % 360) };
        aus.haeuser.push(h);
        if (performance.now() > ende) {
            h.fehler = "Frist der Probe";
            continue;
        }
        try {
            stell(e.position.x, e.position.y + 3, e.position.z);
            const l0 = () => e._servedLod === 0 && !!e._hausHuelle && e._hausHuelle.stufe === 0;
            // im Bau-Ereignis Takt um Takt (bis w4-ssa-C je Gang 10 Takte: der Gang begann bis zu 9 Bilder nach der Stufe 0)
            const takt1 = () => {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            };
            await window.__gebautNach(e, { fertig: l0, bau: () => {}, takt: takt1, max: 400 }).catch(() => null);
            const Hh = gesetz(e);
            if (!Hh) {
                h.fehler = "kein Gesetzbuch";
                continue;
            }
            const tu = e.tuer;
            const base = e.position.y - 0.5;
            const dm = Hh.dims || {};
            const fls = (dm.flights || []).filter((f) => f.x1 - f.x0 > 0.3);
            const kf = fls.find((f) => f.atLevel === "keller");
            const auf = fls.filter((f) => f !== kf).sort((a, b) => a.base - b.base || (a.atLevel === "attic") - (b.atLevel === "attic"));
            const gg = (h.gang = { hub: 0, fehlt: [], keller: !!kf, dach: auf.some((f) => f.atLevel === "attic") });
            const eg = dm.levelsY[0];
            const xm = (f) => (f.x0 + f.x1) / 2;
            const oben = (f) => f.zFoot + f.dir * (f.N * f.go + 0.4);
            const seite = (rechts) => (rechts ? dm.stairX1 + 0.6 : dm.stairX0 - 0.6);
            const ziel = (name, lx, lz, soll) => {
                const w = welt(e, lx, lz);
                let kl = 0;
                for (let k = 0, ruhe = 0; ruhe < 10; k++) {
                    s.verbTafel.gehalten.vor = !ruhe && k < 500 && Math.hypot(w.x - pm.position.x, w.z - pm.position.z) > 0.2;
                    if (!s.verbTafel.gehalten.vor) ruhe++;
                    // wie ein Mensch: führt der Weg in eine Wand (≤ 45° neben ihrer Normalen), geht er an ihr entlang, nie hinein
                    let [dx, dz] = [w.x - pm.position.x, w.z - pm.position.z];
                    const dn = dx * s._wandKontaktNx + dz * s._wandKontaktNz;
                    // das Wandkontakt-Fenster aus dem Leib-Gesetz des Kerns, wie die Linse (diag-haus-welt `leibGesetz().parkour`; seit
                    // w4-koerper-park fiel `_parkourGesetz` des Stamms — w12-proben-frist, Radeon 8ef49bef: „A._parkourGesetz is not a
                    // function“ in jedem der 18 Häuser); ein Stand davor liest den Stamm
                    const KC = window.__koerperCore;
                    const frischeSec = (KC && KC.leibGesetz ? KC.leibGesetz().parkour : A._parkourGesetz()).kontaktFrischeSec;
                    if (s._simZeit - s._wandKontaktAt < frischeSec && dn < -Math.SQRT1_2 * Math.hypot(dx, dz))
                        [dx, dz] = [dx - dn * s._wandKontaktNx, dz - dn * s._wandKontaktNz];
                    s.yaw = Math.atan2(dx, dz);
                    const y0 = pm.position.y;
                    r._stepFixedSim((t += DT), DT);
                    kl += s._parkourKletter > 0;
                    if (pm.position.y - y0 > gg.hub)
                        [gg.hub, gg.wo] = [pm.position.y - y0, `${name}: Fuß ${(y0 - FUSS - base).toFixed(2)} → ${(pm.position.y - FUSS - base).toFixed(2)} m`];
                }
                const rest = Math.hypot(w.x - pm.position.x, w.z - pm.position.z);
                const fuss = pm.position.y - FUSS - base;
                if (rest > 0.4 || Math.abs(fuss - soll) > 0.35 || kl)
                    gg.fehlt.push(`${name} ${rest.toFixed(2)} m neben, Fuß ${fuss.toFixed(2)}/${soll.toFixed(2)}, ${kl} Schritte geklettert`);
                [gg.x, gg.z] = [lx, lz];
            };
            const vor = welt(e, tu.x + tu.w / 2 - 0.3, tu.z - 0.25);
            stell(vor.x, base + 0.75 + FUSS, vor.z);
            ziel("tür", tu.x + tu.w / 2 - 0.3, tu.z + 1.8, NaN);
            if (kf || auf.length) {
                const hin = (name, lx, lz, soll) => {
                    const sr = seite((gg.z > dm.stairZ0 ? gg.x : lx) > (dm.stairX0 + dm.stairX1) / 2);
                    if (gg.z < dm.stairZ0 !== lz < dm.stairZ0) {
                        ziel(name + "-um", sr, gg.z, NaN);
                        ziel(name + "-um", sr, lz, NaN);
                    }
                    ziel(name, lx, lz, soll);
                };
                if (kf) {
                    const kt = kf.zFoot + kf.dir * (kf.N * kf.go + 0.4);
                    hin("keller-kopf", xm(kf), kt, eg);
                    ziel("keller", xm(kf), kf.zFoot - kf.dir * 0.6, kf.base + 0.12);
                    ziel("keller-auf", xm(kf), kt, eg);
                }
                for (const f of auf) {
                    hin(`fuß ${f.atLevel}`, xm(f), f.zFoot - f.dir * 0.6, f.base);
                    ziel(`lauf ${f.atLevel}`, xm(f), oben(f), f.base + f.N * f.rise);
                }
                for (const f of kf ? [kf, ...auf] : auf)
                    for (const v of [-0.12, 0.12]) {
                        const a = welt(e, xm(f) + v, f.zFoot - f.dir * 0.5);
                        stell(a.x, base + f.base + 0.1 + FUSS, a.z);
                        ziel(`rand ${f.atLevel} ${v}`, xm(f) + v, oben(f), f.base + f.N * f.rise);
                    }
            }
        } catch (err) {
            h.fehler = "Gang warf: " + String((err && err.message) || err);
        } finally {
            s.verbTafel.gehalten.vor = false;
            // DER STAND je Haus (das Lebenszeichen der Probe: der Treiber liest ihn neben dem langen eval, probeStartDorf)
            window.__startDorfStand = { teil: "gang", n: aus.haeuser.length, von: SD.length, typ: e.type };
        }
    }
    // (2) DAS INNEN-BILD je Haus: die Welt steht, die Bühne (Mittag · Sonne · Sommer), der Loop ruht
    // Takt um Takt (das Einschwingen schläft selbst je 5 Takte; `pumpe(1)` schlief je Takt 10 ms dazu)
    if (performance.now() < ende)
        await window.__weltStehtNach(() => {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
        });
    window.__buehne();
    s.renderer.setAnimationLoop(null);
    const [WB, HB] = [o.WB, o.HB];
    const tick = r._tickNahWiese;
    const schuss = async () => {
        r._tickNahWiese = tick;
        window.__bundlesNeu();
        r._schattenAlleNeu();
        return (await window.__ausgabeAufnahme(WB, HB, 1, { satz: "messung" })).u8;
    };
    const lin = Array.from({ length: 256 }, (_, i) => (i <= 10 ? i / 3294.6 : ((i / 255 + 0.055) / 1.055) ** 2.4));
    const luma = (u8, px = WB >> 1, py = HB >> 1, rad = WB) => {
        const l = [];
        for (let y = Math.max(0, py - rad); y < Math.min(HB, py + rad + 1); y++)
            for (let x = Math.max(0, px - rad), k; x < Math.min(WB, px + rad + 1); x++)
                l.push(0.2126 * lin[u8[(k = 4 * (y * WB + x))]] + 0.7152 * lin[u8[k + 1]] + 0.0722 * lin[u8[k + 2]]);
        return l.sort((a, b) => a - b)[l.length >> 1];
    };
    for (const [n, e] of SD.entries()) {
        const h = aus.haeuser[n];
        if (performance.now() > ende) {
            h.bildFehlt = "Frist der Probe";
            continue;
        }
        try {
            const Hg = gesetz(e);
            if (!Hg) continue;
            const gd = FC.grundVon({ H: Hg });
            const sc = (e.scale > 0 ? e.scale : 1) * (e._hausHuelleSkala > 0 ? e._hausHuelleSkala : 1);
            const base = e.position.y - 0.5;
            const boxen = gd.boxen.map(([x0, x1, z0, z1, traegt], j) => ({ art: gd.arten[j], x0, x1, z0, z1, traegt }));
            const solids = Hg.solids || [];
            const diele = (lx, lz) => {
                let d = -Infinity;
                for (const so of solids)
                    if (so.min[0] <= lx && lx <= so.max[0] && so.min[2] <= lz && lz <= so.max[2] && so.max[1] < 1.2) d = Math.max(d, so.max[1]);
                return d;
            };
            const frei = (lx, ly, lz, m) => !solids.some((so) => [lx, ly, lz].every((q, k) => so.min[k] - m < q && q < so.max[k] + m));
            const ecken = boxen.flatMap((m) => [welt(e, m.x0 * sc, m.z0 * sc), welt(e, m.x1 * sc, m.z1 * sc), welt(e, m.x0 * sc, m.z1 * sc), welt(e, m.x1 * sc, m.z0 * sc)]);
            const [mx0, mx1] = [Math.min(...ecken.map((p) => p.x)), Math.max(...ecken.map((p) => p.x))];
            const [mz0, mz1] = [Math.min(...ecken.map((p) => p.z)), Math.max(...ecken.map((p) => p.z))];
            const steht = () =>
                e._hausHuelle && e._servedLod === 0 && r._bodenSichtChunks(mx0 - 1, mz0 - 1, mx1 + 1, mz1 + 1) && s.nahWiese && s.nahWiese.offen === 0 && s.nahWiese.kacheln.size > 0;
            stell(e.position.x, e.position.y + 1, e.position.z);
            let ruhig = 0;
            // drei ruhige Takte in Folge (bis w4-ssa-C je Gang 5 Takte: 15 Bilder je Haus, auch wenn es schon stand)
            await warteBis(() => (ruhig = steht() ? ruhig + 1 : 0) >= 3, 1, 600);
            h.steht = !!steht();
            for (const m of boxen) {
                let blicke = 0;
                const i = 0.45;
                const E4 = [[m.x0 + i, m.z0 + i], [m.x1 - i, m.z1 - i], [m.x1 - i, m.z0 + i], [m.x0 + i, m.z1 - i]];
                const M0 = [(m.x0 + m.x1) / 2, (m.z0 + m.z1) / 2];
                const paare = [[E4[0], E4[1]], [E4[1], E4[0]], [E4[2], E4[3]], [E4[3], E4[2]], ...E4.map((q) => [M0, q])];
                const dm = Number.isFinite(diele(...M0)) ? diele(...M0) : 0.5;
                for (const [[ax, az], [zx, zz]] of paare) {
                    if (blicke >= 2) break;
                    const da = Number.isFinite(diele(ax, az)) ? diele(ax, az) : dm;
                    const dz = Number.isFinite(diele(zx, zz)) ? diele(zx, zz) : dm;
                    const ay = da + 1.3;
                    if (!frei(ax, ay, az, 0.25)) continue;
                    const strahl = Array.from({ length: 19 }, (_, j) => (j + 1) * 0.05).map((q) => [ax + (zx - ax) * q, ay + (dz - ay) * q, az + (zz - az) * q]);
                    if (!strahl.every((q) => Math.hypot(q[0] - zx, q[1] - dz, q[2] - zz) < 0.3 || frei(...q, 0.02))) continue;
                    blicke++;
                    const [p, q] = [welt(e, ax * sc, az * sc), welt(e, zx * sc, zz * sc)];
                    // DER EINGESCHWUNGENE TAKT (w28-station-mass): der Leib steht am Auge des Blicks, ≥ 0,5 s Takt der Werkbank (Licht des
                    // Auges, Himmel am Auge, Belichtung folgen dem Raum), dann die Kamera auf die Pose — bis dahin schoss die Probe bei
                    // stehender Schleife mit dem Licht vor der Tür (Radeon ec281422: Innen-Luma 0,005–0,012)
                    stell(p.x, base + da * sc + 0.1 + FUSS, p.z);
                    for (const t1 = performance.now() + 500; performance.now() < t1; ) await window.__werkTakt();
                    cam.position.set(p.x, base + ay * sc, p.z);
                    cam.lookAt(q.x, base + dz * sc, q.z);
                    cam.updateMatrixWorld(true);
                    h.innen = Math.min(h.innen ?? 1, luma(await schuss()));
                }
            }
            // der Boden im Schatten zur selben Stunde
            const S = s.directionalLight.position.clone().sub(s.directionalLight.target.position).normalize();
            const d = new THREE.Vector3(-S.x, 0, -S.z).normalize();
            const rc = new THREE.Raycaster();
            rc.layers.set(A.SHADOW_TWIN_LAYER);
            let f = null;
            for (let tt = 1; tt < 40 && !f; tt += 0.25) {
                const q = new THREE.Vector3(e.position.x + d.x * tt, 0, e.position.z + d.z * tt);
                if (/haus|bau/.test(r._imGrundriss(q.x, q.z, 1))) continue;
                q.y = r._bodenSichtAt(q.x, q.z) ?? hh(q.x, q.z);
                rc.set(q.clone().setY(q.y + 0.05), S);
                if (rc.intersectObject(s.scene, true).length) f = q;
            }
            if (f) {
                const p = f.clone().addScaledVector(d, 3);
                cam.position.set(p.x, hh(p.x, p.z) + 1.6, p.z);
                cam.lookAt(f);
                cam.updateMatrixWorld(true);
                const G = await schuss();
                const v = f.clone().project(cam);
                h.aussen = luma(G, Math.round(((v.x + 1) / 2) * WB), Math.round(((1 - v.y) / 2) * HB), 6);
            }
            h.quote = rund(h.innen / h.aussen, 1000);
        } catch (err) {
            h.bildFehlt = "Bild warf: " + String((err && err.message) || err);
        }
        window.__startDorfStand = { teil: "bild", n: n + 1, von: SD.length, typ: e.type };
    }
    r._tickNahWiese = tick;
    return aus;
}
async function probeStartDorf(H) {
    // DER ORT (w4-ssa-C): das Start-Dorf liegt am Genesis-Ort — die Sitzung stellt vor dem Deckel um (probeOrt liest das `umstellen`
    // hier), die Probe findet den Ring dort warm; bis dahin baute sie ihn im eigenen Deckel (die Sitzung stand an der Mess-Wiese, 1,1 km davon).
    // DAS FENSTER: 800 × 600, das der Linse, an dem jedes Urteil dieser Staffel fiel (ihr Browser ohne Viewport; bis 29.10.) — in der
    // Sitzung erbte die Probe 1920 × 1080 der Grundstellung, 4,3-mal die Pixel je Bild und Takt, und fiel nie bis zu ihrem Urteil
    await H.wb("/fenster", { w: 800, h: 600 }, 30000);
    const u = await H.wb("/umstellen", { ort: "genesis", sicht: "ego" }, Math.max(5, H.rest() - 1) * 1000);
    if (!u || u.fehler) throw new Error("umstellen genesis: " + JSON.stringify(u).slice(0, 300));
    if (!(await H.evalWelt("return typeof window.__ausgabeAufnahme === 'function';", 30000))) {
        const { AUSGABE_INSTALL } = require(H.path.resolve("scripts/lib/ausgabe-aufnahme.cjs"));
        await H.evalWelt(AUSGABE_INSTALL + "\nreturn true;", 30000);
    }
    const o = { WB: 480, HB: 270, fristMs: Math.max(5, H.rest() - 6) * 1000 };
    // DAS LEBENSZEICHEN (OMEN 12.11.: siedlung.K1#2 schwieg in EINEM eval bis zum Bild des letzten Hauses, die Stille-Wache der Sitzung
    // tötete die arbeitende Probe nach 170 s): daneben fragt der Treiber je 10 s den Stand der Probe (`__startDorfStand`) und schreibt
    // je Haus und Teil eine Zeile — Arbeit ist kein Schweigen
    let stand = "";
    const lauscher = setInterval(() => {
        H.wb("/eval", { code: "return window.__startDorfStand || null" }, 8000).then(
            (a) => {
                const x = a && a.ergebnis;
                const z = x ? x.teil + " " + x.n + "/" + x.von + (x.typ ? " " + x.typ : "") : "";
                if (z && z !== stand) console.log("  … " + (stand = z));
            },
            () => {}
        );
    }, 10000);
    let j;
    try {
        await H.evalWelt("window.__startDorfStand = null; return true;", 30000);
        j = H.teil = await H.evalWelt("return await (" + H.seite.INNEN + ")(" + JSON.stringify(o) + ");", Math.max(5, H.rest() - 1) * 1000);
    } finally {
        clearInterval(lauscher);
    }
    // ein Haus an der Frist (Gang oder Bild ausgelassen): kein ganzes Urteil — die EINE Marke (punkte.cjs FRIST_MARKE)
    const aus = ((j && j.haeuser) || []).filter((h) => h.fehler === "Frist der Probe" || h.bildFehlt === "Frist der Probe");
    if (aus.length) H.fristRiss(aus.length + " von " + j.haeuser.length + " Häusern an der Frist ausgelassen");
    for (const h of (j && j.haeuser) || [])
        console.log(
            `  ${h.typ} · Gang Hub ${h.gang ? h.gang.hub.toFixed(2) + " m" + (h.gang.fehlt.length ? " · fehlt " + h.gang.fehlt.join(" · ") : "") : "—"} · ` +
                `innen ${h.innen} ÷ außen ${h.aussen} = ${h.quote}${h.fehler ? " · " + h.fehler : ""}${h.bildFehlt ? " · " + h.bildFehlt : ""}`
        );
    return j;
}
const START_DORF_PROBE = probeBefehl(probeStartDorf, 60, { INNEN: startDorfInnen });

// leib.K3 #1 (w4-stationen-b-koord): UFER → SCHWIMMEN → TAUCHEN im echten Takt (`_gameLoopTick`, Null-Renderer — Lage und Kamera sind
// Mechanik, das Unterwasser-Bild ist Staffel 2). Der See nächst der Mess-Wiese aus der Welt (wasser-linse `__wasserOrte`, heute
// 1816/−6168), die Welt ans Ostufer gestreamt wie gate:wasser-leben; je Sicht (Ego, Third) der Gang vom Ufer nach Westen: 30 Bilder
// Stand, W bis der Leib schwimmt (`playerUnderwater`), W bis 2,5 m Wasser unter dem Leib stehen, Shift + W 240 Bilder (unter Wasser
// ist Sprint die Tauch-Geste, `_verbTafelSammeln`), 120 Bilder Auftrieb; die Bilder im Muster der Leib-Linse (8,3–33,3 ms). Je Bild
// Leib und Kamera; der RUCK (wie diag-kamera-laub: die Lage gegen die Linie ihrer Nachbarn in der Zeit) ist das Maß des Sprungs —
// ein Schnappen um d zeigt sich als Ruck d/2. Im selben Lauf die MUTANTE: Ego mit 0,3 m Schnappen im 30. Bild des Tauchens; sieht die
// Probe sie nicht, ist sie blind (ROT). Spike am main 94c079cb (Cloud, Null-Renderer): Ego schwimmt ab Bild 442, taucht bis 1,95 m
// unter den Spiegel, Leib-Ruck max 0,016 m, Kamera-Ruck max 0,020 m.
async function leibK3Lauf() {
    const fs = require("fs");
    const path = require("path");
    const [aus, port] = process.argv.slice(1);
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const { WASSER_INSTALL } = require(path.resolve("scripts/lib/wasser-linse.cjs"));
    const server = WB.statikServer();
    await server.lausche(Number(port));
    const browser = await WB.starteBrowser({ art: "null", headless: true, frist: 600000 });
    const page = await browser.newPage();
    await WB.nullRenderer(page);
    const out = { laeufe: {} };
    let code = 2;
    const gang = async (see, sicht, mut) => {
        const A = r.constructor;
        const pm = st.playerMesh;
        const setze = (x, y, z) => {
            pm.position.set(x, y, z);
            if (st._fixedSimPos) st._fixedSimPos.copy(pm.position);
            [st._fixedPrevPos, st._fieldVy, st.isInAir, st._fieldWasGrounded, st.playerUnderwater, st.playerEyesUnderwater] = [null, 0, false, false, false, false];
            st.playerVel.setValue(0, 0, 0);
        };
        const [x0, mz] = see.ufer;
        r.setCameraMode(sicht);
        setze(x0, r._voxelSurfaceY(x0, mz) + A.PLAYER_FOOT_OFFSET + 0.05, mz);
        st.yaw = -Math.PI / 2;
        const MUSTER = [16.7, 8.3, 25, 16.7, 33.3, 11.1, 20, 16.7];
        const B = [];
        let tMs = performance.now();
        let nr = 0;
        const bild = (keys, phase) => {
            // die Eingabe über die EINE Verb-Tafel (seit w12-menue liest kein Verb state.keys): W = vor, Shift = sprint (taucht ab)
            Object.assign(st.verbTafel.gehalten, { vor: !!keys.w, sprint: !!keys.shift });
            tMs += MUSTER[nr++ % MUSTER.length];
            r._gameLoopTick(tMs);
            if (mut && phase === "tauchen" && B.filter((b) => b[1] === "tauchen").length === 30) {
                pm.position.y -= mut;
                if (st._fixedSimPos) st._fixedSimPos.y -= mut;
            }
            const c = st.camera.position;
            B.push([tMs, phase, pm.position.x, pm.position.y, pm.position.z, c.x, c.y, c.z, st.playerUnderwater ? 1 : 0, st.playerEyesUnderwater ? 1 : 0, st._fieldWasGrounded ? 1 : 0]);
        };
        for (let i = 0; i < 30; i++) bild({}, "stand");
        for (let i = 0; i < 2400 && !(st.playerUnderwater && !st._fieldWasGrounded); i++) bild({ w: true }, "ufer");
        const tief = () => see.level - r._voxelSurfaceY(pm.position.x, pm.position.z) >= 2.5;
        for (let i = 0; i < 900 && (i < 60 || !tief()); i++) bild({ w: true }, "schwimmen");
        for (let i = 0; i < 240; i++) bild({ w: true, shift: true }, "tauchen");
        for (let i = 0; i < 120; i++) bild({}, "auftrieb");
        Object.assign(st.verbTafel.gehalten, { vor: false, sprint: false });
        return B;
    };
    // je Phase die Lage, über alle Bilder nach dem Stand der Ruck von Leib und Kamera (max, wo, p95)
    const auswerten = (B) => {
        const R = (x, n = 3) => +x.toFixed(n);
        const m = { bilder: B.length, phasen: {} };
        for (const ph of ["ufer", "schwimmen", "tauchen", "auftrieb"]) {
            const b = B.filter((x) => x[1] === ph);
            m.phasen[ph] = { n: b.length, unter: b.filter((x) => x[8]).length, augen: b.filter((x) => x[9]).length, geerdet: b.filter((x) => x[10]).length };
        }
        const sw = B.filter((x) => x[1] === "schwimmen").map((x) => x[3]).sort((a, b) => a - b);
        const linie = sw.length ? sw[sw.length >> 1] : null;
        const ta = B.filter((x) => x[1] === "tauchen").map((x) => x[3]);
        m.tiefe = linie === null || !ta.length ? null : R(linie - Math.min(...ta), 2);
        const ruck = (i0) => {
            const r = [];
            for (let k = 1; k < B.length - 1; k++) {
                const [u, w, z] = [B[k - 1], B[k], B[k + 1]];
                if (u[1] === "stand") continue;
                const f = (w[0] - u[0]) / (z[0] - u[0]);
                r.push([Math.hypot(...[0, 1, 2].map((i) => w[i0 + i] - u[i0 + i] - (z[i0 + i] - u[i0 + i]) * f)), w[1] + " " + k]);
            }
            const s = r.map((x) => x[0]).sort((a, b) => a - b);
            const top = r.reduce((a, x) => (x[0] > a[0] ? x : a), [0, "—"]);
            return { max: R(top[0]), wo: top[1], p95: R(s[Math.floor(0.95 * (s.length - 1))] || 0, 4) };
        };
        m.ruckLeib = ruck(2);
        m.ruckKamera = ruck(5);
        return m;
    };
    try {
        await server.zeige(page, 120000, "index.html");
        await page.waitForFunction(() => window.r && typeof r._gameLoopTick === "function" && r.state.hydrosphere && r.state.hydrosphere.ready, { timeout: 300000, polling: 250 });
        await page.evaluate(WASSER_INSTALL);
        await page.evaluate(() => (r._setWeather("sunny", "human"), r._naesseTakt(1e6)));
        const orte = await page.evaluate(() => window.__wasserOrte({}));
        if (!orte.see) throw new Error("kein See nächst der Mess-Wiese (__wasserOrte)");
        await page.evaluate((u) => window.__wasserStrom(u, 0.6), orte.see.ufer);
        out.see = [orte.see.x, orte.see.z, +orte.see.level.toFixed(2)];
        console.log("LEIB_K3 see " + JSON.stringify(out.see));
        for (const [name, sicht, mut] of [["ego", "first", 0], ["third", "third", 0], ["mutante", "first", 0.3]]) {
            out.laeufe[name] = auswerten(await page.evaluate(gang, orte.see, sicht, mut));
            console.log("LEIB_K3 " + name + " " + JSON.stringify(out.laeufe[name]));
        }
        code = 0;
    } catch (e) {
        out.fehler = String((e && e.message) || e).split("\n")[0];
        console.log("LEIB_K3 FEHLER " + out.fehler);
    } finally {
        fs.writeFileSync(aus, JSON.stringify(out, null, 1));
        await browser.close().catch(() => {});
        process.exit(code);
    }
}
// die Wand des Sprungs: ein Ruck über 3 cm (ein Schnappen ab 6 cm) — der Spike trug 1,6–2,0 cm am Ufer, ≤ 0,5 cm in Wasser
const LEIB_K3_RUCK_M = 0.03;
// das Urteil über die Zeilen `LEIB_K3 ego|third|mutante {…}` (das Lage-Gesetz der Staffel und die Wand), nie über ein ok-Flag
function leibK3Urteil(lauf) {
    const t = String(lauf.stdout || "");
    const fehler = (/^LEIB_K3 FEHLER (.*)$/m.exec(t) || [])[1];
    const L = Object.fromEntries(["ego", "third", "mutante"].map((n) => [n, jsonZeile(t, new RegExp("^LEIB_K3 " + n + " \\{"))]));
    const fehlt = Object.keys(L).filter((n) => !L[n] || !L[n].phasen || !L[n].ruckLeib || !L[n].ruckKamera);
    if (fehlt.length) return { gruen: false, zahl: "keine LEIB_K3-Zeile für " + fehlt.join(", ") + (fehler ? " — " + fehler : "") + " (Exit " + lauf.exit + ")" };
    const rot = [];
    const zeile = (n) => {
        const m = L[n];
        const p = m.phasen;
        const lage = [
            [p.ufer.geerdet >= 30, "Ufer geerdet " + p.ufer.geerdet],
            [p.schwimmen.n >= 60 && p.schwimmen.unter === p.schwimmen.n && p.schwimmen.geerdet === 0, "Schwimmen " + p.schwimmen.unter + "/" + p.schwimmen.n + " (geerdet " + p.schwimmen.geerdet + ")"],
            [p.tauchen.augen >= 60 && m.tiefe >= 1, "Tauchen Augen unter " + p.tauchen.augen + ", " + m.tiefe + " m unter der Schwimm-Linie"],
        ];
        for (const [ok, was] of lage) if (!ok) rot.push(n + " " + was);
        if (!(m.ruckLeib.max <= LEIB_K3_RUCK_M)) rot.push(n + " Leib springt " + m.ruckLeib.max + " m (" + m.ruckLeib.wo + ")");
        if (!(m.ruckKamera.max <= LEIB_K3_RUCK_M)) rot.push(n + " Kamera springt " + m.ruckKamera.max + " m (" + m.ruckKamera.wo + ")");
        return n + ": schwimmt " + p.schwimmen.unter + "/" + p.schwimmen.n + ", taucht " + m.tiefe + " m (Augen unter " + p.tauchen.augen + ") · Ruck Leib " + m.ruckLeib.max + " / Kamera " + m.ruckKamera.max + " m (p95 " + m.ruckLeib.p95 + " / " + m.ruckKamera.p95 + ")";
    };
    const z = ["ego", "third"].map(zeile);
    const sieht = L.mutante.ruckLeib.max > LEIB_K3_RUCK_M;
    if (!sieht) rot.push("die Mutante (0,3 m Schnappen) bleibt unter der Wand — die Probe ist blind");
    return {
        gruen: !rot.length && lauf.exit === 0,
        zahl: z.join(" · ") + " · Mutante Ruck " + L.mutante.ruckLeib.max + " m " + (sieht ? "erkannt" : "UNERKANNT") + (rot.length ? " · ROT: " + rot.join(", ") : "") + " · Exit " + lauf.exit,
    };
}
// fahrzeug.K2#1 — die Zeilen der Fahrt auf dem Wegenetz: der Lauf am Kopf von w16-fahrt-weg (Bezug aus der Tafel) GRÜN; die Mutante
// des FUNDs (der Bezug = vmax des GT: der mittlere Bezug ist vmax, der Anteil fällt auf 0) ROT; eine Zeile ohne Bezug (ein Stand vor
// der Tafel) ROT; der Anteil unter 80 % ROT.
const WEGENETZ_PROBEN = (() => {
    const tafel = { ortsdurchfahrt: 50, wohnstrasse: 30, gasse: 25, feldweg: 40 };
    const lauf = (o = {}) => ({ lang: 2440, weg: 2438, ende: true, schritte: 12946, steck: [], anteil: 0.894, wegAnteil: 0.987,
        bezug: { kmh: tafel, vmax: 63.82, mittel: 12.17 }, boden: { wiese: 0.29, wald: 0.41, dorf: 0.3 }, ...o });
    const z = (m) => "[linse-gpu] google/swiftshader\n  ✅ WN (fahrzeug.K2) die Fahrt auf dem Wegenetz — auf dem Netz\nWEGENETZ " + JSON.stringify(m) + "\nEXIT 0";
    // DIE TEILE: je Halt an der Naht die Zeile des Teils und WEITER (proben-welt.cjs `fahrWegenetz`)
    const halt = (i) => "  WN Teil " + i + "/6: der Lauf hält nach 36.8 s an der Naht (Spieler bei -312, -1060, " + Math.min(6, 2 * i) + " Orte wach) — weiter\n@@PUNKTE@@ TEIL WEITER\n";
    return [
        { name: "der Bezug aus der Tafel, 89 % der Takte über 0,8 · Bezug", stdout: z(lauf()), gruen: true },
        { name: "derselbe Lauf in vier Teil-Proben (drei Halte an der Naht)", stdout: halt(1) + halt(2) + halt(3) + z(lauf()), gruen: true },
        { name: "MUTANTE: die Teile reichten nicht — der letzte riss seine Frist, keine Zeile", stdout: halt(1) + halt(2) + halt(3) + halt(4) + halt(5) +
            "@@PUNKTE@@ FRIST 39 s der Probe gerissen: Error: DIE TEILE DER FAHRT reichten nicht: die Frist des letzten Teils riss an der Naht (Teil 6/6)\n" +
            "  ❌ WN (fahrzeug.K2) die Fahrt auf dem Wegenetz — Error: DIE TEILE DER FAHRT reichten nicht · 36.9 s in der Welt der Sitzung (Teil 6/6)\nWEGENETZ undefined", gruen: false },
        { name: "MUTANTE: ein späterer Teil fand keinen gehaltenen Lauf", stdout: halt(1) + "  ❌ WN (fahrzeug.K2) die Fahrt auf dem Wegenetz — DIE TEILE DER FAHRT: kein gehaltener Lauf vor diesem Teil · 0.1 s in der Welt der Sitzung (Teil 2/6)\nWEGENETZ undefined", gruen: false },
        { name: "MUTANTE: der Bezug = vmax des GT (die Fahrt zählt gegen die Höchstgeschwindigkeit)", stdout: z(lauf({ anteil: 0, bezug: { kmh: tafel, vmax: 63.82, mittel: 63.82 } })), gruen: false },
        { name: "MUTANTE: der Bezug = vmax, der Anteil geschönt", stdout: z(lauf({ bezug: { kmh: tafel, vmax: 63.82, mittel: 63.82 } })), gruen: false },
        { name: "ein Stand ohne Bezug in der Zeile", stdout: z(lauf({ bezug: undefined })), gruen: false },
        { name: "eine leere Tafel", stdout: z(lauf({ bezug: { kmh: {}, vmax: 63.82, mittel: 12.17 } })), gruen: false },
        { name: "der Anteil unter 80 %", stdout: z(lauf({ anteil: 0.78 })), gruen: false },
        { name: "ein Steckenbleiber", stdout: z(lauf({ steck: [424] })), gruen: false },
    ];
})();

const LEIB_K3_PROBEN = (() => {
    const lauf = (o = {}) => Object.assign({ bilder: 1100, phasen: { ufer: { n: 470, unter: 60, augen: 0, geerdet: 400 }, schwimmen: { n: 200, unter: 200, augen: 0, geerdet: 0 }, tauchen: { n: 240, unter: 240, augen: 190, geerdet: 0 },
        auftrieb: { n: 120, unter: 120, augen: 100, geerdet: 0 } }, tiefe: 2.1, ruckLeib: { max: 0.016, wo: "ufer 40", p95: 0.003 }, ruckKamera: { max: 0.02, wo: "ufer 40", p95: 0.0011 } }, o);
    const z = (ego, third, mutante) => ['LEIB_K3 see [1816,-6168,0.93]', "LEIB_K3 ego " + JSON.stringify(ego), "LEIB_K3 third " + JSON.stringify(third), "LEIB_K3 mutante " + JSON.stringify(mutante)].join("\n");
    const mut = lauf({ ruckLeib: { max: 0.15, wo: "tauchen 700", p95: 0.003 }, ruckKamera: { max: 0.15, wo: "tauchen 701", p95: 0.0012 } });
    return [
        { name: "Ufer → Schwimmen → Tauchen ohne Sprung, Ego und Third, die Mutante erkannt", stdout: z(lauf(), lauf(), mut), gruen: true },
        { name: "die Mutante bleibt unter der Wand (die Probe ist blind)", stdout: z(lauf(), lauf(), lauf()), gruen: false },
        { name: "die Kamera in Third schnappt beim Eintauchen um 24 cm", stdout: z(lauf(), lauf({ ruckKamera: { max: 0.12, wo: "schwimmen 480", p95: 0.002 } }), mut), gruen: false },
        { name: "kein Tauchgang (Shift hebt nicht unter den Spiegel)", stdout: z(lauf({ phasen: { ...lauf().phasen, tauchen: { n: 240, unter: 240, augen: 0, geerdet: 0 } }, tiefe: 0.1 }), lauf(), mut), gruen: false },
        { name: "der Leib geht am Grund statt zu schwimmen", stdout: z(lauf({ phasen: { ...lauf().phasen, schwimmen: { n: 200, unter: 40, augen: 0, geerdet: 160 } } }), lauf(), mut), gruen: false },
        { name: "Third fehlt in der Ausgabe", stdout: ['LEIB_K3 ego ' + JSON.stringify(lauf()), "LEIB_K3 mutante " + JSON.stringify(mut)].join("\n"), gruen: false },
        { name: "die Welt trägt keinen See", stdout: "LEIB_K3 FEHLER kein See nächst der Mess-Wiese (__wasserOrte)", gruen: false },
    ];
})();

// leib.K3 #2 (w12-unterwasser): DAS UNTERWASSER-BILD AUS DER EINEN WASSER-WAHRHEIT UND DIE HÖHLE MIT LICHT-ABFALL — EINE Probe der
// Sitzung an zwei Orten, Radeon und GTX. (1) DER SEE nächst der Mess-Wiese aus der Welt (`__wasserOrte` wie `leibK3Lauf`, heute
// 1816/−6168, 3,4 m tief), die Welt dort eingeschwungen (`/umstellen`); je Sicht (Ego, Third) stellt der echte Takt (`_gameLoopTick`,
// der Leib gehalten) die Kamera der Sicht zum Leib, dann stehen Leib und Kamera gemeinsam 0,5 · 1,5 · 2,5 m unter dem örtlichen Spiegel
// (`_koerperWasser` an der Kamera; ein Leib am Grund des Sees reicht mit dem Auge nur bis ~2 m), das Medium rechnet der Chokepoint der
// Kamera (`_applyDayNightToScene`), das Bild der Ausgabe-Pfad (Mittag der Bühne). Gemessen wird die SZENE: der Median der Luma des
// Ausgabe-Bilds zurück durch sRGB, die Tonkurve (Khronos PBR Neutral, unter ihrer Schulter umkehrbar) und die Belichtung. Der ABFALL
// K(z) = −ln(L(z) ÷ L(0,5 m)) ÷ (z − 0,5 m) in 1,5 und 2,5 m liegt im Band der Soll-Tafel (Klasse wasser, `sichtAbfall`, gelesen im
// Spiel-Baum am SHA) — die REF der Literatur, unabhängig vom Gesetz der Welt: kd klarer Binnenseen (Secchi 3–10 m, kd ≈ 1,7 ÷ Secchi,
// Poole & Atkins 1929). Der eigene LEIB in Third 0,5 m: der Weber-Kontrast seines Bildpunkts (das Fenster am projizierten Leib) gegen
// das Wasser 40 px daneben, Soll ≥ 0,05 (Duntley: Sichtweite unter Wasser endet bei Kontrast 0,02; erkennbar statt nur entdeckt × 2,5). Im selben Lauf die MUTANTE „kd halbiert“ (das Gesetz des Wassers in der Seite, Ego 0,5 und
// 2,5 m): ihr Abfall muss unter ¾ des gemessenen fallen, sonst liest das Bild das Gesetz
// nicht (ROT). (2) DIE HÖHLE am Ort von gate:hoehlen-sicht (−1041/−738, die Welt dort eingeschwungen): im Umkreis ±40 m die höchste
// Luft unter Fels (das Feld `_fieldDensityAt` auf dem Gitter der Stufe 0), das Auge in ihrer Mitte, der Blick in ihren längsten freien
// Weg; HINAUS das Auge 1,7 m über der Oberfläche derselben Spalte unter freiem Himmel, derselbe Blick. Der Licht-Abfall L(Höhle) ÷
// L(hinaus) bei derselben Belichtung liegt mindestens zwei Blenden unter dem Himmel — das Auge gleicht wie die Kamera nur 1 − s des
// fehlenden Lichts aus, eine Höhle ohne Himmel fällt auf ihre Nacht (BELICHTUNG.stufen[−1], 2,17 Stufen), Fels und Weite tragen dazu —
// und höchstens zwei Blenden unter der Nacht der Kamera (das Licht des Auges hält sie lesbar, K02a). Vorher (main bf55b24a, Radeon 05.11.,
// diese Probe): die Farbe des Mediums trug die festen ersten 0,3 m, β eine Sichtweite von 30 m — Ego L 0,172/0,184/0,214 in 0,5/1,5/
// 2,5 m (2,5 ÷ 0,5 m = 1,24, Third 1,26: ein blauer Filter vor klarer Sicht auf Berge, Himmel und den sonnigen Grund), die Mutante
// unerkannt; die Höhle 0,075 gegen hinaus 0,157 (0,48: das Auge glich das Fehlende ganz aus, die 18-%-Karte im Mittags-Grau).
// Mit der Look-Zahl wK als Absorption je Meter (w12-unterwasser 7e9c22fa): K 1,89/1,78 /m, Sicht 1,9 m, der Leib in Third verschwand.
// Mit dem Wasser-Körper je Art (WASSER_GESETZ.koerper, b5aa8779, Radeon 26,4 s): Ego L 0,276/0,218/0,179, K 0,24 und 0,22 /m, Third
// 0,23 und 0,20 /m, die Mutante K 0,12 (erkannt), die Höhle 0,020 ÷ 0,157 = 0,13; der Leib in Third 0,5 m sichtbar, Kontrast 0,10.
async function unterwasserSeite(o) {
    const s = r.state, cam = s.camera, pm = s.playerMesh, A = r.constructor, ende = performance.now() + o.fristMs;
    if (A.BELICHTUNG.kurve !== "NeutralToneMapping") return { fehler: "die Tonkurve ist " + A.BELICHTUNG.kurve + ", die Umkehr kennt nur Khronos PBR Neutral" };
    if (typeof window.__ausgabeAufnahme !== "function") return { fehler: "der Ausgabe-Pfad fehlt in der Seite" };
    window.__buehne();
    s.renderer.setAnimationLoop(null);
    const [W, H] = [o.W, o.H], aus = { bilder: {} }, R = (v, n = 5) => +(+v).toFixed(n);
    const lin = Array.from({ length: 256 }, (_, i) => (i <= 10 ? i / 3294.6 : ((i / 255 + 0.055) / 1.055) ** 2.4));
    const median = (u8, k, x0, x1, y0, y1) => {
        const l = [];
        for (let py = Math.max(0, Math.round(y0)); py < Math.min(H, Math.round(y1)); py++)
            for (let px = Math.max(0, Math.round(x0)), i; px < Math.min(W, Math.round(x1)); px++) {
                const c = [lin[u8[(i = 4 * (py * W + px))]], lin[u8[i + 1]], lin[u8[i + 2]]];
                if (Math.max(c[0], c[1], c[2]) >= 0.76) continue;
                const y = Math.min(c[0], c[1], c[2]), x = y < 0.04 ? Math.sqrt(y / 6.25) : y + 0.04;
                l.push((0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] + x - y) / k);
            }
        l.sort((a, b) => a - b);
        return l.length > (x1 - x0) * (y1 - y0) * 0.5 ? R(l[l.length >> 1], 7) : null;
    };
    const schirm = (v) => ((v = v.clone().project(cam)), [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H]);
    // DER BLICK JE SCHUSS (w14-unterwasser): das Mittel der Szenen-Luma auf 8 × 5 Feldern — woran das Urteil erkennt, ob die Aufnahme
    // der Kamera folgt (`UNTERWASSER_STEHT`); dazu passiv gelesen der Knoten-Frame und die Render-Rufe vor und nach der Aufnahme und
    // die Befehle und Dreiecke ihres gezählten Bilds (`zug`), nie ein Haken an Pass oder Renderer
    const blickGitter = (u8, k) => {
        const g = new Array(40).fill(0), n = new Array(40).fill(0);
        for (let py = 0; py < H; py++)
            for (let px = 0, i, f; px < W; px++) {
                (i = 4 * (py * W + px)), (f = Math.floor((py * 5) / H) * 8 + Math.floor((px * 8) / W));
                g[f] += 0.2126 * lin[u8[i]] + 0.7152 * lin[u8[i + 1]] + 0.0722 * lin[u8[i + 2]];
                n[f]++;
            }
        return g.map((v, f) => R(v / n[f] / k, 5));
    };
    const schuss = async (name, leib) => {
        r._applyDayNightToScene();
        const nf = s.renderer._nodes && s.renderer._nodes.nodeFrame, ri = s.renderer.info, vor = [nf ? nf.frameId : NaN, ri ? ri.calls : NaN];
        const a = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" }), u8 = a.u8, k = s.renderer.toneMappingExposure;
        if (o.bilder) aus.bilder[name] = window.__png(u8, W, H);
        const b = { L: median(u8, k, 0, W, 0, H), k: R(k, 4), gitter: blickGitter(u8, k), kamera: [cam.position.x, cam.position.y, cam.position.z].map((v) => R(v, 2)) };
        b.zug = [nf ? nf.frameId - vor[0] : null, ri ? ri.calls - vor[1] : null, a.info && a.info.drawCalls, a.info && a.info.triangles];
        if (leib) {
            const [lx, ly] = schirm(pm.position);
            const [lb, lr, ll] = [median(u8, k, lx - 3, lx + 4, ly - 7, ly + 8), median(u8, k, lx + 37, lx + 44, ly - 7, ly + 8), median(u8, k, lx - 44, lx - 37, ly - 7, ly + 8)];
            b.leib = [lb, lr, ll, lx > 50 && lx < W - 50 && ly > 10 && ly < H - 10 && lb !== null && lr > 0 && ll > 0 ? R(Math.abs(lb - (lr + ll) / 2) / ((lr + ll) / 2), 3) : null];
        }
        return b;
    };
    if (o.teil === "wasser") {
        const WG = AnazhRealm.Gesetz("terrain:WASSER_GESETZ");
        // die Art des Wassers liest der EINE Leser der Welt (`_wasserArtAt`, w13-bach-klar: gelaende-core `gewaesserArt` über der
        // Breite des Laufs) — kein eigener Schluss „im Kanal → fluss“ neben ihm
        aus.art = r._wasserArtAt(o.see.x, o.see.z);
        const sp0 = r._koerperWasser(o.see.x, o.see.z, -Infinity);
        const reihe = async (sicht, tiefen, name) => {
            r.setCameraMode(sicht);
            // der Takt der Werkbank (`__werkTakt`: die Bühne, der Takt zur Uhr der Seite, das nächste Bild) — nie eine eigene Uhr
            for (let i = 0; i < 40; i++) {
                pm.position.set(o.see.x, sp0 - 2.2, o.see.z);
                if (s._fixedSimPos) s._fixedSimPos.copy(pm.position);
                // keine Taste gehalten: die EINE Verb-Tafel (state.keys fiel mit w12-menue d66731b4 — `s.keys = {}` ließ jede gehaltene Aktion stehen)
                [s.yaw, s.pitch] = [-Math.PI / 2, 0];
                for (const k of ["vor", "zurueck", "links", "rechts", "sprint", "jump"]) s.verbTafel.gehalten[k] = false;
                await window.__werkTakt();
            }
            const d = cam.position.clone().sub(pm.position), q = cam.quaternion.clone(), je = [];
            for (const z of tiefen) {
                if (performance.now() > ende) return ((aus.frist = name + " " + z + " m"), je);
                const sp = r._koerperWasser(o.see.x + d.x, o.see.z + d.z, -Infinity);
                pm.position.set(o.see.x, sp - z - d.y, o.see.z);
                pm.updateMatrixWorld(true);
                cam.position.copy(pm.position).add(d);
                cam.quaternion.copy(q);
                cam.updateMatrixWorld(true);
                const p = cam.position, b = await schuss(name + "-" + z, sicht === "third");
                je.push(Object.assign({ z, tiefe: R(r._koerperWasser(p.x, p.z, p.y) - p.y, 3), unter: !!s.kameraUnterWasser, fest: r._fieldDensityAt(p.x, p.y, p.z) > 0 }, b));
            }
            return je;
        };
        aus.ego = await reihe("first", o.tiefen, "ego");
        aus.third = await reihe("third", o.tiefen, "third");
        const memo = AnazhRealm._gesetzStromMemo, key = "terrain:WASSER_GESETZ";
        const halb = (K) => Object.assign({}, K, { kd: K.kd.map((v) => v / 2) });
        // die Mutante halbiert die Trübung JEDER Art (see · bach · fluss), nie nur die zwei, die die Probe einst kannte
        memo.set(key, Object.assign({}, WG, { koerper: Object.fromEntries(Object.entries(WG.koerper).map(([art, K]) => [art, halb(K)])) }));
        try {
            aus.mutante = await reihe("first", [o.tiefen[0], o.tiefen[o.tiefen.length - 1]], "mutante");
        } finally {
            memo.set(key, WG);
            r.setCameraMode("first");
            r._applyDayNightToScene();
        }
        return aus;
    }
    const [x0, z0] = o.ort, G0 = r._voxelChunkConfig(0), st = G0.step, gy0 = (s.terrainBaseHeight || 0) - G0.floorDrop;
    const gitter = (v) => Math.round(v / st) * st, fest = (x, y, z) => r._fieldDensityAt(x, y, z) > 0;
    let raum = null;
    for (let dz = -40; dz <= 40; dz += 2 * st)
        for (let dx = -40; dx <= 40; dx += 2 * st) {
            const x = gitter(x0 + dx), z = gitter(z0 + dz), S = r._voxelSurfaceY(x, z);
            if (S == null) continue;
            for (let j = Math.floor((S - 2 - gy0) / st), fels = false; gy0 + j * st > S - 50; j--) {
                const y = gy0 + j * st;
                if (fest(x, y, z)) fels = true;
                else if (fels) {
                    let luft = 0;
                    while (luft < 20 && !fest(x, y - luft - st, z)) luft += st;
                    if (!raum || luft > raum.luft) raum = { x, z, y, luft, S };
                    break;
                }
            }
        }
    if (!raum) return { fehler: "keine Höhlen-Luft unter Fels um " + x0 + "/" + z0 };
    const auge = [raum.x, raum.y - raum.luft / 2, raum.z];
    let weg = null;
    for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        let d = 0;
        while (d < 40 && !fest(auge[0] + Math.cos(a) * d, auge[1], auge[2] + Math.sin(a) * d)) d += 0.5;
        if (!weg || d > weg.d) weg = { a, d };
    }
    const blick = async (name, p) => {
        // DER EINGESCHWUNGENE TAKT (w28-station-mass): ≥ 0,5 s Takt der Werkbank mit dem Leib am Auge (das Licht des Auges, der Himmel am
        // Auge, die Belichtung folgen der Pose), dann die Kamera auf die Pose — bis dahin schoss die Probe bei stehender Schleife, die
        // Pose trug das Licht des vorigen Orts (Radeon ec281422: Abfall 0,00004)
        for (const t1 = performance.now() + 500; performance.now() < t1; ) {
            pm.position.set(p[0], p[1] - 1.6, p[2]);
            if (s._fixedSimPos) s._fixedSimPos.copy(pm.position);
            await window.__werkTakt();
        }
        cam.position.set(p[0], p[1], p[2]);
        cam.lookAt(p[0] + Math.cos(weg.a) * 10, p[1] - 1.5, p[2] + Math.sin(weg.a) * 10);
        cam.updateMatrixWorld(true);
        const b = await schuss(name);
        return { auge: p.map((v) => R(v, 1)), h: R(s.himmelAmAuge, 3), L: b.L, k: b.k, gitter: b.gitter, zug: b.zug };
    };
    aus.hoehle = await blick("hoehle", auge);
    aus.hinaus = await blick("hinaus", [raum.x, raum.S + 1.7, raum.z]);
    aus.weg = R(weg.d, 1);
    aus.nacht = A.BELICHTUNG.stufen[A.BELICHTUNG.stufen.length - 1][1];
    return aus;
}
async function probeUnterwasser(H) {
    const { fs, path } = H;
    const tafel = JSON.parse(fs.readFileSync("spec/abnahme/soll-tafel.json", "utf8"));
    const e = (((tafel.klassen.find((k) => k.id === "wasser") || {}).soll || {}).eigenschaften || []).find((x) => x.groesse === "sichtAbfall");
    const j = (H.teil = { band: e ? e.band : null });
    await H.wb("/fenster", { w: 640, h: 360 }, 30000);
    const da = await H.evalWelt("return [typeof window.__ausgabeAufnahme, typeof window.__wasserOrte];", 30000);
    if (da[0] !== "function") await H.evalWelt(require(path.resolve("scripts/lib/ausgabe-aufnahme.cjs")).AUSGABE_INSTALL + "\nreturn 1;", 30000);
    if (da[1] !== "function") await H.evalWelt(require(path.resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL + "\nreturn 1;", 30000);
    const frist = () => Math.max(5, H.rest() - 1) * 1000;
    const see = (j.see = await H.evalWelt("const o = await window.__wasserOrte({}); return o.see && { x: o.see.x, z: o.see.z, level: o.see.level, tiefe: o.see.tiefe };", frist()));
    if (!see) throw new Error("kein See nächst der Mess-Wiese (__wasserOrte)");
    const um = async (x, z) => {
        const u = await H.wb("/umstellen", { x, z }, frist());
        if (!u || u.fehler) throw new Error("umstellen " + x + "/" + z + ": " + JSON.stringify(u).slice(0, 200));
        H.zeile("umgestellt " + x + "/" + z + " in " + u.ms + " ms");
    };
    const seite = (o) => H.evalWelt("return await (" + H.seite.UNTER + ")(" + JSON.stringify(Object.assign({ W: 480, H: 270, bilder: true, fristMs: Math.max(1, H.rest() - 3) * 1000 }, o)) + ");", frist());
    await um(see.x, see.z);
    j.wasser = await seite({ teil: "wasser", see, tiefen: [0.5, 1.5, 2.5] });
    await um(-1041, -738);
    j.hoehle = await seite({ teil: "hoehle", ort: [-1041, -738] });
    for (const t of [j.wasser, j.hoehle])
        for (const [n, url] of Object.entries((t && t.bilder) || {})) fs.writeFileSync(H.AUS.replace(/\.json$/, "") + "-" + n + ".png", Buffer.from(url.split(",")[1], "base64"));
    for (const t of [j.wasser, j.hoehle]) if (t) delete t.bilder;
    if (j.wasser && j.wasser.frist) H.fristRiss("das Wasser bis " + j.wasser.frist);
    console.log("LEIB_K3_BILD " + JSON.stringify(j));
    return j;
}
const UNTERWASSER_PROBE = probeBefehl(probeUnterwasser, 45, { UNTER: unterwasserSeite });
// die Mutante „kd halbiert“ verschiebt den Abfall unter ¾ des gemessenen (Soll ½); der eigene Leib in Third 0,5 m hebt sich um ≥ 5 %
// (Weber-Kontrast gegen das Wasser neben ihm) vom Medium ab; die Höhle zwei Blenden um ihre Nacht
const UNTERWASSER_MUTANTE = 0.75;
const LEIB_KONTRAST = 0.05;
const HOEHLE_BLENDEN = 2;
// DER STEHENDE BLICK (w14-unterwasser): unter diesem Anteil weichen die Gitter zweier Aufnahmen voneinander ab, die das Gesetz
// verschieden sehen muss — Ego 0,5 ↔ 2,5 m, Third 0,5 ↔ 2,5 m (die Farbe des Mediums fällt mit exp(−kd · 2 m), REF ≥ 0,17 /m:
// ≥ 29 %), Ego ↔ Third in 0,5 m (andere Kamera, der eigene Leib im Bild). Frische Aufnahmen (Radeon 341ad089, fünf Läufe: frisch,
// Zweit-Boot, Grundstellung durch die Tür, nach wetter.K3#2, die Takte vor __werkTakt) liegen bei 55–61 % und 7–10 % (diese Probe:
// 58,4 · 55,1 · 7,0 %, die Höhle ↔ hinaus 186,7 %; je Schuss 60–290 Knoten-Frames, 200–660 Render-Rufe, 27–35 Befehle); die Läufe,
// die die Zeile ROT nannte (GTX 341ad089 nach wetter.K3#2: L 0,17442/0,17444/0,17460, Ego = Third auf 10⁻⁶; GTX und Radeon
// f5db8d90, Radeon b5aa8779 — dort pixelgleich auch 3 m über dem Spiegel), zeigten in jeder Aufnahme dasselbe Bild
const UNTERWASSER_STEHT = 0.02;
// das Gitter zweier Aufnahmen: die mittlere Abweichung der 8 × 5 Felder relativ zu ihrem Mittel (null ohne Gitter)
function blickAbstand(a, b) {
    const g = a && a.gitter, q = b && b.gitter;
    if (!Array.isArray(g) || !Array.isArray(q) || g.length !== 40 || q.length !== 40) return null;
    let d = 0, m = 0;
    for (let i = 0; i < 40; i++) (d += Math.abs(g[i] - q[i])), (m += (g[i] + q[i]) / 2);
    return m > 0 ? d / m : null;
}
// das Urteil über die Zeile `LEIB_K3_BILD {…}`: zuerst, ob die Aufnahme der Kamera folgt (DER STEHENDE BLICK, `UNTERWASSER_STEHT` —
// steht sie, nennt die Zeile ihn und beschuldigt nie das Gesetz des Wassers), dann je Sicht der Abfall K in 1,5 und 2,5 m im Band der
// Soll-Tafel (die REF der Literatur, unabhängig vom Gesetz: kd klarer Seen), die Mutante, der Leib in Third, die Höhle
function unterwasserUrteil(lauf) {
    const t = String(lauf.stdout || "");
    const j = jsonZeile(t, /^LEIB_K3_BILD \{/);
    const fehler = (/^@@ PROBE-FEHLER (.*)$/m.exec(t) || [])[1];
    if (!j) return { gruen: false, zahl: "keine Zeile LEIB_K3_BILD" + (fehler ? " — " + fehler.slice(0, 200) : "") + " (Exit " + lauf.exit + ")" };
    const rot = [], w = j.wasser || {}, h = j.hoehle || {}, f2 = (x) => (Number.isFinite(x) ? +x.toFixed(2) : x);
    const band = Array.isArray(j.band) && j.band.length === 2 && j.band[0] > 0 ? j.band : null;
    if (!band) rot.push("keine REF: die Soll-Tafel trägt in der Klasse wasser kein Band sichtAbfall");
    const K = (a, b, za, zb) => (a > 0 && b > 0 && zb > za ? Math.log(a / b) / (zb - za) : null);
    const teile = [];
    const pz = (x) => (x === null ? "—" : +(100 * x).toFixed(2) + " %"), zug = (x) => (x && Array.isArray(x.zug) ? x.zug.join("/") : "—");
    const [e0, e2, t0, t2] = [(w.ego || [])[0], (w.ego || [])[2], (w.third || [])[0], (w.third || [])[2]];
    const paare = [["Ego 0,5 ↔ 2,5 m", e0, e2], ["Third 0,5 ↔ 2,5 m", t0, t2], ["Ego ↔ Third 0,5 m", e0, t0]].map(([n, a, b]) => [n, blickAbstand(a, b)]);
    const blick = paare.map(([n, x]) => n + " " + pz(x)).join(", ");
    if (paare.some(([, x]) => x === null)) rot.push("kein Gitter der Szenen-Luma je Schuss — ob die Aufnahme der Kamera folgt, ist ungemessen");
    const steht = paare.every(([, x]) => x !== null && x < UNTERWASSER_STEHT);
    if (steht)
        rot.push("DAS BILD STEHT: " + blick + " (Soll ≥ " + 100 * UNTERWASSER_STEHT + " %) — jede Aufnahme zeigt dasselbe Bild, der Schuss folgt weder der Tiefe " +
            "noch der Sicht (Frames/Rufe/Befehle/Dreiecke je Aufnahme: Ego 0,5 m " + zug(e0) + ", Ego 2,5 m " + zug(e2) + ", Third 0,5 m " + zug(t0) +
            "); Abfall, Mutante und Leib sind so nicht gemessen, das Gesetz des Wassers nicht beschuldigt");
    teile.push("Blick " + blick);
    for (const n of ["ego", "third"]) {
        const r = w[n];
        if (!Array.isArray(r) || r.length !== 3) {
            rot.push(n + ": keine Reihe" + (w.fehler ? " — " + w.fehler : ""));
            continue;
        }
        for (const x of r) if (!x.unter || x.fest || !(Math.abs(x.tiefe - x.z) <= 0.1)) rot.push(n + " " + x.z + " m: die Kamera steht nicht im Wasser (Tiefe " + x.tiefe + ", fest " + x.fest + ")");
        const ks = r.slice(1).map((x) => K(r[0].L, x.L, r[0].tiefe, x.tiefe));
        r.slice(1).forEach((x, i) => { if (!steht && band && !(ks[i] >= band[0] && ks[i] <= band[1])) rot.push(n + " " + x.z + " m: Abfall " + f2(ks[i]) + " /m außerhalb der REF [" + band.join("; ") + "]"); });
        teile.push(n + " L " + r.map((x) => x.L).join("/") + " · K " + ks.map(f2).join(", ") + " /m · 2,5÷0,5 m " + f2(r[2].L / r[0].L));
    }
    const leib = Array.isArray(w.third) && w.third[0] && Array.isArray(w.third[0].leib) ? w.third[0].leib[3] : null;
    if (!steht && !(leib >= LEIB_KONTRAST)) rot.push("Third 0,5 m: der eigene Leib hebt sich nur um " + f2(leib) + " vom Wasser ab (Soll ≥ " + LEIB_KONTRAST + ")");
    teile.push("Leib Third 0,5 m Kontrast " + f2(leib));
    const eg = Array.isArray(w.ego) && w.ego.length === 3 ? K(w.ego[0].L, w.ego[2].L, w.ego[0].tiefe, w.ego[2].tiefe) : null;
    const mu = Array.isArray(w.mutante) && w.mutante.length === 2 ? K(w.mutante[0].L, w.mutante[1].L, w.mutante[0].tiefe, w.mutante[1].tiefe) : null;
    const sieht = eg > 0 && mu !== null && mu / eg <= UNTERWASSER_MUTANTE;
    if (!steht && !sieht) rot.push("die Mutante kd halbiert verschiebt den Abfall nicht (" + f2(mu) + " gegen " + f2(eg) + " /m) — das Bild liest das Gesetz des Wassers nicht");
    teile.push("Mutante K " + f2(mu) + " (" + (sieht ? "erkannt" : "UNERKANNT") + ")");
    // die Höhle und hinaus stehen 32 m auseinander (frisch 187 %): gleichen sich ihre Gitter, steht auch dieser Blick
    const hb = blickAbstand(h.hoehle, h.hinaus), hSteht = hb !== null && hb < UNTERWASSER_STEHT;
    if (hb === null) rot.push("Höhle: kein Gitter der Szenen-Luma je Schuss — ob die Aufnahme der Kamera folgt, ist ungemessen");
    if (hSteht)
        rot.push("DIE HÖHLE STEHT: Höhle ↔ hinaus " + pz(hb) + " (Soll ≥ " + 100 * UNTERWASSER_STEHT + " %, 32 m auseinander; Frames/Rufe/Befehle/Dreiecke " +
            zug(h.hoehle) + " · " + zug(h.hinaus) + ") — der Licht-Abfall ist so nicht gemessen");
    const a = h.hoehle && h.hinaus && h.hinaus.L > 0 ? h.hoehle.L / h.hinaus.L : null, nacht = Number.isFinite(h.nacht) ? 2 ** (h.nacht - HOEHLE_BLENDEN) : null;
    if (!hSteht && !(a !== null && nacht !== null && a >= nacht && a <= 2 ** -HOEHLE_BLENDEN && h.hoehle.h < 1))
        rot.push("Höhle: Abfall " + f2(a) + " außerhalb [" + f2(nacht) + "; " + 2 ** -HOEHLE_BLENDEN + "] (Himmel am Auge " + (h.hoehle && h.hoehle.h) + ")" + (h.fehler ? " — " + h.fehler : ""));
    teile.push("Höhle " + (h.hoehle ? h.hoehle.L : "—") + " ÷ hinaus " + (h.hinaus ? h.hinaus.L : "—") + " = " + f2(a) + " (Blick " + pz(hb) + ")");
    return { gruen: !rot.length && lauf.exit === 0, zahl: teile.join(" · ") + (rot.length ? " · ROT: " + rot.join(", ") : "") + " · Exit " + lauf.exit };
}
const UNTERWASSER_PROBEN = (() => {
    const kd = [0.45, 0.15, 0.3], Y = (z) => 0.2126 * Math.exp(-kd[0] * z) + 0.7152 * Math.exp(-kd[1] * z) + 0.0722 * Math.exp(-kd[2] * z);
    // das Gitter einer frischen Aufnahme: die Helligkeit L über einem Muster, das mit dem Ort der Kamera wandert (Tiefe, Sicht)
    const blick = (L, z, sicht) => Array.from({ length: 40 }, (_, i) => +(L * (1 + 0.3 * Math.sin(0.7 * i + 1.3 * z + (sicht === "third" ? 2 : 0)))).toFixed(5));
    const reihe = (f = (z) => 0.3 * Y(z), tiefen = [0.5, 1.5, 2.5], leib) =>
        tiefen.map((z, i) => Object.assign({ z, tiefe: z, unter: true, fest: false, L: +f(z).toFixed(7), k: 0.512, gitter: blick(f(z), z, leib ? "third" : "ego"), zug: [37, 52, 31, 412000] }, leib && !i ? { leib } : {}));
    const wasser = (o = {}) => Object.assign({ art: "see", ego: reihe(), third: reihe(undefined, undefined, [0.62, 0.27, 0.28, 1.25]), mutante: reihe((z) => 0.3 * Y(z / 2), [0.5, 2.5]) }, o);
    const hoehle = (o = {}) => Object.assign({ hoehle: { auge: [-1020.6, 91.8, -720], h: 0, L: 0.017, k: 0.51, gitter: blick(0.017, 91.8), zug: [37, 49, 12, 98000] }, hinaus: { auge: [-1020.6, 123.8, -720], h: 1, L: 0.157, k: 0.51, gitter: blick(0.157, 123.8), zug: [37, 55, 64, 530000] }, weg: 15.5, nacht: -2.17 }, o);
    // DER STEHENDE BLICK (GTX 341ad089 nach wetter.K3#2): jede Aufnahme dasselbe Bild — `f` die Helligkeit, die die Zeile je Tiefe trägt
    const steht = (f, G = blick(0.1744, 0.5)) => (tiefen = [0.5, 1.5, 2.5], leib) =>
        tiefen.map((z, i) => Object.assign({ z, tiefe: z, unter: true, fest: false, L: +f(z).toFixed(7), k: 0.5117, gitter: G.map((v, q) => +(v * (1 + (q % 3) * 1e-4 * z)).toFixed(5)), zug: [37, 52, 31, 412000] }, leib && !i ? { leib } : {}));
    const gtx = steht((z) => 0.17442 + 8e-5 * (z - 0.5));
    const imBand = steht((z) => 0.3 * Y(z));
    const z = (j) => "@@ 31.2 s · umgestellt -1041/-738 in 10355 ms\nLEIB_K3_BILD " + JSON.stringify(Object.assign({ band: [0.17, 0.57], see: { x: 1816, z: -6168, level: 0.93, tiefe: 3.4 }, wasser: wasser(), hoehle: hoehle() }, j));
    const flach = reihe((z) => 0.062 + 0.004 * z);
    const truebe = (z) => 0.3 * (0.7152 * Math.exp(-2 * z) + 0.0722 * Math.exp(-1.2 * z));
    return [
        { name: "Abfall wie ein klarer See in Ego und Third, der Leib sichtbar, die Mutante erkannt, die Höhle drei Blenden dunkler", stdout: z({}), gruen: true },
        { name: "vorher: ein blauer Filter, in jeder Tiefe dasselbe Bild", stdout: z({ wasser: wasser({ ego: flach, third: reihe((z) => 0.062 + 0.004 * z, undefined, [0.3, 0.06, 0.06, 4]), mutante: reihe((z) => 0.062 + 0.004 * z, [0.5, 2.5]) }) }), gruen: false },
        { name: "die Look-Zahl wK als Absorption je Meter: Sicht 1,9 m, der Leib verschwindet", stdout: z({ wasser: wasser({ ego: reihe(truebe), third: reihe(truebe, undefined, [0.099, 0.0987, 0.0988, 0.001]), mutante: reihe((z) => truebe(z / 2), [0.5, 2.5]) }) }), gruen: false },
        { name: "die Mutante kd halbiert ändert das Bild nicht (blind)", stdout: z({ wasser: wasser({ mutante: reihe(undefined, [0.5, 2.5]) }) }), gruen: false },
        { name: "Third: der Grund im vollen Mittag hebt 2,5 m auf das Bild von 0,5 m", stdout: z({ wasser: wasser({ third: reihe((z) => 0.3 * Y(z) * (z > 2 ? 1.4 : 1), undefined, [0.62, 0.27, 0.28, 1.25]) }) }), gruen: false },
        { name: "die Kamera steckt im Grund", stdout: z({ wasser: wasser({ ego: reihe().map((x, i) => (i === 2 ? Object.assign(x, { fest: true }) : x)) }) }), gruen: false },
        { name: "vorher: das Auge gleicht das Fehlende ganz aus (eine Blende)", stdout: z({ hoehle: hoehle({ hoehle: { auge: [-1020.6, 91.8, -720], h: 0, L: 0.075, k: 0.51, gitter: blick(0.075, 91.8), zug: [37, 49, 12, 98000] } }) }), gruen: false },
        { name: "die Höhle schwarz (kein Licht des Auges)", stdout: z({ hoehle: hoehle({ hoehle: { auge: [-1020.6, 91.8, -720], h: 0, L: 0.006, k: 0.51, gitter: blick(0.006, 91.8), zug: [37, 49, 12, 98000] } }) }), gruen: false },
        { name: "die Soll-Tafel trägt keine REF", stdout: z({ band: null }), gruen: false },
        { name: "die Probe warf vor der Zeile", stdout: "@@ PROBE-FEHLER Error: kein See nächst der Mess-Wiese (__wasserOrte)", gruen: false },
        { name: "der stehende Blick (GTX 341ad089): jede Aufnahme dasselbe Bild, L flach — DAS BILD STEHT, nie das Gesetz", stdout: z({ wasser: wasser({ ego: gtx(), third: gtx(undefined, [0.2335, 0.2345, 0.2419, 0.02]), mutante: gtx([0.5, 2.5]) }) }), gruen: false },
        { name: "der stehende Blick, dessen Zahlen im Band liegen (nur das Gitter sieht ihn)", stdout: z({ wasser: wasser({ ego: imBand(), third: imBand(undefined, [0.62, 0.27, 0.28, 1.25]), mutante: steht((q) => 0.3 * Y(q / 2))([0.5, 2.5]) }) }), gruen: false },
        { name: "die Höhle steht: Höhle und hinaus dasselbe Bild, ihr Verhältnis im Band", stdout: z({ hoehle: hoehle({ hinaus: { auge: [-1020.6, 123.8, -720], h: 1, L: 0.157, k: 0.51, gitter: blick(0.017, 91.8), zug: [37, 49, 12, 98000] } }) }), gruen: false },
        { name: "die Probe ohne Gitter je Schuss (die Fassung vor w14-unterwasser)", stdout: z({ wasser: wasser({ ego: reihe().map(({ gitter, ...x }) => x) }) }), gruen: false },
    ];
})();

// ultiversum.K1 #1 (w8-ultiversum-k1): ZWEI PER TOR ERREICHBARE WELTEN MIT VERSCHIEDENEN KONSTANTEN, JE KONSTANTE EIN LESER. Null-Renderer,
// EINE Seite, der echte Weg: A ist die Welt der Seite (das Gesetz der Erde, `worldMeta.gesetz`); der Spieler holt ein Tor in die Ferne
// (`obtainPortalForWorld("ferne")` → `portal_ferne`, portalMeta.gesetz), setzt es und geht hindurch (`enterPortal` → `_weltTorBetreten`:
// die Welt wird mit dem Gesetz der Ferne geboren, die Tür `_weltBetreten` wechselt am Ort, `erwacht`); in der Ferne steht das Heimtor
// (`heimtor-<A>`), durch das der Spieler zurückkehrt. Je Welt und Seite gemessen: das Gesetz im Speicher der Welt (Schwere,
// Rayleigh-Tiefe, Wetter-Tafel, Relief-Regler) und je Konstante ihr Leser — SPRUNG: ein echter Sprung im Takt (der Leib-Löser,
// `leibSprung` + 240 Bilder `_gameLoopTick`), der Scheitel über dem Stand gegen v²/2g; HIMMEL: das Medium der Atmosphäre
// (`_atmoMediumJetzt().betaR`, Blau ÷ Rot des Zenits) und die Farbe der Sonne bei sin h = 0,5 (`_atmoSonne`) — die Zahl des
// Himmels-Zustands, nie ein Bild (Null-Renderer); WETTER: das Wort des Wetter-Zugs (`_wetterAmOrt`) an 240 Orten × Zeiten, je Zeile
// der Front (`wetterAt`) gegen die Tafel; GELÄNDE: das Relief der Höhe des Kerns (41 × 41 Punkte, 120 m) an der Lage der Welt gegen
// dieselbe Lage unter dem Erbgut der Erde. Am main d880c8e8 ROT erwartet: es gibt kein Gesetz der Welt und kein Tor in die Ferne.
async function ultiversumK1Lauf() {
    const fs = require("fs");
    const path = require("path");
    const [aus, port] = process.argv.slice(1);
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const out = {};
    let code = 2;
    const server = WB.statikServer();
    await server.lausche(Number(port));
    const { browser, page } = await WB.nullSeite({ frist: 300000 });
    function MISS() {
        window.__k1Miss = async () => {
            const r = window.anazhRealm;
            const st = r.state;
            const G = st.worldMeta.gesetz;
            if (!G) throw new Error("die Welt trägt kein Gesetz (worldMeta.gesetz)");
            const m = { welt: st.worldMeta.worldId, slug: st.worldMeta.slug };
            m.gesetz = {
                schwere: G.schwere,
                rayleighTiefe: G.himmel.rayleighTiefe.slice(),
                wetter: { ...G.wetter },
                hoeheRegler: G.gelaende && G.gelaende.terme && G.gelaende.terme[0].hoehe != null ? G.gelaende.terme[0].hoehe : null,
            };
            m.g = st.gravity;
            const pm = st.playerMesh;
            let t = performance.now();
            for (let i = 0; i < 120; i++) r._gameLoopTick((t += 1000 / 60));
            const y0 = pm.position.y;
            const abdruck = r._sprungAbdruck();
            const sprang = AnazhRealm._leibTakt().leibSprung(st, r._leibOrt(), t / 1000);
            let top = y0;
            for (let i = 0; i < 240; i++) {
                r._gameLoopTick((t += 1000 / 60));
                top = Math.max(top, pm.position.y);
            }
            m.sprung = { y0: +y0.toFixed(3), hoehe: +(top - y0).toFixed(3), abdruck: +abdruck.toFixed(3), sprang: !!sprang };
            const M = r._atmoMediumJetzt();
            const s = r._atmoSonne(0.5);
            m.himmel = { betaR: M.betaR.map((v) => +v.toFixed(5)), blauRot: +(M.betaR[2] / M.betaR[0]).toFixed(4), sonne: [s.col.r, s.col.g, s.col.b].map((v) => +v.toFixed(4)) };
            const seed = st.worldMeta.seed;
            const je = {};
            let gegen = 0;
            for (let i = 0; i < 240; i++) {
                const x = (i % 16) * 2300 - 18000;
                const z = Math.floor(i / 16) * 1700 - 12000;
                const tt = i * 397;
                const zeile = globalThis.__phytoCore.wetterAt(seed, x, z, tt).zeile;
                const wort = r._wetterAmOrt(x, z, tt);
                je[zeile + ">" + wort] = (je[zeile + ">" + wort] || 0) + 1;
                if (wort !== G.wetter[zeile]) gegen++;
            }
            const worte = {};
            for (const [k, n] of Object.entries(je)) worte[k.split(">")[1]] = (worte[k.split(">")[1]] || 0) + n;
            m.wetter = { je, worte, gegenTafel: gegen };
            const K = globalThis.__gelaendeCore;
            const L = r._gelaende();
            const LE = Object.create(L);
            Object.defineProperty(LE, "erbgut", { value: { terme: K.erbgutNormal(undefined), wildnis: 1 } });
            const p = pm.position;
            const hs = [];
            const he = [];
            for (let i = 0; i < 41; i++)
                for (let j = 0; j < 41; j++) {
                    const x = p.x + (i - 20) * 120;
                    const z = p.z + (j - 20) * 120;
                    hs.push(K.hoehe(L, x, z, false));
                    he.push(K.hoehe(LE, x, z, false));
                }
            const sd = (a) => {
                const mu = a.reduce((q, v) => q + v, 0) / a.length;
                return Math.sqrt(a.reduce((q, v) => q + (v - mu) ** 2, 0) / a.length);
            };
            const e0 = r._erbgut().terme[0];
            m.gelaende = { relief: +sd(hs).toFixed(3), reliefErde: +sd(he).toFixed(3), verhaeltnis: +(sd(hs) / Math.max(1e-9, sd(he))).toFixed(4), leserRegler: e0.hoehe != null ? e0.hoehe : null };
            return m;
        };
    }
    try {
        await server.zeige(page, 120000);
        await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa > 0));
        await page.evaluate(MISS.toString() + ";MISS()");
        out.a = await page.evaluate(() => window.__k1Miss());
        console.log("ULTI_K1 a " + JSON.stringify(out.a));
        out.tor = await page.evaluate(async () => {
            const r = window.anazhRealm, st = r.state;
            const hol = r.obtainPortalForWorld("ferne");
            if (!hol || !hol.ok) return { ok: false, grund: "obtainPortalForWorld " + (hol && hol.reason) };
            const p = st.playerMesh.position;
            const e = r.spawnArchitecture(hol.blueprint, { x: p.x + 4, y: p.y, z: p.z }, { id: "ulti-k1-tor", precise: true });
            if (!e || !(e.affordances && e.affordances.isPortal)) return { ok: false, grund: "das Tor steht nicht als Portal" };
            const idA = st.worldMeta.worldId;
            const res = r.enterPortal(e);
            if (!res || !res.ok) return { ok: false, grund: "enterPortal " + JSON.stringify(res) };
            const erw = await r.erwacht;
            const gA = JSON.parse(localStorage.getItem(r.worldStorageKey(idA)) || "{}");
            const torA = (gA.architectures || []).find((a) => a && a.id === "ulti-k1-tor");
            return { ok: erw === true && st !== r.state && r.state.worldMeta.worldId === res.worldId && res.geboren === true, a: idA, b: res.worldId, merkt: !!(torA && torA.portalMeta && torA.portalMeta.weltId === res.worldId) };
        });
        console.log("ULTI_K1 tor " + JSON.stringify(out.tor));
        if (!out.tor.ok) throw new Error("das Tor führt nicht in die Ferne: " + JSON.stringify(out.tor));
        await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa > 0));
        out.b = await page.evaluate(() => window.__k1Miss());
        console.log("ULTI_K1 b " + JSON.stringify(out.b));
        out.heim = await page.evaluate(async (idA) => {
            const r = window.anazhRealm, st = r.state;
            const h = (st.architectures || []).find((a) => a && a.id === "heimtor-" + idA);
            if (!h) return { ok: false, grund: "kein Heimtor in der Ferne" };
            const res = r.enterPortal(h);
            if (!res || !res.ok) return { ok: false, grund: "enterPortal " + JSON.stringify(res) };
            const erw = await r.erwacht;
            return { ok: erw === true && r.state.worldMeta.worldId === idA, hier: r.state.worldMeta.worldId };
        }, out.tor.a);
        console.log("ULTI_K1 heim " + JSON.stringify(out.heim));
        if (!out.heim.ok) throw new Error("das Heimtor führt nicht zurück: " + JSON.stringify(out.heim));
        await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa > 0));
        out.a2 = await page.evaluate(() => window.__k1Miss());
        console.log("ULTI_K1 a2 " + JSON.stringify(out.a2));
        code = 0;
    } catch (e) {
        out.fehler = String((e && e.message) || e).split("\n")[0];
        console.log("ULTI_K1 FEHLER " + out.fehler);
    } finally {
        fs.writeFileSync(aus, JSON.stringify(out, null, 1));
        await browser.close().catch(() => {});
        process.exit(code);
    }
}
// das Urteil über `ULTI_K1 a|tor|b|heim|a2 {…}`: das Tor führt hin (geboren, das Tor merkt seine Welt) und das Heimtor zurück; je Welt
// liest jeder Leser SEIN Gesetz — die Schwere ist `state.gravity`, der Scheitel des Sprungs v²/2g ±15 %, Blau ÷ Rot des Mediums die
// Rayleigh-Tiefe ±0,1 %, jedes Wort des Wetter-Zugs die Zeile der Tafel, das Relief 1 unter dem Erbgut der Erde und ≠ 1 (> 5 %) unter
// Reglern, die der Leser trägt; zwischen A und B ist JEDE Konstante verschieden UND ihr Leser zeigt es (Sprung, Blau ÷ Rot, ein Wort,
// das Relief); nach der Rückkehr gleicht A2 der A in jeder Zahl. Jeder Bruch beim Namen der Konstante und der Welt.
function ultiversumK1Urteil(lauf) {
    const t = String(lauf.stdout || "");
    const fehler = (/^ULTI_K1 FEHLER (.*)$/m.exec(t) || [])[1];
    const W = { a: jsonZeile(t, /^ULTI_K1 a \{/), b: jsonZeile(t, /^ULTI_K1 b \{/), a2: jsonZeile(t, /^ULTI_K1 a2 \{/) };
    const T = jsonZeile(t, /^ULTI_K1 tor \{/);
    const H = jsonZeile(t, /^ULTI_K1 heim \{/);
    if (!W.a || !T || !W.b || !H || !W.a2) return { gruen: false, zahl: "keine ULTI_K1-Zeile" + (fehler ? " — " + fehler : "") + " (Exit " + lauf.exit + ")" };
    const rot = [];
    if (!T.ok) rot.push("das Tor führt nicht in die Ferne");
    if (!T.merkt) rot.push("das Tor merkt seine Welt nicht (der Stand von A)");
    if (!H.ok) rot.push("das Heimtor führt nicht zurück");
    if (W.a.welt !== T.a || W.b.welt !== T.b || W.a2.welt !== T.a || T.a === T.b) rot.push("die Welten sind nicht A → B → A");
    const nah = (x, y, rel) => Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) <= rel * Math.max(Math.abs(x), Math.abs(y), 1e-9);
    for (const k of ["a", "b", "a2"]) {
        const m = W[k];
        const G = m.gesetz || {};
        if (m.g !== G.schwere) rot.push(k + ": state.gravity " + m.g + " ≠ Gesetz " + G.schwere);
        const soll = (m.sprung.abdruck * m.sprung.abdruck) / (2 * Math.abs(G.schwere));
        if (!m.sprung.sprang) rot.push(k + ": der Leib springt nicht");
        else if (!nah(m.sprung.hoehe, soll, 0.15)) rot.push(k + ": der Sprung liest die Schwere nicht (Scheitel " + m.sprung.hoehe + " m ≠ v²/2g " + soll.toFixed(3) + " m)");
        const rt = G.rayleighTiefe || [];
        if (!nah(m.himmel.blauRot, rt[2] / rt[0], 0.001)) rot.push(k + ": der Himmel liest seine Rayleigh-Tiefe nicht (Blau ÷ Rot " + m.himmel.blauRot + " ≠ " + (rt[2] / rt[0]).toFixed(4) + ")");
        if (m.wetter.gegenTafel !== 0) rot.push(k + ": das Wetter liest seine Tafel nicht (" + m.wetter.gegenTafel + " von 240 Worten gegen die Tafel)");
        if ((G.hoeheRegler ?? null) !== (m.gelaende.leserRegler ?? null)) rot.push(k + ": der Leser des Geländes trägt den Regler " + m.gelaende.leserRegler + " ≠ Gesetz " + G.hoeheRegler);
        if (G.hoeheRegler == null ? !nah(m.gelaende.verhaeltnis, 1, 1e-6) : !(Math.abs(m.gelaende.verhaeltnis - 1) > 0.05))
            rot.push(k + ": das Gelände liest sein Gesetz nicht (Relief ÷ Erde " + m.gelaende.verhaeltnis + ")");
    }
    const A = W.a, B = W.b;
    const gleich = (x, y) => JSON.stringify(x) === JSON.stringify(y);
    if (A.gesetz.schwere === B.gesetz.schwere) rot.push("die Schwere ist in beiden Welten " + A.gesetz.schwere);
    else if (!(Math.abs(B.sprung.hoehe - A.sprung.hoehe) > 0.1 * Math.max(A.sprung.hoehe, B.sprung.hoehe))) rot.push("der Sprung ist in beiden Welten gleich (" + A.sprung.hoehe + " ↔ " + B.sprung.hoehe + " m)");
    if (gleich(A.gesetz.rayleighTiefe, B.gesetz.rayleighTiefe)) rot.push("der Himmel ist in beiden Welten " + JSON.stringify(A.gesetz.rayleighTiefe));
    else if (nah(A.himmel.blauRot, B.himmel.blauRot, 0.01)) rot.push("das Himmels-Medium ist in beiden Welten gleich (Blau ÷ Rot " + A.himmel.blauRot + ")");
    if (gleich(A.gesetz.wetter, B.gesetz.wetter)) rot.push("die Wetter-Tafel ist in beiden Welten gleich");
    else {
        const zeigt = Object.keys(B.wetter.je).some((k) => { const z = k.split(">")[0]; return A.gesetz.wetter[z] !== k.split(">")[1]; });
        if (!zeigt) rot.push("kein Wort des Wetter-Zugs der Ferne zeigt die andere Tafel");
    }
    if ((A.gesetz.hoeheRegler ?? null) === (B.gesetz.hoeheRegler ?? null)) rot.push("das Gelände trägt in beiden Welten den Regler " + A.gesetz.hoeheRegler);
    const z = (m) => ({ gesetz: m.gesetz, g: m.g, sprung: m.sprung.hoehe, blauRot: m.himmel.blauRot, worte: m.wetter.worte, relief: m.gelaende.verhaeltnis });
    if (!gleich(z(A), z(W.a2))) rot.push("nach der Rückkehr gilt in A nicht wieder das erste Gesetz (" + JSON.stringify(z(W.a2)) + ")");
    const w = (m) => "g " + m.g + " Sprung " + m.sprung.hoehe + " m · Blau÷Rot " + m.himmel.blauRot + " · Wetter " + Object.entries(m.wetter.worte).map(([k, n]) => k + " " + n).join("/") + " · Relief ×" + m.gelaende.verhaeltnis;
    return {
        gruen: !rot.length && lauf.exit === 0,
        zahl: "A " + w(A) + " | B " + w(B) + " | A2 " + (gleich(z(A), z(W.a2)) ? "= A" : w(W.a2)) + (rot.length ? " · ROT: " + rot.join(", ") : "") + " · Exit " + lauf.exit,
    };
}
const ULTI_K1_PROBEN = (() => {
    const TA = { klar: "sunny", bewoelkt: "cloudy", nebel: "foggy", regen: "rainy", sturm: "stormy" };
    const TB = { klar: "sunny", bewoelkt: "foggy", nebel: "foggy", regen: "cloudy", sturm: "stormy" };
    const welt = (id, o = {}) => Object.assign({
        welt: id, slug: id === "b" ? "ferne" : "weite-aue",
        gesetz: { schwere: -9.81, rayleighTiefe: [0.044, 0.1, 0.23], wetter: TA, hoeheRegler: null },
        g: -9.81,
        sprung: { y0: 90.805, hoehe: 0.323, abdruck: 2.599, sprang: true },
        himmel: { betaR: [0.0055, 0.0125, 0.02875], blauRot: 5.2273, sonne: [1, 0.85, 0.66] },
        wetter: { je: { "nebel>foggy": 29, "regen>rainy": 55, "klar>sunny": 69, "sturm>stormy": 32, "bewoelkt>cloudy": 55 }, worte: { foggy: 29, rainy: 55, sunny: 69, stormy: 32, cloudy: 55 }, gegenTafel: 0 },
        gelaende: { relief: 27.02, reliefErde: 27.02, verhaeltnis: 1, leserRegler: null },
    }, o);
    const A = welt("a");
    const B = welt("b", {
        gesetz: { schwere: -3.71, rayleighTiefe: [0.13, 0.085, 0.05], wetter: TB, hoeheRegler: 1.6 },
        g: -3.71,
        sprung: { y0: 93.891, hoehe: 1.54, abdruck: 3.411, sprang: true },
        himmel: { betaR: [0.01625, 0.01063, 0.00625], blauRot: 0.3846, sonne: [1, 0.4, 0.1] },
        wetter: { je: { "regen>cloudy": 59, "nebel>foggy": 30, "sturm>stormy": 29, "klar>sunny": 69, "bewoelkt>foggy": 53 }, worte: { cloudy: 59, foggy: 83, stormy: 29, sunny: 69 }, gegenTafel: 0 },
        gelaende: { relief: 53.47, reliefErde: 37.395, verhaeltnis: 1.4299, leserRegler: 1.6 },
    });
    const T = { ok: true, a: "a", b: "b", merkt: true };
    const H = { ok: true, hier: "a" };
    const z = (a, b, o = {}) => ["a " + JSON.stringify(a), "tor " + JSON.stringify(o.tor || T), "b " + JSON.stringify(b), "heim " + JSON.stringify(o.heim || H), "a2 " + JSON.stringify(o.a2 || a)].map((x) => "ULTI_K1 " + x).join("\n");
    const mitB = (o) => Object.assign({}, B, o);
    return [
        { name: "zwei Welten, vier Konstanten, vier Leser, die Rückkehr", stdout: z(A, B), gruen: true },
        { name: "dieselbe Schwere in beiden Welten (der Sprung gleich)", stdout: z(A, mitB({ gesetz: { ...B.gesetz, schwere: -9.81 }, g: -9.81, sprung: A.sprung })), gruen: false },
        { name: "derselbe Himmel in beiden Welten", stdout: z(A, mitB({ gesetz: { ...B.gesetz, rayleighTiefe: A.gesetz.rayleighTiefe }, himmel: A.himmel })), gruen: false },
        { name: "dieselbe Wetter-Tafel in beiden Welten", stdout: z(A, mitB({ gesetz: { ...B.gesetz, wetter: TA }, wetter: A.wetter })), gruen: false },
        { name: "dieselben Gelände-Regler in beiden Welten", stdout: z(A, mitB({ gesetz: { ...B.gesetz, hoeheRegler: null }, gelaende: A.gelaende })), gruen: false },
        { name: "der Leib liest die Schwere nicht (die Ferne springt wie die Erde)", stdout: z(A, mitB({ sprung: { ...B.sprung, hoehe: 0.344, abdruck: 2.599 } })), gruen: false },
        { name: "der Himmel liest sein Gesetz nicht (das Medium der Erde unter der Ferne)", stdout: z(A, mitB({ himmel: A.himmel })), gruen: false },
        { name: "das Wetter liest seine Tafel nicht (es regnet in der Ferne)", stdout: z(A, mitB({ wetter: { ...A.wetter, gegenTafel: 108 } })), gruen: false },
        { name: "das Gelände liest sein Gesetz nicht (Relief wie die Erde)", stdout: z(A, mitB({ gelaende: { ...B.gelaende, verhaeltnis: 1, leserRegler: null } })), gruen: false },
        { name: "nach der Rückkehr gilt das Gesetz der Ferne weiter", stdout: z(A, B, { a2: { ...A, g: -3.71, gesetz: { ...A.gesetz, schwere: -3.71 }, sprung: B.sprung } }), gruen: false },
        { name: "das Tor vergisst seine Welt", stdout: z(A, B, { tor: { ...T, merkt: false } }), gruen: false },
        { name: "kein Heimtor in der Ferne", stdout: "ULTI_K1 a " + JSON.stringify(A) + "\nULTI_K1 tor " + JSON.stringify(T) + "\nULTI_K1 b " + JSON.stringify(B) + "\nULTI_K1 FEHLER das Heimtor führt nicht zurück", gruen: false },
        { name: "das Tor fehlt (der Stand vor dem Gesetz)", stdout: "ULTI_K1 a {}\nULTI_K1 FEHLER die Welt trägt kein Gesetz (worldMeta.gesetz)", gruen: false },
    ];
})();

// ultiversum.K2 #2 (w5-s2-g5): DIE GEMISCHTEN REGELN IN DER FUSIONIERTEN WELT — „0 Schreibe auf den frozen Kern, die gemischten Regeln
// werten nach Affekt K3". Null-Renderer, EINE Seite, der echte Weg: A ist die Welt der Seite und trägt zwei Gesetze des Nexus (über die
// EINE Registrierung `_registerWorldRule`): Heil A (deposit_life an einem Ort) und Leer (deposit_emotion an einem fernen Ort — kein
// δ von lebendig). B ist ein Stand im Platz der Welten (localStorage, wie jede abgelegte Welt) mit Heil B und den zwei Gesetzen, die
// den frozen Worldgen pflügen (voxel_carve, terrain_steepness — die Sperrliste `RULE_FORBIDDEN_EFFECT_OPS`): eine fremde Welt kann sie
// in ihrem Stand tragen. `fuseWorlds(A, B, "random-mix", { reload: true })` gebiert die Welt und wechselt am Ort (`_weltWechsel` →
// `erwacht`); in ihr läuft der echte Takt (`_gameLoopTick`, 60 Bilder/s Spielzeit) 30 s. Gezählt: jeder Ruf der Schreiber des frozen
// Kerns (carveVoxel · fillVoxel · _lavaGiessen) und jede Schreibung von terrainSteepness/terrainBaseHeight; der SELBSTTEST danach
// gräbt einmal als Mensch (dslRun voxel_carve) — sieht der Zähler ihn nicht, ist die Probe blind. Die Wertung (affekt.K3: value = EMA
// des lokalen δ, `_measureRuleReward`; Fitness 0,5 + 0,5·value an ttl → erneuert oder verfällt, `_worldRuleFitness`): je gemischter
// Regel Feuer, value, Erneuerungen und ob sie verfiel. Am main 5fba36ea ROT erwartet: Fusion (`_fusionMergeWorldRules`) und Laden
// (`_loadStateRestoreWorldRules`) übergehen die Sperrliste — B's Pflug feuert in der neuen Welt.
async function ultiversumK2Lauf() {
    const TTL_S = 8;
    const fs = require("fs");
    const path = require("path");
    const [aus, port] = process.argv.slice(1);
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const out = {};
    let code = 2;
    const server = WB.statikServer();
    await server.lausche(Number(port));
    const { browser, page } = await WB.nullSeite({ frist: 300000 });
    try {
        await server.zeige(page, 120000);
        await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa > 0));
        out.fusion = await page.evaluate(async (TTL) => {
            const r = window.anazhRealm, st = r.state;
            const p = st.playerMesh.position;
            const [x, z] = [Math.round(p.x), Math.round(p.z)];
            const regel = (n, effect) => ({ n, cond: ["random_chance", 1], effect, everySec: 1, ttlSec: TTL, source: "nexus" });
            const R = {
                heilA: regel("heilA", ["deposit_life", ["at", x + 24, 0, z], 0.6]),
                leer: regel("leer", ["deposit_emotion", "peace", 0.3, ["at", x + 400, 0, z + 400]]),
                heilB: regel("heilB", ["deposit_life", ["at", x - 24, 0, z], 0.6]),
                pflug: regel("pflug", ["voxel_carve", x + 6, Math.round(p.y) - 2, z + 6, 3]),
                steil: regel("steil", ["terrain_steepness", 1.9]),
            };
            const ctx = { source: "nexus", log: [], programId: "ulti-k2" };
            for (const k of ["heilA", "leer"]) r._registerWorldRule(R[k].cond, R[k].effect, { everySec: 1, ttlSec: TTL }, ctx);
            const idA = st.worldMeta.worldId;
            const B = JSON.parse(JSON.stringify(r.buildStateSnapshot()));
            const idB = "b0b0b0b0-0000-4000-8000-00000000b0b0";
            B.worldMeta = { ...B.worldMeta, worldId: idB, slug: "welt-b", seed: "w-ulti-k2-b" };
            B.worldRules = ["heilB", "pflug", "steil"].map((k) => ({ cond: R[k].cond, effect: R[k].effect, everySec: 1, ttlSec: TTL, source: "nexus" }));
            localStorage.setItem(r.worldStorageKey(idB), JSON.stringify(B));
            const f = r.fuseWorlds(idA, idB, "random-mix", { reload: true });
            if (!f || !f.ok) return { ok: false, grund: (f && f.reason) || "fuseWorlds ohne Antwort" };
            const erw = await r.erwacht;
            const g = JSON.parse(localStorage.getItem(r.worldStorageKey(f.worldId)) || "{}");
            window.__ultiK2 = { R, sig: Object.fromEntries(Object.entries(R).map(([k, v]) => [k, JSON.stringify(v.effect)])) };
            return {
                ok: erw === true && r.state.worldMeta.worldId === f.worldId,
                welt: f.worldId, eltern: f.parentWorlds, hier: r.state.worldMeta.worldId,
                imStand: Object.keys(R).filter((k) => (g.worldRules || []).some((x) => JSON.stringify(x.effect) === window.__ultiK2.sig[k])),
            };
        }, TTL_S);
        console.log("ULTI_K2 fusion " + JSON.stringify(out.fusion));
        if (!out.fusion.ok) throw new Error("die Fusion steht nicht: " + JSON.stringify(out.fusion));
        await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa > 0));
        out.lauf = await page.evaluate(async () => {
            const r = window.anazhRealm, st = r.state;
            const { sig } = window.__ultiK2;
            const schreibe = { carveVoxel: 0, fillVoxel: 0, _lavaGiessen: 0, terrainSteepness: 0, terrainBaseHeight: 0 };
            const echt = {};
            for (const k of ["carveVoxel", "fillVoxel", "_lavaGiessen"]) {
                echt[k] = r[k];
                r[k] = function (...a) {
                    schreibe[k]++;
                    return echt[k].apply(this, a);
                };
            }
            const wert = {};
            for (const k of ["terrainSteepness", "terrainBaseHeight"]) {
                wert[k] = st[k];
                Object.defineProperty(st, k, { configurable: true, enumerable: true, get: () => wert[k], set: (v) => { schreibe[k]++; wert[k] = v; } });
            }
            const akten0 = ((st.worldMeta && st.worldMeta.voxelEdits) || []).length;
            const finde = (k) => (st.worldRules || []).find((x) => x && JSON.stringify(x.effect) === sig[k]);
            const je = Object.fromEntries(Object.keys(sig).map((k) => [k, { da: !!finde(k), feuer: 0, value: null, erneuert: 0, verfiel: false, born: null, alt: 0, letzt: 0 }]));
            for (const k of Object.keys(je)) if (finde(k)) je[k].born = finde(k).born;
            let t = performance.now();
            const t0 = t;
            for (let i = 0; i < 1800; i++) {
                t += 1000 / 60;
                r._gameLoopTick(t);
                for (const k of Object.keys(je)) {
                    const x = finde(k), e = je[k];
                    if (!e.da || e.verfiel) continue;
                    if (!x) { e.verfiel = true; continue; }
                    if (x.born !== e.born) { e.erneuert++; e.born = x.born; e.alt += e.letzt; e.letzt = 0; }
                    e.letzt = x.fires || 0;
                    e.feuer = e.alt + e.letzt;
                    e.value = x.value;
                }
            }
            const lauf = { sekunden: +((t - t0) / 1000).toFixed(1), schreibe: { ...schreibe }, akten: ((st.worldMeta && st.worldMeta.voxelEdits) || []).length - akten0 };
            // DER SELBSTTEST des Zählers: EIN Graben als Mensch (die Geste des Spielers darf graben) — der Zähler muss ihn sehen
            const p = st.playerMesh.position;
            r.dslRun(["voxel_carve", p.x + 5, p.y - 2, p.z + 5, 2], { source: "human" });
            lauf.selbsttest = schreibe.carveVoxel - lauf.schreibe.carveVoxel;
            for (const k of Object.keys(echt)) r[k] = echt[k];
            for (const k of Object.keys(wert)) Object.defineProperty(st, k, { configurable: true, enumerable: true, writable: true, value: wert[k] });
            for (const e of Object.values(je)) { delete e.born; delete e.alt; delete e.letzt; if (e.value != null) e.value = +e.value.toFixed(4); }
            lauf.je = je;
            return lauf;
        });
        console.log("ULTI_K2 lauf " + JSON.stringify(out.lauf));
        code = 0;
    } catch (e) {
        out.fehler = String((e && e.message) || e).split("\n")[0];
        console.log("ULTI_K2 FEHLER " + out.fehler);
    } finally {
        fs.writeFileSync(aus, JSON.stringify(out, null, 1));
        await browser.close().catch(() => {});
        process.exit(code);
    }
}
// das Urteil über `ULTI_K2 fusion|lauf {…}`: die Fusion steht (die Seite trägt die neue Welt, Eltern A und B); 0 Schreibe auf den frozen
// Kern über 30 s Takt und der Zähler sieht den Menschen (Selbsttest); jede erlaubte gemischte Regel (Heil A, Heil B, Leer) ist in der
// neuen Welt und feuert ≥ 2×; die Wertung trennt nach δ: Heil A und Heil B value > 0 und erneuert, Leer unter beiden und verfallen.
function ultiversumK2Urteil(lauf) {
    const t = String(lauf.stdout || "");
    const fehler = (/^ULTI_K2 FEHLER (.*)$/m.exec(t) || [])[1];
    const F = jsonZeile(t, /^ULTI_K2 fusion \{/);
    const L = jsonZeile(t, /^ULTI_K2 lauf \{/);
    if (!F || !L || !L.je || !L.schreibe) return { gruen: false, zahl: "keine ULTI_K2-Zeile" + (fehler ? " — " + fehler : "") + " (Exit " + lauf.exit + ")" };
    const rot = [];
    if (!F.ok || !Array.isArray(F.eltern) || F.eltern.length !== 2) rot.push("die Fusion steht nicht in der Seite");
    const s = Object.values(L.schreibe).reduce((a, x) => a + x, 0);
    if (s !== 0 || L.akten) rot.push(s + " Schreibe auf den frozen Kern (" + Object.entries(L.schreibe).filter(([, x]) => x).map(([k, x]) => k + " " + x).join(", ") + (L.akten ? "; " + L.akten + " neue Akten der Voxel-Edits" : "") + ")");
    if (!(L.selbsttest >= 1)) rot.push("der Zähler sieht den Menschen nicht (Selbsttest " + L.selbsttest + ") — die Probe ist blind");
    if (!(L.sekunden >= 29)) rot.push("der Takt lief " + L.sekunden + " s < 30 s");
    const J = L.je;
    for (const k of ["heilA", "heilB", "leer"]) {
        const e = J[k];
        if (!e || !e.da) rot.push(k + " fehlt in der neuen Welt");
        else if (!(e.feuer >= 2)) rot.push(k + " feuert " + e.feuer + "× < 2");
    }
    const v = (k) => (J[k] && Number.isFinite(J[k].value) ? J[k].value : null);
    for (const k of ["heilA", "heilB"]) {
        if (!(v(k) > 0)) rot.push(k + " value " + v(k) + " ≤ 0 (die Wertung sieht sein δ nicht)");
        if (J[k] && (J[k].verfiel || !(J[k].erneuert >= 1))) rot.push(k + (J[k].verfiel ? " verfiel" : " nie erneuert"));
    }
    if (J.leer && J.leer.da) {
        if (!(v("leer") !== null && v("leer") < Math.min(v("heilA") ?? -Infinity, v("heilB") ?? -Infinity))) rot.push("Leer value " + v("leer") + " nicht unter den Heilern");
        if (!J.leer.verfiel) rot.push("Leer verfiel nicht (die Fitness wählt nicht)");
    }
    const z = (k) => (J[k] ? k + " " + (J[k].da ? J[k].feuer + "× v " + J[k].value + (J[k].verfiel ? " verfiel" : " ern. " + J[k].erneuert) : "fehlt") : k + " ?");
    return {
        gruen: !rot.length && lauf.exit === 0,
        zahl: "Schreibe " + s + " (Selbsttest " + L.selbsttest + ") · " + ["heilA", "heilB", "leer", "pflug", "steil"].map(z).join(" · ") + " · im Stand " +
            (F.imStand || []).join("/") + (rot.length ? " · ROT: " + rot.join(", ") : "") + " · Exit " + lauf.exit,
    };
}
const ULTI_K2_PROBEN = (() => {
    const F = { ok: true, welt: "f1", eltern: ["a", "b"], hier: "f1", imStand: ["heilA", "leer", "heilB"] };
    const je = (o = {}) => Object.assign({
        heilA: { da: true, feuer: 9, value: 0.12, erneuert: 2, verfiel: false },
        heilB: { da: true, feuer: 9, value: 0.1, erneuert: 2, verfiel: false },
        leer: { da: true, feuer: 8, value: 0, erneuert: 0, verfiel: true },
        pflug: { da: false, feuer: 0, value: null, erneuert: 0, verfiel: false },
        steil: { da: false, feuer: 0, value: null, erneuert: 0, verfiel: false },
    }, o);
    const L = (o = {}) => Object.assign({ sekunden: 30, schreibe: { carveVoxel: 0, fillVoxel: 0, _lavaGiessen: 0, terrainSteepness: 0, terrainBaseHeight: 0 }, akten: 0, selbsttest: 1, je: je() }, o);
    const z = (f, l) => "ULTI_K2 fusion " + JSON.stringify(f) + "\nULTI_K2 lauf " + JSON.stringify(l);
    return [
        { name: "0 Schreibe, die Heiler erneuert, Leer verfällt", stdout: z(F, L()), gruen: true },
        { name: "B's Pflug gräbt in der neuen Welt (die Sperrliste umgangen)", stdout: z(F, L({ schreibe: { ...L().schreibe, carveVoxel: 30, terrainSteepness: 30 }, je: je({ pflug: { da: true, feuer: 30, value: 0, erneuert: 0, verfiel: true } }) })), gruen: false },
        { name: "der Zähler ist blind (der Mensch gräbt ungezählt)", stdout: z(F, L({ selbsttest: 0 })), gruen: false },
        { name: "die Regeln aus B fehlen in der neuen Welt", stdout: z(F, L({ je: je({ heilB: { da: false, feuer: 0, value: null, erneuert: 0, verfiel: false } }) })), gruen: false },
        { name: "die Wertung ist stumm (value 0 für alle, alle verfallen)", stdout: z(F, L({ je: je({ heilA: { da: true, feuer: 9, value: 0, erneuert: 0, verfiel: true }, heilB: { da: true, feuer: 9, value: 0, erneuert: 0, verfiel: true } }) })), gruen: false },
        { name: "Leer überlebt (die Fitness wählt nicht)", stdout: z(F, L({ je: je({ leer: { da: true, feuer: 8, value: 0, erneuert: 2, verfiel: false } }) })), gruen: false },
        { name: "die Seite trägt die neue Welt nicht", stdout: z({ ...F, ok: false }, L()), gruen: false },
        { name: "die Fusion bricht", stdout: "ULTI_K2 FEHLER die Fusion steht nicht", gruen: false },
    ];
})();

// ultiversum.K4 #2 (w5-s2-g5): EIN SPIELER-GESETZBUCH DOCKT ÜBER STUDIOS K5 AN. Null-Renderer, Foundry an, zwei Läufe in zwei frischen
// Profilen am selben statischen Server. (G) DER GEGENLAUF — das Schlupfloch: das Fixture-Buch der studios.K5 (worlds/neuntes-buch,
// Art stele) reist als zusätzliche Zeile des SERVER-Manifests durch den EINEN Kern-Weg; die Probe misst das Andocken (je Rezept das
// Rezept im Buch, je Rezept der Bauplan `stele_<rezept>` mit seiner Gestalt, ein Werk über spawn_studio vor dem Spieler mit Stufe 0 und
// Dreiecken, nach Speichern + Neuladen steht es wieder) — sieht sie das nicht, ist sie blind; das Buch kam nie vom Spieler. (S) DER
// SPIELER: das Manifest des Servers bleibt Byte für Byte; der Spieler legt in der Bibliothek (`bibliothekLege`, die EINE Hülle des
// Teilens, signiert) ein NEUES Gesetzbuch ab — der Quelltext der Stele, umbenannt zu Art „quaxmal“ (Rezepte quaxstein · quaxpfahl ·
// quaxturm), ohne Kommentar-Zeilen; sein SHA-256 trägt kein Kern des Spiel-Manifests und kein Buch unter worlds/. Nach dem Neuladen
// muss es dasselbe Andocken bestehen wie (G), und der Wirt (Stamm, Seite, Manifest, Kerne) nennt die Art 0×. Am main 5fba36ea ROT
// erwartet: die Bibliothek kennt die Art gesetzbuch nicht (`_bibliothekFracht` trägt welt · regel · bauplan), der Kern-Weg liest nur
// das Manifest des Servers (`_foundryStart`).
async function ultiversumK4Lauf() {
    const fs = require("fs");
    const path = require("path");
    const crypto = require("crypto");
    const [aus, port] = process.argv.slice(1);
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const lies = (f) => fs.readFileSync(path.resolve(f), "utf8");
    const MANIFEST = JSON.parse(lies("cores.manifest.json"));
    const NEUN = "worlds/neuntes-buch/stele-core.js";
    let einschleusen = true;
    const server = WB.statikServer({
        seiten: { "/cores.manifest.json": () => JSON.stringify(einschleusen ? [...MANIFEST, { id: "stele", scripts: [NEUN], vertrag: NEUN, ns: "__steleCore" }] : MANIFEST) },
    });
    await server.lausche(Number(port));
    const NAMEN = { stele: "quaxmal", Stele: "Quaxmal", meilenstein: "quaxstein", grenzstein: "quaxpfahl", obelisk: "quaxturm" };
    const buch = lies(NEUN).split("\n").filter((l) => !/^\s*\/\//.test(l)).map((l) => l.trim()).filter(Boolean).join("\n").replace(/stele|Stele|meilenstein|grenzstein|obelisk/g, (w) => NAMEN[w]);
    const sha = (t) => crypto.createHash("sha256").update(t).digest("hex");
    const kerne = [...MANIFEST.flatMap((k) => [].concat(k.scripts || [], k.lib || [], k.bruecke || [])), NEUN].filter((f) => fs.existsSync(path.resolve(f)));
    const out = { neu: !kerne.some((f) => sha(lies(f)) === sha(buch)), bytes: Buffer.byteLength(buch) };
    const wirt = ["index.html", "cores.manifest.json", ...MANIFEST.flatMap((k) => [].concat(k.scripts || [], k.bruecke || []))]
        .filter((f) => fs.existsSync(path.resolve(f))).map(lies);
    const stamm = fs.readdirSync(path.resolve("stamm")).filter((f) => f.endsWith(".js")).map((f) => lies("stamm/" + f));
    out.nennt = (wirt.concat(stamm).join("\n").match(/quaxmal|quaxstein|quaxpfahl|quaxturm/gi) || []).length;
    let code = 2;
    const browser = await WB.starteBrowser({ art: "null", frist: 300000 });
    const seite = async () => {
        const k = await browser.createBrowserContext();
        const page = await k.newPage();
        await WB.nullRenderer(page);
        await server.zeige(page, 60000);
        return page;
    };
    const buchDa = (page) => page.evaluate(() => window.__weltDa((x) => x._foundry && x._foundry.ready && x._foundry.recipes && x.state._weltbildDa > 0));
    // DAS ANDOCKEN einer Art (in der Seite): Rezept · Bauplan · Werk vor dem Spieler (Stufe 0, Dreiecke) — `art` und ihre Rezepte
    const dock = (page, art, rezepte) =>
        page.evaluate(async (art, rezepte) => {
            const r = window.anazhRealm, st = r.state, f = r._foundry;
            const d = { rezepte: rezepte.filter((x) => f.recipes && f.recipes[x]).length, bauplaene: rezepte.filter((x) => (st.blueprints[art + "_" + x] || {}).studioGestalt === x).length, steht: false, tris: 0 };
            if (d.rezepte < rezepte.length) return d;
            const p = st.playerMesh.position;
            const x = p.x + 6;
            r.dslRun(["spawn_studio", rezepte[0], ["at", x, r._voxelSurfaceY(x, p.z), p.z], 1, 4711, {}], { source: "human" });
            const w = () => st.architectures.find((a) => a.type === art + "_" + rezepte[0]);
            const takt = async () => r._gameLoopTick(performance.now());
            d.steht = await window.__gebautNach("das Werk " + art, { fertig: () => w() && w()._servedLod === 0 && w().instSlots.length, takt }).then(() => true, (e) => String(e.message || e).slice(0, 160));
            if (d.steht === true) d.tris = [...new Set(w().instSlots.map((s) => st.archInstanceGroups.get(s.key).mesh.geometry))].reduce((n, g) => n + g.index.count / 3, 0);
            if (d.steht === true) r.saveState();
            return d;
        }, art, rezepte);
    const geladen = async (page, art, rezept) => {
        await new Promise((ok) => setTimeout(ok, 1500));
        await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        await buchDa(page);
        return page.evaluate(async (art, rezept) => {
            const r = window.anazhRealm;
            const w = () => r.state.architectures.find((a) => a.type === art + "_" + rezept);
            return window.__gebautNach("das Werk nach dem Laden", { fertig: () => w() && w().instSlots && w().instSlots.length, takt: async () => r._gameLoopTick(performance.now()) }).then(() => true, (e) => String(e.message || e).slice(0, 160));
        }, art, rezept);
    };
    try {
        const G = await seite();
        await buchDa(G);
        out.gegenlauf = await dock(G, "stele", ["meilenstein", "grenzstein", "obelisk"]);
        out.gegenlauf.geladen = out.gegenlauf.steht === true ? await geladen(G, "stele", "meilenstein") : false;
        console.log("ULTI_K4 gegenlauf " + JSON.stringify(out.gegenlauf));
        einschleusen = false;
        const S = await seite();
        await buchDa(S);
        out.bibliothek = await S.evaluate(async (q) => {
            const r = window.anazhRealm;
            for (let i = 0; i < 300 && !(r.state.vibePass && r.state.vibePass.ready); i++) await new Promise((ok) => setTimeout(ok, 50));
            const a = await r.bibliothekLege("gesetzbuch", q, { skipConfirm: true });
            return { ok: !!(a && a.ok), art: a && a.art, code: a && a.code ? String(a.code).slice(0, 16) : null, grund: a && a.grund, bytes: a && a.bytes };
        }, buch);
        console.log("ULTI_K4 bibliothek " + JSON.stringify(out.bibliothek));
        await new Promise((ok) => setTimeout(ok, 1500));
        await S.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        await buchDa(S);
        out.spieler = await dock(S, "quaxmal", ["quaxstein", "quaxpfahl", "quaxturm"]);
        out.spieler.geladen = out.spieler.steht === true ? await geladen(S, "quaxmal", "quaxstein") : false;
        console.log("ULTI_K4 spieler " + JSON.stringify({ ...out.spieler, neu: out.neu, nennt: out.nennt, bytes: out.bytes }));
        code = 0;
    } catch (e) {
        out.fehler = String((e && e.message) || e).split("\n")[0];
        console.log("ULTI_K4 FEHLER " + out.fehler);
    } finally {
        fs.writeFileSync(aus, JSON.stringify(out, null, 1));
        await browser.close().catch(() => {});
        server.close();
        process.exit(code);
    }
}
// das Urteil über `ULTI_K4 gegenlauf|bibliothek|spieler {…}`: der Gegenlauf dockt (sonst ist die Probe blind); der Spieler legt ein
// neues Buch signiert ab (art gesetzbuch, Code), es dockt nach dem Neuladen ganz an (3/3 Rezepte, 3/3 Baupläne, das Werk steht mit
// Dreiecken, übersteht Speichern + Neuladen), sein SHA trägt kein Kern, und der Wirt nennt die Art 0×.
function ultiversumK4Urteil(lauf) {
    const t = String(lauf.stdout || "");
    const fehler = (/^ULTI_K4 FEHLER (.*)$/m.exec(t) || [])[1];
    const G = jsonZeile(t, /^ULTI_K4 gegenlauf \{/);
    const B = jsonZeile(t, /^ULTI_K4 bibliothek \{/);
    const S = jsonZeile(t, /^ULTI_K4 spieler \{/);
    if (!G || !B || !S) return { gruen: false, zahl: "keine ULTI_K4-Zeile für " + [["gegenlauf", G], ["bibliothek", B], ["spieler", S]].filter(([, x]) => !x).map(([n]) => n).join(", ") + (fehler ? " — " + fehler : "") + " (Exit " + lauf.exit + ")" };
    const ganz = (d) => d.rezepte === 3 && d.bauplaene === 3 && d.steht === true && d.tris > 0 && d.geladen === true;
    const z = (d) => d.rezepte + "/3 Rezepte · " + d.bauplaene + "/3 Baupläne · " + (d.steht === true ? "steht " + d.tris + " △" : "steht nicht" + (typeof d.steht === "string" ? " (" + d.steht + ")" : "")) + " · " + (d.geladen === true ? "nach dem Laden da" : "Laden fehlt");
    const rot = [];
    if (!ganz(G)) rot.push("der Gegenlauf (Server-Manifest) dockt nicht — die Probe ist blind");
    if (!(B.ok && B.art === "gesetzbuch" && B.code)) rot.push("die Bibliothek nimmt das Gesetzbuch nicht (" + (B.grund || B.art || "?") + ")");
    if (!ganz(S)) rot.push("das Spieler-Buch dockt nicht an");
    if (S.neu !== true) rot.push("das Buch ist nicht neu (ein Kern trägt seinen SHA)");
    if (S.nennt !== 0) rot.push("der Wirt nennt die Art " + S.nennt + "×");
    return {
        gruen: !rot.length && lauf.exit === 0,
        zahl: "Gegenlauf " + z(G) + " · Bibliothek " + (B.ok ? B.art + " " + B.code : "nein: " + (B.grund || "?")) + " · Spieler-Buch (" + S.bytes + " B, neu " + S.neu + ", der Wirt nennt es " + S.nennt + "×) " + z(S) +
            (rot.length ? " · ROT: " + rot.join(", ") : "") + " · Exit " + lauf.exit,
    };
}
const ULTI_K4_PROBEN = (() => {
    const d = (o = {}) => Object.assign({ rezepte: 3, bauplaene: 3, steht: true, tris: 160, geladen: true }, o);
    const z = (g, b, s) => ["ULTI_K4 gegenlauf " + JSON.stringify(g), "ULTI_K4 bibliothek " + JSON.stringify(b), "ULTI_K4 spieler " + JSON.stringify({ neu: true, nennt: 0, bytes: 7800, ...s })].join("\n");
    const bOk = { ok: true, art: "gesetzbuch", code: "ab12cd34ef56ab12", bytes: 7900 };
    const nichts = d({ rezepte: 0, bauplaene: 0, steht: false, tris: 0, geladen: false });
    return [
        { name: "das Spieler-Buch dockt über die Bibliothek ganz an", stdout: z(d(), bOk, d()), gruen: true },
        { name: "die Bibliothek kennt die Art gesetzbuch nicht (main)", stdout: z(d(), { ok: false, grund: "unbekannt" }, nichts), gruen: false },
        { name: "das Buch steht nur über das Server-Manifest, nie vom Spieler (das Schlupfloch)", stdout: z(d(), { ok: false, grund: "unbekannt" }, d()), gruen: false },
        { name: "der Gegenlauf dockt nicht (die Probe ist blind)", stdout: z(nichts, bOk, d()), gruen: false },
        { name: "das Werk übersteht das Neuladen nicht", stdout: z(d(), bOk, d({ geladen: "die Frist" })), gruen: false },
        { name: "der Wirt nennt die Art (ein Sonderweg im Stamm)", stdout: z(d(), bOk, { ...d(), nennt: 2 }), gruen: false },
        { name: "das Buch ist ein vorhandener Kern (kein Schreiben)", stdout: z(d(), bOk, { ...d(), neu: false }), gruen: false },
        { name: "die Seite bricht", stdout: "ULTI_K4 FEHLER die Frist", gruen: false },
    ];
})();

// ───────── spielgang.K4 Staffel 2 (w15-farbsicht): DER ZUGANG — Farbsicht im Ausgabe-Bild, Komfort an seinen Quellen, Untertitel ─────────
// Die Staffel: „beides und Bewegungs-Komfort (FOV, Kopfwackeln, Unschärfe aus)“. EIN Lauf (headless, swiftshader): eine Werkbank an der
// Weiche ({PORT}+20000, kienspan) am Genesis-Ort, dann die Wand (Ü) der Klang-Linse mit eigenem Boot (die Untertitel, wie Staffel 1).
//  (F) DIE FARBSICHT (`zugangFarbe`): am Blick der Ankunft (Ego, Fenster 640 × 360) die Teilung des AUSGABE-Bilds nach den Gruppen
//      ZUGANG_KLASSEN (Gras · Boden/Weg · Bau · Fels · Laub · Wasser; je Gruppe ein Schuss ohne sie, `__klassenTeilung` wie `werkbank bild
//      --klasse` — dessen 1920 × 1080 mit 15 Teil-Klassen trug swiftshader nicht in 30 min), dann dasselbe Bild mit `state.zugang.farbsicht`
//      „deuteranopie“ (der Spieler-Wert, den das Menü schreibt). Je Grenze zweier Gruppen
//      im Bild (≥ ZUGANG_GRENZE_N Paare von Nachbar-Pixeln) die Farbe beider Seiten 2 px von der Kante (die Fläche, nie die gemischte
//      Kante), gemittelt linear, unter der Simulation der Deuteranopie nach MACHADO, Oliveira & Fernandes 2009 (Schwere 1) — einem
//      ANDEREN Modell als dem des Spiels (Viénot 1999): das Urteil prüft die Daltonisierung nie an ihrer eigenen Simulation — nach
//      CIELAB D65, ΔE*ab. GRÜN, wenn jede Grenze im Bild der Farbsicht ΔE ≥ 10 trägt; das Bild ohne sie steht daneben (vorher).
//  (K) DER KOMFORT in der Seite (`zugangKomfort`): das Menü schreibt `state.zugang` (Wahl, Regler, zwei Schalter), der Snapshot trägt
//      ihn, der Lader nimmt ihn zurück und klemmt (FOV 140 → 100) und zeigt ihn im Menü; das SICHTFELD — der EINE Schreiber `_kamFov`
//      setzt die Wahl (92°), und das Ausgabe-Bild skaliert um tan(37,5°)/tan(46°) (die beste Skala zwischen den Bildern bei 75° und 92°);
//      das KOPFWACKELN — eine Landung (`_landImpactPending`) senkt das Ego-Auge im Rig (`_loopCamera`) und das Tempo atmet im Sichtfeld,
//      aus nickt nichts: das Bild nach der Landung gleicht dem davor auf das Byte; die UNSCHÄRFE — die Geschichte der zeitlichen
//      Auflösung (die Probe schaltet sie zu, kienspan trägt sie nicht: `_traa`), je Bild 1,5° Drehung über 12 Bilder: aus trägt das
//      Bild mehr Kanten-Energie als an (das Nachziehen fällt), in Ruhe sind beide gleich.
//  (Ü) DIE UNTERTITEL: `diag-klang-zensus --json` — die Zeile (Ü) UNTERTITEL n von n, kein ROT „Ü …“ (das Urteil von Staffel 1).
// Gemessen (06.11., Cloud, swiftshader 4 Kerne, 7,2 min): am main db431cf0 ROT „kein state.zugang“ nach dem Umstellen; am Zweig
// w15-farbsicht GRÜN — 4 Grenzen (Gras|Boden, Gras|Bau, Boden|Bau, Bau|Laub) min ΔE 16,9 → 19,5, Mittel 22,3 → 25,2; Sichtfeld 75 → 92°,
// Skala 0,74 (Soll 0,741); Landung −0,079 m und Tempo +6°, aus 0 und das Bild byte-gleich; Kanten-Energie in Drehung an 3,6, aus 12,5
// (Ruhe 7,79 ↔ 7,85); Untertitel 45 von 45 — am Kopf nach dem Merge von main 8efb6318 dieselben Zahlen (Spiel 1c39aada). Fidaners
// Schub fiel an derselben Station: Boden|Bau 16,9 → 11,6, das Mittel sank.
const ZUGANG_KLASSEN = {
    gras: "^nahWiese:",
    boden: "^bodenSatz$",
    bau: "^(bauSatz|geometrie-arena|portal-membran|f:sitzbank:L\\d)$",
    fels: "^formationenSatz$",
    laub: "^(fscatter:|fimp:|f:(eiche|fichte|tanne|buche|birke|kiefer):L\\d)",
    wasser: "(wasser|hydro)",
};
const ZUGANG_GRENZE_N = 150;
const MACHADO_DEUTAN = [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
];
// DIE GRENZEN (rein, in node): je Paar zweier Gruppen, die im Bild aneinanderstoßen, die mittlere Farbe beider Seiten 2 px von der Kante,
// unter `sim` (null = das Auge ohne Simulation) in CIELAB, ΔE*ab
function zugangGrenzen(u8, teil, namen, W, H, gruppen, sim) {
    const LIN = new Float64Array(256).map((_v, i) => (i <= 10.31475 ? i / 3294.6 : ((i / 255 + 0.055) / 1.055) ** 2.4));
    const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
    const lab = ([r, g, b]) => {
        const [X, Y, Z] = [(0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, 0.2126 * r + 0.7152 * g + 0.0722 * b, (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883];
        return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
    };
    const gk = Object.keys(gruppen);
    const gi = namen.map((n) => 1 + gk.findIndex((k) => new RegExp(gruppen[k]).test(n)));
    const g = new Uint8Array(W * H);
    for (let p = 0; p < W * H; p++) g[p] = teil[p] ? gi[teil[p] - 1] : 0;
    const D = 3;
    const summe = new Map();
    const nimm = (a, b, p) => {
        const k = a + "|" + b;
        const s = summe.get(k) || summe.set(k, [0, 0, 0, 0]).get(k);
        (s[0] += LIN[u8[p * 4]]), (s[1] += LIN[u8[p * 4 + 1]]), (s[2] += LIN[u8[p * 4 + 2]]), s[3]++;
    };
    for (let y = D; y < H - D; y++)
        for (let x = D; x < W - D; x++) {
            const p = y * W + x;
            const a = g[p];
            if (!a) continue;
            for (const s of [1, W]) {
                const b = g[p + s];
                if (!b || b === a || g[p - (D - 1) * s] !== a || g[p + D * s] !== b) continue;
                nimm(a, b, p - (D - 1) * s), nimm(b, a, p + D * s);
            }
        }
    const mul = (M, c) => (M ? M.map((z) => z[0] * c[0] + z[1] * c[1] + z[2] * c[2]) : c);
    const aus = [];
    for (let a = 1; a <= gk.length; a++)
        for (let b = a + 1; b <= gk.length; b++) {
            const [sa, sb] = [summe.get(a + "|" + b), summe.get(b + "|" + a)];
            if (!sa || !sb) continue;
            const [la, lb] = [sa, sb].map((s) => lab(mul(sim, s.slice(0, 3).map((v) => v / s[3]))));
            aus.push({ grenze: gk[a - 1] + "|" + gk[b - 1], n: Math.min(sa[3], sb[3]), dE: +Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]).toFixed(2) });
        }
    return aus;
}
// DIE TEILUNG IN DER SEITE (r = Welt, T = THREE): am Blick der Ankunft (Ego, die Pipelines stehen schon) das Ausgabe-Bild ganz und je
// Gruppe ohne sie (`__ausgabeAufnahme`, der Takt der Nah-Sätze ruht wie in `werkbank bild --klasse`), die Teilung `__klassenTeilung`
// (Schwelle 18) — dann dasselbe Bild mit der Farbsicht „deuteranopie“. Rückgabe: Gruppen, Schirm, Teilung und beide Bilder (base64).
async function zugangFarbe(r, T, gruppen) {
    const st = r.state;
    const gk = Object.keys(gruppen);
    const je = gk.map(() => []);
    st.scene.traverse((o) => {
        if (!(o.isMesh || o.isInstancedMesh || o.isBatchedMesh) || !o.visible) return;
        const [grob, fein] = r._kopfKlasse(o);
        const i = gk.findIndex((k) => new RegExp(gruppen[k]).test(grob) || new RegExp(gruppen[k]).test(fein));
        if (i >= 0) je[i].push(o);
    });
    const db = st.renderer.getDrawingBufferSize(new T.Vector2());
    const [W, H] = [Math.round(db.x), Math.round(db.y)];
    const ruhen = ["_tickNahWiese", "_tickNahStreu", "_ruheImBild"].map((m) => [m, Object.hasOwn(r, m), r[m]]);
    for (const [m] of ruhen) r[m] = () => 0;
    const b64 = (u8) => {
        let s = "";
        for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
        return btoa(s);
    };
    const schuss = async (aus) => {
        for (const o of aus) o.visible = false;
        window.__bundlesNeu();
        try {
            return (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
        } finally {
            for (const o of aus) o.visible = true;
            window.__bundlesNeu();
        }
    };
    try {
        st.zugang.farbsicht = "aus";
        const G = await schuss([]);
        const Os = [];
        for (const l of je) Os.push(await schuss(l));
        const { teil } = window.__klassenTeilung(G, Os, W, H, 18);
        st.zugang.farbsicht = "deuteranopie";
        const D = await schuss([]);
        return { gruppen: gk, objekte: je.map((l) => l.length), W, H, teil: b64(teil), aus: b64(G), deutan: b64(D) };
    } finally {
        st.zugang.farbsicht = "aus";
        for (const [m, eigen, alt] of ruhen)
            if (eigen) r[m] = alt;
            else delete r[m];
    }
}
// DER KOMFORT IN DER SEITE (r = Welt, T = THREE; die Werkzeuge der Werkbank stehen dort)
async function zugangKomfort(r, T) {
    const st = r.state;
    const cam = st.camera;
    const aus = { menue: {}, stand: {}, fov: {}, wackeln: {}, unschaerfe: {} };
    if (!st.zugang) return { fehler: "kein state.zugang" };
    const el = (id) => document.getElementById(id);
    const feuer = (e, typ) => e.dispatchEvent(new Event(typ, { bubbles: true }));
    const grund = () => (st.zugang = { farbsicht: "aus", fov: null, wackeln: true, unschaerfe: true });
    const luma = (u8, n) => {
        const L = new Float32Array(n);
        for (let p = 0; p < n; p++) L[p] = 0.2126 * u8[p * 4] + 0.7152 * u8[p * 4 + 1] + 0.0722 * u8[p * 4 + 2];
        return L;
    };
    const [BW, BH] = [320, 180];
    const schuss = async () => luma((await window.__ausgabeAufnahme(BW, BH, 1, { satz: "messung" })).u8, BW * BH);
    const bytes = (A, B) => A.reduce((s, v, i) => s + (Math.abs(v - B[i]) > 0.5 ? 1 : 0), 0);
    try {
        // (M) DAS MENÜ schreibt den Stand
        const sel = el("farbsicht-wahl");
        aus.menue.arten = sel ? [...sel.options].map((o) => o.value) : [];
        if (sel) (sel.value = "tritanopie"), feuer(sel, "change"), (aus.menue.farbsicht = st.zugang.farbsicht);
        const sv = el("slider-sichtfeld");
        if (sv) (sv.value = "92"), feuer(sv, "input"), (aus.menue.fov = st.zugang.fov);
        for (const [id, k] of [["kopfwackeln-toggle", "wackeln"], ["unschaerfe-toggle", "unschaerfe"]]) {
            const c = el(id);
            if (c) c.click(), (aus.menue[k] = st.zugang[k]);
        }
        // (S) DER STAND reist: der Snapshot trägt die Wahl, der Lader nimmt sie zurück (FOV geklemmt) und das Menü zeigt sie
        const snap = r.buildStateSnapshot().zugang || null;
        aus.stand.snapshot = snap && Object.assign({}, snap);
        grund();
        r._loadStateRestoreSoulAndAtmosphere({ zugang: Object.assign({}, snap, { fov: 140 }) });
        aus.stand.geladen = Object.assign({}, st.zugang);
        aus.stand.menue = { farbsicht: sel && sel.value, fov: sv && +sv.value, wackeln: el("kopfwackeln-toggle")?.checked, unschaerfe: el("unschaerfe-toggle")?.checked };
        // (V) DAS SICHTFELD: der EINE Schreiber setzt die Wahl, das Bild skaliert
        grund();
        const t = () => performance.now() / 1000;
        r._kamFov(0, t());
        aus.fov.ruhe = cam.fov;
        const A = await schuss();
        st.zugang.fov = 92;
        r._kamFov(0, t());
        aus.fov.wahl = cam.fov;
        const Bf = await schuss();
        let best = null;
        for (let s = 0.6; s <= 1.0001; s += 0.01) {
            let e = 0,
                n = 0;
            for (let y = 0; y < BH; y += 2)
                for (let x = 0; x < BW; x += 2) {
                    const [ax, ay] = [BW / 2 + (x - BW / 2) / s, BH / 2 + (y - BH / 2) / s];
                    if (ax < 0 || ay < 0 || ax > BW - 1 || ay > BH - 1) continue;
                    (e += Math.abs(Bf[y * BW + x] - A[Math.round(ay) * BW + Math.round(ax)])), n++;
                }
            if (n > 500 && (!best || e / n < best.e)) best = { s: +s.toFixed(2), e: +(e / n).toFixed(2) };
        }
        aus.fov.skala = best;
        aus.fov.soll = +(Math.tan((37.5 * Math.PI) / 180) / Math.tan((46 * Math.PI) / 180)).toFixed(3);
        grund();
        r._kamFov(0, t());
        // (W) DAS KOPFWACKELN: eine Landung im Ego-Rig und das Tempo im Sichtfeld, an und aus
        const nicken = async (an) => {
            st.zugang.wackeln = an;
            st._landDip = 0;
            st._landImpactPending = 0;
            r._loopCamera(t());
            const y0 = cam.position.y;
            const vor = await schuss();
            st._landImpactPending = 8;
            r._loopCamera(t());
            const dip = +(cam.position.y - y0).toFixed(4);
            const nach = await schuss();
            r._kamFov(6, t());
            const atem = +(cam.fov - aus.fov.ruhe).toFixed(2);
            r._kamFov(0, t());
            st._landDip = 0;
            return { dip, atem, bildPx: bytes(vor, nach) };
        };
        aus.wackeln.an = await nicken(true);
        aus.wackeln.aus = await nicken(false);
        grund();
        r._loopCamera(t());
        // (U) DIE UNSCHÄRFE: die Geschichte der zeitlichen Auflösung (zugeschaltet: die Kette neu mit `_traa`), 12 Bilder Drehung
        st._traa = true;
        st.postProcessing = null;
        st.postProcessingFailed = false;
        st.traaNode = null;
        const rend = st.renderer;
        const db = rend.getDrawingBufferSize(new T.Vector2());
        const [W, H] = [Math.round(db.x), Math.round(db.y)];
        const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
        const vorOut = rend.getOutputRenderTarget();
        const q0 = cam.quaternion.clone();
        const energie = (u8) => {
            const L = luma(u8, W * H);
            let s = 0;
            for (let y = 0; y < H; y++) for (let x = 0; x + 1 < W; x++) s += Math.abs(L[y * W + x + 1] - L[y * W + x]);
            return +(s / (W * H)).toFixed(3);
        };
        rend.setOutputRenderTarget(rt);
        try {
            const lauf = async (unsch, grad) => {
                st.zugang.unschaerfe = unsch;
                cam.quaternion.copy(q0);
                cam.updateMatrixWorld(true);
                if (st._traaR) st._traaR.neu = true;
                if (st.traaNode) st.traaNode._jitterIndex = 0;
                if (st.lodUniforms && st.lodUniforms.uDitherT) st.lodUniforms.uDitherT.value = 0;
                for (let k = 0; k < 8; k++) window.__loopBild();
                for (let k = 0; k < 12; k++) {
                    cam.rotateY((grad * Math.PI) / 180);
                    cam.updateMatrixWorld(true);
                    window.__loopBild();
                }
                return energie(await window.__zielLesen(rt, W, H));
            };
            window.__loopBild(); // die Kette entsteht im ersten Bild (`_ensurePostProcessing`)
            aus.unschaerfe.kette = !!st.traaNode && !!st.traaNode._laufPx;
            await lauf(true, 0); // der Vorlauf: die Pipelines der zeitlichen Auflösung entstehen (swiftshader kompiliert sie im Bild)
            aus.unschaerfe.an = await lauf(true, 1.5);
            aus.unschaerfe.aus = await lauf(false, 1.5);
            aus.unschaerfe.ruheAn = await lauf(true, 0);
            aus.unschaerfe.ruheAus = await lauf(false, 0);
            aus.unschaerfe.laufPx = st.traaNode && st.traaNode._laufPx ? st.traaNode._laufPx.value : null;
        } finally {
            rend.setOutputRenderTarget(vorOut);
            rt.dispose();
            cam.quaternion.copy(q0);
            cam.updateMatrixWorld(true);
        }
    } finally {
        grund();
    }
    return aus;
}
// DER LAUF (im Spiel-Baum, cwd; headless): die Werkbank, dann die Klang-Linse; die Zeile „ZUGANG {…}“ und {AUS} tragen das Maß
async function zugangLauf() {
    const fs = require("fs");
    const path = require("path");
    const cp = require("child_process");
    const { werkbankTor, werkbankRuf } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const [aus, port, gruppen, sim, grenzenText, farbeText, komfortText] = process.argv.slice(1);
    const zugangGrenzen = eval("(" + grenzenText + ")");
    const W = Number(port) + 20000;
    const B = aus.replace(/\.json$/, "");
    const t0 = Date.now();
    const erg = { zeit: {} };
    const ruf = async (weg, o) => {
        const a = await werkbankRuf(W, weg, o || {});
        if (!a || a.fehler || a.roh !== undefined) throw new Error(weg + ": " + JSON.stringify(a).slice(0, 300));
        return a;
    };
    const seite = async (code) => (await ruf("/eval", { code })).ergebnis;
    const zeit = (k) => console.log("ZUGANG-SCHRITT " + k + " " + (erg.zeit[k] = Math.round((Date.now() - t0) / 1000)) + " s");
    const tor = werkbankTor(W, ["--ort", "genesis"]);
    try {
        await tor.bereit;
        for (const z of tor.log.split(/\r?\n/)) if (/^\[linse-gpu\] /.test(z)) console.log(z);
        await ruf("/umstellen", { ort: "genesis", sicht: "ego" });
        zeit("umstellen");
        if (!(await seite("return !!r.state.zugang;"))) throw new Error("kein state.zugang (der Stand kennt den Zugang nicht)");
        await ruf("/fenster", { w: 640, h: 360 });
        const f = await seite("return await (" + farbeText + ")(r, T, " + gruppen + ");");
        const teil = Buffer.from(f.teil, "base64");
        const G = Object.fromEntries(f.gruppen.map((k) => [k, "^" + k + "$"]));
        const bild = (k) => new Uint8Array(Buffer.from(f[k], "base64"));
        erg.farbe = { gruppen: f.gruppen, objekte: f.objekte, schirm: [f.W, f.H] };
        for (const [art, k] of [["aus", "aus"], ["deuteranopie", "deutan"]])
            erg.farbe[art] = {
                auge: zugangGrenzen(bild(k), teil, f.gruppen, f.W, f.H, G, null),
                deutan: zugangGrenzen(bild(k), teil, f.gruppen, f.W, f.H, G, JSON.parse(sim)),
            };
        fs.writeFileSync(B + "-farbe.json", JSON.stringify(f));
        zeit("farbe");
        await seite("r.state.zugang.farbsicht = 'aus'; return 1;");
        erg.komfort = await seite("return await (" + komfortText + ")(r, T);");
        zeit("komfort");
    } catch (e) {
        erg.fehler = String((e && e.message) || e).split("\n")[0].slice(0, 400);
    } finally {
        tor.stop();
    }
    if (!erg.fehler) {
        const kj = B + "-klang.json";
        const k = cp.spawnSync(process.execPath, ["scripts/diag-klang-zensus.cjs", "--json", kj], {
            env: Object.assign({}, process.env, { KLANG_ZENSUS_PORT: String(port) }),
            encoding: "utf8",
            maxBuffer: 64 << 20,
        });
        const z = (String(k.stdout).match(/^── \(Ü\) UNTERTITEL: (\d+) von (\d+) /m) || []).slice(1).map(Number);
        let rot = [];
        try {
            rot = (JSON.parse(fs.readFileSync(kj, "utf8")).rot || []).filter((x) => /^Ü /.test(x));
        } catch (_e) {
            rot = ["keine JSON der Klang-Linse (Exit " + k.status + ")"];
        }
        erg.untertitel = z.length === 2 ? { n: z[0], von: z[1], rot, exit: k.status } : { fehler: "keine Zeile (Ü) UNTERTITEL (Exit " + k.status + ")", rot };
        zeit("untertitel");
    }
    console.log("ZUGANG " + JSON.stringify(erg));
    fs.writeFileSync(aus, JSON.stringify(erg, null, 1));
}
// DAS URTEIL: (F) jede Grenze der Farbsicht ΔE ≥ 10 unter Machado-Deuteranopie, mindestens zwei Grenzen im Bild, die Farbsicht ändert das
// Bild (das Mittel der Grenzen hebt sich gegen „aus“); (K) Menü · Stand · Sichtfeld · Kopfwackeln · Unschärfe je beim Namen; (Ü) n von n
function zugangUrteil(e) {
    if (!e) return { gruen: false, zahl: "keine Zeile ZUGANG" };
    if (e.fehler) return { gruen: false, zahl: "Lauf: " + e.fehler };
    const rot = [];
    const F = e.farbe || {};
    const gilt = (g) => g.n >= ZUGANG_GRENZE_N;
    const [vor, nach] = [((F.aus || {}).deutan || []).filter(gilt), ((F.deuteranopie || {}).deutan || []).filter(gilt)];
    const min = (l) => (l.length ? Math.min(...l.map((g) => g.dE)) : null);
    if (nach.length < 2) rot.push("F: " + nach.length + " Klassen-Grenzen im Bild (Soll ≥ 2)");
    for (const g of nach) if (!(g.dE >= 10)) rot.push("F: " + g.grenze + " ΔE " + g.dE + " < 10");
    const mittel = (l) => l.reduce((s, g) => s + g.dE, 0) / Math.max(1, l.length);
    if (!(mittel(nach) > mittel(vor) + 0.5)) rot.push("F: die Farbsicht hebt die Grenzen nicht (Mittel " + mittel(vor).toFixed(1) + " → " + mittel(nach).toFixed(1) + ")");
    const K = e.komfort || {};
    if (!K.menue) rot.push("K: keine Komfort-Probe" + (K.fehler ? " (" + K.fehler + ")" : ""));
    else {
        const M = K.menue;
        if (["aus", "deuteranopie", "protanopie", "tritanopie"].some((a) => !(M.arten || []).includes(a))) rot.push("M: die Farbsicht-Wahl trägt " + JSON.stringify(M.arten));
        if (M.farbsicht !== "tritanopie" || M.fov !== 92 || M.wackeln !== false || M.unschaerfe !== false) rot.push("M: das Menü schreibt den Stand nicht " + JSON.stringify(M));
        const S = K.stand || {};
        const soll = { farbsicht: "tritanopie", fov: 100, wackeln: false, unschaerfe: false };
        if (JSON.stringify(S.snapshot) !== JSON.stringify(Object.assign({}, soll, { fov: 92 }))) rot.push("S: der Snapshot trägt " + JSON.stringify(S.snapshot));
        if (JSON.stringify(S.geladen) !== JSON.stringify(soll)) rot.push("S: geladen " + JSON.stringify(S.geladen));
        if (JSON.stringify(S.menue) !== JSON.stringify(soll)) rot.push("S: das Menü zeigt nach dem Laden " + JSON.stringify(S.menue));
        const V = K.fov || {};
        if (V.ruhe !== 75 || V.wahl !== 92) rot.push("V: Sichtfeld " + V.ruhe + " → " + V.wahl + " (Soll 75 → 92)");
        if (!V.skala || Math.abs(V.skala.s - V.soll) > 0.03) rot.push("V: das Bild skaliert " + JSON.stringify(V.skala) + " (Soll " + V.soll + ")");
        const Wa = K.wackeln || {};
        const [an, ab] = [Wa.an || {}, Wa.aus || {}];
        if (!(an.dip < -0.02 && an.atem > 0 && an.bildPx > 0)) rot.push("W: an nickt nicht " + JSON.stringify(an));
        if (!(ab.dip === 0 && ab.atem === 0 && ab.bildPx === 0)) rot.push("W: aus nickt " + JSON.stringify(ab));
        const U = K.unschaerfe || {};
        if (!U.kette) rot.push("U: keine zeitliche Auflösung mit _laufPx");
        else {
            if (!(U.aus >= 1.05 * U.an)) rot.push("U: aus " + U.aus + " gegen an " + U.an + " (Soll ≥ 1,05 ×)");
            if (!(Math.abs(U.ruheAus - U.ruheAn) <= 0.02 * U.ruheAn)) rot.push("U: in Ruhe " + U.ruheAn + " gegen " + U.ruheAus + " (Soll gleich ± 2 %)");
        }
    }
    const Ue = e.untertitel || {};
    if (!(Ue.von > 0 && Ue.n === Ue.von && !(Ue.rot || []).length)) rot.push("Ü: " + (Ue.fehler || Ue.n + " von " + Ue.von) + ((Ue.rot || []).length ? " · " + Ue.rot.slice(0, 2).join(" · ") : ""));
    const k = K.menue ? K : {};
    return {
        gruen: rot.length === 0,
        zahl:
            (rot.length ? "ROT: " + rot.slice(0, 4).join(" · ") + " — " : "") +
            "Farbsicht: " + nach.length + " Grenzen, ΔE min " + min(nach) + " (vorher " + min(vor) + ") unter Machado-Deuteranopie [" +
            nach.map((g) => g.grenze + " " + g.dE).join(", ") + "] · Sichtfeld " + (k.fov || {}).ruhe + "→" + (k.fov || {}).wahl + "°, Skala " +
            ((k.fov || {}).skala || {}).s + " (Soll " + (k.fov || {}).soll + ") · Wackeln an " + JSON.stringify((k.wackeln || {}).an) + " aus " +
            JSON.stringify((k.wackeln || {}).aus) + " · Unschärfe an " + (k.unschaerfe || {}).an + " aus " + (k.unschaerfe || {}).aus + " · Untertitel " +
            Ue.n + " von " + Ue.von,
    };
}

// DIE PROBEN von spielgang.K4#2: ZUGANG_ROH ist die Messung am Zweig w15-farbsicht 1c (swiftshader, Genesis-Ort, 7,2 min); die Mutanten nennen ihren Täter
const ZUGANG_ROH = {"zeit":{"umstellen":88,"farbe":159,"komfort":325,"untertitel":434},"farbe":{"gruppen":["gras","boden","bau","fels","laub","wasser"],"objekte":[4,1,31,2,36,0],"schirm":[640,360],"aus":{"deutan":[{"grenze":"gras|boden","n":902,"dE":28.04},{"grenze":"gras|bau","n":1024,"dE":17.67},{"grenze":"gras|laub","n":59,"dE":39.39},{"grenze":"boden|bau","n":345,"dE":16.92},{"grenze":"boden|laub","n":47,"dE":20.03},{"grenze":"bau|laub","n":1515,"dE":26.42}]},"deuteranopie":{"deutan":[{"grenze":"gras|boden","n":902,"dE":19.54},{"grenze":"gras|bau","n":1024,"dE":20.04},{"grenze":"gras|laub","n":59,"dE":29.4},{"grenze":"boden|bau","n":345,"dE":29.94},{"grenze":"boden|laub","n":47,"dE":23.88},{"grenze":"bau|laub","n":1515,"dE":31.32}]}},"komfort":{"menue":{"arten":["aus","deuteranopie","protanopie","tritanopie"],"farbsicht":"tritanopie","fov":92,"wackeln":false,"unschaerfe":false},"stand":{"snapshot":{"farbsicht":"tritanopie","fov":92,"wackeln":false,"unschaerfe":false},"geladen":{"farbsicht":"tritanopie","fov":100,"wackeln":false,"unschaerfe":false},"menue":{"farbsicht":"tritanopie","fov":100,"wackeln":false,"unschaerfe":false}},"fov":{"ruhe":75,"wahl":92,"skala":{"s":0.74,"e":8.21},"soll":0.741},"wackeln":{"an":{"dip":-0.0791,"atem":6,"bildPx":43195},"aus":{"dip":0,"atem":0,"bildPx":0}},"unschaerfe":{"kette":true,"an":3.639,"aus":12.453,"ruheAn":7.792,"ruheAus":7.85,"laufPx":4}},"untertitel":{"n":45,"von":45,"rot":[],"exit":1}};
const zugangRoh = (aendern) => "[linse-gpu] google/swiftshader\nZUGANG " + JSON.stringify(aendern(JSON.parse(JSON.stringify(ZUGANG_ROH))));
const ZUGANG_PROBEN = [
    { name: "die Messung am Zweig w15-farbsicht (swiftshader)", stdout: zugangRoh((x) => x), gruen: true },
    { name: "der Modus aus: das Bild der Farbsicht gleicht dem ohne (main)", stdout: zugangRoh((x) => ((x.farbe.deuteranopie = x.farbe.aus), x)), gruen: false },
    { name: "eine Grenze unter ΔE 10", stdout: zugangRoh((x) => ((x.farbe.deuteranopie.deutan[1].dE = 9.4), x)), gruen: false },
    { name: "nur eine Grenze im Bild", stdout: zugangRoh((x) => ((x.farbe.deuteranopie.deutan = x.farbe.deuteranopie.deutan.slice(0, 1)), x)), gruen: false },
    { name: "das Menü schreibt den Stand nicht", stdout: zugangRoh((x) => ((x.komfort.menue.fov = null), x)), gruen: false },
    { name: "der Lader klemmt das Sichtfeld nicht", stdout: zugangRoh((x) => ((x.komfort.stand.geladen.fov = 140), x)), gruen: false },
    { name: "das Sichtfeld steht fest (KAM_FOV_GRAD)", stdout: zugangRoh((x) => ((x.komfort.fov.wahl = 75), (x.komfort.fov.skala = { s: 1, e: 0 }), x)), gruen: false },
    { name: "Kopfwackeln aus nickt weiter", stdout: zugangRoh((x) => ((x.komfort.wackeln.aus = x.komfort.wackeln.an), x)), gruen: false },
    { name: "Unschärfe aus zieht weiter nach", stdout: zugangRoh((x) => ((x.komfort.unschaerfe.aus = x.komfort.unschaerfe.an), x)), gruen: false },
    { name: "eine Stimme ohne Untertitel", stdout: zugangRoh((x) => ((x.untertitel = { n: 38, von: 39, rot: ["Ü ruf:wolf ohne Zeile"], exit: 1 }), x)), gruen: false },
    { name: "main: der Stand kennt keinen Zugang", stdout: "ZUGANG " + JSON.stringify({ zeit: {}, fehler: "kein state.zugang (der Stand kennt den Zugang nicht)" }), gruen: false },
];
const stationen = [
    // ───────── fahrzeug.K3 — die Kamera atmet das Tempo ─────────
    {
        kriterium: "fahrzeug.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // Garage: gate:garage-labor mit dem Mess-Patch bei vmax (bericht/2110-mk-kopf/garage-mk.diff, Zeile MK2110); Welt: der GT
        // auf freier Bahn an der Mess-Wiese, Third, Vollgas (bericht/3010-heil-fahrzeug/tempo4.js über werkbank eval, M27).
        // DIE BAHN IST FREI, WEIL DIE WELT SIE FREI HÄLT (w4-heil-fahrzeug, 30.10.): tempo3.js prüfte nur die Hüllen der Bauten —
        // die Natur, die das Feld erst wirft, wenn der Spieler naht, und ein Baum mit wartender Gestalt (K20) standen nicht in ihr; der
        // Wagen fuhr in sie, und das Tempo am Stoß hieß „top" (Radeon-Sitzung 715754fc 13,26 m/s, FOV +7,6°; Null-Renderer an
        // 98ef98bb und 715754fc gleich: Stoß nach 35,5 m an Felsbogen und Kiefer, 13,77 m/s, FOV +8,06°, Arm +15,6 %). tempo4.js legt
        // den Weg der Probe über die Bahn (die Welt räumt die Natur auf ihm), das Gas endet am Plateau der Sim-Zeit, ein Stoß endet
        // es beim Namen (Ende ≠ ok). Null-Renderer 715754fc: Plateau nach 7,9 Sim-s, 15,18 m/s, FOV +9,47°, Arm +18,4 %.
        // IN DER SITZUNG (29.10.): die Garage (eigenes Labor auf {PORT}+20001) läuft NEBEN dem Ritt in der Welt der Sitzung, ihre Zeilen
        // danach; der Patch fällt vor und nach ihr. Der GT und der Weg der Probe bleiben in der Welt (mutiert). Den GT nimmt die
        // Grundstellung zurück (das Werk im Stand), den Weg nicht: `_stlWegeBuild` schreibt die Wege-Karte, das Speicher-Gesetz trägt sie
        // nicht (`_standRueckspielen`) — nur die Tür nach einem Abbruch lädt sie neu. Die mutierenden Proben danach (die Reihe der
        // Sitzung, darunter der Gang des Profi-Bands an der Wiese) stehen sonst neben dem 40-m-Weg (offen am Merge w4-koord-sitzung)
        // DIE GARAGE IM BROWSER DER SITZUNG, DIE WELT BIS ZUM PLATEAU (proben-schnell 30.10., `probeTempoGarage` oben): kein eigener
        // Chrome mehr neben der Welt, kein Doppel von Orbit, Drift und Schüssen (die misst die 2)
        // DER DECKEL (w4-proben-tempo2): GTX e0139769 38,9 s, davon das Einschwingen nach dem Sprung an W0 17,9 s — es liegt jetzt VOR dem
        // Deckel (die Sitzung stellt die Mess-Wiese); die GTX geschätzt ≈ 23 s (der Ritt, die Garage 15 s daneben): ⌈1,5 × 25⌉ ≈ 40 s. Die
        // Radeon 7521ca51 riss unter fremder Last (eine Werkbank swiftshader auf ~10 Kernen) die Frist des Ritts (19 s) — UNGEMESSEN, nie ROT
        probe: { ...TEMPO_GARAGE_PROBE, mutiert: true, sek: 42 },
        env: K,
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const g = jsonZeile(teil("GARAGE"), /^MK2110 /);
            const b = jsonBlock(teil("WELT"));
            const w = b && (b.ergebnis || b);
            if (!g || !g.ruhe || !g.top) return { gruen: false, zahl: "Garage: keine Zeile MK2110 (Exit " + lauf.exit + ")" };
            if (!w || !w.top || w.fehler) return { gruen: false, zahl: "Welt: kein Ergebnis von tempo4.js" + (w && w.fehler ? " — " + w.fehler : "") };
            const gFov = g.top.fov - g.ruhe.fov;
            const gArm = g.top.arm / g.ruhe.arm - 1;
            const gruen = w.ende === "ok" && gFov >= 8 && gArm >= 0.15 && w.top.fovPlus >= 8 && w.top.armPlus >= 0.15;
            return {
                gruen,
                zahl:
                    "Garage FOV +" + gFov.toFixed(2) + "° Arm +" + (gArm * 100).toFixed(1) + " % bei " + Number(g.top.v).toFixed(2) + "/" +
                    Number(g.top.vmax).toFixed(2) + " m/s · Welt FOV +" + w.top.fovPlus + "° Arm +" + (w.top.armPlus * 100).toFixed(1) +
                    " % bei " + w.top.v + " m/s (Ende " + w.ende + ")",
            };
        },
        pfad: [...FAHRT, "worlds/garage/**", "scripts/diag-garage-labor.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = FOV (+≥ 8°) und Arm (+≥ 15 %) aus v/vmax in Garage UND Welt gemessen",
    },
    {
        kriterium: "fahrzeug.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // die Zusätze der 2: Drift, Rückkehr (tempo4.js in der Welt, auf dem Weg der Probe), Ruck (gate:fahr-leben T4) und EIN
        // FOV-Schreiber (T5)
        // IN DER SITZUNG (29.10.): EIN Lauf mit fahrzeug.K4#1/#2 (FAHR_SITZUNG, Zwillinge)
        probe: { ...FAHR_SITZUNG,  mutiert: true },
        env: K,
        gpu: true,
        zeit: true, // das Urteil fällt an der Wanduhr: Rückkehr in s nach dem Orbit, Ruck p95 je Bild (pm-fremdlast)
        minuten: 8,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const t4 = jsonZeile(teil("FAHR"), /^\s*(✅|❌) T4 /);
            const t5 = jsonZeile(teil("FAHR"), /^\s*(✅|❌) T5 /);
            const b = jsonBlock(teil("WELT"));
            const w = b && (b.ergebnis || b);
            if (!t4 || !t5) return { gruen: false, zahl: "gate:fahr-leben ohne Zeile T4/T5 (Exit " + lauf.exit + ")" };
            if (!w || !w.drift || !w.rueck || w.fehler) return { gruen: false, zahl: "Welt: kein Ergebnis von tempo4.js" + (w && w.fehler ? " — " + w.fehler : "") };
            const d = w.drift;
            const r = w.rueck.rueckS;
            const schreiber = t5.schreiber || [];
            const gruen =
                w.ende === "ok" && w.phasen && w.phasen.drift === "drift" && d.bilder >= 100 && d.kameraGegenFahrtMax <= 15 &&
                r >= 1 && r <= 1.5 && t4.ruckP95 <= 0.02 && t4.ruckN >= 100 && schreiber.length === 1;
            return {
                gruen,
                zahl:
                    "Drift Kamera ≤ " + d.kameraGegenFahrtMax + "° neben dem Fahrtvektor (Schlupf bis " + d.schlupfMax + "°) · Rückkehr " + r +
                    " s nach " + w.rueck.orbitGrad + "° Orbit · Ruck p95 " + t4.ruckP95 + " m (" + t4.ruckN + ") · FOV-Schreiber [" + schreiber + "]" +
                    (w.ende === "ok" ? "" : " · Ende " + w.ende),
            };
        },
        pfad: [...FAHRT, "scripts/diag-fahr-leben.cjs", "scripts/lib/fahr-proben.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "2 = dazu Azimut auf dem Fahrtvektor im Drift (Fehler ≤ 15°), Maus-Orbit mit Rückkehr nach 1–1,5 s, seitlicher Ruck p95 ≤ 0,02 m je Bild, EIN FOV-Schreiber",
    },

    // ───────── fahrzeug.K4 — Übergänge unter Bewegung ─────────
    ...[1, 2].map((staffel) => ({
        kriterium: "fahrzeug.K4",
        staffel,
        geraet: ["radeon", "gtx"],
        // gate:fahr-leben T4 (Absteigen in Fahrt, Azimut nach 10 Bildern) + der Blick im Bild am Steilhang bergab, Third → Ego →
        // Third (bericht/2010-buendel-abab/blick.js über werkbank eval, M8): der GT in den Bildern 1–3 nach dem Wechsel
        // IN DER SITZUNG (29.10.): EIN Lauf mit fahrzeug.K3#2 (FAHR_SITZUNG, Zwillinge)
        probe: { ...FAHR_SITZUNG,  mutiert: true },
        env: K,
        gpu: true,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const z = jsonZeile(teil("FAHR"), /^\s*(✅|❌) T4 /);
            const b = jsonBlock(teil("BLICK"));
            const e = b && (b.ergebnis || b);
            if (!z) return { gruen: false, zahl: "gate:fahr-leben ohne Zeile T4 (Exit " + lauf.exit + ")" };
            if (!e || e.fehler || !Array.isArray(e.bilder)) return { gruen: false, zahl: "Blick: kein Ergebnis" + (e && e.fehler ? " — " + e.fehler : "") };
            const nach = e.bilder.filter((x) => /^[345]-third/.test(x.name));
            const stufe = (x) => Math.max(0, ...Object.values(x.stufen || {}).filter(Boolean).map((s) => s.dmaxM));
            const sprung = Math.max(...(z.abSprung || [Infinity]));
            const az10 = Math.max(...(z.nach10 || [Infinity]));
            const gruen =
                /^\s*✅ T4 /m.test(teil("FAHR")) && sprung <= 0.5 && az10 <= 10 && e.ende === "ok" && e.mount === true && nach.length === 3 &&
                nach.every((x) => x.imBild === true && x.azimutGegenKursGrad <= 10 && stufe(x) <= 2);
            return {
                gruen,
                zahl:
                    "nach Ego → Third im Bild " + nach.filter((x) => x.imBild).length + "/" + nach.length + ", Azimut " +
                    nach.map((x) => x.azimutGegenKursGrad).join("/") + "°, Stufe ≤ " + Math.max(0, ...nach.map(stufe)) + " m · T4 Absteigen " +
                    sprung + " m je Bild, Azimut nach 10 Bildern " + az10 + "° · Hang " + (e.steil ? e.steil.neigung : "?") + "°",
            };
        },
        pfad: [...FAHRT, "stamm/siedlung-bauten.js", "stamm/siedlung-satz.js", "scripts/diag-fahr-leben.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: staffel === 1 ? "1 = an einem Gerät im Bild gehalten" : "2 = an beiden Geräten im Bild, und bei jeder neuen vmax-Stufe neu gemessen",
    })),

    // ───────── siedlung.K2 — die Stadt in Reichweite (Zweig stadt-tor-k2: Rang-Gesetz im fachwerk-core, Mauer im Export) ─────────
    // Teil Z der Siedlungs-Linse (`diag-settlement --nur-z`, Node, 8 Saaten × zufälliger Spawn, Auto-Zellen binnen 2 km) und das
    // Bild der nächsten Stadt aus dem Ausgabe-Pfad am Boot-Seed (Abnahme-Urteil des Beweisbilds). An main: Z1 0/8 (ROT).
    // IN DER SITZUNG (29.10.): EIN Lauf mit Staffel 2 (SIEDLUNG_SITZUNG, Zwillinge) — das Bild mittags ist das der Staffel 1 ({AUS}.mittag)
    {
        kriterium: "siedlung.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: { ...SIEDLUNG_SITZUNG,  mutiert: true },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const teil = (n) => out.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const z = /^\s*(✅|❌) Z1 RANG: binnen 2 km eine ummauerte Stadt in (\d+)\/8 Saaten/m.exec(out);
            const zOk = !!z && z[1] === "✅" && +z[2] >= 6;
            const wb = jsonBlock(teil("WAHL"));
            const w = (wb && wb.ergebnis) || {};
            const sb = jsonBlock(teil("STAND"));
            const s = (sb && sb.ergebnis) || {};
            const kb = jsonBlock(teil("KAMERA"));
            const k = (kb && kb.ergebnis) || {};
            const steht = s.mauer > 0 && !s.zug && !s.pending;
            // das Beweisbild mittags ({AUS}.mittag des gemeinsamen Laufs; ein {AUS} ohne mittag ist das Bild selbst)
            const b1 = j && j.mittag !== undefined ? j.mittag : j;
            const bild = !!b1 && b1.ok === true;
            const gruen = zOk && steht && !k.fehler && k.segs > 0 && k.hoeher > 0 && bild;
            return {
                gruen,
                zahl:
                    "Z1 " + (z ? z[2] + "/8 Saaten" : "keine Zeile") + " · Boot-Seed " + w.seed + ": Stadt " +
                    (w.wahl ? w.wahl.cx + "," + w.wahl.cz + " nH " + w.wahl.nH + " " + w.wahl.d + " m vom Genesis-Ort" : "keine mit Ort") +
                    " · Mauer " + (k.segs != null ? k.segs + " Segmente/" + k.tuerme + " Türme" : k.fehler || "?") + ", Pool " + s.mauer +
                    (s.zug ? ", Zug läuft" : "") + " · Schuss vom " + k.art + " " + k.d + " m vor der Mitte, " + k.hoeher + " m höher · " +
                    (b1 && b1.zeile ? b1.zeile.slice(0, 120) : "ohne Abnahme (Exit " + lauf.exit + ")"),
            };
        },
        pfad: [
            "fachwerk-core.js",
            "stamm/siedlung-ort.js",
            "stamm/siedlung-satz.js",
            "stamm/siedlung-bauten.js",
            "stamm/studio-bruecke.js",
            "worlds/fachwerk/fachwerk.js",
            "save-server.js",
            "scripts/diag-settlement.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "spec/asset-contract/v6/golden/siedlung.json",
        ],
        quelle: "1 = in ≥ 6 von 8 Saaten mit zufälligem Spawn steht binnen 2 km eine ummauerte Stadt (Auto-Zellen, nie Chat), sichtbar vom Hügel an einem Gerät",
    },

    // siedlung.K2 Staffel 2 (Zweig sk2-zipf): der Zipf-Fit der Siedlungs-Linse (`diag-settlement --zipf`: ζ nach Gabaix-Ibragimov
    // über die Orte ab der ersten Rang-Stufe je 32 × 32 km um einen zufälligen Spawn, das Intervall [kleinste, größte] über
    // 8 Saaten, dazu Mauer und Graph im Export der Stadt jeder Saat) und die Stadt vom Hügel wie in Staffel 1, geschossen
    // mittags (Uhr 0,5) und in der Dämmerung (Uhr 0,25, die Stunde der Licht-Linsen); {AUS} trägt beide Abnahmen. Ohne den Modus
    // endet `--nur-z` nach Teil Z, die Zeile fehlt: ROT. An sk2-zipf (Node): ζ 1,329 [1,294; 1,384], Mauer und Graph 7/7 — ROT,
    // die oberste Rang-Stufe endet bei 4 · 96 Häusern (eine dritte Stufe desselben Gesetzes: ζ 1,091 [1,06; 1,154]).
    {
        kriterium: "siedlung.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { ...SIEDLUNG_SITZUNG,  mutiert: true },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const teil = (n) => out.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            // Zipf-Exponent 0,8–1,2 mit Konfidenz-Intervall: das ganze Intervall im Band; der Export jeder Stadt trägt Mauer und Graph
            const z = jsonZeile(out, /^ZIPF /);
            const ex = /^Mauer und Graph (\d+)\/(\d+)$/.exec((z && z.export) || "");
            const zipf = !!z && Array.isArray(z.ki) && z.ki[0] >= 0.8 && z.ki[1] <= 1.2;
            const mauerGraph = !!ex && +ex[1] > 0 && ex[1] === ex[2];
            const wb = jsonBlock(teil("WAHL"));
            const w = (wb && wb.ergebnis) || {};
            const sb = jsonBlock(teil("STAND"));
            const s = (sb && sb.ergebnis) || {};
            const kb = jsonBlock(teil("KAMERA"));
            const k = (kb && kb.ergebnis) || {};
            const steht = s.mauer > 0 && !s.zug && !s.pending;
            // mittags und in der Dämmerung: je Stunde das Beweisbild grün UND zu ihr geschossen (die Bühne trägt die Uhr)
            const bild = (b, uhr) => !!b && b.ok === true && !!b.buehne && Math.abs(b.buehne.uhr - uhr) < 0.01;
            const [mi, da] = [j && j.mittag, j && j.daemmerung];
            const gruen = zipf && mauerGraph && steht && !k.fehler && k.segs > 0 && k.hoeher > 0 && bild(mi, 0.5) && bild(da, 0.25);
            const zeile = (b) => (b ? (b.zeile || "").slice(0, 60) + " Uhr " + (b.buehne && b.buehne.uhr) : "fehlt");
            return {
                gruen,
                zahl:
                    "ZIPF " + (z ? "ζ " + z.zeta + " [" + z.ki.join("; ") + "] über " + (z.je || []).length + " Saaten, " + z.export : "keine Zeile") +
                    " · Boot-Seed " + w.seed + ": Stadt " + (w.wahl ? w.wahl.cx + "," + w.wahl.cz + " nH " + w.wahl.nH : "keine mit Ort") +
                    " · Mauer " + (k.segs != null ? k.segs + " Segmente, Pool " + s.mauer : k.fehler || "?") + (s.zug ? ", Zug läuft" : "") +
                    " · mittags " + zeile(mi) + " · Dämmerung " + zeile(da) + " (Exit " + lauf.exit + ")",
            };
        },
        pfad: [
            "fachwerk-core.js",
            "stamm/siedlung-ort.js",
            "stamm/siedlung-satz.js",
            "stamm/siedlung-bauten.js",
            "stamm/studio-bruecke.js",
            "stamm/bild-himmel.js",
            "worlds/fachwerk/fachwerk.js",
            "save-server.js",
            "scripts/diag-settlement.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "spec/asset-contract/v6/golden/siedlung.json",
        ],
        quelle: "2 = Zipf-Exponent 0,8–1,2 über 32 × 32 km mit Konfidenz-Intervall, Export trägt mauer und graph, mittags und in der Dämmerung, beide Geräte",
    },

    // ───────── siedlung.K1 — das Haus von innen ─────────
    {
        kriterium: "siedlung.K1",
        staffel: 1,
        geraet: "headless",
        // gate:haus-welt W10 DER SPIELGANG (Null-Renderer, R3): EIN Gang per W-Taste über _stepFixedSim von 1 m vor der Tür bis
        // Keller und Dachboden, je Sim-Schritt der Hub; die Phase haus allein (W1 W2 W4c W5 W10 je Haus)
        befehl: ["node", "scripts/diag-haus-welt.cjs", "--phasen=haus"],
        env: { HAUS_WELT_PORT: "{PORT}", HAUS_WELT_JSON: "{AUS}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j) => {
            if (!j || !Array.isArray(j.haeuser)) return { gruen: false, zahl: "kein HAUS_WELT_JSON mit haeuser" };
            const g = j.haeuser.filter((h) => !h.fehler && h.gang);
            const ganz = g.filter((h) => h.gang.keller && h.gang.dach && !h.gang.fehlt.length && h.gang.hub <= 0.3);
            const hub = g.filter((h) => !(h.gang.hub <= 0.3));
            const gruen = ganz.length >= 1 && hub.length === 0;
            return {
                gruen,
                zahl:
                    ganz.length + " von " + g.length + " Gängen Tür → Keller → Dachboden ganz, Hub max " +
                    Math.max(0, ...g.map((h) => h.gang.hub)).toFixed(2) + " m, Anti-Clip-Hub " + hub.length +
                    (hub.length ? " (" + hub.map((h) => h.typ + " " + h.gang.wo).join(" · ") + ")" : ""),
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/dirigent-takt.js",
            "stamm/daten.js",
            "fachwerk-core.js",
            "foundry-core.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/lib/welt-boot.cjs",
            "stamm/kreatur-*.js",
            "stamm/vegetation-baum.js",
        ],
        quelle: "1 = der Spieler geht durch die Tür bis Keller und Dachboden ohne Vertikal-Sprung > 0,3 m in einem Frame (Anti-Clip-Hub = ROT), an einem Haus",
    },
    // siedlung.K1 Staffel 2 (Zweig siedlung-k1-innen): ZWEI Läufe von gate:haus-welt. (1) W10 headless, Phasen haus + start: der
    // Takt der Welt hebt das Start-Dorf, gegangen wird JEDES Haus seines Plans (der Plan v2 im Gedächtnis des Orts unter
    // `settlementCells.start.ort`, je Haus-Slot das Haus an seinem Ort; ein Slot ohne Haus ist ROT) von der Tür bis Keller und
    // Dachboden, je Sim-Schritt der Hub. (2) `--bild` auf der Karte (Rezept linse, `[linse-gpu]`): W9 schießt je Haus des
    // Start-Dorfs seine Innen-Blicke aus dem Ausgabe-Pfad (das Auge 1,3 m über der Diele), W10 dazu den Boden im Schatten
    // zur selben Stunde (Mittag der Bühne; von DIESEM Haus gegen die Sonne der erste Boden 1 m vor jedem Bau, dessen Strahl
    // zur Sonne einen Werfer trifft). Die Quote: dunkelster Innen-Blick ÷ Schatten-Fleck außen, Median der Luminanz (sRGB
    // linear), Soll ≥ 0,15 je Haus. Die Cloud (swiftshader) trägt den echten Renderer nicht bis zum Bild (Ankunft 79, Karten 3 offen nach
    // 28 066 Takten) — das Urteil fällt an Radeon und GTX. Erwartet: Quote ≥ 0,4 (M41, Radeon 23.10.: Innen-Median 0,017–0,177;
    // Schatten-Boden 0,014–0,034 im Radeon-Bild bericht/1110-5/bilder/dorf-an.png). Headless am Zweig: 18 von 18 Häusern ganz.
    // IN DER SITZUNG (29.10., `startDorfInnen`): beide Messungen je Haus des Start-Dorfs in der Welt der Sitzung (der Gang über den
    // Sim-Schritt, das Innen-Bild aus dem Ausgabe-Pfad), EIN Lauf statt zweier Linsen-Browser.
    {
        kriterium: "siedlung.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // mutiert (w4-linsen-a): die Probe hebt das Start-Dorf (`__anazhAutoSettlement` an, bis seine Zelle steht) — der Bau der Welt
        // nannte sie (Radeon 379e5f56: werke +14 · orte +start · wege +53)
        // DER DECKEL 45 s BLEIBT (w12-proben-frist, Radeon 8ef49bef): nach dem Heil des Wandkontakt-Fensters gehen alle 18 Häuser ihren Gang
        // in der Frist 39 s; die 18 Innen-Bilder kosten je ≈ 6 s — mit 90 s Deckel standen 8 von 18 (Median 0,098), 18 Gänge und 18 Bilder
        // brauchen ≈ 143 s, über dem Gesetz von 90 s: ungemessen beim Namen, bis ein Bild weniger kostet
        probe: { ...START_DORF_PROBE, mutiert: true, sek: 33 },
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j) => {
            if (!j || !j.startDorf || !Array.isArray(j.haeuser))
                return { gruen: false, zahl: "keine Ausgabe des Start-Dorfs (Gang und Innen-Bild)" + (j && j.fehler ? " — " + j.fehler : "") };
            const sd = j.startDorf;
            const gaenge = j.haeuser.filter((h) => !h.fehler && h.gang);
            const ganz = gaenge.filter((h) => !h.gang.fehlt.length && h.gang.hub <= 0.3);
            const innen = j.haeuser.filter((h) => Number.isFinite(h.quote));
            const dunkel = j.haeuser.filter((h) => !(h.quote >= 0.15));
            const q = innen.map((h) => h.quote).sort((x, y) => x - y);
            const gruen = sd.slots >= 1 && !sd.fehlt.length && ganz.length === sd.slots && j.haeuser.length === sd.slots && !dunkel.length;
            return {
                gruen,
                zahl:
                    ganz.length + " von " + sd.slots + " Häusern des Start-Dorfs Tür → Keller → Dachboden ganz, Hub max " +
                    Math.max(0, ...gaenge.map((h) => h.gang.hub)).toFixed(2) + " m" + (sd.fehlt.length ? " (ohne Haus: " + sd.fehlt.join(" ") + ")" : "") +
                    " · Innen-Bild " + (j.haeuser.length - dunkel.length) + " von " + j.haeuser.length + " lesbar (Plan " + sd.slots +
                    "), innen ÷ Außen-Schatten min " + q[0] + " · Median " + q[q.length >> 1] + " (Soll ≥ 0,15)" +
                    (dunkel.length ? " · dunkel: " + dunkel.map((h) => h.typ + " " + h.innen + "/" + h.aussen + (h.bildFehlt ? " (" + h.bildFehlt + ")" : "")).join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-*.js",
            "stamm/bild-*.js",
            "stamm/stoff-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "fachwerk-core.js",
            "foundry-core.js",
            "scripts/werkbank.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "stamm/kreatur-*.js",
            "stamm/vegetation-*.js",
        ],
        quelle: "2 = jedes Haus des Start-Dorfs, Innenraum lesbar (Luma ≥ 15 % des Außen-Schattens, Schatten K4), beide Geräte",
    },

    // ───────── siedlung.K5 — das erste Haus steht sofort (M36, die Stufe am Abstand) ─────────
    // Station dorf wie M36: Werkbank --echt --ort dorf, Regler frei, die Zelle −4,−6 per Zell-Info nH 12 bzw. 300, der Spieler geht mit
    // 4 m/s ab 450 m durch den Vorlauf-Ring, bis sie erwacht; je nH ein frischer Boot. Gezählt: Erwachen → erstes Haus der Zelle im
    // Kegel, gezeichnet in der Stufe, die seine Studio-Kette für seinen Abstand wählt — in der Mesh-Zone sein Mesh, dahinter die Hülle
    // seines Gesetzbuchs im Welt-March (fernform "huelle"); der Feld-Satz einer Brücke in der Mesh-Zone zählt nie —, dazu der Bau-Hash
    // (bericht/2410-siedlung-k5/m36-stufe.js = artifacts/siedlung-k5/m36-stufe.js; `erstesMesh` trägt die alte Lesung mit).
    // IN DER SITZUNG (29.10., `dorfErwachen`): die Welt der Sitzung (die Kälte misst der EINE Start der Sitzung), der Spieler im
    // Vorlauf-Ring statt 450 m Anmarsch, das Ende am ersten Haus; nH 300 in einer frischen Welt (Grundstellung).
    ...[1, 2].map((staffel) => ({
        kriterium: "siedlung.K5",
        staffel,
        geraet: ["radeon", "gtx"],
        probe: { ...DORF_PROBE, mutiert: true, sek: 31 },
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const je = [12, 300].map((nh) => {
                const b = jsonBlock(teil("NH" + nh));
                const e = b && (b.ergebnis || b);
                if (!e || e.fehler) return { nh, ok: false, text: "nH " + nh + ": kein Ergebnis" + (e && e.fehler ? " — " + e.fehler : "") };
                const ms = e.erstes ? e.erstes.ms : null;
                return {
                    nh,
                    ok: ms != null && ms <= 500 && !!e.hash,
                    text: "nH " + nh + " erstes Haus nach " + (ms == null ? "—" : ms + " ms") + " (" + (e.erstes ? e.erstes.typ + ", " + e.erstes.stufe + " in " + e.erstes.abstand + " m" : "kein Haus") + ", Bau-Hash " + e.hash + ")",
                };
            });
            return { gruen: je.every((x) => x.ok), zahl: je.map((x) => x.text).join(" · ") };
        },
        pfad: [...DORF, "stamm/stoff-instanz.js", "stamm/studio-*.js", "stamm/vegetation-baum.js", "scripts/lib/welt-orte.cjs"],
        quelle:
            staffel === 1
                ? "1 = erstes Haus sichtbar ≤ 0,5 s nach dem Erwachen der Zelle, unabhängig von nH (12 gegen 300), als Studio-L-Kette (Bau-Hash im Bild), an einem Gerät"
                : "2 = beide Geräte",
    })),

    // ───────── siedlung.K3 — die Gassen folgen dem Grund am Ort des Plans (Zweig siedlung-k3-trasse) ─────────
    // gate:settlement C-K3 (Browser, Null-Renderer, ≤ 3 min): die drei Vorräte am Mess-Ort dorf, das Auto-Dorf der Zelle −4,−4 und
    // der Akt am Hang — je Plan v2 der Abstand vom Ort seines Höhen-Rasters (Soll 0), die Lese-Punkte außerhalb des Rasters (Soll 0)
    // und das Gassen-Gefälle p95 am Grund ohne Erdbau (`gassenGefaelle`, Soll ≤ ORT_GESETZ.gefaelle = 12 %); Selbsttest: jeder
    // Export am Raster des Wunschs, den die Ort-Wahl rückt (bis siedlung-k3-trasse) → ROT.
    {
        kriterium: "siedlung.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-settlement.cjs"],
        env: { SETTLEMENT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const z = /^\s*(✅|❌) C-K3: DIE TRASSE AM ORT — (\d+) Dörfer[^\n]* — (\[.*\])\s*$/m.exec(out);
            const s = /^\s*(✅|❌) C-K3 Selbsttest/m.exec(out);
            let t = [];
            try {
                t = z ? JSON.parse(z[3]) : [];
            } catch (_e) {
                t = [];
            }
            const gruen = !!z && z[1] === "✅" && +z[2] >= 4 && !!s && s[1] === "✅" && lauf.exit === 0;
            return {
                gruen,
                zahl: z
                    ? z[2] + " Dörfer, Gassen-Gefälle p95 " + t.map((x) => x.zelle + " " + x.p95 + " %").join(" · ") +
                      ", Versatz " + t.map((x) => x.versatzM).join("/") + " m, Selbsttest " + (s ? s[1] : "—") + ", Exit " + lauf.exit
                    : "keine Zeile C-K3 (Exit " + lauf.exit + ")",
            };
        },
        pfad: [
            "fachwerk-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "stamm/siedlung-ort.js",
            "stamm/gelaende-boden.js",
            "worlds/fachwerk/fachwerk.js",
            "scripts/diag-settlement.cjs",
            "spec/asset-contract/v6/golden/siedlung.json",
        ],
        quelle: "1 = Gassen-Gefälle p95 ≤ 12 % VOR der Erdbau-Glättung in ≥ 4 Saaten",
    },
    // siedlung.K3 Staffel 2 (Zweig siedlung-k3-hang): die Steil-Wand ist die Böschung des Erdbaus (gelaende-core ERDBAU.boeschung
    // 0,6 statt SIEDLUNG.slopeMax 0,35), EIN Grundriss-Leser (`_grundrissVon`; `_slotGrundriss` und `_werkGrundriss` fielen).
    // gate:settlement C-K3 (Browser, Null-Renderer): am Hang-Ort −400/−3175 die Vorräte der Welt (`_dorfBereiten`) der Zellen,
    // deren Ort steiler liegt als 0,35 — je Dorf Steilheit, Gassen-Gefälle p95 am Grund ohne Erdbau, Erdbau-Median je Haus (m³),
    // dazu die Zahl der Grundriss-Leser; Selbsttests: dieselben Gassen am Grund 24 m daneben ROT, die Wand 0,35 zurück ROT (am
    // Kopf 2 statt 4 Hangdörfer). An siedlung-k3-hang: 4 Dörfer 0,38–0,57, p95 8,5–11,2 %, Erdbau 449–801 m³ (flach 86–94), 1 Leser.
    {
        kriterium: "siedlung.K3",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-settlement.cjs"],
        env: { SETTLEMENT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const zeile = (re) => re.exec(out);
            const t = zeile(/^\s*(✅|❌) C-K3: DIE TRASSE AM ORT — (\d+) Dörfer/m);
            const h = zeile(/^\s*(✅|❌) C-K3: DIE HANGDÖRFER — (\d+) Dörfer[^\n]*?, (\d+) Grundriss-Leser — (\[.*\])\s*$/m);
            const s1 = zeile(/^\s*(✅|❌) C-K3 Selbsttest: die Gassen am Grund 24 m daneben/m);
            const s2 = zeile(/^\s*(✅|❌) C-K3 Selbsttest: die Wand 0,35 zurück/m);
            let d = [];
            try {
                d = h ? JSON.parse(h[4]) : [];
            } catch (_e) {
                d = [];
            }
            const gruen =
                !!t && t[1] === "✅" && !!h && h[1] === "✅" && +h[2] >= 4 && +h[3] === 1 &&
                [s1, s2].every((s) => s && s[1] === "✅") && lauf.exit === 0;
            return {
                gruen,
                zahl: h
                    ? h[2] + " Hangdörfer " + d.map((x) => x.zelle + " " + x.hang + "/" + x.p95 + " %/" + x.erdbauM3 + " m³").join(" · ") +
                      ", " + h[3] + " Grundriss-Leser, Selbsttests " + [s1, s2].map((s) => (s ? s[1] : "—")).join("") + ", Exit " + lauf.exit
                    : "keine Zeile C-K3 HANGDÖRFER (Exit " + lauf.exit + ")",
            };
        },
        pfad: [
            "fachwerk-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "stamm/siedlung-ort.js",
            "stamm/gelaende-boden.js",
            "stamm/vegetation-baum.js",
            "stamm/feld-leben.js",
            "stamm/studio-bruecke.js",
            "scripts/diag-settlement.cjs",
        ],
        quelle: "2 = dazu Hangdörfer über slopeMax 0,35 hinaus, Erdbau-Median je Haus als Kosten, EIN Grundriss-Leser statt drei",
    },

    // ───────── siedlung.K4 — durch die Jahrhunderte (w3s-jahrhunderte: die Chronik im fachwerk-core; w3w-jahrhunderte: die Zahl der Welt) ─────────
    // gate:settlement Teil J (`--nur-j`, Node): je Saat (8) dieselbe Zelle unter 1320 · 1560 · 1860 · 1935 (die Epochen ohne Zahl
    // — die Chronik ihrer Region, `chronikJahr`); je Paar die Überdeckung je Slot (3 × 3 Punkte des Grundrisses im Grundriss des
    // jüngeren), die kleinste ≥ 0,8 — und die Zelle der Welt MIT ihrer Zahl (nH 24, Legende mittelalter, 4 Saaten: die Zahl
    // zählt die Häuser ihres Schnitts, `gestaltFuer`), geschnitten am Ende jeder Epoche; bis w3w schaltete die Zahl die Chronik
    // ab, jede Welt-Handlung rechnete je Epoche einen eigenen Plan. Die Mutante ohne Erbe (je Epoche ein eigener Plan) bricht
    // beide (< 0,8). J2: moderne ergibt stadt mit Turm, vier Epochen vier Kirchen, jedes Baujahr bis zum Schnitt, kein Turm vor
    // 1905, keine Halle vor 1850, die Kultur aus REGION_HIST ihres Baujahrs, die Kleidung die Tracht der Epoche, die Mauer genau
    // am städtischen Schnitt vor 1750 und durch kein Haus; die Mutante (Turm von 1455, keine Tracht, keine Mauer) fällt beim
    // Namen. Teil WW (`--nur-ww`, Null-Renderer-Welt, kein Bild): der Satz „dorf 7 300 jahr 1560" trägt Same, Zahl und Jahr,
    // „dorf 7 hanse" die Epoche; die Akte mit Jahr 1320 und 1935 stehen in der Welt als dorf in Poncho und als stadt mit Turm in
    // T-Shirt (die Tracht liest der Wirt aus dem Export, `_bewohnerGestalten`). Rot-Grund der Buchung (b3f9ae95): „keine Zeile
    // JAHRESRINGE" — Teil J landete erst mit V18.546.122; an 98ef98bb grün 0,915, aber nur am Weg ohne Zahl, den keine Handlung
    // der Welt geht. Am Zweig w3w: Teil J 0,915, mit Zahl 0,958 (ohne Erbe 0,194 · 0,298), 0 Brüche, Mutante 10; WW1 grün. Der
    // Exit von `--nur-ww` trägt auch die Welt-Proben der Staffel 2 (WW2 Wachstum, WW3 Ring-Kern, WW4 jeder nahe Ort je Takt).
    {
        kriterium: "siedlung.K4",
        staffel: 1,
        geraet: "headless",
        befehl: ["bash", "-c", "node scripts/diag-settlement.cjs --nur-j; J=$?; node scripts/diag-settlement.cjs --nur-ww; W=$?; exit $((J > W ? J : W))"],
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const z = jsonZeile(out, /^JAHRESRINGE /);
            const w = jsonZeile(out, /^WELTWACHSTUM /);
            const [j1, j2, ww1] = [
                /^\s*(✅|❌) J1 JAHRESRINGE/m,
                /^\s*(✅|❌) J2 EPOCHE: (\d+) Brüche, die Mutante (\d+)/m,
                /^\s*(✅|❌) WW1 DAS JAHR/m,
            ].map((re) => re.exec(out));
            const zz = (z && z.zahl) || [];
            const gruen =
                !!z && z.min >= 0.8 && zz[0] >= 0.8 && z.ohneErbe < 0.8 && zz[1] < 0.8 && Array.isArray(z.fehl) && !z.fehl.length &&
                !!j1 && j1[1] === "✅" && !!j2 && j2[1] === "✅" && +j2[3] > 0 && !!ww1 && ww1[1] === "✅" && !!w && !w.bruch && lauf.exit === 0;
            const welt = w && w.alt && w.neu
                ? "1320 " + w.alt.groesse + " " + w.alt.tracht + " · 1935 " + w.neu.groesse + (w.neu.turm ? " mit Turm " : " ohne Turm ") + w.neu.tracht
                : "keine Zeile WELTWACHSTUM" + (w && w.bruch ? " (" + String(w.bruch).slice(0, 160) + ")" : "");
            return {
                gruen,
                zahl: z
                    ? "Überdeckung je Slot " + z.min + ", mit der Zahl der Welt " + zz[0] + " (ohne Erbe " + z.ohneErbe + " · " + zz[1] +
                      "), Rolle/Bauart/Kleidung/Mauer " + (z.fehl || []).length + " Brüche" + (j2 ? ", Mutante " + j2[3] : "") + "; in der Welt " + welt + ", Exit " + lauf.exit
                    : "keine Zeile JAHRESRINGE (Exit " + lauf.exit + ")",
            };
        },
        pfad: [
            "fachwerk-core.js",
            "stamm/siedlung-*.js",
            "stamm/feld-leben.js",
            "stamm/gelaende-kollision.js",
            "scripts/diag-settlement.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = dieselbe Zelle unter 1320/1560/1860/1935: der ältere Kern liegt zu ≥ 80 % im jüngeren (Jahresringe), die Epoche moderne ergibt stadt, die Epoche bestimmt Rolle, Bauart und Kleidung im Export",
    },

    // siedlung.K4 Staffel 2 (w3w-jahrhunderte): das Gesetz des Wachstums (gate:settlement Teil W, Node: 6 Orte in 3 h Welt-Uhr bis
    // zur Gegenwart, die Jahresringe je Sprung; wohl 0 und ohne Leute halten, Gewalt bremst, ein Zeitplan fällt — fachwerk
    // `wachstum`: Kraft = Leute × Wohlstand ÷ (1 + Furcht × fluchtJeFurcht) je s, die Akten gesehener Gewalt im Gedächtnis des Orts)
    // und in der warmen Welt der Ring vom Hügel (K4_ORT … K4_KAMERA): der Ort von 1320 steht, ein gesetztes Haus an seinem Rand wird
    // Kern (`_ortKernAkt`), nach 1500 s Welt-Uhr ist er gewachsen (`_ortWachstumTakt` → `_ortWaechst`, der Zug hebt die neuen
    // Häuser), die alten stehen (≥ 0,9), der Median der neuen liegt näher am Haus als am Kern des Orts, und das Beweisbild vom
    // Hügel mittags urteilt grün. Headless am Zweig (Teil WW, Null-Renderer): 1412 → 1724, 12 → 21 Häuser, die alten 0,917;
    // der Ring 26 neue, Median 54 m vom Haus gegen 100 m vom Ort; der Nachbar wächst im selben Takt (WW4). Die Schritte dieser
    // Probe headless am Zweig (Null-Renderer, `umstellen` nachgestellt bis Dorf und Foundry ruhen): Ort 400/693 dorf 12/12, Kern
    // ja, 1412 → 1724, 12 → 19/20 Häuser, die alten 0,917, Ring 8 neu, Median 22 m vom Haus / 59 m vom Ort, Hügel 210 m, 11,9 m
    // höher. Das Bild und die Dauer der Probe an der GPU: ungemessen.
    {
        kriterium: "siedlung.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: {  ...sitzung(90,
            "A=$(cygpath -m '{AUS}')",
            // TEIL W NEBEN DER WELT (w12-proben-frist): das Wachstums-Gesetz rechnet in Node ohne Welt (fachwerk-core, 14,8 s CPU) —
            // es läuft, während die Welt ihren Ort sucht, und seine Zeilen stehen am Ende unter derselben Marke W (das Urteil liest
            // W1/W2 wo immer sie stehen; die Falle am Ende wartet auf ihn, auch nach einem frühen exit); bis hier stand die Welt 15 s still, bevor sie den Ort suchte (Radeon 8ef49bef: Deckel 45 s an UHR)
            "node scripts/diag-settlement.cjs --nur-w > \"$L/teil-w.txt\" 2>&1 & WPID=$!; trap 'wait $WPID; WX=$?; echo \"@@PUNKTE@@ W\"; cat \"$L/teil-w.txt\"; echo \"@@PUNKTE@@ EXIT $WX\"' EXIT",
            "boot",
            "timeout 60 $W fenster 1600 900 > /dev/null 2>&1",
            K4_SCHRITT("ort", K4_ORT, 120),
            K4_HUEGEL("ort"),
            "[ -n \"$HILL\" ] || { echo '@@PUNKTE@@ KEIN ORT'; exit 4; }",
            "timeout 300 $W umstellen $HILL > /dev/null 2>&1",
            K4_SCHRITT("vor", K4_VOR, 60),
            K4_HUEGEL("vor"),
            "[ -n \"$HILL\" ] || { echo '@@PUNKTE@@ KEIN HAUS AM RAND'; exit 5; }",
            "timeout 300 $W umstellen $HILL > /dev/null 2>&1",
            K4_SCHRITT("uhr", K4_UHR, 60),
            "timeout 300 $W umstellen $HILL > /dev/null 2>&1",
            K4_SCHRITT("stand", K4_STAND, 60),
            K4_SCHRITT("kamera", K4_KAMERA, 60),
            "K=$(" + LIES("console.log(e.pose ? e.pose.join(\" \") : \"\")") + " \"$L/k4-kamera.json\" 2> /dev/null)",
            "[ -n \"$K\" ] || { echo '@@PUNKTE@@ KEINE KAMERA'; exit 6; }",
            "rm -f \"$L/ring.abnahme.json\"",
            "teil BILD $W bild $K --uhr 0.5 --datei \"$L/ring.png\" --w 1600 --h 900",
            "cp \"$L/ring.abnahme.json\" \"$A\" 2> /dev/null; true"
        // mutiert (w4-linsen-a): der Ort von 1320, sein Haus und 1500 s Welt-Uhr bleiben — ohne das Wort stellte die Sitzung danach nicht
        // zurück, die nächste Probe stand in seinem Ort (GTX 3ed95dcf, klang.K2#1: archLod 5459 Einträge an der Mess-Wiese, sonst 1297)
        // DIE AUSNAHME (w12-proben-frist): der Ort von 1320 am Rand, drei Wege zum Hügel (592 m, der Ring im Deckel), 1500 s Welt-Uhr des
        // Wachstums und das Bild vom Hügel — Radeon 8ef49bef stand nach 45 s bei UHR (dem dritten von sechs Schritten, Teil W 14,8 s davor)
        ), mutiert: true, sek: 33 },
        gpu: true,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const teil = (n) => out.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const erg = (n) => ((b) => (b && b.ergebnis) || {})(jsonBlock(teil(n)));
            const [w1, w2] = [/^\s*(✅|❌) W1 WACHSTUM in \d+ s: (.*)$/m, /^\s*(✅|❌) W2 AUS BEWOHNERN/m].map((re) => re.exec(out));
            const [o, v, u, s, k] = ["ORT", "VOR", "UHR", "STAND", "KAMERA"].map(erg);
            const ring = s.ring || {};
            const steht = v.slots > 0 && v.haeuser >= 0.9 * v.slots && v.groesse === "dorf" && !!v.haus;
            const waechst = Array.isArray(s.jahr) && s.jahr[1] > s.jahr[0] && s.haeuser[1] > s.haeuser[0] && s.bleiben >= 0.9 && s.offen === 0;
            const kern = u.kern === true && ring.neu > 0 && ring.zumHaus < ring.zumOrt;
            const bild = !!j && j.ok === true;
            // DIE ABNAHME BEIM NAMEN (w17-siedlung-abnahme): ein Bild, das sie nicht hält, schreibt kein {AUS} — die Werkbank wirft
            // „ABNAHME ROT [<Gründe>] · … — die Aufnahme speichert nichts" in den Teil BILD. Bis hier stand dann nur „ohne Abnahme
            // (Exit 0)" (der Exit des Teils W): GTX a4dc2a45 und Radeon 8ef49bef lasen sich wie ein Schuss, der nie lief — der
            // Grund war „wandlaterne_dorf 609 UNGEZEICHNET" in allen 42 Posen der Blick-Wahl (die Fernform zählte nicht als Bild)
            const bf = jsonBlock(teil("BILD")) || {};
            const rot = /ABNAHME ROT \[([^\]]*)\]/.exec(String(bf.fehler || ""));
            const wahl = /die Blick-Wahl fand in (\d+) Posen keine freie/.exec(String(bf.fehler || ""));
            const abnahme = j && j.zeile
                ? j.zeile.slice(0, 120)
                : rot
                    ? "ABNAHME ROT [" + rot[1].slice(0, 240) + "]" + (wahl ? ", die Blick-Wahl fand in " + wahl[1] + " Posen keine freie" : "") + " — die Aufnahme speichert nichts"
                    : bf.fehler
                        ? "BILD ohne Abnahme: " + String(bf.fehler).slice(0, 160)
                        : "ohne Abnahme — der Schuss vom Hügel schrieb weder Zeile noch Fehler (Exit " + lauf.exit + ")";
            const gruen = !!w1 && w1[1] === "✅" && !!w2 && w2[1] === "✅" && steht && waechst && kern && !k.fehler && k.hoeher > 0 && bild;
            return {
                gruen,
                zahl:
                    "W1 " + (w1 ? w1[1] + " " + w1[2].slice(0, 70) : "keine Zeile") + " · W2 " + (w2 ? w2[1] : "keine Zeile") + " · Ort " +
                    (o.fehler || v.fehler || v.groesse + " " + v.jahr + " " + v.haeuser + "/" + v.slots) + ", Haus " + (v.haus ? "gesetzt" : "fehlt") +
                    ", Kern " + (u.kern ? "ja" : "nein") + " · 1500 s: " +
                    (Array.isArray(s.jahr) ? s.jahr.join(" → ") + ", Häuser " + s.haeuser.join(" → ") + "/" + s.slots + ", die alten " + s.bleiben + (s.offen ? ", offen " + s.offen : "") : "kein Stand") +
                    " · Ring " + ring.neu + " neu, Median " + ring.zumHaus + " m vom Haus / " + ring.zumOrt + " m vom Ort · Schuss vom Hügel " + k.d + " m, " +
                    k.hoeher + " m höher · " + abnahme,
            };
        },
        pfad: [
            "fachwerk-core.js",
            "tetrapoda-core.js",
            "stamm/siedlung-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/gelaende-boden.js",
            "stamm/dirigent-takt.js",
            "scripts/diag-settlement.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "stamm/dienst.js",
        ],
        // DIE PROBEN (w17-siedlung-abnahme): ohne {AUS} urteilt die Station ROT, und ihre Zahl nennt die Abnahme beim Namen — den
        // Grund der Werkbank aus dem Teil BILD, nie „ohne Abnahme" über einem Schuss, der geurteilt hat
        proben: [
            { name: "GTX a4dc2a45: der Schuss vom Hügel urteilt ROT beim Namen", stdout: K4_ROH({ ms: 11209, fehler: K4_ROT_GTX }), gruen: false,
                zahl: /· ABNAHME ROT \[Vordergrund 29\.3 %.*wandlaterne_dorf 609 UNGEZEICHNET\], die Blick-Wahl fand in 42 Posen keine freie — die Aufnahme speichert nichts$/ },
            { name: "Mutante: die Abnahme fehlt (kein Teil BILD, kein {AUS})", stdout: K4_ROH(null), gruen: false,
                zahl: /· ohne Abnahme — der Schuss vom Hügel schrieb weder Zeile noch Fehler \(Exit 0\)$/ },
            { name: "der Schuss bricht vor der Abnahme (ein Fehler ohne Urteil)", stdout: K4_ROH({ ms: 9, fehler: "Seite weg" }), gruen: false,
                zahl: /· BILD ohne Abnahme: Seite weg$/ },
        ],
        quelle: "2 = der Ort wächst in Spielzeit aus Bewohnern, wohl und lebendig (deterministisch aus Saat + Akten), das Haus des Spielers wird Kern eines Rings, sichtbar vom Hügel (nach v1.0)",
    },

    // ───────── leib.K1 — Taste → Leib im Bild ─────────
    {
        kriterium: "leib.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // werkbank latenz an der Mess-Wiese: CDP-Taste bis zum ersten Ausgabe-Bild mit Leib/Kamera ≥ 1 cm bewegt, je 50 Proben —
        // in LAEUFE eigenen Boots, geurteilt über den schlechtesten (bildraten-fest)
        // IN DER SITZUNG (29.10.): EIN Lauf, LATENZ_PROBEN je Reihe (4 Reihen) — Ziel 30 s
        probe: sitzung(37,
            ...latenzLaeufe(
                "boot",
                "timeout 120 $W umstellen --ort wiese > /dev/null 2>&1",
                "teil LATENZ{N} $W latenz --proben " + LATENZ_PROBEN + ' --sicht ego,third --verb gehen,wechsel --json "{AUS}.lauf{N}.json"'
            )
        ),
        env: K,
        gpu: true,
        zeit: true,
        minuten: 10,
        urteil: (j) => {
            const { gruen, zahl } = latenzSchlechtester(j, ["ego/gehen", "third/gehen", "ego/wechsel", "third/wechsel"], LATENZ_PROBEN);
            return { gruen, zahl };
        },
        pfad: LATENZ,
        quelle: "1 = Taste → bewegter Leib im Ausgabe-Bild p95 ≤ 50 ms an einem Gerät (gehen, Sicht-Wechsel)",
    },
    {
        kriterium: "leib.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // dieselbe Linse über jedes Verb der Staffel (schwingen = hieb), EIN Ruf je Boot, LAEUFE Boots, der schlechteste urteilt
        // IN DER SITZUNG (29.10.): der Zwilling von halten.K2#1 (LATENZ_HALT_SITZUNG)
        probe: { ...LATENZ_HALT_SITZUNG,  mutiert: true },
        env: K,
        gpu: true,
        zeit: true,
        minuten: 24,
        urteil: (j) => {
            const ids = ["gehen", "springen", "einsteigen", "hieb"].flatMap((v) => ["ego/" + v, "third/" + v]);
            const { gruen, zahl } = latenzSchlechtester(j, ids, LATENZ_PROBEN);
            return { gruen, zahl };
        },
        pfad: LATENZ,
        quelle: "2 = jedes Verb (gehen, springen, schwingen, einsteigen), beide Geräte",
    },

    // ───────── leib.K2 — der Fuß steht (leib-k2-fuss) ─────────
    {
        kriterium: "leib.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // gate:koerper-stand K8 mit --bild (die Welt zeichnet auf der Karte, Rezept linse; derselbe Befehl läuft headless auf
        // swiftshader, dann ohne LINSE_GPU): die Sohlen-Fläche von Knöchel und Zehe im Fuß-Lock gegen das gezeichnete Mesh
        // (`__gezeichnet` und die Dreiecke der Stufen) — die Rollen fuss (längs der Höhenlinie), falllinie (hinauf und hinab)
        // und stufe (zehn Stufen, Steigung 0,17 m, hinauf und hinab) an Mess-Wiese und 25°-Hang, je ≥ 200 Kontakte; die
        // Steckenbleiber über alle sechs Gänge (je halbe Sekunde mit gehaltener Taste < 15 cm voran, oder das Ende nie erreicht).
        // Das Urteil liest nur den Fuß aus dem JSON — die übrigen Rollen der Linse richten gelaende.K5.
        // Seit 29.10. die Probe LEIB_K2 in der Welt der Sitzung (oben, leibK2Seite; vorher der eigene Boot der Linse, 10 Soll-Minuten)
        probe: LEIB_K2,
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const k = j && j.k8;
            if (!k || !k.hang || !k.wiese) return { gruen: false, zahl: "kein K8 der Linse (Exit " + lauf.exit + ")" };
            const teile = [
                ["hang", k.hang.fuss],
                ["falllinie", k.hang.falllinie],
                ["treppe hang", k.hang.stufe],
                ["treppe wiese", k.wiese.stufe],
            ];
            const rot = [];
            for (const [n, t] of teile)
                if (!t || !(t.n >= 200) || !(t.p95 <= 3)) rot.push(n + " p95 " + (t ? t.p95 : "?") + " cm an " + (t ? t.n : 0) + " Kontakten");
            const gaenge = ["wiese", "hang"].flatMap((o) => ["fuss", "falllinie", "stufe"].map((r) => k[o][r] || {}));
            const stecken = gaenge.reduce((a, t) => a + (t.stecken || 0), 0);
            if (gaenge.some((t) => !Number.isFinite(t.stecken))) rot.push("ein Gang ohne Steckenbleiber-Zahl");
            if (stecken) rot.push(stecken + " Steckenbleiber");
            if (/^\[welt-boot\] FEHLER klasse:.*zeichnet nie/m.test(lauf.stdout)) rot.push("die Linse zeichnet nie (welt-boot: Rezept null)");
            const zahl =
                teile.map(([n, t]) => n + " " + (t ? t.p95 + " (n " + t.n + ")" : "?")).join(" · ") +
                " cm p95 · Steckenbleiber " + stecken + (rot.length ? " — ROT: " + rot.join(" · ") : "");
            return { gruen: !rot.length, zahl };
        },
        pfad: [
            "stamm/koerper-*.js",
            "stamm/gelaende-*.js",
            "stamm/siedlung-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "koerper-core.js",
            "tetrapoda-core.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-koerper-stand.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = Fuß p95 ≤ 3 cm am 25°-Hang und auf Stufen, 0 Steckenbleiber auf dem Spielgang, an einem Gerät",
    },

    // ───────── leib.K2#2 — der Sprung aus dem Leib-Gesetz (leib-k2-sprung) ─────────
    {
        kriterium: "leib.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // derselbe Lauf wie leib.K2#1 (Zwilling: gleicher Befehl und Umgebung, er fährt EINMAL): gate:koerper-stand K8 und K9
        // mit --bild. K9 (an der Mess-Wiese, je Sicht Ego und Third): der Sprung aus dem Sprint, die Taste einen Takt gehalten,
        // bis der Leib landet — der Hub der Kapsel, der gezeichneten Hüfte und des Auges, die Weite vom Abdruck bis zur Landung;
        // je Leib der heutige, die Masse ×1,25 (`_leibMasse`) und die Kraft ×1,25 (`_sprungKraft`). Der Abdruck folgt dem
        // Gesetz koerper LEIB.sprung (v = √(2d(F/m − g)), `_sprungAbdruck`). Das Urteil: der Fuß von #1 (dazu) und je Sicht
        // das Bild (die Hüfte in Third, das Auge in Ego heben sich mit der Kapsel, ≥ 80 %), die Masse senkt Höhe UND Weite um
        // ≥ 10 %, die Kraft hebt beide um ≥ 10 %. Headless (Null-Renderer, leib-k2-sprung 27.10.): Ego und Third 0,323/2,85 m,
        // Masse 0,179/2,16 m, Kraft 0,504/3,45 m, Auge 0,315 m, Hüfte 0,326 m. Seit 29.10. dieselbe Probe LEIB_K2 (Zwilling von #1).
        probe: LEIB_K2,
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const fuss = stationen.find((s) => s.kriterium === "leib.K2" && s.staffel === 1).urteil(j, lauf);
            const sp = (j && j.k8 && j.k8.sprung) || {};
            const rot = fuss.gruen ? [] : ["der Fuß (#1)"];
            const r2 = (x) => Math.round(x * 1000) / 1000;
            const teile = ["first", "third"].map((b) => {
                const [g, masse, kraft] = sp[b] || [];
                if (!g || !masse || !kraft) {
                    rot.push((b === "first" ? "Ego" : "Third") + " ohne Sprung");
                    return "";
                }
                const [h, w] = [(x) => x.hub[0], (x) => x.weite];
                const blick = g.hub[b === "first" ? 2 : 1];
                if (!(h(g) > 0.1 && blick >= 0.8 * h(g))) rot.push(b + " Bild " + r2(blick) + " von " + r2(h(g)) + " m");
                if (!(h(masse) <= 0.9 * h(g) && w(masse) <= 0.9 * w(g))) rot.push(b + " Masse ×1,25 zieht den Sprung nicht");
                if (!(h(kraft) >= 1.1 * h(g) && w(kraft) >= 1.1 * w(g))) rot.push(b + " Kraft ×1,25 zieht den Sprung nicht");
                return (b === "first" ? "Ego " : "Third ") + [g, masse, kraft].map((x) => r2(h(x)) + "/" + r2(w(x))).join(" → ");
            });
            if (/^\[welt-boot\] FEHLER klasse:.*zeichnet nie/m.test(lauf.stdout)) rot.push("die Linse zeichnet nie");
            const zahl = teile.join(" · ") + " m (Leib → Masse ×1,25 → Kraft ×1,25) · Fuß " + fuss.zahl;
            return { gruen: !rot.length, zahl: zahl + (rot.length ? " — ROT: " + rot.join(" · ") : "") };
        },
        pfad: [
            "stamm/koerper-*.js",
            "stamm/kreatur-verhalten.js",
            "stamm/bau-buch.js",
            "stamm/dienst.js",
            "stamm/gelaende-*.js",
            "stamm/siedlung-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "koerper-core.js",
            "tetrapoda-core.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-koerper-stand.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = dazu Sprung-Höhe und -Weite aus dem Leib-Gesetz (Mutation von Leib-Masse/Kraft zieht sie), Ego und Third, beide Geräte",
    },

    // ───────── leib.K4 — die Kamera zu Fuß ─────────
    {
        kriterium: "leib.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // gate:kamera-leib Teil gang mit --bild (echter Renderer): Stamm, Fels, Haus im echten Spiel-Takt, rückwärts heran +
        // 360°-Orbit; Kugel in Fels/Bau, Nah-Pixel von Fels, Gelände und Rinde, Ruck p95
        // der Gang läuft NUR im Teil leib (diag-kamera-laub: `if (TEILE.includes("leib")) { … if (TEILE.includes("gang"))`), wie
        // gate:kamera-leib (`--teile leib,gang,ninja --bild`); `--teile gang` allein mass nichts (23.10.: „Gang: nicht gemessen“).
        // Seit 29.10. die Probe LEIB_K4 in der Welt der Sitzung (leibK4Seite: die Anker aus leibWiese, der Gang mit gang2 — der
        // Zwilling von #2, EIN Lauf; vorher der eigene Boot, 6 Soll-Minuten)
        probe: LEIB_K4,
        gpu: true,
        zeit: true, // das Urteil fällt an der Wanduhr: Ruck p95 je Bild beim Gehen (pm-fremdlast)
        minuten: 2,
        // DAS URTEIL (24.10., Prüfung der Buchung): das Kriterium misst Pixel „an einem Gerät“ — unter `--bild` zeichnet die Welt
        // auf der Karte (seit gpu-wand: Rezept linse ohne Null-Renderer), kamera-nah rechnet die Nah-Pixel gegen die Szene, die sie
        // zeichnet; zeichnet sie nie (welt-boot: „das Rezept ist null“), ist das ROT (Wand GPU in punkte.cjs und hier).
        // „nie … in der Wand“: die Messung prüft Fels UND Wand vor der Kamera — Bau-Pixel im Nahbereich zählen (vor kamera-bau
        // trug der offene Tür-Flügel keinen Leib; seitdem urteilt gate:kamera-leib sie selbst, der gedrehte Flügel frisch je
        // Probe). Die Kugel im Stamm (Fels oder Wand nennt das Kriterium nicht) und der Ruck-Höchstwert (das Kriterium misst p95)
        // stehen in der Zahl.
        urteil: (j, lauf) => {
            const z = lauf.stdout.split(/\r?\n/).find((l) => /^\s*(✅|❌) K4 der Gang in Third/.test(l));
            if (!z) return { gruen: false, zahl: "keine Zeile K4 der Gang (Exit " + lauf.exit + ")" };
            const zeilen = lauf.stdout.split(/\r?\n/).filter((l) => /^\s+(stamm|fels|haus)\s/.test(l));
            const gaenge = zeilen.map((l) => l.trim().replace(/\s+/g, " "));
            const wand = zeilen.reduce((s, l) => {
                const m = /Nah-Pixel (\{[^}]*\})/.exec(l);
                let n = {};
                try { n = m ? JSON.parse(m[1]) : {}; } catch (_e) { n = { kaputt: 1 }; }
                return s + Object.entries(n).filter(([k]) => /: Bau$|kaputt/.test(k)).reduce((a, [, v]) => a + v, 0);
            }, 0);
            const nie = /^\[welt-boot\] FEHLER klasse:.*zeichnet nie/m.test(lauf.stdout);
            const rot = [/❌/.test(z) ? z.split(" — ").slice(1).join(" — ") : null, wand ? "Wand-Pixel (Bau) im Nahbereich in " + wand + " Proben" : null,
                nie ? "die Linse zeichnet nie (welt-boot: Rezept null)" : null].filter(Boolean);
            return { gruen: /✅/.test(z) && !rot.length, zahl: (gaenge.join(" | ") || "keine Gang-Zeile") + (rot.length ? " — ROT: " + rot.join(" · ") : "") };
        },
        pfad: [
            "stamm/koerper-*.js",
            "stamm/gelaende-*.js",
            "stamm/vegetation-*.js",
            "stamm/siedlung-bauten.js",
            // der Leib des Tür- und Tor-Flügels (kamera-bau: `_fluegelLeib` beim Setzen der Slots und nach jedem Schwenk)
            "stamm/siedlung-satz.js",
            "stamm/siedlung-ort.js",
            "stamm/dirigent-takt.js",
            "stamm/daten.js",
            "scripts/diag-kamera-laub.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/kamera-nah.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "1 = Third nie im Fels oder in der Wand (0 Fels-Pixel im Nahbereich der Kamera), Ruck ≤ 0,02 m p95 beim Gehen, an einem Gerät",
    },
    {
        kriterium: "leib.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // diag-kamera-laub mit dem Teil gang2 (der Gang der Staffel 2, mit --bild auf der Karte): derselbe Gang wie Staffel 1 dazu
        // IM HAUS (rückwärts durch die Tür des haus_alemannisch, `innen`: der Spieler steht über 1 m hinter der Schwelle) und am
        // STEILHANG (die Stelle des EINEN Orts-Gesetzes `__weltOrt("hang")`, 25–35° um die Mess-Wiese, der Blick hangab, die
        // Kamera hangauf), beide auch im SPRINT (`innen-sprint`, `steil-sprint`); die Kugel urteilt auch den sichtbaren Boden, der
        // Ruck gilt je Gang, und die Kamera, die nach dem Takt in den Hang sinkt, muss die Linse nennen (Zeile „K4 Staffel 2").
        // „auch": die Zeile der Staffel 1 (Stamm, Fels, Haus beim Gehen) zählt mit; Wand-Pixel (Bau) zählen in jedem Gang, die
        // Weiche „zeichnet nie" ist ROT (Wand GPU in punkte.cjs und hier). gate:kamera-leib (CI) fährt gang2 nicht, solange er ROT
        // ist (26.10., swiftshader mit --bild am Code-Zweig lk4-steil: Ruck p95 im Haus-Sprint 0,048 m, sonst grün).
        // Seit 29.10. dieselbe Probe LEIB_K4 (Zwilling von #1; vorher der eigene Boot, 8 Soll-Minuten).
        probe: LEIB_K4,
        gpu: true,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const zeilen = lauf.stdout.split(/\r?\n/);
            const z1 = zeilen.find((l) => /^\s*(✅|❌) K4 der Gang in Third/.test(l));
            const z2 = zeilen.find((l) => /^\s*(✅|❌) K4 Staffel 2: /.test(l));
            if (!z1 || !z2) return { gruen: false, zahl: "keine Zeile K4 " + (z1 ? "Staffel 2" : "der Gang in Third") + " (Exit " + lauf.exit + ")" };
            const gang = zeilen.filter((l) => /^\s+(stamm|fels|haus|innen|innen-sprint|steil|steil-sprint)\s/.test(l));
            const gaenge = gang.map((l) => l.trim().replace(/\s+/g, " "));
            const wand = gang.reduce((s, l) => {
                const m = /Nah-Pixel (\{[^}]*\})/.exec(l);
                let n = {};
                try { n = m ? JSON.parse(m[1]) : {}; } catch (_e) { n = { kaputt: 1 }; }
                return s + Object.entries(n).filter(([k]) => /: Bau$|kaputt/.test(k)).reduce((a, [, v]) => a + v, 0);
            }, 0);
            const fehlt = ["innen", "innen-sprint", "steil", "steil-sprint"].filter((a) => !gaenge.some((g) => g.startsWith(a + " ")));
            const nie = /^\[welt-boot\] FEHLER klasse:.*zeichnet nie/m.test(lauf.stdout);
            const rot = [/❌/.test(z1) ? "Staffel 1: " + z1.split(" — ").slice(1).join(" — ") : null, /❌/.test(z2) ? z2.split(" — ").slice(1).join(" — ") : null,
                fehlt.length ? "kein Gang " + fehlt.join(", ") : null, wand ? "Wand-Pixel (Bau) im Nahbereich in " + wand + " Proben" : null,
                nie ? "die Linse zeichnet nie (welt-boot: Rezept null)" : null].filter(Boolean);
            return { gruen: !rot.length, zahl: (gaenge.filter((g) => /^(innen|steil)/.test(g)).join(" | ") || "keine Gang-Zeile") + (rot.length ? " — ROT: " + rot.join(" · ") : "") };
        },
        pfad: [
            "stamm/koerper-*.js",
            "stamm/gelaende-*.js",
            "stamm/vegetation-*.js",
            "stamm/siedlung-bauten.js",
            "stamm/siedlung-satz.js",
            "stamm/siedlung-ort.js",
            "stamm/dirigent-takt.js",
            "stamm/daten.js",
            // die Kugel der Kamera und ihr Arm (`fx.bewegung.kamera`), das Haus mit Tür und Treppe, der Hang des Gesetzes
            "koerper-core.js",
            "fachwerk-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-kamera-laub.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/kamera-nah.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = auch am Steilhang, im Haus, beim Sprint, beide Geräte",
    },

    // ───────── leib.K5 — das Gamepad (gamepad-verben) ─────────
    ...[1, 2].map((staffel) => ({
        kriterium: "leib.K5",
        staffel,
        geraet: "headless",
        // checkBandGamepadVerben im vollen Playtest (Null-Renderer): ein synthetisches Pad fährt jedes Verb durch den echten Takt;
        // am Kopf vor gamepad-verben fehlt die Probe (ROT „keine Zeile")
        befehl: ["node", "scripts/playtest.cjs"],
        env: { PLAYTEST_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = lauf.stdout.split(/\r?\n/).filter((l) => /^\s*(✅|❌) Gamepad-Verben \(leib\.K5\): /.test(l));
            const teile = staffel === 1 ? [/: Gehen ∝/, /: Fahren:/] : [/: jedes Verb liest NUR/, /: Gehen ∝/, /: Fahren:/, /: jeder Knopf über/];
            const je = teile.map((re) => z.find((l) => re.test(l)));
            if (je.some((l) => !l)) return { gruen: false, zahl: "keine Zeile der Gamepad-Probe für " + teile.filter((_, i) => !je[i]).map(String).join(" ") + " (Exit " + lauf.exit + ")" };
            return { gruen: je.every((l) => /✅/.test(l)), zahl: je.map((l) => l.trim().replace(/^(✅|❌) Gamepad-Verben \(leib\.K5\): /, "$1 ")).join(" | ") };
        },
        pfad: PAD,
        quelle: staffel === 1 ? "1 = Gehen, Kamera und Fahren analog über den Achs-Wert (Lenkwinkel stetig)" : "2 = jedes Verb, Rumble aus dem Zustand, Belegung frei",
    })),

    // ───────── leib.K3 — Ufer → Schwimmen → Tauchen ohne Sprung (w4-stationen-b-koord) ─────────
    // Die Probe `leibK3Lauf` (oben): Lage und Kamera je Bild im echten Takt am See nächst der Mess-Wiese, Ego und Third, die Mutante
    // im selben Lauf. Headless: Lage und Kamera sind Mechanik (die Staffel 1 verlangt EIN Gerät; das Unterwasser-Bild und die Höhle
    // mit Licht-Abfall sind Staffel 2, beide Geräte — die Station darunter).
    {
        kriterium: "leib.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + knapp(leibK3Lauf) + ")()", "{AUS}", "{PORT}"],
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => leibK3Urteil(lauf),
        proben: LEIB_K3_PROBEN,
        pfad: [
            "stamm/koerper-*.js",
            "stamm/wasser-*.js",
            "stamm/dirigent-*.js",
            "stamm/gelaende-*.js",
            "koerper-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/wasser-linse.cjs",
        ],
        quelle: "1 = Ufer → Schwimmen → Tauchen ohne Sprung (Lage, Kamera) an einem Gerät",
    },
    // leib.K3 Staffel 2 (w12-unterwasser): das Unterwasser-Bild aus der EINEN Wasser-Wahrheit gegen die REF und die Höhle mit
    // Licht-Abfall — die Probe `probeUnterwasser` (oben) in der Welt der Sitzung, See und Höhle in EINEM Lauf. mutiert: sie hält den
    // Takt an (Bühne), stellt Leib und Kamera unter den Spiegel und leiht das Gesetz des Wassers für die Mutante — die Sitzung setzt danach zurück.
    // Zuerst urteilt sie, ob die Aufnahme der Kamera folgt (w14-unterwasser, DER STEHENDE BLICK: das Gitter je Schuss) — ein stehendes
    // Bild heißt beim Namen DAS BILD STEHT, nie „das Gesetz des Wassers“.
    {
        kriterium: "leib.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { ...UNTERWASSER_PROBE, mutiert: true },
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => unterwasserUrteil(lauf),
        proben: UNTERWASSER_PROBEN,
        pfad: [
            "stamm/bild-*.js",
            "stamm/wasser-*.js",
            "stamm/koerper-bewegung.js",
            "stamm/dirigent-*.js",
            "stamm/dienst.js",
            "foundry-core.js",
            "fachwerk-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "spec/abnahme/soll-tafel.json",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = Unterwasser-Bild aus der EINEN Wasser-Wahrheit (Sicht-Abfall nach Tiefe gegen REF), Höhle mit Licht-Abfall, beide Geräte",
    },

    // ───────── halten.K1 — der Treffer aus dem Gesetz ─────────
    {
        kriterium: "halten.K1",
        staffel: 1,
        geraet: "headless",
        // gate:kampf-gefuehl am echten Chokepoint (_beginPlayerSwing, _kampfSweepTick, damageCreature): (A) Dauer ∝ √I zweier echter
        // Blueprints, (B) der Sweep trifft neben dem Fadenkreuz genau einmal, hinter dem Rücken nie
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const soll = [/\(A\) beide Fixtures liegen UNGEKLEMMT/, /\(A\) Schwung-Dauer-Verhältnis ∝ √/, /\(B\) der Sweep trifft ein Ziel NEBEN/, /\(B\) dedupliziert je Schwung: GENAU EIN/, /\(B\) NIE ein Ziel hinter dem Rücken/];
            const je = soll.map((re) => l.find((x) => /^\s*(✅|❌) /.test(x) && re.test(x)));
            const a = l.find((x) => /^\s*\(A\) I1=/.test(x));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt: " + soll.filter((_, i) => !je[i]).map(String).join(" ") + " (Exit " + lauf.exit + ")" };
            return { gruen: je.every((x) => /✅/.test(x)), zahl: (a ? a.trim() : "") + " · " + je.filter((x) => /❌/.test(x)).length + " von " + je.length + " Proben ROT" };
        },
        pfad: KAMPF,
        quelle: "1 = Schwung und Treffer folgen der Trägheit des Werks (Dauer ∝ √I ±5 % an echten Blueprints, Klingen-Sweep am Chokepoint) — Mechanik",
    },

    // ───────── halten.K2 — Eingabe → Schwung, Hit-Stop ─────────
    {
        kriterium: "halten.K2",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // werkbank latenz --verb hieb (halten-latenz): Klick per CDP bis zur Marke getCurrentTexture, an der die rechte Hand ≥ 1 cm
        // steht; Hit-Stop = präsentierte Bilder mit stehender Schwung-Uhr und Hand (halt) — in LAEUFE eigenen Boots, der
        // schlechteste urteilt (bildraten-fest, wie leib.K1)
        // IN DER SITZUNG (29.10.): der Zwilling von leib.K1#2 (LATENZ_HALT_SITZUNG) — die Reihen hieb in Ego und Third daraus
        probe: { ...LATENZ_HALT_SITZUNG,  mutiert: true },
        env: K,
        gpu: true,
        zeit: true,
        minuten: 14,
        urteil: (j, lauf) => {
            const ids = ["third/hieb", "ego/hieb"];
            const r = latenzSchlechtester(j, ids, LATENZ_PROBEN);
            if (!r.da) return r;
            // der Hit-Stop je Lauf (die längere Sicht), der schlechteste Lauf urteilt
            const halt = Math.min(...r.da.map((l) => Math.max(0, ...ids.map((id) => (l.reihen[id] && l.reihen[id].halt) || 0))));
            const out = String(lauf.stdout || "");
            const spiel = Array.from({ length: LAEUFE }, (_, i) => {
                const sp = out.indexOf("@@PUNKTE@@ SPIEL" + (i + 1));
                const s = sp >= 0 ? jsonBlock(out.slice(sp)) : null;
                const e = s && s.ergebnis;
                return e ? e.gesetzt + "-mal" + (e.gesetzt ? " (" + e.dauerMs.join("–") + " ms, gleitet bis " + e.gleitMm + " mm je Takt)" : "") : "ungezählt";
            });
            return { gruen: r.gruen && halt >= 2, zahl: r.zahl + " · Hit-Stop im schlechtesten Lauf " + halt + " Bilder · im Spiel Halt gesetzt " + spiel.join(" / ") };
        },
        pfad: LATENZ,
        quelle: "1 = Eingabe → erstes Schwung-Bild ≤ 50 ms und Hit-Stop sichtbar im Ausgabe-Bild an einem Gerät",
    },
    {
        kriterium: "halten.K2",
        staffel: 2,
        geraet: "headless",
        // gate:kampf-gefuehl Q11 halten.K2 (hk2-klang): je Stoff-Paar EIN Klick über den echten Dispatcher — Langschwert an Eiche
        // (Stahl/Holz) und Fels (Stahl/Stein), Keule am Hirsch (Holz/Fell, die Zeile fleisch) —, in Ego und Third; der Master-Bus
        // der Symphonie liegt für den Klick an einem OfflineAudioContext: Schwerpunkt (klang `schwerpunkt`), Pegel, Latenz
        // Treffer → Ton, die Funken der Marke `_trefferPaar`. GRÜN: die Stoffe des Gesetzes, Pegel > −60 dB binnen 5 ms, Funken
        // genau bei Stahl auf Stein, Third = Ego, je zwei Paare ≥ 300 Hz auseinander, und der Selbsttest S19 (alle Paare gleich)
        // feuert. Der Klang rechnet ohne GPU (Web Audio auf der CPU, deterministisch) — headless urteilt für beide Geräte.
        // An hk2-klang d7cb5c9b (headless, Ego = Third): stahl/holz 954 Hz −37 dB · stahl/stein 2179 Hz −34 dB, 24 Funken ·
        // holz/fleisch 192 Hz −49 dB, Latenz 0 ms, S19 feuert; dieselbe Linse an main b2c6c627 ROT (Abbau stumm 0 Hz, der Hirsch
        // 304 Hz nach seinem Spawn-Rumpf, kein Paar, keine Funken).
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q11 halten\.K2 Staffel 2/.test(x));
            const s19 = l.find((x) => /^\s*(✅|❌) SELBST-TEST \(S19\)/.test(x));
            if (!q) return { gruen: false, zahl: "keine Zeile Q11 halten.K2 (Exit " + lauf.exit + ")" };
            const m = /am Bus (\{.*\})(?: — ROT (.*))?$/.exec(q);
            let P = null;
            try {
                P = m && JSON.parse(m[1]);
            } catch (_e) {
                P = null;
            }
            const je = P ? Object.entries(P).map(([k, [e]]) => k + " " + e.hz + " Hz " + e.db + " dB Funken " + e.funken + " Latenz " + e.ms + " ms") : ["keine Messung"];
            return {
                gruen: /✅/.test(q) && !!s19 && /✅/.test(s19),
                zahl: je.join(" · ") + (m && m[2] ? " — ROT " + m[2].slice(0, 200) : "") + " · S19 " + (s19 && /✅/.test(s19) ? "feuert" : "stumm"),
            };
        },
        pfad: [...KAMPF, "klang-core.js", "stamm/klang.js", "stamm/bau-vorlagen.js", "stamm/dirigent-takt.js"],
        quelle: "2 = Klang und Funken aus dem Stoff-Paar (Spektrum je Paar verschieden), Ego und Third, beide Geräte",
    },

    // ───────── halten.K3 — das Werkzeug wirkt nach seiner Form (halten-gesetz) ─────────
    {
        kriterium: "halten.K3",
        staffel: 1,
        geraet: "headless",
        // gate:kampf-gefuehl Q11 halten.K3 (Fällaxt fällt, Spaten gräbt, die umgeformte Gestalt folgt der Form); die Sichel hat
        // kein Kern-Rezept und keine Probe — bis eine Zeile „Sichel … erntet" grün steht, ist die Station ROT beim Namen
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q11 halten\.K3/.test(x));
            const sichel = l.find((x) => /^\s*(✅|❌) .*Sichel.*ernte/i.test(x));
            if (!q) return { gruen: false, zahl: "keine Zeile Q11 halten.K3 (Exit " + lauf.exit + ")" };
            const form = l.find((x) => /^\s+form \{/.test(x));
            return {
                gruen: /✅/.test(q) && !!sichel && /✅/.test(sichel),
                zahl: "Q11 " + (/✅/.test(q) ? "grün" : "ROT") + " (" + (form ? form.trim().slice(0, 240) : "keine Form-Zeile") + ") · Sichel " + (sichel ? (/✅/.test(sichel) ? "grün" : "ROT") : "ungemessen (keine Probe)"),
            };
        },
        pfad: KAMPF,
        quelle: "1 = Axt fällt, Spaten gräbt, Sichel erntet über die echte Eingabe, und eine umgeformte Klinge (Axt mit Spaten-Blatt) wirkt nach der neuen Form",
    },
    // gate:kampf-gefuehl Q11 (der Werkzeug-Satz an der Mess-Wiese): jede der 22 Gestalten des Gesetzbuchs und die Hand, je Ziel EIN
    // Klick über die echte Eingabe — Eiche, Fels, Erde, Wiese, Wild, Schuss —, gezählt Wirkung und Verschleiß, am Ziel der Aufgabe
    // dazu wear 0,5 (der Faktor in der Kraft) und 0,02 (die Wand); die Form-Mutation (Grab-Blatt, Axt-Kopf, Krümmung, Recurve)
    // und der Stoff (Stahl, Eisen, Bronze aus der Tradition, 16 Hiebe in Folge, die halbe Härte der Stahl-Zeile). Die Selbst-Tests
    // S6 (Pfeil ohne Verschleiß), S13 (Art-Tafel), S15 (Name), S16 (Spender) müssen feuern. An main 6f8a2c66 ROT: 19 von 22,
    // Stahl, Eisen und Bronze zehren je 0,0032, Graben zehrt nicht und kennt keine Wand, die Recurve schießt gleich.
    {
        kriterium: "halten.K3",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q11 halten\.K3 Staffel 2/.test(x));
            if (!q) return { gruen: false, zahl: "keine Zeile Q11 halten.K3 Staffel 2 (Exit " + lauf.exit + ")" };
            const selbst = ["S6", "S13", "S15", "S16"].map((k) => [k, l.find((x) => x.includes("SELBST-TEST (" + k + ")"))]);
            const stumm = selbst.filter(([, x]) => !x || !/✅/.test(x)).map(([k]) => k);
            const [, gut, alle] = q.match(/\((\d+) von (\d+)\)/) || [];
            const stoff = (q.match(/Stoff-Zeile \(([^)]*)\)/) || [])[1];
            return {
                gruen: /✅/.test(q) && +gut === +alle && +alle >= 22 && !stumm.length,
                zahl:
                    (gut || "?") + " von " + (alle || "?") + " Gestalten · zehrt " + (stoff || "ungemessen") +
                    (/❌/.test(q) ? " · ROT: " + q.split(" — ").slice(1).join(" — ").slice(0, 300) : "") +
                    (stumm.length ? " · Selbst-Test stumm: " + stumm.join(", ") : ""),
            };
        },
        pfad: KAMPF.concat(["stamm/vegetation-wiese.js", "stamm/bau-vorlagen.js"]),
        quelle: "2 = jede Werkzeug-Form der Schmiede, Verschleiß aus dem Stoff",
    },

    // ───────── ultiversum.K1 — Das Welt-Gesetz: Konstanten, die ein Leser liest (w8-ultiversum-k1) ─────────
    // Die Probe `ultiversumK1Lauf` (oben): A (die Erde) → das Tor in die Ferne → B (Schwere 3,71, roter Himmel, trockene Wetter-Tafel,
    // Hochland) → das Heimtor → A; je Welt die vier Konstanten im Gesetz der Welt und ihre Leser (Sprung, Himmels-Medium, Wetter-Zug,
    // Relief). Headless: der Text verlangt Leser, die das Gesetz lesen (Mutation ändert Bild bzw. Leib) — das Bild misst die Staffel 2.
    // An w8-ultiversum-k1 GRÜN: A g −9,81 Sprung 0,323 m · Blau÷Rot 5,2273 · Relief ×1 | B g −3,71 Sprung 1,54 m · Blau÷Rot 0,3846 ·
    // kein Regen · Relief ×1,43–2,00 (je Saat der geborenen Ferne) | A2 = A. Am main d880c8e8 ROT: „die Welt trägt kein Gesetz".
    {
        kriterium: "ultiversum.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + knapp(ultiversumK1Lauf) + ")()", "{AUS}", "{PORT}"],
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => ultiversumK1Urteil(lauf),
        proben: ULTI_K1_PROBEN,
        pfad: ["stamm/speicher-*.js", "stamm/netz-portal.js", "stamm/bild-himmel.js", "stamm/koerper-bewegung.js", "stamm/gelaende-boden.js", "stamm/daten.js", "stamm/dirigent-kern.js", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = zwei per Tor erreichbare Welten mit verschiedenen Konstanten (g, Wetter-Tafel, Himmel, Gelände-Parameter), jede Konstante hat einen Leser (Mutation ändert Bild bzw. Leib)",
    },

    // ───────── ultiversum.K2 — Welten heiraten (fusion-determ) ─────────
    {
        kriterium: "ultiversum.K2",
        staffel: 1,
        geraet: "headless",
        // gate:praegung-welt (U) FUSION: dieselben Eltern-Bytes in ZWEI Geräten (zwei Browser-Prozesse, frische Profile) → fuseWorlds
        // A+B (random-mix: Id, Saat, Geburt, Münzwurf) byte-gleich, B+A eine andere Welt (gerichtet: A ist die Welt der Seite), der
        // Täter „Date.now zurück in die Geburt" ROT. Am Kopf vor fusion-determ ROT (randomUUID, Math.random-Saat, Date.now, Münzwurf
        // aus Math.random: A+B ≠ zwischen den Geräten); an fusion-determ 21c275fb GRÜN (1150 Bytes je Gerät, Exit 0). Zwilling von ultiversum.K5#1 (ein Lauf).
        befehl: ["node", "scripts/diag-praegung-welt.cjs"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const soll = [/^\s*(✅|❌) FUSION A\+B byte-gleich/, /^\s*(✅|❌) GERICHTET: /, /^\s*(✅|❌) TÄTER-PROBE: Date\.now /];
            const je = soll.map((re) => l.find((x) => re.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt: " + soll.filter((_, i) => !je[i]).map(String).join(" ") + " (Exit " + lauf.exit + ")" };
            return { gruen: je.every((x) => /✅/.test(x)), zahl: je.map((x) => x.trim().slice(0, 100)).join(" | ") };
        },
        pfad: ["stamm/speicher-*.js", "stamm/netz-identitaet.js", "stamm/siedlung-ort.js", "scripts/diag-praegung-welt.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = fuseWorlds(A, B) byte-gleich auf zwei Geräten",
    },
    // ultiversum.K2 #2 (w5-s2-g5): die Probe `ultiversumK2Lauf` (oben) — die Fusion zweier Welten, deren eine den frozen Worldgen pflügen
    // will, im echten Weg (fuseWorlds → Welt-Wechsel am Ort → der Takt); headless (Mechanik des Felds, der Text verlangt kein Bild und
    // kein zweites Gerät).
    {
        kriterium: "ultiversum.K2",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "-e", "(" + knapp(ultiversumK2Lauf) + ")()", "{AUS}", "{PORT}"],
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => ultiversumK2Urteil(lauf),
        proben: ULTI_K2_PROBEN,
        pfad: ["stamm/speicher-*.js", "stamm/feld-dsl.js", "stamm/feld-leben.js", "stamm/feld-nexus.js", "stamm/dirigent-takt.js", "scripts/lib/welt-boot.cjs"],
        quelle: "2 = 0 Schreibe auf den frozen Kern, die gemischten Regeln werten nach Affekt K3",
    },

    // ───────── ultiversum.K3 — Die Bibliothek (w3s-bibliothek) ─────────
    // gate:praegung-welt (L) --bibliothek (Null-Renderer, ein Gerät, ~20 s): je Art (Welt, Regel, Bauplan) legt bibliothekLege einen
    // Eintrag an — die EINE Hülle des Teilens (_werkCode), signiert, Code = SHA-256 der Bytes; bibliothekFinde(code) findet ihn
    // durch den EINEN Eingang (Größe, Signatur, Rückruf) wieder. Mutanten: ein Byte (everySec 30 → 31) auf der Platte → „signatur",
    // ein Eintrag unter fremdem Code → „code", ein Mesh (2400 Zahlen) im Welt-Gesetz → „gross" (> 8192 B). Am Kopf vor w3s-bibliothek
    // ROT (bibliothekLege fehlt: ABSTURZ, Exit 2); an w3s-bibliothek 24b9ccaa GRÜN: Welt 1041 B (Akten 1, Regeln 7), Regel 335 B,
    // Bauplan 428 B, Mesh 17850 B ROT, Exit 0.
    {
        kriterium: "ultiversum.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-praegung-welt.cjs", "--bibliothek"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/);
            const soll = ["BIBLIOTHEK welt:", "BIBLIOTHEK regel:", "BIBLIOTHEK bauplan:", "MUTANTE Byte:", "MUTANTE Code:", "MUTANTE Mesh:"];
            const je = soll.map((k) => l.find((x) => x.includes(k) && /^\s*(✅|❌) /.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt: " + soll.filter((_, i) => !je[i]).join(" ") + " (Exit " + lauf.exit + ")" };
            const bytes = je.slice(0, 3).map((x) => (x.match(/— (\d+) B/) || [])[1]);
            return {
                gruen: lauf.exit === 0 && je.every((x) => /✅/.test(x)) && bytes.every((b) => b && +b <= 8192),
                zahl: "Welt " + bytes[0] + " B · Regel " + bytes[1] + " B · Bauplan " + bytes[2] + " B · " + je.slice(3).map((x) => x.split(" — ")[1]).join(" · "),
            };
        },
        pfad: ["stamm/netz-identitaet.js", "stamm/speicher-welten.js", "stamm/feld-dsl.js", "scripts/diag-praegung-welt.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = Welten, Regeln und Baupläne liegen signiert vor, je Gesetz ≤ 8 KB, auffindbar über einen Code",
    },
    {
        kriterium: "ultiversum.K3",
        staffel: 2,
        geraet: "headless",
        // derselbe Lauf: bibliothekForke(Welt) verändert das Gesetz (wetter storm) und signiert mit dem eigenen Pass, ein zweiter Fork
        // darauf; die Kette des Enkels nennt je Vorgänger Autor und Code ([Welt-Code, Fork-Code]), der Eintrag ist offenes JSON —
        // sein Gesetz byte-gleich das Gesetz der Welt (Stand-Tafel). Offen bleibt der Pull eines Codes über das Mesh (ein Gerät).
        befehl: ["node", "scripts/diag-praegung-welt.cjs", "--bibliothek"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/);
            const je = ["FORK: Herkunfts-Kette", "BIBLIOTHEK offen lesbar:"].map((k) => l.find((x) => x.includes(k) && /^\s*(✅|❌) /.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt (Exit " + lauf.exit + ")" };
            return { gruen: lauf.exit === 0 && je.every((x) => /✅/.test(x)), zahl: je.map((x) => x.trim().slice(0, 90)).join(" | ") };
        },
        pfad: ["stamm/netz-identitaet.js", "stamm/speicher-welten.js", "scripts/diag-praegung-welt.cjs", "scripts/lib/welt-boot.cjs"],
        quelle: "2 = forkbar mit Herkunfts-Kette, offen lesbar",
    },

    // ───────── ultiversum.K5 — Vertrauen (teilen-sicher) ─────────
    {
        kriterium: "ultiversum.K5",
        staffel: 1,
        geraet: "headless",
        // gate:praegung-welt (K) KORPUS: fremde, gültig signierte Codes fallen bei B laut beim Namen (op:rule), die P2P-Regel mit
        // verbotenem Effekt fällt benannt (rule_effect_forbidden), B schreibt 0; am Kopf vor teilen-sicher fehlt (K)
        befehl: ["node", "scripts/diag-praegung-welt.cjs"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const soll = [/^\s*(✅|❌) op:rule /, /^\s*(✅|❌) P2P: eine Regel mit verbotenem Effekt fällt benannt/, /^\s*(✅|❌) 0 Schreibe: /];
            const je = soll.map((re) => l.find((x) => re.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt: " + soll.filter((_, i) => !je[i]).map(String).join(" ") + " (Exit " + lauf.exit + ")" };
            return { gruen: je.every((x) => /✅/.test(x)), zahl: je.map((x) => x.trim().slice(0, 140)).join(" | ") };
        },
        pfad: [
            "stamm/netz-identitaet.js",
            "stamm/netz-p2p.js",
            "stamm/feld-dsl.js",
            "stamm/feld-leben.js",
            "stamm/studio-bruecke.js",
            "stamm/werkstatt-*.js",
            "stamm/daten.js",
            "scripts/diag-praegung-welt.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = eine geteilte Regel oder Welt mit verbotenen Ops wird beim Laden benannt abgewiesen (RULE_FORBIDDEN_EFFECT_OPS), 0 Schreibe auf den frozen Kern",
    },
    {
        kriterium: "ultiversum.K5",
        staffel: 2,
        geraet: "headless",
        // ultiversum-k5-korpus: gate:v1-pfad --feind schickt den Korpus spec/abnahme/ki-feind-korpus.json (Kanarie-Marker in Bauplan,
        // Namen, Regeln, Tür) durch die echten Eingänge zu einem gehorsamen Modell; die Wand liest jede Erinnerung im ganzen Stamm
        befehl: ["node", "scripts/diag-v1-pfad.cjs", "--feind"],
        env: { V1_PFAD_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const soll = ["Wand", "erreicht", "ausgeführt", "Signatur", "Anzeige"].map((k) => new RegExp("^\\s*(✅|❌) FEIND " + k + ":"));
            const je = soll.map((re) => l.find((x) => re.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "Zeile fehlt (Exit " + lauf.exit + ")" };
            return { gruen: lauf.exit === 0 && je.every((x) => /✅/.test(x)), zahl: je.map((x) => x.trim().slice(0, 120)).join(" | ") };
        },
        pfad: [
            "stamm/*.js",
            "scripts/diag-v1-pfad.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
            "spec/abnahme/ki-feind-korpus.json",
            "spec/golden/v1/blueprint-signed.json",
        ],
        quelle: "2 = ein Korpus aus Prompt-Injektionen in Bauplänen, Namen und Regeln lenkt die KI nicht (0 ausgeführte fremde Anweisungen), die Signatur-Prüfung schlägt bei Manipulation an",
    },

    // ───────── halten.K4 — der Bogen (halten-k4-bogen) ─────────
    // gate:kampf-gefuehl Q12 (headless, 3 Winkel × 30/60/144 Hz): Staffel 1 die Bahn gegen die Parabel des Abschusses, Staffel 2 der
    // steckende Pfeil (Wand, Boden, Hirsch) über den Speicher-Rundlauf und die Zug-Kraft aus BOGENMAT; S14 nennt die alte Bahn beim
    // Namen. Am Kopf vor dem Zweig fehlt Q12 (ROT beim Namen). schmiede-core.js liegt im Baum an der Wurzel (KAMPF nennt worlds/schmiede/)
    ...[1, 2].map((staffel) => ({
        kriterium: "halten.K4",
        staffel,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kampf-gefuehl.cjs"],
        env: { KAMPF_GEFUEHL_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => new RegExp("^\\s*(✅|❌) Q12 halten\\.K4 Staffel " + staffel).test(x));
            const s = l.find((x) => /^\s*(✅|❌) SELBST-TEST \(S14\)/.test(x));
            const z = l.find((x) => /^\s*\(Q12\) Bahn /.test(x));
            if (!q) return { gruen: false, zahl: "keine Zeile Q12 halten.K4 Staffel " + staffel + " (Exit " + lauf.exit + ")" };
            return { gruen: /✅/.test(q) && !!s && /✅/.test(s), zahl: (z ? z.trim() : "") + (/❌/.test(q) ? " · " + q.trim() : "") };
        },
        pfad: [...KAMPF, "schmiede-core.js", "stamm/speicher-welten.js", "stamm/speicher-laden.js", "stamm/gelaende-chunks.js", "stamm/dirigent-takt.js", "stamm/dirigent-kern.js"],
        quelle:
            staffel === 1
                ? "1 = Flugbahn folgt Abschuss-Tempo und Schwerkraft (±5 % gegen die Parabel)"
                : "2 = der Pfeil steckt im getroffenen Ding und bleibt über den Reload, Zug-Kraft aus dem Bogen-Gesetz",
    })),
    // ───────── halten.K5 — Sturz, Tod und Wiederkehr als Zustand (halten-k5) ─────────
    // gate:kampf-gefuehl --k5 (echter Renderer, ?holz=kienspan): Q13 fährt den Takt des Spiels selbst — fünf Stürze über den
    // Leib-Löser (2 · 4 · 8 · 12 m und ein Wurf aus 4 m mit 8 m/s abwärts: der Schaden aus dem Aufprall-Tempo; ein fester Schaden
    // je Sturz fällt an der Reihe, ein Höhen-Zähler am Wurf — S17), zwei Wölfe fallen bei 60 Hz mit Leerlauf und bei 15 Hz ohne
    // (die Tod-Lage bei 0,6 s gleich), ein Wolf tötet den Spieler über den Biss-Weg, die Rückkehr am Genesis-Anker, verwundet
    // speichern, Reload; der Abdruck (Ort, Inventar, Lebenswerte, Bindung eines Fuchses) vor dem Speichern gleicht dem nach dem
    // Laden je Teil (S18: ohne Inventar ROT am Teil). An main 45c6aa19 ROT (swiftshader): Sturz 0 · 0 · 0 · 0 · 0 hp, Tod-Lage
    // 53,8° gegen 0° (ohne Leerlauf steht der Leib), Abdruck f0bd7b3a8baf → bb9065e89f5f (Leben und Bindung fallen im Reload);
    // am Zweig halten-k5 grün: 0 · 10,7 · 57,0 · 101,7 · 47,7 hp, 29,2° · 4,5 cm beide, 84864b15008e → 84864b15008e.
    {
        kriterium: "halten.K5",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // seit 29.10. die Probe HALTEN_K5 in der Welt der Sitzung (haltenK5Seite; vorher der eigene Boot `--k5`, 4 Soll-Minuten)
        probe: HALTEN_K5,
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q13 halten\.K5 Staffel 1/.test(x));
            const z = l.find((x) => /^\s*\(Q13\) /.test(x));
            if (!q || !z) return { gruen: false, zahl: "keine Zeile Q13 halten.K5 Staffel 1 (Exit " + lauf.exit + ")" };
            const stumm = ["S17", "S18"].filter((k) => !l.some((x) => /^\s*✅/.test(x) && x.includes("SELBST-TEST (" + k + ")")));
            const [, h1, h2, roh] = z.match(/\(Q13\) (\w+) → (\w+) (\{.*\})\s*$/) || [];
            let K = null;
            try { K = JSON.parse(roh); } catch (_e) { K = null; }
            const f = (v, n = 1) => (Number.isFinite(v) ? v.toFixed(n) : "?");
            const zahl = K
                ? "Sturz 2 · 4 · 8 · 12 m · Wurf: " + K.sturz.map((x) => f(x.d)).join(" · ") + " hp (Aufprall " + K.sturz.map((x) => f(x.v)).join(" · ") +
                  " m/s) · Tod-Lage 60 / 15 Hz " + K.lage.map(([w, y]) => f(w) + "° " + f(100 * y) + " cm").join(" / ") + " · Tod " + K.tod.q +
                  ", Anker " + f(K.tod.anker) + " m · Abdruck " + h1 + " → " + h2
                : "Q13-Zeile ohne Abdruck";
            const rot = /❌/.test(q) ? " · ROT: " + q.split("Zustand ").slice(1).join("").trim() : "";
            return { gruen: lauf.exit === 0 && /✅/.test(q) && !stumm.length, zahl: zahl + rot + (stumm.length ? " · Selbst-Test stumm: " + stumm.join(", ") : "") };
        },
        pfad: [...KAMPF, "koerper-core.js", "stamm/dirigent-takt.js", "stamm/dirigent-kern.js", "stamm/speicher-welten.js", "stamm/speicher-laden.js", "scripts/werkbank.cjs"],
        quelle: "1 = Fall-Schaden aus dem Aufprall-Tempo, Tod und Wiederkehr am Ort mit Zustand (Inventar, Bindung) über Speichern, an einem Gerät",
    },
    // halten.K5 Staffel 2 (halten-masse): derselbe Lauf `--k5` (Zwilling der Staffel 1, fährt einmal), Q14 nach dem Tod: die Werte des
    // Leibs (hpMax · staminaMax · manaMax · defense, `recomputePlayerStats`) je Mutation — der Brustpanzer aus Eisen · Bronze · Holz,
    // der Lebenssaft mit Kraut · Fleisch (`activateConsumable`) —, dann getragen und gegessen über den Reload (der Abdruck `werte`
    // ohne die Wunde, die Quellen der Nahrung). GRÜN: je Mutation andere Werte als die Geschwister und der leere Leib, Werte und
    // Nahrung nach dem Reload wie vor dem Speichern, S20 feuert. An halten-masse (headless, Null-Renderer): leer 116,0 hp ·
    // Eisen 154,9 · Bronze 152,7 · Holz 131,9 · Kraut 125,9 · Fleisch 127,2, Stand 184,01/104,48/92,87/19,84 vor = nach; an main
    // f1faa046 fiel die Nahrung im Reload (der Boost lebte nur auf der Wanduhr der Seite).
    {
        kriterium: "halten.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: HALTEN_K5, // seit 29.10. dieselbe Probe (Zwilling von #1)
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q14 halten\.K5 Staffel 2/.test(x));
            const z = l.find((x) => /^\s*\(Q14\) \{/.test(x));
            if (!q || !z) return { gruen: false, zahl: "keine Zeile Q14 halten.K5 Staffel 2 (Exit " + lauf.exit + ")" };
            const s20 = l.some((x) => /^\s*✅/.test(x) && x.includes("SELBST-TEST (S20)"));
            let Q = null;
            try { Q = JSON.parse(z.trim().slice(6)); } catch (_e) { Q = null; }
            const w = (a) => (Array.isArray(a) ? a.map((v) => (Number.isFinite(v) ? v.toFixed(1) : "?")).join("/") : "?");
            const zahl = Q
                ? "hpMax/staminaMax/manaMax/defense leer " + w(Q.leer) + " · Werk " + Object.entries(Q.werk || {}).map(([k, v]) => k + " " + w(v)).join(" · ") +
                  " · Nahrung " + Object.entries(Q.nahrung || {}).map(([k, v]) => k + " " + w(v)).join(" · ") + " · Stand " + (Q.stand || []).slice(0, 2).map(w).join(" → ") +
                  " · Nahrung im Stand " + JSON.stringify((Q.stand || []).slice(2))
                : "Q14-Zeile ohne Zahlen";
            const rot = /❌/.test(q) ? " · ROT: " + q.split("Werk und Nahrung ").slice(1).join("").trim() : "";
            return { gruen: /✅/.test(q) && s20, zahl: zahl + rot + (s20 ? "" : " · Selbst-Test S20 stumm") };
        },
        pfad: [...KAMPF, "koerper-core.js", "stamm/dirigent-takt.js", "stamm/dirigent-kern.js", "stamm/speicher-welten.js", "stamm/speicher-laden.js", "stamm/bau-*.js", "scripts/werkbank.cjs"],
        quelle: "2 = Lebenswerte lesen Werk und Nahrung (Mutation), beide Geräte",
    },
    // ───────── halten.K1 Staffel 2 — der Treffer aus dem Gesetz im Bild, Labor = Welt (halten-masse) ─────────
    // gate:kampf-gefuehl --k1 (echter Renderer, ?holz=kienspan, der ewige Loop läuft): das Langschwert trifft einen Hirsch über den
    // Klick-Dispatcher je Lauf vor · masse (MAT.*.rho × 1,25) · schneide (sigY der Stoff-Zeile × 1,5), am Treffer das Urteil des
    // Kerns (KE · p · edgeQ), das Bild hält (PNG {AUS}-<lauf>.png, Third) und die Schneide der gezeichneten Pose; dann dieselbe
    // Mutation im Labor (worlds/schmiede, `measure(P)`). GRÜN: jede Schneide ≥ 0,9 in der Bahn (Urteil und Bild), Labor = Welt
    // (Masse, Fase ± 0,5 %), Masse × 1,25 in Werk und wirksamer Masse des Treffers (± 2 %), die Schneide senkt die Fase und hebt
    // KE ÷ v², der Schaden folgt KE, S21 feuert. Das Vorher (main f1faa046): die Welt reichte edgeQ 1, die gezeichnete Pose
    // legte die Breitseite in die Bahn (edgeQ im Treffer-Takt 0,176–0,192, T18); an halten-masse 1,000.
    {
        kriterium: "halten.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // seit 29.10. die Probe HALTEN_K1 in der Welt der Sitzung (haltenK1Seite; vorher der eigene Boot `--k1`, 6 Soll-Minuten)
        probe: HALTEN_K1,
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const l = lauf.stdout.split(/\r?\n/);
            const q = l.find((x) => /^\s*(✅|❌) Q15 halten\.K1 Staffel 2/.test(x));
            const z = l.find((x) => /^\s*\(Q15\) \{/.test(x));
            if (!q || !z) return { gruen: false, zahl: "keine Zeile Q15 halten.K1 Staffel 2 (Exit " + lauf.exit + ")" };
            const s21 = l.some((x) => /^\s*✅/.test(x) && x.includes("SELBST-TEST (S21)"));
            let K = null;
            try { K = JSON.parse(z.trim().slice(6)); } catch (_e) { K = null; }
            const f = (v, n = 2) => (Number.isFinite(v) ? v.toFixed(n) : "?");
            const je = (k) => {
                const [w, b] = [K.welt[k] || {}, K.labor[k] || {}];
                return k + ": Treffer KE " + f(w.KE, 1) + " J · p " + f(w.p) + " · v " + f(w.v, 1) + " · Schaden " + f(w.schaden, 1) + " · edgeQ " + f(w.edgeQ, 3) +
                    "/Bild " + f(w.schneideBild, 3) + " · Werk " + f(w.kg, 3) + " kg β " + f(w.edgeWinkel, 1) + "° · Labor " + f(b.kg, 3) + " kg β " + f(b.edgeWinkel, 1) + "°";
            };
            const zahl = K && K.welt && K.labor ? ["vor", "masse", "schneide"].map(je).join(" | ") : "Q15-Zeile ohne Zahlen";
            const rot = /❌/.test(q) ? " · ROT: " + q.split("Labor-Werk ").slice(1).join("").trim() : "";
            return { gruen: lauf.exit === 0 && /✅/.test(q) && s21, zahl: zahl + rot + (s21 ? "" : " · Selbst-Test S21 stumm") };
        },
        pfad: [...KAMPF, "stamm/dirigent-takt.js", "worlds/schmiede/schmiede.js", "worlds/schmiede/index.html", "scripts/werkbank.cjs"],
        quelle: "2 = Schaden und Impuls aus Masse × Schneide × Tempo, eine Mutation in schmiede-core ändert Treffer UND Labor-Werk, im Bild beider Geräte",
    },
    // ───────── fahrzeug.K5 — Rückmeldung: der Körper fühlt die Fahrt (fahr-rueckmeldung) ─────────
    // (1) gate:fahr-leben --rueckmeldung (Rezept linse, `[linse-gpu]`): der GT fährt Glatt (auf dem Weg der Strecke, Vollgas), Drift
    // (12 m daneben auf der Wiese: Vollgas, dann Handbremse und volle Lenkung) und Hang (bergauf); je Kanal das Paar an seinem
    // Ausgang und die Mutante (Kopplung aus) ROT — RM2 die Federung im gezeichneten Bild (die Instanz-Matrix eines Aufbau-Blatts
    // gegen den Rahmen der Räder, je Ecke der Hülle): Drift-Wank ≥ 3 mm und ≥ 1,5× Glatt, die Antwort auf den Boden-Stoß
    // (vehicle-core `bodenStoss` ≥ 10 m/s²) ≥ 5 mm auf Glatt und am Hang; RM3 das Rumble an einem Pad mit Stub-vibrationActuator:
    // Drift stark ≥ 0,5, Glatt ≤ 0,1, das schwache Summen im Bild des Stoßes ≥ 0,4; RM1 die Stimme der Fahrt im Sattel, still
    // danach. (2) Der Motor-Klang am Klang-Abgriff: gate:klang-zensus (F) — der Grundton je Drehzahl am Master-Bus
    // (OfflineAudioContext), Hz je 1000 Upm fest ± 2 % über ≥ 4 Stufen (Mutante S13 „motor stumm“). An main ea07267e ROT (RM2
    // 0 Stöße: der Aufbau folgte jeder Unebenheit starr, die Antwort der Mutante 1,0–2,7 mm; RM3 kein Summen); am Zweig headless
    // Antwort Glatt/Hang 7,2/7,7 mm, Summen 0,54–0,60, Drift-Wank 8,6 gegen 0,5 mm, Rumble Drift 1,0 gegen Glatt 0,004;
    // swiftshader dasselbe Urteil (Antwort 8,0/9,9 mm). Erwartet an Radeon und GTX: RM1–RM3 ✅ und die Zeile (F) ohne „motor stumm“.
    // IN DER SITZUNG (29.10., proben-welt.cjs `fahrRueck`): RM über die Seiten-Probe des Gates (`probeLeben`, `nurRueck`) und der
    // Motor über `koerperSeite` der Klang-Linse (Landung und Doppler per Anker aus: klang.K4) in der warmen Welt — bis 29.10. zwei
    // eigene Boots samt ganzem Klang-Zensus (Radeon b3f9ae95: 5,06 min Arbeit). Die Strecke legt eine Straße und räumt Natur: mutiert.
    {
        kriterium: "fahrzeug.K5", staffel: 1, geraet: ["radeon", "gtx"],
        probe: { befehl: PW.torBefehl(PW.fahrRueck), sek: 35, mutiert: true },
        gpu: true, zeit: false, minuten: 30,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const rm = jsonZeile(teil("RM"), /^RUECKMELDUNG /);
            const gruen3 = [1, 2, 3].map((n) => new RegExp("^\\s*✅ RM" + n + " ", "m").test(teil("RM")));
            const motor = (teil("KLANG").match(/^── \(F\) DER KÖRPER KLINGT: Motor ([\d.]+) Hz je 1000 Upm/m) || [])[1];
            const stumm = /F motor stumm/.test(teil("KLANG"));
            if (!rm || !rm.echt) return { gruen: false, zahl: "keine Zeile RUECKMELDUNG (Exit " + lauf.exit + ")" };
            const w = (r, n, k) => (r && r[n] ? r[n][k] : "?");
            const [e, m] = [rm.echt, rm.mutiert];
            return {
                gruen: gruen3.every(Boolean) && !!motor && !stumm,
                zahl:
                    "Federung im Bild: Drift-Wank " + w(e, "drift", "wankMm") + " gegen Glatt " + w(e, "glatt", "wankMm") + " mm, Stoß-Antwort Glatt/Hang " +
                    w(e, "glatt", "antwortMm") + "/" + w(e, "hang", "antwortMm") + " mm (Mutante " + w(m, "glatt", "antwortMm") + "/" + w(m, "hang", "antwortMm") +
                    ") · Rumble Drift " + w(e, "drift", "stark") + " gegen Glatt " + w(e, "glatt", "stark") + ", Summen " + w(e, "glatt", "summen") + "/" +
                    w(e, "hang", "summen") + " (Mutante " + w(m, "drift", "stark") + ", " + w(m, "glatt", "summen") + ") · Motor " + (motor ? (+motor).toFixed(1) : "?") +
                    " Hz je 1000 Upm (klang-zensus F" + (stumm ? ", STUMM" : "") + ") · RM1–3 " + gruen3.map((g) => (g ? "✅" : "❌")).join(""),
            };
        },
        pfad: [...FAHRT, "stamm/klang.js", "klang-core.js", "scripts/diag-fahr-leben.cjs", "scripts/lib/fahr-proben.cjs", "scripts/lib/welt-boot.cjs", "scripts/diag-klang-zensus.cjs", "scripts/lib/wasser-linse.cjs"],
        quelle: "1 = ≥ 3 Kanäle mit gemessenem Paar aus dem Ausgabe-Pfad bzw. am Klang-Abgriff",
    },
    // ───────── fahrzeug.K1 — das Fahr-Gesetz: der Reifen mit Spitze (Staffel 1 Weg (a), fahrzeug-k1-reifen 2d01a8a7) ─────────
    // gate:fahr-leben K8 Reifen (--kern, Node): je Rezept und Achse die Seitenkraft des Kerns (`fahrKraefte`, dieselbe Funktion wie
    // Probefahrt und Welt) über den Schlupf 0,1–30°; das Urteil liest `REIFEN {achsen:[{wo, spitze, abfall}], hz, kostenUs}` —
    // an main 833bbc24 ROT: Spitze 8,7–11,5° (Plateau), Abfall 0 % an allen 10 Achsen
    {
        kriterium: "fahrzeug.K1", staffel: 1, geraet: "headless",
        befehl: ["node", "scripts/diag-fahr-leben.cjs", "--kern"], env: { FAHR_LEBEN_PORT: "{PORT}" }, gpu: false, zeit: false, minuten: 1,
        urteil: (j, lauf) => {
            const m = jsonZeile(lauf.stdout, /^REIFEN {/);
            const A = (m && m.achsen) || [];
            if (!A.length) return { gruen: false, zahl: "keine REIFEN-Zeile (Exit " + lauf.exit + ")" };
            const aus = A.filter((a) => !(a.spitze >= 6 && a.spitze <= 10 && a.abfall >= 0.15));
            const sp = A.map((a) => a.spitze);
            const ab = A.map((a) => Math.round(a.abfall * 100));
            return {
                gruen: A.length >= 10 && aus.length === 0,
                zahl: A.length + " Achsen (" + A.length / 2 + " Rezepte): Spitze " + Math.min(...sp) + "–" + Math.max(...sp) +
                    "°, Abfall bis 30° " + Math.min(...ab) + "–" + Math.max(...ab) + " %" +
                    (aus.length ? " · außer Soll: " + aus.map((a) => a.wo + " " + a.spitze + "°/" + Math.round(a.abfall * 100) + " %").join(", ") : ""),
            };
        },
        pfad: ["vehicle-core.js", "scripts/diag-fahr-leben.cjs"],
        quelle: "1 = (a) Seitenkraft mit Spitze bei 6–10° Schlupf und ≥ 15 % Abfall",
    },
    // ───────── fahrzeug.K1 — Staffel 2: das Fahr-Gesetz IN DER WELT (fahrzeug-k1-reifen, 25.10.) ─────────
    // gate:fahr-leben --kette (Node, Null-Renderer, ≤ 1 min): (a) aus der Zeile REIFEN (der Kern, wie #1); die Bremsungen der
    // W-Kette ab 50 km/h bis bremsV auf der Mess-Wiese (Gras: μ(kraut) der Stoff-Zeile über dem Grün der Boden-Karte) und auf
    // demselben Streifen als Weg (`_stlWegeBuild`, μ(erde)) je trocken und im Sturm (die EINE Nässe), dazu Gras mit halbem
    // μ(kraut) in der Stoff-Zeile (die Zeile wirkt, kein Grip-Faktor im Wirt); S1 (Labor = Welt) mit dem Takt des Kerns an
    // jedem Schritt der Welt — alles aus der Zeile `KETTE {roh}`. An main 206b395a ROT: die Welt reichte trocken μ 1 auf jeden
    // Boden (Gras/Weg 1,0), nass 0,7 (Bremsweg 1,28×), keine Zeile `weg`.
    {
        kriterium: "fahrzeug.K1", staffel: 2, geraet: "headless",
        befehl: ["node", "scripts/diag-fahr-leben.cjs", "--kette"], env: { FAHR_LEBEN_PORT: "{PORT}" }, gpu: false, zeit: false, minuten: 1,
        urteil: (j, lauf) => {
            const A = (jsonZeile(lauf.stdout, /^REIFEN {/) || {}).achsen || [];
            const r = (jsonZeile(lauf.stdout, /^KETTE {/) || {}).roh || {};
            const q = (a, b) => (r[a] && r[b] ? r[a].s / r[b].s : NaN);
            const L = r.labor || {};
            const z = (x) => (Number.isFinite(x) ? x.toFixed(2) : "?");
            const teile = {
                a: A.length >= 10 && A.every((x) => x.spitze >= 6 && x.spitze <= 10 && x.abfall >= 0.15),
                b: q("trocken", "weg") >= 1.5,
                nass: Math.min(q("sturm", "trocken"), q("wegNass", "weg")) >= 1.3,
                zeile: q("zeile", "trocken") >= 1.3,
                takt: L.hz >= 240,
                s1: L.schritte > 0 && L.maxM <= 0.01,
            };
            const aus = Object.keys(teile).filter((k) => !teile[k]);
            return {
                gruen: !aus.length,
                zahl: "(a) Spitze " + (A.length ? Math.min(...A.map((x) => x.spitze)) + "–" + Math.max(...A.map((x) => x.spitze)) + "°, Abfall ab " +
                    Math.round(Math.min(...A.map((x) => x.abfall)) * 100) + " %" : "?") +
                    " · (b) Bremsweg 50 → 0 km/h Gras " + z(r.trocken && r.trocken.s) + " / Weg " + z(r.weg && r.weg.s) + " m = " + z(q("trocken", "weg")) + "×" +
                    " · nass Gras " + z(q("sturm", "trocken")) + "×, Weg " + z(q("wegNass", "weg")) + "× · μ(kraut) halb " + z(q("zeile", "trocken")) + "×" +
                    " · Takt " + L.hz + " Hz · S1 " + L.maxM + " m (" + L.schritte + " Schritte)" + (aus.length ? " · außer Soll: " + aus.join(", ") : "") +
                    " · Exit " + lauf.exit,
            };
        },
        pfad: [
            "vehicle-core.js",
            "stamm/koerper-*.js",
            "stamm/bau-buch.js",
            "stamm/bau-vorlagen.js",
            "stamm/vegetation-wiese.js",
            "stamm/siedlung-satz.js",
            "stamm/gelaende-boden.js",
            "stamm/stoff-material.js",
            "stamm/bild-himmel.js",
            "stamm/dirigent-takt.js",
            "scripts/diag-fahr-leben.cjs",
            "scripts/lib/fahr-proben.cjs",
        ],
        quelle: "2 = (a) + (b) + nass ≥ 1,3× aus der EINEN Nässe + Sim-Takt im Fahr-Schritt ≥ 240 Hz, Labor = Welt S1 ≤ 0,01 m",
    },
    // ───────── tore.K1 — der Durchgang durch ein Welt-Tor (w16-tor-durchgang-pm) ─────────
    // Die Probe TORE_K1 in der Welt der Sitzung (toreK1Seite): der Spieler geht mit gehaltenem W in Ego und Third durch ein Welt-Tor in
    // eine schon besuchte Welt und zurück, t vom Kreuzen der Apertur bis zur ersten Eingabe mit Wirkung im Bild der Ziel-Welt, Luma je
    // Zwischenbild, Frame-Dauer, Welt-Wechsel je Durchgang. Die Zeile Studio-Tor (Staffel 2: beide Zeilen) misst sie nicht: das
    // Studio-Tor zeigt ein Vollbild-iframe ohne die Verb-Tafel der Welt. Am main 8efb6318 ROT (toreK1Seite, Kopf).
    {
        kriterium: "tore.K1", staffel: 1, geraet: ["radeon", "gtx"],
        probe: TORE_K1, gpu: true, zeit: true, minuten: 2,
        urteil: (j, lauf) => toreK1Urteil(lauf),
        proben: toreK1Proben(),
        pfad: [
            "stamm/netz-portal.js",
            "stamm/siedlung-ort.js",
            "stamm/speicher-laden.js",
            "stamm/speicher-welten.js",
            "stamm/dirigent-ankunft.js",
            "stamm/dirigent-takt.js",
            "stamm/koerper-bewegung.js",
            "index.html",
            "scripts/werkbank.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = eine Zeile (Studio-Tor oder Welt-Tor) ≤ 2 s an einem Gerät",
    },
    // ───────── tore.K3 — was der Spieler trägt, reist mit (tore-k3-abdruck) ─────────
    // gate:portal-konformanz K8: der Spieler geht in der echten Heimat durch jedes Studio-Tor des Genesis-Rings (W durch die
    // Apertur, am Teile-Tor E — nie ein Ruf der Übergabe) und mit Esc zurück; je Ring-Welt × Teil (Leib = Seele · Teile ·
    // Prägung des Mensch-Rezepts, Inventar = Slots · Hotbar, wield = Haupt-, Neben-Hand, Rüstung) der Abdruck (kanonisches
    // JSON + FNV-1a) vor dem Tor, drüben aus der Hülle (`AnazhHuelle.reisender`) und nach der Heimkehr. Das Urteil vergleicht
    // die Abdrücke der Zeile `K8 [[welt, weg, vor, drüben, nach, esc], …]` selbst, nie ein ok-Flag der Übergabe; Esc muss
    // heimbringen. An main 206b395a ROT: 0/30 (drüben hält keine Hülle etwas, daheim vor = nach).
    {
        kriterium: "tore.K3", staffel: 1, geraet: ["radeon", "gtx"],
        // seit 29.10. die Probe TORE_K3 in der Welt der Sitzung (toreK3Seite: nur K8; vorher der eigene Boot aller Welten, 5 Soll-Minuten)
        probe: TORE_K3, gpu: true, zeit: false, minuten: 2,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/).find((l) => l.startsWith("K8 ["));
            let R = null;
            try {
                R = z ? JSON.parse(z.slice(3)) : null;
            } catch (_e) {
                R = null;
            }
            if (!Array.isArray(R) || !R.length) return { gruen: false, zahl: "keine K8-Tafel (Exit " + lauf.exit + ")" };
            const T = ["leib", "inventar", "wield"];
            const rot = [];
            let heil = 0;
            for (const [welt, weg, vor, dr, nach, esc] of R)
                for (const t of T)
                    if (esc === true && vor && dr && nach && vor[t] === dr[t] && vor[t] === nach[t]) heil++;
                    else rot.push(welt + " " + t + (esc === true ? "" : " (Esc bringt nicht heim)"));
            return {
                gruen: R.length >= 10 && heil === R.length * T.length,
                zahl: heil + "/" + R.length * T.length + " Ring-Welten × Teile byte-gleich vor dem Tor · drüben · daheim (" +
                    R.map((r) => r[0] + " " + r[1]).join(", ") + ")" + (rot.length ? " · rot: " + rot.join(", ") : ""),
            };
        },
        pfad: [
            "stamm/netz-portal.js",
            "stamm/siedlung-ort.js",
            "stamm/koerper-bewegung.js",
            "worlds/huelle/huelle.js",
            "scripts/diag-portal-konformanz.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Leib, Inventar und Gehaltenes stehen nach Tor hin und zurück byte-gleich, an einem Gerät",
    },
    // ───────── tore.K3 Staffel 2 — auch Reittier/Fahrzeug und die Rundreise eines Werks (tk3-reittier) ─────────
    // Dieselbe Tafel `K8 [[welt, weg, vor, drüben, nach, esc], …]` von gate:portal-konformanz: der Spieler sitzt auf dem Pferd
    // (`state.player.mountedArch`), reitet durch jedes Tor des Genesis-Rings und kommt mit Esc zurück. Der Teil `reittier` (Art ·
    // Gestalt aus Bauplan, Saat, Maß, Tönung, Prägung · Glut · Bindung des gerittenen Werks) steht vor dem Tor aus der Heimat,
    // drüben aus der Hülle (das Gepäck der Übergabe, `_portalEnterPayload`) und daheim; ohne Abdruck vor dem Tor ritt er nicht
    // (rot, nie vakuös). Die Rundreise eines Werks Studio → Welt → Studio verlangt je Ziel-Seite den Teil `werk` (der Bau-Hash
    // des getragenen Werks, die Messung der Karte) — die Tafel trägt ihn nicht: ROT beim Namen, bis eine Linse ihn misst.
    // Ist an tk3-reittier (main eeaff9d6 + Schnitt, swiftshader): Leib, Inventar, Gehaltenes und Reittier je 10/10, Werk 0/10;
    // am Grund eeaff9d6 Reittier 0/10 (drüben fehlte es — das Gepäck trug es nicht).
    {
        kriterium: "tore.K3", staffel: 2, geraet: ["radeon", "gtx"],
        probe: TORE_K3, gpu: true, zeit: false, minuten: 2, // seit 29.10. dieselbe Probe (Zwilling von #1)
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/).find((l) => l.startsWith("K8 ["));
            let R = null;
            try {
                R = z ? JSON.parse(z.slice(3)) : null;
            } catch (_e) {
                R = null;
            }
            if (!Array.isArray(R) || !R.length) return { gruen: false, zahl: "keine K8-Tafel (Exit " + lauf.exit + ")" };
            const T = ["leib", "inventar", "wield", "reittier", "werk"];
            const rot = Object.fromEntries(T.map((t) => [t, []]));
            for (const [welt, , vor, dr, nach, esc] of R)
                for (const t of T)
                    if (!(esc === true && vor && dr && nach && vor[t] && vor[t] === dr[t] && vor[t] === nach[t]))
                        rot[t].push(welt + (esc === true ? (vor && vor[t] ? "" : " (kein Abdruck vor dem Tor)") : " (Esc bringt nicht heim)"));
            return {
                gruen: R.length >= 10 && T.every((t) => !rot[t].length),
                zahl: T.map((t) => t + " " + (R.length - rot[t].length) + "/" + R.length).join(" · ") +
                    " Ziel-Seiten byte-gleich vor dem Tor · drüben · daheim" +
                    T.filter((t) => rot[t].length).map((t) => " · rot " + t + ": " + rot[t].join(", ")).join(""),
            };
        },
        pfad: [
            "stamm/netz-portal.js",
            "stamm/siedlung-ort.js",
            "stamm/koerper-bewegung.js",
            "stamm/koerper-fahrt.js",
            "stamm/bau-vorlagen.js",
            "worlds/huelle/huelle.js",
            "scripts/diag-portal-konformanz.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = auch Reittier/Fahrzeug und die Rundreise eines Werks Studio → Welt → Studio mit gleichem Bau-Hash, für jede Ziel-Seite",
    },
    // ───────── tore.K5 — Teilen in EINER Geste an ein anderes Gerät (tore-k5-zweit) ─────────
    // gate:praegung-welt (T): B ist ein eigener Browser-Prozess mit frischem Profil (IDB + localStorage vor dem Boot leer), nie ein
    // Kontext im Chrome von A; beide treten per initP2PSync in einen Raum des signaling-servers, B kennt A erst am offenen
    // DataChannel und an der Vibe-Identität, die A dort bewies. A klickt Werkstatt → GT → Teilen, B gibt den Code in den Chat;
    // das Urteil liest die Zeilen der Probe am Text: anderes Gerät, der Selbsttest (B als Kontext ist ROT), Signatur von A, an
    // B's Pose (≤ 24 m, NDC im Sichtfeld am Null-Renderer — ein Bild an B's Pose misst die Station nicht), ≤ 10 s, Stempel und
    // Same, Bau-Hash A = B ≠ ungeprägt. An main 9ceeca71 ROT (die Geräte-Zeile fehlt: B war ein Kontext im selben Chrome); an
    // tk5-zweit GRÜN: Profil A ≠ B, Bau-Hash 9c183437/12 = 9c183437/12, 530 Zeichen, 866 ms.
    {
        kriterium: "tore.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-praegung-welt.cjs"],
        env: { PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: true,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = String(lauf.stdout || "").split(/\r?\n/);
            const soll = [
                ["Gerät", /^\s*(✅|❌) B ist ein ANDERES GERÄT: /],
                ["Selbsttest", /^\s*(✅|❌) SELBST-TEST: B als zweiter Kontext im Chrome von A ist ROT/],
                ["Signatur", /^\s*(✅|❌) B: Chat-Taste · Code · Enter — das Werk steht, Signatur von A/],
                ["Pose", /^\s*(✅|❌) B: gezeichnet an der eigenen Pose/],
                ["Zeit", /^\s*(✅|❌) ZEIT: Klick bis Code \+ Enter bis gezeichnet ≤ 10 s/],
                ["Stempel", /^\s*(✅|❌) B: Stempel und Same reisen tief gleich/],
                ["Bau-Hash", /^\s*(✅|❌) BAU-HASH A ↔ B byte-gleich/],
            ];
            const je = soll.map(([, re]) => l.find((x) => re.test(x)));
            const fehlt = soll.filter((_, i) => !je[i]).map(([n]) => n);
            if (fehlt.length) return { gruen: false, zahl: "Zeile fehlt: " + fehlt.join(", ") + " (Exit " + lauf.exit + ")" };
            const rot = soll.filter((_, i) => !/✅/.test(je[i])).map(([n]) => n);
            const nach = (i) => je[i].split(" — ").slice(1).join(" — ").slice(0, 160);
            return {
                gruen: !rot.length && lauf.exit === 0,
                zahl: (rot.length ? "ROT: " + rot.join(", ") + " · " : "") + "Zeit " + nach(4) + " · " + nach(6) +
                    " · Profil A, B, Kontext-Probe: " + (je[0].match(/profile-[\w-]+/g) || ["?"]).join(" · "),
            };
        },
        pfad: [
            "stamm/netz-identitaet.js",
            "stamm/netz-p2p.js",
            "stamm/feld-dsl.js",
            "stamm/feld-leben.js",
            "stamm/studio-bruecke.js",
            "stamm/werkstatt-*.js",
            "signaling-server.js",
            "scripts/diag-praegung-welt.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = ein Fluss (Bauplan oder Welt) an einem Gerät: A teilt, B (anderes Gerät, frisches Profil, IDB leer) öffnet; das Werk steht an B's Pose mit gleichem Bau-Hash und studioOv, Signatur gültig, ≤ 10 s",
    },
    // ───────── spielgang.K3 — Bedienung: HUD und Menü antworten, ohne das Bild zu verdecken (Zweig hud-zugang) ─────────
    {
        kriterium: "spielgang.K3",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // `werkbank bedienung` an der Mess-Wiese, 1920×1080, echtes Fenster: der Klick fängt den Zeiger (im Spiel), die HUD-Maske
        // aus dem Bild des Spielers (Canvas + DOM, der Loop steht: die Pixel, die sich mit verborgenem HUD ändern); dann je Runde
        // ein Klick auf jeden Hotbar-Platz (HUD) und Tab, Tab, I, Esc (Menü) als echte Eingabe im laufenden Loop — die INP (p98 der
        // Interaktionen, Event-Timing) misst das Bedienungs-Ohr des Spiels (`_bedienungInp`); gezählt sind die Interaktionen, die
        // der Browser zählt (performance.interactionCount: 5 Runden ≈ 50 HUD, 20 Menü — ein Klick, der in ein Bild fällt, das noch
        // rechnet, zählt nicht doppelt). Am Grund a03b7b06 fehlt das Verb
        // (ROT „keine Bedienung"); swiftshader in der Cloud: Deckung 12,51 % ohne → 3,18 % mit dem Spiel-Zustand (zwei Läufe gleich, HUD 50 · Menü 21 Interaktionen), INP Sekunden
        // (CPU-Raster, kein Urteil).
        // IN DER SITZUNG (29.10.): EIN Teleport an die Wiese, die HUD-Maske, 5 Runden echte Eingabe (das Urteil verlangt ≥ 30 HUD- und
        // ≥ 15 Menü-Interaktionen: 4 Runden reichen dem Menü nicht)
        probe: { ...sitzung(90,
            "boot",
            "timeout 60 $W fenster 1920 1080 > /dev/null 2>&1",
            "timeout 600 $W umstellen --ort wiese > /dev/null 2>&1",
            "teil BEDIENUNG $W bedienung --runden 5"
        ),  sek: 24 },
        env: K,
        gpu: true,
        zeit: true,
        minuten: 10,
        urteil: (j, lauf) => {
            const teil = (n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
            const b = jsonBlock(teil("BEDIENUNG"));
            if (!b || !b.inp || !b.inp.hud || !b.inp.menue) return { gruen: false, zahl: "keine Bedienung" + (b && b.fehler ? " — " + b.fehler : "") + " (Exit " + lauf.exit + ")" };
            const { hud, menue } = b.inp;
            const gruen = b.imSpiel === true && b.bild[0] === 1920 && b.deckungPct <= 5 && hud.n >= 30 && menue.n >= 15 && hud.inpMs <= 200 && menue.inpMs <= 200;
            return {
                gruen,
                zahl: "HUD deckt " + b.deckungPct + " % (" + b.bild.join("×") + (b.imSpiel ? ", im Spiel" : ", OHNE Zeiger-Fang") + ") · INP HUD " + hud.inpMs +
                    " ms (" + hud.n + ") · Menü " + menue.inpMs + " ms (" + menue.n + ")",
            };
        },
        pfad: [
            "index.html",
            "stamm/werkstatt-hud.js",
            "stamm/dirigent-*.js",
            "stamm/werkstatt-bauen.js",
            "scripts/werkbank.cjs",
            "scripts/lib/abnahme-urteil.cjs",
            "save-server.js",
        ],
        quelle: "1 = HUD und Menü antworten INP ≤ 200 ms und das HUD deckt ≤ 5 % des Bilds, an einem Gerät",
    },

    // ───────── spielgang.K5 — die Sprache des Spielers: die EINE Zählung (w5-spielgang-k5) ─────────
    // Die Station und gate:sprache lesen DIESELBE Code-Zählung (`scripts/diag-sprache.cjs`, per require in `sprachLauf` oben), das DOM
    // zählt `sprachLauf` (bis w6-spielgang-decke `diag-sprache.cjs --lebend` im Baum): bis w5-spielgang-k5 zählte die Station hier selbst jeden Text-Knoten des DOM als hart (707 an
    // 5fba36ea, auch „Anazh Realm“ aus der Tafel), die Wand in pseudo 19 — zwei Zählungen derselben Wahrheit. DAS GESETZ
    // (Pseudo-Lokalisierung): die Welt bootet am Null-Renderer in `?sprache=pseudo`, jedes Stück der Tafel trägt ⟦ ⟧, jeder
    // eingesetzte Wert ⁨ ⁩; ein Wort aus ≥ 2 Buchstaben außerhalb jeder Marke ist hart — im Text-Knoten, im Titel, in den
    // Text-Attributen (title · placeholder · aria-label · alt), auch eine Zeile der Tafel in einem Daten-Bereich (translate="no");
    // jede harte Zeile steht beim Namen ihres Erzeugers (Datei:Zeile Glied, die Erzeuger-Wache vor dem Boot). Dazu der Code am AST
    // (`code`: jede UI-Senke mit Wort-Text, jedes Daten-Etikett, jeder fehlende oder ungelesene Schlüssel). DER WECHSEL AM ORT:
    // `_spracheSetzen("en")` — jede Zeile, die danach noch ⟦ trägt, wechselte nicht (`stehen`). DER SELBSTTEST IM LAUF: die Zählung
    // pflanzt je Lauf eine harte und eine stehende Zeile und muss beide beim Namen nennen (`blind` leer), sonst ist sie blind.
    // Staffel 1: 0 harte Zeilen (Code und DOM) · 0 stehende · nicht blind · die Tafel AnazhRealm.TEXTE mit de und en.
    // Gemessen (headless, cloud): main 5fba36ea ROT (die alte Zählung 707 harte Zeilen; die neue findet dort keine TEXTE-Zeile) →
    // w5-spielgang-k5 GRÜN: 0 hart (DOM 0 von 1602 Zeilen, 1436 aus der Tafel, 166 Daten), 0 stehend, beide Mutanten genannt.
    {
        kriterium: "spielgang.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + sprachLauf + ")(process.argv[1], process.argv[2]);", "{PORT}", "{AUS}"],
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            j = j || jsonZeile(lauf.stdout, /^TEXTE \{/);
            if (!j || !Number.isFinite(j.glieder) || !(j.glieder > 0)) return { gruen: false, zahl: "keine TEXTE-Zeile (Exit " + lauf.exit + ")" + (j && j.fehler ? ": " + j.fehler : "") };
            if (j.sprache !== "pseudo" || !Number.isFinite(j.dom) || !Number.isFinite(j.stehen) || !Array.isArray(j.blind))
                return { gruen: false, zahl: "die Zählung ist nicht die EINE (keine Pseudo-Sprache, kein Wechsel am Ort, kein Selbsttest im Lauf)" + (j.fehler ? ": " + j.fehler : "") };
            const hart = j.code + j.dom;
            const namen = [...(j.hart || []).map((t) => "DOM " + t), ...(j.stehenNamen || []).map((t) => "STEHT " + t), ...(j.beispiele || []).filter((t) => /^[CKUHT]: /.test(t))];
            return {
                gruen: hart === 0 && j.stehen === 0 && j.blind.length === 0 && !!j.quelle && j.zeilen > 0 && j.markiert > 0,
                zahl:
                    hart + " harte UI-Zeilen (Code " + j.code + " · DOM " + j.dom + " von " + j.zeilen + " Zeilen, " + j.markiert + " aus der Tafel, " + j.daten + " Daten) · beim Wechsel auf en stehen " + j.stehen +
                    " · Selbsttest im Lauf " + (j.blind.length ? "BLIND: " + j.blind.join(" · ") : "nennt beide Mutanten") + " · Text-Quelle DE/EN: " + (j.quelle || "keine") +
                    (namen.length ? " · beim Namen: " + namen.slice(0, 3).join(" | ") : ""),
            };
        },
        proben: [
            { name: "jede Zeile aus der Tafel, der Wechsel lässt keine stehen", stdout: 'TEXTE {"glieder":3600,"code":0,"sprache":"pseudo","zeilen":1602,"markiert":1436,"dom":0,"hart":[],"daten":166,"quelle":"AnazhRealm.TEXTE (de 1972, en 1972)","stehen":0,"stehenNamen":[],"blind":[]}', gruen: true },
            { name: "eine harte Zeile im DOM (beim Namen ihres Erzeugers)", stdout: 'TEXTE {"glieder":3600,"code":0,"sprache":"pseudo","zeilen":1602,"markiert":1435,"dom":1,"hart":["stamm/werkstatt-bauen.js:1234 _renderHotbarInto · #hotbar>button.hotbar-slot>span.label: Drachentor"],"daten":166,"quelle":"AnazhRealm.TEXTE (de 1972, en 1972)","stehen":0,"stehenNamen":[],"blind":[]}', gruen: false },
            { name: "eine Zeile wechselt nicht mit der Sprache", stdout: 'TEXTE {"glieder":3600,"code":0,"sprache":"pseudo","zeilen":1602,"markiert":1436,"dom":0,"hart":[],"daten":166,"quelle":"AnazhRealm.TEXTE (de 1972, en 1972)","stehen":1,"stehenNamen":["stamm/werkstatt-hof.js:360 _recipeRow · span.recipe-name: ⟦Laterne⟧"],"blind":[]}', gruen: false },
            { name: "eine harte Senke im Code", stdout: 'TEXTE {"glieder":3600,"code":1,"beispiele":["C: stamm/probe.js:1 textContent: \\"Hallo Welt\\""],"sprache":"pseudo","zeilen":1602,"markiert":1436,"dom":0,"hart":[],"daten":166,"quelle":"AnazhRealm.TEXTE (de 1972, en 1972)","stehen":0,"stehenNamen":[],"blind":[]}', gruen: false },
            { name: "die Zählung blind (die Mutanten im Lauf ungenannt)", stdout: 'TEXTE {"glieder":3600,"code":0,"sprache":"pseudo","zeilen":1602,"markiert":1436,"dom":0,"hart":[],"daten":166,"quelle":"AnazhRealm.TEXTE (de 1972, en 1972)","stehen":0,"stehenNamen":[],"blind":["die gepflanzte harte Zeile fehlt in der Zählung"]}', gruen: false },
            { name: "die alte Zählung ohne Pseudo-Sprache und Wechsel", stdout: 'TEXTE {"glieder":4100,"gliederMit":0,"code":0,"dom":0,"senken":{},"quelle":"AnazhRealm.TEXTE (de 412, en 412)","beispiele":[]}', gruen: false },
            { name: "keine Tafel", stdout: 'TEXTE {"glieder":3600,"code":0,"sprache":"pseudo","zeilen":1602,"markiert":1436,"dom":0,"hart":[],"daten":166,"quelle":null,"stehen":0,"stehenNamen":[],"blind":[]}', gruen: false },
        ],
        pfad: ["stamm/", "index.html", "scripts/diag-sprache.cjs", "scripts/lib/welt-boot.cjs", "scripts/lib/stamm.cjs"],
        quelle: "1 = jede UI-Zeile aus EINER Text-Quelle in DE und EN (0 harte Strings, Zählung), an einem Gerät umgeschaltet",
    },
    // ───────── spielgang.K5 Staffel 2 (w8-sprache) — die KI antwortet in der Sprache des Spielers (kiSpracheLauf, kiSpracheUrteil oben) ─────────
    // Je Sprache (de · en) jeder Satz ihres Korpus-Teils über den Regel-Weg (ohne KI) und den Nexus-Weg (die KI gegen den Prüf-Anbieter,
    // der die Sprache des Prompts spricht); jede neue Zeile des Chats und der Stimme in der Sprache des Spielers, keine fremde, der
    // Prompt verlangt sie, „warum regnet es?" nennt den wahren Schreiber; der Selbsttest im Lauf (prompt-de · tafel-de · schreiber) ROT.
    // DAS MODELL: env KI_ENDPUNKT/KI_MODELL (die Farm stellt ollama mit qwen3:4b-instruct, am Laptop `--farm laptop`) — trägt der Anbieter
    // es, fragt die Probe es mit jedem Satz in beiden Sprachen und urteilt die Sprache jeder Antwort; sonst steht „MODELL ungemessen“
    // mit dem Grund in der Zahl (nie still). Gemessen (headless, cloud, w8-sprache): de.regel 42 Sätze · 46 Zeilen, fremd 0 · de.nexus
    // 43 · 159, fremd 0, Prompt 43/43 · en.regel 42 · 46, fremd 0 · en.nexus 43 · 158, fremd 0, Prompt 43/43 · Selbsttest 3/3 ROT; an der
    // Basis (w6-spielgang-decke) Prompt 0/43 und en.nexus 42 fremde Zeilen.
    {
        kriterium: "spielgang.K5",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "-e", "(" + kiSpracheLauf + ")(process.argv[1], process.argv[2]);", "{PORT}", "{AUS}"],
        env: { KI_ENDPUNKT: "http://127.0.0.1:11434/", KI_MODELL: "qwen3:4b-instruct" },
        gpu: false,
        zeit: false,
        minuten: 20,
        urteil: (j, lauf) => kiSpracheUrteil(j || jsonZeile(lauf.stdout, /^KISPRACHE \{/)),
        proben: KS_PROBEN,
        pfad: [
            "spec/abnahme/ki-korpus.json",
            "spec/profiband/ratsche-ki-korpus.json",
            "stamm/",
            "index.html",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "2 = die KI antwortet in der Sprache des Spielers (Korpus-Teil EN aus KI K1)",
    },
    // ───────── spielgang.K1 — die Schritte in EINER Sitzung aus aufgenommenen Eingaben (w8-spielgang-k1) ─────────
    // `spielgangLauf` oben: EINE Welt, die Spur des Spiel-Baums (spec/spielgang/k1-spur.json) über den Abspieler des Spiels, kein
    // eval und kein umstellen; das Urteil hält JEDEN Schritt, den die Spur trägt (mindestens 3), an der Zahl seines Bereichs, dazu
    // EIN Laden der Seite, jede Eingabe an ihrem Ziel und die Spur bis zu ihrem Ende. Gemessen (headless, cloud): main 8e6262cc
    // ohne Station (keine Aufnahme, kein Abspieler) → w8-spielgang-k1 GRÜN: die Zahlen im Bericht des Zweigs.
    {
        kriterium: "spielgang.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + spielgangLauf + ")(process.argv[1], process.argv[2], " + JSON.stringify(SPIELGANG) + ");", "{PORT}", "{AUS}"],
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            j = j || jsonZeile(lauf.stdout, /^SPIELGANG \{/);
            if (!j) return { gruen: false, zahl: "keine SPIELGANG-Zeile (Exit " + lauf.exit + ")" };
            if (j.fehler) return { gruen: false, zahl: "der Lauf brach: " + j.fehler };
            const schritte = spielgangSchritte(j, SPIELGANG);
            const rot = [];
            if (j.laden !== 1) rot.push(`die Seite lud ${j.laden}× (EIN Lauf ohne Neuladen)`);
            if (j.verfehlt !== 0) rot.push(`${j.verfehlt} Eingaben ohne Ziel`);
            if (!(j.eingaben > 0) || j.abgespielt !== j.eingaben) rot.push(`die Spur endet nicht: ${j.abgespielt} von ${j.eingaben} Eingaben abgespielt`);
            if (schritte.length < SPIELGANG.mindest) rot.push(`die Spur trägt ${schritte.length} Schritte (Soll ≥ ${SPIELGANG.mindest})`);
            for (const x of schritte) if (!x.ok) rot.push(`${x.m}: ${x.zahl}`);
            return {
                gruen: rot.length === 0,
                zahl:
                    `${schritte.filter((x) => x.ok).length}/${schritte.length} Schritte gehalten in EINER Sitzung (${j.laden}× geladen, ${j.eingaben} Eingaben aus der Spur, ${j.verfehlt} ohne Ziel): ` +
                    schritte.map((x) => `${x.m} ${x.zahl}`).join(" · ") + (rot.length ? " — ROT: " + rot.join(" | ") : ""),
            };
        },
        proben: [
            sgProbe("fünf Schritte aus der Spur, jeder hält seine Zahl", () => {}, true),
            sgProbe("die Kontrolle kommt nicht", (j) => (j.schritte.ankommen.kontrolleMs = 0)),
            sgProbe("die erste Eingabe fängt den Zeiger nicht", (j) => (j.schritte.ankommen.zeiger = false)),
            sgProbe("der Leib läuft keine 5 m", (j) => (j.schritte.laufen.wegM = 1.2)),
            sgProbe("der Blick dreht keine 45°", (j) => (j.schritte.laufen.blickGrad = 12)),
            sgProbe("die Sicht wechselt nicht", (j) => (j.schritte.laufen.sicht = "first")),
            sgProbe("das Werk der Werkstatt steht nicht", (j) => (j.schritte.bauen.werk = 0)),
            sgProbe("der Satz stellt kein Werk", (j) => Object.assign(j.schritte.ki, { werke: 0, art: "", satz: "Unbekannter Befehl" })),
            sgProbe("der Leib sitzt nicht auf der Bank", (j) => (j.schritte.benutzen.sitzt = false)),
            sgProbe("ein Schritt der Spur ungemessen", (j) => delete j.schritte.bauen),
            sgProbe("die Seite lud neu", (j) => (j.laden = 2)),
            sgProbe("Eingaben ohne Ziel", (j) => (j.verfehlt = 2)),
            sgProbe("die Spur endet nicht", (j) => (j.abgespielt = 40)),
            sgProbe("die Spur trägt nur zwei Schritte", (j) => ((j.marken = ["ankommen", "laufen", "ende"]), (j.schritte = { ankommen: j.schritte.ankommen, laufen: j.schritte.laufen }))),
            { name: "der Lauf brach (keine Spur im Baum)", stdout: 'SPIELGANG {"spur":"spec/spielgang/k1-spur.json","laden":1,"schritte":{},"fehler":"ENOENT: no such file or directory, open \'spec/spielgang/k1-spur.json\'"}', gruen: false },
        ],
        pfad: ["stamm/", "index.html", "spec/spielgang/k1-spur.json", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = ≥ 3 von 5 Schritten in EINER Sitzung gemessen gehalten an einem Gerät",
    },
    // ───────── spielgang.K4 — Zugänglichkeit aus dem Gesetz: die Untertitel (Zweig hud-zugang) ─────────
    {
        kriterium: "spielgang.K4",
        staffel: 1,
        geraet: "headless",
        // die Wand (Ü) der Klang-Linse, Zwilling von klang.K1#1: EIN Klang-Ereignis, zwei Leser (Ton und Zeile) — jedes Ereignis der
        // Tour mit Quelle (Treffer, Wasser, Abschied, Singen, Inventar, der Ruf auf Auftrag und Stufe) trägt seine Zeile, ein stilles
        // (Wasser auf trockenem Land, der Ruf ohne Leib) keine, jede gespielte Stimme an jedem Ort steht in der Umgebungs-Zeile, und
        // die Tafel `UNTERTITEL` deckt jeden Namen des Gesetzes (Stimmen · Ruf-Stimmungen · SUBSTANZ). Am Grund a03b7b06 fehlt die
        // Zeile (ROT); am Zweig 31 von 31. Die Mutante „Untertitel aus" fällt im Selbsttest der Linse (S14, gate:klang-zensus).
        befehl: ["node", "scripts/diag-klang-zensus.cjs", "--json", "{AUS}"],
        env: { KLANG_ZENSUS_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const z = (lauf.stdout.match(/^── \(Ü\) UNTERTITEL: (\d+) von (\d+) /m) || []).slice(1).map(Number);
            if (z.length !== 2) return { gruen: false, zahl: "keine Zeile (Ü) UNTERTITEL (Exit " + lauf.exit + ")" };
            const rot = ((j && j.rot) || []).filter((t) => /^Ü /.test(t));
            return {
                gruen: z[1] > 0 && z[0] === z[1] && rot.length === 0,
                zahl: z[0] + " von " + z[1] + " Klang-Ereignissen und Stimmen tragen ihre Zeile" + (rot.length ? " · " + rot.slice(0, 3).join(" · ") : ""),
            };
        },
        pfad: [
            "klang-core.js",
            "stamm/klang.js",
            "stamm/werkstatt-hud.js",
            "stamm/dirigent-kern.js",
            "index.html",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Untertitel für jede Stimme und jeden Ruf aus dem Klang-Gesetz ODER ein Farb-Modus (jede Klassen-Grenze unter Deuteranopie-Simulation ΔE ≥ 10)",
    },
    // spielgang.K4 Staffel 2 (w15-farbsicht): der Zugang — Farbsicht im Ausgabe-Bild, Komfort an seinen Quellen, Untertitel (zugangLauf,
    // zugangKomfort, zugangGrenzen, zugangUrteil oben)
    {
        kriterium: "spielgang.K4",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "-e", "(" + knapp(zugangLauf) + ")()", "{AUS}", "{PORT}", JSON.stringify(ZUGANG_KLASSEN), JSON.stringify(MACHADO_DEUTAN),
            knapp(zugangGrenzen), knapp(zugangFarbe), knapp(zugangKomfort)],
        gpu: false,
        zeit: false,
        minuten: 14,
        urteil: (j, lauf) => zugangUrteil(j || jsonZeile(lauf.stdout, /^ZUGANG /)),
        proben: ZUGANG_PROBEN,
        pfad: [
            "stamm/bild-kosten.js",
            "stamm/dirigent-takt.js",
            "stamm/koerper-bewegung.js",
            "stamm/werkstatt-hud.js",
            "stamm/speicher-*.js",
            "stamm/dirigent-kern.js",
            "stamm/klang.js",
            "klang-core.js",
            "index.html",
            "scripts/werkbank.cjs",
            "scripts/diag-klang-zensus.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/abnahme-urteil.cjs",
        ],
        quelle: "2 = beides und Bewegungs-Komfort (FOV, Kopfwackeln, Unschärfe aus)",
    },

    // ───────── ultiversum.K4 — Spieler schreiben Gesetze und teilen sie (Zweig w3t-spielergesetz) ─────────
    {
        kriterium: "ultiversum.K4",
        staffel: 1,
        geraet: "headless",
        // gate:mp-sync (h), zwei Seiten einer Maschine, ein echter Broker (Zwilling von feld.K2 — EIN Lauf): A schreibt im Gespräch
        // „wann immer es zufällig passt, dann erzähle …" (der EINE Satz-Parser `_regelAusSatz` → `rule` → `_registerWorldRule`,
        // der dsl-Kanal `p2pBroadcastDsl`); neu heißt: sein Hash (`_regelHash`) steht in keiner Vorlage (`GESETZ_VORLAGEN` und die
        // Gesetze, die A's Welt schon trägt). B trägt es, würfelt in 40 Scheiben der Welt-Uhr denselben Wurf, obwohl B drei
        // Platz-Nummern mehr zählt, und die Wirkung steht bei beiden (die Erzählung im Wissen, B's Tagebuch „Das Gesetz von …"),
        // gewartet bis zur Scheibe nach dem ersten wahren Wurf (die Welt-Uhr ist die Frist). Mutanten im selben Lauf: A sagt die
        // Vorlage → nicht neu; B's dsl-Kanal taub → B ohne das Gesetz. Am Grund 675a3889 fehlt (h) (ROT „keine (h)-Zeile"); mit
        // der alten Saat (Platz-Nummer + Feuer) und dem Gesetz des Mitspielers als Experiment ROT (Wurf VERSCHIEDEN, das Gesetz
        // schlief auf beiden Seiten, B's Tagebuch schweigt); am Zweig 0708ba56 GRÜN (Hash d7ff724d, Wurf gleich, wirkt bei A und B).
        befehl: ["node", "scripts/diag-mp-sync.cjs"],
        env: { MP_SYNC_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = String(lauf.stdout || "").split(/\r?\n/);
            const soll = [/^\s*(OK|ROT)\s+\(h\) A schreibt ein neues Gesetz/, /^\s*(OK|ROT)\s+\(h\) Selbsttest: /];
            const je = soll.map((re) => z.find((x) => re.test(x)));
            if (je.some((x) => !x)) return { gruen: false, zahl: "keine (h)-Zeile (Exit " + lauf.exit + ")" };
            return { gruen: je.every((x) => /^\s*OK/.test(x)), zahl: je.map((x) => x.trim().slice(0, 220)).join(" | ") };
        },
        pfad: [
            "stamm/feld-*.js",
            "stamm/netz-*.js",
            "stamm/werkstatt-*.js",
            "stamm/dienst.js",
            "stamm/dirigent-*.js",
            "signaling-server.js",
            "save-server.js",
            "scripts/diag-mp-sync.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = ein Spieler schreibt eine DSL-Regel im Spiel, sie wirkt und reist zum Mitspieler",
    },
    // ultiversum.K4 #2 (w5-s2-g5): die Probe `ultiversumK4Lauf` (oben) — das Andocken der studios.K5 (Rezept, Bauplan, Werk mit Stufe 0,
    // Speichern + Neuladen, der Wirt nennt die Art nie) für ein Buch, das der Spieler in der Bibliothek ablegt, gegen den Gegenlauf des
    // Server-Manifests; headless (Mechanik des Kern-Wegs, kein Bild).
    {
        kriterium: "ultiversum.K4",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "-e", "(" + knapp(ultiversumK4Lauf) + ")()", "{AUS}", "{PORT}"],
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => ultiversumK4Urteil(lauf),
        proben: ULTI_K4_PROBEN,
        pfad: ["stamm/netz-identitaet.js", "stamm/studio-bruecke.js", "stamm/feld-dsl.js", "stamm/speicher-*.js", "cores.manifest.json", "foundry-bruecke.js",
            "worlds/neuntes-buch/", "index.html", "scripts/lib/welt-boot.cjs"],
        quelle: "2 = ein Spieler-Gesetzbuch dockt über Studios K5 an",
    },

    // ───────── fahrzeug.K2 — die Fahrt kommt durch: das Wegenetz trägt das Rad (Staffel 1, w3t-wegenetz) ─────────
    // gate:fahr-leben --wegenetz: die feste Route der Saat — von der Mess-Wiese über die Orte −1,−5 · 0,−5 · 1,−6 · 2,−7 · 3,−6 ·
    // 4,−7 (je zwei Nachbarn im Wegenetz, `_wegenetzNachbarn`), die am Spieler erwachen wie im Spiel; die Feldwege zwischen ihnen
    // und die Nähte ihrer Netze legt das Gesetz (fachwerk `wegZwischen`, `wegeNetz`), die Route ist die kürzeste über das Netz
    // (`_wegenetzRoute`, 2632 m, Weg 98 %, Boden Wiese/Wald/Dorf); der GT fährt sie mit dem Fahrer am Steuer (`fahrerSetzen`:
    // Verb-Tafel → der EINE Fahr-Schritt des Kerns), die Telemetrie zählt der Sim-Schritt (FIXED_DT). Das Urteil liest
    // `WEGENETZ {…}`. An main 675a3889 ROT (kein Feldweg zwischen Orten, die Dorf-Netze in 4–6 Teilen: keine Route); die Mutante
    // (`--mutante`, die Weg-Erkennung aus: die Luftlinie) ROT (Weg 0, fest nach 120 m). Am Zweig headless: 0 Steckenbleiber, über
    // 0,8 · vmax 73,7 % (gemischte Bilder 8,3–33,3 ms) bzw. 75,3 % (`--gleich`, 60 fps) — der Sim-Schritt ist fest, die Welt
    // (Natur-Strom, Boden) kommt je Bild: 12 444 gegen 12 225 Takte, darum urteilen Radeon und GTX. Erwartet dort: Route ✅,
    // an ✅, Steckenbleiber 0 ✅, Tempo ❌ (~74 % gegen 80 %: drei Bäche quer — zwei Feldwege und eine Gasse von 4,−7 — und
    // die Ecken der Dörfer, je ~210 Takte unter 0,8 · vmax). DIE KARTE (w4-proben-heil): bis dahin fuhr `--wegenetz` den
    // Null-Renderer (diag-fahr-leben: nur `--rueckmeldung` zeichnete), kein `[linse-gpu]` stand im Lauf, und die Wand GPU wies jede
    // Fahrt ab (98ef98bb bis 73bdf938 GTX; dort Route 2579 m, gefahren 2577 m, Steckenbleiber 0, Tempo 78,1 % — das Spiel-ROT stand
    // hinter der Wand); in der Sitzung fährt die Probe in der Seite der Welt `--echt` (ihr Zeuge die Karte der Sitzung).
    // IN DER SITZUNG (29.10., proben-welt.cjs `fahrWegenetz`): die Seiten-Probe des Gates (`probeLeben`, `wegenetz`) in der warmen
    // Welt, der Dorf-Zug an wie das Gate vor dem Boot; die Route sind ~12 000 Sim-Schritte in den Bildern der Probe (die Welt kommt
    // je Bild) — die Ausnahme trägt sie. Kennt der Stand die Fahrt nicht, ROT beim Namen in Sekunden. Die Orte erwachen: mutiert.
    // DER BEZUG (06.11., FUND w16-fahrt-weg, entschieden vom Koordinator mit der Vollmacht des Schöpfers): „vmax" der Staffel ist
    // das Tempo, das das Wegenetz an der Stelle trägt — min(vmax des Wagens, Entwurfs-Tempo seiner Wegeklasse), die EINE Tafel des
    // Wegenetz-Gesetzes (`WEGENETZ.entwurfKmh`, RASt 06 / DWA-A 904), gelesen vom Fahrer UND von dieser Station (die Zeile trägt
    // `bezug`: die Tafel, vmax, den mittleren Bezug je Takt). Seit w11-fahrzeug (180d3a68) fährt der GT 63,8 m/s statt ~16: das
    // ideale Profil der Kern-Physik trug auf dieser Route höchstens 35,0 m/s = 0,55 · vmax, der Anteil über 0,8 · vmax war für
    // jeden Fahrer 0,0 %. Eine Zeile ohne Bezug aus der Tafel (der Bezug = vmax des Wagens) ist ROT beim Namen.
    // DIE TEILE (w19-fahrt-ziel-2-pm, 07.11.): seit w19-fahrt-ziel-2 (`_zellOrt` dreiwertig, die Orte warten auf ihr Wasser) fährt die
    // Probe in der Sitzung durch — und trägt ~127 s auf der GTX (Radeon: die Orte 43,1 s, die Fahrt 110,9 s in 2 029 Bildern), über
    // dem Deckel 45 s und über der ausnahme 90 s: jeder Lauf war UNGEMESSEN am Deckel. Jetzt fährt derselbe Lauf der Linse in Teil-
    // Proben je ≤ 45 s (`teile`, punkte.cjs fahreGruppe; die Naht `window.sleep` in proben-welt.cjs `fahrWegenetz`): EIN Lauf, EINE
    // Zeile, dasselbe Urteil über die ganze Route; reichen die Teile nicht, nennt der letzte die Frist (UNGEMESSEN beim Namen).
    // Headless an w19-fahrt-ziel-2 a67ca702 (swiftshader, die Sitzung der Maschine je frisch gebootet, der Läufer `fahreStation`):
    // vorher EINE Probe — Deckel 45 s gerissen, UNGEMESSEN; nachher 2 Teile 38,1 + 18,4 s und 38,0 + 20,1 s, GRÜN (Route 2440 m,
    // 0 Steckenbleiber, 89,3 % von 12 948 Sim-Schritten über 0,8 · Bezug). `teile` 6 trägt ~6 × 37 s Seite: die GTX (~127 s) in 4.
    {
        kriterium: "fahrzeug.K2", staffel: 1, geraet: ["radeon", "gtx"],
        probe: {
            befehl: PW.torBefehl(PW.fahrWegenetz),
            sek: 45,
            teile: 6,
            mutiert: true,
        },
        gpu: true, zeit: false, minuten: 10,
        urteil: (j, lauf) => {
            const m = jsonZeile(lauf.stdout, /^WEGENETZ {/);
            if (!m) return { gruen: false, zahl: "keine WEGENETZ-Zeile (Exit " + lauf.exit + ")" };
            const b = m.boden || {};
            // der Bezug kommt aus der Tafel des Wegenetzes: sie steht in der Zeile (je Klasse ein Tempo in km/h), und der mittlere
            // Bezug liegt unter vmax des Wagens — sonst zählte die Fahrt gegen die Höchstgeschwindigkeit (die Mutante der Proben)
            const z = m.bezug || {};
            const tafel = z.kmh && Object.keys(z.kmh).length > 0 && Object.values(z.kmh).every((v) => v > 0);
            const teile = {
                route: m.lang >= 2000 && m.wegAnteil >= 0.95,
                an: m.ende === true,
                steck: (m.steck || []).length === 0,
                bezug: !!tafel && z.mittel > 0 && z.mittel < 0.99 * z.vmax,
                tempo: m.anteil >= 0.8,
                boden: b.wiese > 0 && b.wald >= 0.1 && b.dorf >= 0.05,
            };
            const aus = Object.keys(teile).filter((k) => !teile[k]);
            const p = (x) => Math.round((x || 0) * 1000) / 10 + " %";
            // der Lauf in seinen Teil-Proben: je Halt an der Naht eine Zeile „WN Teil i/N“ (proben-welt.cjs `fahrWegenetz`)
            const halte = (String(lauf.stdout).match(/^ {2}WN Teil \d+\/\d+: /gm) || []).length;
            return {
                gruen: !aus.length && lauf.exit === 0,
                zahl: "in " + (halte + 1) + " Teil" + (halte ? "en" : "") + " · Route " + m.lang + " m (Weg " + p(m.wegAnteil) + "), gefahren " + m.weg + " m · Steckenbleiber " + (m.steck || []).length +
                    " · über 0,8 · Bezug " + p(m.anteil) + " von " + m.schritte + " Sim-Schritten (Bezug Ø " + (z.mittel > 0 ? (z.mittel * 3.6).toFixed(1) + " km/h" : "—") +
                    ", vmax " + (z.vmax > 0 ? (z.vmax * 3.6).toFixed(1) + " km/h" : "—") + (tafel ? "" : ", keine Tafel") + ") · Boden Wiese " + p(b.wiese) + " / Wald " + p(b.wald) +
                    " / Dorf " + p(b.dorf) + (aus.length ? " · außer Soll: " + aus.join(", ") : "") + " · Exit " + lauf.exit,
            };
        },
        proben: WEGENETZ_PROBEN,
        pfad: ["vehicle-core.js", "fachwerk-core.js", "voxel-worker.js", "stamm/koerper-*.js", "stamm/siedlung-*.js", "scripts/diag-fahr-leben.cjs", "scripts/lib/fahr-proben.cjs", "scripts/werkbank.cjs"],
        quelle: "1 = auf der festen 2-km-Route entlang Weg und Feldweg (Wiese → Wald → Dorf) 0 Steckenbleiber und ≥ 80 % der Takte über 0,8 × vmax, an einem Gerät",
    },

    // ───────── fahrzeug.K2 Staffel 2: STATION FEHLT (w28-station-quelle) ─────────
    // Die Staffel nennt 25°-Hang, Furt, Ego und Third — keine Probe misst sie (fahrWegenetz fährt EINE Sicht, die Route kennt keinen
    // 25°-Hang). Bis hier stand sie als Station mit `ohne` fest im Urteil, konstruiert ROT, und fuhr dazu den Verkehr der Stadt 12 s
    // je Stunde als Zwilling von C: C urteilen pflicht.C#1 (headless, 10 min) und pflicht.C#2 (das Band an stadt-voll, g6.js).

    // ───────── pflicht.C#1 — DER RICHTER VON PFLICHT-OFFEN C, ohne Punkte (w12-verkehr, 05.11.) ─────────
    // Bis hier maß C nur fahrzeug.K2#2: 12 s je Stunde in der Sitzung, ihr Urteil an Hang, Furt und Sichten gebunden — C stand
    // „ohne Richter“. Das Soll ist der Satz des Schöpfers (docs/PFLICHT-OFFEN.md C, 25.10.: „in der Stadt nH 300 bei Tag und bei
    // Nacht mindestens 20 Wagen mit Bewohnern am Steuer 10 min lang auf den Trassen — 0 Berührungen mit Leibern, Bauten und anderen
    // Wagen, jeder Wagen erreicht sein Ziel“), gelesen als Zahlen (PFLICHT_C): die Metropole des Messorts stadt-voll („dorf 7 300“,
    // ihr Gesetz nennt 20 Wagen: je 15 Häuser einer) um 10 und 23 Uhr je ≥ 600 s und 10 volle Minuten; in JEDER Probe ≥ 20 fahrende
    // Wagen mit einem Bewohner am Steuer, und wer im Bild fährt, zeigt ihn; jede Probe eines Fahrenden auf der Trasse (dem Boden, den
    // die Stadt als Weg malt — der EINE Leser der Wege-Karte `_aufWeg`, den die Natur-Wand liest); je Wagen und Minute ≥ 30 m (wer
    // fährt, steht keine Minute); 0 Berührung und 0 Stoß mit Leib, Bau und Wagen; jeder Wagen kam in der Stunde an einem Ziel an. Die
    // Probe ist die Linse VK (gate:fahr-leben --verkehr, headless — die Welt ohne Bild, die Mechanik; das Profi-Band im Verkehr misst
    // sie nie, es steht in pflicht.json C „ohne Richter“). Ihr Selbsttest im Spiel-Baum: `--verkehr --taeter` (Wagen 0 ohne Fahrer,
    // Wagen 1 neben der Trasse, je beim Namen). Vorher (main b62542c9, 05.11.): die Linse kennt die Maße des Richters nicht — ROT beim
    // Namen „Wagen mit Bewohner am Steuer undefined“; das übrige Kriterium hielt dort (20/20, 140 und 144 Ankünfte, 0 Berührungen).
    // Der erste Lauf des Richters nannte um 23 Uhr „am Steuer [19,132,[19,"steht"]]“: die Probe hieß die Stadt vor dem ersten Bild
    // nach dem Sprung der Uhr bereit, Wagen 19 stand, bis sein Nachtfahrer ankam — geschnitten in der Probe (erst ein Bild). Der
    // zweite nannte um 23 Uhr „abseits der Trasse [180000,20,[[5,667,410,…“: wer nach dem Schichtwechsel ausparkte, fuhr 9 m von der
    // Mitte seiner Wende über ungemalten Boden — der Bogen zwischen Platz und Kreis trug keinen Weg, geschnitten im Spiel
    // (`_verkehrPlatzBogen`, w12-verkehr).
    {
        kriterium: "pflicht.C",
        pflicht: true,
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-fahr-leben.cjs", "--verkehr"],
        env: { FAHR_LEBEN_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => pflichtCUrteil(lauf),
        proben: pflichtCProben(),
        pfad: ["vehicle-core.js", "fachwerk-core.js", "koerper-core.js", "stamm/koerper-*.js", "stamm/siedlung-*.js", "stamm/gelaende-kollision.js", "stamm/dirigent-takt.js", "scripts/diag-fahr-leben.cjs", "scripts/lib/fahr-proben.cjs", "scripts/lib/welt-boot.cjs", "spec/profiband/haushalt.json"],
        quelle: "PFLICHT-OFFEN C = in der Stadt nH 300 um 10 und 23 Uhr je 10 min in jeder Probe ≥ 20 Wagen mit Bewohnern am Steuer auf der Trasse, je Wagen und Minute ≥ 30 m, 0 Berührung mit Leib, Bau und Wagen, jeder Wagen am Ziel",
    },
];

// DAS SOLL VON PFLICHT-OFFEN C (pflicht.C#1) aus dem Satz des Schöpfers: Tag und Nacht, 20 Wagen, 10 min, wer fährt, steht keine Minute
const PFLICHT_C = { stunden: [10, 23], wagen: 20, sek: 600, minuten: 10, weg60M: 30 };
function pflichtCUrteil(lauf) {
    const t = String(lauf.stdout || "");
    const J = jsonZeile(t, /^VERKEHR {/);
    if (!J) return { gruen: false, zahl: "keine VERKEHR-Zeile (Exit " + lauf.exit + "): " + (t.split("\n").find((z) => /PROBE-FEHLER|❌/.test(z)) || "die Linse sprach nicht").trim().slice(0, 200) };
    const C = PFLICHT_C;
    const je = C.stunden.map((h) => {
        const m = J[h];
        if (!m) return h + " Uhr ROT: keine Messung";
        // die Maße der Linse: amSteuer [die wenigsten in einer Probe, die Probe, wer nicht fuhr …], trasse [Proben, abseits, Orte],
        // weg60 [der kürzeste Weg einer vollen Minute, Wagen, Minuten]
        const [b, s, z] = [m.beruehrt || {}, m.stoss || {}, m.ziele || {}];
        const [st, tr, w] = [m.amSteuer || [], m.trasse || [], m.weg60 || []];
        const fehl = [
            [m.soll >= C.wagen, "die Stadt fährt nach ihrem Gesetz " + m.soll + " Wagen (Soll ≥ " + C.wagen + ": nH 300)"],
            [st[0] >= C.wagen, "Wagen mit Bewohner am Steuer " + JSON.stringify(st[0]) + " in Probe " + st[1] + " (Soll ≥ " + C.wagen + " in jeder; nicht: " + JSON.stringify(st.slice(2)) + ")"],
            [!(m.stufe || {}).ohneFahrer, "im Bild ohne gezeichneten Fahrer " + (m.stufe || {}).ohneFahrer],
            [m.sek >= C.sek && w[2] >= C.minuten, "gemessen " + m.sek + " s, " + w[2] + " volle Minuten (Soll " + C.minuten + ")"],
            [tr[0] > 0 && tr[1] === 0, "abseits der Trasse " + tr[1] + " von " + tr[0] + " Proben " + JSON.stringify(tr[2] || null)],
            [w[0] >= C.weg60M, "in 60 s " + w[0] + " m (Wagen " + w[1] + "; Soll ≥ " + C.weg60M + " m)"],
            [!b.leib && !b.bau && !b.wagen && !s.leib && !s.bau && !s.wagen, "Berührung Leib " + b.leib + " · Bau " + b.bau + " · Wagen " + b.wagen + " · Stoß " + JSON.stringify(s)],
            [Array.isArray(z.ohne) && !z.ohne.length, "ohne Ziel erreicht: Wagen " + JSON.stringify(z.ohne)],
        ].filter(([ok]) => !ok).map(([, n]) => n);
        return h + " Uhr " + (fehl.length ? "ROT: " + fehl.join(" · ")
            : "GRÜN: " + st[0] + " am Steuer in jeder Probe, Trasse " + tr[0] + "/" + tr[0] + ", Minute ≥ " + w[0] + " m, " + z.erreicht + " Ankünfte, 0 Berührung");
    });
    return { gruen: je.every((x) => / GRÜN: /.test(x)), zahl: "C " + je.join(" · ") };
}
// die Roh-Ausgaben des Richters: eine gesunde Messung und je Bruch des Satzes ein Mutant — der Wagen ohne Fahrer und der Wagen
// abseits der Trasse zuerst (die Täter des Auftrags), dann Minute, Dauer, Berührung, Nacht und der Stand vor dem Richter
function pflichtCProben() {
    const g = { soll: 20, amSteuer: [20, 0], sek: 600, stufe: { ohneFahrer: 0 }, trasse: [180000, 0, []], weg60: [189, 3, 11],
        beruehrt: { leib: 0, bau: 0, wagen: 0 }, stoss: { wagen: 0, bau: 0, leib: 0 }, ziele: { erreicht: 142, ohne: [] } };
    const zeile = (an10 = {}, an23 = {}, ohne) => {
        const J = { 10: { ...g, ...an10 }, 23: { ...g, ...an23 } };
        if (ohne) delete J[ohne];
        return "  ✅ VK (PFLICHT-OFFEN C) der Verkehr der Stadt um 10 Uhr\nVERKEHR " + JSON.stringify(J);
    };
    return [
        { name: "Tag und Nacht nach dem Satz", stdout: zeile(), gruen: true },
        { name: "ein Wagen ohne Fahrer um 23 Uhr", stdout: zeile({}, { amSteuer: [19, 0, [0, "faehrt", "nachtfahrer", true]] }), gruen: false },
        { name: "ein Wagen abseits der Trasse um 10 Uhr", stdout: zeile({ trasse: [21000, 372, [[1, 926, 305, 104]]] }), gruen: false },
        { name: "ein Wagen steht eine Minute", stdout: zeile({ weg60: [0, 3, 11] }), gruen: false },
        { name: "12 s statt 10 min (die Probe der Sitzung)", stdout: zeile({ sek: 12, weg60: [null, 0, 0] }), gruen: false },
        { name: "Wagen in Wagen", stdout: zeile({ beruehrt: { leib: 0, bau: 0, wagen: 2 } }), gruen: false },
        { name: "die Nacht fehlt", stdout: zeile({}, {}, "23"), gruen: false },
        { name: "der Stand vor dem Richter: die Linse kennt seine Maße nicht", stdout: zeile({ amSteuer: undefined, trasse: undefined, weg60: undefined }), gruen: false },
        { name: "keine VERKEHR-Zeile", stdout: "  ❌ VK (PFLICHT-OFFEN C) der Verkehr der Stadt um 10 Uhr — PROBE-FEHLER", gruen: false },
    ];
}

// DAS SOLL VON tore.K1 Staffel 1 aus der Messung der Karte: je Lauf in eine schon besuchte Welt höchstens 2 s vom Kreuzen der Apertur bis
// zur ersten Eingabe mit Wirkung im Bild, jedes Bild dazwischen in Luma 0,05–0,95, kein Frame über 100 ms, EIN Welt-Wechsel (ein Tor,
// das den Ankommenden zurückwirft, ist kein Durchgang); mindestens vier Läufe, Ego und Third
const TORE_K1_SOLL = { ms: 2000, luma: [0.05, 0.95], frameMs: 100, laeufe: 4 };
function toreK1Urteil(lauf) {
    const t = String(lauf.stdout || "");
    const J = jsonZeile(t, /^TOR_K1 \{/);
    const bruch = (/^@@PUNKTE@@ (?:FEHLER|FRIST) (.*)$/m.exec(t) || [])[1];
    if (!J || !Array.isArray(J.laeufe)) return { gruen: false, zahl: "keine TOR_K1-Zeile (Exit " + lauf.exit + ")" + (bruch ? ": " + bruch.slice(0, 200) : "") };
    const S = TORE_K1_SOLL;
    const besucht = J.laeufe.filter((l) => !l.geboren);
    const rot = [];
    for (const l of besucht) {
        const f = [];
        if (l.fehler) f.push(l.fehler);
        if (!(l.ms != null && l.ms <= S.ms)) f.push("t " + (l.ms == null ? "ohne sichtbare Eingabe" : l.ms + " ms"));
        if (l.dunkel || l.hell) f.push(l.dunkel + " Bilder schwarz und " + l.hell + " weiß (Luma " + l.lumaMin + "–" + l.lumaMax + ")");
        if (l.ohneBild) f.push(l.ohneBild + " Bilder ohne Luma");
        if (l.ueber100) f.push(l.ueber100 + " Frames über " + S.frameMs + " ms (bis " + l.frameMax + ")");
        if (l.wechsel !== 1) f.push(l.wechsel + " Welt-Wechsel");
        if (f.length) rot.push("#" + l.nr + " " + l.sicht + " " + l.von + "→" + l.ziel + ": " + f.join(", "));
    }
    const sichten = new Set(besucht.map((l) => l.sicht));
    const fehlt = [];
    if (besucht.length < S.laeufe) fehlt.push(besucht.length + " Läufe in schon besuchte Welten (Soll ≥ " + S.laeufe + ")");
    for (const s of ["ego", "third"]) if (!sichten.has(s)) fehlt.push("keine Sicht " + s);
    // der Täter des langsamsten Laufs: die letzte Lücke des ersten Weltbilds, die ihn hielt
    const lahm = besucht.filter((l) => l.ms != null).sort((a, b) => b.ms - a.ms)[0];
    const luecke = lahm && (J.luecken || []).filter((x) => x[0] === lahm.nr && x[2] && (x[1] == null || x[1] <= lahm.ms)).pop();
    const geb = J.laeufe.find((l) => l.geboren);
    const zahl =
        "t " + besucht.map((l) => l.sicht + " " + (l.ms == null ? "—" : l.ms)).join(" · ") + " ms (Soll ≤ " + S.ms + ")" +
        ((lm) => (lm.length ? " · Luma min " + Math.min(...lm) : ""))(besucht.map((l) => l.lumaMin).filter((v) => v != null)) +
        ((fm) => (fm.length ? " · Frame max " + Math.max(...fm) + " ms" : ""))(besucht.map((l) => l.frameMax).filter((v) => v != null)) +
        (geb ? " · Geburt " + (geb.ms == null ? "—" : geb.ms) + " ms" : "") + (J.heim === false ? " · endet nicht daheim" : "") +
        (fehlt.length ? " · " + fehlt.join(", ") : "") + (rot.length ? " · rot: " + rot.join("; ") : "") +
        (luecke && rot.length ? " · es hielt (#" + lahm.nr + " bei " + luecke[1] + " ms): " + luecke[2] : "");
    return { gruen: !rot.length && !fehlt.length, zahl };
}
// die Roh-Ausgaben des Richters: fünf Läufe nach dem Soll und je Bruch der Staffel ein Mutant — das Tor ohne Vorwärmen (der Wechsel von
// heute, 6,9 s) und das schwarze Zwischenbild (der Ladeschirm, Luma 0,043) zuerst
function toreK1Proben() {
    const lauf = (nr, sicht, an = {}) => ({ nr, sicht, geboren: false, von: nr % 2 ? "b0000000" : "a0000000", ziel: nr % 2 ? "a0000000" : "b0000000", ms: 1400, ankunftMs: 600,
        schirmMs: 0, bilder: 84, lumaMin: 0.21, lumaMax: 0.48, dunkel: 0, hell: 0, ohneBild: 0, frameMax: 48, ueber100: 0, wechsel: 1, fehler: null, ...an });
    const zeile = (an = {}, je = {}) => {
        const laeufe = [{ ...lauf(0, "ego"), geboren: true, ms: 1900 }, ...["ego", "third", "ego", "third", "ego"].map((s, i) => lauf(i + 1, s, je[i + 1]))];
        return "@@PUNKTE@@ ZEIT ende 41.0 s\nTOR_K1 " + JSON.stringify({ luecken: [[2, 400, "der Boden wächst (3 Stücke im Bild)"]], schirmLuma: 0.043, heim: true, laeufe, ...an });
    };
    return [
        { name: "fünf Läufe nach dem Soll", stdout: zeile(), gruen: true },
        { name: "ein Tor ohne Vorwärmen (der Wechsel von heute: 6,9 s)", stdout: zeile({}, { 2: { ms: 6900, schirmMs: 6850 } }), gruen: false },
        { name: "ein schwarzes Zwischenbild (der Ladeschirm, Luma 0,043)", stdout: zeile({}, { 3: { lumaMin: 0.043, dunkel: 41, schirmMs: 700 } }), gruen: false },
        { name: "ein weißes Zwischenbild", stdout: zeile({}, { 1: { lumaMax: 0.97, hell: 3 } }), gruen: false },
        { name: "ein Frame von 734 ms", stdout: zeile({}, { 4: { frameMax: 734, ueber100: 1 } }), gruen: false },
        { name: "das Tor wirft zurück (drei Welt-Wechsel)", stdout: zeile({}, { 1: { wechsel: 3 } }), gruen: false },
        { name: "keine Eingabe sichtbar", stdout: zeile({}, { 5: { ms: null } }), gruen: false },
        { name: "Bilder ohne Luma", stdout: zeile({}, { 2: { ohneBild: 12 } }), gruen: false },
        { name: "nur Ego", stdout: zeile({}, { 2: { sicht: "ego" }, 4: { sicht: "ego" } }), gruen: false },
        { name: "drei Läufe", stdout: zeile({ laeufe: [lauf(1, "ego"), lauf(2, "third"), lauf(3, "ego")] }), gruen: false },
        { name: "nur die Geburt", stdout: zeile({ laeufe: [{ ...lauf(0, "ego"), geboren: true }] }), gruen: false },
        { name: "kein Tor zurück (das Heimtor fiel am Ring)", stdout: zeile({}, { 1: { ms: null, fehler: "kein Tor nach a0000000 in b0000000" } }), gruen: false },
        { name: "keine TOR_K1-Zeile", stdout: "@@PUNKTE@@ FEHLER Error: obtainPortalForWorld", gruen: false },
    ];
}

module.exports = stationen;
module.exports.spurAufnahme = spurAufnahme; // die Aufnahme der Spur von Hand (spielgang.K1#1)

// NICHT FASSBAR als Station (befehl null): das Werkzeug fehlt oder die Staffel verlangt, was EIN Lauf auf EINEM Gerät nie misst.
module.exports.fehlt = [
    // DIE FAHRT (29.10., das Gesetz des Schöpfers: eine Fahrt durch jedes System ≤ 30 min je Gerät): auf einer Karte misst jede Station
    // als Probe der EINEN Welt der Sitzung — tore.K5#2 fuhr gate:praegung-welt mit eigenem Boot (A und B je ein Browser, Radeon b3f9ae95
    // 1,69 min, ROT Kontrolle 7 699 ms; GTX 98ef98bb ROT 3,0 min)
    { kriterium: "tore.K5", staffel: 2, befehl: null, grund: "nicht als Probe der Sitzung gebaut: das Kriterium verlangt B als eigenen Browser-Prozess mit frischem Profil (das andere Gerät) neben A, und der Teil (T) samt WELT lebt inline im hauptLauf von scripts/diag-praegung-welt.cjs (686 Z., L S N G R B K T F U in EINEM Lauf mit eigener Welt A) — ohne Seiten-Funktion des Teils (T) im Spiel-Baum misst keine Probe A in der Welt der Sitzung; der eigene Boot je Station ist auf radeon|gtx gefallen (die Fahrt ≤ 30 min). Letzte Messung: Radeon b3f9ae95 ROT (Kontrolle 7 699 ms > 5 s), GTX 98ef98bb ROT. GPU-Station wartet auf die Prüfbühne (w5-s2-g5, 03.11.): „beide Flüsse an beiden Geräten“ — die Fahrt hat Radeon 17 / GTX 16 s frei, zwei Browser-Prozesse mit eigenem Boot passen nie in sie" },
    // p3-stationen-g456 (01.11.): DIE FAHRT trägt keine neue Probe — die Summe der Deckel steht Radeon 1 790 / GTX 1 785 von 1 800 s
    // (FAHRT_MAX_S samt Boot); was hier steht, braucht einen eigenen Lauf mit Sekunden, die erst die Eich-Fahrt freigibt, oder ein
    // Werkzeug oder Spiel, das es nicht gibt — je Eintrag beim Namen
    { kriterium: "tore.K2", staffel: 1, befehl: null, grund: "nicht gebaut (p3-stationen-g456): zwei Bilder aus dem Ausgabe-Pfad je Tor — die Membran 3 m vor der Apertur und das Welt-Bild nach der ersten Eingabe, die die Kamera ≥ 1° drehte — und Spearman r ≥ 0,5, milchweiss ≤ 0,05, oeffnungBunt ≥ 20, Stempel frisch; derselbe Gang wie tore.K1 (die Fahrt hat 10 s frei); die Klassen tor-fern, tor-bunt, tor-ziel der Soll-Tafel tragen am Kopf kein Ist" },
    { kriterium: "tore.K4", staffel: 1, befehl: null, grund: "unmessbar in EINEM Lauf auf EINEM Gerät: zwei physische Geräte im LAN (Radeon-Maschine und OMEN) über den signaling-server, der Peer im Ausgabe-Bild von B — die Punkte-Maschine fährt je Gerät eine eigene Sitzung, und kein Läufer verbindet zwei Sitzungen zweier Rechner; gate:mp-sync fährt zwei Seiten in EINEM Browser (das Schlupfloch der Staffel)" },
    { kriterium: "spielgang.K2", staffel: 1, befehl: null, grund: "unmessbar ohne Blind-Spieler: ein frischer Agent ohne Doku, der nur Bild und Eingabe kennt und in ≤ 3 min gehen, umsehen, Sicht-Wechsel, Werkstatt, Satz und Tor findet — kein solcher Agent läuft an der Punkte-Maschine (ein Läufer mit Bild-Modell und Eingabe-Schleife fehlt); die Zählung am Eingabe- und Ereignis-Strom gäbe es (`H.ereignisStrom`, stationen/sitzung-seite.js)" },
    // fahrzeug.K2#2 ist seit w4-sitzung-reif eine Station (der Verkehr der Stadt, PFLICHT-OFFEN C); ihre übrigen Teile nennt sie selbst:
    // die feste Route der 1 quert drei Bäche (Furten: zwei Feldwege und eine Gasse von 4,−7), aber keinen 25°-Hang — das Wegenetz legt
    // keinen Weg so steil (die Trassen fallen höchstens um `gefaelle`), ein Hang-Teil braucht eine eigene Strecke am Messort hang
    // (−526/−853, 24,4°); die Seiten-Probe `fahrWegenetz` fährt EINE Sicht, Ego und Third getrennt misst keine.
];

// ─────────── DAS MASS DER ZEIT-STATIONEN (das Gesetz der Fremd-Last, punkte.cjs fremdUrteil; stationen/mass.cjs) ───────────
// je Zeit-Station ein Feld NEBEN ihrem Urteil, nie im Abdruck: aus derselben Ausgabe die Zahlen, an denen ihr Urteil fällt, gegen ihr Soll.
// DAS OHR AM RICHTER DER LATENZ: leib.K1#1 · K1#2 · halten.K2#1 nennen Reihen und Soll EINMAL, im Urteil — ihr Maß fragt das Urteil, mit
// welchen Reihen es latenzSchlechtester ruft (der Richter wird für diesen einen Ruf belauscht), und nimmt je Reihe das schlechteste p95
function latenzGehoert(urteil, j, lauf) {
    const vor = latenzSchlechtester, rufe = [];
    latenzSchlechtester = (...a) => (rufe.push(a), vor(...a));
    try {
        urteil(j, lauf);
    } finally {
        latenzSchlechtester = vor;
    }
    return rufe;
}
const latenzMassDesUrteils = (j, lauf, urteil) => {
    const da = ((j && j.laeufe) || []).filter((l) => l && l.reihen);
    if (da.length < LAEUFE) return [];
    // das Soll des Rufs, sonst die Vorgabe des Richters (50 ms)
    return latenzGehoert(urteil, j, lauf).flatMap(([, ids, , soll = 50]) => ids.filter((id) => da.every((l) => l.reihen[id]))
        .map((id) => ({ wort: id + " p95 ms", wert: Math.max(...da.map((l) => l.reihen[id].p95)), soll })));
};
const teilVon = (lauf, n) => lauf.stdout.split(/^@@PUNKTE@@ /m).find((s) => s.startsWith(n + "\n")) || "";
require("./mass.cjs").massAn(module.exports, {
    // die Rückkehr nach dem Orbit und der Ruck je Bild
    "fahrzeug.K3#2": (j, lauf) => {
        const t4 = jsonZeile(teilVon(lauf, "FAHR"), /^\s*(✅|❌) T4 /), t5 = jsonZeile(teilVon(lauf, "FAHR"), /^\s*(✅|❌) T5 /);
        const b = jsonBlock(teilVon(lauf, "WELT")), w = b && (b.ergebnis || b);
        if (!t4 || !t5 || !w || !w.drift || !w.rueck || w.fehler) return [];
        return [{ wort: "Rückkehr nach dem Orbit s", wert: w.rueck.rueckS, soll: 1.5 }, { wort: "Ruck p95 m", wert: t4.ruckP95, soll: 0.02 }];
    },
    "leib.K1#1": latenzMassDesUrteils,
    "leib.K1#2": latenzMassDesUrteils,
    "halten.K2#1": latenzMassDesUrteils,
    // der Ruck p95 je Gang gegen das Soll, das die Linse in ihrer K4-Zeile nennt
    "leib.K4#1": (j, lauf) => {
        const z = lauf.stdout.split(/\r?\n/).find((l) => /^\s*(✅|❌) K4 der Gang in Third/.test(l));
        const ruckSoll = z && /Ruck p95 ≤ (\d+(?:,\d+)?) m/.exec(z);
        if (!ruckSoll) return [];
        return lauf.stdout.split(/\r?\n/).filter((l) => /^\s+(stamm|fels|haus)\s/.test(l)).map((l) => [l.trim().split(/\s+/).slice(0, 2).join(" "), /Ruck p95 (\d+(?:\.\d+)?)/.exec(l)])
            .filter(([, m]) => m).map(([n, m]) => ({ wort: n + " Ruck p95 m", wert: +m[1], soll: +ruckSoll[1].replace(",", ".") }));
    },
    // je besuchtem Lauf t bis zur sichtbaren Eingabe und sein längster Frame
    "tore.K1#1": (j, lauf) => {
        const J = jsonZeile(String(lauf.stdout || ""), /^TOR_K1 \{/), S = TORE_K1_SOLL;
        if (!J || !Array.isArray(J.laeufe)) return [];
        return J.laeufe.filter((l) => !l.geboren).flatMap((l) => [{ wort: "#" + l.nr + " " + l.sicht + " t ms", wert: l.ms == null ? NaN : l.ms, soll: S.ms },
            { wort: "#" + l.nr + " " + l.sicht + " Frame max ms", wert: l.frameMax == null ? NaN : l.frameMax, soll: S.frameMs }]);
    },
    // Klick bis gezeichnet, wie die Zeile ZEIT der Linse sie nennt (Soll ≤ 10 s)
    "tore.K5#1": (j, lauf) => {
        const z = String(lauf.stdout || "").split(/\r?\n/).find((x) => /^\s*(✅|❌) ZEIT: Klick bis Code \+ Enter bis gezeichnet ≤ 10 s/.test(x));
        const ms = z && / — (\d+(?:\.\d+)?) ms\b/.exec(z);
        return ms ? [{ wort: "Klick bis gezeichnet ms", wert: +ms[1], soll: 10000 }] : [];
    },
    // die Antwort auf die Eingabe (INP) an HUD und Menü
    "spielgang.K3#1": (j, lauf) => {
        const b = jsonBlock(teilVon(lauf, "BEDIENUNG"));
        if (!b || !b.inp || !b.inp.hud || !b.inp.menue) return [];
        return [{ wort: "INP HUD ms", wert: b.inp.hud.inpMs, soll: 200 }, { wort: "INP Menü ms", wert: b.inp.menue.inpMs, soll: 200 }];
    },
});
// das erste Haus je nH (siedlung.K5#1 · K5#2: derselbe Lauf, dasselbe Soll). DAS AUSGEBLIEBENE HAUS (die OMEN 11.11., 3c8dce79: „nH 300
// erstes Haus nach — (kein Haus)“ fiel unter Last als „Bedingung ohne Zahl“ UNGEMESSEN): erwachte die Zelle und kam kein Haus, hielt
// dorfErwachen bis M.nachMs (8000 ms, probeDorf) nach dem Erwachen — sein Wert ist ≥ 8000 (`ab`, punkte.cjs massVon)
for (const staffel of [1, 2])
    require("./mass.cjs").massAn(module.exports, {
        ["siedlung.K5#" + staffel]: (j, lauf) => [12, 300].flatMap((nh) => {
            const b = jsonBlock(teilVon(lauf, "NH" + nh)), e = b && (b.ergebnis || b);
            const ms = e && !e.fehler && e.erstes ? e.erstes.ms : null;
            if (ms != null) return [{ wort: "nH " + nh + " erstes Haus ms", wert: ms, soll: 500, cpu: true }];
            return e && !e.fehler && e.erwacht && !e.erstes ? [{ wort: "nH " + nh + " erstes Haus ms", wert: null, ab: 8000, soll: 500, cpu: true }] : [];
        }),
    });
