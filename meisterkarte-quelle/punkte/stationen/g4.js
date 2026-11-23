// Stationen der Gruppe IV (src/g4.js · Schöpfung: Studios, Pipeline, KI, Spieler-Bauen). Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst ist jedes Kriterium mit Punkten am Kopf 452972a6 (studios.K2, pipeline.K3, pipeline.K4, ki.K1, bauen.K1, bauen.K3)
// und jedes, das ein Zweig im Stau kippen soll (uebergabe-kanal pipeline.K1, ki-regler ki.K2, editform-kern bauen.K4); die
// Messschuld M30–M43 trägt kein Kriterium dieser Gruppe. Jede Browser-Station fährt LINSE_GPU=software: lokal griffe
// starteBrowser sonst die Karte (scripts/lib/software-gpu.cjs), und eine Karte gibt es nur unter dem Schloss.
// Ein Eintrag mit befehl: null ist eine Staffel, die kein Werkzeug im Spiel-Baum messen kann — grund nennt, was fehlt.
"use strict";

const { jsonZeile } = require("../hilfe.cjs");

const zeilen = (t) => String(t || "").split(/\r?\n/);
const SOFT = { LINSE_GPU: "software" };

// ───────── DAS NETZ- UND PARSE-LOG DER FOUNDRY-FÄDEN (pipeline.K5, p3-stationen-g456) — läuft als `node -e` im Spiel-Baum ─────────
// Die Welt bootet am Null-Renderer (der Bauer lebt im Faden, nie am Bild); jeder Faden der Seite hängt sich über CDP an
// (Target.setAutoAttach, waitForDebuggerOnStart): VOR seinem ersten Skript legt die Probe einen Merker auf XMLHttpRequest.open
// (async === false zählt, die Ziel-URL beim Namen) und hört Netz (Network: Bytes je URL) und Parse (Debugger.scriptParsed: jede
// geparste URL) — erst dann läuft der Faden. Am Ende je Faden `THREE.REVISION` (die Kopie inline: 0 Bytes auf worlds/*/lib/three*,
// aber ein THREE anderer Revision als die Welt ist ROT) gegen die Revision der Welt. Foundry-Faden = ein Faden, der foundry-bruecke.js
// parste (Buch und Werk, stamm/studio-bruecke.js). Ein Faden, der vor dem Merker lief, ist BLIND beim Namen (ROT).
async function foundryFadenLog(port, aus) {
    const path = require("path");
    const fs = require("fs");
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const out = { weltRevision: null, faeden: [] };
    const schreibe = () => {
        fs.writeFileSync(aus, JSON.stringify(out));
        console.log("FAEDEN " + JSON.stringify(out));
    };
    const server = WB.statikServer();
    await server.lausche(Number(port));
    const { browser, page } = await WB.nullSeite({ frist: 300000 });
    try {
        const cdp = await page.target().createCDPSession();
        const namen = new Map();
        const sitzungen = [];
        cdp.on("Target.attachedToTarget", (e) => namen.set(e.sessionId, e.targetInfo.title || e.targetInfo.url));
        cdp.on("sessionattached", async (s) => {
            const f = { name: null, foundry: false, instrumentiert: false, threeBytes: 0, threeUrls: [], sync: [], revision: null, urls: {}, geparst: [] };
            const req = new Map();
            out.faeden.push(f);
            sitzungen.push([s, f]);
            s.on("Network.requestWillBeSent", (e) => req.set(e.requestId, e.request.url));
            s.on("Network.loadingFinished", (e) => {
                const u = req.get(e.requestId) || "?";
                f.urls[u] = (f.urls[u] || 0) + Math.max(0, e.encodedDataLength || 0);
            });
            s.on("Debugger.scriptParsed", (e) => e.url && f.geparst.push(e.url));
            try {
                await s.send("Runtime.enable");
                await s.send("Network.enable");
                await s.send("Debugger.enable");
                await s.send("Runtime.evaluate", {
                    expression:
                        "(() => { const L = (self.__punkteFaden = { sync: [] }); const o = XMLHttpRequest.prototype.open; " +
                        "XMLHttpRequest.prototype.open = function (m, u, a) { if (a === false) L.sync.push(String(u)); return o.apply(this, arguments); }; return true; })()",
                });
                f.instrumentiert = true;
            } catch (e) {
                f.fehler = String(e.message).slice(0, 160);
            }
            await s.send("Runtime.runIfWaitingForDebugger").catch(() => {});
        });
        await cdp.send("Target.setAutoAttach", { autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
        await server.zeige(page, 120000);
        await page.evaluate(() => window.__weltDa((r) => r._foundry && r._foundry.ready && r.state._weltbildDa > 0));
        await WB.sleep(3000);
        out.weltRevision = await page.evaluate(() => (typeof THREE !== "undefined" ? THREE.REVISION : null));
        for (const [s, f] of sitzungen) {
            f.name = namen.get(s.id()) || s.id();
            const r = await s
                .send("Runtime.evaluate", { expression: "JSON.stringify({ sync: (self.__punkteFaden || {}).sync || null, rev: typeof THREE !== 'undefined' && THREE ? String(THREE.REVISION) : null })", returnByValue: true })
                .catch((e) => ({ result: { value: JSON.stringify({ fehler: e.message }) } }));
            const v = JSON.parse(r.result.value || "{}");
            if (v.sync) f.sync = v.sync.map((u) => u.replace(/^https?:\/\/[^/]+\//, "").split("?")[0]);
            f.revision = v.rev;
            f.foundry = f.geparst.some((u) => /\/foundry-bruecke\.js/.test(u));
            const drei = (u) => /\/worlds\/[^/]+\/lib\/three[^/]*$/.test(u.split("?")[0]);
            f.threeBytes = Object.entries(f.urls).filter(([u]) => drei(u)).reduce((a, [, b]) => a + b, 0);
            f.threeUrls = [...new Set(f.geparst.filter(drei).map((u) => u.replace(/^https?:\/\/[^/]+\//, "").split("?")[0]))];
            f.netz = Object.keys(f.urls).length;
            f.geparst = f.geparst.length;
            delete f.urls;
        }
    } catch (e) {
        out.fehler = String(e.message).slice(0, 300);
    } finally {
        schreibe();
        await browser.close().catch(() => {});
        server.close();
        process.exit(0);
    }
}

// ───────── EIN BÄCKER DER KARTE (pipeline.K2 Staffel 1 und 2, w8-ein-baecker) — läuft als `node -e` im Spiel-Baum, swiftshader ─────────
// DAS LABOR: das Labor der Bäume (worlds/terrain, three r128) öffnet als Tor über der Welt; sein Wald (`buildForest`) pflanzt die
// Gestalten der Welt und fragt ihre Karten über das Tor (`karte-bitte` → `_karteAbzug`) — gelesen werden die Bytes, die seine
// Fernstufe zeichnet (`_impMat` map/nmap, je Zelle `_impSpecs[i]` = Art, Gestalt: Albedo und Normale der Schicht).
// DIE WELT: der Bäcker der Welt (`_karteWeltBacken` auf ihrem Renderer) backt jede Zelle selbst — jede Art mit Karte des Buchs der
// Welt (KIND_POLICY impostor und eine Karten-Stufe im Budget), je Gestalt 1..T (`_foundryGestalten`, mit dem Solitär) — und die
// Probe liest ihre Schicht selbst nach dem letzten Ring (BC: das Bühnen-Ziel, rgba8: die Schicht des Array-Ziels; Albedo und Normale im selben Zug). Verglichen werden sha1 und Länge je Zelle;
// eine Zelle, die nur eine Seite trägt, steht beim Namen. Gleiche Bytes aus derselben Bake-Rechnung heißen EIN Bäcker. EINE Fahrt
// trägt beide Staffeln (Zwillinge): die 1 urteilt die erste Zelle des Labors, die 2 jede Art.
async function karteBaecker(port, aus) {
    const path = require("path");
    const fs = require("fs");
    const WB = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const out = { welt: null, labor: null, fehler: null };
    const server = WB.statikServer();
    await server.lausche(Number(port));
    const browser = await WB.starteBrowser({ art: "linse", frist: 1500000, viewport: { width: 640, height: 360 } });
    // sha1 im Browser (crypto.subtle) über Albedo und Normale einer Zelle
    const SHA = "async (a, n) => { const x = new Uint8Array(a.length + n.length); x.set(a, 0); x.set(n, a.length); const h = new Uint8Array(await crypto.subtle.digest('SHA-1', x)); return { sha: Array.from(h, (v) => v.toString(16).padStart(2, '0')).join(''), b: x.length }; }";
    try {
        const pw = await browser.newPage();
        await server.zeige(pw, 240000);
        await pw.evaluate(() => window.__weltDa((r) => r._foundry && r._foundry.ready && r._foundry.recipes && r.state.rendererReady));
        // DAS LABOR im Tor dieser Welt
        await pw.evaluate(() => window.anazhRealm._buildPortalOverlay({ world: "worlds/terrain/index.html", label: "Labor" }));
        let fr = null;
        for (const t0 = Date.now(); !fr && Date.now() - t0 < 120000; await WB.sleep(500))
            fr = pw.frames().find((f) => /worlds\/terrain\/index\.html/.test(f.url()));
        if (!fr) throw new Error("das Tor öffnet kein Labor");
        await fr.waitForFunction(() => typeof buildForest === "function" && typeof _labHeimat !== "undefined" && _labHeimat && renderer, { timeout: 240000, polling: 500 });
        await fr.evaluate(() => buildForest());
        await fr.waitForFunction(() => _karteLabor && (_karteLabor.offen === 0 || _karteLabor.fehler), { timeout: 900000, polling: 1000 });
        out.labor = await fr.evaluate(async (SHA) => {
            const sha = eval(SHA);
            const o = { baecker: null, karten: {}, fehler: _karteLabor.fehler };
            if (o.fehler) return o;
            const A = _impMat.uniforms.map.value.image,
                N = _impMat.uniforms.nmap.value.image;
            const n = A.width * A.height * 4;
            o.baecker = "Labor-Fernstufe (three r" + THREE.REVISION + ", " + A.width + "×" + A.height + ")";
            for (let i = 0; i < _impSpecs.length; i++)
                o.karten[_impSpecs[i].sp + "|" + _impSpecs[i].seed] = await sha(A.data.subarray(i * n, (i + 1) * n), N.data.subarray(i * n, (i + 1) * n));
            return o;
        }, SHA);
        if (out.labor.fehler) throw new Error("das Labor: " + out.labor.fehler);
        // DIE WELT — ihr Bäcker, ihre Schicht, von der Probe gelesen
        out.welt = await pw.evaluate(async (SHA) => {
            const sha = eval(SHA);
            const r = window.anazhRealm, rend = r.state.renderer;
            const o = { baecker: "_karteWeltBacken (three r" + THREE.REVISION + ")", format: null, karten: {}, fehler: null };
            const at = r._impostorAtlas();
            const rec = r._foundry.recipes;
            const budget = (AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod && AnazhRealm._studioRenderConfig.lod.budget) || {};
            const zellen = [];
            for (const art of Object.keys(rec)) {
                const kind = rec[art] && rec[art].kind, pol = AnazhRealm.KIND_POLICY[kind], zeile = budget[kind];
                if (!(pol && pol.impostor && zeile && Object.values(zeile).some((s) => s && s.karte))) continue;
                for (let g = 1; g <= (r._foundryGestalten(art) || 0); g++) zellen.push(art + "|" + g);
            }
            if (!zellen.length) return Object.assign(o, { fehler: "das Buch der Welt nennt keine Art mit Karte" });
            for (const key of zellen) {
                const [art, g] = [key.split("|")[0], Number(key.split("|")[1])];
                const z = r._foundryEnsureImpostorRecord(art, g, null);
                if (!z || !r._impostorAtlasTexturen(at, z.idx + 1)) { o.karten[key] = { fehler: "keine Zelle" }; continue; }
                z._weltNeu = true;
                z._platte = null;
                let e = null;
                for (const t0 = performance.now(); performance.now() - t0 < 180000; await new Promise((f) => setTimeout(f, e === 0 ? 0 : 50))) {
                    if (at.offen && at.offen.z !== z) r._karteWeltBacken(at, at.offen.z);
                    e = r._karteWeltBacken(at, z);
                    if (e === true || e === false) break;
                }
                if (e !== true) { o.karten[key] = { fehler: "die Welt backte keine Karte (" + e + ")" }; continue; }
                const bc = at.fmt === "bc";
                const rt = bc ? r._karteBuehneSatz.ziel : at.rt;
                o.format = (at.fmt || "?") + " " + rt.width + "×" + rt.height;
                const lies = (i) => rend.readRenderTargetPixelsAsync(rt, 0, 0, rt.width, rt.height, i, bc ? 0 : z.idx);
                const [a, n] = await Promise.all([lies(0), lies(1)]); // beide Kopien im selben Zug: danach backt der nächste
                o.karten[key] = await sha(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), new Uint8Array(n.buffer, n.byteOffset, n.byteLength));
            }
            return o;
        }, SHA);
        out.fehler = out.welt.fehler || null;
    } catch (e) {
        out.fehler = String(e.message).split("\n")[0].slice(0, 300);
    } finally {
        fs.writeFileSync(aus, JSON.stringify(out));
        console.log("KARTEN " + JSON.stringify(out));
        await browser.close().catch(() => {});
        server.close();
        process.exit(0);
    }
}

// Das Urteil der Fahrt je Zelle und je Art (beide Staffeln lesen es): je Art ihre Gestalten beider Seiten, gleich, wenn jede Gestalt
// auf beiden Seiten mit gleichem sha1 und gleicher Länge steht; der Art-Hash ist sha1 über die Zell-Hashes der Welt in der Reihe der
// Gestalten, die Größe die Summe ihrer Bytes. Eine Zelle, die nur eine Seite trägt, ist ROT beim Namen.
function karteZellen(j) {
    const W = (j && j.welt && j.welt.karten) || {}, L = (j && j.labor && j.labor.karten) || {};
    const gleich = (w, l) => !!(w && l && w.sha && w.sha === l.sha && w.b === l.b);
    const roh = (k) => k + (!L[k] ? " fehlt im Labor" : !W[k] ? " fehlt in der Welt" : W[k].fehler || L[k].fehler ? " " + (W[k].fehler || L[k].fehler)
        : " " + String(W[k].sha).slice(0, 8) + "/" + W[k].b + " B ≠ Labor " + String(L[k].sha).slice(0, 8) + "/" + L[k].b + " B");
    const arten = new Map();
    for (const k of new Set([...Object.keys(W), ...Object.keys(L)])) {
        const art = k.split("|")[0];
        if (!arten.has(art)) arten.set(art, []);
        arten.get(art).push(k);
    }
    return [...arten].map(([art, ks]) => {
        ks.sort((x, y) => Number(x.split("|")[1]) - Number(y.split("|")[1]));
        const rot = ks.filter((k) => !gleich(W[k], L[k])).map(roh);
        const sha = require("crypto").createHash("sha1").update(ks.map((k) => (W[k] && W[k].sha) || "").join(",")).digest("hex");
        return { art, n: ks.length, rot, sha, b: ks.reduce((s, k) => s + ((W[k] && W[k].b) || 0), 0), gleich: (k) => gleich(W[k], L[k]) };
    });
}
const MB = (b) => (b / 1048576).toFixed(1).replace(".", ",") + " MB";

// Studio-Seite → die Arten aus PARAMS_BY_KIND, die ihr werk() der Hülle schickt (worlds/<seite>/*.js `werk:`)
const SEITEN = {
    garage: ["vehicle"],
    schmiede: ["weapon"],
    portale: ["gate"],
    klang: ["klang"],
    fachwerk: ["haus", "ausstattung"],
    koerperstudio: ["koerper"],
    tetrapoda: ["kreatur"],
    terrain: ["flower", "grass"],
};
const UEBERGABE_PFAD = [
    "worlds/huelle/",
    "worlds/garage/",
    "worlds/schmiede/",
    "worlds/portale/",
    "worlds/klang/",
    "worlds/fachwerk/",
    "worlds/koerperstudio/",
    "worlds/tetrapoda/",
    "worlds/terrain/",
    "stamm/netz-portal.js",
    "stamm/werkstatt-vorschau.js",
    "stamm/studio-*.js",
    "stamm/koerper-leib.js",
    "stamm/kreatur-leben.js",
    "stamm/klang.js",
    "stamm/speicher-*.js",
    "*-core.js",
    "foundry-bruecke.js",
    "cores.manifest.json",
    "scripts/diag-studio-uebergabe.cjs",
    "scripts/lib/asset-worker-harness.cjs",
    "scripts/lib/stamm.cjs",
    "scripts/lib/welt-boot.cjs",
];
// gate:studio-uebergabe (uebergabe-kanal 3e00dc62): (K) je Art ein Rezept, Same und JEDE Zeile zufällig (Saat je Lauf), der Leser
// der Welt bis an den Bäcker, Bau-Hash Studio = Welt; (S) nur die Hülle postet; --welt der Konsum im echten Spiel. Die Seite selbst
// (ihr Knopf und ihr werk()) fährt die Linse nicht — sie zählt eine Seite, wenn JEDE ihrer Arten byte-gleich reist.
function uebergabeLesen(lauf) {
    const out = String(lauf.stdout || "");
    const saat = (/=== \(K\) KANAL — Saat (\d+)/.exec(out) || [])[1];
    if (!saat) return null;
    const art = {};
    for (const l of zeilen(out)) {
        const m = /^\s*(✅|❌) (\w+): das Werk des Studios steht byte-gleich in der Welt/.exec(l);
        if (m) art[m[2]] = m[1] === "✅";
    }
    const wand =
        /✅ nur die Hülle postet eine Übergabe/.test(out) && /✅ die Heimat leitet die Übergabe an genau EINEN Empfänger/.test(out);
    const i = out.indexOf("=== --welt");
    const weltTeil = i < 0 ? "" : out.slice(i).split(/\n\s*\n/)[0];
    const welt = i >= 0 && /✅/.test(weltTeil) && !/❌/.test(weltTeil);
    const seiten = Object.keys(SEITEN).filter((s) => SEITEN[s].every((a) => art[a] === true));
    const zahl =
        seiten.length + "/8 Studio-Seiten mit gleichem Bau-Hash in der Welt (Arten " +
        Object.values(art).filter(Boolean).length + "/" + Object.keys(art).length + ", Saat " + saat + ")" +
        (seiten.length < 8 ? ", ohne " + Object.keys(SEITEN).filter((s) => !seiten.includes(s)).join(", ") : "") +
        (wand ? "" : ", Sonderweg-Wand ROT") + (welt ? ", Konsum im Spiel grün" : ", Konsum im Spiel (--welt) ROT oder fehlt");
    return { art, wand, welt, seiten, zahl };
}

// gate:regler-wirkt Teil 1–3 und die Budget-Ratsche dahinter (spec/vertraege/ratsche.json reglerBudget)
const REGLER_BEFEHL = [
    "bash",
    "-c",
    "for t in 1 2 3; do node scripts/diag-regler-wirkt.cjs --teil=$t; echo \"TEIL $t EXIT $?\"; done; " +
        "node -e \"console.log('RATSCHE ' + JSON.stringify(require('./spec/vertraege/ratsche.json').reglerBudget || null))\"",
];
const REGLER_PFAD = [
    "*-core.js",
    "foundry-bruecke.js",
    "cores.manifest.json",
    "spec/vertraege/ratsche.json",
    "stamm/studio-*.js",
    "stamm/werkstatt-vorschau.js",
    "stamm/koerper-*.js",
    "stamm/kreatur-*.js",
    "stamm/stoff-instanz.js",
    "stamm/vegetation-*.js",
    "scripts/diag-regler-wirkt.cjs",
    "scripts/lib/asset-worker-harness.cjs",
    "scripts/lib/plattform-probe.cjs",
    "scripts/lib/stamm.cjs",
    "scripts/lib/welt-boot.cjs",
];
// DER LOKALE ANBIETER der Stationen mit Modell (ki.K1#2, ki.K3#1, ki.K4#1): läuft ollama auf 127.0.0.1:11434 nicht, startet ihn die
// Station und beendet ihn danach; die Zeile ANBIETER beweist, dass der Host das Modell trägt (kein Stub, kein Mitschnitt)
const OLLAMA_AN =
    "set -u; O=127.0.0.1:11434; S=''; " +
    "if ! curl -s -m 3 -o /dev/null http://$O/api/tags; then X=\"${LOCALAPPDATA:-}/Programs/Ollama/ollama.exe\"; " +
    "[ -x \"$X\" ] || X=ollama; (\"$X\" serve > /dev/null 2>&1 < /dev/null &); S=1; " +
    "for t in $(seq 1 30); do curl -s -m 2 -o /dev/null http://$O/api/tags && break; sleep 1; done; fi; " +
    "echo \"ANBIETER $O $(curl -s -m 5 http://$O/api/tags | node -e \"let s='';process.stdin.on('data',(d)=>(s+=d)).on('end',()=>{" +
    "try{const m=JSON.parse(s).models.map((x)=>x.name);console.log(JSON.stringify({traegt:m.includes(process.env.KI_MODELL),modelle:m}))}" +
    "catch(e){console.log('{}')}})\")\"; ";
const OLLAMA_AUS = "[ -n \"$S\" ] && taskkill //F //IM ollama.exe > /dev/null 2>&1; exit $e";
const OLLAMA_ENV = { ...SOFT, V1_PFAD_PORT: "{PORT}", KI_ENDPUNKT: "http://127.0.0.1:11434/", KI_MODELL: "qwen3:4b-instruct" };
// DER KORPUS GEGEN DAS ECHTE MODELL (ki.K1#2 und ki.K5#1: EIN Lauf, zwei Urteile — die Antwortzeit misst derselbe Korpus wie K1)
const KI_KORPUS_ECHT = [
    "bash",
    "-c",
    OLLAMA_AN +
        "node scripts/diag-v1-pfad.cjs --korpus --echt; e=$?; " +
        "node -e \"const k=require('./spec/abnahme/ki-korpus.json'); " +
        "console.log('NEGATIV ' + JSON.stringify(Object.keys(k.saetze).filter((s) => k.saetze[s].still))); " +
        "console.log('KORPUS ' + Object.keys(k.saetze).length)\"; " +
        OLLAMA_AUS,
];
const anbieterVon = (out) => {
    try {
        return JSON.parse((/^ANBIETER \S+ (.*)$/m.exec(out) || [])[1]);
    } catch (_e) {
        return null;
    }
};
const KEIN_ANBIETER = (anb) => ({
    gruen: false,
    zahl: "kein echter Anbieter: 127.0.0.1:11434 trägt qwen3:4b-instruct nicht (" + JSON.stringify(anb) + ")",
});
// der gemessene Pfad des Korpus mit Modell (ki.K1#2 und die Teile seele, regeln)
const KI_KORPUS_PFAD = [
    "spec/abnahme/ki-korpus.json",
    "stamm/feld-*.js",
    "stamm/werkstatt-vorschau.js",
    "stamm/studio-*.js",
    "stamm/bild-himmel.js",
    "stamm/dirigent-*.js",
    "stamm/kreatur-*.js",
    "stamm/koerper-*.js",
    "stamm/daten.js",
    "*-core.js",
    "foundry-bruecke.js",
    "index.html",
    "scripts/diag-v1-pfad.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "scripts/lib/stamm.cjs",
    "scripts/lib/welt-boot.cjs",
];
// gate:praegung-welt (K): spawn_studio und sein Stempel, die Werke je Art (Bau, Wesen, Prägung) und ihre Leser in der Welt
// (die Gesetze des Tors und des Wagens, der Guss der Gattung, der Leib des Spielers, der Klang), der Korpus-Teil Regler-Wörter
const KI_K2_PFAD = [
    "stamm/feld-*.js",
    "stamm/werkstatt-vorschau.js",
    "stamm/studio-*.js",
    "stamm/netz-portal.js",
    "stamm/koerper-*.js",
    "stamm/kreatur-*.js",
    "stamm/klang.js",
    "stamm/gelaende-kollision.js",
    "stamm/siedlung-ort.js",
    "*-core.js",
    "foundry-bruecke.js",
    "cores.manifest.json",
    "spec/vertraege/ratsche.json",
    "spec/abnahme/ki-korpus.json",
    "scripts/diag-praegung-welt.cjs",
    "scripts/lib/welt-boot.cjs",
];
function reglerLesen(lauf) {
    const out = String(lauf.stdout || "");
    const teile = [];
    for (const l of zeilen(out)) {
        const s = /^STUFEN \(B2c, pipeline\.K3\): (\d+) Bauten .*? · über Budget (\d+) · Reduktion je Art (.*)$/.exec(l);
        if (s) teile.push({ bauten: +s[1], ueber: +s[2], reduktion: s[3] });
    }
    const exits = [...out.matchAll(/^TEIL (\d) EXIT (\d+)/gm)].map((m) => +m[2]);
    const r = /^RATSCHE (.*)$/m.exec(out);
    let ratsche = null;
    try {
        ratsche = r ? JSON.parse(r[1]) : null;
    } catch (_e) {
        ratsche = null;
    }
    const quote = {};
    for (const t of teile)
        for (const seg of t.reduktion.split(" · ")) {
            const art = seg.trim().split(" ")[0];
            for (const m of seg.matchAll(/L(\d)\/L0 ([\d.]+)/g)) {
                const k = art + ":L" + m[1];
                quote[k] = Math.max(quote[k] || 0, +m[2]);
            }
        }
    return {
        teile,
        exits,
        ratsche,
        quote,
        ueber: teile.reduce((s, t) => s + t.ueber, 0),
        leer: (out.match(/^❌ LEER: .*/gm) || []).length,
        neuQuote: (out.match(/^❌ NEU ÜBER DER QUOTE: .*/gm) || []).length,
        bauten: teile.reduce((s, t) => s + t.bauten, 0),
    };
}

// studios.K1 aus demselben Lauf (REGLER_BEFEHL): je Teil die Zeilen-Zahl (`Regler-wirkt Teil N (…): Y PARAMS-Zeilen`), die
// toten (`  TOT <name> — …`) und gebrochenen (`❌ BRICHT <name>`) beim Namen, die Bild-Schwelle des Selbsttests (das
// Schlupfloch „0,1 mm am Hash": ein Hash allein zählt nie) und die Baum-Zeilen (die Art tree in der Reduktion der Stufen-Probe)
function k1Lesen(lauf) {
    const out = String(lauf.stdout || "");
    const teile = [...out.matchAll(/^Regler-wirkt Teil (\d) \(.*?\): (\d+) PARAMS-Zeilen .*?· (\d+) Zeilen an ihrem Leser der Welt/gm)];
    const tot = [...out.matchAll(/^ {2}TOT (\S+) — (.*)$/gm)].map((m) => [m[1], m[2]]);
    const bricht = [...out.matchAll(/^❌ BRICHT (\S+) — /gm)].map((m) => m[1]);
    const zeilen = teile.reduce((n, m) => n + Number(m[2]), 0);
    const bild = /^✅ SELBST-TEST Bild-Schwelle: 0,1 mm .* → tot · 3 cm .* → wirkt/m.exec(out);
    return {
        teile: teile.length,
        zeilen,
        wirkt: zeilen - tot.length - bricht.length,
        leser: teile.reduce((n, m) => n + Number(m[3]), 0),
        tot,
        bricht,
        bild: bild ? bild[0].replace(/^✅ SELBST-TEST Bild-Schwelle: /, "") : null,
        baum: /^STUFEN \(B2c, pipeline\.K3\): .*Reduktion je Art .*\btree L1\/L0/m.test(out),
        exits: [...out.matchAll(/^TEIL (\d) EXIT (\d+)/gm)].map((m) => +m[2]),
    };
}
const k1Zahl = (k) =>
    k.wirkt + "/" + k.zeilen + " Zeilen von PARAMS_BY_KIND wirken am Bild bzw. Ohr (" + (k.zeilen ? ((100 * k.wirkt) / k.zeilen).toFixed(1) : "–") +
    " %, davon " + k.leser + " an ihrem Leser der Welt) · " + (k.bild ? "Bild-Schwelle " + k.bild : "OHNE Bild-Schwelle (der Hash allein zählt nie)") +
    (k.tot.length ? " · tot " + k.tot.map(([n, g]) => n + " (" + (/(\d+(?:\.\d+)?) %/.exec(g) || ["", "0"])[1] + " %)").join(", ") : "") +
    (k.bricht.length ? " · BRICHT " + k.bricht.join(", ") : "") + " · Baum-Zeilen " + (k.baum ? "gemessen" : "keine in PARAMS_BY_KIND") +
    " · Exits " + k.exits.join("/");

// DIE K4-PROBE (studios.K4, Zweig w3w-studios-koord; seit w16-studio-welt-pm eine Datei der Stationen, stationen/k4-bild.cjs — die
// Box der Bühne zählt jede Instanz wie die Welt; bis dahin bericht/2910-w3w-studios/skripte/k4-bild.cjs im Koordinations-Baum)
// fährt in der warmen Welt der Sitzung (Werkbank {PORT}+20000) je Mesh-Studio dasselbe Werk in Bühne und Welt — die Bühne nennt es
// über ihren Knopf „In der Welt ansehen" (die Übergabe der Hülle), die Welt setzt es über den EINEN Übergabe-Kanal; Pose = die
// Vorschau-Kamera der Welt (Gier 0,6 · Neigung 0,32 · fov 45, Rahmen-Gesetz `_workshopRahmen`), beide aus dem Ausgabe-Pfad;
// Bild-Differenz über der Vereinigung der Masken (ΔLuma > 18 oder nur eine Seite), dazu die Albedo-Tafel beider Seiten je Studio.
// Seit w4-stationen-schnell im Browser der Sitzung (die Bühne eine zweite Seite derselben Herkunft, die Frist 6 s unter {SEK}), das
// Auge an der Pose und das Werk am Bau-Ereignis (`__gebautNach`) statt 30 s Wanduhr je Studio (GTX b4bcf19c: ≥ 90 s, 2 Studios).
const K4_BEFEHL = [
    "bash",
    "-c",
    `set -u; K=$(cygpath -m '{KOORD}'); A=$(cygpath -m '{AUS}'); export WERKBANK_PORT=$(({PORT}+20000)); node "$K/meisterkarte-quelle/punkte/stationen/k4-bild.cjs" "$A" {PORT} {SEK}`,
];
// DIE FAHRT (29.10., ≤ 30 min je Gerät): 90 s statt 900 s — sieben Studios in EINER Probe; die Welt trägt danach ihre Werke (mutiert)
const K4_STUDIOS = ["garage", "portale", "schmiede", "fachwerk", "terrain", "koerperstudio", "tetrapoda"];
// DIE AUSNAHME (w12-proben-frist): sieben Studios je mit eigener Seite und eigenem Renderer (die Bühne steht in 0,6–3,1 s) und je ein
// Abnahme-Bild der Welt (`/bild` 4,3–9,7 s, das erste kompiliert) — Radeon 8ef49bef: fünf Studios in 34,9 s (7,0 s je Studio), an der
// Frist 39 s fielen koerperstudio und tetrapoda aus; sieben ≈ 52 s Radeon, ≈ 68 s GTX (Faktor 1,3). Der Deckel je Karte in deckel.json.
// GRÜN zählt nur über der GESTALT beider Seiten (w16-studio-welt: das Werk allein in Weiß, Bühne SCHUSS · Welt WELT_GESTALT) —
// eine Differenz über der Teilung der Werkbank trug den Boden (die Schatten-Sprenkel unter dem Wagen, Radeon 93fe1619: 51 762 Pixel
// nur auf der Welt-Seite) und urteilt nie
const k4Gestalt = (z) => !!(z && z.welt && z.buehne && z.welt.maske === "gestalt" && z.buehne.maske === "gestalt");
const k4Zahl = (j) => {
    const s = (j && j.studios) || {};
    const gruen = K4_STUDIOS.filter((id) => s[id] && s[id].gruen === true && k4Gestalt(s[id]));
    return {
        gruen,
        zahl:
            gruen.length + "/7 Mesh-Studios mit Bild-Differenz ≤ 2,1 % und Albedo Labor/Welt im Rand 0,10 (" + (j.geraet || "Gerät ungenannt") + ") · " +
            K4_STUDIOS.map((id) => {
                const z = s[id] || {};
                return id + " " + (z.differenz && z.differenz.anteil != null ? (100 * z.differenz.anteil).toFixed(1) + " %" : "–") +
                    "/" + (z.albedo && z.albedo.max != null ? z.albedo.max : "–") + (z.gruen && !k4Gestalt(z) ? " [ohne Gestalt beider Seiten]" : "") +
                    (z.gruen ? "" : z.grund ? " [" + String(z.grund).slice(0, 90) + "]" : "");
            }).join(" · ") + ((j.fehler || []).length ? " · " + j.fehler.join(" | ").slice(0, 200) : ""),
    };
};
// DIE PROBEN (die Schlupflöcher als Mutanten): drei Studios unter 2,1 % über der Gestalt beider Seiten sind GRÜN; dieselben Zahlen
// über der Teilung der Werkbank (sie trägt den Boden) sind ROT; zwei Studios sind ROT
const k4Probe = (n, maske) => {
    const z = (id, d) => ({ [id]: { gruen: d <= 0.021, differenz: { anteil: d }, albedo: { max: 0.04 }, welt: { maske, pixel: 340155 }, buehne: { maske: "gestalt", pixel: 341300 } } });
    return "K4 " + JSON.stringify({ geraet: "probe", studios: Object.assign({}, ...K4_STUDIOS.map((id, i) => z(id, i < n ? 0.018 : 0.3))), fehler: [] });
};
const K4_PROBEN = [
    { name: "drei Studios unter dem Soll über der Gestalt beider Seiten", stdout: k4Probe(3, "gestalt"), gruen: true },
    { name: "dieselben Zahlen über der Teilung der Werkbank (der Boden zählt als Werk)", stdout: k4Probe(3, "teilung"), gruen: false },
    { name: "zwei Studios unter dem Soll", stdout: k4Probe(2, "gestalt"), gruen: false },
];
const K4_PFAD = [
    "worlds/huelle/",
    "worlds/garage/",
    "worlds/portale/",
    "worlds/schmiede/",
    "worlds/fachwerk/",
    "worlds/terrain/",
    "worlds/koerperstudio/",
    "worlds/tetrapoda/",
    "*-core.js",
    "foundry-bruecke.js",
    "stamm/werkstatt-vorschau.js",
    "stamm/werkstatt-bauen.js",
    "stamm/netz-portal.js",
    "stamm/studio-*.js",
    "stamm/siedlung-*.js",
    "stamm/stoff-*.js",
    "stamm/bild-*.js",
    "stamm/dirigent-*.js",
    "spec/farbe/albedo-tafel.json",
    "scripts/werkbank.cjs",
    "scripts/diag-albedo-tafel.cjs",
    "scripts/lib/albedo-tafel.cjs",
    "scripts/lib/licht-linsen.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "scripts/lib/welt-boot.cjs",
    "scripts/lib/software-gpu.cjs",
];

// diag-werkstatt-weg (L-WERKSTATT, BRENNGLAS): die Rohdatei artifacts/werkstatt-weg/weg.json wandert nach {AUS}
const WEG_BEFEHL = [
    "bash",
    "-c",
    "rm -f artifacts/werkstatt-weg/weg.json; node scripts/diag-werkstatt-weg.cjs; e=$?; " +
        "cp artifacts/werkstatt-weg/weg.json \"$PUNKTE_AUS\" 2>/dev/null; exit $e",
];
const WEG_ENV = { ...SOFT, WERKSTATT_WEG_PORT: "{PORT}", PUNKTE_AUS: "{AUS}" };
const WEG_WEGE = ["werkstatt", "rezeptbuch", "hotbar"];
const WEG_LAGEN = ["schöpfer", "frieden mit Material", "pfad"];
const WEG_WERKE = ["Eiche", "Haus", "GT", "Teil"];
const WEG_SICHTEN = ["Ego", "Third"];

// ───────────────────────── DIE PROBEN IN DER SITZUNG (29.10., stationen/sitzung-seite.js) ─────────────────────────
// Das Gesetz des Schöpfers: eine Fahrt durch jedes System ≤ 30 min samt Dauerlast — keine Station bootet mehr einen eigenen Browser.
// Die Linse des Spiels läuft als Bibliothek (`H.linse`) im Browser der Welt der Sitzung; geschrumpft ist nur der Lauf.
const { probeBefehl } = require("./sitzung-seite.js");
// die EINE Probe der Ankunft samt Spur des Kalt-Boots (p3-stationen-g456): sie wohnt bei ihren Ankunfts-Stationen (stationen/g6.js)
const { ANKUNFT_KALT } = require("./g6.js");

// DIE STUDIOS (studios.K2#2 · K3#2, Zwillinge): der Gang der Linse diag-studio-huelle (`gang`: H3 die Folge, H8 die Kosten-Leiste mit
// der Bank `?bank=12`) über die acht Studios — je Studio eine Seite im Browser der Sitzung, geliefert
// vom save-server der Sitzung (welt-boot `statikServer` und `starteBrowser` still ersetzt); die Nebenwelten (H6, ohne Urteil dieser
// Stationen) fallen aus dem Gang. Bis 29.10. ein eigener Browser je Lauf:
// Radeon e18195be 2,27 min, 4abae42d 3,5 min (K2#2), K3#2 6 min Soll. Die Herkunft teilt den localStorage mit der Welt (die
// Sitzung leert ihn am Ende): mutiert.
async function probeStudios(H) {
    const { page, browser } = await H.verbinde();
    const adapter = await page.evaluate(async () => {
        const a = navigator.gpu && (await navigator.gpu.requestAdapter());
        const i = (a && a.info) || {};
        return a ? { vendor: i.vendor || "?", architecture: i.architecture || "?" } : { fehlt: "kein Adapter" };
    });
    const server = {
        lausche: async () => server,
        zeige: (seite, frist, rest = "index.html", warte = "domcontentloaded") =>
            seite.goto("http://localhost:" + H.S + "/" + rest, { waitUntil: warte, timeout: frist }),
        close: () => {},
    };
    // jede Seite im Fenster der Linse (starteBrowser ohne viewport: puppeteer 800 × 600) — die Zeit je Griff hängt an der Fläche.
    // Je Studio zwei Seiten (der Besuch, das Neuladen), jede mit der Uhr der Probe: die Sekunden je Studio stehen zwischen den
    // ⏱-Zeilen (swiftshader 6a571e3b: fachwerk 45,5 s, koerperstudio 54,9 s von 161 s — ihr Neubau 2,9–4,1 s je Griff)
    const neueSeite = async () => {
        H.zeile("neue Seite der Linse");
        const p = await browser.newPage();
        await p.setViewport({ width: 800, height: 600 });
        return p;
    };
    const derSitzung = { newPage: neueSeite, close: async () => {}, adapter };
    // der Gang von heute: H7 (der Sitzungs-Gang mit GRIFFE) fiel am Spiel 1d36d131 („Alte Tests fallen“, a13) — die Probe liest nur,
    // was die Linse am Kopf trägt (H3 die Folge, H4/H10 die Kosten-Zeile)
    const L = H.linse("scripts/diag-studio-huelle.cjs", ["gang"], {
        argv: ["--engine"],
        stumm: { statikServer: () => server, starteBrowser: async () => derSitzung },
        ersetze: [['const NEBENWELTEN = ["skeleton", "fluid", "translated"];', "const NEBENWELTEN = [];"]],
    });
    await L.gang();
    return { adapter };
}
// DIE AUSNAHME (w12-proben-frist): acht Studios je zwei Seiten mit eigenem Renderer (der Besuch, das Neuladen) und 5 Griffe je Seite —
// Radeon 8ef49bef: fünf Studios in 39 s an der Frist (fachwerk allein 16 s), acht ≈ 62 s; GTX mit Faktor 1,3 ≈ 81 s
const STUDIO_PROBE = {
    ...probeBefehl(probeStudios, 75),
};
// DER BILD-WEG (bauen.K1#2): die Linse diag-werkstatt-weg als Bibliothek (`wegHelfer` mit dem Haken am Render des Takts, `wegLauf` über
// echte Eingaben) in der warmen Welt der Sitzung — die Bühne (Mittag · Sonne · Sommer), dann 8 Läufe: jedes Werk zweimal (kalt, warm),
// jeder Weg mit kalt und warm, Lage und Sicht im Wechsel. KALT räumt die Linse selbst (`wegHelfer`: der erste Lauf eines Werks nimmt
// seine Körper aus der Foundry, `_foundryCacheEvict`) — bis w4-stationen-schnell lud die Probe dafür die Seite neu (ein Ganz-Welt-Boot
// je Lauf, und die Welt füllte die Foundry bis zum ersten Lauf wieder); der Ort der Läufe liegt beim Spieler (die Linse sucht um ihn,
// steht er ferner als 160 m von der Genesis-Lichtung — die Mess-Wiese 1 082 m: bis dahin sprang der erste Lauf über 1 km in eine kalte
// Gegend, GTX b4bcf19c 0/8 nach 80 s). Bis 29.10. drei frische Browser (je Weg ein leeres Profil) × 24 Läufe = 72 (Soll 10 min,
// Radeon b3f9ae95 43,7 min).
const BILD_FAELLE = [
    ["werkstatt", "schöpfer", "Eiche", "Ego"],
    ["rezeptbuch", "frieden mit Material", "Haus", "Third"],
    ["hotbar", "pfad", "GT", "Ego"],
    ["werkstatt", "frieden mit Material", "Teil", "Third"],
    ["rezeptbuch", "pfad", "Eiche", "Third"],
    ["hotbar", "schöpfer", "Haus", "Ego"],
    ["werkstatt", "pfad", "GT", "Ego"],
    ["hotbar", "frieden mit Material", "Teil", "Third"],
];
async function probeBildWeg(H) {
    const { path } = H;
    const L = H.linse("scripts/diag-werkstatt-weg.cjs", ["probe", "wegHelfer", "bauWeg", "wegLauf", "WERKE", "TEILE"]);
    // DIE PHASEN DER ZEILE gehören der Station (09.11.: w22-geh-bild 6c5a3a5b strich `PHASEN` in der Linse — in scripts/ las sie
    // niemand, die Decke zahlte; diese Station las sie: „ReferenceError: PHASEN is not defined“, bauen.K1#2 UNGEMESSEN auf der GTX)
    const PHASEN = ["eingabe", "steht", "l0", "bild", "gpu"]; // der Weg der UI · das Setzen · der L0-Bau · das Zeichnen · die GPU (e.zeiten)
    const { buehne } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const { page } = await H.verbinde();
    await page.setViewport({ width: 1280, height: 720 }); // das Fenster der Linse (--echt); die Grundstellung stellt 1920 × 1080 zurück
    // DIE SCHLEIFE DES SPIELS läuft wie im Spiel (wie probeVerben): der Haken der Linse sitzt am Render des Takts (`_loopRender`,
    // wegHelfer bild), die Werkbank der Sitzung hält die Schleife zwischen ihren Befehlen an (`__loop()`). Ohne sie zog nie ein Bild
    // und die Schublade öffnete nie — seit die Probe die Seite nicht mehr neu lädt (w4-stationen-schnell) jeder Lauf 0/8 an der Frist
    // (GTX 8efb6318 80,2 s, headless am main dieselben 80,2 s, „#workshop-search: nicht offen“)
    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop((t) => window.anazhRealm._gameLoopTick(t)));
    H.beimAbbau(() => page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null)));
    await H.ereignisStrom(page);
    const { frei } = await page.evaluate(L.probe, { nurOrt: true });
    await buehne(page);
    await H.binnen(page.evaluate(() => window.__weltStehtNach()), 15000);
    // DAS WELTBILD STEHT, ehe die erste Taste fällt: unter dem Ladeschirm gehört keine Taste der Welt (`_ladeschirmSteht`,
    // dirigent-ankunft) — die Werkbank bootet bis zum Backend und hält dann die Schleife an, der Schirm stand (headless am main 75 s
    // Schleife bis zum Weltbild; davor „#workshop-search: nicht offen“: B fiel unter den Schirm). Steht er an der Frist, ist das der Täter.
    await H.binnen(page.waitForFunction(() => !window.anazhRealm._ladeschirmSteht(), { timeout: 0, polling: 250 }), (H.rest() - 8) * 1000);
    if (await page.evaluate(() => window.anazhRealm._ladeschirmSteht()))
        throw new Error("der Ladeschirm steht nach " + H.sek() + " s laufender Schleife — kein Weltbild, keine Taste der Welt");
    await page.evaluate(L.wegHelfer, { frei, teile: { eigen_huette: L.TEILE.eigen_huette }, bild: true });
    let offen = true;
    H.beimAbbau(() => offen && L.bauWeg(page, "ende"));
    const j = (H.teil = { gestartet: true, bild: true, echt: true, wege: {}, faelle: [], frei });
    j.konsum = await L.bauWeg(page, "konsum");
    for (const [weg, lage, werk, sicht] of H.seite.FAELLE) {
        // ein Fall an der Frist fällt aus: die Probe trägt kein ganzes Urteil (die EINE Marke, punkte.cjs FRIST_MARKE)
        if (H.rest() < 6) {
            H.fristRiss("Fall " + [weg, lage, werk, sicht].join(" · ") + " und die folgenden ausgelassen");
            break;
        }
        const e = await H.binnen(L.wegLauf(page, { lage, weg, name: L.WERKE[werk], sicht }), (H.rest() - 4) * 1000, { fehler: "Frist der Probe" });
        if (e.fehler === "Frist der Probe" && H.rest() <= 4) H.fristRiss("Fall " + [weg, lage, werk, sicht].join(" · ") + " an der Frist");
        (((j.wege[lage] ||= {})[weg] ||= {})[werk] ||= {})[sicht] = e;
        j.faelle.push([weg, lage, werk, sicht]);
        const z = e.zeiten || [];
        console.log(
            `  [bild] ${weg} · ${lage} · ${werk} · ${sicht} ${e.kalt ? "kalt" : "warm"} ${z[4]} ms, Bau-Hash ${e.bau === e.soll ? "=" : "≠"} L0 · ` +
                `${PHASEN.map((k, i) => k + " " + (z[i] - (z[i - 1] || 0))).join(" · ")} ${e.fehler || ""}`
        );
        await H.binnen(page.evaluate(() => window.__weltStehtNach()), Math.min(8000, (H.rest() - 4) * 1000));
    }
    offen = false;
    Object.assign(j, await L.bauWeg(page, "ende"));
    return j;
}
const BILD_PROBE = probeBefehl(probeBildWeg, 60, { FAELLE: JSON.stringify(BILD_FAELLE) });
// DIE ROHDATEI des Bild-Wegs als Probe des Urteils (selbsttest PROBEN): gesund jedes Werk steht über 3 echte Eingaben, je Werk der
// erste Lauf kalt, 400 ms bis zum abgearbeiteten Bild, Bau-Hash = L0; `fall` ändert EINEN Lauf (Index in BILD_FAELLE)
const bildRoh = (fall = {}, i0 = 0) => {
    const j = { gestartet: true, bild: true, echt: true, wege: {}, faelle: BILD_FAELLE };
    const gesehen = new Set();
    BILD_FAELLE.forEach(([weg, lage, werk, sicht], i) => {
        const e = { steht: 1, eingaben: 3, unecht: 0, zeiten: [100, 150, 200, 300, 400], bau: "b", soll: "b", kalt: !gesehen.has(werk), ...(i === i0 ? fall : {}) };
        gesehen.add(werk);
        (((j.wege[lage] ||= {})[weg] ||= {})[werk] ||= {})[sicht] = e;
    });
    return j;
};
const BILD_PROBEN = [
    { name: "gesund: 8/8 Werke stehen in ≤ 3 Eingaben im Bild, p95 0,4 s", j: bildRoh(), gruen: true },
    { name: "Mutante: ein Werk steht nicht (das Bild trägt den L0-Bau)", j: bildRoh({ steht: 0 }, 2), gruen: false },
    { name: "Mutante: 4 Eingaben", j: bildRoh({ eingaben: 4 }, 5), gruen: false },
    { name: "Mutante: warm 1,2 s bis zum Bild", j: bildRoh({ zeiten: [100, 150, 200, 300, 1200] }, 6), gruen: false },
    { name: "Mutante: das Bild zeigt die Stufe 1, nicht den L0-Bau", j: bildRoh({ soll: "c", stufe: 1 }, 1), gruen: false },
];

// DIE VERBEN (bauen.K5#2): die Linse diag-werkstatt-weg mit `--verben` (`wegHelfer`, `wegLauf`: gesetzt, dann das Verb über die echte
// Taste — Haus W bis hinter die Schwelle, Wagen E · W · E, Tor E, Brücke W über das Deck, Leiter W bis aufs Podest, Bank E) in der Welt
// der Sitzung, der Loop des Spiels läuft. Je Herkunft × Sicht ein Werk, jedes Werk einmal (6 Läufe). Bis 29.10. ein eigener Browser
// mit dem ganzen Raster 3 × 2 × 6 = 36 Läufe (Radeon b3f9ae95 7,14 min).
const VERB_FAELLE = [
    ["werkstatt", "Ego", "Haus"],
    ["werkstatt", "Third", "Tor"],
    ["ki", "Ego", "Wagen"],
    ["ki", "Third", "Leiter"],
    ["geteilt", "Ego", "Bank"],
    ["geteilt", "Third", "Brücke"],
];
async function probeVerben(H) {
    const L = H.linse("scripts/diag-werkstatt-weg.cjs", ["probe", "wegHelfer", "bauWeg", "wegLauf", "TEILE", "VERBEN"], { argv: ["--verben"] });
    const { page } = await H.verbinde();
    await page.setViewport({ width: 1280, height: 720 }); // das Fenster der Linse (--verben); die Grundstellung stellt 1920 × 1080 zurück
    await H.ereignisStrom(page);
    // DER HALT DER MESSUNG FÄLLT FÜR DIE VERBEN: die Sitzung hält ihn, sobald eine Probe vor dieser die Bühne stellte
    // (`weatherEffectTime` < 0, scripts/lib/ausgabe-aufnahme.cjs `wetterHalten`; die Grundstellung trägt ihn nicht zurück), und unter
    // ihm verweigert die Engstelle der Welt-Akte (stamm/feld-dsl.js `_messHalt`) jedes Setzen der Werk-Sprache — das Wort der KI und
    // das geteilte Werk („weltakt_gehalten", kein Werk; Radeon fd5df4bf: allein 6/6, nach luftwasser.K5#2 oder bauen.K1#2 2/6). Das
    // Spiel kennt den Halt nie: die Probe misst den Weg des Spielers ohne ihn und gibt ihn danach zurück, wie er stand.
    const halt = await page.evaluate(() => {
        const st = window.anazhRealm.state;
        const u = st.weatherEffectTime;
        st.weatherEffectTime = 0;
        return u;
    });
    H.beimAbbau(() => page.evaluate((u) => (window.anazhRealm.state.weatherEffectTime = u), halt));
    // der Loop des Spiels läuft wie im Spiel (die Werkbank hält ihn zwischen ihren Befehlen an)
    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop((t) => window.anazhRealm._gameLoopTick(t)));
    H.beimAbbau(() => page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null)));
    const { frei } = await page.evaluate(L.probe, { nurOrt: true });
    await page.evaluate(L.wegHelfer, { frei, teile: { eigen_huette: L.TEILE.eigen_huette }, bild: false });
    let offen = true;
    H.beimAbbau(() => offen && L.bauWeg(page, "ende"));
    await L.bauWeg(page, "teile", L.TEILE);
    await L.bauWeg(page, "wort");
    const j = (H.teil = { verbenJe: {}, faelle: [], frei });
    for (const [h, sicht, werk] of H.seite.FAELLE) {
        // ein Fall an der Frist fällt aus: die Probe trägt kein ganzes Urteil (die EINE Marke, punkte.cjs FRIST_MARKE)
        if (H.rest() < 6) {
            H.fristRiss("Fall " + [h, sicht, werk].join(" · ") + " und die folgenden ausgelassen");
            break;
        }
        const [name, verb, weg] = L.VERBEN[werk];
        const e = await H.binnen(L.wegLauf(page, { lage: "schöpfer", weg: h === "werkstatt" ? weg || h : h, name, sicht, verb }), (H.rest() - 4) * 1000, {
            fehler: "Frist der Probe",
        });
        if (e.fehler === "Frist der Probe" && H.rest() <= 4) H.fristRiss("Fall " + [h, sicht, werk].join(" · ") + " an der Frist");
        ((j.verbenJe[h] ||= {})[sicht] ||= {})[werk] = e;
        j.faelle.push([h, sicht, werk]);
        const ok = e.steht === 1 && e.verb === true && !e.fehler;
        console.log(`  ${ok ? "✅" : "❌"} ${h} · ${sicht} · ${werk} × ${verb}${ok ? "" : " — " + (e.fehler || e.warum || "steht nicht")} · ${H.sek()} s`);
    }
    offen = false;
    await L.bauWeg(page, "ende");
    return j;
}
const VERB_PROBE = probeBefehl(probeVerben, 60, { FAELLE: JSON.stringify(VERB_FAELLE) });

// ───────── DAS BILDPAAR AN FESTER POSE (Karte 2: erleben.schoepfen.teilen · erleben.schoepfen.schutz, vorrat2-stationen-g4) ─────────
// EIN Muster für jede Sprosse, deren Richter „Bildpaar … gleich“ oder „… unverändert“ sagt. Die Kamera steht als ZAHL fest — das
// Rahmen-Gesetz der Werkstatt (`_workshopRahmen`, Gier 0,6 · Neigung 0,32 · fov 45, wie studios.K4) um das Werk, der Spieler am Fuß
// der Kamera (das Auge der Stufen steht dort) —, die Welt geht über `/bild` der Werkbank der Sitzung (der Ausgabe-Pfad) an GENAU dieser
// Kamera: zweimal vor der Tat (der Rausch-Boden), ohne das Werk (die Präsenz: das Werk steht im Bild), nach der Tat. Gezählt wird mit
// `bildRauschen` (scripts/lib/abnahme-urteil.cjs: Anteil der Pixel mit Σ|ΔRGB| über der Schwelle) über die PNG-Datei selbst
// (`pngLesen`). GLEICH heißt: höchstens der doppelte Rausch-Boden plus 0,1 % der Leinwand, und nur, wo das Werk ≥ 1 % der Pixel
// trägt — ein Paar ohne das Werk im Bild wäre blind gleich.
//   teilen: das Original (der eigene Bauplan, sein Same `_werkSame`, sein Stempel `_studioStampFor`, `spawn_blueprint` an einem Ort)
//     gegen den Import seines Codes (`teileWerk` → `empfangeWerk` an DENSELBEN Ort, die Geste des Empfängers wie im Chat) — je Werk
//     ein Paar: die Bank (Gesetzbuch fachwerk) und die Brücke (eigener Bauplan, reist als define_blueprint, kommt umbenannt).
//   schutz: am selben Bild, solange das Original steht, drei feindliche Codes durch den EINEN Eingang (`empfangeWerk`): ein verbotenes
//     Verb (remove_architecture), ein Werk mit gefälschter Signatur, eine fremde Welt-Adresse mit gefälschter Signatur — je Code das
//     Bild danach gegen das davor, der Stand der Welt (Werke, Baupläne, Regeln, Welt) und die Abweisung im Spieler-Kanal (#chat-output).
const PAAR_SOLL = { schwelle: 24, praesenz: 0.01, faktor: 2, rand: 0.001, w: 640, h: 360, fov: 45, gier: 0.6, neigung: 0.32 };
const PAAR_WERKE = ["bank_sitzbank", "eigen_bruecke"];
const PAAR_FREMD = ["verb", "signatur", "welt"];
// gleich: das Werk im Bild, die Differenz im Rauschen (rein: die Probe schreibt die Anteile, das Urteil spricht hier)
const paarGleich = (z, S = PAAR_SOLL) =>
    !!z && !z.fehler && [z.rausch, z.praesenz, z.diff].every(Number.isFinite) && z.praesenz >= S.praesenz && z.diff <= S.faktor * z.rausch + S.rand;
const paarZahl = (z) =>
    !z ? "nicht gelaufen" : z.fehler ? String(z.fehler).slice(0, 140) : "Δ " + (100 * z.diff).toFixed(2) + " % · Rauschen " + (100 * z.rausch).toFixed(2) + " % · Werk im Bild " + (100 * z.praesenz).toFixed(1) + " %";
const PAAR_HW = (t) => {
    const ad = (/\[linse-gpu\][^\r\n]*/.exec(String(t || "")) || [null])[0];
    return { ad: ad || "Adapter ungenannt", hw: !!ad && !/swiftshader|llvmpipe|lavapipe|software|subzero|kein Adapter/i.test(ad) };
};
// DER SCHUSS an der Kamera der Pose (Node, in der Probe): /bild schreibt das PNG, die Probe liest es selbst
async function paarSchuss(H, kam, name) {
    const S = H.seite.SOLL;
    const datei = String(H.AUS).replace(/\.json$/i, "") + "-paar-" + name + ".png";
    const o = await H.wb("/bild", { px: kam.kamera[0], py: kam.kamera[1], pz: kam.kamera[2], lx: kam.ziel[0], ly: kam.ziel[1], lz: kam.ziel[2], w: S.w, h: S.h, fov: S.fov, wahl: "0", datei }, 90000);
    if (!o || !o.datei || !H.fs.existsSync(o.datei)) throw new Error("/bild " + name + ": " + JSON.stringify(o).slice(0, 200));
    return require(H.path.resolve("scripts/lib/abnahme-urteil.cjs")).pngLesen(H.fs.readFileSync(o.datei));
}
// der Anteil zweier Schüsse über der Schwelle
const paarDiff = (H, A, B) => require(H.path.resolve("scripts/lib/abnahme-urteil.cjs")).bildRauschen(A.u8, B.u8, A.W, A.H, H.seite.SOLL.schwelle).anteil;
// DIE SEITE: setzen, rahmen, warten, entfernen, empfangen — je Schritt ein Aufruf (o.schritt), der Stand in window.__paar
async function paarSeite(o) {
    const r = window.anazhRealm, st = r.state, K = r.constructor, T = THREE;
    const P = (window.__paar ||= {});
    const werk = (id) => st.architectures.find((a) => a && a.id === id) || null;
    // das Werk steht in der Stufe am Auge (die Foundry-Instanz wie studios.K4 `steht`), ein eigener Bauplan mit seinem Mesh in der Szene
    const steht = (E) => {
        if (!(E.instFoundry || (E.instSlots && E.instSlots.length))) return !!(E.mesh && E.mesh.parent);
        const kl = new Set();
        for (const [key, g] of st.archInstanceGroups || []) if (g.slotEntry && g.slotEntry.indexOf(E) >= 0 && !g.shadowTwin && g.geom && /^f:/.test(K._instanzKlasse(key))) kl.add(K._instanzKlasse(key));
        return E._lodAmAbstand === true && [...kl].some((k) => k.endsWith(":L" + (E._lodLevel | 0)));
    };
    const warte = async (E, was) => {
        E._lodAmAbstand = false;
        return { takte: await window.__gebautNach(was + " " + E.type + " in der Stufe am Auge der Pose", { fertig: () => steht(E), bau: () => {} }), stufe: E._lodLevel | 0 };
    };
    const fort = async (E) => {
        r.removeArchitecture(E, { still: true });
        await window.__gebautNach("das Werk " + E.type + " ist fort", { fertig: () => ![...(st.archInstanceGroups || new Map()).values()].some((g) => g.slotEntry && g.slotEntry.includes(E)) && !(E.mesh && E.mesh.parent), bau: () => {} });
    };
    const ort = (E) => [E.position.x, E.position.y, E.position.z].map((v) => +v.toFixed(3));
    const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
    const stand = () => JSON.stringify([st.architectures.filter(Boolean).map((a) => a.id).sort(), Object.keys(st.blueprints).sort(), (st.worldRules || []).length, (st.worldMeta || {}).worldId || null]);
    const s = o.schritt;
    // DER HALT JE TAT (16.11., Radeon fe885d9d: Import „steht_nicht“, eigen_bruecke „kein Ort trägt das Original“): jedes Bild der
    // Probe hält die Welt neu (scripts/lib/ausgabe-aufnahme.cjs `wetterHalten`, weatherEffectTime −1e9), und unter dem Halt
    // verweigert dslEval jeden Welt-Akt (AnazhRealm.DSL_WELTAKTE, spawn_blueprint). Die Null der Bühne galt nur bis zum ersten
    // Bild — die Geste des Empfängers (Import, fremder Code: `empfangeWerk` → dslRun) läuft darum selbst ohne Halt und gibt ihn
    // danach zurück; das Original setzt der Bau-Modus des Spielers (`confirmBuild`, kein DSL-Akt)
    const ohneHalt = async (f) => {
        const u = st.weatherEffectTime;
        st.weatherEffectTime = 0;
        try {
            return await f();
        } finally {
            st.weatherEffectTime = u;
        }
    };
    if (s === "buehne") {
        P.halt = st.weatherEffectTime;
        st.weatherEffectTime = 0; // der Halt der Messung (probeVerben): unter ihm setzt die Werk-Sprache nichts
        r.setTimeOfDay(0.5, "human"), r._setWeather("sunny", "human"), (st.weatherTransition = null), r._naesseTakt(1e6), r.setSeason("sommer");
        for (const [name, [label, plan]] of Object.entries(o.teile || {})) {
            if (!st.blueprints[name]) r.createBlueprint(name, label);
            for (const [x, y, z, a, b, c] of st.blueprints[name].parts.length ? [] : plan) r.addPartToBlueprint(name, { shape: "box", material: "stein", position: { x, y, z }, size: { x: a, y: b, z: c } });
        }
        return { halt: P.halt };
    }
    if (s === "zurueck") return P.modus !== undefined && r.setGameMode(P.modus), P.halt !== undefined && (st.weatherEffectTime = P.halt), 1; // nach einem Eintritt ist die Seite neu: kein Halt zum Zurückgeben
    if (s === "original") {
        // DER WEG DES SPIELERS (16.11., Koordinator: teilen#1 und schutz#1 endeten an „kein Ort trägt das Original“ — die Probe stellte
        // das Werk per dslRun spawn_blueprint, den der Halt der Bilder als Welt-Akt verweigerte): der Bauplan in die Hotbar, der
        // Bau-Modus zeigt sein Phantom am Fadenkreuz (`tickBuildMode`), der Rechtsklick setzt es (`confirmBuild`: das Urteil
        // `_setzUrteil`, der Stempel `_studioStampFor`, `spawnArchitecture` am Phantom) — je Blick (Gier × Neigung) bis das Phantom auf
        // stabilem Grund steht; eine Absage nennt den Satz des Spieler-Kanals
        const bp = st.blueprints[o.name];
        if (!bp) return { fehler: "kein Bauplan " + o.name };
        const SLOT = 8, altSlot = st.hotbar[SLOT], bm = st.buildMode, [y0, p0] = [st.yaw, st.pitch];
        const vorher = new Set(st.architectures.filter(Boolean).map((a) => a.id));
        const n0 = zeilen().length;
        let E = null, blicke = 0;
        // der Modus des Schöpfers (der Schalter des Spielers, Einstellungen): frei baut nur schöpfer — frieden und pfad zahlten Material,
        // das die Probe nie gesammelt hat; „zurueck“ stellt den Modus der Welt wieder her
        if (r.getGameMode() !== "schöpfer") {
            if (P.modus === undefined) P.modus = r.getGameMode();
            r.setGameMode("schöpfer");
        }
        r.setHotbarSlot(SLOT, o.name);
        try {
            if (!(bm.active && bm.blueprintName === o.name)) r.selectHotbarSlot(SLOT);
            if (!bm.active) return { fehler: "kein Bau-Modus für " + o.name + ": " + zeilen().slice(n0).join(" | ").slice(0, 160) };
            for (const w of [0, 0.7, -0.7, 1.4, -1.4, Math.PI]) {
                for (const dp of [-0.35, 0.35, -0.6, 0.6]) {
                    st.yaw = y0 + w;
                    st.pitch = p0 + dp;
                    await window.__seitenTakt();
                    r.tickBuildMode();
                    blicke++;
                    const z = r._resolvePhantomTarget();
                    if (!z.hit || !z.isStable) continue;
                    if (r.confirmBuild()) E = st.architectures.find((a) => a && a.type === o.name && !vorher.has(a.id)) || null;
                    break;
                }
                if (E) break;
            }
        } finally {
            r._clearBuildMode();
            r.setHotbarSlot(SLOT, altSlot || null);
            st.yaw = y0;
            st.pitch = p0;
        }
        if (!E) return { fehler: "kein Ort trägt das Original " + o.name + " (" + blicke + " Blicke, der Spieler-Kanal: " + (zeilen().slice(n0).join(" | ").slice(0, 160) || "stumm") + ")" };
        P.original = E;
        // DIE POSE: die Box aus den Blockern, die Kamera des Rahmen-Gesetzes, der Spieler an ihrem Fuß (das Auge der Stufen)
        const bb = new T.Box3();
        for (const b of E.blockerAABBs || []) bb.union(new T.Box3(new T.Vector3(b.minX, b.botY, b.minZ), new T.Vector3(b.maxX, b.topY, b.maxZ)));
        if (bb.isEmpty()) bb.setFromCenterAndSize(new T.Vector3(E.position.x, E.position.y + 1, E.position.z), new T.Vector3(2, 2, 2));
        const [R, c] = [bb.getSize(new T.Vector3()).length() / 2, bb.getCenter(new T.Vector3())];
        const cosP = Math.cos(o.soll.neigung), blick = [cosP * Math.cos(o.soll.gier), Math.sin(o.soll.neigung), cosP * Math.sin(o.soll.gier)];
        const cam = new T.PerspectiveCamera(o.soll.fov, o.soll.w / o.soll.h, Math.min(0.1, R / 10), Math.max(200, 32 * R));
        const dist = r._workshopRahmen({ rahmen: { box: bb, R }, camera: cam, orbit: { yaw: o.soll.gier, pitch: o.soll.neigung } });
        const kamera = c.clone().addScaledVector(new T.Vector3(...blick), dist);
        st.playerMesh.position.set(kamera.x, r.getTerrainHeightAt(kamera.x, kamera.z) + K.PLAYER_FOOT_OFFSET, kamera.z);
        return { id: E.id, ort: ort(E), kamera: kamera.toArray(), ziel: c.toArray(), ...(await warte(E, "das Original")) };
    }
    if (s === "fort") return await fort(P.original), 1;
    if (s === "import") {
        // der Code des Senders (der Teilen-Knopf ruft dieselbe Geste; die Sitzung sagt Ja) an den Ort des Originals
        const c = await r.teileWerk(o.name);
        if (!c || !c.ok) return { fehler: "teileWerk " + o.name + ": " + (c && c.grund) };
        const q = P.original.position;
        const e = await ohneHalt(() => r.empfangeWerk(c.code, { pos: ["at", q.x, q.y, q.z] }));
        const E = e && e.ok && werk(e.id);
        if (!E) return { fehler: "empfangeWerk " + o.name + ": " + (e && e.grund) };
        P.import = E;
        return { id: E.id, name: e.name, ort: ort(E), zeichen: c.code.length, ...(await warte(E, "der Import")) };
    }
    if (s === "importFort") return P.import && (await fort(P.import)), 1;
    if (s === "fremd") {
        // die feindlichen Codes: dieselbe Hülle (`WERK_CODE.praefix` + base64url), der Autor der eigene Schlüssel, die Signatur falsch
        const W = K.WERK_CODE, autor = st.vibePass.publicKeyHex, sig = "00".repeat(64);
        const kodiere = (h) => W.praefix + r._vibeBytesToB64u(new TextEncoder().encode(JSON.stringify({ v: 1, ...h, autor, sig })));
        const code = {
            verb: kodiere({ programm: ["chain", ["define_blueprint", "fremd_werk", []], ["remove_architecture", P.original.id]] }),
            signatur: kodiere({ programm: r._werkReise(o.name) }),
            welt: kodiere({ welt: { worldId: "fremd-welt", roomId: "fremd-raum", broker: "wss://fremd.invalid", label: "Fremde Welt" } }),
        }[o.fall];
        const [vor, n0] = [stand(), zeilen().length];
        r._spielerSagtLetzte = null; // die 2-s-Sperre derselben Zeile gilt dem gehaltenen Rechtsklick, nie dem nächsten Code
        const e = await ohneHalt(() => r.empfangeWerk(code));
        return { ok: !!(e && e.ok), grund: (e && e.grund) || null, zeile: zeilen().slice(n0).join(" | ").slice(0, 200), stand: stand() === vor };
    }
    if (s === "weltVor") {
        // DIE FEINDLICHE WELT (vorrat3-stationen-g4): der eigene Stand als fremde Datei (`buildStateSnapshot`, neue worldId), dazu EINE
        // verbotene Tat — gesetz: ein Gesetz, das kein Build trägt (Schwere 999, `_weltGesetz`); pflug: eine Welt-Regel, die den frozen
        // Worldgen umpflügt (`RULE_FORBIDDEN_EFFECT_OPS` voxel_carve). Sie klopft an DIE Tür jeder Datei (`_openWeltTorDialog`, das
        // Welt-Tor), die Probe wählt „ersetzen“ am Knopf des Dialogs (DOM-Klick, kein Zeiger) — wer eintritt, lädt die Seite neu.
        const snap = JSON.parse(JSON.stringify(r.buildStateSnapshot()));
        const m = (snap.worldMeta = { ...(snap.worldMeta || {}), worldId: "feind-" + o.fall + "-" + Date.now().toString(36), slug: "feind-" + o.fall, label: "Feindliche Welt" });
        if (o.fall === "gesetz") m.gesetz = { ...(m.gesetz && typeof m.gesetz === "object" ? m.gesetz : {}), schwere: 999 };
        if (o.fall === "pflug") snap.worldRules = [{ cond: [">", ["field", "w"], -1], effect: ["voxel_carve", 0, 0, 0, 4], everySec: 5, source: "feind" }];
        P.heim = (st.worldMeta || {}).worldId || null;
        const [vor, n0] = [stand(), zeilen().length];
        r._spielerSagtLetzte = null;
        r._openWeltTorDialog(snap, { name: "feind-" + o.fall + ".json" });
        const knopf = document.getElementById("world-tor-replace");
        if (!knopf) return { fehler: "kein Knopf #world-tor-replace am Welt-Tor" };
        P.weltVor = { vor, n0 };
        setTimeout(() => knopf.click(), 0); // nach der Antwort: ein Eintritt lädt die Seite neu, die Antwort käme sonst nie an
        return { heim: P.heim, n0 };
    }
    if (s === "weltNach") {
        const { vor, n0 } = P.weltVor || {};
        const z = zeilen().slice(n0).join(" | ").slice(0, 200);
        return { ok: (st.worldMeta || {}).worldId !== P.heim, welt: (st.worldMeta || {}).worldId || null, zeile: z, stand: stand() === vor };
    }
    return { fehler: "kein Schritt " + s };
}
async function probeBildpaar(H) {
    const { page } = await H.verbinde();
    const ad = await page.evaluate(async () => {
        const a = navigator.gpu && (await navigator.gpu.requestAdapter());
        const i = (a && a.info) || {};
        return a ? (i.vendor || "?") + "/" + (i.architecture || "?") : "kein Adapter";
    });
    console.log("[linse-gpu] " + ad);
    const S = H.seite.SOLL;
    const seite = (o) => page.evaluate(H.seite.paarSeite, o);
    const { TEILE } = H.linse("scripts/diag-werkstatt-weg.cjs", ["TEILE"]);
    await seite({ schritt: "buehne", teile: { eigen_bruecke: TEILE.eigen_bruecke } });
    H.beimAbbau(() => seite({ schritt: "zurueck" }));
    const j = (H.teil = { adapter: ad, soll: S, teilen: {}, schutz: null });
    for (const name of H.seite.WERKE) {
        if (H.rest() < 20) {
            j.teilen[name] = { fehler: "Frist der Probe vor dem Paar (" + H.sek() + " s)" };
            continue;
        }
        const z = (j.teilen[name] = {});
        try {
            const o = await seite({ schritt: "original", name, soll: S });
            if (o.fehler) throw new Error(o.fehler);
            Object.assign(z, { original: o });
            const A = await H.seite.paarSchuss(H, o, name + "-original");
            z.rausch = H.seite.paarDiff(H, A, await H.seite.paarSchuss(H, o, name + "-original-2"));
            // DER SCHUTZ am Bild des ersten Werks: jeder feindliche Code gegen das Bild davor, solange das Original steht
            if (!j.schutz) {
                j.schutz = { werk: name, rausch: z.rausch, faelle: {} };
                for (const fall of H.seite.FREMD) {
                    const f = (j.schutz.faelle[fall] = await seite({ schritt: "fremd", fall, name }));
                    f.diff = H.seite.paarDiff(H, A, await H.seite.paarSchuss(H, o, name + "-fremd-" + fall));
                    console.log(`  ${!f.ok && f.zeile && f.stand ? "✅" : "❌"} fremd ${fall}: ${f.ok ? "ANGENOMMEN" : "abgewiesen " + f.grund} · Stand ${f.stand ? "gleich" : "VERÄNDERT"} · Δ ${(100 * f.diff).toFixed(2)} % · „${f.zeile}“`);
                }
            }
            await seite({ schritt: "fort" });
            z.praesenz = H.seite.paarDiff(H, A, await H.seite.paarSchuss(H, o, name + "-leer"));
            if (j.schutz && j.schutz.werk === name) j.schutz.praesenz = z.praesenz;
            const e = await seite({ schritt: "import", name });
            if (e.fehler) throw new Error(e.fehler);
            z.import = e;
            z.diff = H.seite.paarDiff(H, A, await H.seite.paarSchuss(H, o, name + "-import"));
            await seite({ schritt: "importFort" });
        } catch (e) {
            z.fehler = String((e && e.message) || e).slice(0, 300);
            await seite({ schritt: "fort" }).catch(() => {});
            await seite({ schritt: "importFort" }).catch(() => {});
        }
        console.log(`  teilen ${name}: Δ ${z.diff} · Rauschen ${z.rausch} · Werk im Bild ${z.praesenz}${z.fehler ? " — " + z.fehler : ""} · ${H.sek()} s`);
    }
    // DIE FEINDLICHE WELT (schutz, wörtlich „feindliche Welt geladen“): zuletzt, denn eine Welt, die eintritt, lädt die Seite neu. Das
    // eigene Werk steht an der Kamera der Pose, je Fall: anklopfen, „ersetzen“, bis eine Zeile im Spieler-Kanal steht oder die Seite neu
    // lädt (höchstens 8 s); danach das Bild gegen das davor, der Stand, die Welt. Tritt sie ein, kehrt die Probe heim (`_weltWechsel`).
    j.welt = { faelle: {} };
    if (H.rest() < 30) j.welt.fehler = "Frist der Probe vor der feindlichen Welt (" + H.sek() + " s)";
    else
        try {
            const name = H.seite.WERKE[0];
            const o = await seite({ schritt: "original", name, soll: S });
            if (o.fehler) throw new Error(o.fehler);
            const A = await H.seite.paarSchuss(H, o, name + "-welt");
            Object.assign(j.welt, { werk: name, rausch: H.seite.paarDiff(H, A, await H.seite.paarSchuss(H, o, name + "-welt-2")) });
            for (const fall of H.seite.WELT) {
                let neu = false;
                const nav = (f) => f === page.mainFrame() && (neu = true);
                page.on("framenavigated", nav);
                const v = await seite({ schritt: "weltVor", fall });
                if (v.fehler) throw new Error(v.fehler);
                const t0 = Date.now();
                while (!neu && Date.now() - t0 < 8000 && !(await page.evaluate((n0) => document.querySelectorAll("#chat-output > div").length > n0, v.n0).catch(() => false))) await H.schlaf(200);
                await H.schlaf(neu ? 0 : 400);
                page.off("framenavigated", nav);
                if (neu) {
                    // EINGETRETEN: die Seite trägt die feindliche Welt — beim Namen, dann heim
                    await H.binnen(page.waitForFunction(() => window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state.worldMeta, { timeout: 0, polling: 250 }), 60000);
                    const welt = await page.evaluate(() => window.anazhRealm.state.worldMeta.worldId).catch(() => null);
                    j.welt.faelle[fall] = { ok: true, neu: true, welt, zeile: "", stand: false };
                    console.log(`  ❌ feindliche Welt ${fall}: EINGETRETEN (die Seite lud neu, Welt ${welt}) · ${H.sek()} s`);
                    await H.binnen(page.evaluate((heim) => window.anazhRealm._weltWechsel(heim).then(() => true), v.heim), 40000);
                    break;
                }
                const f = (j.welt.faelle[fall] = await seite({ schritt: "weltNach" }));
                f.diff = H.seite.paarDiff(H, A, await H.seite.paarSchuss(H, o, name + "-welt-" + fall));
                console.log(`  ${!f.ok && f.zeile && f.stand ? "✅" : "❌"} feindliche Welt ${fall}: ${f.ok ? "EINGETRETEN" : "abgewiesen"} · Stand ${f.stand ? "gleich" : "VERÄNDERT"} · Δ ${(100 * f.diff).toFixed(2)} % · „${f.zeile}“`);
            }
            if (!Object.values(j.welt.faelle).some((f) => f.neu)) {
                await seite({ schritt: "fort" });
                j.welt.praesenz = H.seite.paarDiff(H, A, await H.seite.paarSchuss(H, o, name + "-welt-leer"));
            }
        } catch (e) {
            j.welt.fehler = String((e && e.message) || e).slice(0, 300);
            await seite({ schritt: "fort" }).catch(() => {});
        }
    return j;
}
const PAAR_WELT = ["gesetz", "pflug"];
// DER DECKEL: 75 s für die Paare und die Codes (vorrat2), dazu die feindliche Welt — zwei Schüsse, je Fall ≤ 8 s und ein Schuss, eine
// Rückkehr, falls sie eintritt (≤ 40 s)
const PAAR_PROBE = { ...probeBefehl(probeBildpaar, 120, { SOLL: JSON.stringify(PAAR_SOLL), WERKE: JSON.stringify(PAAR_WERKE), FREMD: JSON.stringify(PAAR_FREMD), WELT: JSON.stringify(PAAR_WELT), paarSeite, paarSchuss, paarDiff }), mutiert: true };
// die Rohdatei des Paars als Probe des Urteils: gesund je Werk Δ 0,02 % bei Rauschen 0,01 %, das Werk trägt 4 % des Bilds
const paarRoh = (teilen = {}, schutz = {}, faelle = {}, welt = {}, weltFaelle = {}) => {
    const z = (o) => ({ rausch: 0.0001, praesenz: 0.04, diff: 0.0002, ...o });
    const f = (o) => ({ ok: false, grund: "signatur", zeile: "Geteiltes Werk abgewiesen: Signatur", stand: true, diff: 0.0001, ...o });
    const w = (o) => ({ ok: false, welt: "a1b2c3d4", zeile: "Ersetzen abgelehnt: Das Gesetz der Welt abgelehnt", stand: true, diff: 0.0001, ...o });
    return {
        adapter: "amd/rdna-3",
        teilen: { bank_sitzbank: z(teilen.bank_sitzbank), eigen_bruecke: z(teilen.eigen_bruecke) },
        schutz: { werk: "bank_sitzbank", rausch: 0.0001, praesenz: 0.04, ...schutz, faelle: { verb: f(faelle.verb), signatur: f(faelle.signatur), welt: f(faelle.welt) } },
        welt: { werk: "bank_sitzbank", rausch: 0.0001, praesenz: 0.04, ...welt, faelle: { gesetz: w(weltFaelle.gesetz), pflug: w(weltFaelle.pflug) } },
    };
};
const PAAR_KARTE = "[linse-gpu] amd/rdna-3";
const PAAR_PFAD = [
    "stamm/netz-identitaet.js",
    "stamm/netz-p2p.js",
    "stamm/speicher-*.js",
    "stamm/dienst.js",
    "stamm/feld-dsl.js",
    "stamm/feld-leben.js",
    "stamm/werkstatt-*.js",
    "stamm/studio-*.js",
    "stamm/bau-*.js",
    "stamm/dirigent-*.js",
    "stamm/stoff-*.js",
    "stamm/bild-*.js",
    "index.html",
    "fachwerk-core.js",
    "foundry-core.js",
    "foundry-bruecke.js",
    "scripts/werkbank.cjs",
    "scripts/diag-werkstatt-weg.cjs",
    "scripts/lib/abnahme-urteil.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "scripts/lib/welt-boot.cjs",
];
// das Fachwerk allein aus der K4-Probe (mensch.bau.bauen S 1): die Differenz Labor ↔ Welt über der Gestalt beider Seiten
const k4Fachwerk = (j) => {
    const z = ((j && j.studios) || {}).fachwerk || null;
    const hw = !!(j && j.geraet) && !/swiftshader|llvmpipe|lavapipe|software|subzero|Gerät ungenannt|probe/i.test(String(j.geraet));
    const d = z && z.differenz && z.differenz.anteil;
    return {
        gruen: hw && !!z && k4Gestalt(z) && z.welt.pixel > 0 && z.buehne.pixel > 0 && Number.isFinite(d) && d <= 0.021,
        zahl:
            "fachwerk Labor ↔ Welt an derselben Kamera: " + (Number.isFinite(d) ? (100 * d).toFixed(1) + " %" : "–") + " (Soll ≤ 2,1 % über der Gestalt beider Seiten" +
            (z && !k4Gestalt(z) ? ", OHNE Gestalt beider Seiten" : "") + ")" + (z && z.grund ? " [" + String(z.grund).slice(0, 120) + "]" : "") + " · " + ((j && j.geraet) || "Gerät ungenannt"),
    };
};
// ───────── DER TAKT AN DER ANKUNFT (Karte 2: erleben.sinn.takt S 1, vorrat3-stationen-g4) ─────────
// 10 Minuten Spielgang am Grund der Sitzung (die Ankunft ihrer Welt), die Schleife des Spiels läuft wie im Spiel. DER GANG je Minute
// (fest, keine Wahl): 20 s gehen (die echte Taste W über CDP, kein Zeiger), 10 s umsehen (die Gier um 450°: rundum und eine
// Vierteldrehung weiter), 20 s gehen in die neue Richtung, 10 s stehen — je Minute eine Seite eines Quadrats um die Ankunft. DIE ZÄHLUNG je Bild der Seite (requestAnimationFrame, die Frage des Spiels `_kreaturImBlick` am Frustum
// des Vor-Takts): eine Tat im Buch der Wertung (`state.taten`, `_tatWerten` — ohne Ort oder mit Ort im Blick) · ein Tier im Blick, das
// in die Flucht wechselt (`userData._motionZustand` „flucht“) · eine Zeile der Stimme des Felds (`_stimme.t`, `_feldStimme`) · ein
// Eintrag im Tagebuch der Welt (`worldJournal.entries`). TOT ist die Minute, in der nichts davon geschah; GRÜN bei ≤ 50 % toter
// Minuten über 10 ganze Minuten, jede mit gezeichneten Bildern.
const TAKT_SOLL = { minuten: 10, totAnteil: 0.5 };
async function taktSeite(o) {
    const r = window.anazhRealm, st = r.state;
    const T = (window.__takt ||= { an: false });
    const leer = () => ({ taten: 0, tiere: 0, stimme: 0, tagebuch: 0, bilder: 0 });
    const tagebuch = () => ((st.worldJournal && st.worldJournal.entries) || []).length;
    if (o.schritt === "an") {
        Object.assign(T, { an: true, m: leer(), zustand: new Map(), letzte: (st.taten || [])[(st.taten || []).length - 1] || null, stimmeT: r._stimme ? r._stimme.t : null, tb: tagebuch() });
        const tick = () => {
            if (!T.an) return;
            try {
                T.m.bilder++;
                for (const c of st.creatures || []) {
                    const z = (c.userData && c.userData._motionZustand) || null;
                    if (T.zustand.get(c) !== z) {
                        if (z === "flucht" && T.zustand.has(c) && r._kreaturImBlick(c.position.x, c.position.z)) T.m.tiere++;
                        T.zustand.set(c, z);
                    }
                }
                const buch = st.taten || [];
                for (let i = buch.length - 1; i >= 0 && buch[i] !== T.letzte; i--) if (buch[i].x == null || r._kreaturImBlick(buch[i].x, buch[i].z)) T.m.taten++;
                T.letzte = buch[buch.length - 1] || null;
                const s = r._stimme ? r._stimme.t : null;
                if (s !== T.stimmeT) (T.m.stimme++, (T.stimmeT = s));
            } catch (e) {
                T.fehler = String((e && e.message) || e).slice(0, 160);
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        return { tiere: (st.creatures || []).length, tagebuch: T.tb };
    }
    if (o.schritt === "umsehen") {
        const y0 = st.yaw, t0 = performance.now();
        await new Promise((ok) => {
            const dreh = () => {
                const k = Math.min(1, (performance.now() - t0) / o.ms);
                st.yaw = y0 + 2.5 * Math.PI * k; // einmal rundum und eine Vierteldrehung weiter: der Gang läuft ein Quadrat um die Ankunft
                k < 1 ? requestAnimationFrame(dreh) : ok();
            };
            requestAnimationFrame(dreh);
        });
        return 1;
    }
    if (o.schritt === "minute") {
        const tb = tagebuch();
        const m = { ...T.m, tagebuch: Math.max(0, tb - T.tb), fehler: T.fehler || null, ort: [st.playerMesh.position.x, st.playerMesh.position.z].map((v) => +v.toFixed(1)) };
        Object.assign(T, { m: leer(), tb, fehler: null });
        return m;
    }
    if (o.schritt === "aus") return (T.an = false), 1;
    return { fehler: "kein Schritt " + o.schritt };
}
async function probeTakt(H) {
    const { page } = await H.verbinde();
    const ad = await page.evaluate(async () => {
        const a = navigator.gpu && (await navigator.gpu.requestAdapter());
        const i = (a && a.info) || {};
        return a ? (i.vendor || "?") + "/" + (i.architecture || "?") : "kein Adapter";
    });
    console.log("[linse-gpu] " + ad);
    const S = H.seite.SOLL;
    const seite = (o) => page.evaluate(H.seite.taktSeite, o);
    await H.ereignisStrom(page);
    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop((t) => window.anazhRealm._gameLoopTick(t)));
    H.beimAbbau(() => page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null)));
    H.beimAbbau(() => seite({ schritt: "aus" }));
    H.beimAbbau(() => page.keyboard.up("KeyW"));
    const j = (H.teil = { adapter: ad, soll: S, an: await seite({ schritt: "an" }), minuten: [] });
    // die Lebenszeichen der Probe (punkte.cjs STILLE_S): je 10 s eine Zeile
    const warte = async (ms, was) => {
        for (let t = 0; t < ms; t += 10000) {
            await H.schlaf(Math.min(10000, ms - t));
            H.zeile("Takt: " + was);
        }
    };
    for (let n = 0; n < S.minuten; n++) {
        if (H.rest() < 64) {
            H.fristRiss("Minute " + (n + 1) + " und die folgenden ausgelassen");
            break;
        }
        await page.keyboard.down("KeyW");
        await warte(20000, "gehen");
        await page.keyboard.up("KeyW");
        await seite({ schritt: "umsehen", ms: 10000 });
        H.zeile("Takt: umgesehen");
        await page.keyboard.down("KeyW");
        await warte(20000, "gehen");
        await page.keyboard.up("KeyW");
        await warte(10000, "stehen");
        const m = await seite({ schritt: "minute" });
        const tot = !(m.taten + m.tiere + m.stimme + m.tagebuch > 0);
        j.minuten.push({ ...m, tot });
        console.log(`  ${tot ? "❌ tot" : "✅ lebt"} Minute ${n + 1}: Taten ${m.taten} · Tiere in Flucht ${m.tiere} · Stimme ${m.stimme} · Tagebuch ${m.tagebuch} · ${m.bilder} Bilder · am ${m.ort.join(", ")}${m.fehler ? " — " + m.fehler : ""} · ${H.sek()} s`);
    }
    return j;
}
const TAKT_PROBE = { ...probeBefehl(probeTakt, 640, { SOLL: JSON.stringify(TAKT_SOLL), taktSeite }), mutiert: true };
const taktUrteil = (j, lauf) => {
    const { ad, hw } = PAAR_HW(lauf.stdout);
    const M = (j && j.minuten) || [];
    if (!M.length) return { gruen: false, zahl: "keine Minute in der Ausgabe der Probe (Exit " + lauf.exit + ") · " + ad };
    const tot = M.filter((m) => m.tot).length;
    const ohneBild = M.filter((m) => !(m.bilder > 0)).length;
    const ganz = M.length === TAKT_SOLL.minuten;
    // DIE MINUTEN, DIE FEHLEN (pm-front-f1; GTX 31ea3847 „0/4 Minuten tot (0 %, … NICHT GANZ)“ stand ROT — die Frist der Probe riss nach
    // 4 von 10 Minuten, kein toter Anteil war gemessen): fehlen Minuten und könnte der Rest das Soll noch halten, ist es kein Urteil
    // (`ohneUrteil`, punkte.cjs keinUrteil (f)); reißt der tote Anteil schon über 10 Minuten gerechnet, ist es ROT
    const offenM = TAKT_SOLL.minuten - M.length;
    const ohne = !ganz && offenM > 0 && tot <= TAKT_SOLL.totAnteil * TAKT_SOLL.minuten ? "nur " + M.length + " von " + TAKT_SOLL.minuten + " Minuten gegangen (die Frist der Probe riss), " + tot + " tot" : null;
    return {
        ...(ohne ? { ohneUrteil: ohne } : {}),
        gruen: hw && lauf.exit === 0 && ganz && ohneBild === 0 && tot / M.length <= TAKT_SOLL.totAnteil,
        zahl:
            tot + "/" + M.length + " Minuten tot (" + ((100 * tot) / M.length).toFixed(0) + " %, Soll ≤ 50 % über " + TAKT_SOLL.minuten + " Minuten" + (ganz ? "" : ", NICHT GANZ") + ")" +
            (ohneBild ? " · " + ohneBild + " Minuten ohne Bild" : "") + " · Σ Taten " + M.reduce((s, m) => s + m.taten, 0) + " · Tiere in Flucht " + M.reduce((s, m) => s + m.tiere, 0) +
            " · Stimme " + M.reduce((s, m) => s + m.stimme, 0) + " · Tagebuch " + M.reduce((s, m) => s + m.tagebuch, 0) + " · " + ad,
    };
};
const taktRoh = (tote = 3, o = {}) => ({
    adapter: "amd/rdna-3",
    soll: TAKT_SOLL,
    minuten: Array.from({ length: TAKT_SOLL.minuten }, (_, i) => (i < tote ? { taten: 0, tiere: 0, stimme: 0, tagebuch: 0, bilder: 3400, tot: true } : { taten: 1, tiere: 1, stimme: 0, tagebuch: 0, bilder: 3400, tot: false })),
    ...o,
});
const TAKT_PFAD = [
    "stamm/feld-sprache.js",
    "stamm/feld-*.js",
    "stamm/kreatur-*.js",
    "stamm/koerper-*.js",
    "stamm/dienst.js",
    "stamm/dirigent-*.js",
    "index.html",
    "scripts/werkbank.cjs",
    "scripts/lib/welt-boot.cjs",
];

// ───────── DIE ROLLE: VIER VERB-GRUPPEN ÄNDERN DIE WELT (Karte 2: erleben.spieler.rolle S 1, vorrat3-stationen-g4) ─────────
// In der warmen Welt der Sitzung, die Schleife des Spiels läuft. Je Gruppe ein Ort vor dem Spieler und EINE Kamera dahinter (6 m
// zurück, 4 m hoch, Blick auf den Ort): zwei Schüsse vor der Tat (der Rausch-Boden, `/bild` wie das Bildpaar), die Tat, ein Schuss
// danach — SICHTBAR heißt: Δ über dem doppelten Rausch-Boden plus 0,1 % der Leinwand. Die Weltänderung je Gruppe am Feld der Welt:
//   gehen    ein Tier (spawnCreatureAt, die Seele „wesen“ — „hirsch“ ist keine Seele, die Absage wäre laut) 16 m voraus, der Spieler geht auf es zu (die echte Taste W, ≤ 8 s): es wechselt in die Flucht
//            (`_motionZustand` „flucht“, je Bild gelesen; `_creatureWarinessSpieler`)
//   bauen    das Werk der Bank (`spawn_blueprint` mit Same und Stempel, Quelle „spieler“, wie das Bildpaar) 10 m voraus: ein Werk mehr
//   fahren   der Wagen der Werkstatt (WERKE.GT der Linse) 5 m voraus, der Spieler 2 m davor: E (die echte Taste, Aufstieg),
//            W ≤ 5 s, E — der Wagen steht ≥ 10 m weiter
//   kämpfen  im pfad ein hungriger Wolf 8 m voraus, der den Spieler nach dem Gesetz jagt; der Spieler dreht sich zu ihm, geht auf
//            ihn zu, solange er fern ist (W), und schlägt, sobald er in der Klinge steht (`_playerAttackCreature` mit dem Tier als
//            Ziel, der Ruf des Klicks — die Probe klickt nie: kein Zeiger-Fang), ≤ 12 s Schleife: seine hp sinken
// Die 15 min des Richters sind Obergrenze; die Probe endet je Gruppe bei der ersten Änderung. GRÜN bei 4/4 Gruppen mit Änderung UND Bild.
const ROLLE_SOLL = { faktor: 2, rand: 0.001, schwelle: 24, w: 640, h: 360, fov: 50, fahrM: 10, gehenS: 8, fahrS: 5, kampfS: 12 };
const ROLLE_GRUPPEN = ["gehen", "bauen", "fahren", "kaempfen"];
async function rolleSeite(o) {
    const r = window.anazhRealm, st = r.state;
    const R = (window.__rolle ||= {});
    const pm = st.playerMesh.position;
    const v = r._blickVorn(st.yaw, 0);
    const vorn = (d) => ({ x: pm.x + v.x * d, z: pm.z + v.z * d });
    const boden = (q) => r.getTerrainHeightAt(q.x, q.z);
    const kam = (q, h = 1) => ({ kamera: [pm.x - v.x * 6, boden(pm) + 4, pm.z - v.z * 6], ziel: [q.x, boden(q) + h, q.z] });
    // der Ort trägt das Werk nicht immer (ein Baum, ein Hang): wie das Bildpaar ein paar Orte um den Wunsch, der erste, der trägt
    const werk = (name, q) => {
        const bp = st.blueprints[name];
        if (!bp) return null;
        for (const [dx, dz] of [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2], [3, 3]]) {
            const p = { x: q.x + dx, z: q.z + dz };
            const lauf = r.dslRun(["spawn_blueprint", name, ["at", p.x, boden(p), p.z], r._werkSame(bp, name, null), null, r._studioStampFor(name) || null, 0], { source: "spieler" });
            const e = lauf.log.find((x) => x.event === "spawned_blueprint" && x.id != null);
            const E = e && st.architectures.find((a) => a && a.id === e.id);
            if (E) return E;
        }
        return null;
    };
    const s = o.schritt;
    if (s === "an") {
        R.halt = st.weatherEffectTime;
        st.weatherEffectTime = 0; // der Halt der Messung (probeVerben): unter ihm setzt die Werk-Sprache nichts
        r.setTimeOfDay(0.5, "human"), r._setWeather("sunny", "human"), (st.weatherTransition = null);
        return 1;
    }
    if (s === "zurueck") {
        if (st.player.mountedArch != null) r.dismountArchitecture();
        if (R.halt !== undefined) st.weatherEffectTime = R.halt;
        R.an = false;
        return 1;
    }
    if (s === "gehenAn") {
        const q = vorn(16);
        const c = r.spawnCreatureAt(q.x, boden(q), q.z, "happy", o.seele, { absage: (g) => (R.absage = g) });
        if (!c) return { fehler: "kein Tier am Ort (spawnCreatureAt " + o.seele + ": " + R.absage + ")" };
        Object.assign(R, { tier: c, flucht: false, an: true });
        const blick = () => {
            if (!R.an) return;
            if (c.userData && c.userData._motionZustand === "flucht") R.flucht = true;
            requestAnimationFrame(blick);
        };
        requestAnimationFrame(blick);
        return { ...kam(q), d: +Math.hypot(c.position.x - pm.x, c.position.z - pm.z).toFixed(2) };
    }
    // DAS WESEN BEIM NAMEN (Vorarbeiter 10, 17.11.; GTX 7de938ab: das Wesen bekam nie einen Bewegungs-Zustand, zustand null, der
    // Spieler ging bis 2,08 m heran — an der Radeon floh es nach 1,9 s in 13,99 m): die Zeile nennt, wie das Spiel es führte — Gattung,
    // Größe, Temperament, Aufgabe, ruht (`_ruht`: kein Takt des Verhaltens), nah (`_kzNah`, der Nah-Kreis des Spiels), Satz, sichtbar —
    // damit EINE Fahrt an jedem Gerät Station (das Wesen anders gestellt) und Spiel (dasselbe Wesen, ein anderer Takt) trennt
    if (s === "gehenNach") {
        const c = R.tier, u = c.userData || {};
        R.an = false;
        return { flucht: R.flucht, d: +Math.hypot(c.position.x - pm.x, c.position.z - pm.z).toFixed(2), zustand: u._motionZustand || null,
            wesen: { gattung: u.gattung || null, groesse: +(u.bodySize || 0).toFixed(2), temperament: r._creatureTemperament(c), task: (u.task && u.task.name) || null, ruht: u._ruht === true, nah: u._kzNah === true, satz: !!u._satz, sichtbar: c.visible !== false } }; // prettier-ignore
    }
    if (s === "bauenAn") {
        R.q = vorn(10);
        R.n0 = st.architectures.filter(Boolean).length;
        // DAS WERK IM RAHMEN (17.11., Radeon 389a6496: die Bank stand im Bild, 37 × 20 px aus 16 m hinter ihr und 4 m hoch — Δ 0,38 %
        // unter der Schwelle 2 × Rauschen + 0,1 %): die Kamera steht 6 m vor dem Ort des Werks, 3 m hoch, wie das Bildpaar eines
        // Bauenden, der auf sein Werk sieht; die Schwelle bleibt
        return { kamera: [R.q.x - v.x * 6, boden(R.q) + 3, R.q.z - v.z * 6], ziel: [R.q.x, boden(R.q) + 0.5, R.q.z] };
    }
    if (s === "bauen") {
        const E = werk(o.name, R.q);
        if (!E) return { fehler: "kein Werk " + o.name + " am Ort" };
        await window.__gebautNach("das Werk " + E.type, { fertig: () => !!(E.mesh && E.mesh.parent) || !!(E.instFoundry || (E.instSlots && E.instSlots.length)), bau: () => {} });
        return { id: E.id, n: st.architectures.filter(Boolean).length - R.n0 };
    }
    if (s === "fahrenAn") {
        const q = vorn(5);
        const E = werk(o.name, q);
        if (!E) return { fehler: "kein Wagen " + o.name + " am Ort" };
        // der Wagen steht, wenn sein Körper in der Szene hängt (der Stempel des Studios kommt asynchron): auf das Ereignis, wie das Werk
        await window.__gebautNach("der Wagen " + E.type, { fertig: () => !!(E.mesh && E.mesh.parent) || !!(E.instFoundry || (E.instSlots && E.instSlots.length)), bau: () => {} });
        R.wagen = E;
        R.p0 = [E.position.x, E.position.z];
        const k = kam({ x: E.position.x, z: E.position.z });
        const f = { x: E.position.x - v.x * 2, z: E.position.z - v.z * 2 }; // 2 m vor dem Wagen, der Blick auf ihn
        pm.set(f.x, boden(f) + r.constructor.PLAYER_FOOT_OFFSET, f.z);
        return { ...k, id: E.id };
    }
    if (s === "sitzt") return { sitzt: st.player.mountedArch === (R.wagen && R.wagen.id) };
    if (s === "fahrenNach") {
        if (st.player.mountedArch != null) r.dismountArchitecture();
        const p = R.wagen.position;
        return { m: +Math.hypot(p.x - R.p0[0], p.z - R.p0[1]).toFixed(2) };
    }
    // DER KAMPF WIE EIN SPIELER KÄMPFT (17.11., Radeon e489088a: das Wesen 0,83 m vor der Klinge floh vor dem Schwung nach dem
    // Furcht-Gesetz — Abstand 3,39 m beim Auslösen, Klinge 0,66 m, Zustand „flucht“): kein gestelltes Ziel. Im pfad (dem Modus, in dem
    // der Mensch jagt und gejagt wird, `_kreaturJagdBereit`) steht 8 m voraus ein Wolf — wild, hungrig, der Spieler ist seine Beute
    // (`_kreaturIstBeute`: die Masse des Leibs ≤ jagd.beuteMasse × die des Wolfs); er jagt ihn nach dem Gesetz der Jagd. Der Spieler
    // dreht sich zu ihm (der Blick, `st.yaw`), geht auf ihn zu, solange er fern ist (die echte Taste W), und schlägt, sobald er in der
    // Klinge steht — der Ruf des Klicks mit dem Tier als Ziel (`_playerAttackCreature`, die Probe klickt nie: kein Zeiger-Fang).
    if (s === "kampfAn") {
        R.modus = typeof r.getGameMode === "function" ? r.getGameMode() : null;
        R.php = st.player.hp;
        r.setGameMode("pfad");
        const q = vorn(8);
        // DER WOLF, DEM DER SPIELER BEUTE IST (18.11., GTX e4e3f363: der EINE gestellte Wolf war klein — hp 72, seine Größe kommt aus
        // seiner netId —, der Spieler war ihm keine Beute, er floh nach dem Gesetz, 3/4 ROT; am d3ddb51c hp 165, 4/4): die Aufstellung
        // wirft Wölfe, bis das Gesetz einen führt, dem der Spieler Beute ist (wild · `_kreaturIstBeute`), höchstens WUERFE; jeder
        // andere geht wieder. Führt es keinen, sagt die Probe es laut (`messort` → die Marke MESSORT) — nie still ein anderes Tier.
        const WUERFE = 8, kg = [];
        let c = null;
        for (let i = 0; i < WUERFE && !c; i++) {
            const w = r.spawnCreatureAt(q.x, boden(q), q.z, "calm", "wolf", { absage: (g) => (R.absage = g) });
            if (!w) return { fehler: "kein Wolf am Ort (spawnCreatureAt wolf: " + R.absage + ")" };
            kg.push(Math.round(r._leibMasse(w)));
            if (r._creatureTemperament(w) === "wild" && r._kreaturIstBeute(w, st.playerMesh)) c = w;
            else r.removeCreature(w);
        }
        if (!c) {
            const grund = "kein Wolf, dem der Spieler Beute ist: " + WUERFE + " Würfe, Wolf " + kg.join("/") + " kg, Spieler " + Math.round(r._leibMasse(st.playerMesh)) + " kg";
            return { fehler: grund, messort: "rolle kämpfen: " + grund };
        }
        R.ziel = c;
        R.hp0 = c.userData.hp;
        // DER LEIB DES ZIELS IN DER KLINGE (Vorarbeiter 9, 17.11.; GTX 7de938ab: ein Wolf mit hp 754 statt 127 hetzte und hielt in
        // 1,80 m, wo sein Maul den Spieler erreicht — die Probe schlug nur bis Klinge + 0,6 m = 1,26 m und schwang nie): der Hieb
        // fällt, wo das Grob-Tor des Spiels ihn zulässt — Klinge + die Reichweite des Leibs (`_trefferErreichbar`, `_kreaturLeib`)
        const leib = r._kreaturLeib(c, 0, {});
        R.schlag = { schwuenge: 0, dHieb: null, dMin: null, reach: +r._kampfBladeReach().toFixed(2), leibR: +leib.reichweite.toFixed(2), jagt: false, zustaende: [] };
        st.player.stamina = st.player.staminaMax;
        return { ...kam(q), hp: R.hp0, seele: "wolf", temperament: r._creatureTemperament(c), beute: r._kreaturIstBeute(c, st.playerMesh), modus: r.getGameMode(), wuerfe: kg.length, kg: kg[kg.length - 1] };
    }
    // EIN TAKT DES KÄMPFERS (je 100 ms aus der Probe): Blick auf den Wolf, sein Abstand und Zustand; steht er in der Klinge und läuft
    // kein Schwung, der Hieb. `nah` sagt der Probe, ob die Taste W ruhen soll (der Spieler geht nur auf den fernen Wolf zu).
    if (s === "kampfTakt") {
        const c = R.ziel, p = st.player, S = R.schlag;
        const [dx, dz] = [c.position.x - pm.x, c.position.z - pm.z];
        const d = Math.hypot(dx, dz);
        const soll = Math.atan2(dx, dz), ist = ((w) => Math.atan2(w.x, w.z))(r._blickVorn(st.yaw, 0));
        const y1 = st.yaw + (soll - ist), y2 = st.yaw - (soll - ist);
        const fehl = (y) => Math.abs(Math.atan2(Math.sin(Math.atan2(r._blickVorn(y, 0).x, r._blickVorn(y, 0).z) - soll), Math.cos(Math.atan2(r._blickVorn(y, 0).x, r._blickVorn(y, 0).z) - soll)));
        st.yaw = fehl(y1) <= fehl(y2) ? y1 : y2;
        const z = (c.userData && c.userData._motionZustand) || null;
        if (z && S.zustaende[S.zustaende.length - 1] !== z) S.zustaende.push(z);
        if ((r._spielerJaeger || []).includes(c) || (c.userData && c.userData._jagdZiel != null)) S.jagt = true;
        S.dMin = S.dMin == null ? +d.toFixed(2) : Math.min(S.dMin, +d.toFixed(2));
        const frei = !(p._swing && p._swing.t < p._swing.dauer);
        if (frei && r._trefferErreichbar(c, pm.x, pm.z, S.reach) && c.userData.hp > 0) {
            p.stamina = p.staminaMax;
            if (r._playerAttackCreature(c) !== false) (S.schwuenge += 1), (S.dHieb = +d.toFixed(2));
        }
        return { d: +d.toFixed(2), nah: d <= S.reach + S.leibR + 0.9, hp: c.userData.hp, getroffen: c.userData.hp < R.hp0 };
    }
    if (s === "kampfNach") {
        const c = R.ziel;
        return { hp: c.userData.hp, hp0: R.hp0, schwung: R.schlag.schwuenge > 0, ...R.schlag, dNach: +Math.hypot(c.position.x - pm.x, c.position.z - pm.z).toFixed(2), zustand: (c.userData && c.userData._motionZustand) || null };
    }
    if (s === "kampfZurueck") {
        if (R.ziel && (st.creatures || []).includes(R.ziel)) r.removeCreature(R.ziel);
        if (R.modus) r.setGameMode(R.modus);
        if (Number.isFinite(R.php)) st.player.hp = R.php;
        return 1;
    }
    return { fehler: "kein Schritt " + s };
}
async function probeRolle(H) {
    const { page } = await H.verbinde();
    const ad = await page.evaluate(async () => {
        const a = navigator.gpu && (await navigator.gpu.requestAdapter());
        const i = (a && a.info) || {};
        return a ? (i.vendor || "?") + "/" + (i.architecture || "?") : "kein Adapter";
    });
    console.log("[linse-gpu] " + ad);
    const S = H.seite.SOLL;
    const seite = (o) => page.evaluate(H.seite.rolleSeite, o);
    const { WERKE } = H.linse("scripts/diag-werkstatt-weg.cjs", ["WERKE"]);
    await H.ereignisStrom(page);
    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop((t) => window.anazhRealm._gameLoopTick(t)));
    H.beimAbbau(() => page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null)));
    await seite({ schritt: "an" });
    H.beimAbbau(() => seite({ schritt: "zurueck" }));
    H.beimAbbau(() => page.keyboard.up("KeyW"));
    const AB = require(H.path.resolve("scripts/lib/abnahme-urteil.cjs"));
    const schuss = async (k, name) => {
        const datei = String(H.AUS).replace(/\.json$/i, "") + "-rolle-" + name + ".png";
        const b = await H.wb("/bild", { px: k.kamera[0], py: k.kamera[1], pz: k.kamera[2], lx: k.ziel[0], ly: k.ziel[1], lz: k.ziel[2], w: S.w, h: S.h, fov: S.fov, wahl: "0", datei }, 90000);
        if (!b || !b.datei || !H.fs.existsSync(b.datei)) throw new Error("/bild " + name + ": " + JSON.stringify(b).slice(0, 200));
        return AB.pngLesen(H.fs.readFileSync(b.datei));
    };
    const diff = (A, B) => AB.bildRauschen(A.u8, B.u8, A.W, A.H, S.schwelle).anteil;
    const j = (H.teil = { adapter: ad, soll: S, gruppen: {} });
    // DIE WELT WACH VOR JEDER TAT (17.11., GTX und Radeon ee9c1965/389a6496 0/4 an der AUFSTELLUNG): jedes `/bild` der Werkbank lässt
    // den Loop ruhen und hält die Welt (weatherEffectTime −1e9, `wetterHalten`), unter dem Halt verweigert dslEval jeden Welt-Akt —
    // die Schüsse vor der Tat froren Gang, Hieb, Werk und Wagen ein. Vor der Aufstellung und nach den Schüssen läuft die Schleife des
    // Spiels wieder, der Halt steht auf 0; `halt` nennt ihn an der Tat
    const wach = () => page.evaluate(() => { const r = window.anazhRealm; r.state.weatherEffectTime = 0; r.state.renderer.setAnimationLoop((t) => r._gameLoopTick(t)); return r.state.weatherEffectTime; }); // prettier-ignore
    for (const g of H.seite.GRUPPEN) {
        if (H.rest() < 25) {
            j.gruppen[g] = { fehler: "Frist der Probe vor der Gruppe (" + H.sek() + " s)" };
            continue;
        }
        const z = (j.gruppen[g] = {});
        try {
            await wach();
            const tA = Date.now();
            const an = await seite({ schritt: { gehen: "gehenAn", bauen: "bauenAn", fahren: "fahrenAn", kaempfen: "kampfAn" }[g], seele: "wesen", name: g === "fahren" ? WERKE.GT : "bank_sitzbank" });
            z.aufstellungS = +((Date.now() - tA) / 1000).toFixed(2);
            if (an.messort) console.log("@@PUNKTE@@ MESSORT " + String(an.messort).replace(/\s+/g, " ").slice(0, 280));
            if (an.fehler) throw new Error(an.fehler);
            const A = await schuss(an, g + "-vor");
            z.rausch = diff(A, await schuss(an, g + "-vor-2"));
            z.halt = await wach();
            const t0 = Date.now();
            if (g === "gehen") {
                await page.keyboard.down("KeyW");
                while (Date.now() - t0 < S.gehenS * 1000 && !(await page.evaluate(() => window.__rolle.flucht))) await H.schlaf(250);
                await page.keyboard.up("KeyW");
                z.welt = await seite({ schritt: "gehenNach" });
                z.aenderung = z.welt.flucht === true;
            } else if (g === "bauen") {
                z.welt = await seite({ schritt: "bauen", name: "bank_sitzbank" });
                if (z.welt.fehler) throw new Error(z.welt.fehler);
                z.aenderung = z.welt.n >= 1;
            } else if (g === "fahren") {
                await page.keyboard.press("KeyE");
                await H.schlaf(500);
                z.sitzt = (await seite({ schritt: "sitzt" })).sitzt;
                if (z.sitzt) {
                    await page.keyboard.down("KeyW");
                    await H.schlaf(S.fahrS * 1000);
                    await page.keyboard.up("KeyW");
                    await page.keyboard.press("KeyE");
                }
                z.welt = await seite({ schritt: "fahrenNach" });
                z.aenderung = z.sitzt === true && z.welt.m >= S.fahrM;
            } else {
                H.beimAbbau(() => seite({ schritt: "kampfZurueck" }));
                z.ziel = { seele: an.seele, temperament: an.temperament, beute: an.beute, modus: an.modus, wuerfe: an.wuerfe, kg: an.kg };
                let w = false, k = null, getroffenS = null;
                try {
                    while (Date.now() - t0 < S.kampfS * 1000) {
                        k = await seite({ schritt: "kampfTakt" });
                        if (k.getroffen) {
                            getroffenS = +((Date.now() - t0) / 1000).toFixed(1);
                            await H.schlaf(300);
                            break;
                        }
                        if (!k.nah !== w) await (w ? page.keyboard.up("KeyW") : page.keyboard.down("KeyW")), (w = !w);
                        await H.schlaf(100);
                    }
                } finally {
                    if (w) await page.keyboard.up("KeyW");
                }
                z.welt = { ...(await seite({ schritt: "kampfNach" })), getroffenS };
                z.aenderung = z.welt.schwung === true && Number.isFinite(z.welt.hp) && z.welt.hp < z.welt.hp0;
            }
            z.sek = +((Date.now() - t0) / 1000).toFixed(1);
            z.diff = diff(A, await schuss(an, g + "-nach"));
        } catch (e) {
            z.fehler = String((e && e.message) || e).slice(0, 300);
            await page.keyboard.up("KeyW").catch(() => {});
        }
        console.log(`  ${rolleSichtbar(z, S) && z.aenderung ? "✅" : "❌"} ${g}: Änderung ${z.aenderung ? "ja" : "NEIN"} ${JSON.stringify(z.welt || {})} · Δ Bild ${z.diff} · Rauschen ${z.rausch}${z.fehler ? " — " + z.fehler : ""} · ${H.sek()} s`);
    }
    return j;
    function rolleSichtbar(z, S) {
        return [z.rausch, z.diff].every(Number.isFinite) && z.diff > S.faktor * z.rausch + S.rand;
    }
}
const ROLLE_PROBE = { ...probeBefehl(probeRolle, 90, { SOLL: JSON.stringify(ROLLE_SOLL), GRUPPEN: JSON.stringify(ROLLE_GRUPPEN), rolleSeite }), mutiert: true };
const rolleSichtbar = (z, S = ROLLE_SOLL) => !!z && !z.fehler && [z.rausch, z.diff].every(Number.isFinite) && z.diff > S.faktor * z.rausch + S.rand;
const rolleRoh = (o = {}) => ({
    adapter: "amd/rdna-3",
    soll: ROLLE_SOLL,
    gruppen: Object.fromEntries(ROLLE_GRUPPEN.map((g) => [g, { rausch: 0.0004, diff: 0.03, aenderung: true, welt: {}, halt: 0, aufstellungS: 0.4, ...(g === "kaempfen" ? { ziel: { seele: "wolf", temperament: "wild", beute: true, modus: "pfad" } } : {}), ...(o[g] || {}) }])),
});
const ROLLE_PFAD = [
    "stamm/kreatur-*.js",
    "stamm/kampf.js",
    "stamm/koerper-*.js",
    "stamm/feld-dsl.js",
    "stamm/werkstatt-*.js",
    "stamm/studio-*.js",
    "stamm/bau-*.js",
    "stamm/dirigent-*.js",
    "index.html",
    "foundry-core.js",
    "foundry-bruecke.js",
    "vehicle-core.js",
    "scripts/werkbank.cjs",
    "scripts/diag-werkstatt-weg.cjs",
    "scripts/lib/abnahme-urteil.cjs",
    "scripts/lib/welt-boot.cjs",
];

const k4FachwerkRoh = (d, o = {}) => {
    const z = { gruen: d <= 0.021, differenz: { anteil: d }, albedo: { max: 0.04 }, welt: { maske: "gestalt", pixel: 340155 }, buehne: { maske: "gestalt", pixel: 341300 }, ...o };
    return "K4 " + JSON.stringify({ geraet: "WebGPU rdna-3", studios: { fachwerk: z }, fehler: [] });
};

const alle = [
    // ───────────────────────────── Studios ─────────────────────────────
    {
        kriterium: "studios.K2",
        staffel: 1,
        geraet: "headless",
        // DER GANG der Hülle (H3, Beleg 1972da18): je Studio-Seite der erste Hüllen-Schieber an seinen Rand, Strg+Z, der Wert
        // kehrt zurück. Redo (Strg+Umschalt+Z · Strg+Y) fährt der Gang nicht — die Zahl nennt es.
        befehl: ["node", "scripts/diag-studio-huelle.cjs", "--engine"],
        env: { ...SOFT, STUDIO_HUELLE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const je = {};
            for (const l of zeilen(lauf.stdout)) {
                const m = /^\s{2}(\S+)\s+\d+ Anfragen · .*?(?:Schieber ([^,\s]+) → ([^,\s]+), Strg\+Z → ([^,\s]+)|ohne Sitzung)/.exec(l);
                if (m && SEITEN[m[1]]) je[m[1]] = m[2] == null ? null : { vor: m[2], mitte: m[3], nach: m[4] };
            }
            if (!Object.keys(je).length) return { gruen: false, zahl: "keine Zeile des Gangs (Exit " + lauf.exit + ")" };
            const wirkt = Object.keys(SEITEN).filter((s) => je[s] && je[s].mitte !== je[s].vor && je[s].nach === je[s].vor);
            const ohne = Object.keys(SEITEN).filter((s) => !wirkt.includes(s));
            return {
                gruen: wirkt.length === 8,
                zahl:
                    "Undo wirkt in " + wirkt.length + "/8 Studios" + (ohne.length ? " (ohne " + ohne.join(", ") + ")" : "") +
                    ", Redo ungeprobt (der Gang fährt nur Strg+Z)",
            };
        },
        pfad: [
            "worlds/huelle/",
            "worlds/garage/",
            "worlds/schmiede/",
            "worlds/portale/",
            "worlds/klang/",
            "worlds/fachwerk/",
            "worlds/koerperstudio/",
            "worlds/tetrapoda/",
            "worlds/terrain/",
            "scripts/diag-studio-huelle.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Undo/Redo wirkt in 8/8 Studios",
    },
    {
        kriterium: "studios.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // DIE GANG-PROBE (H7, Zweig studios-k2-sitzung): je Studio-Seite 20 zufällige Griffe (Saat, nie zweimal derselbe Wert) —
        // die Zeit vom Eingabe-Ereignis bis zum ersten Bild mit neuem Bau-Hash (AnazhHuelle.gang: der rAF nach dem Render der
        // Seite trägt den Plan, den bei/nachRuhe anwandte); die Klasse je Zeile steht im Vertrag (`uniform: true` ≤ 200 ms, sonst
        // Neubau ≤ 1 s); dann das Neuladen (jeder Regler der Sitzung steht wieder, der EINE Speicher-Weg localStorage) und A/B
        // (der Gang H3: A zeigt den Stand der Öffnung, B den Zug). Die Zeit urteilt nur auf der Karte (Kopfzeile „geurteilt“).
        // IN DER SITZUNG (29.10., `probeStudios`, Zwilling von studios.K3#2). H7 fiel am Spiel 1d36d131: ohne ⏱-Zeile
        // steht das Urteil ROT mit dem Täter beim Namen, bis das Spiel den Sitzungs-Gang wieder trägt.
        probe: { ...STUDIO_PROBE, mutiert: true,  sek: 25 },
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const karte = /=== H7 DIE SITZUNG — Saat \d+, die Zeit geurteilt \(Karte\)/.test(out);
            const je = {};
            for (const l of zeilen(out)) {
                const t = /^\s{2}⏱ (\S+)\s+Griff → Bild p95 Gesetz-Wert (\S+) ms · Neubau (\S+) ms · (\d+) Griffe mit Bild · Neuladen (\d+)\/(\d+)/.exec(l);
                if (t && SEITEN[t[1]]) je[t[1]] = Object.assign(je[t[1]] || {}, { u: +t[2], n: +t[3], mit: +t[4], bleibt: +t[5] > 0 && t[5] === t[6] });
                const g = /^\s{2}(\S+)\s+\d+ Anfragen · .*?Schieber ([^,\s]+) → ([^,\s]+),.*, A → ([^,\s]+), B → ([^,\s]+)/.exec(l);
                if (g && SEITEN[g[1]]) je[g[1]] = Object.assign(je[g[1]] || {}, { ab: g[2] !== g[3] && g[4] === g[2] && g[5] === g[3] });
            }
            const s = Object.keys(SEITEN).map((id) => ({ id, ...(je[id] || {}) }));
            const klasse = (z, k, max) => !(z[k] > max); // „–“ (keine Zeile der Klasse im Studio) ist NaN und zählt nicht
            // ohne ⏱-Zeile kein Urteil der Zeit: H7 (Griff → Bild, Neuladen) fiel am Spiel 1d36d131, die Station nennt es beim Namen
            if (!s.some((z) => z.mit > 0)) return { gruen: false, zahl: "keine H7-Zeile des Gangs am Kopf (der Sitzungs-Gang fiel am Spiel 1d36d131)" };
            const zeit = s.filter((z) => z.mit > 0 && klasse(z, "u", 200) && klasse(z, "n", 1000));
            const bleibt = s.filter((z) => z.bleibt).length;
            const ab = s.filter((z) => z.ab).length;
            const hoch = (k) => s.reduce((m, z) => (z[k] > m.v ? { v: z[k], id: z.id } : m), { v: 0, id: "–" });
            const u = hoch("u"),
                n = hoch("n");
            return {
                gruen: karte && zeit.length === 8 && bleibt === 8 && ab === 8,
                zahl:
                    (karte ? "" : "die Zeit ungeurteilt (kein Hardware-Adapter) · ") +
                    "p95 Griff → Bild unter der Schranke in " + zeit.length + "/8 (Gesetz-Wert höchstens " + u.v + " ms " + u.id +
                    ", Neubau höchstens " + n.v + " ms " + n.id + ", Griffe mit Bild je Studio " + s.map((z) => z.mit || 0).join("/") + ") · Neuladen " + bleibt + "/8 · A/B " + ab + "/8",
            };
        },
        pfad: [
            "worlds/huelle/",
            "worlds/garage/",
            "worlds/schmiede/",
            "worlds/portale/",
            "worlds/klang/",
            "worlds/fachwerk/",
            "worlds/koerperstudio/",
            "worlds/tetrapoda/",
            "worlds/terrain/",
            "*-core.js",
            "scripts/diag-studio-huelle.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
            "save-server.js",
        ],
        quelle:
            "2 = p95 Griff → erstes Bild mit neuem Bau-Hash ≤ 200 ms (Zeilen mit `uniform: true` im Vertrag) bzw. ≤ 1 s (Neubau) " +
            "auf beiden Geräten, dazu A/B und Persistenz über das Neuladen in 8/8",
    },
    // ── studios.K3 ── das Thermometer: die Kosten-Leiste der Hülle zeichnet je Stufe das Werk ALLEIN in einem eigenen
    // Render-Abschnitt (worlds/huelle/huelle.js `zeichne`, renderer.info) und trägt neben der gezählten Zahl die gezeichnete;
    // der Gang (H7, Zwilling von studios.K2#1) druckt je Seite `Kosten [{stufe, leiste, deckel, gezeichnet}]`.
    {
        kriterium: "studios.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-studio-huelle.cjs", "--engine"],
        env: { ...SOFT, STUDIO_HUELLE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const je = {};
            for (const l of zeilen(lauf.stdout)) {
                const m = /^\s{2}(\S+)\s+\d+ Anfragen · .* · Kosten (\[.*\])\s*$/.exec(l);
                if (m && SEITEN[m[1]]) je[m[1]] = JSON.parse(m[2]);
            }
            // die Mesh-Studios: jede Seite außer klang (meshfrei, Studio-Vertrag §8); je Seite die größte Abweichung ihrer Stufen
            const mesh = Object.keys(SEITEN).filter((s) => s !== "klang");
            const abw = (k) => (k.leiste > 0 && k.gezeichnet > 0 ? Math.abs(k.leiste / k.gezeichnet - 1) : Infinity);
            const groesste = (s) => (je[s] && je[s].length ? Math.max(...je[s].map(abw)) : Infinity);
            const wahr = mesh.filter((s) => groesste(s) <= 0.05);
            const ohne = mesh.filter((s) => !wahr.includes(s));
            if (!Object.keys(je).length) return { gruen: false, zahl: "keine Kosten-Zeile des Gangs (Exit " + lauf.exit + ")" };
            const stufen = wahr.reduce((n, s) => n + je[s].length, 0);
            return {
                gruen: wahr.length >= 4,
                zahl:
                    "Dreiecke ±5 % gegen renderer.info in " + wahr.length + "/" + mesh.length + " Mesh-Studios (" + stufen +
                    " Stufen, größte Abweichung " + (Math.max(0, ...wahr.map(groesste)) * 100).toFixed(1) + " %)" +
                    (ohne.length ? ", ohne " + ohne.map((s) => s + (je[s] ? " " + (groesste(s) * 100).toFixed(1) + " %" : " (keine Zeile)")).join(", ") : ""),
            };
        },
        pfad: [
            "worlds/huelle/",
            "worlds/garage/",
            "worlds/schmiede/",
            "worlds/portale/",
            "worlds/fachwerk/",
            "worlds/koerperstudio/",
            "worlds/tetrapoda/",
            "worlds/terrain/",
            "*-core.js",
            "scripts/diag-studio-huelle.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Dreiecke ±5 % gegen renderer.info in ≥ 4/7 Mesh-Studios",
    },
    // ── studios.K3#2 ── das Thermometer ganz (w3u-leiste): dieselbe Kosten-Zeile des Gangs trägt je Stufe die gezählten Befehle und
    // das VRAM (r184 weitet 8/16-Bit-Felder samt Index auf 32 Bit) mit ihren Gegenzahlen — Befehle aus renderer.info, VRAM aus der
    // Speicher-Karte des Renderers je Werk-Puffer (r184 info.memoryMap, r128 am GL-Kontext) —, die GPU-ms der Zeitstempel des
    // Abschnitts und auf der Karte die Bank-Runde von gpu-bank (`?bank=12`, die EINE Bank der Hülle); beim Klang je Ort des
    // Umwelt-Gesetzes die Audio-Graph-ms (offline, je Quantum). GPU-ms haben eine Gegenzahl nur gegen eine GPU-gebundene Bank
    // (gpu-bank: über × 1,15) — der Zähl-Abschnitt (1×1, viele Befehle) kann CPU-gebunden sein, dann steht die Stufe ohne.
    // IN DER SITZUNG (29.10., `probeStudios`, Zwilling von studios.K2#2): derselbe Gang im Browser der Sitzung, die Kosten-Zeile je Studio.
    {
        kriterium: "studios.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { ...STUDIO_PROBE, mutiert: true,  sek: 25 },
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const je = {};
            for (const l of zeilen(lauf.stdout)) {
                const m = /^\s{2}(\S+)\s+\d+ Anfragen · .* · Kosten (\[.*\])\s*$/.exec(l);
                if (m && SEITEN[m[1]]) je[m[1]] = JSON.parse(m[2]);
            }
            if (!Object.keys(je).length) return { gruen: false, zahl: "keine Kosten-Zeile des Gangs (Exit " + lauf.exit + ")" };
            const ab = (a, b) => Math.abs(a / b - 1) <= 0.05;
            // je Stufe der erste Täter (null: wahr) — Dreiecke, Befehle, VRAM gegen ihre Gegenzahl, GPU-ms gegen die Bank
            const taeter = (k) =>
                !ab(k.leiste, k.gezeichnet) ? "△ " + k.leiste + "↔" + k.gezeichnet
                : !ab(k.befehle, k.befehleGezeichnet) ? "Befehle " + k.befehle + "↔" + k.befehleGezeichnet
                : !ab(k.vram, k.vramGpu) ? "VRAM " + k.vram + "↔" + k.vramGpu
                : !(+k.bank > 1.15 * k.bankCpu) ? "Bank " + k.bank + " ms nicht GPU-gebunden (CPU " + k.bankCpu + ")"
                : !ab(k.ms, k.bank) ? "GPU " + (k.ms || k.zeitFehlt) + " ms↔Bank " + k.bank
                : null;
            const mesh = Object.keys(SEITEN).filter((s) => s !== "klang");
            const ohne = [];
            let stufen = 0;
            for (const s of mesh) {
                const t = (je[s] || []).map((k) => taeter(k) && "L" + k.stufe + " " + taeter(k)).filter(Boolean);
                if (!(je[s] || []).length) ohne.push(s + " (keine Zeile)");
                else if (t.length) ohne.push(s + " " + t[0] + (t.length > 1 ? " (+" + (t.length - 1) + ")" : ""));
                else stufen += je[s].length;
            }
            const orte = je.klang || [];
            const imQuantum = orte.filter((k) => +k.audio <= +k.audioDeckel);
            const klang = orte.length > 0 && imQuantum.length === orte.length;
            return {
                gruen: !ohne.length && klang,
                zahl:
                    "Dreiecke, Befehle, VRAM und GPU-ms ±5 % in " + (mesh.length - ohne.length) + "/" + mesh.length + " Mesh-Studios (" +
                    stufen + " Stufen), Klang " + imQuantum.length + "/" + orte.length + " Orte im Quantum" +
                    (imQuantum.length ? " (Audio-Graph höchstens " + Math.max(...imQuantum.map((k) => +k.audio)).toFixed(3) + " ms)" : "") +
                    (ohne.length ? ", ohne " + ohne.join(", ") : ""),
            };
        },
        pfad: [
            "worlds/huelle/",
            "worlds/garage/",
            "worlds/schmiede/",
            "worlds/portale/",
            "worlds/klang/",
            "worlds/fachwerk/",
            "worlds/koerperstudio/",
            "worlds/tetrapoda/",
            "worlds/terrain/",
            "*-core.js",
            "spec/profiband/haushalt.json",
            "scripts/diag-studio-huelle.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
            "save-server.js",
        ],
        quelle: "2 = Dreiecke, Befehle, VRAM und GPU-ms ±5 % in 7/7, beim Klang die Audio-Graph-ms",
    },

    // ───────────────────────────── Pipeline ─────────────────────────────
    {
        kriterium: "pipeline.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-studio-uebergabe.cjs", "--welt"],
        env: { ...SOFT, STUDIO_UEBERGABE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const u = uebergabeLesen(lauf);
            if (!u) return { gruen: false, zahl: "kein (K)-Kanal: die Linse kennt den EINEN Übergabe-Kanal nicht (Exit " + lauf.exit + ")" };
            return { gruen: u.wand && u.welt && u.seiten.length >= 4, zahl: u.zahl };
        },
        pfad: UEBERGABE_PFAD,
        quelle: "1 = ≥ 4/8 Studio-Seiten, deren Werk mit gleichem Bau-Hash in der Welt steht",
    },
    {
        kriterium: "pipeline.K1",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-studio-uebergabe.cjs", "--welt"],
        env: { ...SOFT, STUDIO_UEBERGABE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const u = uebergabeLesen(lauf);
            if (!u) return { gruen: false, zahl: "kein (K)-Kanal: die Linse kennt den EINEN Übergabe-Kanal nicht (Exit " + lauf.exit + ")" };
            const alle = Object.keys(u.art).length > 0 && Object.values(u.art).every(Boolean);
            return { gruen: lauf.exit === 0 && u.wand && u.welt && alle && u.seiten.length === 8, zahl: u.zahl };
        },
        pfad: UEBERGABE_PFAD,
        quelle: "2 = 8/8, mit zufälligem ov je Lauf und jeder Zeile von PARAMS_BY_KIND",
    },
    {
        kriterium: "pipeline.K3",
        staffel: 1,
        geraet: "headless",
        // die Stufen-Probe über die echte Foundry-Brücke (Dreiecke rechnet der Worker in JS, geräteunabhängig, R3). Der
        // Wertebereich ist kein Messwert der Linse: eine Verengung im Kern fällt am Diff (Vertrags-Akt, Lehre 11), R6 über die
        // Kerne erzwingt die Neumessung.
        befehl: REGLER_BEFEHL,
        env: { ...SOFT, REGLER_WIRKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const r = reglerLesen(lauf);
            if (r.teile.length !== 3) return { gruen: false, zahl: r.teile.length + " von 3 Teilen mit STUFEN-Zeile (Exits " + r.exits.join("/") + ")" };
            const gruen = r.exits.every((e) => e === 0 || e === 1) && r.leer === 0 && r.ueber <= 3;
            return { gruen, zahl: "über Budget " + r.ueber + " (Staffel 1 ≤ 3) in " + r.bauten + " Bauten, leer " + r.leer + ", Exits " + r.exits.join("/") };
        },
        pfad: REGLER_PFAD,
        quelle: "1 = reglerBudget ≤ 3 ohne geschrumpften Wertebereich",
    },
    {
        kriterium: "pipeline.K3",
        staffel: 2,
        geraet: "headless",
        befehl: REGLER_BEFEHL,
        env: { ...SOFT, REGLER_WIRKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const r = reglerLesen(lauf);
            if (r.teile.length !== 3) return { gruen: false, zahl: r.teile.length + " von 3 Teilen mit STUFEN-Zeile (Exits " + r.exits.join("/") + ")" };
            if (!r.ratsche) return { gruen: false, zahl: "keine RATSCHE-Zeile (spec/vertraege/ratsche.json reglerBudget)" };
            // exakt: jede Quote über L1 0,5 / L2 0,15 steht beim Namen in reglerBudget.quote oder ist NEU ÜBER DER QUOTE (Exit 1)
            const benannt = Object.keys(r.ratsche.quote || {});
            const ueberQ = Object.entries(r.quote).filter(([k, q]) => q > (/:L1$/.test(k) ? 0.5 : 0.15));
            const gruen =
                r.exits.every((e) => e === 0 || e === 1) && r.leer === 0 && r.ueber === 0 && r.neuQuote === 0 &&
                benannt.length === 0 && ueberQ.length === 0;
            const max = (s) => Math.max(0, ...Object.entries(r.quote).filter(([k]) => k.endsWith(s)).map(([, q]) => q));
            return {
                gruen,
                zahl:
                    "über Budget " + r.ueber + ", Quote max L1/L0 " + max(":L1").toFixed(2) + " · L2/L0 " + max(":L2").toFixed(2) +
                    (benannt.length ? ", in der Ratsche " + benannt.join(" ") : "") + (r.neuQuote ? ", neu über der Quote " + r.neuQuote : "") +
                    (ueberQ.length ? ", über " + ueberQ.map(([k, q]) => k + " " + q).join(" ") : ""),
            };
        },
        pfad: REGLER_PFAD,
        quelle: "2 = 0, und je Art L1/L0 ≤ 0,5, L2/L0 ≤ 0,15 Dreiecke",
    },
    // die Liefer-Marke des Spiels (`_foundryLiefer` am EINEN Weg jedes Körpers: der Auftrag `_foundryAuftrag`, die Antwort
    // `_foundryAntwort` — von der Platte, im Werk gebaut (die Schale `_foundrySchale` stempelt `bau` an jeden Studio-Lauf), leer —
    // und der Guss des Haupt-Fadens `_ofenBudget`): der Erst-Boot füllt ein frisches Profil bis zur Ruhe der Foundry, der Zweit-Boot
    // zählt jede Lieferung bis zur Ruhe. Bau-Ereignisse in Worker UND Haupt-Faden zählen gegen die Platte, ein Auftrag ohne Antwort
    // ist verschluckt (ROT); den gepflanzten Bruch fährt gate:boot-stage. IN DER SITZUNG (29.10., stationen/sitzung-seite.js
    // `probeAnkunft`, Zwilling von ankunft.K2#1/K3#1 und pipeline.K4#2): der Erst-Boot ist das kalte Laden mit leerer Herkunft bis zur
    // Ruhe der Foundry, der Zweit-Boot die Seite neu im warmen Browser (der Stand gesichert) — bis 29.10. zwei eigene Browser mit
    // einem Profil (Radeon b3f9ae95 10,61 min, davon 4,4 am Schloss).
    {
        kriterium: "pipeline.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: ANKUNFT_KALT,
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const m =
                /^\s*(?:✅|❌) LIEFERUNG zweit: (\d+) von (\d+) von der Platte \([\d.]+ %\) · Werk (\d+) · Haupt-Faden (\d+) · leer (\d+) · verschluckt (-?\d+)$/m.exec(
                    String(lauf.stdout || "")
                );
            if (!m) return { gruen: false, zahl: "keine Liefer-Zeile am Zweit-Boot (Exit " + lauf.exit + ")" };
            const [p, n, werk, haupt, leer, weg] = m.slice(1).map(Number);
            return {
                gruen: n > 0 && weg === 0 && p / n >= 0.95,
                zahl:
                    p + " von " + n + " build-asset von der Platte (" + ((100 * p) / n).toFixed(1) + " %), Bau-Ereignisse Werk " + werk +
                    " · Haupt-Faden " + haupt + ", leer " + leer + ", verschluckt " + weg,
            };
        },
        pfad: [
            "stamm/studio-bruecke.js",
            "stamm/studio-gestalt.js",
            "stamm/koerper-leib.js",
            "foundry-bruecke.js",
            "cores.manifest.json",
            "scripts/diag-boot-stage.cjs",
            "scripts/lib/welt-boot.cjs",
            "stamm/speicher-*.js",
            "save-server.js",
        ],
        quelle: "1 = build-asset kommt beim Zweit-Boot zu ≥ 95 % von der Platte",
    },
    // die Art-Zeile und der Kern-Wechsel (Stufe 2, w3u-platte): der Erst-Boot füllt ein frisches Profil, der Zweit-Boot nimmt
    // Blatt-Atlas, Dorf-Export und Karten je ganz von der Platte (die Liefer-Marke `_foundryLiefer` je Art: Bau-Ereignisse im
    // Werk UND im Haupt-Faden — die Karte backt dort, ein Blatt-Atlas, den der Haupt-Faden malt, zählt neu), der dritte Boot
    // serviert fachwerk-core mit einem Kommentar mehr (sein Gesetz-SHA springt): nur die Leser von fachwerk bauen neu, jeder
    // fremde Neubau dessen, was die Platte trug, und jeder Leser, der noch von ihr kommt, ist ROT beim Namen (`wechselUrteil`
    // in diag-boot-stage, die Schale `_foundrySchale` stempelt jede Lieferung mit dem Gesetz-SHA der Kerne, die sie liest).
    // IN DER SITZUNG (29.10., `probeAnkunft`): der dritte Boot ist die Seite neu, während die Skripte von fachwerk auf der Platte des
    // Spiel-Baums einen Kommentar mehr tragen (der save-server liefert no-cache mit ETag, der Browser holt sie neu; sie kehren sofort
    // zurück) — bis 29.10. drei eigene Browser, der dritte an einem eigenen Server, der den Kern wandelte.
    {
        kriterium: "pipeline.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: ANKUNFT_KALT,
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const art = /^\s*(?:✅|❌) LIEFERUNG je Art: (.+)$/m.exec(out);
            const kw = /^\s*(?:✅|❌) KERN-WECHSEL fachwerk: (\d+) Leser neu · fremd (\d+)(.*) · alt (\d+)(.*)$/m.exec(out);
            if (!art || !kw) return { gruen: false, zahl: "keine Art-Zeile oder kein Kern-Wechsel (Exit " + lauf.exit + ")" };
            const je = {};
            for (const m of art[1].matchAll(/([\w-]+) (\d+)\/(\d+) (\d+) ms/g)) je[m[1]] = { platte: +m[2], n: +m[3] };
            const ganz = ["blatt-atlas", "dorf-export", "karte"].every((k) => je[k] && je[k].n > 0 && je[k].platte === je[k].n);
            const [leser, fremd, alt] = [+kw[1], +kw[2], +kw[4]];
            return {
                gruen: ganz && leser > 0 && fremd === 0 && alt === 0,
                zahl:
                    "Zweit-Boot von der Platte " + art[1] + " · Kern-Wechsel fachwerk: " + leser + " Leser neu, fremd " + fremd +
                    kw[3] + ", alt " + alt + kw[5],
            };
        },
        pfad: [
            "stamm/studio-bruecke.js",
            "stamm/stoff-instanz.js",
            "stamm/vegetation-baum.js",
            "stamm/siedlung-ort.js",
            "foundry-bruecke.js",
            "cores.manifest.json",
            "scripts/diag-boot-stage.cjs",
            "scripts/lib/welt-boot.cjs",
            "save-server.js",
        ],
        quelle: "2 = jede Lieferung (Blatt-Atlas, Dorf-Export, Karten) 100 %, ein geänderter Kern-SHA baut nur seine Art neu (0 fremde Neubauten), beide Geräte",
    },

    // ───────────── pipeline.K2 — EIN Karten-Bäcker (w8-ein-baecker): die Karte des Labors IST die Karte des Welt-Bäckers ─────────────
    // EINE Fahrt (karteBaecker) trägt beide Staffeln — gleicher Befehl, gleiche Umgebung: Zwillinge, die Maschine fährt sie einmal
    {
        kriterium: "pipeline.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + karteBaecker + ")(process.argv[1], process.argv[2]);", "{PORT}", "{AUS}"],
        env: SOFT,
        gpu: false,
        zeit: false,
        minuten: 12, // lokal 3,7 min (EINE Fahrt beider Staffeln), die Farm ~3,5× langsamer
        urteil: (j, lauf) => {
            j = j || jsonZeile(lauf.stdout, /^KARTEN \{/);
            if (!j || !j.welt || !j.labor) return { gruen: false, zahl: "keine KARTEN-Zeile (Exit " + lauf.exit + ")" + (j && j.fehler ? ": " + j.fehler : "") };
            // die erste Zelle des Labors (der erste Baum seines Walds) gegen dieselbe Zelle aus dem Bäcker der Welt
            const k = Object.keys(j.labor.karten || {})[0];
            const a = k && karteZellen(j).find((x) => x.art === k.split("|")[0]);
            const gleich = !!(a && a.gleich(k)) && !j.fehler;
            const w = (k && j.welt.karten[k]) || {}, l = (k && j.labor.karten[k]) || {};
            return {
                gruen: gleich,
                zahl: (gleich ? "byte-gleich: " : "zwei Bäcker: ") + "Labor " + (j.labor.baecker || "?") + " " + (k || "—") + " " + (l.b || 0) + " B sha " + String(l.sha || "—").slice(0, 10) +
                    " ⇄ Welt " + (j.welt.baecker || "?") + " " + (j.welt.format || "?") + " " + (w.b || 0) + " B sha " + String(w.sha || "—").slice(0, 10) + (j.fehler ? " · " + j.fehler : ""),
            };
        },
        proben: [
            { name: "dieselben Bytes aus dem EINEN Bäcker", stdout: "KARTEN {\"welt\":{\"baecker\":\"_karteWeltBacken (three r184)\",\"format\":\"bc 128×3584\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}},\"labor\":{\"baecker\":\"Labor-Fernstufe (three r128, 128×3584)\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}}}", gruen: true },
            { name: "zwei Bäcker, die dieselben Zahlen lesen (gleiche Maße, andere Bytes)", stdout: "KARTEN {\"welt\":{\"baecker\":\"_karteWeltBacken (three r184)\",\"format\":\"bc 128×3584\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}},\"labor\":{\"baecker\":\"Labor-Fernstufe (three r128, 128×3584)\",\"karten\":{\"eiche|1\":{\"sha\":\"aa99\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}}}", gruen: false },
            { name: "die Welt backt nie", stdout: "KARTEN {\"welt\":{\"baecker\":\"_karteWeltBacken (three r184)\",\"karten\":{},\"fehler\":\"die Welt backte keine Karte\"},\"labor\":{\"baecker\":\"Labor-Fernstufe (three r128, 128×3584)\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}},\"fehler\":\"die Welt backte keine Karte\"}", gruen: false },
        ],
        pfad: ["foundry-bruecke.js", "foundry-core.js", "phyto-core.js", "worlds/terrain/", "stamm/stoff-karte.js", "stamm/netz-portal.js", "stamm/dirigent-takt.js", "stamm/studio-*.js", "cores.manifest.json", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = die Karte eines Baums aus Studio und Welt byte-gleich (EIN Bäcker)",
    },
    {
        kriterium: "pipeline.K2",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "-e", "(" + karteBaecker + ")(process.argv[1], process.argv[2]);", "{PORT}", "{AUS}"],
        env: SOFT,
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => {
            j = j || jsonZeile(lauf.stdout, /^KARTEN \{/);
            if (!j || !j.welt || !j.labor) return { gruen: false, zahl: "keine KARTEN-Zeile (Exit " + lauf.exit + ")" + (j && j.fehler ? ": " + j.fehler : "") };
            // je Art mit Karte: jede Gestalt der Welt (das Buch) und jede Zelle des Labor-Walds byte-gleich aus EINER Bake-Rechnung
            const arten = karteZellen(j);
            const rot = arten.filter((a) => a.rot.length);
            return {
                gruen: arten.length > 0 && !rot.length && !j.fehler,
                zahl: (arten.length - rot.length) + "/" + arten.length + " Arten mit Karte byte-gleich (Welt " + (j.welt.baecker || "?") + " " + (j.welt.format || "?") + " ⇄ Labor " +
                    (j.labor.baecker || "?") + "): " + arten.map((a) => a.art + " ×" + a.n + " " + a.sha.slice(0, 8) + " " + MB(a.b)).join(" · ") +
                    (rot.length ? " · ROT " + rot.map((a) => a.art + " [" + a.rot.join("; ") + "]").join(" · ") : "") + (j.fehler ? " · " + j.fehler : ""),
            };
        },
        proben: [
            { name: "EIN Bäcker: jede Art byte-gleich", stdout: "KARTEN {\"welt\":{\"baecker\":\"_karteWeltBacken (three r184)\",\"format\":\"bc 128×3584\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}},\"labor\":{\"baecker\":\"Labor-Fernstufe (three r128, 128×3584)\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}}}", gruen: true },
            { name: "ein zweiter Bäcker mit anderer Auflösung (r128, 128×256 je Ansicht)", stdout: "KARTEN {\"welt\":{\"baecker\":\"_karteWeltBacken (three r184)\",\"format\":\"bc 128×3584\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}},\"labor\":{\"baecker\":\"bakeImpostorAtlas (three r128, 1280×2048)\",\"karten\":{\"eiche|1\":{\"sha\":\"caa01\",\"b\":1048576},\"eiche|2\":{\"sha\":\"caa02\",\"b\":1048576},\"fichte|1\":{\"sha\":\"cbb01\",\"b\":1048576}}}}", gruen: false },
            { name: "eine Art, die anders backt (die Fichte)", stdout: "KARTEN {\"welt\":{\"baecker\":\"_karteWeltBacken (three r184)\",\"format\":\"bc 128×3584\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}},\"labor\":{\"baecker\":\"Labor-Fernstufe (three r128, 128×3584)\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb99\",\"b\":3670016}}}}", gruen: false },
            { name: "eine Karten-Art der Welt fehlt im Labor-Wald", stdout: "KARTEN {\"welt\":{\"baecker\":\"_karteWeltBacken (three r184)\",\"format\":\"bc 128×3584\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}},\"labor\":{\"baecker\":\"Labor-Fernstufe (three r128, 128×3584)\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016}}}}", gruen: false },
            { name: "die Welt backt nie", stdout: "KARTEN {\"welt\":{\"baecker\":\"_karteWeltBacken (three r184)\",\"karten\":{},\"fehler\":\"die Welt backte keine Karte\"},\"labor\":{\"baecker\":\"Labor-Fernstufe (three r128, 128×3584)\",\"karten\":{\"eiche|1\":{\"sha\":\"aa01\",\"b\":3670016},\"eiche|2\":{\"sha\":\"aa02\",\"b\":3670016},\"fichte|1\":{\"sha\":\"bb01\",\"b\":3670016}}},\"fehler\":\"die Welt backte keine Karte\"}", gruen: false },
        ],
        pfad: ["foundry-bruecke.js", "foundry-core.js", "phyto-core.js", "worlds/terrain/", "stamm/stoff-karte.js", "stamm/netz-portal.js", "stamm/dirigent-takt.js", "stamm/studio-*.js", "cores.manifest.json", "scripts/lib/welt-boot.cjs"],
        quelle: "2 = jede Art mit Karte, aus derselben Bake-Rechnung wie L0",
    },
    // ───────────── pipeline.K5 — EIN Bauer auf der Engine der Welt (p3-stationen-g456): Netz- und Parse-Log der Foundry-Fäden ─────────────
    {
        kriterium: "pipeline.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "-e", "(" + foundryFadenLog + ")(process.argv[1], process.argv[2]);", "{PORT}", "{AUS}"],
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            j = j || jsonZeile(lauf.stdout, /^FAEDEN \{/);
            if (!j || !Array.isArray(j.faeden)) return { gruen: false, zahl: "keine FAEDEN-Zeile (Exit " + lauf.exit + ")" + (j && j.fehler ? ": " + j.fehler : "") };
            const f = j.faeden.filter((x) => x.foundry);
            if (!f.length) return { gruen: false, zahl: "kein Foundry-Faden gesehen (" + j.faeden.map((x) => x.name).join(", ") + ")" };
            const blind = f.filter((x) => !x.instrumentiert);
            const bytes = f.reduce((s, x) => s + x.threeBytes, 0);
            const urls = [...new Set(f.flatMap((x) => x.threeUrls))];
            const sync = f.flatMap((x) => x.sync);
            const fremd = f.filter((x) => x.revision != null && String(x.revision) !== String(j.weltRevision));
            return {
                gruen: !blind.length && bytes === 0 && !urls.length && !sync.length && !fremd.length,
                zahl:
                    f.length + " Foundry-Fäden (" + f.map((x) => x.name).join(", ") + "): worlds/*/lib/three* " + bytes + " B über das Netz, geparst " +
                    (urls.join(" · ") || "nichts") + " · synchrones XHR " + sync.length + (sync.length ? " (" + [...new Set(sync)].join(" · ").slice(0, 120) + ")" : "") +
                    " · THREE im Faden " + (f.map((x) => (x.revision == null ? "—" : "r" + x.revision)).join("/")) + " gegen die Welt r" + j.weltRevision +
                    (blind.length ? " · BLIND (der Faden lief vor der Instrumentierung): " + blind.map((x) => x.name).join(", ") : ""),
            };
        },
        proben: [
            { name: "die Fäden auf der Engine der Welt", stdout: 'FAEDEN {"weltRevision":"184","faeden":[{"name":"buch","foundry":true,"instrumentiert":true,"threeBytes":0,"threeUrls":[],"sync":[],"revision":"184"}]}', gruen: true },
            { name: "r128 über das Netz und das Manifest synchron", stdout: 'FAEDEN {"weltRevision":"184","faeden":[{"name":"buch","foundry":true,"instrumentiert":true,"threeBytes":603312,"threeUrls":["worlds/terrain/lib/three-r128.min.js"],"sync":["cores.manifest.json"],"revision":"128"}]}', gruen: false },
            { name: "eine Kopie inline (0 Bytes auf worlds/*/lib/three*, aber THREE r128 im Faden)", stdout: 'FAEDEN {"weltRevision":"184","faeden":[{"name":"buch","foundry":true,"instrumentiert":true,"threeBytes":0,"threeUrls":[],"sync":[],"revision":"128"}]}', gruen: false },
            { name: "der Faden lief vor der Instrumentierung", stdout: 'FAEDEN {"weltRevision":"184","faeden":[{"name":"buch","foundry":true,"instrumentiert":false,"threeBytes":0,"threeUrls":[],"sync":[],"revision":null}]}', gruen: false },
        ],
        pfad: ["stamm/studio-bruecke.js", "foundry-bruecke.js", "cores.manifest.json", "worlds/terrain/lib/", "index.html", "scripts/lib/welt-boot.cjs"],
        quelle: "1 = Netz- und Parse-Log des Foundry-Workers zeigt 0 Bytes auf worlds/*/lib/three* UND kein synchrones XHR",
    },

    // ───────────────────────────── KI ─────────────────────────────
    {
        kriterium: "ki.K1",
        staffel: 1,
        geraet: "headless",
        // die Station WORT (diag-v1-pfad --korpus) spielt den Mitschnitt des echten Laufs (spec/profiband/ratsche-ki-korpus.json:
        // Modell, Anbieter-Host, Datum) Satz → Programm in der echten Welt ab; die Prädikate lesen state. „gehalten" = die Ratsche
        // hält (✅ WORT); die Negativ-Sätze nennt der Korpus selbst (still).
        befehl: [
            "bash",
            "-c",
            "node scripts/diag-v1-pfad.cjs --korpus; e=$?; node -e \"const k=require('./spec/abnahme/ki-korpus.json'); " +
                "const r=require('./spec/profiband/ratsche-ki-korpus.json'); " +
                "console.log('NEGATIV ' + JSON.stringify(Object.keys(k.saetze).filter((s) => k.saetze[s].still))); " +
                "console.log('MITSCHNITT ' + JSON.stringify({ modell: r.modell, anbieter: r.anbieter, datum: r.datum }))\"; exit $e",
        ],
        env: { ...SOFT, V1_PFAD_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            let neg = null, mit = null;
            try {
                neg = JSON.parse((/^NEGATIV (.*)$/m.exec(out) || [])[1]);
                mit = JSON.parse((/^MITSCHNITT (.*)$/m.exec(out) || [])[1]);
            } catch (_e) {
                return { gruen: false, zahl: "Korpus oder Mitschnitt unlesbar" };
            }
            const s = [];
            for (const l of zeilen(out)) {
                const m = /^\s*(✓|✗)( ungültig)?( BRUCH)? „(.+?)“/.exec(l);
                if (m) s.push({ ok: m[1] === "✓", bruch: !!m[3], satz: m[4], negativ: neg.includes(m[4]) });
            }
            const pos = s.filter((x) => !x.negativ);
            const erf = pos.filter((x) => x.ok).length;
            const negOk = s.filter((x) => x.negativ && x.ok).length;
            const brueche = s.filter((x) => x.bruch).length;
            const gehalten = /✅ WORT der Korpus/.test(out);
            const echt = !!(mit && mit.anbieter && mit.modell);
            return {
                gruen: gehalten && echt && erf >= 10,
                zahl:
                    erf + " von " + pos.length + " Positiv-Sätzen mit Welt-Prädikat, Negativ " + negOk + "/" + neg.length +
                    " ohne Tat, Brüche " + brueche + (gehalten ? ", Ratsche hält" : ", Ratsche ROT") +
                    " (Mitschnitt " + (mit && mit.modell) + " @ " + (mit && mit.anbieter) + " " + (mit && mit.datum) + ")",
            };
        },
        pfad: [
            "spec/abnahme/ki-korpus.json",
            "spec/profiband/ratsche-ki-korpus.json",
            "stamm/feld-*.js",
            "stamm/werkstatt-vorschau.js",
            "stamm/studio-*.js",
            "stamm/bild-himmel.js",
            "stamm/dirigent-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/daten.js",
            "*-core.js",
            "foundry-bruecke.js",
            "index.html",
            "scripts/diag-v1-pfad.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Grundstufe ohne Schlüssel: ≥ 10 Positiv-Sätze mit Welt-Prädikat gemessen und gehalten",
    },
    {
        kriterium: "ki.K1",
        staffel: 2,
        geraet: "headless",
        // derselbe Korpus über denselben Chat-Pfad, aber gegen das ECHTE Modell (`--echt`, KI_ENDPUNKT = ollama auf dem Laptop,
        // 127.0.0.1:11434): läuft der Anbieter nicht, startet ihn die Station und beendet ihn danach; die Zeile ANBIETER beweist,
        // dass der Host das Modell trägt (kein Stub, kein Mitschnitt). Geurteilt wird das Soll der Staffel aus den Satz-Zeilen:
        // gültig ≥ 95 % und Absicht ≥ 85 % über alle Sätze, 0 Brüche, jeder Negativ-Satz ohne Tat und mit Antwort (✓). Die übrigen
        // Täter des Werkzeugs (Prädikat nie geprüft, CSP-Türen, Satz-Zahl) sind ROT; das p95 Satz → Welt (Soll des Werkzeugs 6 s)
        // steht nicht in der Staffel und wird nur genannt. Das Prädikat liest state (Null-Renderer, R3: Mechanik) — das Bild-Prädikat
        // der Messung trägt die Station nicht (es fiel als blind, 10–17 % Ruhe-Rauschen ohne Tat).
        befehl: KI_KORPUS_ECHT,
        env: OLLAMA_ENV,
        gpu: false,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            let neg = null, anb = null;
            try {
                neg = JSON.parse((/^NEGATIV (.*)$/m.exec(out) || [])[1]);
                anb = JSON.parse((/^ANBIETER \S+ (.*)$/m.exec(out) || [])[1]);
            } catch (_e) {
                return { gruen: false, zahl: "Korpus oder Anbieter-Zeile unlesbar (Exit " + lauf.exit + ")" };
            }
            const n = +((/^KORPUS (\d+)$/m.exec(out) || [])[1] || 0);
            if (!anb || anb.traegt !== true)
                return { gruen: false, zahl: "kein echter Anbieter: 127.0.0.1:11434 trägt qwen3:4b-instruct nicht (" + JSON.stringify(anb) + ")" };
            const s = [];
            for (const l of zeilen(out)) {
                const m = /^\s*(✓|✗)( ungültig)?( BRUCH)? „(.+?)“/.exec(l);
                if (m) s.push({ ok: m[1] === "✓", gueltig: !m[2], bruch: !!m[3], satz: m[4], negativ: neg.includes(m[4]) });
            }
            const wort = /^\s*(✅|❌) WORT der Korpus über den echten Chat-Pfad \((echter Anbieter|Mitschnitt)\).*?(?: — Täter: (.*))?$/m.exec(out);
            if (!wort || wort[2] !== "echter Anbieter")
                return { gruen: false, zahl: "keine WORT-Zeile des echten Anbieters (" + s.length + " Satz-Zeilen, Exit " + lauf.exit + ")" };
            const taeter = (wort[3] || "").split(" · ").filter((t) => t && !/^p95 Satz → Welt/.test(t) && !/^(gueltig|absicht) /.test(t));
            const p95 = (/· p95 (\S+) ms/.exec(out) || [])[1] || "?";
            const q = (f) => s.filter(f).length / Math.max(1, s.length);
            const gueltig = q((x) => x.gueltig), absicht = q((x) => x.ok);
            const brueche = s.filter((x) => x.bruch).length;
            const negS = s.filter((x) => x.negativ), negOk = negS.filter((x) => x.ok).length;
            const pz = (x) => (100 * x).toFixed(1) + " %";
            return {
                gruen:
                    n > 0 && s.length === n && negS.length === neg.length && gueltig >= 0.95 && absicht >= 0.85 && brueche === 0 &&
                    negOk === neg.length && !taeter.length,
                zahl:
                    s.length + "/" + n + " Sätze gegen qwen3:4b-instruct @ 127.0.0.1:11434: gültig " + pz(gueltig) + " (Soll 95), Absicht " +
                    pz(absicht) + " (Soll 85), Brüche " + brueche + ", Negativ " + negOk + "/" + neg.length + " ohne Tat benannt, p95 " + p95 +
                    " ms (genannt)" + (taeter.length ? ", Täter " + taeter.join(" · ").slice(0, 160) : ""),
            };
        },
        pfad: KI_KORPUS_PFAD,
        quelle: "2 = das Soll mit Modell (gültig ≥ 95 %, Absicht ≥ 85 %, 0 Brüche, Negativ-Sätze scheitern benannt)",
    },
    // ki.K5 — die KI hält den Takt (p3-stationen-g456): Zwilling von ki.K1#2 (derselbe Korpus gegen qwen3:4b-instruct @ 127.0.0.1:11434,
    // die Zeile ANBIETER beweist den Host mit dem Modell — kein Stub, kein Mitschnitt). Je Satz-Zeile „N ms → Welt M ms“: M ist Satz →
    // erste Wirkung in der Welt (das Prädikat des Korpus liest state am Null-Renderer — die Wirkung, nie die Antwort). p95 über JEDEN
    // Satz des Korpus (ein Satz ohne Wirkung zählt als ∞: kürzen durch Weglassen fällt), Soll lokal ≤ 6 s; der Korpus muss ganz laufen
    // (das Schlupfloch „Vokabular fallen lassen“: s = n). Staffel 2 (Prompt-Tokens, Hänger, $ je Satz, beide Geräte) fehlt unten.
    {
        kriterium: "ki.K5",
        staffel: 1,
        geraet: "headless",
        befehl: KI_KORPUS_ECHT,
        env: OLLAMA_ENV,
        gpu: false,
        zeit: true,
        minuten: 15,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const anb = anbieterVon(out);
            if (!anb || anb.traegt !== true) return KEIN_ANBIETER(anb);
            const n = +((/^KORPUS (\d+)$/m.exec(out) || [])[1] || 0);
            const neg = (() => {
                try {
                    return JSON.parse((/^NEGATIV (.*)$/m.exec(out) || [])[1]);
                } catch (_e) {
                    return null;
                }
            })();
            if (!neg) return { gruen: false, zahl: "keine NEGATIV-Zeile (Exit " + lauf.exit + ")" };
            const s = [];
            for (const l of zeilen(out)) {
                const m = /^\s*(?:✓|✗)(?: ungültig)?(?: BRUCH)? „(.+?)“ (\d+) ms → Welt (—|\d+ ms)/.exec(l);
                if (m) s.push({ satz: m[1], antwort: +m[2], welt: m[3] === "—" ? Infinity : parseInt(m[3], 10), negativ: neg.includes(m[1]) });
            }
            const pos = s.filter((x) => !x.negativ).map((x) => x.welt).sort((a, b) => a - b);
            const p95 = pos.length ? pos[Math.ceil(0.95 * pos.length) - 1] : Infinity;
            const wort = /^\s*(✅|❌) WORT der Korpus über den echten Chat-Pfad \(echter Anbieter\)/m.test(out);
            const ms = (x) => (Number.isFinite(x) ? (x / 1000).toFixed(2) + " s" : "∞");
            return {
                gruen: wort && n > 0 && s.length === n && pos.length > 0 && p95 <= 6000,
                zahl:
                    "p95 Satz → Welt " + ms(p95) + " über " + pos.length + " Positiv-Sätze (Soll lokal ≤ 6 s; ohne Wirkung " + pos.filter((x) => !Number.isFinite(x)).length +
                    ") · " + s.length + "/" + n + " Sätze gegen qwen3:4b-instruct @ 127.0.0.1:11434" + (wort ? "" : ", keine WORT-Zeile des echten Anbieters (Exit " + lauf.exit + ")"),
            };
        },
        proben: (() => {
            const kopf = 'ANBIETER 127.0.0.1:11434 {"traegt":true,"modelle":["qwen3:4b-instruct"]}\nNEGATIV ["sag nichts"]\nKORPUS 3\n';
            const wort = "  ✅ WORT der Korpus über den echten Chat-Pfad (echter Anbieter): das Soll — 3 Sätze";
            const satz = (t, w) => "  ✓ „" + t + "“ 900 ms → Welt " + w + " · {}";
            return [
                { name: "jede Wirkung ≤ 6 s", stdout: kopf + [satz("baue ein Haus", "2100 ms"), satz("mach es Nacht", "3900 ms"), "  ✓ „sag nichts“ 300 ms → Welt — · {}", wort].join("\n"), gruen: true },
                { name: "ein Satz ohne Wirkung (p95 ∞)", stdout: kopf + [satz("baue ein Haus", "2100 ms"), satz("mach es Nacht", "—"), "  ✓ „sag nichts“ 300 ms → Welt — · {}", wort].join("\n"), gruen: false },
                { name: "der Korpus gekürzt (2 von 3)", stdout: kopf + [satz("baue ein Haus", "2100 ms"), "  ✓ „sag nichts“ 300 ms → Welt — · {}", wort].join("\n"), gruen: false },
                { name: "der Stub (kein Anbieter mit Modell)", stdout: 'ANBIETER 127.0.0.1:11434 {}\n' + satz("baue ein Haus", "100 ms"), gruen: false },
            ];
        })(),
        pfad: KI_KORPUS_PFAD,
        quelle: "1 = p95 Satz → erstes sichtbares Ergebnis gemessen mit Anbieter-Host im Netz-Log, an einem Gerät, im Soll (Haiku-Klasse ≤ 3 s, lokal ≤ 6 s)",
    },
    {
        kriterium: "ki.K2",
        staffel: 1,
        geraet: "headless",
        // gate:praegung-welt (K) KI-REGLER (ki-regler 804954ab, ki-k2-regler): je Zeile von PARAMS_BY_KIND spawn_studio mit ov im
        // fünften Argument durch den EINEN Stempel; ERREICHT verlangt Welt-Werk ≠ ohne ov und = Studio-Werk (der Bau-Hash folgt).
        befehl: ["node", "scripts/diag-praegung-welt.cjs"],
        env: { ...SOFT, PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const e = /^\s*(✅|❌) ERREICHT: (\d+) von (\d+) Zeilen von PARAMS_BY_KIND \(([\d.]+) %\) erreicht(?: — (.*))?$/m.exec(out);
            if (!e) return { gruen: false, zahl: "keine ERREICHT-Zeile: spawn_studio trägt kein ov (Exit " + lauf.exit + ")" };
            const klemme = /✅ KLEMME:/.test(out);
            const zu = /✅ FAIL-CLOSED:/.test(out);
            const selbst = /✅ SELBST-TEST: ein ov, das nicht ankommt/.test(out);
            const n = +e[2], m = +e[3];
            return {
                gruen: e[1] === "✅" && m > 0 && n / m >= 0.5 && klemme && zu && selbst,
                zahl:
                    n + " von " + m + " Zeilen (" + e[4] + " %) aus einem KI-Programm, Bau-Hash folgt" + (e[1] === "✅" ? "" : " NICHT") +
                    (klemme ? "" : ", Klemme ROT") + (zu ? "" : ", fail-closed ROT") + (selbst ? "" : ", Selbsttest ROT"),
            };
        },
        pfad: KI_K2_PFAD,
        quelle: "1 = ≥ 50 % der Zeilen von PARAMS_BY_KIND sind aus einem KI-Programm erreichbar",
    },
    {
        kriterium: "ki.K2",
        staffel: 2,
        geraet: "headless",
        // gate:praegung-welt (K) mit ≥ 95 % (ki-k2-regler: je Zeile Bau samt Gesetzen, Wesen oder Prägung an ihrem Leser; der
        // Korpus-Teil sagbar) und der Korpus-Teil Regler-Wörter (spec/abnahme/ki-korpus.json `regler`) im Mitschnitt des echten
        // Laufs: diag-v1-pfad --korpus --regler spielt die Programme des Modells (spec/profiband/ratsche-ki-korpus-regler.json,
        // geschrieben von `--echt --aufnahme` gegen ollama qwen3:4b auf dem Laptop) durch den echten Chat-Pfad in die Welt, das
        // Prädikat liest den Stempel jedes neuen Werks. Ohne Mitschnitt eines echten Laufs ist die Staffel ROT beim Namen.
        befehl: [
            "bash",
            "-c",
            "node scripts/diag-praegung-welt.cjs; node scripts/diag-v1-pfad.cjs --korpus --regler; e=$?; node -e \"let r = {}; " +
                "try { r = require('./spec/profiband/ratsche-ki-korpus-regler.json'); } catch (_e) {} " +
                "console.log('MITSCHNITT ' + JSON.stringify({ modell: r.modell, anbieter: r.anbieter, datum: r.datum }))\"; exit $e",
        ],
        env: { ...SOFT, PRAEGUNG_WELT_PORT: "{PORT}", V1_PFAD_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const e = /^\s*(✅|❌) ERREICHT: (\d+) von (\d+) Zeilen von PARAMS_BY_KIND \(([\d.]+) %\) erreicht/m.exec(out);
            if (!e) return { gruen: false, zahl: "keine ERREICHT-Zeile (Exit " + lauf.exit + ")" };
            let mit = null;
            try {
                mit = JSON.parse((/^MITSCHNITT (.*)$/m.exec(out) || [])[1]);
            } catch (_e) {
                mit = null;
            }
            const s = zeilen(out).map((l) => /^\s*(✓|✗)( ungültig)?( BRUCH)? „(.+?)“/.exec(l)).filter(Boolean);
            const erf = s.filter((x) => x[1] === "✓").length;
            const rot = ["KLEMME:", "FAIL-CLOSED:", "SELBST-TEST: ein ov, das nicht ankommt", "KORPUS-TEIL Regler-Wörter:", "WORT der Korpus"]
                .filter((w) => !out.includes("✅ " + w));
            const echt = !!(mit && mit.anbieter && mit.modell);
            const n = +e[2], m = +e[3];
            return {
                gruen: e[1] === "✅" && m > 0 && n / m >= 0.95 && !rot.length && echt && s.length >= 20 && erf / s.length >= 0.8,
                zahl:
                    n + " von " + m + " Zeilen (" + e[4] + " %), Korpus-Teil " + erf + " von " + s.length + " Sätzen mit Welt-Prädikat" +
                    (echt ? " (Mitschnitt " + mit.modell + " @ " + mit.anbieter + " " + mit.datum + ")" : ", kein Mitschnitt eines echten Laufs") +
                    (rot.length ? ", ROT: " + rot.join(" · ") : ""),
            };
        },
        pfad: [...KI_K2_PFAD, "spec/profiband/ratsche-ki-korpus*.json", "scripts/diag-v1-pfad.cjs", "scripts/lib/ausgabe-aufnahme.cjs"],
        quelle: "2 = ≥ 95 % und der Korpus-Teil Regler-Wörter („knorrig“, „schmal und hoch“) ≥ 80 % mit Modell",
    },
    {
        kriterium: "ki.K3",
        staffel: 1,
        geraet: "headless",
        // die Seele im Gespräch (ki-seele-regeln): der Teil seele des Korpus (spec/abnahme/ki-korpus.json, 12 Fragen) über den echten
        // Chat-Pfad gegen das lokale Modell — je Frage ein Wesen und seine Taten über die Wege des Spiels (der Schlag des Spielers
        // `damageCreature`, die Gabe `activateCreatureConsumable`, die Geste „folge mir", erinnert, wenn es beim Spieler ankommt),
        // dann die Frage im Chat an seinen Namen (`maybeAnswerCreature` → Persona-Prompt mit den letzten 8 Erinnerungen in den Worten
        // von ERINNERUNG_SATZ). Das Prädikat sucht in der Antwort den Bezug auf eine erlebte Tat und keinen auf eine fremde (das
        // Nachplappern aller Taten fällt). Soll ≥ 70 % der Antworten. Trocken am Kopf f1400431 gegen einen Stub-Anbieter auf
        // 11434 (Mechanik, kein Modell): 11 von 12 GRÜN, Mutante V1_MUTANTE=gedaechtnis-leer 0 von 12 ROT; vorher (main a03b7b06)
        // trug der Prompt „Deine Erinnerungen: ." — 0 von 12. Das Urteil mit qwen3:4b-instruct fällt am Laptop.
        befehl: [
            "bash",
            "-c",
            OLLAMA_AN +
                "node scripts/diag-v1-pfad.cjs --korpus --seele --echt; e=$?; " +
                "node -e \"console.log('KORPUS ' + Object.keys(require('./spec/abnahme/ki-korpus.json').seele.saetze).length)\"; " +
                OLLAMA_AUS,
        ],
        env: OLLAMA_ENV,
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const anb = anbieterVon(out);
            if (!anb || anb.traegt !== true) return KEIN_ANBIETER(anb);
            const n = +((/^KORPUS (\d+)$/m.exec(out) || [])[1] || 0);
            const s = zeilen(out).map((l) => /^\s*(✓|✗)( ungültig)?( BRUCH)? „(.+?)“ .*? · (.*)$/.exec(l)).filter(Boolean);
            const wort = /^\s*(✅|❌) WORT der Korpus über den echten Chat-Pfad \(echter Anbieter\).*? · seele · /m.exec(out);
            const erf = s.filter((x) => x[1] === "✓");
            return {
                gruen: !!wort && n > 0 && s.length === n && erf.length / n >= 0.7,
                zahl:
                    erf.length + " von " + s.length + "/" + n + " Antworten nennen eine erlebte Tat (Soll 70 %) gegen qwen3:4b-instruct @ " +
                    "127.0.0.1:11434" + (wort ? "" : ", keine WORT-Zeile des echten Anbieters (Exit " + lauf.exit + ")") +
                    (erf.length ? ", z. B. „" + erf[0][4] + "“ → " + erf[0][5].slice(0, 90) : ""),
            };
        },
        pfad: KI_KORPUS_PFAD,
        quelle: "1 = mit lokalem Modell nennen ≥ 70 % der Antworten aus dem Gesprächs-Korpus eine der letzten 8 Erinnerungen, an einem Gerät",
    },
    {
        kriterium: "ki.K4",
        staffel: 1,
        geraet: "headless",
        // die Regeln des Modells in der Wertung (ki-seele-regeln): der Teil regeln des Korpus (6 Sätze, die Regeln verlangen) über den
        // echten Chat-Pfad gegen das lokale Modell, verteilt über einen Selbstlauf von 600 s Welt-Zeit im Zeitraffer, in dem der Nexus
        // je 3 s eine Regel schreibt; gezählt je Drittel und Quelle (source llm gegen nexus): neu · erneuert · verfallen · verdrängt.
        // Der Gegenlauf mischt das δ (je Quelle im Wechsel +1 / −1 über die Baseline des Rewards, der Nexus schreibt je Sekunde, die
        // Kappe verdrängt). GRÜN, wenn die WORT-Zeile des echten Anbieters ohne Täter steht: je Drittel eine neue LLM-Regel, LLM- und
        // Nexus-Regeln gewertet und verdrängt, im Gegenlauf je Quelle die Heiler um ≥ 0,25 öfter erneuert als die Schädlinge
        // (regelVerdict). Trocken am Kopf f1400431 gegen einen Stub-Anbieter (Mechanik, kein Modell): LLM-Regeln 2/2/2 je Drittel,
        // Gegenlauf δ+ 0,75 · δ− 0,00 GRÜN; Mutante V1_MUTANTE=wertung-aus ROT (0,00 · 0,00). Das Urteil mit Modell fällt am Laptop.
        befehl: [
            "bash",
            "-c",
            OLLAMA_AN + "node scripts/diag-v1-pfad.cjs --korpus --regeln --echt; e=$?; " + OLLAMA_AUS,
        ],
        env: OLLAMA_ENV,
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const anb = anbieterVon(out);
            if (!anb || anb.traegt !== true) return KEIN_ANBIETER(anb);
            const wort = /^\s*(✅|❌) WORT der Korpus über den echten Chat-Pfad \(echter Anbieter\).*? · regeln · .*?(?: — Täter: (.*))?$/m.exec(out);
            let R = null;
            try {
                R = JSON.parse((/^REGELN (.*)$/m.exec(out) || [])[1]);
            } catch (_e) {
                R = null;
            }
            if (!wort || !R) return { gruen: false, zahl: "keine WORT- oder REGELN-Zeile des echten Anbieters (Exit " + lauf.exit + ")" };
            const sum = (k) => [...R.echt, ...R.gegen].reduce((a, d) => a + (d[k] || 0), 0);
            const fort = (q) => sum(q + "erneuert") + sum(q + "verfallen") + sum(q + "verdraengt");
            const heil = (v) => (sum("llm" + v + "erneuert") / Math.max(1, fort("llm" + v))).toFixed(2);
            return {
                gruen: wort[1] === "✅" && lauf.exit === 0,
                zahl:
                    "LLM-Regeln neu je Drittel " + R.echt.map((d) => d["llm neu"] || 0).join("/") + ", erneuert " + sum("llm erneuert") +
                    " · verfallen " + sum("llm verfallen") + " · verdrängt " + sum("llm verdraengt") + " (Nexus " + sum("nexus erneuert") + " · " +
                    sum("nexus verfallen") + " · " + sum("nexus verdraengt") + "); Gegenlauf: erneuert LLM δ+ " + heil("+ ") + " · δ− " +
                    heil("- ") + ", verdrängt " + (sum("llm+ verdraengt") + sum("llm- verdraengt")) + (wort[2] ? ", Täter " + wort[2].slice(0, 160) : ""),
            };
        },
        pfad: KI_KORPUS_PFAD,
        quelle: "1 = im Selbstlauf mit Modell registrierte LLM-Regeln (source llm) werden von derselben Fitness gewertet und verdrängt wie Nexus-Regeln, gegen den Gegenlauf mit gemischtem δ",
    },

    // ───────────────────────────── Bauen ─────────────────────────────
    {
        kriterium: "bauen.K1",
        staffel: 1,
        geraet: "headless",
        // L-WERKSTATT (bauen-k1 64e153f2/b0c842a9): Eiche, Haus, GT, eigene Hütte × Werkstatt, Rezeptbuch, Hotbar × schöpfer,
        // frieden mit Material, pfad × Ego, Third über page.keyboard/page.mouse, gezählt pointerdown/keydown/wheel mit isTrusted.
        befehl: WEG_BEFEHL,
        env: WEG_ENV,
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            if (!j || j.gestartet !== true || !j.wege) return { gruen: false, zahl: "keine Rohdatei weg.json (Exit " + lauf.exit + ")" };
            let n = 0, steht = 0;
            const jeWeg = {};
            for (const weg of WEG_WEGE) {
                const ein = [];
                let s = 0, z = 0;
                for (const lage of WEG_LAGEN)
                    for (const werk of WEG_WERKE)
                        for (const sicht of WEG_SICHTEN) {
                            const e = ((((j.wege[lage] || {})[weg] || {})[werk] || {})[sicht]) || null;
                            z++;
                            if (e && !e.fehler && e.steht === 1 && e.eingaben > 0 && !(e.unecht > 0)) {
                                s++;
                                ein.push(e.eingaben);
                            }
                        }
                n += z;
                steht += s;
                jeWeg[weg] = s + "/" + z + (ein.length ? " (Eingaben " + Math.min(...ein) + "–" + Math.max(...ein) + ")" : "");
            }
            return {
                gruen: n === 72 && steht === n,
                zahl: steht + "/" + n + " Werke stehen über echte Ereignisse · " + WEG_WEGE.map((w) => w + " " + jeWeg[w]).join(" · "),
            };
        },
        pfad: [
            "stamm/werkstatt-*.js",
            "stamm/koerper-seele.js",
            "stamm/siedlung-satz.js",
            "stamm/bau-*.js",
            "stamm/studio-*.js",
            "stamm/dirigent-kern.js",
            "stamm/daten.js",
            "index.html",
            "worlds/huelle/huelle.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "fachwerk-core.js",
            "vehicle-core.js",
            "phyto-core.js",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = jeder Weg (Werkstatt, Rezeptbuch, Hotbar) stellt das Werk über echte DOM-Ereignisse, gezählt am Ereignis-Strom",
    },
    // ── bauen.K1 Staffel 2 ── L-BILD (diag-werkstatt-weg in der Sitzung, bauen-k1-bild): je Weg (Werkstatt · Rezeptbuch · Hotbar) ein
    // frischer Browser auf der Karte (leeres Profil: Platte und Foundry kalt), die Welt steht unter der Bühne; je Lage mit Bau
    // (schöpfer · frieden mit Material · pfad) × Werk (Eiche · Haus · GT · Teil) × Sicht (Ego · Third) über echte Eingaben die Zeit
    // von der ersten Eingabe bis zum von der GPU abgearbeiteten Bild, in dem jede L0-Senke des Werks für die Kamera der Szene zog
    // (der Haken am Render des Takts, gezählt am Backend); der Bau-Hash des Bilds gleicht dem L0-Bau derselben Anfrage im Werk.
    // kalt = der erste Bau des Werks im frischen Profil (4 je Weg), warm = jeder weitere (20 je Weg); p95 je Weg und Klasse.
    // IN DER SITZUNG (29.10., `probeBildWeg`): die warme Welt der Sitzung, der erste Bau jedes Werks kalt (die Linse räumt seine
    // Körper aus der Foundry; bis w4-stationen-schnell die Seite neu), 8 Läufe (BILD_FAELLE: jedes Werk kalt und warm, jeder Weg mit
    // beiden Klassen, Lage und Sicht im Wechsel).
    {
        kriterium: "bauen.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        // DIE AUSNAHME (w12-proben-frist): acht Bau-Läufe über echte Eingaben, je Werk der erste kalt (die Linse räumt seine Körper aus der
        // Foundry, sie baut sie neu) — GTX e0139769 in der Eich-Fahrt 50,2 s für alle acht (ROT 0/8), Radeon 8ef49bef an der Frist 39 s im
        // ersten Lauf (werkstatt · schöpfer · Eiche · Ego kalt)
        probe: { ...BILD_PROBE, mutiert: true, sek: 10 },
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            if (!j || j.gestartet !== true || j.bild !== true || j.echt !== true || !j.wege)
                return { gruen: false, zahl: "keine Ausgabe des Bild-Wegs auf der Karte (Exit " + lauf.exit + ")" };
            const p95 = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.ceil(0.95 * a.length) - 1] : null);
            const rot = [];
            let n = 0, imBild = 0;
            const jeWeg = WEG_WEGE.map((weg) => {
                const jeKlasse = { kalt: [], warm: [] };
                for (const [w, lage, werk, sicht] of BILD_FAELLE)
                    if (w === weg) {
                            const e = ((((j.wege[lage] || {})[weg] || {})[werk] || {})[sicht]) || null;
                            n++;
                            const ms = e && Array.isArray(e.zeiten) ? e.zeiten[4] : null; // [eingabe, steht, l0, bild, gpu] ab der ersten Eingabe
                            // das Werk STEHT (genau eines, wie Staffel 1), über echte Eingaben, ≤ 3, im Bild mit dem L0-Bau
                            const ok = e && !e.fehler && e.steht === 1 && !(e.unecht > 0) && e.eingaben > 0 && e.eingaben <= 3 && Number.isFinite(ms) && e.bau && e.bau === e.soll;
                            if (!ok) {
                                rot.push(weg + " · " + lage + " · " + werk + " · " + sicht + (e && e.stufe ? " (Stufe " + e.stufe + ")" : ""));
                                continue;
                            }
                            imBild++;
                            jeKlasse[e.kalt ? "kalt" : "warm"].push(ms);
                        }
                const k = p95(jeKlasse.kalt), w = p95(jeKlasse.warm);
                if (!(k <= 1000) || !(w <= 1000)) rot.push(weg + " p95 kalt " + k + " · warm " + w + " ms");
                return weg + " kalt " + k + " · warm " + w + " ms (" + jeKlasse.kalt.length + "+" + jeKlasse.warm.length + ")";
            });
            return {
                gruen: n === BILD_FAELLE.length && imBild === n && !rot.length,
                zahl: imBild + "/" + n + " Werke in L0 im Bild (Bau-Hash = L0-Bau, ≤ 3 Eingaben) · p95 bis zum Bild " + jeWeg.join(" · ") +
                    (rot.length ? " · ROT: " + rot.slice(0, 6).join(" · ") + (rot.length > 6 ? " … (" + rot.length + ")" : "") : ""),
            };
        },
        pfad: [
            "stamm/werkstatt-*.js",
            "stamm/koerper-seele.js",
            "stamm/siedlung-*.js",
            "stamm/bau-*.js",
            "stamm/studio-*.js",
            "stamm/stoff-*.js",
            "stamm/bild-*.js",
            "stamm/dirigent-*.js",
            "stamm/daten.js",
            "index.html",
            "worlds/huelle/huelle.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "fachwerk-core.js",
            "vehicle-core.js",
            "phyto-core.js",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "save-server.js",
        ],
        proben: BILD_PROBEN,
        quelle: "2 = ≤ 3 Eingaben und p95 ≤ 1 s bis zum ersten Ausgabe-Bild in L0, kalt und warm, beide Geräte",
    },
    // ── bauen.K2 ── W9 SLOT (gate:haus-welt, Phase grund; w3t-grund): ein Haus in der Gestalt eines Dorf-Hauses (Rezept, Stempel,
    // Same und Gier des Dorf-Slots), gesetzt über die Werkstatt (Phantom, confirmBuild) auf dem ersten Ort mit Gefälle ≥ 15 % über
    // ±4 m — sein Erdbau (`haus:`) byte-gleich dem Plan v2 (fachwerk `ortPlan`) des Dorf-Slots aus dem Gedächtnis des Orts an
    // seinem Ort und Boden, Platte · Grund · Vorplatz, der Vorplatz ist Boden (Dichte ±0,3 m), über der Diele keine Erde. Der
    // Null-Renderer misst Plan und Dichte, nie das Bild (Lehre 16); Bild und Gang des Leibs zählen Staffel 2 und siedlung.K1.
    {
        kriterium: "bauen.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-haus-welt.cjs", "--phasen=grund"],
        env: { ...SOFT, HAUS_WELT_JSON: "{AUS}" },
        gpu: false,
        zeit: false,
        minuten: 8, // lokal 61–83 s (eine Welt, Phase grund), die Farm ~3,5× langsamer
        urteil: (j) => {
            const w9 = (j && j.w9) || {};
            const sl = w9.slot;
            if (!sl || !sl.typ) return { gruen: false, zahl: "kein gesetztes Haus am Hang (W9 Slot " + JSON.stringify(sl || null) + ")" };
            const h = (w9.haeuser || []).find((x) => x.id === "w9-slot");
            const k = (h && h.koerper) || [];
            const [dichte, proben] = ["dichte", "proben"].map((f) => k.reduce((a, b) => a + (b[f] || 0), 0));
            // der Plan v2 eines Ein-Slot-Orts mit Tür: Platte, Grund, Vorplatz — byte-gleich dem Dorf-Slot trägt er alle drei
            return {
                gruen:
                    sl.hang >= 0.15 && sl.byte === true && sl.boden === 1 && sl.splats === 3 && proben > 0 && dichte === 0,
                zahl:
                    `${sl.typ} am Hang ${Number(sl.hang).toFixed(3)} (Soll ≥ 0,15) · Erdbau ${sl.splats} Splats (Platte, Grund, ` +
                    `Vorplatz) · byte-gleich dem Dorf-Slot ` +
                    `${sl.byte} · Vorplatz-Boden ${sl.boden} (Erde 0,3 m unter, keine 0,3 m über der Platte) · Erde über der Diele ${dichte}/${proben}`,
            };
        },
        pfad: [
            "fachwerk-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "stamm/gelaende-*.js",
            "stamm/studio-bruecke.js",
            "stamm/siedlung-*.js",
            "stamm/werkstatt-bauen.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "1 = Erdbau und Vorplatz wie ein Dorf-Slot derselben Gestalt (Byte-Vergleich der ortPlan-Ausgabe), am Hang mit Gefälle ≥ 15 %",
    },
    // Staffel 2 ── W11 FREMD-SLOT (gate:haus-welt, Phase fremd; w3u-fremdslot): ein Haus mit Keller in der Gestalt eines Dorf-
    // Hauses, gesetzt über die Werkstatt (Phantom, confirmBuild) auf die Gasse des Drehbuch-Dorfs, 14 m von jedem Haus des Plans —
    // sein Erdbau (`haus:`) byte-gleich dem Ein-Slot-Plan des Dorf-Slots, und der Plan v2 des Orts (fachwerk `ortPlan`, ctx.fest)
    // legt Gasse und Feldweg um seine Platte: im Raster 5 × 5 des Grundrisses vorher Punkte auf einer Weg-Form der Wege-Karte des
    // Orts, nachher 0, der Plan nennt den Fremd-Slot (`fest`); der Gang des Leibs (W10, Sim-Schritt, W-Taste: Tür, Kopf der
    // Kellertreppe, Keller, zurück, beide Ränder des Laufs) erreicht den Keller ohne Hub > 0,3 m je Schritt. Der Null-Renderer
    // misst Plan, Formen, Dichte und Gang, nie das Bild (Lehre 16).
    {
        kriterium: "bauen.K2",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-haus-welt.cjs", "--phasen=fremd"],
        env: { ...SOFT, HAUS_WELT_JSON: "{AUS}" },
        gpu: false,
        zeit: false,
        minuten: 6, // lokal 18–37 s (eine Welt, Phase fremd)
        urteil: (j) => {
            const w = (j && j.w11) || {};
            const h = ((j && j.haeuser) || []).find((x) => x.fremd);
            const g = h && h.gang;
            if (!w.typ || !g) return { gruen: false, zahl: "kein Haus auf der Gasse (W11 " + JSON.stringify(w) + ")" };
            const keller = (g.fehlt || []).filter((x) => x.startsWith("keller"));
            return {
                gruen:
                    w.vorher > 0 && w.nachher === 0 && w.byte === true && w.fest >= 1 && g.keller && g.hub <= 0.3 && !keller.length,
                zahl:
                    `${w.typ} auf der Gasse: Grundriss-Punkte auf der Gasse ${w.vorher} → ${w.nachher} (von 25) · Erdbau ` +
                    `byte-gleich dem Ein-Slot-Plan ${w.byte} · Fremd-Slots im Plan ${w.fest} · Gang in den Keller ` +
                    `${g.keller && !keller.length ? "erreicht" : "verfehlt"}, Hub ${Number(g.hub).toFixed(2)} m je Schritt ` +
                    `(Soll ≤ 0,3)${keller.length ? " · " + keller.join(", ") : ""}`,
            };
        },
        pfad: [
            "fachwerk-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "stamm/gelaende-*.js",
            "stamm/studio-bruecke.js",
            "stamm/siedlung-*.js",
            "stamm/werkstatt-bauen.js",
            "stamm/koerper-bewegung.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "2 = im Ortsradius Slot des Plans mit umgelegter Gasse, Keller über die Treppe ohne Anti-Clip-Hub",
    },
    {
        kriterium: "bauen.K3",
        staffel: 1,
        geraet: "headless",
        // BRENNGLAS (diag-werkstatt-weg): die Linse wird als Form gebaut (Quarz-Kugel im Bronze-Ring, kein Tag), zündet zu Mittag
        // die Eiche darunter, nachts nie, außerhalb kühlt es; die Statik urteilt nur beim Fertigen (_workshopPhysicsVerdict).
        befehl: WEG_BEFEHL,
        env: WEG_ENV,
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const l = zeilen(lauf.stdout).find((x) => /^\s*(✅|❌) Brennglas die Eiche an der Genesis-Plattform/.test(x));
            if (!l) return { gruen: false, zahl: "keine Brennglas-Zeile (Exit " + lauf.exit + ")" };
            const d = l.split(" — ").slice(1).join(" — ");
            return { gruen: /^\s*✅/.test(l), zahl: "Wirkung aus der Form: " + (d.slice(0, 160) || "ohne Detail") };
        },
        pfad: [
            "stamm/koerper-fahrt.js",
            "stamm/bau-teile.js",
            "stamm/bild-himmel.js",
            "stamm/werkstatt-*.js",
            "stamm/koerper-seele.js",
            "stamm/kreatur-verhalten.js",
            "stamm/gelaende-kollision.js",
            "stamm/siedlung-ort.js",
            "stamm/koerper-bewegung.js",
            "stamm/dienst.js",
            "stamm/daten.js",
            "phyto-core.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = die Wirkung aus der Form ist gemessen, die Statik gilt nur in der Werkstatt",
    },
    {
        kriterium: "bauen.K3",
        staffel: 2,
        geraet: "headless",
        // DER PRÜF-SATZ (diag-werkstatt-weg, spec/pruefsatz/bauen-k3.json): zehn Konstruktionen über den Bau-Weg des Spielers
        // (Hotbar, Phantom, confirmBuild) — das Stabile steht nach 150 Takten, das Instabile stürzt sichtbar (die gezeichnete
        // Lage kippt ≥ 30° oder fällt ≥ 0,3 m), bricht und nennt den Grund (die EINE Statik beim Setzen, `_werkGesetzSetzen`);
        // Wirkung: Brennglas mittags und nachts, das Rad rollt den Hang hinab (der Klotz nicht), die Schale hält Regen (die mit
        // Loch nicht), der Gründer legt den Aufruhr (der Stapel derselben Steine nicht). Am main 833bbc24: Statik 5/10, Wirkung 3/5.
        befehl: WEG_BEFEHL,
        env: WEG_ENV,
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = zeilen(lauf.stdout).find((x) => /^\s*(✅|❌) Prüf-Satz über den Bau-Weg/.test(x));
            if (!l) return { gruen: false, zahl: "keine Prüf-Satz-Zeile (Exit " + lauf.exit + ")" };
            const m = l.match(/Statik (\d+)\/10 · Wirkung (\d+)\/5/);
            if (!m) return { gruen: false, zahl: "keine Zahl in der Prüf-Satz-Zeile" };
            return {
                gruen: /^\s*✅/.test(l) && m[1] === "10" && m[2] === "5",
                zahl: `Statik ${m[1]}/10 richtig, Wirkung ${m[2]}/5`,
            };
        },
        pfad: [
            "stamm/bau-*.js",
            "stamm/werkstatt-*.js",
            "stamm/siedlung-satz.js",
            "stamm/siedlung-bauten.js",
            "stamm/koerper-fahrt.js",
            "stamm/bild-himmel.js",
            "stamm/wasser-hydro.js",
            "stamm/gelaende-kollision.js",
            "stamm/studio-bruecke.js",
            "stamm/vegetation-baum.js",
            "stamm/dienst.js",
            "stamm/daten.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "vehicle-core.js",
            "spec/pruefsatz/bauen-k3.json",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = ein Prüf-Satz aus 10 Konstruktionen (5 stabil, 5 instabil) wird in der Welt 10/10 richtig geurteilt mit sichtbarer Folge, und 5 Wirkungs-Konstruktionen halten 100 %",
    },
    // gate:fall-waechter (B) DER TURM (bauen-k4-editform): je Klick der rechten Maus am Canvas (`tryMousePlace`, der Blick senkrecht
    // nach unten) ein Block r 3,5 unter dem Spieler — Hub je Block, die Sohlen der Fuß-IK neben dem gebauten Mesh (`_bodenSichtAt`),
    // die Höhe über dem Gelände; Save, Reload: die Edits des Turms, ihre Hülle (Löcher), Sohle und Stand. Gelesen wird die B-ZAHL
    // (die Probe B allein: ein rotes O1–O3 des Wächters ist nicht der Turm).
    {
        kriterium: "bauen.K4",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-fall-waechter.cjs"],
        env: { ...SOFT, FALL_WAECHTER_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 13, // 27.10.: der Fall-Wächter wuchs mit bk4-turm (sechs Türme à 20 Klicks) auf 162–291 s lokal, die Station läuft ~3,5× langsamer (ek-schleife)
        urteil: (j, lauf) => {
            const b = jsonZeile(lauf.stdout, /^\s*B-ZAHL \{/);
            if (!b) return { gruen: false, zahl: "keine B-ZAHL-Zeile (Exit " + lauf.exit + ")" };
            const [n, f] = [b.nach || {}, (x) => (Number.isFinite(x) ? x.toFixed(2) : "?")];
            const befunde = b.befunde || ["keine Befund-Liste"];
            return {
                gruen:
                    befunde.length === 0 && b.bloecke === 20 && b.hoehe >= 60 && b.sohle <= 0.15 &&
                    n.edits === 20 && n.loecher === 0 && n.sohle <= 0.15,
                zahl:
                    `Turm aus ${b.bloecke}/20 Blöcken über die Maus ${f(b.hoehe)} m über dem Gelände · Hub ${f((b.hub || [])[0])}–` +
                    `${f((b.hub || [])[1])} m je Block · Sohle ≤ ${f(b.sohle)} m neben dem Mesh · nach dem Reload ${n.edits} Edits, ` +
                    `${n.loecher} Löcher, Sohle ${f(n.sohle)} m` + (befunde.length ? " — " + befunde.slice(0, 3).join(" · ") : ""),
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/gelaende-*.js",
            "stamm/koerper-*.js",
            "stamm/dirigent-*.js",
            "stamm/speicher-*.js",
            "stamm/kampf.js",
            "stamm/feld-dsl.js",
            "stamm/werkstatt-bauen.js",
            "stamm/dienst.js",
            "scripts/diag-fall-waechter.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "1 = ein Turm aus 20 Blöcken trägt ≥ 60 m über dem Gelände (Fuß ≤ 0,15 m über dem Mesh) und hält über den Reload (0 Löcher)",
    },
    // gate:fall-waechter (B2) DER TURM AUF DACH, FELS UND BRÜCKE (bk4-turm): derselbe Turm wie #1 über die Maus, je in Ego und
    // Third, im Haus der Werkstatt (vom Dachboden durch das Dach), auf der Felsdecke über der nächsten Spalte und auf dem Deck der
    // Brücke des Prüf-Satzes — die Sohlen neben der obersten Fläche (`_bodenSichtAt`); dann der Spieler 320 m fern: die
    // Lage-Bytes des Fern-Rings tragen die Krone, ein Block auf sie (`voxel_fill`) steht ≤ 1 s Spielzeit in ihnen (byte-Diff);
    // Reload: jeder Edit, kein Loch. Gelesen wird die B2-ZAHL. Gerät headless: die Lage des Rings ist eine CPU-Geometrie (der
    // Fern-Faden rechnet sie, `fernKrone`) — das Bild auf Radeon und GTX misst die Station nicht.
    {
        kriterium: "bauen.K4",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-fall-waechter.cjs"],
        env: { ...SOFT, FALL_WAECHTER_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 13,
        urteil: (j, lauf) => {
            const b = jsonZeile(lauf.stdout, /^\s*B2-ZAHL \{/);
            if (!b) return { gruen: false, zahl: "keine B2-ZAHL-Zeile (Exit " + lauf.exit + ")" };
            const [tuerme, befunde, f] = [b.tuerme || [], b.befunde || ["keine Befund-Liste"], (x) => Number(x).toFixed(2)];
            const je = tuerme.map((t) => {
                const g = t.ring || {};
                const sohle = Math.max(...(t.bloecke || []).map((k) => k[1]));
                return t.fehler
                    ? `${t.wo}: ${t.fehler}`
                    : `${t.wo} ${f(t.hoehe)} m, Sohle ≤ ${f(sohle)} m, Ring ${f(g.vor)}/${f(g.krone)} m, Edit nach ${g.takte} Takten (${g.bytes} Bytes)`;
            });
            return {
                gruen: befunde.length === 0 && tuerme.length === 6 && tuerme.every((t) => !t.fehler),
                zahl: je.join(" · ") + (befunde.length ? " — " + befunde.slice(0, 3).join(" · ") : ""),
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/gelaende-*.js",
            "stamm/bild-sicht.js",
            "stamm/koerper-*.js",
            "stamm/dirigent-*.js",
            "stamm/speicher-*.js",
            "stamm/kampf.js",
            "stamm/feld-dsl.js",
            "stamm/werkstatt-bauen.js",
            "stamm/dienst.js",
            "spec/pruefsatz/bauen-k3.json",
            "scripts/diag-fall-waechter.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "2 = auch auf Dach, Fels und Brücke (oberste Fläche, `_bodenSichtAt`), der Fern-Ring zeigt den Edit ≤ 1 s (byte-Diff), Ego und Third, beide Geräte",
    },
    // ── bauen.K5 ── L-VERBEN (diag-werkstatt-weg, bauen-k5-verben): je Werk über die Werkstatt gesetzt (das Tor über die Hotbar: die
    // Werkstatt fertigt kein Portal), über die Taste benutzt — Haus: W von 8 m vor der Tür bis hinter die Schwelle, der gezeichnete
    // Türflügel dreht > 29° (die Tür-Zeile reist in der Hülle) · Wagen (GT): E, W bis 5 m, E · Tor: E öffnet das Portal · Brücke (das
    // Teil-Werk des Prüf-Satzes, kein Gesetzbuch trägt eine Welt-Brücke): W von Deck-Ende zu Deck-Ende auf dem Deck. Leiter und Bank
    // trägt kein Gesetzbuch: offen, benannt. Am main 4a5f5e2c 3/6 (die Tür des gesetzten Hauses dreht 0°), am Zweig 4/6. Gerät
    // headless wie bauen.K1/K3 (derselbe Befehl): die Linse urteilt Verhalten im Null-Renderer, eine Karten-Station verlangte ein
    // Bild auf der Karte (GPU-Wand).
    {
        kriterium: "bauen.K5",
        staffel: 1,
        geraet: "headless",
        befehl: WEG_BEFEHL,
        env: WEG_ENV,
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const v = j && j.verben;
            if (!v) return { gruen: false, zahl: "keine Verben in weg.json (Exit " + lauf.exit + ")" };
            const werke = ["Haus", "Wagen", "Tor", "Brücke", "Leiter", "Bank"];
            const ja = werke.filter((w) => v[w] && v[w].steht === 1 && v[w].verb === true && !v[w].fehler);
            const nein = werke
                .filter((w) => !ja.includes(w))
                .map((w) => w + " (" + (v[w] ? v[w].fehler || v[w].warum || "steht nicht" : "kein Gesetzbuch trägt das Werk") + ")");
            return {
                gruen: ja.length === werke.length,
                zahl: ja.length + "/" + werke.length + " Werke tragen ihr Verb über die Taste" + (nein.length ? " — offen: " + nein.join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/werkstatt-*.js",
            "stamm/koerper-*.js",
            "stamm/netz-portal.js",
            "stamm/gelaende-kollision.js",
            "stamm/siedlung-*.js",
            "stamm/vegetation-baum.js",
            "stamm/bau-*.js",
            "stamm/studio-*.js",
            "stamm/kampf.js",
            "stamm/dirigent-*.js",
            "index.html",
            "fachwerk-core.js",
            "vehicle-core.js",
            "porta-core.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "spec/pruefsatz/bauen-k3.json",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = von 6 gesetzten Werken (Haus, Wagen, Tor, Brücke, Leiter, Bank) ist jedes Verb aus KIND_POLICY (betreten, drive, portal, sitzen, klettern) über die echte Eingabe nutzbar, an einem Gerät",
    },
    // Staffel 2 (bauen-k5-verben 57f568bd): L-VERBEN je Herkunft — die Werkstatt (das Tor über die Hotbar) · der Satz an die KI (Enter, der
    // Satz, Enter → maybeAnswerWithLlm, die Antwort ein fester DSL-Text: spawn_studio mit dem Wort hinter dem Art-Präfix, das eigene
    // Werk spawn_blueprint) · geteilt (der Teilen-Knopf der Werkstatt, sein Code getippt in den Chat → empfangeWerk) — × Ego und
    // Third × 6 Werke, benutzt über die Taste; `--verben` fährt nur L-VERBEN, mit echtem Renderer (die Karte). Das Haus in Third:
    // die Kamera steht hinter dem Spieler, das Haus bleibt bis zur Schwelle in Stufe 1 (K36), die die Tür offen bäckt — dort zählt
    // der Eintritt durch die offene Tür, die der Tür-Takt hält (`_tuerRec`), nicht ihr Drehen. Cloud headless (Null-Renderer)
    // 26/36 → 36/36 (Wurzel `_werkFuss`: spawn_blueprint stellte das Werk in die Fußhöhe des Spielers).
    // IN DER SITZUNG (29.10., `probeVerben`): je Herkunft × Sicht ein Werk, jedes Werk einmal (VERB_FAELLE, 6 Läufe) in der Welt der
    // Sitzung mit laufendem Loop; jeder Lauf trägt sein Verb, sonst ROT beim Namen.
    {
        kriterium: "bauen.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { ...VERB_PROBE, mutiert: true,  sek: 10 },
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const je = j && j.verbenJe;
            if (!je) return { gruen: false, zahl: "keine verbenJe in der Ausgabe der Probe (Exit " + lauf.exit + ")" };
            const nein = [];
            let ja = 0;
            for (const [h, s, w] of VERB_FAELLE) {
                const e = ((je[h] || {})[s] || {})[w];
                if (e && e.steht === 1 && e.verb === true && !e.fehler) ja++;
                else nein.push(`${h} · ${s} · ${w} (${e ? e.fehler || e.warum || "steht nicht" : "nicht gelaufen"})`);
            }
            return {
                gruen: lauf.exit === 0 && ja === VERB_FAELLE.length,
                zahl:
                    `${ja}/${VERB_FAELLE.length} Herkunft × Sicht × Werk tragen ihr Verb über die Taste (je Herkunft × Sicht ein Werk, jedes Werk einmal)` +
                    (nein.length ? " — offen: " + nein.join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/werkstatt-*.js",
            "stamm/koerper-*.js",
            "stamm/netz-*.js",
            "stamm/feld-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/siedlung-*.js",
            "stamm/vegetation-baum.js",
            "stamm/bau-*.js",
            "stamm/studio-*.js",
            "stamm/kampf.js",
            "stamm/dirigent-*.js",
            "stamm/stoff-material.js",
            "index.html",
            "fachwerk-core.js",
            "vehicle-core.js",
            "porta-core.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "spec/pruefsatz/bauen-k3.json",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = auch für KI-gesetzte und geteilte Werke, Ego und Third, beide Geräte",
    },
    // ── studios.K1 ── jeder Griff wirkt sichtbar oder hörbar (Zweig w3w-studios): gate:regler-wirkt urteilt am BILD des Werks
    // (`bauBild`: die Vorschau-Pose unter dem Belichtungs-Gesetz der Welt, ≥ 1 % der Gestalt-Pixel mit ΔLuma > 18) bzw. an
    // seinem Leser der Welt (Membran · Ritt · Ohr). Zwilling von pipeline.K3 (REGLER_BEFEHL): EIN Lauf, headless (die Brücke
    // baut in JS, das Raster rechnet die CPU — geräteunabhängig)
    {
        kriterium: "studios.K1",
        staffel: 1,
        geraet: "headless",
        befehl: REGLER_BEFEHL,
        env: { ...SOFT, REGLER_WIRKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const k = k1Lesen(lauf);
            if (k.teile !== 3) return { gruen: false, zahl: k.teile + " von 3 Teilen mit Zeilen-Zahl (Exits " + k.exits.join("/") + ")" };
            return { gruen: !!k.bild && k.zeilen > 0 && k.wirkt / k.zeilen >= 0.8, zahl: k1Zahl(k) };
        },
        pfad: REGLER_PFAD,
        quelle: "1 = ≥ 80 % der Zeilen von PARAMS_BY_KIND wirken am Bild bzw. Ohr",
    },
    {
        kriterium: "studios.K1",
        staffel: 2,
        geraet: "headless",
        befehl: REGLER_BEFEHL,
        env: { ...SOFT, REGLER_WIRKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const k = k1Lesen(lauf);
            if (k.teile !== 3) return { gruen: false, zahl: k.teile + " von 3 Teilen mit Zeilen-Zahl (Exits " + k.exits.join("/") + ")" };
            return { gruen: !!k.bild && k.baum && k.zeilen > 0 && k.wirkt === k.zeilen, zahl: k1Zahl(k) };
        },
        pfad: REGLER_PFAD,
        quelle: "2 = 100 % — der Nenner ist die Zeilen-Zahl bei der Messung (eine Ratsche, die nur wächst, mit den Baum-Zeilen)",
    },
    // ── studios.K4 ── Studio = Welt im Bild: die K4-Probe in der warmen Welt der Sitzung (K4_BEFEHL), Staffel 1 auf einer Karte
    {
        kriterium: "studios.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: { sek: 33, mutiert: true, befehl: K4_BEFEHL },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            j = j || jsonZeile(lauf.stdout, /^K4 \{/);
            if (!j || !j.studios) return { gruen: false, zahl: "kein K4-JSON (Exit " + lauf.exit + "): " + String(lauf.stdout || "").split(/\r?\n/).filter((l) => /^K4 /.test(l)).slice(-2).join(" | ").slice(0, 300) };
            const k = k4Zahl(j);
            return { gruen: k.gruen.length >= 3, zahl: k.zahl };
        },
        proben: K4_PROBEN,
        pfad: K4_PFAD,
        quelle: "1 = ≥ 3/7 Mesh-Studios mit Bild-Differenz ≤ 2,1 % und Albedo Labor/Welt im Rand 0,10",
    },
    {
        kriterium: "studios.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { sek: 33, mutiert: true, befehl: K4_BEFEHL },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            j = j || jsonZeile(lauf.stdout, /^K4 \{/);
            if (!j || !j.studios) return { gruen: false, zahl: "kein K4-JSON (Exit " + lauf.exit + ")" };
            const k = k4Zahl(j);
            return { gruen: k.gruen.length === 7, zahl: k.zahl };
        },
        pfad: K4_PFAD,
        quelle: "2 = 7/7 auf beiden Geräten",
    },
    // ── studios.K5 ── das Probe-Gesetzbuch (Fixture-Kern in spec/) über die Werkstatt in der Welt (gate:nervensystem E)
    {
        kriterium: "studios.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-nervensystem.cjs"],
        env: { ...SOFT, NERV_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const e = jsonZeile(lauf.stdout, /^E-ZAHL \{/);
            if (!e) return { gruen: false, zahl: "keine E-ZAHL-Zeile (Exit " + lauf.exit + ")" };
            const lod = (e.lod || []).map((x) => "L" + x.ist + " " + x.tris).join(" · ");
            const taeter = e.taeter || [];
            return {
                gruen: lauf.exit === 0 && taeter.length === 0,
                zahl:
                    `${e.bauplaene}/3 Baupläne · Stufen ${lod || "keine"} △ · Kosten ${(e.kosten || []).map((k) => k.klasse).join("/") || "keine"} · ` +
                    `Neuladen ${e.geladen === true ? "steht" : "fehlt"} · der Wirt nennt die Art ${e.nennt}×` +
                    (taeter.length ? " — " + taeter.join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/",
            "index.html",
            "cores.manifest.json",
            "*-core.js",
            "foundry-bruecke.js",
            "worlds/neuntes-buch/",
            "worlds/huelle/huelle.js",
            "worlds/terrain/lib/",
            "signaling-server.js",
            "scripts/diag-nervensystem.cjs",
            "scripts/diag-atlas.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "1 = ein Probe-Gesetzbuch (Fixture-Kern in spec/ mit PARAMS_BY_KIND und Bauer) steht über die Werkstatt in der Welt mit LOD-Kette, Kosten-Leiste und Speicher-Rundlauf, `git diff stamm/` = 0",
    },
    // gate:nervensystem E2: je Weg der Bau-Hash der gezeigten Stufe (Werkstatt · KI-Satz mit festem DSL-Text, das Prompt lehrt
    // das Wort · Foundry build-asset L0–L2 = die gezeigten Stufen · P2P: der Mitspieler baut das Werk byte-gleich), der Atlas
    // (`--find neuntes`) nennt die EINE Quelle, der Wirt nennt die Art 0×
    {
        kriterium: "studios.K5",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-nervensystem.cjs"],
        env: { ...SOFT, NERV_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const e = jsonZeile(lauf.stdout, /^E-ZAHL \{/);
            if (!e || !Array.isArray(e.wege)) return { gruen: false, zahl: "keine Wege in der E-ZAHL (Exit " + lauf.exit + ")" };
            const auf = e.wege.filter((w) => w.ok).length;
            return {
                gruen:
                    lauf.exit === 0 && !(e.taeter || []).length && auf === 4 && e.atlas === "worlds/neuntes-buch/stele-core.js" && e.nennt === 0,
                zahl:
                    `${auf}/4 Wege (${e.wege.map((w) => `${w.ok ? "✓" : "✗"} ${w.weg} ${w.bau || "kein Bau"}`).join(" · ")}) · ` +
                    `Atlas ${e.atlas || "kein Gesetzbuch"} · der Wirt nennt die Art ${e.nennt}×`,
            };
        },
        pfad: [
            "stamm/",
            "index.html",
            "cores.manifest.json",
            "*-core.js",
            "foundry-bruecke.js",
            "signaling-server.js",
            "worlds/neuntes-buch/",
            "worlds/huelle/huelle.js",
            "worlds/terrain/lib/",
            "scripts/diag-nervensystem.cjs",
            "scripts/diag-atlas.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "2 = auf allen Wegen (Werkstatt, KI-Satz, Foundry, P2P), und der Atlas nennt seine EINE Quelle",
    },
    // ───────── KARTE 2 (vorrat2-stationen-g4): das Bildpaar an fester Pose (PAAR_PROBE) und das Fachwerk aus der K4-Probe ─────────
    // erleben.schoepfen.teilen S 1: je Werk (die Bank aus dem Gesetzbuch, die Brücke als eigener Bauplan) das Original gegen den Import
    // seines Codes an DERSELBEN Kamera und demselben Ort — gleich im Rauschen, das Werk im Bild, beide Geräte
    {
        kriterium: "karte2.erleben.schoepfen.teilen",
        karte2: true,
        staffel: 1,
        geraet: ["radeon", "gtx"],
        beide: true,
        probe: PAAR_PROBE,
        gpu: true,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const { ad, hw } = PAAR_HW(lauf.stdout);
            if (!j || !j.teilen) return { gruen: false, zahl: "kein Bildpaar in der Ausgabe der Probe (Exit " + lauf.exit + ") · " + ad };
            const ja = PAAR_WERKE.filter((w) => paarGleich(j.teilen[w]));
            return {
                // DER EXIT GEHÖRT DER GETEILTEN PROBE (16.11., Radeon fe885d9d Lauf 2: 2/2 Werke gleich, ROT an „Exit 1“ — die URTEILS-WACHE
                // der Probe hob den Exit an der Pflug-Welt des Zwillings schutz#1): jedes Urteil liest nur seine Felder, jedes in Zahlen
                gruen: hw && ja.length === PAAR_WERKE.length,
                zahl: ja.length + "/" + PAAR_WERKE.length + " Werke: Original ↔ Import an derselben Kamera gleich · " + PAAR_WERKE.map((w) => w + " " + paarZahl(j.teilen[w])).join(" · ") + " · " + ad,
            };
        },
        proben: [
            { name: "gesund: beide Werke gleich im Rauschen, das Werk im Bild", j: paarRoh(), stdout: PAAR_KARTE, gruen: true },
            { name: "der Import weicht ab (2 % der Leinwand)", j: paarRoh({ eigen_bruecke: { diff: 0.02 } }), stdout: PAAR_KARTE, gruen: false },
            { name: "das Werk steht nicht im Bild (blind gleich)", j: paarRoh({ bank_sitzbank: { praesenz: 0.002 } }), stdout: PAAR_KARTE, gruen: false },
            { name: "der Import steht nicht", j: paarRoh({ bank_sitzbank: { fehler: "empfangeWerk bank_sitzbank: steht_nicht:bank_sitzbank", diff: undefined } }), stdout: PAAR_KARTE, gruen: false },
            { name: "swiftshader", j: paarRoh(), stdout: "[linse-gpu] google/swiftshader", gruen: false },
            { name: "der Zwilling schutz ROT (Exit 1 der URTEILS-WACHE), die eigenen Werke gleich", j: paarRoh({}, {}, {}, {}, { pflug: { ok: true, neu: true, welt: "feind-pflug-x", zeile: "", stand: false, diff: undefined } }), stdout: PAAR_KARTE, exit: 1, gruen: true },
        ],
        pfad: PAAR_PFAD,
        quelle: "KARTE2 erleben.schoepfen.teilen S1 = Export/Import: Bildpaar an gleicher Pose gleich",
    },
    // erleben.schoepfen.schutz S 1 (vorrat3-stationen-g4, wörtlich): je feindliche WELT (ein Gesetz, das kein Build trägt · eine
    // Welt-Regel, die den frozen Worldgen pflügt) durch das Welt-Tor „ersetzen“ am Bild des eigenen Werks — keine tritt ein, die eigene
    // Welt bleibt im Bild (gleich im Rauschen, das Werk im Bild) und im Stand gleich, jede Abweisung steht im Spieler-Kanal. Die drei
    // feindlichen Werk-Codes (vorrat2) sind Lesewert in der Zahl, nie das Urteil: der Richter sagt „Welt“.
    {
        kriterium: "karte2.erleben.schoepfen.schutz",
        karte2: true,
        staffel: 1,
        geraet: ["radeon", "gtx"],
        beide: true,
        probe: PAAR_PROBE,
        gpu: true,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const { ad, hw } = PAAR_HW(lauf.stdout);
            const w = j && j.welt;
            if (!w || !w.faelle) return { gruen: false, zahl: "keine feindliche Welt in der Ausgabe der Probe (Exit " + lauf.exit + ") · " + ad };
            const gut = (f) => !!f && f.ok === false && !f.neu && !!f.zeile && f.stand === true && paarGleich({ rausch: w.rausch, praesenz: w.praesenz, diff: f.diff });
            const ja = PAAR_WELT.filter((k) => gut(w.faelle[k]));
            const s = j.schutz && j.schutz.faelle;
            const codes = s ? PAAR_FREMD.filter((k) => s[k] && s[k].ok === false && s[k].zeile).length + "/" + PAAR_FREMD.length : "–";
            return {
                gruen: hw && ja.length === PAAR_WELT.length, // der Exit gehört der geteilten Probe (wie teilen)
                zahl:
                    ja.length + "/" + PAAR_WELT.length + " feindliche Welten am Welt-Tor abgewiesen, die eigene Welt im Bild gleich (Werk " + (w.werk || "–") + " " + (Number.isFinite(w.praesenz) ? (100 * w.praesenz).toFixed(1) + " % des Bilds" : "–") + ") · " +
                    PAAR_WELT.map((k) => { const f = w.faelle[k]; return k + " " + (!f ? "nicht gelaufen" : (f.neu ? "EINGETRETEN (Seite neu, Welt " + f.welt + ")" : f.ok ? "EINGETRETEN" : "abgewiesen") + (f.neu || f.stand ? "" : " STAND VERÄNDERT") + (f.neu || f.zeile ? "" : " OHNE ZEILE") + (Number.isFinite(f.diff) ? " Δ " + (100 * f.diff).toFixed(2) + " %" : "")); }).join(" · ") + // prettier-ignore
                    (w.fehler ? " · " + String(w.fehler).slice(0, 120) : "") + " · Werk-Codes abgewiesen " + codes + " (Lesewert) · " + ad,
            };
        },
        proben: [
            { name: "gesund: beide Welten abgewiesen, Bild und Stand gleich, jede Abweisung benannt", j: paarRoh(), stdout: PAAR_KARTE, gruen: true },
            { name: "die Pflug-Welt tritt ein (die Seite lädt neu)", j: paarRoh({}, {}, {}, {}, { pflug: { ok: true, neu: true, welt: "feind-pflug-x", zeile: "", stand: false, diff: undefined } }), stdout: PAAR_KARTE, gruen: false },
            { name: "die Abweisung nur im Log (keine Zeile im Spieler-Kanal)", j: paarRoh({}, {}, {}, {}, { gesetz: { zeile: "" } }), stdout: PAAR_KARTE, gruen: false },
            { name: "das eigene Werk verschwand (Bild 3 % anders)", j: paarRoh({}, {}, {}, {}, { gesetz: { diff: 0.03 } }), stdout: PAAR_KARTE, gruen: false },
            { name: "der Stand der Welt änderte sich", j: paarRoh({}, {}, {}, {}, { pflug: { stand: false } }), stdout: PAAR_KARTE, gruen: false },
            { name: "das eigene Werk nicht im Bild (blind gleich)", j: paarRoh({}, {}, {}, { praesenz: 0.001 }), stdout: PAAR_KARTE, gruen: false },
            { name: "die Probe kam nicht zur Welt (nur die Werk-Codes)", j: { ...paarRoh(), welt: { faelle: {}, fehler: "Frist der Probe vor der feindlichen Welt (70 s)" } }, stdout: PAAR_KARTE, gruen: false },
            { name: "swiftshader", j: paarRoh(), stdout: "[linse-gpu] google/swiftshader", gruen: false },
        ],
        pfad: PAAR_PFAD,
        quelle: "KARTE2 erleben.schoepfen.schutz S1 = feindliche Welt geladen: eigene Welt im Bildpaar unverändert, Abweisung im Spiel benannt",
    },
    // mensch.bau.bauen S 1: das Fachwerk allein aus der K4-Probe (derselbe Lauf wie studios.K4#1, kein GPU-Lauf mehr) — das Werk in der
    // Bühne des Labors und in der Welt an derselben Vorschau-Kamera, die Bild-Differenz über der Gestalt beider Seiten
    {
        kriterium: "karte2.mensch.bau.bauen",
        karte2: true,
        staffel: 1,
        geraet: ["radeon", "gtx"],
        beide: true,
        probe: { sek: 33, mutiert: true, befehl: K4_BEFEHL },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            j = j || jsonZeile(lauf.stdout, /^K4 \{/);
            if (!j || !j.studios) return { gruen: false, zahl: "kein K4-JSON (Exit " + lauf.exit + ")" };
            return k4Fachwerk(j);
        },
        proben: [
            { name: "fachwerk 1,2 % über der Gestalt beider Seiten", stdout: k4FachwerkRoh(0.012), gruen: true },
            { name: "fachwerk 2,5 %", stdout: k4FachwerkRoh(0.025), gruen: false },
            { name: "dieselbe Zahl über der Teilung der Werkbank (der Boden zählt als Werk)", stdout: k4FachwerkRoh(0.012, { welt: { maske: "teilung", pixel: 340155 } }), gruen: false },
            { name: "das Fachwerk fehlt im Lauf", stdout: "K4 " + JSON.stringify({ geraet: "WebGPU rdna-3", studios: {}, fehler: [] }), gruen: false },
            { name: "swiftshader", stdout: k4FachwerkRoh(0.012).replace("WebGPU rdna-3", "WebGPU swiftshader"), gruen: false },
        ],
        pfad: K4_PFAD,
        quelle: "KARTE2 mensch.bau.bauen S1 = Bildpaar Labor ↔ Welt gleiche Kamera: kein Unterschied",
    },
    // erleben.sinn.takt S 1 (vorrat3-stationen-g4): 10 Minuten fester Spielgang an der Ankunft der Sitzung (TAKT_PROBE), je Minute
    // die Antworten im Blick (Tat · Tier in Flucht · Stimme · Tagebuch) — Anteil toter Minuten ≤ 50 %, beide Geräte
    {
        kriterium: "karte2.erleben.sinn.takt",
        karte2: true,
        staffel: 1,
        geraet: ["radeon", "gtx"],
        beide: true,
        probe: TAKT_PROBE,
        gpu: true,
        zeit: false,
        minuten: 11,
        urteil: (j, lauf) => taktUrteil(j, lauf),
        proben: [
            { name: "gesund: 3 von 10 Minuten tot", j: taktRoh(3), stdout: PAAR_KARTE, gruen: true },
            { name: "die Grenze: 5 von 10 Minuten tot", j: taktRoh(5), stdout: PAAR_KARTE, gruen: true },
            { name: "6 von 10 Minuten tot", j: taktRoh(6), stdout: PAAR_KARTE, gruen: false },
            { name: "nur 4 Minuten gelaufen (die Frist), keine tot — kein Urteil (ohneUrteil)", j: { ...taktRoh(0), minuten: taktRoh(0).minuten.slice(0, 4) }, stdout: PAAR_KARTE, gruen: false },
            { name: "nur 7 Minuten gelaufen, 6 davon tot — ROT schon über 10 Minuten", j: { ...taktRoh(6), minuten: taktRoh(6).minuten.slice(0, 7) }, stdout: PAAR_KARTE, gruen: false },
            { name: "eine Minute ohne gezeichnetes Bild", j: { ...taktRoh(0), minuten: taktRoh(0).minuten.map((m, i) => (i === 7 ? { ...m, bilder: 0 } : m)) }, stdout: PAAR_KARTE, gruen: false },
            { name: "swiftshader", j: taktRoh(3), stdout: "[linse-gpu] google/swiftshader", gruen: false },
        ],
        pfad: TAKT_PFAD,
        quelle: "KARTE2 erleben.sinn.takt S1 = Anteil toter Minuten ≤ 50 %",
    },
    // erleben.spieler.rolle S 1 (vorrat3-stationen-g4): je Verb-Gruppe (gehen · bauen · fahren · kämpfen) eine Weltänderung am Feld der
    // Welt (Tier flieht · Werk steht · Wagen ≥ 10 m · hp sinken) UND das Bildpaar vor/nach an derselben Kamera sichtbar (ROLLE_PROBE)
    {
        kriterium: "karte2.erleben.spieler.rolle",
        karte2: true,
        staffel: 1,
        geraet: ["radeon", "gtx"],
        beide: true,
        probe: ROLLE_PROBE,
        gpu: true,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const { ad, hw } = PAAR_HW(lauf.stdout);
            const G = (j && j.gruppen) || null;
            if (!G) return { gruen: false, zahl: "keine Verb-Gruppe in der Ausgabe der Probe (Exit " + lauf.exit + ") · " + ad };
            // die Tat in der wachen Welt (`halt` ≥ 0 nach den Schüssen) und die Aufstellung als Zahl je Gruppe (Werk, Wagen, Tier bis zum
            // Ereignis) — über 10 s ist sie der Befund für den Spieler, nie ein Grund zu warten
            const wachOk = (z) => !!z && Number.isFinite(z.halt) && z.halt >= 0 && Number.isFinite(z.aufstellungS);
            // DER GEGNER NACH DEM GESETZ (17.11.): der Kampf zählt nur gegen ein Tier, das im pfad jagt — wild, der Spieler seine Beute;
            // ein gestelltes Ziel (sanft, im frieden, ohne Beute) ist kein Kampf eines Spielers
            const gegnerOk = (g) => g !== "kaempfen" || (!!G[g].ziel && G[g].ziel.temperament === "wild" && G[g].ziel.modus === "pfad" && G[g].ziel.beute === true);
            const ja = ROLLE_GRUPPEN.filter((g) => G[g] && G[g].aenderung === true && rolleSichtbar(G[g]) && wachOk(G[g]) && gegnerOk(g));
            const gestellt = G.kaempfen && !G.kaempfen.fehler && !gegnerOk("kaempfen") ? " · kämpfen gegen ein gestelltes Ziel (" + JSON.stringify(G.kaempfen.ziel || null) + ", Soll wild · pfad · Beute)" : "";
            const ohneWach = ROLLE_GRUPPEN.filter((g) => G[g] && !G[g].fehler && !wachOk(G[g]));
            const auf = ROLLE_GRUPPEN.filter((g) => G[g] && Number.isFinite(G[g].aufstellungS)).map((g) => g + " " + G[g].aufstellungS + " s");
            const lang = ROLLE_GRUPPEN.filter((g) => G[g] && G[g].aufstellungS > 10).map((g) => g + " " + G[g].aufstellungS + " s");
            return {
                gruen: hw && lauf.exit === 0 && ja.length === ROLLE_GRUPPEN.length,
                zahl:
                    ja.length + "/" + ROLLE_GRUPPEN.length + " Verb-Gruppen ändern die Welt sichtbar · Aufstellung " + (auf.join(", ") || "ohne Zahl") +
                    (lang.length ? " (Aufstellung > 10 s: " + lang.join(", ") + ")" : "") +
                    (ohneWach.length ? " · die Tat ohne wache Welt (Halt oder Aufstellung ohne Zahl): " + ohneWach.join(", ") : "") + gestellt + " · " +
                    ROLLE_GRUPPEN.map((g) => { const z = G[g]; return g + " " + (!z ? "nicht gelaufen" : z.fehler ? String(z.fehler).slice(0, 80) : (z.aenderung ? "Änderung" : "OHNE ÄNDERUNG") + " Δ " + (Number.isFinite(z.diff) ? (100 * z.diff).toFixed(2) + " %" : "–") + " (Rauschen " + (Number.isFinite(z.rausch) ? (100 * z.rausch).toFixed(2) + " %" : "–") + ")" + (g === "gehen" && z.welt && z.welt.wesen ? " [Wesen " + Object.entries(z.welt.wesen).map(([k, v]) => k + " " + v).join(", ") + ", zustand " + z.welt.zustand + ", " + z.welt.d + " m]" : "")); }).join(" · ") + // prettier-ignore
                    " · " + ad,
            };
        },
        proben: [
            { name: "gesund: vier Gruppen ändern die Welt, jedes Paar sichtbar", j: rolleRoh(), stdout: PAAR_KARTE, gruen: true },
            { name: "das Tier flieht nicht", j: rolleRoh({ gehen: { aenderung: false } }), stdout: PAAR_KARTE, gruen: false },
            // GTX 7de938ab: zustand null bei 2,08 m — die Zeile nennt das Wesen, wie das Spiel es führte
            { name: "das Wesen ohne Bewegungs-Zustand (GTX 7de938ab, 2,08 m) — die Zeile nennt es beim Namen", j: rolleRoh({ gehen: { aenderung: false, welt: { flucht: false, d: 2.08, zustand: null, wesen: { gattung: "deer", groesse: 1.12, temperament: "sanft", task: "wander", ruht: true, nah: false, satz: false, sichtbar: true } } } }), stdout: PAAR_KARTE, gruen: false, zahl: /gehen OHNE ÄNDERUNG .*\[Wesen gattung deer, groesse 1\.12, temperament sanft, task wander, ruht true, nah false, satz false, sichtbar true, zustand null, 2\.08 m\]/ },
            { name: "der Wagen fährt, das Bild bleibt im Rauschen", j: rolleRoh({ fahren: { diff: 0.0009 } }), stdout: PAAR_KARTE, gruen: false },
            { name: "der Hieb trifft nicht (die Gruppe warf)", j: rolleRoh({ kaempfen: { fehler: "kein Wesen in Reichweite (spawnCreatureAt: obergrenze)", diff: undefined } }), stdout: PAAR_KARTE, gruen: false },
            { name: "eine Gruppe fehlt (die Frist)", j: { ...rolleRoh(), gruppen: { ...rolleRoh().gruppen, bauen: undefined } }, stdout: PAAR_KARTE, gruen: false },
            { name: "swiftshader", j: rolleRoh(), stdout: "[linse-gpu] google/swiftshader", gruen: false },
            // GTX und Radeon ee9c1965/389a6496: die Schüsse vor der Tat hielten die Welt (weatherEffectTime −1e9), die Tat lief im Halt
            { name: "die Tat unter dem Halt der Messung (gehen −1e9)", j: rolleRoh({ gehen: { halt: -1e9 } }), stdout: PAAR_KARTE, gruen: false },
            { name: "die Aufstellung ohne Zahl (bauen)", j: rolleRoh({ bauen: { aufstellungS: undefined } }), stdout: PAAR_KARTE, gruen: false },
            // der Mutant der Klasse (17.11.): das Ziel nach dem Furcht-Gesetz floh vor dem Schwung, die hp blieben (Radeon e489088a)
            { name: "das Ziel flieht vor der Klinge, kein Treffer (3,39 m beim Hieb, Klinge 0,66 m)", j: rolleRoh({ kaempfen: { aenderung: false, welt: { schwung: true, hp: 30, hp0: 30, dHieb: 3.39, reach: 0.66, zustand: "flucht" } } }), stdout: PAAR_KARTE, gruen: false },
            { name: "der große Wolf hält vor der Klinge, kein Schwung (GTX 7de938ab: hp 754, dMin 1,80 m, Klinge 0,66 m)", j: rolleRoh({ kaempfen: { aenderung: false, welt: { schwung: false, schwuenge: 0, hp: 754.4, hp0: 754.4, dMin: 1.8, reach: 0.66, leibR: 1.2, jagt: true, zustand: "hetzen" } } }), stdout: PAAR_KARTE, gruen: false },
            { name: "ein gestelltes Ziel (sanft, im frieden): der Treffer zählt nicht", j: rolleRoh({ kaempfen: { ziel: { seele: "wesen", temperament: "sanft", beute: false, modus: "frieden" } } }), stdout: PAAR_KARTE, gruen: false, zahl: /gestelltes Ziel/ },
            // der Mutant „nächstes Tier“ (18.11., GTX e4e3f363): die Aufstellung nimmt den ersten Wolf — klein, der Spieler ihm keine Beute, er flieht
            { name: "der Mutant „nächstes Tier“: der erste Wolf (hp 72), der Spieler ihm keine Beute — ROT am Wolf", j: rolleRoh({ kaempfen: { aenderung: false, ziel: { seele: "wolf", temperament: "wild", beute: false, modus: "pfad", wuerfe: 1, kg: 31 }, welt: { schwung: false, schwuenge: 0, hp: 72.2, hp0: 72.2, dMin: 6.07, reach: 0.66, leibR: 1.22, jagt: true, zustand: "flucht" } } }), stdout: PAAR_KARTE, gruen: false, zahl: /3\/4 Verb-Gruppen .*gestelltes Ziel \(\{"seele":"wolf","temperament":"wild","beute":false/ },
            { name: "der dritte Wurf führt den Wolf, dem der Spieler Beute ist — der Kampf zählt", j: rolleRoh({ kaempfen: { ziel: { seele: "wolf", temperament: "wild", beute: true, modus: "pfad", wuerfe: 3, kg: 64 } } }), stdout: PAAR_KARTE, gruen: true },
            { name: "kein Wolf, dem der Spieler Beute ist (8 Würfe) — kein GRÜN, der Grund wörtlich, Marke MESSORT", j: rolleRoh({ kaempfen: { fehler: "kein Wolf, dem der Spieler Beute ist: 8 Würfe, Wolf 31/28/35/30/33/29/36/32 kg, Spieler 80 kg", diff: undefined, aenderung: undefined } }), stdout: PAAR_KARTE + "\n@@PUNKTE@@ MESSORT rolle kämpfen: kein Wolf, dem der Spieler Beute ist: 8 Würfe, Wolf 31/28/35/30/33/29/36/32 kg, Spieler 80 kg", gruen: false, zahl: /kaempfen kein Wolf, dem der Spieler Beute ist/ },
            { name: "die Aufstellung des Wagens 12,5 s — der Befund steht beim Namen, das Urteil bleibt", j: rolleRoh({ fahren: { aufstellungS: 12.5 } }), stdout: PAAR_KARTE, gruen: true, zahl: /Aufstellung > 10 s: fahren 12\.5 s/ },
        ],
        pfad: ROLLE_PFAD,
        quelle: "KARTE2 erleben.spieler.rolle S1 = 15 min je Verb-Gruppe: ≥ 1 sichtbare Weltänderung (Werk steht, Tier flieht, Fahrzeug fährt), Bildpaar vorher/nachher",
    },
];

// die fahrbaren Stationen sind die Liste, die Staffeln ohne Werkzeug (befehl: null, grund) stehen daneben in `fehlt`
module.exports = alle.filter((st) => st.befehl !== null);
module.exports.fehlt = alle.filter((st) => st.befehl === null).concat([
    // p3-stationen-g456 (01.11.): die Staffeln 2, deren Werkzeug fehlt — beim Namen
    { kriterium: "pipeline.K5", staffel: 2, befehl: null, grund: "nicht gebaut (p3-stationen-g456): „kalt bereit ≤ 300 ms an beiden Geräten“ verlangt die Bereitschaft des Foundry-Fadens am Kalt-Boot auf jeder Karte — die Probe der Ankunft in der Sitzung nennt sie nicht, ein eigener Lauf hat in der Fahrt keinen Platz (Radeon 1 790 / 1 800 s)" },
    { kriterium: "ki.K5", staffel: 2, befehl: null, grund: "nicht gebaut (p3-stationen-g456): Prompt ≤ 4 000 Tokens (der Prompt ist nie gezählt: kein Zähler am Chat-Pfad), 0 Hänger > 100 ms während die KI-Werke bauen (`werkbank haenger` in derselben Sitzung — die Korpus-Linse läuft am Null-Renderer), ≤ 0,002 $ je Satz (kein Preis am lokalen Modell), beide Geräte (das Modell läuft nur am Laptop)" },
]);

// ─────────── DAS MASS DER ZEIT-STATIONEN (das Gesetz der Fremd-Last, punkte.cjs fremdUrteil; stationen/mass.cjs) ───────────
// je Zeit-Station ein Feld NEBEN ihrem Urteil, nie im Abdruck: aus derselben Ausgabe die Zahlen, an denen ihr Urteil fällt, gegen ihr Soll
require("./mass.cjs").massAn(module.exports, {
    // je Studio Griff → Bild und Neubau (p95)
    "studios.K2#2": (j, lauf) => {
        const je = {};
        for (const l of zeilen(String(lauf.stdout || ""))) {
            const t = /^\s{2}⏱ (\S+)\s+Griff → Bild p95 Gesetz-Wert (\S+) ms · Neubau (\S+) ms · (\d+) Griffe mit Bild · Neuladen (\d+)\/(\d+)/.exec(l);
            if (t && SEITEN[t[1]]) je[t[1]] = { u: +t[2], n: +t[3] };
        }
        return Object.keys(SEITEN).flatMap((id) => [{ wort: id + " Griff → Bild p95 ms", wert: (je[id] || {}).u, soll: 200 }, { wort: id + " Neubau p95 ms", wert: (je[id] || {}).n, soll: 1000 }]);
    },
    // der Audio-Graph je Ort gegen sein Quantum
    "studios.K3#2": (j, lauf) => {
        const je = {};
        for (const l of zeilen(lauf.stdout)) {
            const m = /^\s{2}(\S+)\s+\d+ Anfragen · .* · Kosten (\[.*\])\s*$/.exec(l);
            if (m && SEITEN[m[1]]) je[m[1]] = JSON.parse(m[2]);
        }
        return (je.klang || []).map((k, i) => ({ wort: "Klang Ort " + (i + 1) + " Audio-Graph ms", wert: +k.audio, soll: +k.audioDeckel }));
    },
    // Satz → Welt, das p95 über die Positiv-Sätze
    "ki.K5#1": (j, lauf) => {
        const out = String(lauf.stdout || ""), anb = anbieterVon(out);
        if (!anb || anb.traegt !== true) return [];
        let neg = null;
        try {
            neg = JSON.parse((/^NEGATIV (.*)$/m.exec(out) || [])[1]);
        } catch (_e) {
            neg = null;
        }
        if (!neg) return [];
        const pos = [];
        for (const l of zeilen(out)) {
            const m = /^\s*(?:✓|✗)(?: ungültig)?(?: BRUCH)? „(.+?)“ (\d+) ms → Welt (—|\d+ ms)/.exec(l);
            if (m && !neg.includes(m[1])) pos.push(m[3] === "—" ? Infinity : parseInt(m[3], 10));
        }
        pos.sort((a, b) => a - b);
        return [{ wort: "p95 Satz → Welt ms", wert: pos.length ? pos[Math.ceil(0.95 * pos.length) - 1] : Infinity, soll: 6000 }];
    },
    // je Weg das p95 bis zum Bild, kalt und warm, über die Werke, die das Urteil zählt
    "bauen.K1#2": (j) => {
        if (!j || j.gestartet !== true || j.bild !== true || j.echt !== true || !j.wege) return [];
        const p95 = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.ceil(0.95 * a.length) - 1] : null);
        return WEG_WEGE.flatMap((weg) => {
            const jeKlasse = { kalt: [], warm: [] };
            for (const [w, lage, werk, sicht] of BILD_FAELLE)
                if (w === weg) {
                    const e = ((((j.wege[lage] || {})[weg] || {})[werk] || {})[sicht]) || null;
                    const ms = e && Array.isArray(e.zeiten) ? e.zeiten[4] : null;
                    if (e && !e.fehler && e.steht === 1 && !(e.unecht > 0) && e.eingaben > 0 && e.eingaben <= 3 && Number.isFinite(ms) && e.bau && e.bau === e.soll)
                        jeKlasse[e.kalt ? "kalt" : "warm"].push(ms);
                }
            return [["kalt", p95(jeKlasse.kalt)], ["warm", p95(jeKlasse.warm)]].filter(([, v]) => Number.isFinite(v))
                .map(([art, v]) => ({ wort: weg + " p95 bis zum Bild " + art + " ms", wert: v, soll: 1000 }));
        });
    },
});
