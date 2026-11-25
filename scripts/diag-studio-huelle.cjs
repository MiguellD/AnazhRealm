#!/usr/bin/env node
// diag-studio-huelle.cjs — DIE WAND DER STUDIO-HÜLLE (Studio-Welle 1, K41; Welle 2, K47 die terrain-Familie; Synthese §2.1
// W4a, gate:studio-huelle).
//
// EIN UI-Modul (worlds/huelle/huelle.js) trägt die Regler, die Sitzung (Undo/Redo · Same · Sperre), die Kosten-Leiste
// und die Portal-Brücke aller umgestiegenen Studios UND der Welt-Werkstatt. Die Wand nennt jede Kopie beim Namen:
//   H1 Hand-Regler    ein <input type="range"> von Hand in worlds/<welt>/index.html, ein `type = "range"` in einer Shell
//                     oder in den Werkstatt-Dateien des Stamms (am Regler-Glied) — der EINE Generator ist AnazhHuelle.regler
//   H2 Brücken-Kopie  eine eigene ready-Meldung (`type: "ready"`) oder ein Element-Adapter (`op[0]` je Element des
//                     Programms) außerhalb der Hülle — die EINE Brücke ist AnazhHuelle.bruecke
//   H3 Umstieg        (D3: die Text-Präsenz fiel) die Brücke beweist gate:portal-konformanz je Betreten (readyEcho), die
//                     Sitzung je Studio der Gang (--engine: Strg+Z nimmt den noch offenen Zug zurück, Strg+Umschalt+Z
//                     und Strg+Y bringen ihn wieder — die Folge VERLAUF)
//   H4 Labor = Welt   ein Ofen-Studio (MESHFREI-Kern, die Welt bäckt seine Gestalt über BAKERS_BY_KIND) zeigt den Ofen-Körper
//                     (K45: das tetrapoda-Labor zeigte 1 299 852 △ gegen die Welt-Zeile 62 000, K45-2: das koerperstudio-Labor
//                     332 645 △ gegen 40 000) — am Verhalten im Gang (--engine): L0 der Kosten-Leiste über der Welt-Zeile ist ROT.
//   H5 Ziel-Bild      jede Welt der Hülle trägt ihr Panorama (die Tor-Membran der Heimat liest es, D8) im Export
//                     worlds/tor-ziele.json, gebacken an den Quellen von HEUTE (Stempel SHA-256, `?v=` fällt); ohne
//                     Bild benannt: die übersetzte Welt (ihre Szene reist im enter) und die sandgesicherten
//   H6 EINE ENGINE    (Netz, --engine) die Studio-SEITE worlds/<welt>/index.html im Browser, gezählt ihre Anfragen: eine
//                     Engine-Kopie im Studio-Baum (worlds/*/lib/) oder das r160-UMD (vendor/three.min.js) ist ROT beim
//                     Namen, wer three lädt, lädt die der Welt (vendor/three.webgpu, r184); lädt die Seite die Welt
//                     (ihre Ankunft stamm/dirigent-ankunft.js), ist die isolierte Bühne aufgelöst — ROT. Wer noch fremd lädt, steht in der Ratsche.
//   H11 EINE BÜHNE    ein Studio, das seinen Renderer selbst baut oder das Licht der Welt selbst ruft (`new THREE.WebGPURenderer`,
//                     `__weltLicht.buehne`, `buehneZeichnet`), ist ROT — die EINE Bühne ist AnazhHuelle.buehne (w28-studio-welt)
//   H9 BÜHNE DER WELT (studios.K4, w13-buehne-lack) die Wand steht im Gesetz (welt-licht.js `buehneZeichnet`): jedes Bild einer
//                     Bühne der Welt (garage, schmiede) bricht laut beim Namen, wenn sie neben dem Licht der Welt ein eigenes trägt
//                     — ein Licht neben der Sonne, Sonne oder Belichtung neben dem Gesetz, ein Himmel neben seinem Knoten, ein Stoff
//                     mit eigener Umgebung; der Gang (--engine) liest es über den EINEN Sammler der Seitenfehler. Der Selbsttest
//                     spielt die Täter am echten Gesetz (Faden-Scope, three r184) ein: ein Licht neben der Sonne und eine
//                     Belichtung neben der des Gesetzes — beide beim Namen. An der echten garage (06.11., swiftshader) nannte die
//                     Wand das Haupt der Matrix-Antike („key") und die Belichtung von main (1,04 statt 0,51); die saubere Bühne zeichnet.
//   H10 WERK DER WELT (studios.K4, Labor = Welt) die Wurzel jeder Bühne trägt das Werk, das ihre Übergabe in die Welt schickt: die
//                     erste Zeile der Kosten-Leiste nennt das Maß der Hülle (`werkMass`, die Box der Wurzel gegen die Box des Werks
//                     aus dem Kern der Welt), gelesen im Stand der Öffnung; ein Mesh-Studio ohne Maß ist ROT.
// Ausgenommen, benannt: die zwei sandgesicherten Welten begegnung + schwarm (CSP default-src 'none': sie laden kein
// Skript, ihr Protokoll richtet gate:portal-konformanz). Die terrain-Familie (terrain + gelaende) trägt seit K47 keine
// Ausnahme mehr.
//
//   node scripts/diag-studio-huelle.cjs --selftest   die Täter eingespielt (je Wand H1–H6 die Fälle in `selbsttest`) → rot beim Namen
//   node scripts/diag-studio-huelle.cjs              der Baum gegen H1–H5
//   node scripts/diag-studio-huelle.cjs --panorama [welt,…]   H5: je Welt der Hülle ihr Ziel-Bild backen (worlds/<welt>/panorama.f16,
//                                                    der Stempel in worlds/tor-ziele.json); auf der echten GPU (Lehre 17)
//   node scripts/diag-studio-huelle.cjs --engine     DER GANG je Seite der Hülle: ihre Anfragen (H6), ihre Sitzung (H3),
//                                                    die L0 eines Ofen-Labors (H4); Port STUDIO_HUELLE_PORT (8742)
"use strict";
const { fehlerText, statikServer, starteBrowser, ROOT, hauptLauf, waitFor, wandEnde, ausDatei, path, fs, stammLib, crypto, jsonLesen, jsonSchreiben, fadenScope } = require("./lib/welt-boot.cjs");
const { istHardwareAdapter } = require("./lib/software-gpu.cjs");

// Die Welten auf der Hülle (Studios mit Reglern + die Nebenwelten mit der Brücke allein) und das Gelände-Studio, das als
// Panel über der Welt-Engine lebt (index.html?studio=gelaende: keine eigene Shell, keine Brücke — die Heimat IST die Welt).
const STUDIOS = ["garage", "schmiede", "portale", "klang", "fachwerk", "koerperstudio", "tetrapoda", "terrain"];
const NEBENWELTEN = ["skeleton", "fluid", "translated"];
const GELAENDE = "worlds/gelaende/studio.js";
const SAND = "sandgesichert (CSP default-src 'none'), Protokoll: gate:portal-konformanz";
const AUSGENOMMEN = { begegnung: SAND, schwarm: SAND };
// H4 — die Ofen-Studios (die Welt bäckt ihre Gestalt über BAKERS_BY_KIND); der Gang liest ihre L0 an der Kosten-Leiste (keine Ausnahme).
const OFEN_STUDIOS = { tetrapoda: 1, koerperstudio: 1 };
const HAND_RANGE_HTML = /<input\b[^>]*\btype\s*=\s*["']?range\b/gi;
const HAND_RANGE_JS = /\.type\s*=\s*["']range["']|\btype\s*:\s*["']range["']|<input[^>]*type\s*=\s*\\?["']?range/g;
const READY_LITERAL = /type\s*:\s*["']ready["']/g;
const ELEMENT_ADAPTER = /\(\s*op\s*&&\s*op\s*\[\s*0\s*\]\s*\)/g;
// H11 — DIE BÜHNE IST EINE (w28-studio-welt): der Renderer der Welt, ihr Licht an ihrer Uhr, der Vorbau und die Treue sind Glied der Hülle
// (AnazhHuelle.buehne). Bis dahin trug die garage ihren Anschluss (R.init → buehne, Vorbau, Software-Raster) und die schmiede einen
// zweiten ohne Vorbau; der Himmel der Bühne stand hinter dem Vorbau schwarz, eine Uhr reichte keine durch.
const EIGENE_BUEHNE = /new\s+THREE\.WebGPURenderer\s*\(|__weltLicht\s*\.\s*buehne(?:Zeichnet)?\s*\(/g;
const PORT = Number(process.env.STUDIO_HUELLE_PORT || 8742); // der Gang und das Backen
// H6 — EINE ENGINE: die Pfade der Anfragen einer Seite; die Ratsche nennt, wer noch fremd lädt (sie zieht nur an).
const ENGINE_FREMD = /^\/(?:worlds\/[^/]+\/lib\/[^/]+|vendor\/three\.min\.js)$/;
const ENGINE_EINE = "/vendor/three.webgpu.min.js";
// Die Welt ist geladen, wo ihre Ankunft lädt (der Boot hängt an stamm/dirigent-ankunft.js). Den Stamm OHNE Ankunft und die Liste
// der Seite der Welt (/index.html, gelesen als Text) lädt die EINE Bühne (AnazhHuelle.buehne) — bis w28-studio-seiten war jede
// Anfrage an /stamm/ ROT, also jede Seite auf der Bühne (garage, schmiede, portale).
const WELT_GELADEN = /^\/stamm\/dirigent-ankunft\.js$/;
// Die portale fiel aus ihr mit w28-studio-seiten (AnazhHuelle.studio: das Werk der Welt auf der EINEN Bühne), die fachwerk mit
// fachwerk-buehne (ihr r128, ihr Licht und die GLSL-Blende fielen in derselben Welle).
const ENGINE_RATSCHE = { koerperstudio: "r128", tetrapoda: "r128", terrain: "r128", fluid: "r183", translated: "r130" };
// H6 OHNE BROWSER (w28-studio-seiten): dieselbe Ratsche am Text der Studio-Seite — ein `<script src>` auf eine Engine-Kopie
// (`…/lib/three*.js`, das r160-UMD `vendor/three.min.js`) ist fremd; der Gang (--engine) zählt dazu die dynamischen Anfragen.
// Gezählt: die Studios auf der EINEN Engine und die, deren Werk die Bühne der Welt zeichnet (`AnazhHuelle.studio`).
const ENGINE_FREMD_SRC = /<script\b[^>]*\bsrc\s*=\s*["'](?:[^"']*\/)?(?:lib\/three[\w.-]*\.js|vendor\/three\.min\.js)/i;
const STUDIO_DER_WELT = /\bAnazhHuelle\s*\.\s*studio\s*\(/;
// H10 — DIE BÜHNE ZEIGT DAS WERK DER WELT (studios.K4, Labor = Welt): die erste Zeile der Kosten-Leiste trägt je Bau das Maß der Hülle
// (`werkMass`: die Box der Wurzel der Bühne gegen die Box des Werks, das der Kern der Welt für ihre Übergabe baut) — ein
// Mesh-Studio ohne Maß ist ROT. Bis w16-studio-welt trug die Wurzel der
// Schmiede ihre Schnitt-Karte (0,433 gegen 0,244 m), die des Fachwerks Parzelle und Flügel (31 × 13,3 × 31 gegen 10,0 × 13,2 × 8,8 m).
// Geurteilt im Stand der Öffnung (Labor = Welt, für JEDES Mesh-Studio ohne Ausnahme): ein Labor-Dial, der keine Zeile des Vertrags
// ist (Phyto-Dial, die Zeit-Achse `jahr` des Fachwerks), ändert die Bühne ohne die Übergabe — das ist eine andere Schuld (studios.K4).
// H3 — DER EINE VERLAUF der Hülle am ersten Hüllen-Schieber: der Zug an seinen Rand, dann im selben Atemzug (der Zug ist noch
// offen) die Tasten; die Folge [vor, Zug, je Taste] liest der Gang, sie wechselt ganz (vor, Zug, vor, Zug …) oder ist ROT.
const VERLAUF = ["Strg+Z", "Strg+Umschalt+Z", "Strg+Z", "Strg+Y", "A", "B"]; // A/B (studios.K2): A zeigt den Stand der Öffnung, B den Zug
const folgeText = (f) => `Schieber ${f[0]} → ${f[1]}` + VERLAUF.map((n, i) => `, ${n} → ${f[i + 2]}`).join("");
// Der Spruch des Gangs (pure Funktion, Gang UND Selbsttest): `netz` je Seite die Pfade ihrer Anfragen (H6), `seiten` je Seite
// die Folge ihrer Sitzung (H3) und die gezeigte L0 eines Ofen-Studios gegen seine Welt-Zeile (H4, die Kosten-Leiste „N / Deckel △").
function pruefeGang(netz, seiten = {}) {
    const rot = [];
    for (const [id, pfade] of Object.entries(netz)) {
        const fremd = [...new Set(pfade.filter((p) => ENGINE_FREMD.test(p)))];
        const welt = pfade.filter((p) => WELT_GELADEN.test(p));
        const ratsche = ENGINE_RATSCHE[id];
        if (welt.length)
            rot.push(`H6 ${id}: die Seite lädt die Welt (${welt.slice(0, 2).join(", ")}) — ein Studio bleibt die isolierte Bühne, nie ein Modus der offenen Welt`);
        if (fremd.length && !ratsche)
            rot.push(`H6 ${id}: die Seite lädt eine fremde Engine (${fremd.slice(0, 3).join(", ")}) statt der EINEN der Welt (${ENGINE_EINE}, r184)`);
        else if (!fremd.length && ratsche)
            rot.push(`H6 ${id}: lädt keine fremde Engine mehr (${ratsche} fiel) — die Ratsche zieht an, ${id} fällt aus ENGINE_RATSCHE`);
        else if (!fremd.length && pfade.some((p) => /^\/vendor\/three/.test(p)) && !pfade.includes(ENGINE_EINE))
            rot.push(`H6 ${id}: three aus vendor/ ohne ${ENGINE_EINE} — die Welt rendert WebGPU r184`);
    }
    for (const [id, { folge: f, kosten }] of Object.entries(seiten)) {
        if (kosten && !OFEN_STUDIOS[id] && id !== "klang" && !(kosten[0] || {}).werkWelt) rot.push(`H10 ${id}: kein Maß des Werks`);
        const fehl = f && (f[0] === f[1] ? 1 : VERLAUF.concat(0, 0).findIndex((_, i) => f[i] !== f[i % 2])); // der erste Schritt, der nicht wechselt
        if (!f && STUDIOS.includes(id)) rot.push(`H3 ${id}: das Studio trägt keine Sitzung (kein Hüllen-Schieber mit Strg+Z)`);
        else if (fehl > 0) rot.push(`H3 ${id}: ${VERLAUF[fehl - 2] || "der Zug"} wirkt nicht (${folgeText(f)}) — der Verlauf der Hülle geht am Schieber vorbei`);
        const [k0 = {}] = kosten || [];
        if (OFEN_STUDIOS[id] && !(+k0.leiste <= +k0.deckel))
            rot.push(`H4 ${id}: Labor L0 ${k0.leiste} △ über der Welt-Zeile ${k0.deckel} — das Labor zeigt nicht den Ofen-Körper`);
    }
    return rot;
}
// H5 — DAS ZIEL-BILD (D8, „Das Tor als Fenster"): jede Welt der Hülle rendert ihr Panorama in IHRER Welt (die Brücke
// `panorama-bitte` → `AnazhHuelle.panorama`, Labor = Welt), gebacken je SHA ihrer Quellen (`--panorama`) und geliefert als
// Datei; die Heimat liest sie (stamm `_torZielBuendel`) und bootet nie eine Ziel-Welt. Die Karte `worlds/tor-ziele.json` nennt je
// Welt Datei und Stempel = SHA-256 über index.html und jede lokale Quelle, die sie lädt (Skript, Stil; `?v=` fällt — die
// Version allein macht kein neues Bild). Ein Stempel, der nicht die Quellen von HEUTE trägt, ist ROT beim Namen; die
// ausgenommenen Welten stehen benannt unter `ohne`.
const TOR_ZIELE = "worlds/tor-ziele.json";
// Ohne Ziel-Bild, benannt: die sandgesicherten Welten (kein Skript, kein Renderer) und die übersetzte Welt (ihre Szene ist
// Spieler-Daten und reist erst im enter — vor dem Betreten hat sie kein Bild; jedes Tor auf sie zeigt kein Fenster).
const OHNE_PANORAMA = Object.assign(
    { translated: "die Szene ist Spieler-Daten und reist erst im enter (stamm PORTAL_TRANSLATED_WORLD) — vor dem Betreten kein Bild" },
    AUSGENOMMEN
);
const PANO = { format: 1, w: 512, h: 256 };
const panoDatei = (id) => `worlds/${id}/panorama.f16`;
const seite = (id) => `worlds/${id}/index.html`; // der Schlüssel einer Welt (Export, Gang, Rahmen)
// Die Quellen einer Welt in der Reihe ihrer index.html (rel zur Wurzel); `lies(rel)` liest Text (die Karte oder die Platte).
function quellenDerWelt(id, lies) {
    const basis = `worlds/${id}`;
    const html = lies(seite(id));
    if (html == null) return null;
    const rels = [seite(id)];
    const re = /<script\b[^>]*\bsrc\s*=\s*["']([^"'?#]+)|<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*\bhref\s*=\s*["']([^"'?#]+)/gi;
    for (let m = re.exec(html); m; m = re.exec(html)) {
        const q = m[1] || m[2];
        if (/^(?:[a-z][\w+.-]*:)?\/\//i.test(q)) continue;
        const rel = path.posix.normalize(path.posix.join(basis, q));
        if (!rels.includes(rel)) rels.push(rel);
    }
    return rels;
}
function panoramaStempel(id, lies) {
    const rels = quellenDerWelt(id, lies);
    if (!rels) return null;
    const h = crypto.createHash("sha256");
    h.update(`panorama ${PANO.format} ${PANO.w}x${PANO.h}\n`);
    for (const rel of rels) {
        const t = lies(rel);
        if (t == null) return null;
        h.update(`${rel}\n${stammLib.sha(t.replace(/\?v=[\w.-]+/g, ""))}\n`);
    }
    return h.digest("hex");
}
const liesAus = (karte) => (rel) => {
    if (rel in karte) return karte[rel];
    const f = path.join(ROOT, rel);
    return fs.existsSync(f) ? ausDatei(f) : null;
};

// Die Werkstatt-Dateien des Stamms: die Dateien, die die Regler-Glieder der Werkstatt tragen (am Glied, nie am Datei-Namen).
const REGLER_GLIED = "_workshopRenderStudioParams";
const WERKSTATT = new Set(["_workshopRenderRecipePanel", REGLER_GLIED].map((m) => stammLib.dateiVon(ROOT, m)));
// Der Baum als Text-Karte (rel → Inhalt): die Wand und ihr Selbsttest lesen DIESELBE Karte.
function baum() {
    const karte = {};
    const w = path.join(ROOT, "worlds");
    for (const id of fs.readdirSync(w)) {
        const d = path.join(w, id);
        if (!fs.statSync(d).isDirectory()) continue;
        for (const f of fs.readdirSync(d)) {
            if (!/\.(html|js)$/.test(f)) continue;
            karte[`worlds/${id}/${f}`] = ausDatei(path.join(d, f));
        }
    }
    for (const rel of WERKSTATT) karte[rel] = ausDatei(rel);
    karte[TOR_ZIELE] = liesAus({})(TOR_ZIELE);
    return karte;
}

// H12 DIE RUHE DER WELT (w28-studio-seiten): die Tor-Seite auf der EINEN Bühne zeigt jeden Flügel in der Pose der Welt, solange der
// Nutzer nichts drückt — der Flügel-Rückruf der Bühne (`buehne.fluegel(g, act)`, huelle.js) reicht je Flügel die Ruhe der Welt
// (`_tuerFernAnteil`), die Seite gibt sie zurück. VERHALTEN, nicht Text: porta.js läuft im vm gegen die Hülle als Attrappe (sie
// fängt `studio(o)` und den Rückruf), drei Takte ohne Taste müssen die Ruhe zurückgeben, E öffnet die Vorderflügel von der Ruhe
// aus, die Hinterflügel bleiben in ihr. Bis zu diesem Schnitt schrieb jeder Takt `doorAngle 0 / DOOR_OPEN` — das Tor stand zu.
const RUHE_PROBE = 0.37;
function torRuhe(text) {
    const vm = require("vm");
    let o = null,
        act = null;
    const el = () => ({ children: [], appendChild() {}, classList: { toggle() {} }, textContent: "", onclick: null });
    const tasten = [];
    const buehne = { renderer: {}, fluegel: (g, a) => (act = a), passageTakt() {}, passage: () => new Promise(() => {}), passageFort() {} };
    const H = {
        studio: (x) => ((o = x), { szene: {}, kamera: {}, kugel: {}, buehne, teller: { add() {} }, wecke() {}, steht: new Promise(() => {}), kopf: null, bau: () => new Promise(() => {}) }),
        sitzung: () => ({ leiste() {}, schritt: (f) => f(), wuerfeln() {} }),
        regler: () => ({ setzen() {} }),
        kosten: () => ({ neu() {} }),
        bruecke() {},
        knopfMitText() {},
    };
    const PC = { PRESETS: { kathedrale: { lab: "Kathedrale", s: {} } }, PARAMS_BY_KIND: { gate: [] }, TUER_GESETZ: { offen: 1.95 }, PORTAL_RENDER_CONFIG: { lod: { budget: {}, kindStages: {} } }, deriveGate: () => ({}), gateParams: () => ({}) };
    const doc = { getElementById: (id) => (id === "law" || id === "doorPrompt" ? null : el()), createElement: el };
    const welt = { AnazhHuelle: H, document: doc, addEventListener: (n, f) => n === "keydown" && tasten.push(f) };
    welt.window = Object.assign(welt, { __portaCore: PC });
    try {
        vm.runInNewContext(text, welt, { filename: "worlds/portale/porta.js", timeout: 2000 });
    } catch (e) {
        return [`H12 worlds/portale/porta.js: die Seite läuft nicht gegen die Hülle (${e.message})`];
    }
    if (!o || typeof o.takt !== "function" || typeof o.nachBau !== "function") return ["H12 worlds/portale/porta.js: kein Studio auf der EINEN Bühne (AnazhHuelle.studio mit takt und nachBau)"];
    o.nachBau({});
    const lies = (zf) => (act ? (typeof act === "function" ? act({ zf }, RUHE_PROBE) : act) : undefined);
    const rot = [];
    for (let i = 0; i < 3; i++) o.takt(1 / 60);
    const [vorn, hinten] = [lies(0.2), lies(-0.2)];
    if (vorn !== RUHE_PROBE || hinten !== RUHE_PROBE)
        rot.push(`H12 worlds/portale/porta.js: ohne Taste stehen die Flügel bei ${vorn} / ${hinten} statt in der Ruhe der Welt ${RUHE_PROBE} — die Seite überschreibt die Fern-Pose (\`buehne.fluegel\`, das Argument ruhe)`);
    tasten.forEach((f) => f({ key: "e" }));
    o.takt(1 / 60);
    const [v1, h1] = [lies(0.2), lies(-0.2)];
    if (!(v1 > RUHE_PROBE && v1 < RUHE_PROBE + 0.1) || h1 !== RUHE_PROBE)
        rot.push(`H12 worlds/portale/porta.js: E öffnet nicht von der Ruhe aus (vorn ${v1}, hinten ${h1}; Soll vorn knapp über ${RUHE_PROBE}, hinten ${RUHE_PROBE})`);
    return rot;
}

function pruefe(karte) {
    const rot = [];
    if (karte["worlds/portale/porta.js"] != null) rot.push(...torRuhe(karte["worlds/portale/porta.js"]));
    // VERALTET sperrt nicht (D8-Merge, wie K5): ein Panorama, dessen Quellen sich seither änderten, steht benannt
    // „veraltet“, bis jemand backt (`--panorama`) — sonst sperrte jede Welle an einer Studio-Quelle, der Hülle oder einem Kern check:statik
    const veraltet = [];
    const zahl = { bruecken: [] };
    // H1/H2 sind Absenzen über den EINEN Helfer (stammLib.fehlt, kommentarfrei): der Text der Karte, der Täter mit Datei und
    // Zeile; ein eingespielter Täter des Selbsttests liest dieselbe Karte.
    const fehltIn = (rel, rx) => stammLib.fehlt(null, rx, { datei: rel, wandel: karte[rel] });
    for (const rel of Object.keys(karte)) {
        const m = /^worlds\/([^/]+)\//.exec(rel);
        const welt = m ? m[1] : null;
        if (welt === "huelle" || !/\.(html|js)$/.test(rel)) continue;
        const ausgenommen = welt && AUSGENOMMEN[welt];
        // H1 — Hand-Regler
        if (!fehltIn(rel, /\.html$/.test(rel) ? HAND_RANGE_HTML : HAND_RANGE_JS)) rot.push(`H1 ${stammLib.fehlt.wo}: ein Hand-Regler (der EINE Generator ist AnazhHuelle.regler)`);
        if (!welt) continue;
        // H2 — Brücken-Kopie
        if (!fehltIn(rel, READY_LITERAL)) {
            zahl.bruecken.push(welt);
            if (!ausgenommen) rot.push(`H2 ${stammLib.fehlt.wo}: eine eigene ready-Meldung (die EINE Brücke ist AnazhHuelle.bruecke)`);
        }
        // H11 — ein eigener Bühnen-Anschluss in einem Studio
        if (STUDIOS.includes(welt) && /\.js$/.test(rel) && !fehltIn(rel, EIGENE_BUEHNE))
            rot.push(`H11 ${stammLib.fehlt.wo}: ein eigener Bühnen-Anschluss (die EINE Bühne ist AnazhHuelle.buehne: der Renderer der Welt, ihr Licht an ihrer Uhr, Vorbau und Treue)`);
        if (!fehltIn(rel, ELEMENT_ADAPTER))
            rot.push(`H2 ${stammLib.fehlt.wo}: Element-Adapter op[0] (aus "gt" wird "g") — der DSL-Adapter der Hülle liest das Programm ganz`);
    }
    // H6 am Text — je Studio seine Seite gegen die Ratsche (sie zieht nur an); die Zahl: wer auf der EINEN Engine steht, wessen
    // Werk die Bühne der Welt zeichnet
    Object.assign(zahl, { eineEngine: [], werkDerWelt: [] });
    for (const id of STUDIOS) {
        const html = karte[seite(id)];
        if (html == null) continue;
        const fremd = ENGINE_FREMD_SRC.test(html);
        if (fremd && !ENGINE_RATSCHE[id]) rot.push(`H6 ${seite(id)}: lädt eine fremde Engine (${ENGINE_FREMD_SRC.exec(html)[0].replace(/^.*src\s*=\s*["']/i, "")}) statt der EINEN der Welt (${ENGINE_EINE}, r184)`);
        else if (!fremd && ENGINE_RATSCHE[id]) rot.push(`H6 ${seite(id)}: lädt keine fremde Engine mehr (${ENGINE_RATSCHE[id]} fiel) — die Ratsche zieht an, ${id} fällt aus ENGINE_RATSCHE`);
        if (!fremd && html.includes("three-bootstrap.js")) zahl.eineEngine.push(id);
        if (Object.keys(karte).some((rel) => rel.startsWith(`worlds/${id}/`) && /\.js$/.test(rel) && STUDIO_DER_WELT.test(karte[rel]))) zahl.werkDerWelt.push(id);
    }
    // H5 — das Ziel-Bild je Welt, gebacken an den Quellen von heute
    let K = null;
    try {
        K = JSON.parse(karte[TOR_ZIELE]);
    } catch (e) {
        rot.push(`H5 ${TOR_ZIELE}: ${karte[TOR_ZIELE] == null ? "fehlt" : "kein JSON (" + e.message + ")"} — node scripts/diag-studio-huelle.cjs --panorama`);
    }
    const soll = [...STUDIOS, ...NEBENWELTEN].filter((id) => !OHNE_PANORAMA[id]);
    Object.assign(zahl, { panorama: 0, soll: soll.length });
    if (K) {
        if (K.format !== PANO.format || K.w !== PANO.w || K.h !== PANO.h)
            rot.push(`H5 ${TOR_ZIELE}: Format ${K.format} ${K.w}×${K.h} statt ${PANO.format} ${PANO.w}×${PANO.h}`);
        const welten = K.welten || {},
            ohne = K.ohne || {};
        const lies = liesAus(karte);
        for (const id of soll) {
            const e = welten[seite(id)];
            const bitte = `node scripts/diag-studio-huelle.cjs --panorama ${id}`;
            if (!e) {
                rot.push(`H5 ${id}: kein Panorama im Export (${TOR_ZIELE}) — ${bitte}`);
                continue;
            }
            if (e.datei !== panoDatei(id)) rot.push(`H5 ${id}: die Datei heißt ${e.datei} statt ${panoDatei(id)}`);
            const f = path.join(ROOT, e.datei || panoDatei(id));
            const groesse = fs.existsSync(f) ? fs.statSync(f).size : -1;
            if (groesse !== PANO.w * PANO.h * 8)
                rot.push(`H5 ${id}: ${e.datei} trägt ${groesse < 0 ? "keine Datei" : groesse + " Bytes"} statt ${PANO.w * PANO.h * 8} (rgba16float ${PANO.w}×${PANO.h}) — ${bitte}`);
            const heute = panoramaStempel(id, lies);
            if (e.stempel !== heute)
                veraltet.push(`H5 ${id}: das Panorama ist veraltet (Stempel ${String(e.stempel).slice(0, 12)} ≠ Quellen ${String(heute).slice(0, 12)}) — ${bitte}`);
            else zahl.panorama++;
        }
        for (const key of Object.keys(welten))
            if (!soll.map(seite).includes(key)) rot.push(`H5 ${key}: ein Panorama ohne Welt der Hülle (verwaist)`);
        for (const [id, grund] of Object.entries(OHNE_PANORAMA))
            if (!ohne[seite(id)]) rot.push(`H5 ${id}: steht nicht benannt unter ohne (${grund})`);
        for (const key of Object.keys(ohne))
            if (!Object.keys(OHNE_PANORAMA).map(seite).includes(key)) rot.push(`H5 ${key}: unter ohne, aber keine ausgenommene Welt`);
    }
    return { rot, zahl, veraltet };
}


// ── SELBSTTEST: die Täter in die Karte gespielt (Fundstelle fehlt → rot, die Linse wandert mit dem Code) ──
function selbsttest() {
    const echt = baum();
    // je Fall [Name, Datei, Fundstelle (Text oder RegExp am Namen), Täter, Soll-Rot] bzw. [..., null, Nicht-Rot]
    const faelle = [
        ["H1 ein Hand-Regler in der garage (index.html)", "worlds/garage/index.html", '<div id="sliders"></div>', '<div id="sliders"><input type="range" id="sTaeter" min="0" max="1"></div>', /^H1 worlds\/garage\/index\.html:\d+ .*: ein Hand-Regler/],
        ["H1 ein Werkstatt-Schieber von Hand im Stamm (das Werkstatt-Modul)", stammLib.dateiVon(ROOT, REGLER_GLIED), /(_workshopRenderStudioParams\([^)]*\) \{)/, '$1\n        const _t = document.createElement("input");\n        _t.type = "range";', new RegExp(`^H1 ${stammLib.dateiVon(ROOT, REGLER_GLIED)}:\\d+ .*: ein Hand-Regler`)],
        ["H2 eine eigene ready in der schmiede", "worlds/schmiede/schmiede.js", "AnazhHuelle.bruecke(", 'window.parent.postMessage({ type: "ready", world: "schmiede" }, "*");\nAnazhHuelle.bruecke(', /^H2 worlds\/schmiede\/schmiede\.js:\d+ .*: eine eigene ready/],
        ["H2 der Element-Adapter in der klang (op[0] je Element)", "worlds/klang/klang.js", "AnazhHuelle.bruecke(", 'var __t = function (op) { return String((op && op[0]) || op || ""); };\nAnazhHuelle.bruecke(', /^H2 worlds\/klang\/klang\.js:\d+ .*: Element-Adapter/],
        ["H1 ein Hand-Regler im Gelände-Studio", GELAENDE, "AnazhHuelle.regler(", 'd.innerHTML = `<input type="range">`;\nAnazhHuelle.regler(', /^H1 worlds\/gelaende\/studio\.js:\d+ .*: ein Hand-Regler/],
        ["H2 eine eigene ready im terrain-Labor", "worlds/terrain/phytogenesis.js", "AnazhHuelle.bruecke(", 'foundryPost({ type: "ready", world: "terrain" });\nAnazhHuelle.bruecke(', /^H2 worlds\/terrain\/phytogenesis\.js:\d+ .*: eine eigene ready/],
        ["H11 die schmiede zeichnet an der Bühne der Hülle vorbei (ihr Anschluss bis w28-studio-welt)", "worlds/schmiede/schmiede.js", "BUEHNE.bild(cam);", "if(__weltLicht.buehneZeichnet(BUEHNE.welt,scene,R))R.render(scene,cam);", /^H11 worlds\/schmiede\/schmiede\.js:\d+ .*: ein eigener Bühnen-Anschluss/],
        ["H11 die garage baut ihren Renderer selbst", "worlds/garage/garage.js", "const R=BUEHNE.renderer;", "const R=new THREE.WebGPURenderer({antialias:true});", /^H11 worlds\/garage\/garage\.js:\d+ .*: ein eigener Bühnen-Anschluss/],
        ["H6 die portale lädt wieder das r128 des Labors (am Text der Seite)", "worlds/portale/index.html", '<script type="importmap">', '<script src="../terrain/lib/three-r128.min.js"></script>\n<script type="importmap">', /^H6 worlds\/portale\/index\.html: lädt eine fremde Engine \(\.\.\/terrain\/lib\/three-r128/],
        ["H6 die fachwerk lädt wieder das r128 des Labors (am Text der Seite)", "worlds/fachwerk/index.html", '<script type="importmap">', '<script src="../terrain/lib/three-r128.min.js"></script>\n<script type="importmap">', /^H6 worlds\/fachwerk\/index\.html: lädt eine fremde Engine \(\.\.\/terrain/],
        ["H12 die Tor-Seite schreibt doorAngle 0 in jeden Takt (das Tor steht zu statt in der Fern-Pose)", "worlds/portale/porta.js", "return anteil(t.zf >= 0 ? doorAngle : doorAngleB);", "return (t.zf >= 0 ? doorAngle : doorAngleB) / DOOR_OPEN;",/^H12 worlds\/portale\/porta\.js: ohne Taste stehen die Flügel bei 0 \/ 0 statt in der Ruhe/],
        ["H12 der Flügel-Rückruf verwirft die Ruhe (ruheAnteil bleibt 0)", "worlds/portale/porta.js", "ruheAnteil = ruhe;", "", /^H12 worlds\/portale\/porta\.js: ohne Taste stehen die Flügel bei 0 \/ 0/],
        ["H5 eine Quelle der garage ändert sich, ihr Panorama bleibt (veraltet)", "worlds/garage/garage.js", /$/, "\n/* ein neuer Look */", /^H5 garage: das Panorama ist veraltet/], // ankerfrei: ein Kommentar am Ende der Quelle
        ["H5 eine geteilte Quelle (die Hülle) ändert sich — jede Welt veraltet", "worlds/huelle/huelle.js", "function panorama(", "function panoramaNeu() {}\n    function panorama(", /^H5 skeleton: das Panorama ist veraltet/],
        ["H5 die Version allein macht kein neues Bild (?v= fällt) — die fachwerk bleibt grün", "worlds/fachwerk/index.html", /\?v=[0-9.]+/g, "?v=99.999.9", null, /^H5 fachwerk/],
        ["H5 der Export ohne die fachwerk", TOR_ZIELE, '"worlds/fachwerk/index.html": {', '"worlds/fachwerk-fort/index.html": {', /^H5 fachwerk: kein Panorama im Export/],
        ["H5 eine ausgenommene Welt nicht benannt (begegnung fehlt unter ohne)", TOR_ZIELE, '"worlds/begegnung/index.html":', '"worlds/begegnung-fort/index.html":', /^H5 begegnung: steht nicht benannt unter ohne/],
    ];
    let ok = true;
    const basis = pruefe(echt);
    if (basis.rot.length) {
        console.log("❌ SELBST-TEST Ausgangslage: der echte Baum ist schon rot — " + basis.rot[0]);
        ok = false;
    }
    for (const [name, rel, vor, nach, soll, nichtRot] of faelle) {
        const t = rel && echt[rel];
        const am = vor instanceof RegExp; // ein Methoden-Kopf am NAMEN (gate:apparat Klinge 3)
        if (!t || !(am ? vor.test(t) : t.includes(vor))) {
            console.log(`❌ SELBST-TEST ${name} — Fundstelle fehlt (${rel}: ${String(vor).slice(0, 40)})`);
            ok = false;
            continue;
        }
        const karte = { ...echt, [rel]: am ? t.replace(vor, nach) : t.split(vor).join(nach) };
        const r = pruefe(karte);
        if (nichtRot) {
            const falsch = r.rot.find((x) => nichtRot.test(x));
            console.log(`${falsch ? "❌" : "✅"} SELBST-TEST ${name}${falsch ? " — rot: " + falsch : ""}`);
            if (falsch) ok = false;
            continue;
        }
        const treffer = [...r.rot, ...r.veraltet].find((x) => soll.test(x));
        console.log(`${treffer ? "✅" : "❌"} SELBST-TEST ${name}${treffer ? " — " + treffer : " — nicht rot (" + (r.rot[0] || "grün") + ")"}`);
        if (!treffer) ok = false;
    }
    // H3/H4/H6 — der Spruch des Gangs (dieselbe pure Funktion): die Ratsche fremd, die garage auf der EINEN Engine
    const eine = ["/vendor/three-bootstrap.js", "/vendor/three.module.min.js", ENGINE_EINE];
    const r128 = "/worlds/terrain/lib/three-r128.min.js";
    // die Bühne der Welt liest die Liste der Seite der Welt und lädt den Stamm ohne seine Ankunft (AnazhHuelle.buehne) — GRÜN
    const buehne = [...eine, "/index.html", "/stamm/dirigent-kern.js", "/stamm/siedlung-tor.js"];
    const netz = Object.fromEntries([...STUDIOS, ...NEBENWELTEN].map((id) => [id, ENGINE_RATSCHE[id] ? [r128] : ["garage", "schmiede", "portale", "fachwerk"].includes(id) ? buehne : []]));
    // jedes Studio mit Sitzung (H3), jede Leiste unter ihrem Deckel und mit dem Maß des Werks (H4, H10), der Klang je Ort
    const zeile = { werkBuehne: 2, werkWelt: 2 };
    const wahr = (leiste, gezeichnet, stufe = 0, deckel = 62000, mehr) => ({ kosten: [{ ...zeile, stufe, leiste, gezeichnet, deckel, ...mehr }] });
    const ort = (audio) => ({ kosten: [{ stufe: "sturm", audio, audioDeckel: 2.6667 }] });
    const sitz = { folge: [..."12121212"] };
    const seiten = Object.fromEntries(STUDIOS.map((id) => [id, { ...sitz, ...(id === "klang" ? ort(0.2) : wahr(9000, 9120)) }]));
    const mit = (id, o) => ({ [id]: { ...seiten[id], ...o } });
    const gangFaelle = [
        ["H6 die garage lädt r128 aus der terrain-Familie", { garage: [r128, "/worlds/terrain/lib/OrbitControls.js"] }, /^H6 garage: die Seite lädt eine fremde Engine \(\/worlds\/terrain\/lib\/three-r128/],
        ["H6 die garage auf r184 ohne WebGPU", { garage: ["/vendor/three.module.min.js"] }, /^H6 garage: three aus vendor\/ ohne/],
        ["H6 die klang lädt das r160-UMD", { klang: ["/vendor/three.min.js"] }, /^H6 klang: die Seite lädt eine fremde Engine \(\/vendor\/three\.min\.js/],
        ["H6 die garage aufgelöst in die Welt (index.html?studio=garage)", { garage: [...buehne, "/stamm/dirigent-ankunft.js"] }, /^H6 garage: die Seite lädt die Welt \(\/stamm\/dirigent-ankunft\.js\)/],
        ["H6 die fachwerk lädt wieder r128 (sie fiel aus der Ratsche, fachwerk-buehne)", { fachwerk: [r128, ...eine] }, /^H6 fachwerk: die Seite lädt eine fremde Engine/],
        ["H6 die portale lädt wieder r128 (sie fiel aus der Ratsche, w28-studio-seiten)", { portale: [r128, ...eine] }, /^H6 portale: die Seite lädt eine fremde Engine/],
        ["H3 die garage schreibt den offenen Zug nicht (Strg+Z stumm, 83df2052)", {}, /^H3 garage: Strg\+Z wirkt nicht/, { garage: { folge: [..."122222"] } }],
        ["H3 das Strg+Umschalt+Z der portale wiederholt nicht", {}, /^H3 portale: Strg\+Umschalt\+Z wirkt/, { portale: { folge: [..."121111"] } }],
        ["H3 das Strg+Y der klang wiederholt nicht", {}, /^H3 klang: Strg\+Y wirkt nicht/, { klang: { folge: [..."121211"] } }],
        ["H3 die schmiede verliert ihre Sitzung ganz (nie still)", {}, /^H3 schmiede: das Studio trägt keine Sitzung/, { schmiede: {} }],
        ["H4 das tetrapoda-Labor zeigt 1 299 852 △ (K45)", {}, /^H4 tetrapoda: Labor L0/, mit("tetrapoda", wahr(1299852, 1299852))],
        ["H4 die Kosten-Leiste des koerperstudio nennt keine L0 (nie grün auf der leeren Zeile)", {}, /^H4 koerperstudio: Labor L0 undefined/, { koerperstudio: {} }],
        // H10 (studios.K4): die garage ohne Maß des Werks
        ["H10 die garage ohne Maß", {}, /^H10 garage: kein Maß/, mit("garage", wahr(9000, 9000, 0, 62000, { werkWelt: undefined }))],
        ["H3 A der schmiede zeigt den Zug statt der Öffnung", {}, /^H3 schmiede: A wirkt nicht/, mit("schmiede", { folge: [..."12121222"] })],
    ];
    const gangBasis = pruefeGang(netz, seiten);
    if (gangBasis.length) console.log("❌ SELBST-TEST Gang Ausgangslage: " + gangBasis[0]);
    for (const [name, patch, soll, seitenPatch] of gangFaelle) {
        const treffer = pruefeGang({ ...netz, ...patch }, { ...seiten, ...seitenPatch }).find((x) => soll.test(x));
        console.log(`${treffer ? "✅" : "❌"} SELBST-TEST ${name}${treffer ? " — " + treffer : " — nicht rot"}`);
        if (!treffer) ok = false;
    }
    // H9 — der Täter am Gesetz (Faden-Scope, three r184): ein Licht neben der Sonne (das Haupt der Matrix-Antike) und eine
    // Belichtung neben der des Gesetzes brechen laut beim Namen; dasselbe Bild zeichnet jedes Mesh nach dem Recht der Welt (die
    // Scheibe und die Glut werfen nicht, die Scheibe zeichnet in EINEM Zug, der opake Lack wirft) — den sauberen Fall zeichnen
    // garage und schmiede im Gang
    const { THREE: T, __weltLicht: L } = fadenScope(["foundry-core.js", "welt-licht.js"]);
    const werfer = (m) => Object.assign(new T.Mesh(new T.BufferGeometry(), m), { castShadow: true });
    const glut = new T.MeshStandardMaterial();
    glut.userData.__seh = "glut";
    const [scheibe, licht, lack] = [werfer(new T.MeshStandardMaterial({ transparent: true, opacity: 0.42, side: T.DoubleSide })), werfer(glut), werfer(new T.MeshStandardMaterial())];
    let h9 = "";
    try {
        L.buehneZeichnet({ sonne: 0, belichtung: 1 }, new T.Scene().add(new T.PointLight(), scheibe, licht, lack), {});
    } catch (e) {
        h9 = e.message;
    }
    const recht = !scheibe.castShadow && scheibe.material.forceSinglePass === true && !licht.castShadow && lack.castShadow && !lack.material.forceSinglePass;
    h9 += ` · Recht der Welt ${recht ? "angewandt" : "NICHT angewandt"} (Scheibe ${scheibe.castShadow ? "wirft" : "-"}/${scheibe.material.forceSinglePass ? "ein Zug" : "zwei Züge"}, Glut ${licht.castShadow ? "wirft" : "-"}, Lack ${lack.castShadow ? "wirft" : "-"})`;
    const h9ok = /ein Licht PointLight .* die Belichtung undefined statt 1 · ein Himmel neben/.test(h9) && recht;
    console.log(`${h9ok ? "✅" : "❌"} SELBST-TEST H9 ${h9}`);
    return ok && h9ok && !gangBasis.length;
}

// ── DER GANG (`--engine`, Rezept linse: lokal die GPU, CI swiftshader): je Seite der Hülle EIN Besuch im echten Browser —
// ihre Anfragen (H6), ihre Sitzung (H3) und bei einem Ofen-Studio die L0 der Kosten-Leiste (H4); Spruch: `pruefeGang`. Den
// Schuss einer Seite macht `werkbank start --echt --seite <url>` + `werkbank schirm`; das Gelände-Panel über der Welt bedient
// gate:gelaende-studio Regler für Regler.
async function gang() {
    const s = statikServer();
    await s.lausche(PORT);
    const browser = await starteBrowser({ art: "linse", frist: 120000 });
    const netz = {},
        seiten = {};
    let sauber = 0;
    // STUDIO_HUELLE_NUR=a,b: der Gang über dieselben Seiten allein
    const nur = (process.env.STUDIO_HUELLE_NUR || "").split(",").filter(Boolean);
    try {
        for (const id of [...STUDIOS, ...NEBENWELTEN].filter((x) => !nur.length || nur.includes(x))) {
            const page = await browser.newPage();
            const pfade = (netz[id] = []); // jeden Seitenfehler nennt der EINE Sammler der Weiche (welt-boot), der Lauf wird rot
            page.on("request", (q) => pfade.push(new URL(q.url()).pathname));
            // die Seite steht an IHREM Ereignis, nie an der Wanduhr: eine Nebenwelt lädt ihre Engine im statischen Graphen der Seite
            // (Skript-Marken und statische Modul-Importe — vollständig bei `load`, ihre Brücke fragt keine Datei), ein Studio steht
            // an seiner Kosten-Leiste (das EINE Warten unten: die Zeile trägt ihr Maß erst nach Bühne und Werk)
            await s.zeige(page, 90000, seite(id), "load");
            // H4 + H10: die Kosten-Leiste je Stufe (gezählt, gezeichnet, Deckel) bzw. je Ort (Audio-Graph-ms) — gelesen im STAND
            // DER ÖFFNUNG, vor dem ersten Zug (H3), sobald jede Zeile ihre Gegenzahlen, ihre Zeit und ihre Deckel trägt (das Ofen-Labor
            // erst nach dem Backen); das EINE Warten (welt-boot `waitFor`): ein Hänger endet an der Frist des Browsers, die Stall-Akte
            // nennt die Seite. Bis hier las die Wand NACH dem Zug: ob die Zeilen dann den Bau des Zugs trugen oder noch den der Öffnung,
            // entschied das Tempo (Radeon mit Bank: die Öffnung, swiftshader: der Zug) — H10 urteilte das Rennen, nie das Werk.
            const zeilen = () => [...document.querySelectorAll(".h-kosten-zeile")].map((e) => ({ ...e.dataset }));
            let kosten = null;
            if (STUDIOS.includes(id)) {
                await waitFor(page, `(${zeilen})().every((k) => k.fertig)`, `${id}: jede Zeile der Kosten-Leiste mit Gegenzahl, Zeit und Deckel`);
                kosten = await page.evaluate(zeilen);
            }
            // H3: der Spieler zieht und greift im selben Atemzug die Tasten des VERLAUFs (kein Bild, keine Ruhe dazwischen), je
            // Taste am LEBENDEN Schieber seiner Zeile (die schmiede baut ihre Leiste im Rückweg neu — ein abgehängter trüge nie ans Fenster)
            const z = (seiten[id] = await page.evaluate((verlauf) => {
                const erst = [...document.querySelectorAll(".h-regler input")].find((i) => !i.disabled && i.closest("[data-sitzung]"));
                if (!erst) return {};
                const rid = erst.closest("[data-regler]").dataset.regler,
                    vor = erst.value;
                const inp = () => document.querySelector(`[data-sitzung] [data-regler="${rid}"] input`);
                erst.value = String(+vor === +erst.max ? erst.min : erst.max);
                erst.dispatchEvent(new Event("input", { bubbles: true }));
                const nachTaste = (n) => (
                    n.length < 2
                        ? document.querySelector(`[data-ab="${n}"]`).click()
                        : inp().dispatchEvent(new KeyboardEvent("keydown", { key: n.slice(-1).toLowerCase(), ctrlKey: true, shiftKey: n.includes("Umschalt"), bubbles: true })),
                    inp().value
                );
                return { folge: [vor, erst.value, ...verlauf.map(nachTaste)] };
            }, VERLAUF));
            if (kosten) z.kosten = kosten;
            await page.close();
            const fremd = [...new Set(pfade.filter((p) => ENGINE_FREMD.test(p)))];
            sauber += !fremd.length;
            const engine = fremd.length ? "fremd " + fremd.join(" ") : pfade.includes(ENGINE_EINE) ? "r184 WebGPU" : "ohne three";
            const sitzung = z.folge ? folgeText(z.folge) : "ohne Sitzung"; // den Spruch fällt pruefeGang
            console.log(`  ${id.padEnd(14)} ${String(pfade.length).padStart(3)} Anfragen · ${engine} · ${sitzung}${z.kosten ? " · Kosten " + JSON.stringify(z.kosten) : ""}`);
        }
    } finally {
        await browser.close();
        s.close();
    }
    const rot = pruefeGang(netz, seiten);
    for (const x of rot) console.log("❌ " + x);
    console.log(`${rot.length ? "❌" : "✅"} DER GANG: ${sauber} von ${Object.keys(netz).length} Seiten ohne fremde Engine · ${Object.values(seiten).filter((z) => z.folge).length} Sitzungen`);
    if (rot.length) process.exitCode = 1;
}

// ── DAS ZIEL-BILD BACKEN (H5, `--panorama [welt,…]`): je Welt der Hülle ihre Seite in einem Rahmen (die Heimat ist eine leere
// Seite derselben Herkunft), ihre Brücke meldet `ready`, die Welt wächst, dann `panorama-bitte` → `panorama` (Halbfloat-Texel aus
// IHREM Renderer, `AnazhHuelle.panorama`). Die Datei `worlds/<welt>/panorama.f16` (rgba16float 512 × 256, Zeile 0 unten) und ihr
// Stempel in `worlds/tor-ziele.json`. Das Ziel-Bild ist ein Bild-Urteil (Lehre 17): es backt die echte GPU unter dem GPU-Schloss,
// ein Software-Adapter (swiftshader, LINSE_GPU=software) bricht laut. Port STUDIO_HUELLE_PORT (8742).
async function panoramaBacken(nur) {
    const s = statikServer({ seiten: { "/__panorama.html": '<!DOCTYPE html><meta charset="utf-8"><title>Panorama</title><body style="margin:0"></body>' } });
    await s.lausche(PORT);
    const kp = path.join(ROOT, TOR_ZIELE);
    const K = fs.existsSync(kp) ? jsonLesen(kp) : {};
    const neu = { format: PANO.format, w: PANO.w, h: PANO.h, welten: K.welten || {}, ohne: {} };
    for (const [id, grund] of Object.entries(OHNE_PANORAMA)) neu.ohne[seite(id)] = grund;
    for (const k of Object.keys(neu.welten)) if (!k.startsWith("worlds/") || OHNE_PANORAMA[k.split("/")[1]]) delete neu.welten[k];
    const browser = await starteBrowser({ art: "webgl", frist: 300000, zusatz: ["--window-size=1400,900"] });
    const lies = liesAus({});
    let rot = 0;
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 900 });
        await s.zeige(page, undefined, "__panorama.html", "load");
        const adapter = String(browser.adapter.renderer || browser.adapter.fehlt); // die Adapter-Zeile der Weiche ([linse-gpu])
        if (!istHardwareAdapter(browser.adapter)) throw new Error(`Panorama auf ${adapter}: das Ziel-Bild backt die echte GPU (Lehre 17)`);
        for (const id of [...STUDIOS, ...NEBENWELTEN]) {
            if (OHNE_PANORAMA[id] || (nur && !nur.includes(id))) continue;
            const t0 = Date.now();
            const reift = ["koerperstudio", "fachwerk", "terrain"].includes(id) ? 9000 : 4000;
            try {
                const P = await page.evaluate(
                    (url, reift, frist) =>
                        new Promise((ja, nein) => {
                            const f = document.createElement("iframe");
                            f.style.cssText = "position:fixed;left:0;top:0;width:1280px;height:720px;border:0";
                            const reqId = `backen-${Date.now()}`;
                            const ende = (e, x) => {
                                clearTimeout(uhr);
                                removeEventListener("message", hoer);
                                f.remove();
                                if (e) nein(e);
                                else ja(x);
                            };
                            const hoer = (ev) => {
                                if (ev.source !== f.contentWindow) return;
                                const m = ev.data;
                                if (!m || typeof m !== "object") return;
                                if (m.type === "ready")
                                    setTimeout(() => f.contentWindow.postMessage({ type: "panorama-bitte", reqId }, "*"), reift);
                                else if (m.type === "panorama" && m.reqId === reqId) {
                                    if (m.fehler) return ende(new Error(`die Welt meldet: ${m.fehler}`));
                                    const u8 = new Uint8Array(m.daten.buffer, m.daten.byteOffset, m.daten.byteLength);
                                    let b = "";
                                    for (let i = 0; i < u8.length; i += 0x8000) b += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
                                    ende(null, { w: m.w, h: m.h, b64: btoa(b) });
                                }
                            };
                            const uhr = setTimeout(() => ende(new Error(`kein Panorama nach ${frist / 1000} s`)), frist);
                            addEventListener("message", hoer);
                            f.src = url;
                            document.body.appendChild(f);
                        }),
                    "/" + seite(id),
                    reift,
                    180000
                );
                const buf = Buffer.from(P.b64, "base64");
                if (P.w !== PANO.w || P.h !== PANO.h || buf.length !== PANO.w * PANO.h * 8)
                    throw new Error(`das Panorama trägt ${P.w}×${P.h} (${buf.length} Bytes) statt ${PANO.w}×${PANO.h}`);
                const u16 = new Uint16Array(buf.buffer, buf.byteOffset, buf.length / 2);
                let hell = 0;
                for (let i = 0; i < u16.length; i += 4) if ((u16[i] & 0x7fff) + (u16[i + 1] & 0x7fff) + (u16[i + 2] & 0x7fff) > 0) hell++;
                if (hell < (PANO.w * PANO.h) / 4) throw new Error(`das Panorama ist leer (${hell} Texel mit Licht)`);
                fs.writeFileSync(path.join(ROOT, panoDatei(id)), buf);
                neu.welten[seite(id)] = { datei: panoDatei(id), stempel: panoramaStempel(id, lies), adapter };
                console.log(`  ✅ ${id.padEnd(14)} ${panoDatei(id)} · ${((Date.now() - t0) / 1000).toFixed(1)} s · ${hell} Texel mit Licht`);
            } catch (e) {
                rot++;
                console.log(`  ❌ ${id.padEnd(14)} ${fehlerText(e)} (die Seitenfehler nennt der Sammler der Weiche)`);
            }
        }
    } finally {
        await browser.close();
        s.close();
    }
    neu.welten = Object.fromEntries(Object.entries(neu.welten).sort());
    jsonSchreiben(kp, neu, 4, "\n");
    if (rot) process.exitCode = 1;
}

hauptLauf(async () => {
    const a = process.argv;
    if (a.includes("--panorama")) {
        const n = a[a.indexOf("--panorama") + 1];
        await panoramaBacken(n && !n.startsWith("--") ? n.split(",") : null);
        return;
    }
    if (a.includes("--engine")) return gang();
    if (a.includes("--selftest")) process.exit(selbsttest() ? 0 : 1);
    const { rot, zahl, veraltet } = pruefe(baum());
    console.log("Studio-Hülle: H1 Hand-Regler · H2 Brücken-Kopie · H3 Umstieg (Studios: " + STUDIOS.join(", ") + "; Nebenwelten: " + NEBENWELTEN.join(", ") + ")");
    console.log(`  eigene ready-Meldungen: ${zahl.bruecken.length} (${zahl.bruecken.join(", ") || "—"}) + die EINE der Hülle`);
    console.log(`  EINE Engine (H6): ${zahl.eineEngine.length} von ${STUDIOS.length} Studios (${zahl.eineEngine.join(", ")}) · das Werk der Welt auf der Bühne (AnazhHuelle.studio): ${zahl.werkDerWelt.length} von ${STUDIOS.length} (${zahl.werkDerWelt.join(", ") || "—"})`);
    console.log(`  Ziel-Bild (H5): ${zahl.panorama} von ${zahl.soll} Panoramen an den Quellen von heute (${TOR_ZIELE}), ohne: ${Object.keys(OHNE_PANORAMA).join(", ")}`);
    for (const x of veraltet) console.log("⚠ " + x + " (benannt, sperrt nicht)");
    wandEnde(rot, `gate:studio-huelle: ${STUDIOS.length} Studios + ${NEBENWELTEN.length} Nebenwelten auf der EINEN Hülle, kein Hand-Regler, keine Brücken-Kopie`);
});
