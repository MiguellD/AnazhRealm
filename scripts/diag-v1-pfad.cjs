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

// ── DIE STATISCHE WAND (Node, kommentarfrei). Liefert [name, ok, detail]. ──
function wand(src) {
    const nc = ohneKommentare(src);
    const buehne = fnBody(nc, /\n {4}_buehneRender\(renderer, scene, camera\) \{/) || "";
    // Jeder Neben-Renderer (Werkstatt-Vorschau `p`, Feed/Hof/Ich-Bühne `s`) zeichnet nur über die Bühne.
    const direkt = (nc.match(/\b[ps]\.renderer\.render\(/g) || []).length;
    const ueber = (nc.match(/this\._buehneRender\([ps]\.renderer, [ps]\.scene, [ps]\.camera\)/g) || []).length;
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
            .replace("if (an !== null) lu.uLodMaskOn.value = 0;", "");
        const rot = wand(vorStand);
        check(
            "Selbst-Test W: der Vor-Stand (Vorschau direkt, Bühne maskiert) → W1 W2 feuern",
            rot.filter((w) => !w[1]).length === 2,
            rot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" ")
        );
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
    const out = await page.evaluate(probe, { kiPort: PORT + 3 });
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
