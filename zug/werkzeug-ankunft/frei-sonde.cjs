#!/usr/bin/env node
// Aufruf: FREI_ZERLEGE=1 FREI_JSON=<lauf>.json node <ort>/frei-sonde.cjs   (der Treiber ankunft-rechnung.sh ruft sie; Schalter im Kopf unten)
// frei-sonde.cjs — dieselbe Frage wie boot-sonde.cjs, aber OHNE Puppeteer und ohne jede DevTools-Sitzung: Chrome startet als
// nackter Prozess (--headless=new, das Rezept „null“ des Tors), die Seite bekommt ihren Vorspann als Skript-Datei vom Server
// (die CSP erlaubt 'self'), pumpt sich selbst wie das Tor (≤ 6000 Takte, alle 5 ein Atem) und meldet per POST an den Server.
// Hält die DevTools-Sitzung des Geschirrs die Antwort an den Foundry-Faden, kommt sie hier sofort; hält das Spiel oder Chrome
// selbst sie, bleibt das Muster. Im Spiel-Baum rufen:  node <werkzeug>/gc/frei-sonde.cjs
const path = require("path");
const fs = require("fs");
const os = require("os");
const cp = require("child_process");
const { statikServer } = require(path.resolve("scripts/lib/welt-boot.cjs"));
const VARIANTE = process.env.FREI_VARIANTE || ""; // B Manifest synchron · C Engine synchron als Blob-Modul (variante.cjs)
const tausche = (text, v) => require(path.join(__dirname, "variante.cjs")).tausche(text, v); // nur mit FREI_VARIANTE gebraucht
const ECHT = !!(process.env.FREI_ECHT || process.env.FREI_ZERLEGE); // der echte Renderer der Karte
const ZERLEGE = !!process.env.FREI_ZERLEGE; // dazu: Lücken-Terme, lange Aufgaben, Nachrichten je Faden (→ FREI_JSON)
const dorfZug = require(path.resolve("scripts/lib/welt-orte.cjs")).messort("genesis").dorfZug;
const PORT = 4417;
const T0 = Date.now();
const anfragen = [];
let bericht = null;
// (Seite, vor jedem Skript) Null-Renderer und Ort wie das Geschirr, der Blick in den Foundry-Faden, die Pumpe des Tors, die Meldung
function VOR_SEITE(dorfZug, INIT, ECHT, ZERLEGE, INIT_MS, INIT_BIS, INIT_VON, OHNE, EINGRIFF, PLATTE, SHADER, NACH) {
    // (FREI_EINGRIFF=<datei.js>) ein Eingriff zum Messen: der Rumpf einer Funktion (P = der Prototyp, null vor der Klasse) —
    // er reist als Funktion im Vorspann-Skript (die CSP der Seite verbietet new Function)
    if (EINGRIFF) EINGRIFF(null);
    if (!ECHT) window.__anazhHeadlessNullRenderer = true; // (FREI_ECHT) der echte Renderer der Karte: das Spiel, nicht der Prüfrahmen
    window.__anazhAutoSettlement ??= dorfZug;
    const sleep = (ms) => new Promise((f) => setTimeout(f, ms));
    const fz = [];
    new BroadcastChannel("sonde").onmessage = (ev) => fz.push(ev.data);
    const VOR = function (name, ursprung, ZERLEGE, PLATTE) {
        const bc = new BroadcastChannel("sonde");
        const log = [];
        const sag = (k, x) => log.push([k, Math.round(Date.now() - ursprung), x == null ? "" : x]);
        sag("start");
        // (FREI_PLATTE=leer|atlas) der Zweit-Boot mit gefegter Platte: der Buch-Faden löscht vor der Schale jeden Schlüssel
        // (atlas: außer dem Blatt-Atlas) — seine Transaktion entsteht vor der ersten der Schale
        if (PLATTE && PLATTE !== "alles" && PLATTE !== "blob" && name === "buch") {
            const rq = indexedDB.open("anazhFoundryAssets", 1);
            rq.onupgradeneeded = () => rq.result.createObjectStore("assets");
            rq.onsuccess = () => {
                const d = rq.result;
                const tx = d.transaction("assets", "readwrite");
                const st = tx.objectStore("assets");
                let weg = 0;
                let bleibt = 0;
                st.openKeyCursor().onsuccess = (e) => {
                    const c = e.target.result;
                    if (!c) return;
                    const k = String(c.key);
                    if (k !== "__stamp" && !(PLATTE === "atlas" && k.endsWith("~blatt-atlas"))) (st.delete(c.primaryKey), weg++);
                    else bleibt++;
                    c.continue();
                };
                tx.oncomplete = () => (sag("Platte gefegt", PLATTE + ": " + weg + " weg, " + bleibt + " bleiben"), d.close());
            };
        }
        // (FREI_BLOB_PROBE, über FREI_PLATTE=blob) trägt die CSP der Seite im Faden einen Abruf von blob:? — synchron (XHR) und
        // asynchron (fetch) an einem eigenen Blob, wie die Schale die Quelle eines Gesetzbuchs des Spielers holt
        if (PLATTE === "blob" && name === "buch") {
            const u = URL.createObjectURL(new Blob(["// probe"], { type: "text/javascript" }));
            try {
                const x = new XMLHttpRequest();
                x.open("GET", u, false);
                x.send();
                sag("blob-xhr", "Status " + x.status + ", Text „" + x.responseText + "“");
            } catch (e) {
                sag("blob-xhr", "WURF " + e.name + ": " + e.message);
            }
            self.fetch(u).then(
                (r) => r.text().then((t) => sag("blob-fetch", "Status " + r.status + ", Text „" + t + "“")),
                (e) => sag("blob-fetch", "WURF " + e.name + ": " + e.message)
            );
            try {
                importScripts(u);
                sag("blob-importScripts", "lädt");
            } catch (e) {
                sag("blob-importScripts", "WURF " + e.name + ": " + e.message);
            }
        }
        // (FREI_ZERLEGE) jede Nachricht des Fadens: ← Auftrag, → Antwort, mit Art, Preset, Stufe und Weg (P Platte · B gebaut)
        if (ZERLEGE) {
            const wer = (m) => [m.presetId || "", m.lod != null ? "L" + m.lod : "", m.reqId || "", m.platte === true ? "P" : m.bau ? "B" : ""].filter(Boolean).join(" ");
            const p0 = self.postMessage.bind(self);
            self.postMessage = function (m, ...a) {
                if (m && m.type) sag("→" + m.type, wer(m));
                return p0(m, ...a);
            };
            self.addEventListener("message", (ev) => ev.data && ev.data.type && sag("←" + ev.data.type, wer(ev.data)));
        }
        const f0 = self.fetch;
        self.fetch = function (u, ...a) {
            sag("fetch", String(u).slice(-28));
            return f0.call(self, u, ...a).then((r) => {
                sag("kopf");
                const j0 = r.json.bind(r);
                r.json = () => j0().then((v) => (sag("json"), v));
                return r;
            });
        };
        const i0 = self.importScripts;
        let ersterImport = true;
        self.importScripts = function (...u) {
            if (ersterImport) sag("engine-steht (erster importScripts)");
            ersterImport = false;
            return i0.apply(self, u);
        };
        let zuletzt = Date.now();
        setInterval(() => {
            const t = Date.now();
            if (t - zuletzt > (ZERLEGE ? 250 : 600)) sag("LÜCKE der Faden-Uhr", t - zuletzt);
            zuletzt = t;
        }, 100);
        setInterval(() => log.length && bc.postMessage({ name, log: log.splice(0) }), 400);
    };
    const B0 = window.Blob;
    window.Blob = class extends B0 {
        constructor(teile, opt) {
            if (teile && typeof teile[0] === "string" && teile[0].startsWith("(function _foundryStart("))
                teile = ["(" + VOR.toString() + ")(self.name," + performance.timeOrigin + "," + (ZERLEGE ? 1 : 0) + "," + JSON.stringify(PLATTE || "") + ");\n", ...teile];
            super(teile, opt);
        }
    };
    const z = { stage: 0, wuerfe: {}, init: [], summe: {}, terme: [], lang: [], post: [], marken: {} };
    // (FREI_ZERLEGE) der Haupt-Faden: jede lange Aufgabe [ab ms, Dauer ms]; jede Nachricht an und von jedem Faden aus seiner
    // Sicht [ms, Faden, ←/→, Art]; die Marken der Ankunft (das erste Mal wahr) alle 25 ms
    if (ZERLEGE) {
        try {
            new PerformanceObserver((l) => {
                for (const e of l.getEntries()) z.lang.push([Math.round(e.startTime), Math.round(e.duration)]);
            }).observe({ type: "longtask", buffered: true });
        } catch (e) {
            z.marken.longtaskFehlt = String(e.message);
        }
        // die Pipelines der GPU: jede asynchrone Bestellung [bestellt ms, fertig ms, Etikett], jede synchrone [ab ms, Dauer ms, "sync …"]
        z.pipes = [];
        if (window.GPUDevice && GPUDevice.prototype.createRenderPipelineAsync) {
            const GP = GPUDevice.prototype;
            const [a0, s0] = [GP.createRenderPipelineAsync, GP.createRenderPipeline];
            // (FREI_SHADER) je Shader-Modul sein Text (gemerkt am Modul), je Pipeline Länge und Kennung (FNV-1a) von Vertex- und
            // Fragment-Text; die Texte der Standard-Stoffe reisen ganz mit (z.shader) — unterscheiden sich zwei Arten nur in Zahlen?
            const texte = new WeakMap();
            const m0 = GP.createShaderModule;
            GP.createShaderModule = function (d) {
                const m = m0.call(this, d);
                texte.set(m, String((d && d.code) || ""));
                return m;
            };
            const fnv = (s) => {
                let h = 0x811c9dc5;
                for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
                return h.toString(16);
            };
            z.shader = {};
            GP.createRenderPipelineAsync = function (d) {
                const e = [Math.round(performance.now()), null, String((d && d.label) || "")];
                try {
                    const [v, f] = [texte.get(d.vertex.module) || "", (d.fragment && texte.get(d.fragment.module)) || ""];
                    e.push(v.length + ":" + fnv(v), f.length + ":" + fnv(f));
                    if (SHADER && (SHADER > 1 || /MeshStandard/.test(e[2]))) for (const t of [v, f]) z.shader[t.length + ":" + fnv(t)] = t;
                } catch (err) {
                    e.push("?", String(err.message));
                }
                z.pipes.push(e);
                const p = a0.call(this, d);
                p.then(
                    () => (e[1] = Math.round(performance.now())),
                    () => (e[1] = -1)
                );
                return p;
            };
            GP.createRenderPipeline = function (d) {
                const t = performance.now();
                try {
                    return s0.call(this, d);
                } finally {
                    z.pipes.push([Math.round(t), Math.round(t + (performance.now() - t)), "sync " + String((d && d.label) || "")]);
                }
            };
        }
        const W0 = window.Worker;
        window.Worker = class extends W0 {
            constructor(u, o) {
                super(u, o);
                const n = (o && o.name) || String(u).slice(-18);
                const p0 = this.postMessage.bind(this);
                this.postMessage = (m, ...a) => (z.post.push([Math.round(performance.now()), n, "←", (m && m.type) || ""]), p0(m, ...a));
                this.addEventListener("message", (ev) => z.post.push([Math.round(performance.now()), n, "→", (ev.data && ev.data.type) || ""]));
            }
        };
        const marke = (k, wahr) => wahr && !z.marken[k] && (z.marken[k] = Math.round(performance.now()));
        setInterval(() => {
            const r = window.anazhRealm;
            const st = r && r.state;
            if (!st) return;
            marke("klasse", true);
            marke("rendererReady", st.rendererReady);
            marke("spieler", st.playerMesh);
            marke("ersterChunk", st.voxelChunks && st.voxelChunks.size > 0);
            marke("licht", st._belichtungSteht);
            marke("leib", st.playerMesh && !st._deferredAvatarSoul);
            marke("fernbild", st._fernbildDa);
            marke("weltbild", st._weltbildDa);
            marke("rundum", st._rundumDa);
        }, 25);
    }
    // (FREI_INIT) jeder Ruf des Prototyps bis Tiefe 2 unter init, der ≥ 15 ms am Stück rechnet: [Name, ab ms, Dauer ms, Tiefe]
    if (INIT || ZERLEGE || OHNE || EINGRIFF) {
        let wert,
            tiefe = 0;
        Object.defineProperty(window, "anazhRealm", {
            configurable: true,
            get: () => wert,
            set(v) {
                wert = v;
                const P = Object.getPrototypeOf(v);
                // (FREI_OHNE=name,name) ein Eingriff zum Messen: diese Glieder ruhen bis zum ersten Weltbild (ihre leere Antwort)
                if (EINGRIFF) EINGRIFF(P);
                const LEER = { _nahWieseFernTakt: () => ({ gebaut: 0, gefallen: 0, offen: 0 }), _tickNahWiese: () => 0 };
                for (const n of OHNE ? String(OHNE).split(",") : []) {
                    const f0 = P[n];
                    if (typeof f0 !== "function") throw new Error("FREI_OHNE: kein Glied " + n);
                    const leer = LEER[n] || (() => undefined);
                    P[n] = function (...a) {
                        return this.state && !this.state._weltbildDa ? leer() : f0.apply(this, a);
                    };
                }
                // (FREI_ZERLEGE) die Lücken des ersten Weltbilds, wie das Spiel sie selbst liest: jede Änderung [ms, Terme, Zeuge]
                if (ZERLEGE && typeof P._weltbildLuecken === "function") {
                    const L0 = P._weltbildLuecken;
                    let zuletzt = null;
                    P._weltbildLuecken = function (rundum) {
                        const out = L0.call(this, rundum);
                        if (rundum) return out;
                        try {
                            const sig = out.map((l) => l.term + (l.n > 1 ? " " + l.n : "") + (l.arbeitet ? "*" : "")).join(" · ");
                            // der Täter der Lücke in den Worten des Spiels (`_lueckeTaeter`): jede Änderung von Termen ODER Täter
                            const b = out.find((l) => l.zeuge);
                            const taeter = (b && this._lueckeTaeter(b)) || "";
                            if (sig + "|" + taeter !== zuletzt) {
                                zuletzt = sig + "|" + taeter;
                                z.terme.push([Math.round(performance.now()), sig, taeter]);
                            }
                        } catch (err) {
                            z.marken.termeFehler = String(err.message);
                        }
                        return out;
                    };
                }
                for (const n of INIT ? Object.getOwnPropertyNames(P) : []) {
                    const d = Object.getOwnPropertyDescriptor(P, n);
                    if (n === "constructor" || typeof d.value !== "function") continue;
                    const f = d.value;
                    d.value = function (...a) {
                        const t = performance.now();
                        tiefe++;
                        try {
                            return f.apply(this, a);
                        } finally {
                            tiefe--;
                            const dt = performance.now() - t;
                            if (tiefe <= INIT && t >= INIT_VON && t < INIT_BIS) {
                                // die Summe je Ruf und Tiefe im Fenster (jeder Ruf zählt, auch der kurze), dazu die langen einzeln
                                const k = tiefe + "|" + n;
                                const s = z.summe[k] || (z.summe[k] = [0, 0]);
                                s[0] += dt;
                                s[1]++;
                                if (dt >= INIT_MS && z.init.length < 600) z.init.push([n, Math.round(t), Math.round(dt), tiefe]);
                            }
                        }
                    };
                    Object.defineProperty(P, n, d);
                }
            },
        });
    }
    // das Buch, unabhängig von der Pumpe: alle 20 ms ab dem ersten Skript (ready und Rezepte im Wirt)
    const tBuch = setInterval(() => {
        const f = window.anazhRealm && window.anazhRealm._foundry;
        if (f && f.ready && !z.readyMs) z.readyMs = Math.round(performance.now());
        if (f && f.ready && f.recipes) (z.buchMs = Math.round(performance.now())), clearInterval(tBuch);
    }, 20);
    const melde = () =>
        fetch("/__sonde", { method: "POST", body: JSON.stringify(Object.assign({ fz, jetzt: Math.round(performance.now()), extra: window.__sondeExtra || null }, z)) }).catch(() => {});
    if (ECHT) setInterval(() => z.ende || melde(), 2000); // auch ohne Weltbild eine Meldung (Buch und Fäden)
    (async () => {
        let r;
        while (!((r = window.anazhRealm) && r.state && r.state._weltbildDa)) await sleep(50);
        const [st, f] = [r.state, r._foundry];
        z.pumpeAb = z.weltbildMs = Math.round(performance.now());
        if (ECHT) {
            // das Spiel taktet sich selbst (rAF): nur warten, bis auch das Buch offen ist, dann melden
            const t1 = performance.now();
            while (!z.buchMs && performance.now() - t1 < 45000) await sleep(50);
            try {
                const a = await navigator.gpu.requestAdapter();
                z.adapter = [a.info.vendor, a.info.architecture, a.info.device, a.info.description].filter(Boolean).join(" ");
            } catch (e) {
                z.adapter = "kein Adapter: " + e.message;
            }
            z.backend = !!(st.renderer && st.renderer.backend && st.renderer.backend.isWebGPUBackend);
            // (FREI_NACH=<ms>) so lange läuft das Spiel nach dem ersten Weltbild weiter, bevor die Sonde endet
            if (NACH > 0) await sleep(Math.max(0, z.weltbildMs + NACH - performance.now()));
            z.ende = true;
            await sleep(600);
            melde();
            return;
        }
        const terms = () => ({
            ring: st._activeRingRadius != null && st._activeRingRadius >= Math.max(1, Math.min(12, st.chunkRingRadius || 4)),
            grass: !st.pendingGrass || st.pendingGrass.size === 0,
            water: !st.pendingWaterIso || st.pendingWaterIso.size === 0,
            streu: !!st.playerMesh && r._streuWartet(st.playerMesh.position) === 0,
            biblio: !!(f && f.ready && !f._vorrat),
            luft: !!(st.scene && st.scene.fogNode),
        });
        let t = 1;
        for (; t <= 6000 && !z.stage; t++) {
            try {
                r._gameLoopTick();
            } catch (e) {
                const n = String((e && e.message) || e).slice(0, 160);
                z.wuerfe[n] = (z.wuerfe[n] || 0) + 1;
            }
            if (f.ready && !z.readyMs) z.readyMs = Math.round(performance.now());
            if (f.ready && f.recipes && !z.buchMs) z.buchMs = Math.round(performance.now());
            z.terms = terms();
            if (Object.values(z.terms).every(Boolean)) z.stage = t;
            else if (t % 5 === 0) await sleep(0);
            if (t % 500 === 0) melde();
        }
        z.takte = t - 1;
        z.pumpeMs = Math.round(performance.now() - z.pumpeAb);
        melde();
        const t1 = performance.now();
        while (!z.stage && performance.now() - t1 < 30000 && !z.spaet) {
            try {
                r._gameLoopTick();
            } catch {}
            await sleep(50);
            if (f.ready && !z.readyMs) z.readyMs = Math.round(performance.now());
            if (f.ready && f.recipes && !z.buchMs) z.buchMs = Math.round(performance.now());
            if (Object.values(terms()).every(Boolean)) z.spaet = Math.round(performance.now() - z.pumpeAb);
        }
        z.ende = true;
        await sleep(600); // die letzte Meldung des Fadens (alle 400 ms)
        melde();
    })();
}
const server = statikServer({
    seiten: {
        "/__vor.js": () => "(" + VOR_SEITE.toString() + ")(" + JSON.stringify(dorfZug) + "," + [Number(process.env.FREI_INIT || 0), ECHT ? 1 : 0, ZERLEGE ? 1 : 0, Number(process.env.FREI_INIT_MS || 15), Number(process.env.FREI_INIT_BIS || 9000), Number(process.env.FREI_INIT_VON || 0), JSON.stringify(process.env.FREI_OHNE || ""), process.env.FREI_EINGRIFF ? "function (P) {" + String.fromCharCode(10) + fs.readFileSync(process.env.FREI_EINGRIFF, "utf8") + String.fromCharCode(10) + "}" : "null", JSON.stringify(process.env.FREI_PLATTE || ""), process.env.FREI_SHADER === "alle" ? 2 : process.env.FREI_SHADER ? 1 : 0, Number(process.env.FREI_NACH || 0)].join(",") + ");",
        // (Eingriff) ein Bild der Leinwand als Daten-URL: neben FREI_JSON abgelegt als <lauf>-<name>.jpg
        "/__bild": (req) =>
            new Promise((ok) => {
                let b = "";
                req.on("data", (d) => (b += d));
                req.on("end", () => {
                    try {
                        const { name, daten } = JSON.parse(b);
                        const ziel = String(process.env.FREI_JSON || path.join(os.tmpdir(), "frei-sonde.json")).replace(/[.]json$/, "") + "-" + String(name).replace(/[^a-z0-9]/gi, "") + ".jpg";
                        fs.writeFileSync(ziel, Buffer.from(String(daten).split(",")[1] || "", "base64"));
                    } catch {}
                    ok("ok");
                });
            }),
        "/__sonde": (req) =>
            new Promise((ok) => {
                let b = "";
                req.on("data", (d) => (b += d));
                req.on("end", () => {
                    try {
                        bericht = JSON.parse(b);
                    } catch {}
                    ok("ok");
                });
            }),
    },
    wandle: (p, roh) => {
        if (/cores.manifest|three\.(module|core)|foundry-bruecke/i.test(p)) anfragen.push([Date.now() - T0, p]);
        if (VARIANTE && p === "/stamm/studio-bruecke.js" && roh) return Buffer.from(tausche(String(roh), VARIANTE));
        if (p === "/index.html" && roh) return Buffer.from(String(roh).replace("<head>", '<head><script src="/__vor.js"></script>'));
        return roh;
    },
});
server.listen(PORT, "127.0.0.1", () => {
    const profil = process.env.FREI_PROFIL || fs.mkdtempSync(path.join(os.tmpdir(), "anazh-frei-sonde-")); // FREI_PROFIL: dasselbe Profil über zwei Läufe (der Zweit-Boot)
    const exe = require("puppeteer").executablePath();
    const args = ["--headless=new", "--no-sandbox", ...(ECHT ? [...require(path.resolve("scripts/lib/software-gpu.cjs")).echteWebGpuArgs(), "--window-size=1280,720", ...(process.env.FREI_CHROME ? process.env.FREI_CHROME.split(" ") : [])] : ["--disable-gpu"]), "--user-data-dir=" + profil, "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding", "--no-first-run"].concat(process.env.FREI_TRACE ? ["--trace-startup=" + (process.env.FREI_KATEGORIEN || "loading,blink.net,net,netlog,mojom,ipc,blink.resource,devtools.timeline,blink.worker,ServiceWorker,scheduler"), "--trace-startup-file=" + process.env.FREI_TRACE, "--trace-startup-format=json", "--trace-startup-duration=" + (process.env.FREI_TRACE_S || 42)] : [], [`http://127.0.0.1:${PORT}/index.html`]);
    const kind = cp.spawn(exe, args, { stdio: "ignore" });
    const tStart = Date.now();
    const ende = () => {
        try {
            cp.execSync(`taskkill /PID ${kind.pid} /T /F`, { stdio: "ignore" });
        } catch {}
        server.close();
        const b = bericht || {};
        if (ECHT) console.log(`FREI-SONDE (echter Renderer, ohne DevTools) WELTBILD@${b.weltbildMs} · ready@${b.readyMs} · BUCH offen ab Navigation ${b.buchMs} ms · WebGPU ${b.backend} · ${b.adapter} · Variante ${VARIANTE || "A (Stand)"}${process.env.FREI_OHNE ? " · OHNE " + process.env.FREI_OHNE : ""}${process.env.FREI_EINGRIFF ? " · EINGRIFF " + path.basename(process.env.FREI_EINGRIFF) : ""}`);
        else console.log(`FREI-SONDE (ohne DevTools) ${b.stage ? "BÜHNE im Takt " + b.stage : b.spaet ? "SPÄT (Wanduhr " + b.spaet + " ms nach der Pumpe-Start)" : bericht ? "NIE / ohne Ende" : "KEINE MELDUNG der Seite"} · Pumpe ${b.takte} Takte in ${b.pumpeMs} ms · ready@${b.readyMs} · BUCH offen ab Navigation ${b.buchMs} ms · Variante ${VARIANTE || "A (Stand)"}`);
        console.log("PUMPE ab " + b.pumpeAb + " ms nach der Navigation (Seiten-Uhr) · TERME " + JSON.stringify(b.terms) + " · WÜRFE " + JSON.stringify(b.wuerfe));
        if ((b.init || []).length) console.log("  INIT (Rufe ≥ 15 ms am Stück, ms ab Navigation): " + b.init.sort((x, y) => x[1] - y[1] || x[3] - y[3]).map((e) => "  ".repeat(e[3]) + e[0] + "@" + e[1] + "+" + e[2]).join(" · "));
        if (process.env.FREI_JSON) fs.writeFileSync(process.env.FREI_JSON, JSON.stringify(Object.assign({ anfragen, prozessStartVorSeite: null }, b)));
        if (ZERLEGE) {
            console.log("  MARKEN (ms ab Navigation): " + Object.entries(b.marken || {}).map(([k, v]) => k + "@" + v).join(" · "));
            console.log("  TERME: " + (b.terme || []).map((e) => e[0] + " [" + e[1] + "]" + (e[2] ? " {" + e[2] + "}" : "")).join(" | "));
        }
        const je = {};
        for (const m of b.fz || []) (je[m.name] || (je[m.name] = [])).push(...m.log);
        for (const [n, l] of Object.entries(je)) console.log("  IM FADEN " + n + " (ms ab Navigation): " + l.slice(0, 40).map((e) => e[0] + (e[2] !== "" ? "[" + e[2] + "]" : "") + "@" + e[1]).join(" · "));
        const sv = new Map();
        for (const [t, p] of anfragen) sv.set(p, (sv.get(p) || []).concat(t));
        for (const [p, ts] of sv) console.log("  SERVER " + p + " · " + ts.length + "× · ms seit Prozess-Start " + ts.join(" "));
        try {
            if (!process.env.FREI_PROFIL) fs.rmSync(profil, { recursive: true, force: true });
        } catch {}
        process.exit((ECHT ? b.buchMs && b.weltbildMs : b.stage) ? 0 : 1);
    };
    const wache = setInterval(() => {
        const fertig = (bericht && bericht.ende) || Date.now() - tStart > 80000;
        // mit Spur: Chrome schreibt sie am Ende ihrer Dauer — so lange lebt der Prozess
        const spurDa = !process.env.FREI_TRACE || fs.existsSync(process.env.FREI_TRACE) || Date.now() - tStart > 70000;
        if (fertig && spurDa) (clearInterval(wache), setTimeout(ende, process.env.FREI_TRACE ? 2500 : 0));
    }, 500);
});
