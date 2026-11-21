const H = (function sitzungWerkzeug() {
    const fs = require("fs");
    const path = require("path");
    const os = require("os");
    const http = require("http");
    const S = Number(process.argv[1]);
    const W = S + 20000;
    const H = { S, W, AUS: process.argv[2], FRIST_S: Number(process.argv[3]) - 6, t0: Date.now(), fs, path, teil: undefined };
    if (!(H.FRIST_S > 0)) {
        console.log("@@ PROBE-FEHLER der Deckel des Laufs fehlt (argv „" + process.argv[3] + "“: der Läufer ersetzt den Platzhalter SEK)");
        process.exit(2);
    }
    // DIE MARKE der gerissenen Frist (punkte.cjs FRIST_MARKE), EINMAL je Probe: am Deckel der Frist (H.fahre) oder wo die Probe selbst
    // Fälle an ihr auslässt
    H.fristRiss = (was) => {
        if (H.gerissen) return;
        H.gerissen = was;
        console.log("@@PUNKTE@@ FRIST " + H.FRIST_S + " s der Probe gerissen — " + was);
    };
    const abbau = [];
    H.url = "http://localhost:" + S + "/index.html";
    H.sek = () => +((Date.now() - H.t0) / 1000).toFixed(1);
    H.rest = () => H.FRIST_S - (Date.now() - H.t0) / 1000;
    H.schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
    H.zeile = (t) => console.log("@@ " + H.sek() + " s · " + t);
    H.beimAbbau = (f) => abbau.push(f);
    // höchstens ms warten: der Wert oder `ersatz` — ein Wurf des Wartenden (auch nach der Frist, etwa die Seite, die neu lädt) steht
    // beim Namen in der Ausgabe, nie als unbehandelte Ablehnung, die die Probe risse
    H.binnen = (p, ms, ersatz = null) =>
        Promise.race([
            Promise.resolve(p).catch((e) => (console.log("@@ " + H.sek() + " s · gewartet, geworfen: " + String((e && e.message) || e).split("\n")[0]), ersatz)),
            H.schlaf(Math.max(0, ms)).then(() => ersatz),
        ]);
    // DER MESSORT (punkte.cjs keinUrteil (d)): ein Wurf der Wege, die Ort und Seite stellen (/umstellen, /fenster, /status, /reload), der
    // Anschluss an den Browser der Sitzung und die Grundstellung tragen `messort` — erreicht er den Rand der Probe (H.fahre), sagt sie
    // die EINE Marke
    const MESSORT_WEG = /^\/(umstellen|fenster|status|reload)\b/;
    H.messort = (e, weg) => {
        const t = e && typeof e === "object" ? String(e.message || e).replace(/\s+/g, " ") : "";
        if ((!weg || MESSORT_WEG.test(weg)) && t && !e.messort) e.messort = (!weg || t.startsWith(weg) ? "" : weg + ": ") + t.slice(0, 280);
        return e;
    };
    // DIE WERKBANK der Sitzung (POST mit Frist)
    H.wb = (weg, nutz, ms = 120000) =>
        new Promise((ja, nein0) => {
            const nein = (e) => nein0(H.messort(e, weg));
            const q = http.request({ host: "127.0.0.1", port: W, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        ja(JSON.parse(d));
                    } catch (_e) {
                        nein(new Error(weg + ": " + d.slice(0, 200)));
                    }
                });
            });
            q.setTimeout(Math.max(1000, ms), () => q.destroy(new Error(weg + " ohne Antwort binnen " + Math.round(ms / 1000) + " s")));
            q.on("error", nein);
            q.end(JSON.stringify(nutz || {}));
        });
    // ein Funktionsrumpf in der Seite der Welt (r = Welt, T = THREE), wie `werkbank eval`
    H.evalWelt = async (code, ms) => {
        const a = await H.wb("/eval", { code }, ms);
        if (!a || a.fehler) throw new Error("werkbank eval: " + (a && a.fehler) + " " + JSON.stringify((a && a.stapel) || []));
        return a.ergebnis;
    };
    // eine frische Welt in der Sitzung (die Grundstellung der Maschine: Spielstand weg, die Seite neu)
    H.grundstellung = () => {
        const p = require("child_process").spawnSync(process.execPath, [process.env.PUNKTE_MASCHINE, "grundstellung"], {
            encoding: "utf8",
            env: process.env,
            timeout: 240000,
        });
        if (p.status !== 0) throw H.messort(new Error("grundstellung: " + String((p.stdout || "") + (p.stderr || "")).trim().split(/\r?\n/).slice(-2).join(" | ")));
    };
    // DER BROWSER DER SITZUNG
    H.verbinde = async () => {
        const pp = require("puppeteer");
        // DER ANSCHLUSS ÜBER /status (die EINE Quelle, wie proben-welt tor.seite): die Werkbank nennt das Profil ihres Browsers —
        // bis z216 suchte die Probe werkbank-profil-<W>-* im tmp, seit w11-profil-leck trägt der Starter ein Scratch-Profil
        const st = await H.wb("/status", {}, 30000);
        const profil = st && st.boot && st.boot.profil;
        const kand = [profil && path.join(profil, "DevToolsActivePort")].filter((f) => f && fs.existsSync(f));
        const fehl = [];
        for (const f of kand) {
            const [port, weg] = fs.readFileSync(f, "utf8").split(/\r?\n/);
            let b = null;
            try {
                b = await pp.connect({ browserWSEndpoint: "ws://127.0.0.1:" + port + weg, defaultViewport: null, protocolTimeout: 600000 });
                const seiten = await b.pages();
                const page = seiten.find((p) => p.url().startsWith("http://localhost:" + S + "/"));
                if (!page) throw new Error("keine Seite der Welt (" + seiten.map((p) => p.url()).join(" ") + ")");
                const vorher = new Set(seiten);
                // die souveräne Geste (window.confirm des Teilens, ein Dialog beim Verlassen) nimmt die Probe an — die Werkbank hört keinen
                const ja = (d) => d.accept().catch(() => {});
                page.on("dialog", ja);
                // seit spielgang.K5 (29643272, 02.11.) fragt die Welt nie mehr über window.confirm, sondern über ihre eigene
                // Oberfläche (#frage-dialog, `_frage`; die souveräne Geste `_sovereignGesture`) — der Hörer oben hört sie nicht, die
                // Geste des Teilens stand offen, bis die Probe riss (bauen.K5#2 geteilt: „Waiting failed: 30000ms" seit 02.11.). Die
                // Probe sagt dort Ja wie `frageJa` (scripts/lib/welt-boot.cjs), solange sie verbunden ist.
                await page.evaluate(() => {
                    const d = document.getElementById("frage-dialog");
                    if (!d) return;
                    const jaKlick = () => d.open && d.querySelector("#frage-ja").click();
                    (window.__sitzungFrageJa = new MutationObserver(jaKlick)).observe(d, { attributes: true, attributeFilter: ["open"] });
                    jaKlick();
                });
                H.beimAbbau(async () => {
                    page.off("dialog", ja);
                    await page.evaluate(() => (window.__sitzungFrageJa && window.__sitzungFrageJa.disconnect(), delete window.__sitzungFrageJa)).catch(() => {});
                    await page.keyboard.up("KeyW").catch(() => {});
                    for (const p of await b.pages().catch(() => [])) if (!vorher.has(p)) await p.close().catch(() => {});
                    await page.bringToFront().catch(() => {});
                    await b.disconnect();
                });
                Object.assign(H, { browser: b, page });
                return { browser: b, page };
            } catch (e) {
                fehl.push(path.basename(path.dirname(f)) + ": " + e.message);
                if (b) await b.disconnect().catch(() => {});
            }
        }
        throw H.messort(new Error("kein Browser der Sitzung an :" + W + " (" + (fehl.join(" · ") || (profil ? "kein DevToolsActivePort in " + profil : "/status nennt kein Profil der Werkbank")) + ")"));
    };
    // DIE LINSE ALS BIBLIOTHEK
    H.linse = (datei, namen, { argv = [], ersetze = [], stumm = {} } = {}) => {
        const Module = require("module");
        const f = path.resolve(datei);
        let text = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n"); // die Anker in LF, wie auch immer der Baum auscheckt
        for (const [alt, neu] of ersetze) {
            const n = text.split(alt).length - 1;
            if (n !== 1) throw new Error(datei + ": der Anker „" + alt.slice(0, 70) + "“ steht " + n + "× im Text (Soll 1) — die Linse änderte sich");
            text = text.replace(alt, () => neu);
        }
        const wbt = require(path.resolve("scripts/lib/welt-boot.cjs"));
        const ersatz = Object.assign({ hauptLauf: () => {} }, stumm);
        const alt = Object.fromEntries(Object.keys(ersatz).map((k) => [k, wbt[k]]));
        const av = process.argv;
        Object.assign(wbt, ersatz);
        process.argv = [av[0], f, ...argv];
        try {
            const m = new Module(f, module);
            m.filename = f;
            m.paths = Module._nodeModulePaths(path.dirname(f));
            m._compile(text + "\n;module.exports = { " + namen.join(", ") + " };\n", f);
            return m.exports;
        } finally {
            Object.assign(wbt, alt);
            process.argv = av;
        }
    };
    // DER EREIGNIS-STROM jeder Eingabe des Spielers (pointerdown · keydown · wheel, vor jedem Hörer der Seite) — wie die Linse
    // diag-werkstatt-weg ihn je Seite anlegt; in einer schon geladenen Seite einmal
    H.ereignisStrom = (page) =>
        page.evaluate(() => {
            if (window.__eingabeStrom) return;
            const strom = (window.__eingabeStrom = []);
            for (const typ of ["pointerdown", "keydown", "wheel"])
                window.addEventListener(typ, (e) => strom.push({ was: typ === "keydown" ? e.code : typ === "wheel" ? "Rad" : "Klick", echt: e.isTrusted, t: performance.now() }), {
                    capture: true,
                    passive: true,
                });
        });
    // DIE SEITE NEU im warmen Browser: warm der Zweit-Boot (nur die Seite neu: Platte, HTTP- und Shader-Cache bleiben), kalt vorher
    // die Herkunft leer — IndexedDB (Welten, Platte, Chunk-Netze), localStorage, Cache- und Shader-Speicher — samt HTTP-Cache des
    // Browsers und der Stand-Dateien des save-servers (Pflicht-OFFEN B: „IDB geleert, wie nach jedem Versions-Update"). Rückgabe
    // die Uhr ab der Navigation (die Kontrolle von außen zählt ab ihr).
    H.lade = async (page, { kalt = false } = {}) => {
        if (kalt) {
            const herkunft = "http://localhost:" + S;
            await page.goto("about:blank", { waitUntil: "load", timeout: 60000 });
            const c = await page.target().createCDPSession();
            try {
                await c.send("Storage.clearDataForOrigin", { origin: herkunft, storageTypes: "all" });
                await c.send("Network.clearBrowserCache");
            } finally {
                await c.detach().catch(() => {});
            }
            for (const d of ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"]) fs.rmSync(d, { force: true });
        }
        const t0 = Date.now();
        await page.goto(H.url, { waitUntil: "domcontentloaded", timeout: 120000 });
        return t0;
    };
    // DER LAUF der Probe: ihr Ergebnis ist das JSON der Ausgabe; die Frist (H.FRIST_S) baut ab und schreibt den Stand `H.teil`
    H.fahre = (fn) => {
        let fertig = false;
        const ende = async (code, j) => {
            if (fertig) return;
            fertig = true;
            clearTimeout(uhr);
            if (j !== undefined)
                try {
                    fs.writeFileSync(H.AUS, JSON.stringify(j));
                } catch (e) {
                    console.log("@@ Ausgabe: " + e.message);
                }
            for (const f of abbau.reverse()) await H.binnen(Promise.resolve().then(f).catch((e) => console.log("@@ Abbau: " + e.message)), 15000);
            process.exit(code);
        };
        const uhr = setTimeout(() => {
            H.fristRiss("Abbau, die Ausgabe trägt den Stand bis hier");
            ende(3, H.teil);
        }, H.FRIST_S * 1000);
        Promise.resolve()
            .then(() => fn(H))
            .then(
                (j) => ende(0, j),
                (e) => {
                    if (e && e.messort) console.log("@@PUNKTE@@ MESSORT " + e.messort);
                    console.log("@@ PROBE-FEHLER " + String((e && e.stack) || e).split("\n").slice(0, 5).join(" | "));
                    ende(2, H.teil);
                }
            );
    };
    return H;
})();
H.seite = {
SAATEN: async (r, T, arg, zaehl) => {
    const heim = r.state.worldMeta && r.state.worldMeta.worldId;
    if (!heim) return { fehler: "die Sitzung trägt keine Welt (worldMeta.worldId)" };
    const t0 = performance.now();
    const p0 = r.state.playerMesh ? r.state.playerMesh.position.clone() : null;
    const je = [];
    const besucht = [];
    let grund = null;
    let heimweg = null;
    try {
        for (let i = 1; i <= arg.n; i++) {
            const schnitt = je.length ? (performance.now() - t0) / je.length : 0;
            if (Date.now() + schnitt > arg.bis) {
                grund = "die Frist: " + je.length + " Saaten in " + Math.round(performance.now() - t0) + " ms";
                break;
            }
            const saat = arg.stamm + "-" + i;
            const a = performance.now();
            const vor = r.state.worldMeta.worldId;
            r.processChatCommand("neue welt saat " + saat);
            if (r.activeWorldGet() === vor) {
                grund = "der Satz „neue welt saat " + saat + "“ erschuf keine Welt am Ort";
                break;
            }
            besucht.push(r.activeWorldGet());
            if (!(await r.erwacht)) {
                grund = "die Welt der Saat " + saat + " erwachte nicht";
                break;
            }
            const seed = r.state.worldMeta && r.state.worldMeta.seed;
            if (seed !== saat) {
                grund = "die Welt trägt die Saat " + seed + " statt " + saat;
                break;
            }
            const ms = Math.round(performance.now() - a);
            je.push({ saat, ms, z: zaehl ? await zaehl(r) : null });
        }
    } finally {
        // der Heimweg: die Welt der Sitzung, der Spieler an seiner Lage vor der Schleife (`versatz` in m nennt, wie weit er nicht ist)
        const h = performance.now();
        const zurueck = !besucht.length || (r.switchToWorld(heim, { reload: true }) && (await r.erwacht));
        let fort = 0;
        for (const w of besucht) if (zurueck && r.deleteWorld(w)) fort++;
        const p = r.state.playerMesh && r.state.playerMesh.position;
        const versatz = p0 && p ? Math.round(p.distanceTo(p0) * 10) / 10 : null;
        heimweg = { zurueck: !!zurueck && r.state.worldMeta.worldId === heim, ms: Math.round(performance.now() - h), geloescht: fort, versatz };
    }
    const msJe = je.map((x) => x.ms);
    return { je, grund, heimweg, msJe, msSchnitt: msJe.length ? Math.round(msJe.reduce((a, b) => a + b, 0) / msJe.length) : null };
}
};
H.fahre(async function leiterProbe(H) { /* richter db263d6e75 */ const PLAN = {"leiter":"erleben.spieler.wegfindung","sprossen":{"1":{"umfang":{"verlangt":50,"einheit":"Saaten der Sitzung"},"soll":[{"wort":"anteil_landmarke","richtung":"≥","wert":0.9}],"auge":null},"2":{"umfang":{"verlangt":1,"einheit":"Landmarken in 1 km um die Wiese"},"soll":[{"wort":"erfolg","richtung":"≥","wert":0.9},{"wort":"umweg","richtung":"≤","wert":1.5}],"auge":null},"3":{"umfang":{"verlangt":10,"einheit":"km Weite des Planeten der Welt"},"soll":[{"wort":"wege_deckung","richtung":"≥","wert":0.95},{"wort":"erfolg","richtung":"≥","wert":0.9}],"auge":null},"4":{"umfang":{"verlangt":1000000,"einheit":"Bewohner der größten Siedlung der Sitzung"},"soll":[{"wort":"erfolg","richtung":"≥","wert":0.8},{"wort":"landmarken_im_satz","richtung":"≥","wert":1}],"auge":null},"5":{"umfang":{"verlangt":1000,"einheit":"km Weite des Planeten der Welt"},"soll":[{"wort":"gestirn_fehler_grad","richtung":"≤","wert":1},{"wort":"seereise_erfolg","richtung":"≥","wert":0.8}],"auge":null},"6":{"umfang":{"verlangt":40000,"einheit":"km Umfang des Planeten der Welt"},"soll":[{"wort":"erfolg","richtung":"≥","wert":0.8}],"auge":null},"7":{"umfang":{"verlangt":100,"einheit":"Saaten der Sitzung"},"soll":[{"wort":"erfolg","richtung":"≥","wert":0.8},{"wort":"umweg","richtung":"≤","wert":1.5},{"wort":"hud_pfeile","richtung":"≤","wert":0},{"wort":"dv_ueber_pct","richtung":"≤","wert":10}],"auge":null}}};
return (async function leiterRahmen(H, P, lauf) {
    const fs = require("fs");
    const logDatei = process.env.PUNKTE_SITZUNG_LOG;
    const log = logDatei && fs.existsSync(logDatei) ? fs.readFileSync(logDatei, "utf8") : "";
    const hw = (/\[linse-gpu\][^\r\n]*/.exec(log) || [null])[0];
    console.log(hw || "[linse-gpu] ungenannt (kein Log der Sitzung)");
    const j = (H.teil = { leiter: P.leiter, hw, sprossen: {}, fehler: {}, zeilen: [], preisPose: null });
    const D = String(H.AUS).replace(/\.json$/, "") + "-bilder";
    // DER STAND NACH JEDER SPROSSE (punkte.cjs keinUrteil (e)): die Ausgabe trägt jede geurteilte Sprosse ganz, ehe die nächste misst —
    // reißt danach die Frist oder tötet die Leine die Probe, urteilt die Sprosse aus ihr (geschrieben neben der Ausgabe, dann umbenannt:
    // nie ein halbes JSON)
    const stand = () => {
        try {
            fs.writeFileSync(H.AUS + ".stand", JSON.stringify(j));
            fs.renameSync(H.AUS + ".stand", H.AUS);
        } catch (e) {
            H.zeile("Stand: " + String((e && e.message) || e).split("\n")[0]);
        }
    };
    const setze = (nr, e) => {
        if (!P.sprossen[nr]) throw new Error("S" + nr + " ist keine Sprosse dieser Station");
        if (j.sprossen[nr]) throw new Error("S" + nr + " zweimal geurteilt");
        j.sprossen[nr] = Object.assign(e, { t: H.sek() });
        stand();
        H.zeile(P.leiter + " S" + nr + " " + e.art + " " + JSON.stringify(e).slice(0, 220));
    };
    const L = {
        P,
        j,
        D,
        rest: () => H.rest(),
        zeile: (t) => (j.zeilen.push(t), H.zeile(t)),
        wb: async (weg, nutz, s = 60) => {
            const o = await H.wb(weg, nutz, s * 1000);
            if (o && typeof o.fehler === "string") throw H.messort(new Error(weg + ": " + o.fehler.slice(0, 240)), weg);
            return o;
        },
        ev: (code, s = 60) => H.evalWelt(code, s * 1000),
        ort: (ort, sicht, pose) => L.wb("/umstellen", Object.assign({ ort, sicht: sicht || "ego" }, pose ? { pose } : {}), 240),
        // DIE ERGEBNISSE: werte {wort: Zahl} in den Einheiten der Karte · o.erzeugt der Umfang, den die Welt trug · o.welt die Zeugen
        // {wort: Zahl} · o.taeter der nächste Täter beim Namen
        gemessen: (nr, werte, o) => setze(nr, { art: "gemessen", werte, erzeugt: (o || {}).erzeugt, welt: (o || {}).welt || {}, taeter: (o || {}).taeter || null, beleg: (o || {}).beleg || null }),
        umfang: (nr, erzeugt, was) => setze(nr, { art: "umfang", erzeugt, was }),
        leser: (nr, fehlt, erzeugt) => setze(nr, { art: "leser", fehlt, erzeugt }),
        // DAS AUGE: das Bild an fester Pose (Messort, Sicht, Pose der Werkbank; b: Uhr, Wetter, Saison wie `werkbank bild`)
        auge: async (nr, o) => {
            try {
                if (o && o.ort) await L.ort(o.ort, o.sicht, o.pose);
                const kam = await L.ev("r._loopCamera(performance.now()); const c = r.state.camera; return [...c.position.toArray(), ...c.getWorldDirection(new T.Vector3()).multiplyScalar(20).add(c.position).toArray()];");
                const datei = require("path").join(D, P.leiter + "-S" + nr + ".png");
                const b = await L.wb("/bild", Object.assign({ px: kam[0], py: kam[1], pz: kam[2], lx: kam[3], ly: kam[4], lz: kam[5], w: 1280, h: 720, datei }, (o && o.b) || {}), 120);
                setze(nr, { art: "auge", bild: (b && b.datei) || datei, werte: (o && o.werte) || null, erzeugt: o && o.erzeugt });
            } catch (e) {
                if (e && e.messort) throw e;
                setze(nr, { art: "auge", bild: null, grund: String((e && e.message) || e).split("\n")[0].slice(0, 160), werte: (o && o.werte) || null, erzeugt: o && o.erzeugt });
            }
        },
        // DER STROM DER SITZUNG (punkte.cjs stromZapfen · stromLesen — dieselbe Quelle, aus der richter-akte.cjs den Preis liest; kein
        // eigener Bild-Messer): L.zelle(name) nennt die Zelle der folgenden Bilder (null: keine), L.bilder(name) gibt die Bilder dieser
        // Probe in ihr ({ dt, gpu, vram, dreiecke, sicht, … } je Bild), L.p95 wie der Kopf des Stroms (Rang ⌊0,95·n⌋)
        zelle: async (name) => {
            const M = require(process.env.PUNKTE_MASCHINE || "-");
            if (!process.env.PUNKTE_SITZUNG_STROM) throw H.messort(new Error("die Sitzung trägt keinen Strom (PUNKTE_SITZUNG_STROM fehlt)"));
            const z = await M.stromZapfen(Number(process.env.WERKBANK_PORT) || H.W, process.env.PUNKTE_SITZUNG_STROM, process.env.PUNKTE_PROBE, { zelle: name });
            if (!z.ok) throw H.messort(new Error("der Strom zapft nicht: " + z.grund));
        },
        bilder: (name) =>
            require(process.env.PUNKTE_MASCHINE || "-").stromLesen(process.env.PUNKTE_SITZUNG_STROM).bilder.filter((b) => b.probe === process.env.PUNKTE_PROBE && b.zelle === name && b.dt >= 0),
        p95: (a) => {
            const s = a.filter(Number.isFinite).sort((x, y) => x - y);
            return s.length ? s[Math.min(s.length - 1, Math.floor(0.95 * s.length))] : null;
        },
        // DIE DICHTESTE POSE der Leiter (R3): dort endet die Probe, dort fährt der Preis-Lauf der Sitzung
        preisPose: (ort, sicht, pose) => (j.preisPose = { ort, sicht: sicht || "ego", pose: pose || null }),
        // je Sprosse ein eigener Versuch: ein Wurf steht beim Namen in j.fehler, die Sprosse bleibt ohne Ergebnis (UNGEMESSEN), die
        // nächste misst weiter — außer der Wurf trägt den Messort (dann reißt die Probe, punkte.cjs keinUrteil (d))
        je: async (nr, f) => {
            try {
                await f();
            } catch (e) {
                if (e && e.messort) throw e;
                j.fehler[nr] = String((e && e.message) || e).split("\n")[0].slice(0, 240);
                H.zeile(P.leiter + " S" + nr + " warf: " + j.fehler[nr]);
            }
        },
    };
    await lauf(H, P, L);
    if (j.preisPose) {
        try {
            await L.ort(j.preisPose.ort, j.preisPose.sicht, j.preisPose.pose);
            j.preisPose.steht = true;
        } catch (e) {
            j.preisPose.steht = false;
            j.preisPose.grund = String((e && e.message) || e).split("\n")[0].slice(0, 160);
        }
    }
    return j;
})(H, PLAN, async function wegfindungLauf(H, P, L) {
                const path = require("path");
                const tOrt = Date.now();
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const ortMs = Date.now() - tOrt;
                const z = await L.ev(`
                    const st = r.state;
                    const p = st.playerMesh.position;
                    const lm = (st.architectures || []).filter((e) => e && typeof e.type === "string" && e.position && (e.type.indexOf("felsturm") === 0 || e.type.indexOf("felsbogen") === 0));
                    const dist = (e) => Math.hypot(e.position.x - p.x, e.position.z - p.z);
                    const lm1 = lm.filter((e) => dist(e) <= 1000).length;
                    const lm13 = lm.filter((e) => dist(e) >= 1000 && dist(e) <= 3000).length;
                    const FC = globalThis.__fachwerkCore;
                    let max = 0, sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (Array.isArray(S.liste)) n = S.liste.length;
                        else {
                            if (!FC || typeof FC.leuteVon !== "function") throw new Error("fachwerk-core leuteVon fehlt (stamm/siedlung-bewohner.js:839)");
                            for (const sl of (S.plan && S.plan.slots) || []) { const k = FC.leuteVon(sl.ov); if (k > 0) n += k; }
                        }
                        if (n > max) max = n;
                    }
                    const sf = st.starField;
                    if (!sf) throw new Error("kein Sternfeld (state.starField, stamm/dirigent-takt.js:2422)");
                    const q = (y) => new T.Quaternion().setFromEuler(new T.Euler(sf.rotation.x, y, sf.rotation.z, sf.rotation.order));
                    const dq = q(1).multiply(q(0).invert());
                    const ax = new T.Vector3(dq.x, dq.y, dq.z).normalize();
                    if (sf.parent) ax.applyQuaternion(sf.parent.getWorldQuaternion(new T.Quaternion()));
                    const polHoehe = (Math.asin(Math.min(1, Math.abs(ax.y))) * 180) / Math.PI;
                    const alt = { tod: st.timeOfDay, phase: st.seasonPhase, season: st.season, auto: st.autoSeason, anker: r._saisonAnker, sonne: st._sonne ? Object.assign({}, st._sonne) : st._sonne };
                    const mittag = [];
                    try {
                        for (const w of ["fruehling", "sommer", "herbst", "winter"]) {
                            if (!r.setSeason(w)) throw new Error("das Saison-Wort " + w + " gilt nicht");
                            st.timeOfDay = 0.5;
                            const s = r._sonnenRichtung();
                            mittag.push({ w, phase: st.seasonPhase, hoehe: (Math.asin(Math.max(-1, Math.min(1, s.y))) * 180) / Math.PI });
                        }
                    } finally {
                        st.timeOfDay = alt.tod; st.seasonPhase = alt.phase; st.season = alt.season; st.autoSeason = alt.auto; r._saisonAnker = alt.anker; st._sonne = alt.sonne;
                    }
                    const anker = await r._planetAnker();
                    return { saat: st.worldMeta && st.worldMeta.seed, samen: r._planetSamen(), breite: anker.breite, laenge: anker.laenge, lm1, lm13, lmAlle: lm.length, max, sied, polHoehe, mittag };
                `);
                L.zeile("Wegfindung an der Wiese: " + JSON.stringify(z));
                // der Körper des Planeten der Welt: dieselbe reine Funktion wie im Planet-Faden (voxel-worker.js:1159 planetPlan(samen, PLANET_ERDE))
                const PC = require(path.resolve("planet-core.js"));
                const K = PC.planetPlan(z.samen, PC.PLANET_ERDE).koerper;
                const umfangKm = 2 * Math.PI * K.radiusKm;
                const zahl = (x, n) => String(+Number(x).toFixed(n == null ? 1 : n)).replace(".", ",");
                await L.je(2, async () => {
                    if (z.lm1 < P.sprossen[2].umfang.verlangt) return L.umfang(2, z.lm1, "in 1 km um die Wiese steht keine Landmarke (felsturm/felsbogen, stamm/vegetation-baum.js:1519; " + z.lm13 + " in 1–3 km, " + z.lmAlle + " geladen)");
                    L.leser(2, "Erfolg und Umweg eines menschlichen Testspielers: kein Leser des Ziel-Gangs (Start, Ziel, gegangener Weg) — der Ort wäre eine Route neben `/latenz` (scripts/werkbank.cjs:1892), der Testspieler ein Panel (R11)", z.lm1);
                });
                await L.je(3, async () => {
                    if (umfangKm < P.sprossen[3].umfang.verlangt) return L.umfang(3, umfangKm, "der Planet der Welt misst " + zahl(umfangKm) + " km Umfang");
                    L.leser(3, "Karte aus dem Gesetz: kein Haken, der die Welt als Karte vor den Spieler legt (Höhenlinien, Wege, Ortsnamen) — `_wegeKarteEnsure` (stamm/siedlung-wege.js:16) ist eine Boden-Textur, keine Karte des Spielers", umfangKm);
                });
                await L.je(4, async () => {
                    if (z.max < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.max, "die größte Siedlung der Sitzung trägt " + z.max + " Bewohner (" + z.sied + " Siedlungen) — keine Stadt von 10⁶");
                    L.leser(4, "Auskunft: kein Satz eines Bewohners aus dem Wegenetz (stamm/siedlung-wege.js:16)", z.max);
                });
                // S5 · Gestirn-Höhe ↔ Breite: die Mittags-Sonne je Saison-Wort gegen 90° − |φ − δ|, die Pol-Höhe der Sterne gegen |φ|
                await L.je(5, async () => {
                    const phiG = (z.breite * 180) / Math.PI;
                    const s = phiG < 0 ? -1 : 1;
                    const zeilen = z.mittag.map((m) => {
                        const delta = (s * Math.asin(Math.sin(K.neigungRad) * Math.sin(2 * Math.PI * m.phase)) * 180) / Math.PI;
                        const soll = 90 - Math.abs(phiG - delta);
                        return { w: m.w, ist: m.hoehe, soll, f: Math.abs(m.hoehe - soll) };
                    });
                    const fSonne = Math.max(...zeilen.map((x) => x.f));
                    const fPol = Math.abs(z.polHoehe - Math.abs(phiG));
                    const f = Math.max(fSonne, fPol);
                    const schlecht = zeilen.reduce((a, x) => (x.f > a.f ? x : a), zeilen[0]);
                    L.zeile("Gestirne bei Breite " + zahl(phiG, 2) + "°: " + JSON.stringify(zeilen) + " · Pol " + zahl(z.polHoehe, 2) + "°");
                    if (f <= 1) return L.leser(5, "Seereise 1 000 km nur mit Himmel: kein Leser des Erfolgs — die Reise ist ein Sprung der Konsole (stamm/feld-leben.js:1278), keine Fahrt über See unter dem Himmel", umfangKm);
                    L.gemessen(5, { gestirn_fehler_grad: +f.toFixed(3) }, {
                        erzeugt: umfangKm,
                        welt: { gestirn_proben: z.mittag.length + 1 },
                        taeter:
                            "die Sonnenbahn kennt weder Breite noch Saison (welt-licht.js:711 `sonnenRichtung`): Mittag " + schlecht.w + " " + zahl(schlecht.ist) + "° statt " + zahl(schlecht.soll) + "°; Pol der Sterne " + zahl(z.polHoehe) + "° statt " + zahl(Math.abs(phiG)) +
                            "° (stamm/dirigent-takt.js:2422 feste Achse); Seereise: kein Leser (stamm/feld-leben.js:1278 die Reise springt)",
                    });
                });
                await L.je(6, async () => {
                    if (umfangKm < P.sprossen[6].umfang.verlangt) return L.umfang(6, umfangKm, "der Planet der Welt misst " + zahl(umfangKm) + " km Umfang");
                    L.leser(6, "Mittel der Epoche: die Reise ist ein Sprung der Konsole in eine neue Welt (stamm/feld-leben.js:1278 → `_reiseBetreten` stamm/netz-portal.js:660), keine Fahrt mit Karte, Schiff oder Fahrzeug der Epoche", umfangKm);
                });
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält eine Saat (" + z.saat + ") und einen Planeten — kein Nachbarplanet, keine Bahn zwischen Planeten"));
                // S1 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): je Saat der Satz „neue welt saat <s>“, die Welt wechselt am Ort, ihr
                // Spawn ist der Spawn-Ort der Karte; gezählt je Saat die Landmarken (felsturm/felsbogen, stamm/vegetation-baum.js:1519) in
                // 1–3 km und davon die im Kegel der Kamera. Der Anteil mit ≥ 1 im Bild ist die Obergrenze des Solls (der Kontrast fehlt
                // als Leser): verfehlt er 0,9, ist S1 ROT gemessen; hält er an allen Saaten, nennt S1 den Leser des Kontrasts. Gezählt ist
                // nur die Saat, deren Welt gewachsen ist (≥ 1 Architektur geladen): die Landmarken sät der Chunk-Pump erst unter Bildern
                // (`_enqueueVegetationSpawn`, stamm/vegetation-baum.js:1522) — eine Welt ohne Wuchs ist kein „0 Landmarken“. Die Schleife
                // läuft zuletzt (S2–S7 lesen die Wiese vorher in ihrer Zeit) und nur, solange der Heimweg in die Frist passt: nach der
                // Rückkehr wächst die Wiese neu (die Preis-Pose der Leiter, `/umstellen`) — die Probe misst ihn an ihrem ersten Gang zur Wiese
                // (`ortMs`) und hält das Doppelte frei (headless 17 s → nach dem Heimweg 19–30 s).
                await L.je(1, async () => {
                    const v = P.sprossen[1].umfang.verlangt;
                    const arg = { stamm: P.leiter + "-s1", n: v, bis: Date.now() + Math.max(0, (L.rest() - 3 - (2 * ortMs) / 1000) * 1000) };
                    const zaehl = function (r) {
                        r._loopCamera(performance.now());
                        const cam = r.state.camera;
                        cam.updateMatrixWorld(true);
                        const F = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
                        const p = r.state.playerMesh.position;
                        let n13 = 0, imBild = 0;
                        for (const e of r.state.architectures || []) {
                            if (!e || typeof e.type !== "string" || !e.position || !(e.type.indexOf("felsturm") === 0 || e.type.indexOf("felsbogen") === 0)) continue;
                            const d = Math.hypot(e.position.x - p.x, e.position.z - p.z);
                            if (d < 1000 || d > 3000) continue;
                            n13++;
                            if (F.containsPoint(new T.Vector3(e.position.x, e.position.y, e.position.z))) imBild++;
                        }
                        return { n13, imBild, geladen: (r.state.architectures || []).length };
                    };
                    const s = await L.ev("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", " + zaehl + ");", Math.max(5, L.rest() - 2));
                    if (s.fehler) throw new Error(s.fehler);
                    L.zeile("wegfindung S1 Saaten " + JSON.stringify(s));
                    const gewachsen = s.je.filter((x) => x.z.geladen > 0);
                    const treffer = gewachsen.filter((x) => x.z.imBild > 0).length;
                    const anteil = gewachsen.length ? treffer / gewachsen.length : 0;
                    const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ", Versatz " + s.heimweg.versatz + " m)" + (s.grund ? "; Ende: " + s.grund : "");
                    if (gewachsen.length < v && !(gewachsen.length && anteil < P.sprossen[1].soll[0].wert))
                        return L.umfang(1, gewachsen.length, "die Welt wechselte am Ort in " + s.je.length + " von " + v + " Saaten, gewachsen (≥ 1 Architektur am Erwachen) " + gewachsen.length + " — Architekturen je Saat " + (s.je.map((x) => x.z.geladen).join("/") || "—") + "; " + zeit + "; die Wiese wuchs in " + ortMs + " ms, der Heimweg hält das Doppelte frei");
                    if (anteil >= P.sprossen[1].soll[0].wert)
                        return L.leser(1, "Kontrast ≥ 0,1 der Landmarke gegen ihren Grund im Bild: kein Leser des Pixel-Kontrasts je Saat — " + zeit, gewachsen.length);
                    L.gemessen(1, { anteil_landmarke: +anteil.toFixed(3) }, {
                        erzeugt: gewachsen.length,
                        welt: { saaten: gewachsen.length },
                        taeter: treffer + " von " + gewachsen.length + " gewachsenen Saaten mit Landmarke in 1–3 km im Kegel (je Saat in 1–3 km " + gewachsen.map((x) => x.z.n13).join("/") + "; " + zeit + ")",
                    });
                });
            }); });