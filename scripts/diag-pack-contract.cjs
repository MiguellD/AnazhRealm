// diag-pack-contract.cjs — DIE PACK-KANON-LINSE (N3, `npm run gate:pack-contract`).
//
// Drei Prüfungen (a–b statisch, d der eine Browser-Beweis):
//   (a) `spec/pack/v0/CONTRACT.md` existiert + trägt die Pflicht-Abschnitte (v0-Ist-Kanon ·
//       v1-Schema · must-ignore · Ship-Hook · Ü1/Ü2-Chokepoint).
//   (b) Absenz: keine Labor-Shell reist in den Platten-Stempel; die Stempel-Formel beweist gate:fluss.
//   (d) Browser: EIN Preset (eiche, lod 2) live minten → Artefakt zurücklesen → byte-gleich
//       zum Live-Reply (sha256 je Puffer, UNABHÄNGIG vor der b64-Kodierung gerechnet) + der
//       Hook VERHALTENS-bewiesen (false → null trotz ready-Worker; weg → Meshes).
//
//   --selftest: der Detektor ist NICHT vakuös — ein synthetisches Pack wird geschrieben,
//   korrumpiert (ein Byte geflippt bzw. gekürzt) und MUSS rot vergleichen.
//
//   node scripts/diag-pack-contract.cjs --selftest && node scripts/diag-pack-contract.cjs
"use strict";

const PK = require("./lib/pack-kanon.cjs");
const { loesche, tempNeu, hauptLauf, urteilEnde, ausDatei, SELBSTTEST, path, fs, stammLib, ENGINE_MODUL, ENGINE_THREE } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.PACK_GATE_PORT || 4562);
const CONTRACT = path.join(PK.ROOT, "spec", "pack", "v0", "CONTRACT.md");

let fails = 0;
function check(ok, label) {
    console.log(`  ${ok ? "✅" : "❌"} ${label}`);
    if (!ok) fails++;
    return ok;
}

// ---------------------------------------------------------------------------
// --selftest (Node-pur): ein korruptes Pack-Artefakt MUSS rot vergleichen.
async function selftest() {
    console.log("=== PACK-CONTRACT SELBST-TEST (der Detektor feuert) ===");
    const tmp = tempNeu("pack-selftest");
    try {
        // Synthetischer „Live-Reply": kleine bekannte Puffer, sha256 in Node als Browser-Wahrheit.
        const pos = Buffer.from(new Float32Array([0.5, -1.25, 3.75, 2, 4, 8]).buffer);
        const idx = Buffer.from(new Uint32Array([0, 1, 2]).buffer);
        const ser = {
            presetId: "synthetik",
            seed: 1,
            lod: 2,
            meshes: [
                {
                    kind: "bark",
                    mat: { roughness: 0.93 },
                    attrs: {
                        position: {
                            itemSize: 3,
                            type: "Float32Array",
                            bytes: pos.length,
                            b64: pos.toString("base64"),
                            sha256: stammLib.sha(pos),
                        },
                    },
                    index: {
                        type: "Uint32Array",
                        bytes: idx.length,
                        b64: idx.toString("base64"),
                        sha256: stammLib.sha(idx),
                    },
                },
            ],
        };
        const file = PK.writePack(tmp, PK.packFromReply(ser, { kind: "tree", coreId: "phyto" }));
        check(PK.comparePackToReply(PK.readPack(file), ser).length === 0, "sauberes Pack vergleicht grün");
        // Korruption 1: ein Byte im position-Puffer geflippt → sha256-Divergenz MUSS feuern.
        const bad = PK.readPack(file);
        const buf = Buffer.from(bad.meshes[0].attrs.position.b64, "base64");
        buf[4] ^= 0xff;
        bad.meshes[0].attrs.position.b64 = buf.toString("base64");
        fs.writeFileSync(file, JSON.stringify(bad));
        const d1 = PK.comparePackToReply(PK.readPack(file), ser);
        check(
            d1.some((x) => /position: sha256-Divergenz/.test(x)),
            `korruptes Byte → rot (${d1[0] || "kein Diff!"})`
        );
        // Korruption 2: gekürzter index-Puffer → Byte-Längen-Divergenz MUSS feuern.
        const bad2 = PK.readPack(file);
        bad2.meshes[0].attrs.position.b64 = pos.toString("base64");
        bad2.meshes[0].index.b64 = idx.subarray(0, 8).toString("base64");
        fs.writeFileSync(file, JSON.stringify(bad2));
        const d2 = PK.comparePackToReply(PK.readPack(file), ser);
        check(
            d2.some((x) => /index: Byte-Länge/.test(x)),
            `gekürzter Puffer → rot (${d2[0] || "kein Diff!"})`
        );
    } finally {
        loesche(tmp);
    }
    // der Boot-Lauf ist nicht vakuös: ein Manifest ohne core.bruecke lässt Laden und Stempel rot werden
    const ohne = JSON.stringify(PK.readManifest(PK.ROOT).map((c) => Object.assign({}, c, { bruecke: undefined })));
    const t = await bootLauf(ohne);
    check(t.laden !== t.sollLaden && t.stempel !== t.sollStempel, "Täter-Manifest ohne core.bruecke → Laden und Stempel rot");
    // … und ein Manifest, das dem Faden eine zweite Engine mitgibt (die r128-lib bis w5-pipeline), bricht beim Namen
    const z = await bootLauf(JSON.stringify(PK.readManifest(PK.ROOT).map((c) => ({ ...c, lib: ["x.js"] }))));
    check(/trägt lib/.test(z.fehler), "Täter-Manifest mit lib → ROT beim Namen");
    // … und ein Start, der der Schale den Text des Buchs nicht reicht: ihr Abruf der Blob-Adresse fällt, die Platte fällt LAUT
    const anker = "hole: (u) => (texte.has(u) ? texte.get(u) : spaeter(u)),";
    let stand = false;
    const stumm = await bootLauf(ausDatei(path.join(PK.ROOT, "cores.manifest.json")), {
        buch: buchEintrag(),
        wandel: (b) => ((stand = b.includes(anker)), b.replace(anker, "hole,")),
    });
    check(stand, "Selbst-Test-Anker steht im Boot-Blob: der Start reicht der Schale den Text des Buchs");
    check(
        stumm.posts.some((m) => m && m.type === "platte-fiel" && /blob:/.test(String(m.grund))) && stumm.stempel !== stumm.sollStempel + "\n\n" + BUCH_QUELLE,
        "Täter-Start ohne den Text des Buchs → die Platte fällt LAUT beim Namen (platte-fiel), kein Stempel"
    );
    urteilEnde(fails, "\n❌ SELBST-TEST ROT — der Detektor ist vakuös.", "\n✅ SELBST-TEST GRÜN — ein korruptes Pack-Artefakt wird sicher rot.");
}

// EIN GESETZBUCH DES SPIELERS, wie die Bibliothek es dem Faden reicht (`_bibliothekBuecher`: code · kanon · sig · autor): der
// Quelltext deflate-raw in base64 im signierten Kanon, die Signatur Ed25519 über die Bytes des Kanons, der Schlüssel frisch.
const BUCH_QUELLE = "self.__probeCore = { PRESETS: {} };";
function buchEintrag(quelle = BUCH_QUELLE) {
    const K = require("crypto");
    const { publicKey, privateKey } = K.generateKeyPairSync("ed25519");
    const kanon = JSON.stringify({ buch: require("zlib").deflateRawSync(Buffer.from(quelle, "utf8")).toString("base64") });
    const sig = K.sign(null, Buffer.from(kanon, "utf8"), privateKey).toString("hex");
    return { code: "probe-buch", kanon, sig, autor: Buffer.from(publicKey.export({ format: "jwk" }).x, "base64url").toString("hex") };
}

// DER BOOT ALS LAUF (B3a): die Geburt des Wirts (`_ensureAssetFoundry` der echten Klasse im vm, `ladeKlasse`) baut den
// Boot-Blob synchron, und der Blob läuft in einem Schein-Faden, der das Manifest `text` und jede Quelle über den EINEN
// synchronen Abruf des Fadens liefert (`_foundryHole`, w28-foundry-frueh), Engine (das import() ihres Blob-Moduls — die
// Engine der Welt, three r184, beim Namen), Laden und Digest mitschreibt. Das Soll kommt aus dem echten Manifest und der
// Import-Karte von index.html; ohne Blob bei der Geburt nennt `fehler` den Täter.
// MIT EINEM BUCH DES SPIELERS (`buch`: ein signierter Eintrag der Bibliothek, `buchEintrag`; w28-weltbild-kalt): der Schein prüft
// die Signatur und packt aus wie der Faden (WebCrypto, DecompressionStream), sein importScripts führt die Blob-Quelle aus, und
// sein XMLHttpRequest wirft an einer Blob-Adresse wie die CSP der Seite — die Schale stempelt das Buch nur, wenn der Start ihr
// den Text reicht, den er hält. `wandel` färbt den Boot-Blob (der Täter im Selbsttest).
async function bootLauf(text, { buch = null, wandel = null } = {}) {
    const vm = require("vm");
    const { AnazhRealm: A, ctx } = stammLib.ladeKlasse(PK.ROOT);
    const g = vm.runInContext("globalThis", ctx);
    const aus = { geburt: null, fehler: null, laden: null, stempel: null, wand: false, posts: [] };
    let blob = null;
    Object.assign(g, { indexedDB: {}, crypto: { subtle: {} }, location: { href: "http://wirt/index.html" } });
    g.document = { querySelector: () => ({ textContent: JSON.stringify({ imports: { three: "." + ENGINE_MODUL() } }) }), querySelectorAll: () => [] }; // prettier-ignore
    g.Blob = function (teile) { blob = teile.join(""); }; // prettier-ignore
    g.URL = class extends URL { static createObjectURL() { return "blob:boot"; } }; // prettier-ignore
    // DIE QUELLE DES WIRTS (w28-faden-quelle): der Wirt holt jede Datei des Fadens EINMAL (`_fadenSkript`) — sein Abruf antwortet
    // im Schein das Manifest `text`, je Quelle `<url>`; seine Blobs tragen die Adresse und ihren Text, und jede Nachricht `quelle`
    // an den Faden erreicht dessen Hörer (in ihrer Folge, gehalten bis der Faden steht)
    const hoerer = [], vorFaden = [];
    const reiche = (m) => { let halt = false; const ev = { data: m, stopImmediatePropagation: () => (halt = true) }; for (const h of hoerer.slice()) { if (halt) break; h(ev); } }; // prettier-ignore
    g.fetch = (u) => Promise.resolve({ ok: true, status: 200, blob: () => Promise.resolve({ adresse: String(u), satz: /cores\.manifest\.json/.test(u) ? text : `<${u}>`, text() { return Promise.resolve(this.satz); } }) }); // prettier-ignore
    g.Worker = function (_u, o) { aus.geburt = o?.name || "ohne Namen"; this.postMessage = (m) => (hoerer.length ? reiche(m) : vorFaden.push(m)); }; // prettier-ignore
    const wirt = Object.assign(Object.create(A.prototype), { state: {}, _foundryHelfer() {}, _stoffBruch: (w, e) => e || new Error(w) }, buch ? { _bibliothekBuecher: () => [buch] } : {}); // prettier-ignore
    try { A.prototype._ensureAssetFoundry.call(wirt, true); } catch (e) { aus.fehler = e.message; } // prettier-ignore
    const echt = PK.readManifest(PK.ROOT);
    const url = (p) => new URL(p + "?v=" + A.VERSION, "http://wirt/index.html").href;
    aus.sollMotor = url(ENGINE_MODUL().slice(1)).split("?")[0];
    const liste = (feld) => echt.flatMap((c) => [].concat(c[feld] || [])).map(url);
    aus.sollLaden = ["scripts", "bruecke"].flatMap(liste).join(" ");
    const je = (c) => [...(c.scripts || []).map(url), ...(c.engine ? [aus.sollMotor] : []), ...[].concat(c.bruecke || []).map(url)].map((u) => `<${u}>`); // prettier-ignore
    aus.sollStempel = echt.map((c) => je(c).join("\n")).join("\n\n");
    if (!blob) return Object.assign(aus, { fehler: "kein Boot-Blob bei der Geburt — der Haupt-Faden holt das Manifest (fetch) vor ihr" }); // prettier-ignore
    const ord = [];
    // der Schein trägt kein fetch: ein asynchroner Abruf des Boots bricht beim Namen (`fehler`) — im Spiel stünde seine Antwort
    // hinter den Skript-Stempeln der Seite an (gate:fluss S9). Sein XMLHttpRequest antwortet synchron: das Manifest `text`,
    // je Quelle `<url>`; sein Blob trägt den Text, seine Blob-URL nennt ihn — der Lader liest daran die Datei der Engine.
    // DAS EREIGNIS DES BUCHS (die Warte-Wand: nie die Wanduhr): die Schale stempelte es, die Platte fiel, es wurde abgewiesen
    // oder der Boot brach — eines davon kommt in jedem Lauf mit Buch
    let buchKam = null;
    const buchEreignis = new Promise((r) => (buchKam = r));
    const w = { TextEncoder, TextDecoder, atob, btoa, DecompressionStream, indexedDB: {}, addEventListener: (t, h) => (ord.push(t), hoerer.push(h)), removeEventListener: (_t, h) => hoerer.includes(h) && hoerer.splice(hoerer.indexOf(h), 1), postMessage: (m) => (aus.posts.push(m), (aus.post = m), m && (m.type === "platte-fiel" || m.type === "buch-abgewiesen") && buchKam()) }; // prettier-ignore
    const kontext = vm.createContext(w);
    // eine Blob-Adresse holt der Schein nicht (die CSP der Seite: connect-src ohne blob:) — nur sein importScripts führt sie aus
    w.XMLHttpRequest = function () { this.open = (_m, u) => (this.u = u); this.send = () => { if (String(this.u).startsWith("blob:")) throw new Error("NetworkError: kein Abruf von blob: (connect-src)"); Object.assign(this, { status: 200, responseText: /cores\.manifest\.json/.test(this.u) ? text : `<${this.u}>` }); }; }; // prettier-ignore
    w.Blob = class extends Blob { constructor(teile, o) { super(teile, o); this.quelle = teile.every((x) => typeof x === "string") ? teile.join("") : null; } }; // prettier-ignore
    w.URL = class extends URL { static createObjectURL(b) { return b.adresse || "blob:" + b.quelle; } static revokeObjectURL() {} }; // prettier-ignore
    w.FileReaderSync = class { readAsText(b) { return b.satz; } }; // prettier-ignore
    w.setTimeout = (f) => { try { f(); } catch (e) { aus.fehler = e.message; buchKam(); } }; // prettier-ignore
    // die Schale (ihr Hörer) steht vor JEDEM Laden: der Halte-Hörer der Geburt und der Kanal-Hörer der Schale (die Rufe in Folge)
    w.importScripts = (...u) => {
        for (const x of u) if (String(x).startsWith("blob:")) vm.runInContext(String(x).slice(5), kontext);
        return (aus.laden = ord.length > 2 && !/nicht davor/.test(aus.laden) ? [aus.laden, ...u].filter(Boolean).join(" ") : "die Schale steht nicht davor"); // prettier-ignore
    };
    const st = [];
    const echtKrypto = require("crypto").webcrypto.subtle;
    w.crypto = { subtle: { digest: (_a, b) => (st.push(new TextDecoder().decode(b)), (aus.stempel = st.join("\n\n")), st.length > echt.length && buchKam(), new Promise(() => {})), importKey: (...a) => echtKrypto.importKey(...a), verify: (...a) => echtKrypto.verify(...a) } }; // prettier-ignore
    w.self = w.globalThis = w;
    // der Lader des Scheins: das import() des Boots (das Blob-Modul der Engine) holt den Namensraum der Engine-Datei und
    // schreibt die URL mit, deren Text der Blob trägt (vm lädt Module nur unter --experimental-vm-modules)
    w.__lader = async (u) => ((aus.motor = String(u).replace(/^blob:<(.*)>$/, "$1")), ENGINE_THREE());
    vm.runInContext((wandel ? wandel(blob) : blob).replace(/\bimport\(/, "__lader("), kontext);
    for (const m of vorFaden.splice(0)) reiche(m);
    for (let i = 0; i < 250 && !aus.fehler && (!aus.laden || st.length < echt.length); i++) await new Promise((r) => setImmediate(r)); // prettier-ignore
    // mit Buch: Signatur und Auspacken rechnen außerhalb der Umläufe des Scheins — der Lauf wartet auf das EREIGNIS des Buchs,
    // danach laufen die Digests des Stempels und die Meldungen des Starts aus (gezählte Umläufe)
    if (buch && !aus.fehler) await buchEreignis;
    for (let i = 0; buch && i < 50; i++) await new Promise((r) => setImmediate(r));
    w.postMessage({ type: "asset", meshes: [{ position: { array: new Float32Array(3) }, aWind: { array: new Float32Array(3) } }] }); // prettier-ignore
    aus.wand = !!(aus.post?.meshes[0].position && !aus.post.meshes[0].aWind);
    return aus;
}

// ---------------------------------------------------------------------------
async function main() {
    console.log("=== N3 — PACK-CONTRACT (Vertrag · Stempel · Ship-Hook · Roundtrip) ===");

    // (a) CONTRACT.md + Pflicht-Abschnitte.
    const hasContract = fs.existsSync(CONTRACT);
    check(hasContract, "spec/pack/v0/CONTRACT.md existiert");
    if (hasContract) {
        const md = ausDatei(CONTRACT);
        const sections = [
            "## v0 — Schlüssel",
            "## v0 — Wert",
            "## v0 — Stempel",
            "## v0 — Miss/Bust",
            "Der Request-Pfad + der Ship-Hook",
            "## Pack v1 — Schema",
            "must-ignore",
            "## r128→r184-Übersetzung am Chokepoint",
        ];
        for (const s of sections) check(md.includes(s), `CONTRACT.md trägt „${s}"`);
        for (const marker of [
            "<preset>|<gestalt>|<lod>",
            "bruecke_1",
            "SHA-256",
            "__anazhLiveBake",
            "LEGACY_LICHT",
            "cv",
        ])
            check(md.includes(marker), `CONTRACT.md trägt den Anker „${marker}"`);
    }

    // (b) DER BOOT ALS LAUF (B3a, `bootLauf`): Geburt, Laden, Konsum-Wand und Stempel am Lauf der echten Klasse, nie am
    // Text ihres Rumpfs — keine Labor-Datei im Faden und im Stempel; den Ship-Hook beweist (d).
    const lauf = await bootLauf(ausDatei(path.join(PK.ROOT, "cores.manifest.json")));
    check(lauf.geburt === "buch", `Boot: der Faden kommt synchron mit der Geburt und heißt „buch" (${lauf.geburt || lauf.fehler})`);
    const labor = /\/worlds\/[^/?]+\/(?!lib\/)[^?]*\.js|\/(OrbitControls|PointerLockControls|EffectComposer|UnrealBloomPass|FXAAShader)\.js/; // prettier-ignore
    check(lauf.laden === lauf.sollLaden && !labor.test(lauf.laden), "Boot: die Schale steht vor dem Studio, der Faden lädt scripts · bruecke allein aus dem Manifest, keine Labor-Datei (K42)"); // prettier-ignore
    check(lauf.motor === lauf.sollMotor, `Boot: Engine der Welt (pipeline.K5) ${lauf.motor}`); // prettier-ignore
    check(lauf.wand, "Boot: die Konsum-Wand (FOUNDRY_LESEN) reist in die Schale — ein ungelesenes Attribut fällt vor dem Transfer");
    check(lauf.stempel === lauf.sollStempel && !labor.test(lauf.stempel), "Stempel: je Kern seine scripts · engine · bruecke (Mesh-Extraktion), keine Labor-Shell (K42)"); // prettier-ignore
    // (b2) DER BOOT MIT EINEM BUCH DES SPIELERS (w28-weltbild-kalt): signiert, ausgepackt, geladen — die Schale stempelt seinen
    // Text, den der Start ihr reicht (eine Blob-Adresse holt der Faden unter der CSP der Seite nie), und die Platte fällt nicht
    const mitBuch = await bootLauf(ausDatei(path.join(PK.ROOT, "cores.manifest.json")), { buch: buchEintrag() });
    const art = (t) => mitBuch.posts.filter((m) => m && m.type === t).length;
    check(
        !mitBuch.fehler && mitBuch.stempel === mitBuch.sollStempel + "\n\n" + BUCH_QUELLE && !art("platte-fiel") && !art("buch-abgewiesen"),
        `Boot mit Buch des Spielers: die Schale stempelt den Text des Buchs, die Platte steht (${mitBuch.fehler || `platte-fiel ${art("platte-fiel")} · abgewiesen ${art("buch-abgewiesen")}`})`
    );
    if (fails) {
        console.error(`\n❌ ROT — ${fails} statische Prüfung(en) verletzt (Browser-Teil übersprungen).`);
        process.exit(1);
    }

    // (d) DER ROUNDTRIP-BEWEIS + der Hook VERHALTENS-bewiesen (ein Preset, lod 2 — klein).
    const manifest = PK.readManifest(PK.ROOT);
    const realm = await PK.bootRealm(PORT);
    const tmp = tempNeu("pack-gate");
    try {
        const rd = await PK.waitFoundryReady(realm.page);
        check(rd.ready && rd.recipeCount > 0, `Foundry ready (${rd.readyMs} ms) + Rezepte (${rd.recipeCount})`);
        if (!rd.ready) throw new Error("Foundry nicht bereit");
        await PK.installPackSerializer(realm.page);
        // Hook-Verhalten: false → null TROTZ ready-Worker (der Fallback ist übersprungen).
        const hooked = await realm.page.evaluate(async () => {
            window.__anazhLiveBake = false;
            const m = await r._foundryRequest("eiche", 5, 2);
            delete window.__anazhLiveBake; // Default wiederherstellen (die Gate-Hook-Lehre: sichern/restoren)
            return m === null;
        });
        check(hooked, "Verhalten: __anazhLiveBake=false → _foundryRequest null trotz ready-Worker");
        // Default-Pfad: Hook weg → der Worker liefert (byte-Wahrheit für den Roundtrip).
        const ser = await realm.page.evaluate(() => window.__packSer("eiche", 7, 2));
        check(
            !!(ser?.meshes && ser.meshes.length),
            `Live-Reply eiche|7|2: ${ser ? ser.meshes.length : 0} Meshes`
        );
        if (!ser) throw new Error("kein Live-Reply");
        const rec = await realm.page.evaluate(() => {
            const f = window.anazhRealm._foundry;
            const r = f?.recipes ? f.recipes.eiche : null;
            return r ? { kind: r.kind, panel: r.panel } : null;
        });
        const pack = PK.packFromReply(ser, { kind: rec ? rec.kind : undefined, coreId: PK.coreIdFor(rec, manifest) });
        check(
            pack.meta.kind === "tree" && pack.meta.coreId === manifest[0].id,
            `meta { kind:${pack.meta.kind}, coreId:${pack.meta.coreId} } aus Buch+Manifest`
        );
        const file = PK.writePack(tmp, pack);
        const back = PK.readPack(file);
        const diffs = PK.comparePackToReply(back, ser);
        let bufs = 0;
        let bytes = 0;
        for (const m of ser.meshes) {
            for (const k of Object.keys(m.attrs)) {
                bufs++;
                bytes += m.attrs[k].bytes;
            }
            if (m.index) {
                bufs++;
                bytes += m.index.bytes;
            }
        }
        check(
            diffs.length === 0,
            `Roundtrip mint→zurücklesen: ${bufs} Puffer · ${(bytes / 1024).toFixed(0)} KB byte-gleich` +
                (diffs.length ? ` (${diffs[0]})` : "")
        );
    } finally {
        loesche(tmp);
        await realm.close();
    }

    urteilEnde(fails, `\n❌ ROT — ${fails} Prüfung(en) verletzt (Pack-Kanon N3 nicht bestätigt).`, "\n✅ GRÜN — Vertrag dokumentiert · Stempel-Drift-Wand steht · Ship-Hook lebt · Roundtrip byte-gleich.");
}

if (SELBSTTEST) selftest();
else
    hauptLauf(main);
