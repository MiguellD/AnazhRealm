// DIE PROBEN DER WELT IN DER SITZUNG (29.10., das Gesetz des Schöpfers: „Eine komplette Fahrt durch jedes System max 30 min,
// inbegriffen ist dann auch die Dauerlast“): tiere.K5#1 · fahrzeug.K5#1 · fahrzeug.K2#1 · streaming.K3#1 · streaming.K4#2 ·
// physik.K2#2 · gelaende.K2#1/#2 · gelaende.K5#2 messen in der EINEN warmen Welt der Sitzung (punkte.cjs fahreSitzung), nie mit
// eigenem Boot und nie mit eigenem Browser, je Probe ein Ziel von Sekunden: Teleport statt Laufen, der Zeitraffer der Spiel-Uhr
// statt Warten, je Urteil EIN Ort, die Welt nie neu geladen (außer streaming.K4#2: seine Haken sitzen vor dem ersten Skript).
// Das Urteil bleibt das der Linse: ihre Seiten-Funktion kommt aus dem Spiel-Baum am SHA (`tor.quelle`, acorn) und wird nur mit
// ANKERN auf das gekürzt, was das Kriterium braucht — steht ein Anker nicht genau einmal, wirft die Probe beim Namen (die Linse
// änderte sich: ROT, nie still alt). Jede Funktion hier wird als Text in den Befehl getragen (`torBefehl`): der Abdruck sieht jede
// Änderung, und keine darf außerhalb ihres Rumpfs lesen.
"use strict";

// DAS TOR DER SITZUNG (läuft im Prozess der Probe, cwd = der Spiel-Baum): der Ruf an die Werkbank der Welt (WERKBANK_PORT), die
// Adapter-Zeile ihres Logs (PUNKTE_SITZUNG_LOG), die Seite der Welt über puppeteer am Browser der Werkbank (/status nennt sein
// Profil, dort steht DevToolsActivePort; ohne Viewport von außen, getrennt am Ende — der Browser bleibt), und die Quellen der Linsen.
// DAS BÜNDEL (`tor.dekl` → `tor.buendel`, 09.11.): eine Liste nennt nur, WAS die Probe liest — was das Gelesene braucht, kommt mit: jede
// Deklaration der obersten Ebene, die der gezogene Text als freien Bezeichner nennt, und ihre wieder (der Abschluss), in der Reihe der
// Quelle. Befund Radeon 3ccb8f55: fahrzeug.K2#1 UNGEMESSEN — „ReferenceError: urteil is not defined … at Object.wegenetzVerdict“. Seit
// heim2-w13-verkehr-heil (f18627146) rufen die Urteile der Fahr-Linse den Helfer `urteil`; die Listen nannten ihn nicht (fahrWegenetz
// und fahrWelt: fahrzeug.K2#1, fahrzeug.K3#2, fahrzeug.K4#1/#2), die Verkehrs-Probe trug ihn von Hand nach (7b2a3f926) — gesehen je erst am
// Gerät, beim Ruf des Urteils. Das Bündel läuft in `new Function` und kennt kein `require`: braucht der gezogene Text einen Namen des
// Moduls (require · module · exports · __filename · __dirname), wirft das ZIEHEN mit der Kette beim Namen („rueckBericht → check →
// pruefer lädt mit require“), nie erst der Ruf. Was die Station selbst stellt (ein Parameter ihres `new Function`), nennt sie in
// `gestellt` — das kommt nie mit. Dasselbe Bündel urteilt die Wand ANKER am Kopf, ohne Gerät (punkte.cjs toteAnker).
function sitzungTor() {
    const fs = require("fs");
    const path = require("path");
    const http = require("http");
    const W = Number(process.env.WERKBANK_PORT);
    const tor = { W, aus: process.argv[1], arg: process.argv.slice(2), browser: null, page: null };
    // DER MESSORT (punkte.cjs keinUrteil (d)): ein Wurf der Wege, die den Ort und die Seite stellen (/umstellen, /fenster, /status,
    // /reload), und des Anschlusses an die Seite trägt `messort` — erreicht er den Rand der Probe (torBefehl), sagt sie die EINE Marke
    const MESSORT_WEG = /^\/(umstellen|fenster|status|reload)\b/;
    const messort = (e, weg) => {
        const t = e && typeof e === "object" ? String(e.message || e).replace(/\s+/g, " ") : "";
        if (MESSORT_WEG.test(weg) && t && !e.messort) e.messort = (t.startsWith(weg) ? "" : weg + ": ") + t.slice(0, 280);
        return e;
    };
    // EIN Ruf (POST JSON, mit Frist); eine Antwort { fehler: "…" } der Werkbank wirft beim Namen
    tor.ruf = (weg, nutzlast, ms = 120000) =>
        new Promise((ok0, nein0) => {
            const ok = ok0, nein = (e) => nein0(messort(e, weg));
            const q = http.request({ host: "127.0.0.1", port: W, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (a) => {
                let d = "";
                a.on("data", (c) => (d += c));
                a.on("end", () => {
                    let j = null;
                    try {
                        j = JSON.parse(d);
                    } catch (_e) {
                        return nein(new Error(weg + ": keine JSON-Antwort: " + d.slice(0, 200)));
                    }
                    if (j && typeof j.fehler === "string") return nein(new Error(weg + ": " + j.fehler.slice(0, 300)));
                    ok(j);
                });
            });
            q.on("error", nein);
            q.setTimeout(ms, () => q.destroy(new Error(weg + ": Frist " + ms + " ms")));
            q.end(JSON.stringify(nutzlast || {}));
        });
    // die Karte der Welt: die Adapter-Zeile im Log ihrer Werkbank (der Zeuge der Wand GPU steht schon in der Sitzung)
    tor.karte = () => {
        const f = process.env.PUNKTE_SITZUNG_LOG;
        const t = f && fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
        const z = (/^\[linse-gpu\] .*$/m.exec(t) || [null])[0];
        console.log(z || "KEINE KARTE: das Log der Sitzung nennt keinen [linse-gpu]");
        return z;
    };
    // der Anschluss an die Seite der Welt ist Messort: jeder Wurf darin trägt `messort`
    tor.seite = async () => {
        if (tor.page) return tor.page;
        try {
            const s = await tor.ruf("/status", {}, 30000);
            const profil = s && s.boot && s.boot.profil;
            if (!profil) throw new Error("/status nennt kein Profil der Werkbank");
            const [port, weg] = fs.readFileSync(path.join(profil, "DevToolsActivePort"), "utf8").split(/\r?\n/);
            const puppeteer = require(path.resolve("node_modules/puppeteer"));
            tor.browser = await puppeteer.connect({
                browserWSEndpoint: "ws://127.0.0.1:" + port + weg,
                defaultViewport: null,
                protocolTimeout: 900000,
            });
            for (const p of await tor.browser.pages())
                if (await p.evaluate(() => !!(window.anazhRealm && window.anazhRealm.state)).catch(() => false)) return (tor.page = p);
            throw new Error("im Browser der Werkbank steht keine Seite mit der Welt");
        } catch (e) {
            throw messort(e, "/status");
        }
    };
    const baum = (datei) => {
        const text = fs.readFileSync(datei, "utf8");
        const acorn = require(path.resolve("node_modules/acorn"));
        const o = { ecmaVersion: "latest", sourceType: "script", allowHashBang: true, allowReturnOutsideFunction: true };
        return { text, ast: acorn.parse(text, o) };
    };
    const ankern = (src, wo, anker) => {
        for (const [a, b] of anker) {
            const n = src.split(a).length - 1;
            if (n !== 1) throw new Error("ANKER " + (n ? n + "-mal" : "fehlt") + " in " + wo + ": " + a.slice(0, 90));
            src = src.replace(a, () => b);
        }
        return src;
    };
    // die Deklaration `name` auf oberster Ebene (eine Funktion: ihr Text; const: ihr Wert), jeder Anker [alt, neu] genau einmal ersetzt
    tor.quelle = (datei, name, anker = []) => {
        const { text, ast } = baum(datei);
        for (const n of ast.body) {
            if (n.type === "FunctionDeclaration" && n.id && n.id.name === name) return ankern(text.slice(n.start, n.end), datei + " " + name, anker);
            if (n.type === "VariableDeclaration")
                for (const d of n.declarations)
                    if (d.id.type === "Identifier" && d.id.name === name && d.init) return ankern(text.slice(d.init.start, d.init.end), datei + " " + name, anker);
        }
        throw new Error(datei + ": keine Deklaration " + name + " auf oberster Ebene");
    };
    // DAS BÜNDEL (der Kopf dieser Funktion): die Deklarationen `namen` der obersten Ebene MIT ihrem Abschluss, in der Reihe der Quelle;
    // `q` = { text, ast }, `gestellt` = die Namen, die die Station selbst stellt; ein Name des Moduls (require …) wirft mit der Kette
    tor.buendel = (q, namen, gestellt, wo) => {
        const kinder = (n) => Object.keys(n).filter((k) => k !== "type" && k !== "start" && k !== "end").flatMap((k) => (Array.isArray(n[k]) ? n[k] : [n[k]])).filter((c) => c && typeof c.type === "string");
        const bindet = (p) =>
            !p ? [] : p.type === "Identifier" ? [p.name] : p.type === "AssignmentPattern" ? bindet(p.left) : p.type === "RestElement" ? bindet(p.argument)
                : p.type === "ArrayPattern" ? p.elements.flatMap(bindet) : p.type === "ObjectPattern" ? p.properties.flatMap((x) => bindet(x.type === "RestElement" ? x.argument : x.value)) : [];
        const istFn = (n) => n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression";
        const dekl = (n) => ((n.type === "FunctionDeclaration" || n.type === "ClassDeclaration") && n.id ? [n.id.name] : n.type === "VariableDeclaration" ? n.declarations.flatMap((d) => bindet(d.id)) : []);
        const block = (liste) => liste.filter((s) => s.type !== "VariableDeclaration" || s.kind !== "var").flatMap(dekl);
        const vars = (n, aus = []) => {
            if (n.type === "VariableDeclaration" && n.kind === "var") aus.push(...dekl(n));
            for (const c of kinder(n)) if (!istFn(c)) vars(c, aus);
            return aus;
        };
        // die freien Bezeichner eines Knotens: jeder Bezug, den keine Sicht darin bindet (Funktion: Parameter, var, arguments · Block: let, const, class, function · catch)
        const frei = (wurzel) => {
            const aus = new Set();
            const muster = (p, sicht) => {
                if (!p || p.type === "Identifier") return;
                if (p.type === "AssignmentPattern") return void (muster(p.left, sicht), geh(p.right, sicht));
                if (p.type === "RestElement") return muster(p.argument, sicht);
                if (p.type === "ArrayPattern") return p.elements.forEach((e) => muster(e, sicht));
                if (p.type === "ObjectPattern") return p.properties.forEach((x) => (x.type === "RestElement" ? muster(x.argument, sicht) : (x.computed && geh(x.key, sicht), muster(x.value, sicht))));
                geh(p, sicht);
            };
            const geh = (n, sicht) => {
                if (!n) return;
                const mit = (neu) => [...sicht, new Set(neu)];
                const t = n.type;
                if (t === "Identifier") return void (sicht.some((s) => s.has(n.name)) || aus.add(n.name));
                if (t === "MemberExpression") return void (geh(n.object, sicht), n.computed && geh(n.property, sicht));
                if (t === "Property" || t === "PropertyDefinition" || t === "MethodDefinition") return void (n.computed && geh(n.key, sicht), geh(n.value, sicht));
                if (t === "LabeledStatement") return geh(n.body, sicht);
                if (t === "BreakStatement" || t === "ContinueStatement" || t === "MetaProperty") return;
                if (t === "VariableDeclarator") return void (muster(n.id, sicht), geh(n.init, sicht));
                if (istFn(n)) {
                    const rumpf = n.body.type === "BlockStatement" ? n.body.body : null;
                    const s = mit([...n.params.flatMap(bindet), ...(t === "ArrowFunctionExpression" ? [] : ["arguments"]), ...(t === "FunctionExpression" && n.id ? [n.id.name] : []), ...vars(n.body), ...(rumpf ? block(rumpf) : [])]);
                    n.params.forEach((p) => muster(p, s));
                    return void (rumpf ? rumpf.forEach((c) => geh(c, s)) : geh(n.body, s));
                }
                if (t === "ClassDeclaration" || t === "ClassExpression") {
                    const s = t === "ClassExpression" && n.id ? mit([n.id.name]) : sicht;
                    return void (geh(n.superClass, s), geh(n.body, s));
                }
                if (t === "BlockStatement" || t === "StaticBlock") {
                    const s = mit(block(n.body));
                    return n.body.forEach((c) => geh(c, s));
                }
                if (t === "SwitchStatement") {
                    const s = mit(block(n.cases.flatMap((c) => c.consequent)));
                    return void (geh(n.discriminant, sicht), n.cases.forEach((c) => (geh(c.test, s), c.consequent.forEach((x) => geh(x, s)))));
                }
                if (t === "ForStatement" || t === "ForInStatement" || t === "ForOfStatement") {
                    const d = t === "ForStatement" ? n.init : n.left;
                    const s = d && d.type === "VariableDeclaration" && d.kind !== "var" ? mit(dekl(d)) : sicht;
                    return kinder(n).forEach((c) => geh(c, s));
                }
                if (t === "CatchClause") {
                    const s = mit(bindet(n.param));
                    return void (muster(n.param, s), geh(n.body, s));
                }
                kinder(n).forEach((c) => geh(c, sicht));
            };
            geh(wurzel, []);
            return aus;
        };
        const oben = new Map();
        for (const n of q.ast.body) for (const w of dekl(n)) oben.set(w, n);
        const fehlt = namen.filter((x) => !oben.has(x));
        if (fehlt.length) throw new Error(wo + ": keine Deklaration " + fehlt.join(", "));
        const MODUL = ["require", "module", "exports", "__filename", "__dirname"];
        const kette = new Map(namen.map((x) => [oben.get(x), [x]]));
        for (const offen = [...kette.keys()]; offen.length; ) {
            const n = offen.shift();
            for (const f of frei(n)) {
                if (gestellt.includes(f)) continue;
                if (MODUL.includes(f))
                    throw new Error(wo + ": " + kette.get(n).join(" → ") + " lädt mit " + f + " — das Bündel der Probe (new Function) kennt kein " + f + "; die Station stellt " +
                        (kette.get(n).slice(1).join(" oder ") || f) + " selbst (tor.dekl(datei, namen, gestellt))");
                const d = oben.get(f);
                if (d && !kette.has(d)) (kette.set(d, [...kette.get(n), f]), offen.push(d));
            }
        }
        return q.ast.body.filter((n) => kette.has(n)).map((n) => q.text.slice(n.start, n.end)).join("\n");
    };
    tor.dekl = (datei, namen, gestellt = []) => tor.buendel(baum(datei), namen, gestellt, datei);
    tor.ende = async () => {
        if (tor.browser) await tor.browser.disconnect().catch(() => {});
    };
    return tor;
}

// der Befehl einer Probe: das Tor, dann `fn(tor)`; ein Wurf ist ROT beim Namen (PROBE-FEHLER mit den ersten Rahmen), nie still — ein
// Wurf des Messorts (`messort`, das Tor) sagt davor die EINE Marke (punkte.cjs keinUrteil (d): UNGEMESSEN beim Namen)
function torBefehl(fn, ...arg) {
    return [
        "node",
        "-e",
        "const tor = (" + sitzungTor + ")();\n(" + fn + ")(tor).then(() => process.exitCode || 0, (e) => ((e && e.messort ? console.log('@@PUNKTE@@ MESSORT ' + e.messort) : 0), " +
            "console.log('PROBE-FEHLER ' + String((e && e.stack) || e).split('\\n').slice(0, 4).join(' | ')), 1)).then(async (c) => { await tor.ende(); process.exit(c); });",
        "{AUS}",
        ...arg,
    ];
}

// ───────── physik.K2#2 — der Wagen bei vmax × 1,2 und die Bild-Probe an der Mauer (gate:kollision-bild `tempo`) ─────────
// Die Linse fährt in `tempo` alle Leiber (Fuchs · Wolf · Bär · Riese · der Spieler gehend und im Sprint · der Fall: das ist
// physik.K2#1, headless) und dann den Wagen und den gestoßenen Bären; Staffel 2 urteilt nur Wagen, gestoßenen Bären, den
// Schmuggel (der Fuchs ohne Teil-Schritt muss durch die Mauer) und das Beweisbild — die Anker nehmen die übrigen Schleifen
// heraus, nichts sonst. Die Zeilen der Ausgabe sind die der Linse (das Urteil der Station liest sie unverändert).
async function kollisionTempo(tor) {
    const fs = require("fs");
    const path = require("path");
    const L = "scripts/diag-kollision-bild.cjs";
    const U = new Function(
        tor.dekl(L, ["EINDRING_M", "SPALT_M", "UEBER_VMAX", "FALL_M", "HINDERNISSE", "TAKTE", "zeilen", "TEMPO_ZEILEN", "BILD_PX", "schluessel", "tempoUrteil"]) +
            "\nreturn { SPALT_M, UEBER_VMAX, FALL_M, HINDERNISSE, TAKTE, TEMPO_ZEILEN, tempoUrteil };"
    )();
    const tempo = tor.quelle(L, "tempo", [
        ['for (const name of ["fuchs", "wolf", "baer", "riese"])', "for (const name of [])"],
        ["for (const sprint of [false, true])", "for (const sprint of [])"],
        ['for (const kad of ["60", "deckel"]) {', "for (const kad of []) {"],
    ]);
    // DER ORT DER PROBE (w4-urteile-6a57, wie bodenRollen): `tempo` setzt Mauer, Fels, Baum und Haus 14–30 m neben die Mess-Wiese und
    // erbte in der Linse den Stand von `probe` — in der Sitzung stand der Spieler, wo die Tür ihn ließ (Radeon 25ac4c0c: am Spawn
    // [68,5 −2,4], 1,1 km von der Wiese), die Welt servierte das Haus dort nie, und es trug nie seine Hülle (`_hausHuelleSetzen`):
    // „DER BAU STEHT NICHT: haus_alemannisch#500 nach 268 Takten" (GTX 1e90e7cd #496, Radeon 3ef20f9f #3346, seit 31.10.). Headless
    // am Kopf 6a571e3b nachgestellt (die Linse ohne `probe`, Spieler am Spawn): dieselbe Zeile, #4 nach 578 Takten; an der Wiese
    // eingeschwungen 126/126 Zeilen. Die Sitzung stellt die Wiese VOR dem Deckel (punkte.cjs `probeOrt` liest den Ort aus diesem Befehl).
    await tor.ruf("/umstellen", { ort: "wiese", sicht: "ego" }, 1000 * Math.max(30, Number(process.env.PUNKTE_PROBE_DECKEL_S) || 90));
    const page = await tor.seite();
    const karte = tor.karte();
    // DIE GEOMETRIE DER LINSE, wie sie heute ist (w12-proben-frist; Radeon 8ef49bef „keine Deklaration rahmen auf oberster Ebene“): die
    // Linse liest `rahmen` aus welt-boot (dort `window.rahmen` jeder Seite) und trägt selbst nur lok · aussen · zuBox — die Probe nimmt
    // `rahmen` von dort, wo die Linse ihn nimmt (ein Stand, der ihn noch oben trägt, aus der Linse)
    const WBr = require(path.resolve("scripts/lib/welt-boot.cjs")).rahmen;
    await page.evaluate(
        ["window.rahmen = " + (typeof WBr === "function" ? String(WBr) : tor.quelle(L, "rahmen")) + ";", ...["lok", "aussen", "zuBox"].map((n) => "window." + n + " = " + tor.quelle(L, n) + ";")].join("\n")
    );
    const { messort } = require(path.resolve("scripts/lib/welt-orte.cjs"));
    const K = { mess: messort("wiese"), HINDERNISSE: U.HINDERNISSE, TAKTE: U.TAKTE, UEBER_VMAX: U.UEBER_VMAX, SPALT_M: U.SPALT_M, FALL_M: U.FALL_M, BILD: true };
    const t0 = Date.now();
    const T = await page.evaluate("(" + tempo + ")(" + JSON.stringify(K) + ")");
    T.karte = karte ? { vendor: (/^\[linse-gpu\]\s*([^/\s]+)/.exec(karte) || [])[1] } : { fehlt: "keine Adapter-Zeile im Log der Sitzung" };
    if (T.fehler) console.log("❌ LAUF-FEHLER: " + T.fehler);
    const Z = T.zeilen || [];
    console.log(`  (V) Kontakt beim Tempo: ${Z.length}/${U.TEMPO_ZEILEN.length} Zeilen · Schmuggel ${JSON.stringify(T.schmuggel)}`);
    console.log(`  gekürzt auf Wagen, gestoßenen Bären und Schmuggel (die Leiber: physik.K2#1) · ${((Date.now() - t0) / 1000).toFixed(1)} s in der Welt der Sitzung`);
    for (const k of new Set(Z.map((z) => z.koerper))) {
        const J = Z.filter((z) => z.koerper === k);
        const max = (f, Lz = J) => Math.max(...Lz.map(f)).toFixed(3);
        const B = J.filter((z) => z.bild).map((z) => z.bild);
        console.log(
            `      ${k.padEnd(10)} ${max((z) => z.v)} m/s · Durchtritt ${J.filter((z) => z.durch).length}/${J.length} · Eindringen max ${max((z) => z.tief)} m · Spalt max ${max((z) => z.spalt)} m` +
                (B.length ? ` · im Bild Spalt max ${max((b) => b.spalt, B)} m, Eindringen max ${max((b) => b.tief, B)} m` : "") +
                (J[0].rezept ? ` · ${J[0].rezept} vmax ${J[0].vmax} m/s × ${U.UEBER_VMAX}` : "")
        );
    }
    const S = T.schuss;
    if (S && S.png) fs.writeFileSync(tor.aus.replace(/\.json$/, "") + "-stoss.png", Buffer.from(S.png.split(",")[1], "base64"));
    if (S) console.log(`  Stoß im Ausgabe-Bild: ${S.fehler || `Wagen ${S.px.wagen} px · Bär ${S.px.gestossen} px in 640×360 · ${S.zeile}`}`);
    // die Zeilen, die die Kürzung selbst schuf (die Leiber fehlen), nennt die Probe nicht als Verstoß
    const gekuerzt = /ZEILE FEHLT: (fuchs|wolf|baer|riese|gehen|sprint|fall)\|/;
    for (const x of U.tempoUrteil(T)) if (!gekuerzt.test(x)) console.log("  " + x);
    fs.writeFileSync(tor.aus, JSON.stringify({ zeilen: Z, schmuggel: T.schmuggel, schuss: S ? { px: S.px, zeile: S.zeile, fehler: S.fehler } : null }));
}

// ───────── gelaende.K5#2 — EINE Boden-Höhe je Rolle (gate:koerper-stand K8 `rollen`) in beiden Sichten ─────────
// K8 an Mess-Wiese und 25°-Hang je Sicht (Ego, Third): Feinform, Streu, Huf je Größen-Band, Rad in Fahrt gegen die gezeichneten
// Dreiecke (`__gezeichnet`). Die Anker nehmen heraus, was die Station nicht urteilt: den Fuß des Spielers auf drei Bahnen (leib.K2)
// und den Sprung K9 (leib.K2 Staffel 2); die Sicht setzt der Anker wie die Mess-Kopie `k8Sichten` (`__sicht`). Danach steht die
// Welt wie vorher: Sicht, Lage, Dorf-Zug, Kreatur-Uhr, ohne die Mess-Treppe — Reh, Wagen und Treppe räumt die Linse selbst.
// JE ORT BEIDE SICHTEN (w4-ssa-E, GTX b4bcf19c: „== SICHT first (44.4 s)“, third riss die 90 s): je Sicht ein Ruf über Wiese UND Hang
// sprang Wiese → Hang → Wiese → Hang (312 m), und jede Rückkehr schwang einen Ring neu ein, den die Welt eben verlassen hatte. Jetzt
// misst je Ruf EIN Ort (`nur`, zwei Anker: die Suche des Hangs nur am Hang, die Wiese nur an der Wiese) in einer Sicht, die Reihe ist
// Wiese Ego · Wiese Third · Hang Ego · Hang Third — vor jeder Messung steht die Welt am Ort in der Sicht (das Einschwingen der Linse),
// ein Wechsel der Sicht bewegt nur das Auge. Dasselbe K8, dieselben Rollen, Kontakte und Sollwerte je Ort und Sicht.
async function bodenRollen(tor) {
    const fs = require("fs");
    const L = "scripts/diag-koerper-stand.cjs";
    const n = new Function(tor.dekl(L, ["K8_UMFANG"]) + "\nreturn K8_UMFANG;")();
    const rollen = tor.quelle(L, "rollen", [
        ["async function rollen(n) {", "async function rollen(n, sicht, nur) {"],
        ["const W = window.__messWiese;", "r.setCameraMode(sicht); o.__sicht = s.cameraMode; const W = window.__messWiese;"],
        ['const hang = window.__weltOrt("hang", { mitte: W, min: 24, max: 26, basis: 4 });', 'const hang = nur === "wiese" ? null : window.__weltOrt("hang", { mitte: W, min: 24, max: 26, basis: 4 });'],
        ['["wiese", W[0], W[1]],', '["wiese", nur === "hang" ? NaN : W[0], W[1]],'],
        ["R.fuss = bahn(", "R.fuss = 0 && bahn("],
        ["R.falllinie = bahn(", "R.falllinie = 0 && bahn("],
        ["R.stufe =", "R.stufe = 0 &&"],
        ['if (ort !== "wiese") continue;', "continue;"],
    ]);
    // DER ORT DER PROBE (wie fahrzeug.K3#1): die Mess-Wiese — die Sitzung stellt und beruhigt sie VOR dem Deckel (punkte.cjs `probeOrt`
    // liest den Ort aus diesem Befehl), hier findet die Probe sie stehend; bis w4-ssa-E schwang `rollen` die Wiese im Deckel ein, wo
    // immer die Probe davor die Welt ließ
    await tor.ruf("/umstellen", { ort: "wiese", sicht: "ego" }, 1000 * Math.max(30, Number(process.env.PUNKTE_PROBE_DECKEL_S) || 90));
    const page = await tor.seite();
    tor.karte();
    await page.evaluate("window.__gezeichnet = " + tor.quelle(L, "gezeichnet") + "; window.__eignerKarte = " + tor.quelle(L, "eignerKarte") + ";");
    const vor = await page.evaluate(() => {
        const s = window.anazhRealm.state;
        const p = s.playerMesh.position;
        return { sicht: s.cameraMode, dorf: window.__anazhAutoSettlement, treppe: !!(s.blueprints && s.blueprints.messtreppe), uhr: s.creatureAnimationTime, p: [p.x, p.y, p.z] };
    });
    const erg = { first: { exit: 0, k8: {} }, third: { exit: 0, k8: {} } };
    const z = (o) => (o ? ["fein", "streu", "huf", "rad"].map((k) => k + " " + (o[k] ? o[k].p95 + "/" + o[k].n : "?")).join(" · ") : "fehlt");
    try {
        // die Mess-Wiese in IHREM Zustand wie die Linse (haushalt.json `dorfZug`): kein Auto-Dorf wächst an Wiese und Hang
        await page.evaluate(() => (window.__anazhAutoSettlement = false));
        for (const ort of ["wiese", "hang"])
            for (const sicht of ["first", "third"]) {
                const t = Date.now();
                const E = erg[sicht];
                try {
                    const k8 = await page.evaluate("(" + rollen + ")(" + n + ", " + JSON.stringify(sicht) + ", " + JSON.stringify(ort) + ")");
                    Object.assign(E.k8, { [ort]: k8[ort], __sicht: k8.__sicht, nexus: E.k8.nexus || k8.nexus });
                    console.log("== " + ort + " · SICHT " + sicht + " (" + ((Date.now() - t) / 1000).toFixed(1) + " s): " + z(k8[ort]) + " (p95 cm / Kontakte)");
                } catch (e) {
                    [E.exit, E.fehler] = [1, String((e && e.message) || e).split("\n")[0]];
                    console.log("== " + ort + " · SICHT " + sicht + " FEHLER " + E.fehler);
                }
            }
    } finally {
        await page.evaluate((v) => {
            const r = window.anazhRealm;
            const s = r.state;
            if (v.dorf === undefined) delete window.__anazhAutoSettlement;
            else window.__anazhAutoSettlement = v.dorf;
            if (!v.treppe && s.blueprints) delete s.blueprints.messtreppe;
            if (v.uhr !== undefined) s.creatureAnimationTime = v.uhr;
            if (s.cameraMode !== v.sicht) r.setCameraMode(v.sicht);
            s.playerMesh.position.set(v.p[0], v.p[1], v.p[2]);
            s._fixedSimPos = null;
            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
        }, vor);
    }
    fs.writeFileSync(tor.aus, JSON.stringify(erg));
}

// ───────── tiere.K5#1 — Begegnung im Bild (`werkbank lauf --wandern kreis`) im Zeitraffer ─────────
// Der Kreis der Werkbank (`lauf`, seine Seiten-Funktion aus dem Spiel-Baum, ohne die Spur der Route) zählt 600 SPIEL-s (die
// Uhr `st.spielZeit`, „je 10 Spielminuten“), je Sicht an der Mess-Wiese, 1280×720, Bestand des Spiels. Der ZEITRAFFER an der
// Schleife (`renderer.setAnimationLoop`) fährt je Bild n Takte zu TAKT_DECKEL_S (0,1 s): 600 Spiel-s in Sekunden statt in
// 10 min. Die Bild-Zeiten dieser Probe sind keine Kadenz (der Strom urteilt sie nicht).
// DER RAFFER TAKTET BEI RUHENDEM LOOP (w16-tier-blick-pm, `_loopRuht` in stamm/dirigent-takt.js): bis dahin fuhr er die n Takte in
// der Schleife des Renderers — die GPU-Leine (GPU_FRAMES_IM_FLUG 2) gab je Raffer-Bild höchstens zwei Bilder frei, die übrigen
// acht Takte waren ZWISCHEN-TAKTE ohne Leben (Tiere, Bewohner, Vögel), ihre Zeit trug der nächste Bild-Takt nur bis zu EINEM Deckel
// nach: das Leben lief mit 0,2 Spiel-s je Spiel-Sekunde, der Bestand eines 600-s-Kreises war der von 120 s. Jetzt ruht die Schleife
// des Renderers und der Raffer ruft die Takte selbst (je rAF der Knoten-Rahmen, dann n Takte) — das Gesetz des Spiels für ein
// Instrument, das selbst taktet: jeder Takt trägt die ganze Welt, die Leine hält nur sein Bild.
// DIE UHR ×5 (`UHR`, im Kreis; w19-tier-kreis-pm): die Kosten des Kreises folgen der ZAHL der Takte, nie ihrer Spiel-Länge — jeder
// Raffer-Takt trägt Streuen, Wiese, Stufen, Bild und Leben eines ganzen Takts (headless-Profil 300 Spiel-s Ego an main 5fb21e29,
// ohne Masken: 14,6 ms je Takt, `_loopVoxelStreaming` 31 %, `_loopRender` 24 %, `_loopWeatherAndGrowth` 13 %). Mit der Uhr ×2
// (Takt-Deckel 0,2 s, 3 000 Takte je Sicht) brauchte die Radeon an main 94d9c5a6 allein für Ego 74,8 s (≈ 0,1 s je Spiel-s ohne
// Maske) — Third riss den Deckel 90 s. Jetzt ist der Deckel des Takts 0,5 s (TAKT_DECKEL_S × 5) und der Akkumulator darf fünfmal so
// viele Fix-Schritte (FIXED_MAX_STEPS × 5: 40 × 1/60 s ≥ 0,5 s — der Leib geht die volle Zeit): 2 Takte zu 0,5 s je Raffer-Bild,
// 1 200 Takte je Sicht. DAS GESETZ DER TIERE BLEIBT: es ist auf die Bildrate gebaut (`_kreaturWeg` geht v·dt in Teil-Schritten von
// höchstens einem halben Leib-Radius, der ruhende Leib trägt schon heute seine aufgelaufene Zeit in einem Schritt, `_kreaturTaktDt`)
// — gemessen headless ohne Masken, je zwei Läufe (Tier-Sekunden im Blick · davon ≥ 200 px möglich · Tiere ≥ 200 px möglich):
// Uhr ×2 Ego 1 844/2 270 · 241/694 · 7/7, Third 1 144/1 935 · 297/879 · 6/14; Uhr ×5 Ego 1 118/1 757 · 291/746 · 7/7, Third
// 1 675/1 071 · 283/394 · 9/5; Bestand bis 20 in allen — die Uhr ×5 liegt im Band der Streuung zweier Läufe der Uhr ×2. Wanduhr headless
// Ego 52,1/46,8 → 29,7/35,7 s, Third 47,7/50,8 → 24,0/23,3 s; ein Takt zu 1 s (×10) brachte nichts mehr (Ego 26,5/22,2 s, Third
// 23,6/27,0 s — der Rest folgt der Spiel-Zeit: Fix-Schritte, Teil-Schritte der Leiber, der Strom des Wegs). `maskeMs` im Kreis und
// in FORTSCHRITT nennt die Zeit der Masken.
// Danach steht die Uhr des Spiels wieder (auch im Abbau des Raffers).
// DIE SICHTUNG JE BEGEGNUNG (w16-tier-blick-pm; Radeon 8efb6318: der Deckel riss nach 384 Spiel-s, 23 Schuss-Paare, gesehen 0 — die
// Null-Renderer-Sonde zählte an main je 600 Spiel-s Ego Σ15, Third Σ18 in vier Läufen): der Kreis prüft je SPIEL-SEKUNDE (`TAKT_S`,
// ein Raffer-Bild), nie je 250 ms Wanduhr (die lag n-mal weiter in der Spiel-Zeit), und ohne die Sperre von 2 Spiel-s zwischen zwei
// Prüfungen. Steht ein ungesehenes Tier im Blick, das 200 px decken KANN (je Tier wieder nach 2 Spiel-s oder sobald seine mögliche
// Fläche um 20 % wuchs — ein Tier, das lange fern im Blick steht, zeichnet nicht jede Sekunde), zeichnet DIE MASKE der Klasse tier: drei Bilder des
// Ausgabe-Pfads (`ausgabeAufnahme` aus dem Spiel-Baum, gekürzt um die Geschichte — der Neubeginn der Folge je Bild, gleicher Versatz,
// gleiche Dither-Phase, die Schatten-Karten neu; ohne Erst-Ruhe, ohne Rückstrahl, ohne die 32 Bilder der zeitlichen Auflösung, ohne
// die Abnahme des Beweisbilds): G und G2 mit, O ohne Tiere — dieselbe Klassen-Teilung wie vorher, ein Bild je Schuss statt 33 mit
// Rücklese und Abnahme; danach nimmt die Schleife sofort wieder auf (die Pause von 50 ms in `wieder` trägt einen rAF-Stempel über die
// Lücke — die Stempel des Raffers sind gerechnet). Jede Begegnung wird so in jeder Spiel-Sekunde gemessen, die sie im Blick steht, bis ihr Tier ≥ 200 px deckt;
// jedes Tier zählt einmal; die Sichtung zählt über alle 600 Spiel-s (keine Kappe bei der Staffel). `imBlick` zählt jedes Tier, das
// in der Prüfung einer Spiel-Sekunde zum ersten Mal da ist und schon im Blick steht (das Schlupfloch). Der Anker `__kreis` legt den
// Kreis an die Seite: alle 10 s eine Zeile FORTSCHRITT (Spiel-s, Wanduhr, Masken, Sichtungen; nie am Anfang `KREIS-`, die Zeile des
// Urteils) — reißt der Deckel, nennt die letzte, wo der Kreis stand.
async function tierKreis(tor) {
    const UHR = 5;
    const n = 10 / UHR;
    const TAKT_S = 1; // die Prüfung je Raffer-Bild = je Spiel-Sekunde (der Anker `s + 0.5` unten wartet auf das nächste Bild)
    const bild = tor.quelle("scripts/lib/ausgabe-aufnahme.cjs", "ausgabeAufnahme", [
        ['const erst = await window.__erstRuhe(frame, opt, "die Aufnahme");', "const erst = null;"],
        ["await r._rueckstrahlJetzt(() => (neubeginn(), frame()));", ""],
        ["const nWarm = Math.max(warm ?? 1, st.traaNode ? 32 : 0);", "const nWarm = 0;"],
        ["if (BW === W && BH === H) return { u8: voll, info, ms, tiefe, abnahme: abnahme(voll, W, H, m) };", "if (BW === W && BH === H) return { u8: voll, info, ms, tiefe };"],
    ]);
    const lauf = tor.quelle("scripts/lib/zerlege-linse.cjs", "lauf", [
        ['const kreis = k.wandern === "kreis" ? { gier: st.yaw, gesehen: new Map(), schuesse: 0, imBlick: 0, max: 0 } : null;',
            'const kreis = k.wandern === "kreis" ? { gier: st.yaw, gesehen: new Map(), masken: 0, maskeMs: 0, pruefungen: 0, imBlick: 0, max: 0 } : null;\n        window.__kreis = kreis;'],
        ["await sleep(250);\n                    st.yaw = kreis.gier",
            "for (const z = s + 0.5; st.spielZeit - kreis.z0 < z; ) await new Promise((ok) => requestAnimationFrame(ok));\n" +
            "                    s = st.spielZeit - kreis.z0;\n                    kreis.pruefungen++;\n                    st.yaw = kreis.gier"],
        ["naechst = s + 2;", ""],
        ["for (const q of kand)\n                        if (q.neu && q.px >= soll)",
            "for (const q of kand) window.__kreisPx(q.c, s, 4 * (q.c.userData._ruheKugelR - q.c.userData._ruheKugelH) * q.c.userData._ruheKugelH * (q.rp / q.c.userData._ruheKugelR) ** 2, q.px, soll);\n                    for (const q of kand)\n                        if (q.neu && q.px >= soll)"],
        ['const schuss = async () => (await __ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;',
            'const schuss = async () => (await window.__kreisBild(W, H, 0, { satz: "messung" })).u8;'],
        ["kreis.schuesse++;", "kreis.masken++;\n                    const tMaske = performance.now();"],
        ["neu: neu && 4 * (u._ruheKugelR - u._ruheKugelH) * u._ruheKugelH * f * f >= soll });",
            "neu: neu && window.__kreisNeu(c, s, 4 * (u._ruheKugelR - u._ruheKugelH) * u._ruheKugelH * f * f, soll) });"],
        ["const O = await schuss().finally(() => r.toggleCreatures(true));\n                    await wieder();",
            "const O = await schuss().finally(() => r.toggleCreatures(true));\n                    kreis.maskeMs += performance.now() - tMaske;\n                    tRenderVor = null;\n                    rend.setAnimationLoop(takt);"],
    ]);
    // DIE TEILE (w26-deckel-klasse, `probe.teile` der Station, punkte.cjs fahreGruppe): der Kreis trägt 1 200 Spiel-s — Radeon 87537d3f
    // Ego 555 Spiel-s nach 50,0 s Wanduhr, Third 210 nach 20,0 s, am 90-s-Deckel gerissen (77265b04, a7a9d7bf, e84fd1fb ebenso; e475c6b4
    // 88,9 s am Rand). Der Lauf der Linse bleibt EINER je Sicht: er lebt in der Seite (`window.__kreisTeile`), jeder Teil wartet höchstens
    // seine Frist (PUNKTE_TEIL_FRIST_S) auf ihn; läuft er noch, sagt der Teil `@@PUNKTE@@ TEIL WEITER`, der Kreis läuft in der Seite weiter,
    // und der nächste Teil wartet weiter auf DENSELBEN Lauf. Der letzte Teil wartet ohne eigene Frist: reißt er den Deckel, ist der Kreis
    // UNGEMESSEN beim Namen. Die Zeilen `KREIS-<sicht>` sind die des Laufs in einem Stück; das Urteil liest sie unverändert.
    const [nr, nT] = String(process.env.PUNKTE_TEIL || "1/1").split("/").map(Number);
    const fristS = Number(process.env.PUNKTE_TEIL_FRIST_S) || 0;
    const bis = nr < nT ? Date.now() + Math.max(1000, fristS * 1000 - process.uptime() * 1000 - 1500) : Infinity;
    const page = await tor.seite();
    tor.karte();
    const gehalten = await page.evaluate(() => !!window.__kreisTeile);
    if (nr > 1 && !gehalten) {
        console.log("KREIS-BRUCH Teil " + nr + "/" + nT + ": kein gehaltener Kreis vor diesem Teil");
        process.exitCode = 1;
        return;
    }
    if (!gehalten) {
        await page.evaluate("window.__kreisBild = " + bild);
        await page.evaluate((n) => {
            const r = window.anazhRealm;
            const rend = r.state.renderer;
            const Z = window.__zeitraffer || (window.__zeitraffer = { n: 0, roh: null });
            Z.n = n;
            Z.ms = 1000 * r.constructor.TAKT_DECKEL_S;
            if (Z.roh) return;
            Z.roh = rend.setAnimationLoop;
            Z.gen = 0;
            // EIN BILD JE RAFFER-BILD: die Leine (`_gpuLeineStraff`) hält das Bild jedes Takts vor dem letzten — bei ruhendem Loop trägt
            // er dennoch die ganze Welt (`zwischen` ist dort nie wahr), nur sein Bild fällt
            Z.halt = false;
            r._gpuLeineStraff = function () {
                return Z.halt || Object.getPrototypeOf(this)._gpuLeineStraff.call(this);
            };
            Z.huelle = rend.setAnimationLoop = function (cb) {
                const g = ++Z.gen;
                if (typeof cb !== "function" || !Z.n) return Z.roh.call(this, cb);
                Z.roh.call(this, null);
                let ts = null;
                const bild = (t) => {
                    if (Z.gen !== g) return;
                    if (ts === null) ts = t;
                    rend._nodes?.nodeFrame?.update();
                    try {
                        for (let i = 0; i < Z.n && Z.gen === g; i++) (Z.halt = i < Z.n - 1), cb.call(rend, (ts += Z.ms));
                    } finally {
                        Z.halt = false;
                    }
                    if (Z.gen === g) requestAnimationFrame(bild);
                };
                requestAnimationFrame(bild);
            };
            return 1;
        }, n);
        await tor.ruf("/fenster", { w: 1280, h: 720 });
        await page.evaluate(() => (window.__kreisTeile = { fertig: {}, lauf: null }));
    }
    let haelt = false;
    try {
        for (const sicht of ["ego", "third"]) {
            if (await page.evaluate((s) => !!window.__kreisTeile.fertig[s], sicht)) continue;
            if (!(await page.evaluate((s) => !!window.__kreisTeile.lauf && window.__kreisTeile.lauf.sicht === s, sicht))) {
                await tor.ruf("/umstellen", { ort: "wiese", sicht }, 120000);
                await page.evaluate((u) => {
                    const A = window.anazhRealm.constructor;
                    const Z = window.__zeitraffer;
                    Z.alt = Z.alt || [A.TAKT_DECKEL_S, A.FIXED_MAX_STEPS];
                    [A.TAKT_DECKEL_S, A.FIXED_MAX_STEPS] = [Z.alt[0] * u, Z.alt[1] * u];
                    Z.ms = 1000 * A.TAKT_DECKEL_S;
                    // je Tier die letzte Maske [Spiel-s, mögliche Fläche, gezählte px]. Die HOCHRECHNUNG: die px der letzten Maske × das
                    // Wachstum der möglichen Fläche seitdem. Erreicht sie die halbe Schwelle, kehrt die Maske wie bisher wieder (nach
                    // 2 Spiel-s oder bei 20 % mehr möglicher Fläche); bleibt sie darunter (fern, verdeckt, im Gras), erst nach 6 Spiel-s.
                    // Jede Maske zählt JEDES Tier im Blick (die Pixel gehören dem nächsten Leib): sie misst auch die, die sie nicht
                    // auslösten — so gehen zwei ferne Tiere im selben Takt, nie versetzt (`__kreisPx` je Tier der Maske)
                    const zuletzt = new Map();
                    window.__kreisNeu = (c, s, flaeche, soll) => {
                        const m = zuletzt.get(c);
                        if (flaeche < soll) return false;
                        if (m) {
                            const hoffnung = !(m[2] >= 0) || (m[2] * flaeche) / m[1] >= soll / 2;
                            if (hoffnung ? s - m[0] < 2 && flaeche < 1.2 * m[1] : s - m[0] < 6) return false;
                        }
                        zuletzt.set(c, [s, flaeche, -1]);
                        return true;
                    };
                    window.__kreisPx = (c, s, flaeche, px, soll) => {
                        if (flaeche >= soll) zuletzt.set(c, [s, flaeche, px]);
                    };
                }, UHR);
                // DER LAUF IN DER SEITE: er gehört keinem Teil — sein Ende (das Ergebnis oder der Wurf) steht in `lauf.ende`
                await page.evaluate(
                    "(() => { const T = window.__kreisTeile; const L = (T.lauf = { sicht: " + JSON.stringify(sicht) + ", t: Date.now(), bilder0: window.anazhRealm._gpuLeine.gerendert, ende: null });" +
                        " L.p = (" + lauf + ")(" + JSON.stringify({ sek: 600, ein: 1, ruhe: 0, regler: "frei", tiere: "frei", wandern: "kreis", spur: false }) + ")" +
                        ".then((o) => (L.ende = { o }), (e) => (L.ende = { f: String((e && e.message) || e).split(String.fromCharCode(10))[0] })); return 1; })()"
                );
            }
            const zeile = setInterval(() => {
                page.evaluate(() => {
                    const k = window.__kreis, L = window.__kreisTeile && window.__kreisTeile.lauf;
                    return k && k.z0 != null && L ? { w: (Date.now() - L.t) / 1000, z: { spielS: Math.round(window.anazhRealm.state.spielZeit - k.z0), pruefungen: k.pruefungen, masken: k.masken, maskeS: Math.round(k.maskeMs / 100) / 10, gesehen: k.gesehen.size, imBlick: k.imBlick } } : null;
                }).then((x) => x && console.log("FORTSCHRITT des Kreises " + sicht + " nach " + x.w.toFixed(1) + " s Wanduhr: " + JSON.stringify(x.z)), () => {});
            }, 10000);
            let x = null;
            try {
                x = await page.evaluate((w) => {
                    const L = window.__kreisTeile.lauf;
                    return Promise.race([L.p.then(() => L.ende), new Promise((ok) => setTimeout(() => ok(null), w))]);
                }, Number.isFinite(bis) ? Math.max(0, bis - Date.now()) : 2147483647);
            } finally {
                clearInterval(zeile);
            }
            if (!x) {
                const z = await page.evaluate(() => { const k = window.__kreis; return k && k.z0 != null ? Math.round(window.anazhRealm.state.spielZeit - k.z0) : null; });
                console.log("  KREIS Teil " + nr + "/" + nT + ": " + sicht + " läuft in der Seite weiter (" + z + " Spiel-s) — weiter");
                console.log("@@PUNKTE@@ TEIL WEITER");
                haelt = true;
                return;
            }
            const f = x.f ? " FEHLER " + x.f : "";
            const w = await page.evaluate(() => {
                const T = window.__kreisTeile, L = T.lauf;
                delete window.__kreis;
                delete window.__kreisNeu;
                delete window.__kreisPx;
                const A = window.anazhRealm.constructor;
                const Z = window.__zeitraffer;
                if (Z.alt) [A.TAKT_DECKEL_S, A.FIXED_MAX_STEPS] = Z.alt;
                Z.ms = 1000 * A.TAKT_DECKEL_S;
                delete Z.alt;
                T.fertig[L.sicht] = true;
                T.lauf = null;
                return { s: (Date.now() - L.t) / 1000, bilder: window.anazhRealm._gpuLeine.gerendert - L.bilder0 };
            });
            const k = x.o && x.o.kreis;
            // die gezeichneten Bilder der Takte des Kreises (je Raffer-Bild höchstens eines; die Masken zeichnen neben der Leine)
            if (k) k.bilder = w.bilder;
            console.log("KREIS-" + sicht + " EXIT=" + (k ? 0 : 1) + " (" + w.s.toFixed(1) + " s Wanduhr, Zeitraffer " + n + " Takte zu " + UHR * 100 + " ms je Bild, Prüfung je " + TAKT_S + " Spiel-s" + (nT > 1 ? ", Teil " + nr + "/" + nT : "") + f + ") " + JSON.stringify(k || {}));
        }
    } finally {
        // der Raffer fällt: liegt kein fremder Haken über ihm, steht die Schleife des Renderers wieder wie vorher (nie an der Naht eines Teils)
        if (!haelt) {
            await page.evaluate(() => {
                const Z = window.__zeitraffer;
                const rend = window.anazhRealm.state.renderer;
                delete window.__kreisBild;
                delete window.__kreisTeile;
                delete window.__kreis;
                delete window.__kreisNeu;
                delete window.__kreisPx;
                if (!Z) return 1;
                const A = window.anazhRealm.constructor;
                if (Z.alt) [A.TAKT_DECKEL_S, A.FIXED_MAX_STEPS] = Z.alt;
                Z.n = 0;
                Z.gen++;
                if (rend.setAnimationLoop === Z.huelle) (rend.setAnimationLoop = Z.roh), delete window.__zeitraffer, delete window.anazhRealm._gpuLeineStraff;
                return 1;
            });
            await tor.ruf("/fenster", { w: 1920, h: 1080 });
        }
    }
}

// ───────── streaming.K3#1 — der Sprung um 1 km hält die Kadenz (`werkbank haenger --wandern sprung`) ─────────
// In der warmen Welt: Wiese, Ego, Dorf-Zug aus, dann DREI Sprünge der Hänger-Linse der Werkbank (`/haenger`, ihre Kadenz bis die
// Welt am Ziel steht + 1 s) — jeder 1 km weiter auf +x, also jeder in eine Welt, die dort noch nicht steht (der Median aus 3 wie
// früher aus 3 Sitzungen); Einschwingen 1 s (die Welt steht schon). Danach der Dorf-Zug wie vorher.
async function sprungKadenz(tor) {
    const fs = require("fs");
    const B = tor.aus.replace(/\.json$/, "");
    tor.karte();
    const vor = (await tor.ruf("/eval", { code: "const v = window.__anazhAutoSettlement; window.__anazhAutoSettlement = false; return v === undefined ? null : v;" })).ergebnis;
    try {
        await tor.ruf("/fenster", { w: 1920, h: 1080 });
        await tor.ruf("/umstellen", { ort: "wiese", sicht: "ego" }, 120000);
        for (let n = 1; n <= 3; n++) {
            const datei = B + "-b" + n + "-sprung.json";
            let e = 0;
            try {
                await tor.ruf("/haenger", { ein: 1, regler: "frei", tiere: "frei", wandern: "sprung", schwelle: 50, json: datei }, 180000);
            } catch (x) {
                e = 1;
                console.log("  Sprung " + n + ": " + x.message);
            }
            let s = {};
            try {
                const j = JSON.parse(fs.readFileSync(datei, "utf8"));
                const p = j.sprung;
                s = { m: p.m, stehtS: p.stehtS && +((p.stehtS - p.t0) / 1000).toFixed(1), bau: p.bau[1].sonst - p.bau[0].sonst, frames: j.frames, frameMs: j.frameMs, taktMs: j.taktMs, profil: j.profil, ursachen: j.jeUrsache.slice(0, 3).map((u) => u.ursache + " x" + u.n) };
            } catch (_e) {
                s = {};
            }
            console.log("SPRUNG " + n + " EXIT=" + e + " " + JSON.stringify(s));
        }
    } finally {
        await tor.ruf("/eval", { code: "const v = " + JSON.stringify(vor) + "; if (v === null) delete window.__anazhAutoSettlement; else window.__anazhAutoSettlement = v; return 1;" });
    }
}

// ───────── streaming.K4#2 — kein stiller Ersatz im Haupt-Faden (gate:worker-dichte `--faden --echt`) ─────────
// Die Haken der Linse (`fadenSeite`: woher jede Hydrosphäre und jedes Stau-Feld kommt, die Bytes je Faden) sitzen vor dem ersten
// Skript der Seite — darum lädt diese Probe die Welt EINMAL neu, kalt wie die Linse (Abbild und Platten geräumt, dann `/reload` der
// Werkbank). Gang und Fahrt im Takt der Linse (30 Takte je s), gekürzt: der Gang springt 240 m nach Norden (Teleport statt 2 min
// Laufen) und geht dort 3 s (2 m/s), die Fahrt fährt 10 s bei 16 m/s nach Osten (160 m) mit sechs echten Bau-Klicks, dann der
// Damm des Verbs am Fluss der Mess-Wiese. Der Zähler des Spiels (`_syncBauten`) zählt ab dem Boot. Die Zeilen sind die der Linse.
async function fadenZaehler(tor) {
    const path = require("path");
    const L = "scripts/diag-worker-dichte.cjs";
    const seiteQ = tor.quelle(L, "fadenSeite");
    const bytesQ = tor.quelle(L, "klonBytes");
    const huelleQ = tor.quelle(L, "fadenHuelle");
    const soll = new Function(tor.dekl(L, ["FADEN_SOLL"]) + "\nreturn FADEN_SOLL;")();
    const { WASSER_INSTALL } = require(path.resolve("scripts/lib/wasser-linse.cjs"));
    const page = await tor.seite();
    tor.karte();
    const haken = await page.evaluateOnNewDocument("(" + seiteQ + ")(" + JSON.stringify(bytesQ) + ", " + JSON.stringify(huelleQ) + ");");
    const ursprung = await page.evaluate(() => location.origin);
    await page.goto(ursprung + "/cores.manifest.json", { timeout: 60000 });
    await page.evaluate(() =>
        Promise.all(
            ["anazhChunkMesh", "anazhFoundryAssets"].map((n) => new Promise((ok) => Object.assign(indexedDB.deleteDatabase(n), { onsuccess: ok, onerror: ok })))
        ).then(() => localStorage.clear())
    );
    await tor.ruf("/reload", {}, 300000);
    await page.removeScriptToEvaluateOnNewDocument(haken.identifier); // die Haken gelten DIESER Welt, keiner späteren
    const takt = (n, dx, dz, klicks) =>
        page.evaluate(
            async (n, dx, dz, klicks) => {
                await window.__weltDa(() => r && typeof r._gameLoopTick === "function");
                const p = r.state.playerMesh.position;
                if (!n)
                    for (const weiter = window.__deckel("die Welt steht", 4000); weiter(); ) {
                        if (r.state.voxelChunks && r.state.voxelChunks.size > 20 && r.state.voxelWorkerReady) break;
                        await window.__seitenTakt();
                    }
                r.state.pitch = -Math.PI / 2; // der Blick senkrecht nach unten: ein Bau-Klick setzt den Block unter den Spieler
                const je = klicks ? Math.floor(n / klicks) : 0;
                for (let k = 0, t; k < n; k++) {
                    await window.__seitenTakt();
                    p.x += dx / n;
                    p.z -= dz / n;
                    const y = r._voxelSurfaceY(p.x, p.z);
                    if (Number.isFinite(y)) p.y = y + 1.8;
                    if (je && k % je === je >> 1 && ((t = performance.now()), r.tryMousePlace())) window.__faden.klick.push(performance.now() - t);
                }
                return n ? (n / 30) * 1000 : performance.now();
            },
            n,
            dx,
            dz,
            klicks
        );
    const fenster = (name) => page.evaluate((n) => (window.__faden.fenster = n), name);
    const dauer = { boot: await takt(0, 0, 0, 0) };
    await fenster("gang");
    await page.evaluate(() => {
        const p = r.state.playerMesh.position;
        p.z -= 240;
        const y = r._voxelSurfaceY(p.x, p.z);
        if (Number.isFinite(y)) p.y = y + 1.8;
    });
    dauer.gang = await takt(90, 0, 6, 0);
    await fenster("fahrt");
    dauer.fahrt = await takt(300, 160, 0, 6);
    await page.evaluate(WASSER_INSTALL);
    await fenster("damm");
    await page.evaluate(async () => window.__wasserDamm({ fluss: (await window.__wasserOrte({})).fluss }));
    const F = await page.evaluate(() => JSON.parse(JSON.stringify({ ...window.__faden, bau: r._syncBauten() })));
    const mb = (b) => (b / 1e6).toFixed(2);
    const summe = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
    const proMin = {};
    console.log("\n=== DER FADEN TRÄGT DIE BYTES (K4 · K5), in der Welt der Sitzung ===");
    for (const w of Object.keys(dauer)) {
        const T = F.t[w] || {};
        const teile = [["Faden → Main", T.empfang], ["Main → Faden", T.gesendet], ["Kopie", T.kopie], ["Platte", T.platte]];
        proMin[w] = (teile.reduce((a, [, o]) => a + summe(o), 0) / dauer[w]) * 60000;
        console.log(`  ${w.padEnd(6)} ${(dauer[w] / 1000).toFixed(1)} s · ${mb(proMin[w])} MB/min am Empfang: ${teile.map(([nm, o]) => `${nm} ${mb(summe(o))} MB`).join(" · ")}`);
    }
    console.log(`  Fäden: ${F.faeden.join(" · ")}`);
    const stauTakt = `Takt ${F.stau.ms.toFixed(1)} ms`;
    if (F.stau.ms > 8) F.stau.rot.push(stauTakt);
    for (const [name, Zh] of [["Hydrosphären", F.hydro], [`Stau-Felder (Damm, ${stauTakt})`, F.stau]])
        console.log(`  ${name}: ${Zh.faden} aus dem Faden · ${Zh.rot.length} im Haupt-Faden${Zh.rot.length ? " — " + Zh.rot.join(" | ") : ""}`);
    console.log(
        `  Bauten im Haupt-Faden (Chunk-Stoff, Guss): ${summe(F.bau.stellen)} an Sync-Stellen und Test-Nähten · ${F.bau.sonst} sonst ${JSON.stringify(F.bau.stellen)}${F.bau.rot.length ? " — " + F.bau.rot.slice(0, 6).join(" | ") : ""}`
    );
    const k4 = F.hydro.rot.concat(F.stau.rot, F.bau.rot).reduce((a, x) => a + (parseInt(x) || 1), 0);
    console.log(`  Bau-Klicks in der Fahrt: ${F.klick.length}, die Hand ${F.klick.map((m) => m.toFixed(1)).join(" · ")} ms`);
    const blind =
        F.blind ||
        (!F.haken && "die Haken sitzen nicht") ||
        (F.bau.voll && "das Buch ist voll") ||
        (!F.hydro.faden && !F.hydro.rot.length && "keine Hydrosphäre gesehen") ||
        (!summe((F.t.fahrt || {}).empfang) && "kein Empfang in der Fahrt") ||
        (F.klick.length < 6 && "die Bau-Klicks der Fahrt bauten nicht") ||
        (!F.stau.faden && "kein Feld des Staus aus dem Faden");
    if (blind) console.log(`  ⛔ BLIND: ${blind}`);
    if (k4) console.log(`  ⛔ K4: ${k4} synchrone Bauten im Haupt-Faden, obwohl ein Faden zuständig ist`);
    if (proMin.fahrt > soll) console.log(`  ⛔ K5: ${mb(proMin.fahrt)} MB/min am Empfang in der Fahrt > ${mb(soll)}`);
    if (blind || k4) process.exitCode = 1;
}

// ───────── fahrzeug.K3#2 · fahrzeug.K4#1 · fahrzeug.K4#2 — DIE FAHRT IN DER EINEN WELT (EIN Lauf, Zwillinge) ─────────
// Bis w4-ssa-E (31.10.) fuhr FAHR_SITZUNG (g5.js) gate:fahr-leben GANZ in einer eigenen Null-Welt neben der Sitzung (eigener Browser
// und Server auf {PORT}+20001, alle Zeilen T0–F7, dazu die zweite Seite der Fahr-Bahn an jedem Tor des Genesis-Rings) — die Urteile
// lesen davon nur T4 und T5 —, und zwischen Ritt und Blick ging die Grundstellung nach dem Weg des Ritts durch die Tür (/reload).
// GTX b4bcf19c, e0139769, 379e5f56, 3ed95dcf: ≥ 90 s, zuletzt „@@PUNKTE@@ EXIT 0" (das Ende des Blicks): `wait` hielt die Probe an der
// Null-Welt fest, bis der Deckel kam. Jetzt in der EINEN Welt der Sitzung, in der Reihe der Orte: der Ritt (tempo4.js, WELT) an der
// Mess-Wiese, wo die Sitzung steht; T5 (`probeLeben` per Anker auf das Tempo der Kamera gekürzt) auf der Strecke der Wiese (100 m vor
// dem Weg des Ritts — nach dem Ritt, damit dessen Bahn-Suche die Welt findet, wie sie steht: die Bahn-Wache von T5 räumt ihre Spur); der
// Blick am Steilhang (blick.js, BLICK; er schwingt dort ein); T4 (gekürzt auf den Wechsel) am selben Hang NACH dem Blick (die Bahn-Wache
// von T4 räumt den Hang, der Blick fährt ihn, wie er steht). T4/T5 urteilen die Verdikte der Linse (wechselVerdict; tempoVerdict mit
// kernTempo des Kerns), Name und Wortlaut der Zeilen wie gate:fahr-leben, unter FAHR. Die Proben-Dateien des Koordinations-Baums
// stehen per Blob fest (argv: tempo4.js, blick.js).
async function fahrWelt(tor) {
    const fs = require("fs");
    const path = require("path");
    const crypto = require("crypto");
    const L = "scripts/diag-fahr-leben.cjs";
    const P = "scripts/lib/fahr-proben.cjs";
    const t0 = Date.now();
    const zeit = [];
    const datei = (rel, blob) => {
        const roh = fs.readFileSync(path.join(process.env.K, rel));
        const b = crypto.createHash("sha1").update("blob " + roh.length + "\0").update(roh).digest("hex");
        if (b !== blob) throw new Error(rel + " ist Blob " + b + ", die Station kennt " + blob);
        return roh.toString("utf8");
    };
    const ritt = datei("bericht/3010-heil-fahrzeug/tempo4.js", tor.arg[0]);
    const blick = datei("bericht/2010-buendel-abab/blick.js", tor.arg[1]);
    // die Verdikte der Linse und die Namen ihrer Zeilen T4/T5, wörtlich aus ihrem Text (je genau einmal, sonst laut)
    const d = new Function(tor.dekl(L, ["taeter", "WECHSEL", "wechselVerdict"]) + "\nreturn { taeter, wechselVerdict };")();
    const text = fs.readFileSync(L, "utf8");
    const name = (k) => {
        const m = text.match(new RegExp('"' + k + ' [^"\\n]+"', "g")) || [];
        if (m.length !== 1) throw new Error(L + ": die Zeile " + k + " steht " + m.length + "-mal im Text (Soll 1)");
        return JSON.parse(m[0]);
    };
    const F = require(path.resolve(P));
    require(path.resolve("vehicle-core.js"));
    const mo = require(path.resolve("scripts/lib/band-urteil.cjs")).ladeSpec("wiese").ort.spieler;
    // probeLeben je Teil: T1/T0 (der GT geradeaus), T2 (die Suche des Hangs) und alles ab dem Pferd fallen; T5 ohne T4, T4 ohne T5.
    // DER SCHNITT LÄSST DIE TASTE LOS (`tasten(false)`, richter-hand 13.11.): T5 endet mit gehaltenem W (`tasten(true)` — in der
    // ganzen Linse löst es der Hang danach); ohne ihn ging der Spieler in der Welt der Sitzung weiter, und der Blick am Steilhang
    // schwang nie ein: der Spieler lief in 3 750 Takten 37 m hangauf (−61,6 → −24,7), jeder Fege-Takt neu („DIE WELT STEHT NICHT …
    // streuLod 1120/1230 · archLod wartet“, Radeon 4d52c7bc · 350e6b11 · 507beba6 · 1cd1c408)
    const KURZ = [
        ["const gt = await gtAmStart();", "const gt = null;"],
        ['const hangOrt = window.__weltOrt("hang", {', 'const hangOrt = 0 && window.__weltOrt("hang", {'],
        ["        // (3) Das Pferd: der richtungs-folgende Ritt ohne Lenk-Gesetz (W in Blick-Richtung +x).\n", "        tasten(false);\n        aufraeumen();\n        return res;\n"],
    ];
    const tempo = tor.quelle(P, "probeLeben", [...KURZ, ['const steil = window.__weltOrt("hang", { min: 17, max: 32, basis: 3, bergab: [30, 12], rMax: 800 });', "const steil = null;"]]);
    const wechsel = tor.quelle(P, "probeLeben", [...KURZ, ["const g5 = await gtAmStart();", "const g5 = null;"], ["bilder(120, () => st._kamFovVersatz);", "0 && bilder(120, () => st._kamFovVersatz);"]]);
    const page = await tor.seite();
    tor.karte();
    // die Seiten-Werkzeuge, die die Linse in ihrer Welt trägt (welt-boot CODE_OF_SEITE: `__fehlt` der FOV-Schreiber von T5 — die
    // Werkbank legt nur WARTEN_SEITE in ihre Seite), und die Spione der Linse
    await page.evaluate(require(path.resolve("scripts/lib/welt-boot.cjs")).CODE_OF_SEITE);
    await page.evaluate(`window.__tempoSpion = ${F.tempoSpion}; window.__ruckJeBild = ${F.ruckJeBild};`);
    // DIE FRIST: jeder Ruf an die Werkbank höchstens bis kurz vor den Deckel DIESES Laufs; reißt einer, endet die Probe mit der EINEN
    // Marke (punkte.cjs FRIST_MARKE: kein Urteil, UNGEMESSEN) — nie fährt ein Teil neben einem Rumpf, der in der Seite weiterläuft
    const deckelS = Number(process.env.PUNKTE_PROBE_DECKEL_S) || 90;
    const rest = () => Math.max(1000, t0 + (deckelS - 2) * 1000 - Date.now());
    const riss = (wo, e) => {
        if (!/: Frist \d+ ms/.test(String(e))) return false;
        console.log("@@PUNKTE@@ FRIST " + deckelS + " s der Probe gerissen — " + wo + " (" + ((Date.now() - t0) / 1000).toFixed(1) + " s)");
        return true;
    };
    // WELT und BLICK: der Rumpf über die Werkbank (`/eval`), die Antwort, wie `werkbank eval` sie druckt. Danach der Takt der Welt,
    // wie der Welt-Wechsel ihn auslegt (`_weltAbschied`: `_takt`): tempo4.js räumt seinen Fahrer mit `delete r._gameLoopTick` und
    // nimmt der Welt damit ihr EIGENES Feld — in der Maschine geht die Grundstellung nach dem Weg des Ritts durch die Tür und legt es
    // neu aus; hier takten T5, der Blick und T4 in derselben Welt nach ihm (lokal ohne ihn: jedes Einschwingen danach hing, „DIE WELT
    // HÄNGT … ohne Bau-Ereignis")
    const welt = async (wo, code) => {
        const t = Date.now();
        console.log("@@PUNKTE@@ " + wo);
        const a = await tor.ruf("/eval", { code }, rest()).catch((e) => ({ fehler: String((e && e.message) || e) }));
        // DIE BILDER IN DATEIEN, NIE IN DIE AUSGABE (richter-hand2 13.11.): seit tempo4.js und blick.js wieder fahren, trugen WELT
        // (3) und BLICK (5) ihre Schüsse als 1920×1080-JPEG im JSON — 4,2 MB, über der Kappe der Ausgabe (punkte.cjs `kappe`, 4 MiB,
        // behält das Ende): der Kopf mit WELT fiel ab, fahrzeug.K3#2 las „Welt: kein Ergebnis von tempo4.js“ (Radeon dc9eacb0).
        // Jedes Bild liegt jetzt neben {AUS} (`<aus>-<teil>-<name>.jpg`, wie der Stoß-Schuss oben), die Zeile nennt die Datei
        const B = tor.aus.replace(/\.json$/, "");
        for (const b of (a && a.ergebnis && Array.isArray(a.ergebnis.bilder) && a.ergebnis.bilder) || [])
            if (typeof b.jpg === "string" && b.jpg.startsWith("data:image/jpeg;base64,")) {
                const datei = B + "-" + wo.toLowerCase() + "-" + b.name + ".jpg";
                fs.writeFileSync(datei, Buffer.from(b.jpg.split(",")[1], "base64"));
                [b.jpg, b.jpgDatei] = [undefined, path.basename(datei)];
            }
        console.log(JSON.stringify(a, null, 1));
        console.log("@@PUNKTE@@ EXIT " + (a && a.ergebnis && !a.ergebnis.fehler ? 0 : 1));
        zeit.push(wo + " " + ((Date.now() - t) / 1000).toFixed(1));
        if (riss(wo, a && a.fehler)) return false;
        await page.evaluate(() => {
            const r = window.anazhRealm;
            if (typeof r._gameLoopTick !== "function") r._gameLoopTick = r._takt;
        });
        return true;
    };
    // T5 und T4: `probeLeben` in der Seite, mit derselben Frist (null: gerissen, die Marke steht)
    const leben = async (wo, fn) => {
        const [t, ms] = [Date.now(), rest()];
        let uhr = null;
        const frist = new Promise((_ok, nein) => (uhr = setTimeout(() => nein(new Error(wo + ": Frist " + ms + " ms")), ms)));
        const o = await Promise.race([page.evaluate("(" + fn + ")(" + JSON.stringify({ messort: mo }) + ")"), frist]).catch((e) => ({ riss: e }));
        clearTimeout(uhr);
        zeit.push(wo + " " + ((Date.now() - t) / 1000).toFixed(1));
        if (o && o.riss && riss(wo, o.riss)) return null;
        if (o && o.riss) throw o.riss;
        return o || {};
    };
    // DER ORT DER PROBE (wie fahrzeug.K3#1): die Mess-Wiese — die Sitzung stellt und beruhigt sie VOR dem Deckel (punkte.cjs `probeOrt`
    // liest den Ort aus diesem Befehl); hier findet die Probe sie stehend (der Ritt sucht seine Bahn an `__messWiese`, dem Ort selbst)
    const t1 = Date.now();
    const ort = await tor.ruf("/umstellen", { ort: "wiese", sicht: "ego" }, rest()).then(() => null, (e) => e);
    zeit.push("Ort " + ((Date.now() - t1) / 1000).toFixed(1));
    if (ort && riss("der Ort", ort.message)) return;
    if (ort) throw ort;
    if (!(await welt("WELT", ritt))) return;
    const o5 = await leben("T5", tempo);
    if (!o5 || !(await welt("BLICK", blick))) return;
    const o4 = await leben("T4", wechsel);
    if (!o4) return;
    // die Zeilen der Linse (`check` von gate:fahr-leben), T4 vor T5
    const zeilen = [];
    const check = (n, ok, z) => zeilen.push(`  ${ok ? "✅" : "❌"} ${n}${z ? " — " + z : ""}`);
    for (const o of [o4, o5]) if (o.err) check("Probe ohne Ausnahme", false, String(o.err).split("\n")[0]);
    const vW = d.wechselVerdict(o4.wechsel);
    check(name("T4"), vW.length === 0, `${JSON.stringify(o4.wechsel)}${d.taeter(vW)}`);
    const v5 = F.tempoVerdict(o5.tempo && Object.assign(o5.tempo, F.kernTempo(globalThis.__vehicleCore)));
    check(name("T5"), v5.length === 0, `${JSON.stringify(o5.tempo)}${d.taeter(v5)}`);
    console.log("@@PUNKTE@@ FAHR");
    for (const z of zeilen) console.log(z);
    console.log("  (" + zeit.join(" s · ") + " s in der Welt der Sitzung, " + ((Date.now() - t0) / 1000).toFixed(1) + " s gesamt)");
    console.log("@@PUNKTE@@ EXIT " + (vW.length || v5.length ? 1 : 0));
}

// ───────── fahrzeug.K5#1 — die Rückmeldung (gate:fahr-leben `--rueckmeldung`) und der Motor am Klang-Abgriff (gate:klang-zensus F) ─────────
// RM: die Seiten-Probe des Gates (`probeLeben` mit `nurRueck`, scripts/lib/fahr-proben.cjs) — Glatt, Drift, Hang je 240 Bilder,
// dazu die Mutante; das Urteil `rueckBericht` der Linse. (F) Motor: `koerperSeite` der Klang-Linse, die Anker lassen Landung und
// Doppler (klang.K4) aus — der GT im Sattel, je Drehzahl EIN Klang-Takt am OfflineAudioContext, `koerperUrteil` der Linse.
// Die Linse stubbt das Pad der Seite (`navigator.getGamepads`): die Probe nimmt den Stub danach weg.
async function fahrRueck(tor) {
    const fs = require("fs");
    const path = require("path");
    const L = "scripts/diag-fahr-leben.cjs";
    const P = "scripts/lib/fahr-proben.cjs";
    const KZ = "scripts/diag-klang-zensus.cjs";
    console.log("@@PUNKTE@@ RM");
    if (!/expected\.nurRueck/.test(fs.readFileSync(P, "utf8"))) {
        console.log("keine Zeile RUECKMELDUNG: probeLeben kennt nurRueck nicht (gate:fahr-leben --rueckmeldung fehlt am Stand)");
        console.log("@@PUNKTE@@ EXIT 1");
        process.exitCode = 1;
        return;
    }
    const check = (name, ok, detail) => {
        const z = typeof detail === "object" && detail ? JSON.stringify(detail) : detail;
        console.log(`  ${ok ? "✅" : "❌"} ${name}${z ? " — " + z : ""}`);
    };
    const d = new Function("check", tor.dekl(L, ["RUECK", "taktHz", "rueckMass", "rueckVerdict", "rueckBericht"], ["check"]) + "\nreturn { RUECK, taktHz, rueckBericht };")(check);
    const koerperUrteil = new Function(tor.dekl(KZ, ["koerperUrteil"]) + "\nreturn koerperUrteil;")();
    const koerper = tor.quelle(KZ, "koerperSeite", [
        ['if (!mut || mut === "landung") {', 'if (mut === "landung") {'],
        ['if (!mut || mut === "doppler") {', 'if (mut === "doppler") {'],
    ]);
    const werkzeug = tor.quelle(KZ, "werkzeug");
    const F = require(path.resolve(P));
    const mo = require(path.resolve("scripts/lib/band-urteil.cjs")).ladeSpec("wiese").ort.spieler;
    const MESS = require(path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
    const page = await tor.seite();
    tor.karte();
    await page.evaluate(require(path.resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL);
    await page.evaluate(`window.__tempoSpion = ${F.tempoSpion}; window.__taktHz = ${d.taktHz}; window.__ruckJeBild = ${F.ruckJeBild};`);
    let o = null;
    const t0 = Date.now();
    try {
        o = await page.evaluate(F.probeLeben, { messort: mo, nurRueck: true, rueck: d.RUECK });
    } finally {
        await page.evaluate(() => delete navigator.getGamepads);
    }
    d.rueckBericht(o.rueck || o);
    console.log("  (RM " + ((Date.now() - t0) / 1000).toFixed(1) + " s in der Welt der Sitzung)");
    console.log("@@PUNKTE@@ EXIT 0");
    console.log("@@PUNKTE@@ KLANG");
    const t1 = Date.now();
    await page.evaluate("window.__klangW = (" + werkzeug + ")();");
    await page.evaluate(() => (window.anazhRealm.state.symphony || window.anazhRealm.initSymphony(), 1));
    const Fm = await page.evaluate("(" + koerper + ")(" + JSON.stringify(MESS) + ", null)");
    const fu = koerperUrteil(Fm);
    console.log(`── (F) DER KÖRPER KLINGT: ${fu.zahl}`);
    for (const x of fu.rot) console.log("  ❌ " + x);
    console.log("  (Motor " + ((Date.now() - t1) / 1000).toFixed(1) + " s, " + Fm.motor.length + " Stufen; Landung und Doppler misst klang.K4)");
    console.log("@@PUNKTE@@ EXIT " + (fu.rot.length ? 1 : 0));
}

// ───────── fahrzeug.K2#1 — die Fahrt auf dem Wegenetz (gate:fahr-leben `--wegenetz`) ─────────
// Die Seiten-Probe des Gates (`probeLeben` mit `wegenetz`): die Orte erwachen am Spieler (der Dorf-Zug an, wie das Gate vor dem
// Boot), der GT fährt die feste Route mit dem Fahrer am Steuer in den Bildern der Probe; `wegenetzVerdict` der Linse. Kennt der
// Stand die Fahrt nicht, endet die Probe sofort ROT beim Namen (nie die volle Leben-Probe als Ersatz).
// DIE TEILE (w19-fahrt-ziel-2-pm, `probe.teile` der Station, punkte.cjs fahreGruppe): Orte und Fahrt tragen ~127 s Wanduhr auf der
// GTX (Radeon 43,1 s Orte + 110,9 s Fahrt) — über dem Gesetz einer Probe (45 s). Der Lauf der Linse bleibt EINER und Byte für Byte
// der des Gates (`probeLeben` aus dem Spiel-Baum am SHA): der erste Teil startet ihn in der Seite, jeder Teil gibt ihm die Frist seines
// Prozesses (PUNKTE_TEIL_FRIST_S). Die Naht ist das Warten der Linse zwischen zwei Takten (`window.sleep`: `__gebautNach` nach jedem
// Takt der Orte, die Fahrt nach jedem zweiten Bild) — nach der Frist hält der Lauf dort an; die Welt steht (der Loop der Sitzung ist
// aus, die Uhr der Linse `tMs` ist ihre eigene, Orte, Route, Fahrer und Zählung leben im Lauf), der Teil sagt `@@PUNKTE@@ TEIL
// WEITER`, und der nächste lässt ihn weiterlaufen. Der letzte Teil hält nie: reißt seine Frist, wirft die Naht, die Linse räumt auf,
// und die Probe nennt die Frist (`@@PUNKTE@@ FRIST`, UNGEMESSEN beim Namen). Die Zeile ist die des Laufs in einem Stück.
async function fahrWegenetz(tor) {
    const fs = require("fs");
    const path = require("path");
    const L = "scripts/diag-fahr-leben.cjs";
    const P = "scripts/lib/fahr-proben.cjs";
    if (!/expected\.wegenetz/.test(fs.readFileSync(P, "utf8")) || !/wegenetzVerdict/.test(fs.readFileSync(L, "utf8"))) {
        console.log("keine WEGENETZ-Zeile: probeLeben kennt die Fahrt auf dem Wegenetz nicht (gate:fahr-leben --wegenetz fehlt am Stand)");
        process.exitCode = 1;
        return;
    }
    const [nr, n] = String(process.env.PUNKTE_TEIL || "1/1").split("/").map(Number);
    const fristS = Number(process.env.PUNKTE_TEIL_FRIST_S) || 0;
    const d = new Function(tor.dekl(L, ["WEGENETZ", "wegenetzVerdict", "taktHz"]) + "\nreturn { WEGENETZ, wegenetzVerdict, taktHz };")();
    const F = require(path.resolve(P));
    const mo = require(path.resolve("scripts/lib/band-urteil.cjs")).ladeSpec("wiese").ort.spieler;
    const page = await tor.seite();
    tor.karte();
    if (nr === 1) {
        await page.evaluate(require(path.resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL);
        await page.evaluate(`window.__tempoSpion = ${F.tempoSpion}; window.__taktHz = ${d.taktHz}; window.__ruckJeBild = ${F.ruckJeBild};`);
        await page.evaluate(() => (window.__anazhAutoSettlement = true));
    }
    const t0 = Date.now();
    // DER TEIL IN DER SEITE: `neu` startet den Lauf hinter der Naht, sonst läuft der gehaltene weiter; Rückgabe der Stand am Halt
    // ({ teil }) oder das Ergebnis der Linse — am Ende fällt die Naht (window.sleep wie vorher)
    const teilSeite = async (a) => {
        let T = window.__wegenetzTeil;
        if (a.neu) {
            if (T) window.sleep = T.schlaf; // ein Lauf einer gefallenen Probe: seine Naht fällt
            T = window.__wegenetzTeil = { schlaf: window.sleep };
            T.naht = async () => {
                if (performance.now() < T.frist) return;
                if (T.letzter) throw new Error("DIE TEILE DER FAHRT reichten nicht: die Frist des letzten Teils riss an der Naht");
                await new Promise((w) => ((T.weiter = w), T.halt()));
            };
            window.sleep = (...x) => T.naht().then(() => T.schlaf(...x));
        } else if (!T || !T.weiter) return { err: "DIE TEILE DER FAHRT: kein gehaltener Lauf vor diesem Teil" };
        [T.frist, T.letzter] = [performance.now() + a.ms, a.letzter];
        const halt = new Promise((h) => (T.halt = h));
        if (a.neu)
            T.lauf = new Function("return " + a.code)()(a.arg).finally(() => {
                window.sleep = T.schlaf;
                if (window.__wegenetzTeil === T) delete window.__wegenetzTeil;
            });
        else T.weiter();
        const x = await Promise.race([T.lauf.then((o) => ({ o })), halt.then(() => null)]);
        const p = st.playerMesh.position;
        return x ? x.o : { teil: { lage: [Math.round(p.x), Math.round(p.z)], orte: r._bewohnerSiedlungen ? r._bewohnerSiedlungen.size : 0 } };
    };
    // die Frist der Seite: der Rest der Teil-Frist seit dem Start des Prozesses, 1 s für Zeile und Abbau (ohne Teile: keine)
    const ms = n > 1 ? Math.max(1000, fristS * 1000 - process.uptime() * 1000 - 1000) : 1e12;
    const arg = { messort: mo, wegenetz: { ...d.WEGENETZ, mutante: false, gleich: false } };
    const o = await page.evaluate(teilSeite, { code: String(F.probeLeben), arg, ms, letzter: nr >= n, neu: nr === 1 });
    const s = ((Date.now() - t0) / 1000).toFixed(1);
    if (o.teil) {
        console.log(`  WN Teil ${nr}/${n}: der Lauf hält nach ${s} s an der Naht (Spieler bei ${o.teil.lage.join(", ")}, ${o.teil.orte} Orte wach) — weiter`);
        console.log("@@PUNKTE@@ TEIL WEITER");
        return;
    }
    if (/DIE TEILE DER FAHRT reichten nicht/.test(String(o.err))) console.log(`@@PUNKTE@@ FRIST ${fristS} s der Probe gerissen: ${String(o.err).split("\n")[0]} (Teil ${nr}/${n})`);
    const v = o.wegenetz ? d.wegenetzVerdict(o.wegenetz) : [String(o.err || "keine Fahrt").split("\n")[0]];
    console.log(`  ${v.length ? "❌" : "✅"} WN (fahrzeug.K2) die Fahrt auf dem Wegenetz — ${v.join(" · ") || "auf dem Netz"} · ${s} s in der Welt der Sitzung (Teil ${nr}/${n})`);
    console.log(`WEGENETZ ${JSON.stringify(o.wegenetz)}`);
    if (v.length) process.exitCode = 1;
}

// ───────── gelaende.K2#1 und #2 — das Wasser folgt jedem Edit: Graben (Third, Ego), Damm, Ferne ─────────
// EINE Probe für beide Staffeln (Zwillinge: derselbe Befehl, die Sitzung fährt ihn einmal). (a) der Graben über die ECHTE Eingabe
// wie die Mess-Bahn m2-graben (koordination bericht/2210-messschuld-6cfce/skripte): am Fluss nächst Genesis, der Spieler 2,2 m
// landeinwärts (Ego: um den Punkt gedreht, bis die Abnahme des Blicks frei ist und das Fadenkreuz den Boden trifft), das
// Fadenkreuz auf dem Punkt (zielen.js der Bahn), CDP-Klick → Verb graben, der Spiel-Loop läuft; je präsentiertem Bild die
// gezeichneten Wasser-Flächen über ±4,5 m, 3 s lang (gefüllt = 90 % des Stands nach 3 s, Soll ≤ 2 s); je Graben das Bild 2 s
// nach dem Klick aus dem Ausgabe-Pfad. Third an zwei Saaten (je 1 m und 3 m), Ego an einer dritten — nie zweimal am selben Punkt.
// Dann (d) die Ferne und (b) der Damm aus dem Verb über die Wasser-Linse (`__wasserDamm`, wie gate:wasser-leben) am Fluss der
// Mess-Wiese — zuletzt: der Strom der Linse legt den Bild-Renderer still. Die Probe gräbt und schüttet: mutiert.
async function wasserGraben(tor) {
    const fs = require("fs");
    const path = require("path");
    const KOORD = tor.arg[0];
    const B = tor.aus.replace(/\.json$/, "");
    const { WASSER_INSTALL } = require(path.resolve("scripts/lib/wasser-linse.cjs"));
    const zielen = fs.readFileSync(path.join(KOORD, "bericht", "2210-messschuld-6cfce", "skripte", "zielen.js"), "utf8");
    const page = await tor.seite();
    tor.karte();
    const cdp = await page.target().createCDPSession();
    const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
    const erg = { third: null, ego: null, damm: null, ferne: null };
    await page.evaluate(WASSER_INSTALL);
    await page.evaluate(zielen);
    const [mx, my] = await page.evaluate(() => [Math.round(innerWidth / 2), Math.round(innerHeight / 2)]);
    const klick = async () => {
        for (const type of ["mousePressed", "mouseReleased"]) await cdp.send("Input.dispatchMouseEvent", { type, x: mx, y: my, button: "left", clickCount: 1 });
    };
    // die Ufer-Punkte am Fluss nächst Genesis (die Saaten der Bahn: je ein Punkt des Laufs, nie im See)
    const SAATEN = [11, 23, 37, 51, 73];
    const punkte = await page.evaluate((saaten) => {
        const r = window.anazhRealm;
        const g = typeof r._genesisMitte === "function" ? r._genesisMitte() : r.state.playerMesh.position;
        const fn = window.__wasserFlussNah(r, g.x, g.z);
        if (!fn.p) return { fehler: "kein Fluss nächst Genesis" };
        const rv = fn.fluesse.find((f) => f.points.includes(fn.p));
        const k0 = rv.points.indexOf(fn.p);
        return saaten.map((s, i) => {
            let x = (s * 2654435761) >>> 0;
            x ^= x >>> 13;
            let k = k0 + (i - 2) * 9 + ((x % 5) - 2);
            if (k < 1) k = 1 + (1 - k) + 40;
            if (k > rv.points.length - 2) k = rv.points.length - 2 - (k - rv.points.length) - 40;
            k = Math.max(1, Math.min(rv.points.length - 2, k));
            const a = rv.points[k];
            return { saat: s, k, a: { x: a.x, z: a.z }, seite: x & 1 ? 1 : -1 };
        });
    }, SAATEN);
    if (punkte.fehler) throw new Error(punkte.fehler);
    const graben = async (P, abstand, sicht) => {
        const g = await page.evaluate(
            async (P, abstand, sicht) => {
                const r = window.anazhRealm;
                const st = r.state;
                const { p: q, vor: b } = window.__wasserFlussNah(r, P.a.x, P.a.z);
                const nl = Math.hypot(q.x - b.x, q.z - b.z) || 1;
                const nx = (-(q.z - b.z) / nl) * P.seite;
                const nz = ((q.x - b.x) / nl) * P.seite;
                const krone = window.__wasserKroneVon(r, q);
                const px = q.x + nx * (krone + abstand);
                const pz = q.z + nz * (krone + abstand);
                const stellen = (w) => {
                    const c = Math.cos((w * Math.PI) / 180);
                    const s = Math.sin((w * Math.PI) / 180);
                    const sx = px + (nx * c - nz * s) * 2.2;
                    const sz = pz + (nx * s + nz * c) * 2.2;
                    st.playerMesh.position.set(sx, r._voxelSurfaceY(sx, sz) + 1.8, sz);
                    if (st._fixedSimPos) st._fixedSimPos.copy(st.playerMesh.position);
                    return [+sx.toFixed(2), +sz.toFixed(2)];
                };
                let spieler = stellen(0);
                if (st.cameraMode !== sicht) r.setCameraMode(sicht);
                // DIE WELT STEHT am Graben: das EINE Einschwingen (`__weltStehtNach` hält den Regler, solange sie schwingt — ein atmender
                // Regler weckt die Takte ohne Ende), sein Deckel beim Namen. Bis 30.10. eine eigene Schleife ohne gehaltenen Regler und
                // mit stiller 30-s-Frist: auch nach 2 m Weg 119–151 Takte (Radeon 379e5f56)
                const takte = await window.__weltStehtNach();
                window.__gp = { px, pz };
                const ziel = () => window.__zielen({ x: px, y: r._voxelSurfaceY(px, pz), z: pz });
                await ziel();
                const o = { px: +px.toFixed(2), pz: +pz.toFixed(2), krone: +krone.toFixed(2), sicht, takte };
                if (sicht !== "first") return Object.assign(o, { spieler });
                const stand = [];
                for (const w of [0, 15, -15, 30, -30, 45, -45, 60, -60, 90, -90]) {
                    if (w) (spieler = stellen(w)), await ziel();
                    const rot = window.__abnahmeUrteil(window.__abnahmeMessen({})).rot.filter((u) => !u.feld.startsWith("bild."));
                    const bau = r._pickArchitectureAtCrosshair();
                    if (bau && bau.entry) rot.push({ grund: "Bauwerk am Fadenkreuz " + (bau.entry.type || bau.entry.id) });
                    if (r._ernteZiel()) rot.push({ grund: "Blüte am Fadenkreuz" });
                    stand.push({ w, rot: rot.map((u) => u.grund) });
                    if (!rot.length) break;
                }
                if (stand[stand.length - 1].rot.length && stand.length > 1) (spieler = stellen(0)), await ziel();
                return Object.assign(o, { spieler, stand });
            },
            P,
            abstand,
            sicht
        );
        // der Zeiger gefangen wie beim Spieler, ehe die Spur auf den Klick wartet (sein Klick ist kein Graben-Klick)
        if (!(await page.evaluate(() => window.anazhRealm.state.isPointerLocked))) (await page.bringToFront(), await klick(), await warte(400));
        // je präsentiertem Bild die gezeichneten Wasser-Flächen über ±4,5 m (je Netz die oberste, wie wasser-linse `wasserGraben`)
        await page.evaluate(() => {
            const r = window.anazhRealm;
            const span = r._voxelChunkConfig(0).span;
            const G = window.__gp;
            const flaechen = (x, z) => {
                const ys = [];
                for (let dz = -1; dz <= 1; dz++)
                    for (let dx = -1; dx <= 1; dx++) {
                        const n = r._wasserNetz(Math.floor(x / span) + dx, Math.floor(z / span) + dz);
                        const y = n ? r.constructor._wasserNetzHoehe(n, x, z) : null;
                        if (y !== null) ys.push(y);
                    }
                return ys.sort((p, q) => p - q).filter((y, j, l) => !j || y - l[j - 1] > 0.1);
            };
            const messen = () => {
                const m = { nass: 0, doppelt: 0, ueber: 0, ueberM: 0 };
                for (let gz = -4.5; gz <= 4.5; gz += 0.5)
                    for (let gx = -4.5; gx <= 4.5; gx += 0.5) {
                        const x = G.px + gx;
                        const z = G.pz + gz;
                        const g = r._bodenSichtAt(x, z) ?? r._voxelSurfaceY(x, z);
                        const ys = flaechen(x, z).filter((y) => y > g + 0.1);
                        if (!ys.length) continue;
                        const atlas = r._atlasWaterLevelAt(x, z, g);
                        const Sp = atlas > -Infinity ? atlas : r._hydroSpiegelQuer(x, z);
                        const top = ys[ys.length - 1];
                        m.nass++;
                        if (ys.length > 1) m.doppelt++;
                        if (top > Sp + 0.1) (m.ueber++, (m.ueberM = Math.max(m.ueberM, +(top - Sp).toFixed(2))));
                    }
                return m;
            };
            window.__gSpur = [];
            window.__gT0 = null;
            window.__gVor = messen();
            window.addEventListener("mousedown", () => window.__gT0 == null && (window.__gT0 = performance.now()), { once: true, capture: true });
            // DAS ENDE DER SPUR ist ein Ereignis (`__gFertig`: das letzte Bild vor 3 s nach dem Klick), nie eine Uhr danach
            window.__gFertig = new Promise((fertig) => {
                const f = () => {
                    if (window.__gT0 != null && performance.now() - window.__gT0 < 3000) (window.__gSpur.push([+(performance.now() - window.__gT0).toFixed(1), messen()]), requestAnimationFrame(f));
                    else if (window.__gT0 == null) requestAnimationFrame(f);
                    else fertig(window.__gSpur.length);
                };
                requestAnimationFrame(f);
            });
        });
        await klick();
        await warte(2000);
        g.bild = [];
        const frei = !g.stand || !g.stand[g.stand.length - 1].rot.length;
        if (frei)
            try {
                const url = await page.evaluate(async () => {
                    const { u8 } = await window.__ausgabeAufnahme(960, 540);
                    return window.__png(u8, 960, 540);
                });
                fs.writeFileSync(B + "-" + (sicht === "first" ? "ego" : "third") + "-s" + P.saat + "-a" + abstand + "-2s.png", Buffer.from(url.split(",")[1], "base64"));
                g.bild.push("2s");
            } catch (e) {
                g.bildFehler = String((e && e.message) || e).split("\n")[0].slice(0, 200);
            }
        // die Spur endet 3 s nach dem Klick: auf ihr Ende warten (bis 30.10. 1,2 s Uhr nach dem Bild, das selbst Zeit trug); die
        // Frist 4 s fängt nur einen Klick, den kein mousedown erreichte — dann bleibt die Spur leer, ROT beim Namen (`leer`)
        await Promise.race([page.evaluate(() => window.__gFertig), warte(4000)]);
        const sp = await page.evaluate(() => ({ spur: window.__gSpur, vor: window.__gVor, verb: window.anazhRealm.state.player._mausVerb }));
        const end = sp.spur.length ? sp.spur[sp.spur.length - 1][1].nass : 0;
        const voll = sp.spur.find((x) => x[1].nass >= 0.9 * end && end > sp.vor.nass);
        const z = Object.assign({ saat: P.saat, abstand }, g, {
            verb: sp.verb,
            bilder: sp.spur.length,
            nassVor: sp.vor.nass,
            nassEnde: end,
            gefuelltMs: voll ? voll[0] : null,
            doppeltMax: Math.max(0, ...sp.spur.map((x) => x[1].doppelt)),
            ueberMax: Math.max(0, ...sp.spur.map((x) => x[1].ueber)),
            ueberMaxM: Math.max(0, ...sp.spur.map((x) => x[1].ueberM)),
        });
        console.log("  GRABEN " + JSON.stringify({ sicht, saat: z.saat, abstand, verb: z.verb, bild: z.bild.join("+"), nassVor: z.nassVor, nassEnde: z.nassEnde, gefuelltMs: z.gefuelltMs, doppeltMax: z.doppeltMax, ueberMax: z.ueberMax, bilder: z.bilder }));
        return z;
    };
    // (d) die Ferne, dann (b) der Damm ZUERST (w4-stationen-schnell-b; GTX b4bcf19c 64,1 s): ihr Fluss ist der der Mess-Wiese (90 m von
    // ihr, der Spieler 40 bzw. 150 m neben dem Damm) — die Sitzung stellt die Wiese VOR dem Deckel (`probeOrt` liest den Ruf unten).
    // Bis dahin lief (a) zuerst am Graben-Fluss (~1,6 km fern jedes Messorts) und die Probe zahlte zwei kalte Ankünfte im Deckel: dort
    // hin und zum Damm zurück; jetzt EINE. Die Orte bleiben getrennt (1,6 km): der Damm hebt nie das Wasser eines Grabens. (a) folgt im
    // trockenen Sonnenlicht, das (b)(d) als Wort des Spielers setzt
    await tor.ruf("/umstellen", { ort: "wiese", sicht: "ego" }, 300000);
    const t1 = Date.now();
    // das Wort über den EINEN Weg einer Probe (`__wetterSetzen`): `umstellen` hält den Mess-Halt, `_setWeather` von Hand fiel darunter still
    await page.evaluate(() => {
        if (window.__wetterSetzen("sunny") !== "sunny") throw new Error("das Wetter der Probe gilt nicht: sunny (es gilt " + st.weather + ")");
        return (r._naesseTakt(1e6), 1);
    });
    const fluss = await page.evaluate(async () => (await window.__wasserOrte({})).fluss);
    for (const [teil, ferne] of [["ferne", true], ["damm", false]])
        try {
            erg[teil] = await page.evaluate((f, ferne) => window.__wasserDamm({ fluss: f, ferne }), fluss, ferne);
        } catch (e) {
            erg[teil] = { fehler: String((e && e.message) || e).split("\n")[0] };
        }
    console.log("  (b)(d) " + ((Date.now() - t1) / 1000).toFixed(1) + " s · Damm " + JSON.stringify(erg.damm) + " · Ferne " + JSON.stringify(erg.ferne));
    const t0 = Date.now();
    const sichtVor = await page.evaluate(() => (window.__loop(true), window.anazhRealm.state.cameraMode));
    // der Zeiger EINMAL vorab gefangen, ehe ein Fadenkreuz auf einem Graben-Punkt liegt
    await page.bringToFront();
    if (!(await page.evaluate(() => window.anazhRealm.state.isPointerLocked))) (await klick(), await warte(400));
    try {
        for (const [teil, sicht, idx] of [["third", "third", [0, 2]], ["ego", "first", [1]]]) {
            const liste = [];
            try {
                for (const i of idx) for (const abstand of [1, 3]) liste.push(await graben(punkte[i], abstand, sicht));
                erg[teil] = { graeben: liste };
            } catch (e) {
                erg[teil] = { graeben: liste, fehler: String((e && e.message) || e).split("\n")[0] };
                console.log("  " + teil + " FEHLER " + erg[teil].fehler);
            }
        }
    } finally {
        await page.evaluate((s) => (window.__loop(false), window.anazhRealm.setCameraMode(s), 1), sichtVor);
    }
    console.log("  (a) " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
    await cdp.detach().catch(() => {});
    fs.writeFileSync(tor.aus, JSON.stringify(erg, null, 1));
}

// ───────── wetter.K2#1 — die Nässe im Dorf (werkbank `licht --naesse dorf`, gate:naesse:echt) ─────────
// Die Seiten-Funktion der Linse (`naesseSicht`, scripts/lib/licht-linsen.cjs am SHA) über die Werkbank der Sitzung, nur das, was das
// Urteil liest: das Haus am Messort dorf (das nächste mit Hülle und Tür, seine Schwelle), der Spieler an der Schwelle, dann die Pose
// klar · Regen frisch · Regen 10 min — porös draußen, innen unter dem Dach, dicht, Regen innen. Der erste Ruf nennt den Messort, die
// Sitzung stellt ihn darum VOR dem Deckel (punkte.cjs `probeOrt`: das Wachsen des Dorfs ist der Ring des Orts, nie die Arbeit der
// Probe). Bis 30.10. fuhr die Probe den ganzen CLI-Lauf (Radeon 379e5f56, 44,6 s): das Dorf 19,5 s im Deckel, dazu die Dach-Bauten
// ohne Hülle — ein Gang an den Marktstand (13,1 s) und zurück an den Ort (2,3 s) für eine Zeile, die kein Urteil der Station liest
// (sie bleibt im CLI-Lauf der Linse). Die Welt danach trägt ein Dorf mehr (mutiert).
async function naesseDorf(tor) {
    const fs = require("fs");
    const sicht = tor.quelle("scripts/lib/licht-linsen.cjs", "naesseSicht");
    tor.karte();
    const lauf = async (o) => (await tor.ruf("/eval", { code: "return await (" + sicht + ")(" + JSON.stringify(o) + ");" }, 120000)).ergebnis;
    let dorf;
    try {
        await tor.ruf("/umstellen", { ort: "dorf", sicht: "ego" }, 300000);
        const s = (await lauf({ ort: "dorf", haus: true })).schwelle;
        await tor.ruf("/umstellen", { x: s[0], z: s[2] }, 300000);
        dorf = await lauf({ ort: "dorf" });
    } catch (e) {
        dorf = { fehler: String((e && e.message) || e).split("\n")[0].slice(0, 300) };
    }
    console.log(JSON.stringify({ dorf }, null, 1));
    fs.writeFileSync(tor.aus, JSON.stringify({ dorf }, null, 1));
}

// ───────── wetter.K2#2 — DIE NÄSSE AN DER MESS-WIESE IN EGO UND THIRD (w15-pfuetze) ─────────
// Die Seiten-Funktion der Linse (`naesseSicht`, scripts/lib/licht-linsen.cjs am SHA — `werkbank licht --naesse wiese,wiese:third`)
// je Sicht: der Messort Wiese in der Sicht (`/umstellen`), dann klar gegen 10 min Regen aus dem Ausgabe-Pfad. Die Dorfgasse misst
// die Staffel 1 (`naesseDorf`): dort stellt die Linse die Kamera selbst an die Schwelle, Ego und Third sind derselbe Schuss.
async function naesseWiese(tor) {
    const fs = require("fs");
    const sicht = tor.quelle("scripts/lib/licht-linsen.cjs", "naesseSicht");
    tor.karte();
    const wiese = {};
    for (const s of ["ego", "third"])
        try {
            await tor.ruf("/umstellen", { ort: "wiese", sicht: s }, 300000);
            wiese[s] = (await tor.ruf("/eval", { code: "return await (" + sicht + ")(" + JSON.stringify({ ort: "wiese" }) + ");" }, 120000)).ergebnis;
        } catch (e) {
            wiese[s] = { fehler: String((e && e.message) || e).split("\n")[0].slice(0, 300) };
        }
    console.log(JSON.stringify({ wiese }, null, 1));
    fs.writeFileSync(tor.aus, JSON.stringify({ wiese }, null, 1));
}

// ───────── DIE LINSE DER WERKBANK IN DER WELT DER SITZUNG (licht.K1#1 · licht.K3#1/#2, w4-fehlt-acht) ─────────
// Der Befehl der Linse selbst (scripts/werkbank.cjs am SHA, Byte für Byte) gegen die Welt der Sitzung, ohne `--eigen`: sein Tor
// (welt-boot `werkbankTor`) bootete eine eigene Welt — `werkbank start` OHNE `--echt`, headless im Fenster 640×360 — und stand darum
// in SITZUNG_FEINDE. Die Probe stellt das Fenster der Station (`L.fenster`, wie das Tor es trug: die Messgröße bleibt die der
// Station) und schaltet zwischen Linse und Werkbank DEN SPIEGEL (WERKBANK_PORT + 2, im Band der Sitzung): jeder Ruf geht Byte für
// Byte durch, nur das Abwarten nicht — `/lauf` mit dem Einschwingen der Laub-Linse (`ein()`: 5 s Lauf, 8 s Einschwingen, Ruhe bis
// 120 s; je Zeile bis zu sechsmal) ist DIE BERUHIGUNG beim Namen: die Bühne wie der Lauf (Mittag · Sonne · Sommer, `__buehne`), dann
// Takt um Takt, bis die Welt steht (`__weltStehtNach`, A9 — die EINE Ruhe: Foundry, Chunks, Wald, Karten, Felder, Leiber). `L.vorher`:
// der Messort der Linse (`umstellen --ort X`, die Sitzung stellt ihn VOR dem Deckel: punkte.cjs `probeOrt`); `L.seite`: Seiten-
// Funktionen der Linse, mit Ankern gekürzt, für die Dauer der Probe an ihrem Namen (danach die der Linse zurück). Je Ruf, der Zeit
// trägt, eine Zeile (RUF · BERUHIGUNG) mit seinen Sekunden: reißt der Deckel, nennt die letzte, wo.
async function werkbankLinse(tor) {
    const http = require("http");
    const cp = require("child_process");
    const L = JSON.parse(tor.arg[0]);
    const S = tor.W + 2;
    const t0 = Date.now();
    const sek = (t) => ((Date.now() - t) / 1000).toFixed(1);
    tor.karte();
    if (L.vorher) {
        const v = cp.spawnSync(process.execPath, ["scripts/werkbank.cjs", ...L.vorher, "--port", String(tor.W)], { encoding: "utf8", timeout: 600000 });
        console.log("VORHER werkbank " + L.vorher.join(" ") + " EXIT=" + v.status + " · " + sek(t0) + " s");
        if (v.status !== 0) throw new Error("der Messort der Linse steht nicht: " + String((v.stdout || "") + (v.stderr || "")).trim().split("\n").slice(-2).join(" | ").slice(0, 300));
    }
    let n = 0;
    const ruhe = async (b) => {
        const t = Date.now();
        const e = (await tor.ruf("/eval", { code: "window.__buehne(); return await window.__weltStehtNach(null, " + L.ruheMax + ");" }, 600000)).ergebnis;
        console.log("BERUHIGUNG " + ++n + " statt /lauf " + JSON.stringify(b) + ": die Welt steht nach " + e + " Takten, " + sek(t) + " s · " + sek(t0) + " s");
        return { beruhigt: e };
    };
    const spiegel = http.createServer((q, a) => {
        const teile = [];
        q.on("data", (c) => teile.push(c));
        q.on("end", () => {
            const roh = Buffer.concat(teile);
            let b = null;
            try {
                b = JSON.parse(roh.toString("utf8") || "{}");
            } catch (_e) {
                b = null;
            }
            if (q.url === "/lauf" && b && b.sek === 5 && b.ein === 8 && b.ruhe === 120)
                return ruhe(b).then((j) => a.end(JSON.stringify(j)), (e) => a.end(JSON.stringify({ fehler: "BERUHIGUNG: " + e.message })));
            const t = Date.now();
            const was = b && (b.code ? String(b.code).slice(0, 48) + (/"uhren":\[/.test(b.code) ? " (" + (String(b.code).match(/"uhren":\[([^\]]*)\]/)[1].split(",").length) + " Uhren)" : "") : JSON.stringify(b).slice(0, 80));
            const w = http.request({ host: "127.0.0.1", port: tor.W, path: q.url, method: q.method, headers: q.headers, agent: false }, (x) => {
                a.writeHead(x.statusCode, x.headers);
                x.pipe(a);
                x.on("end", () => Date.now() - t >= 2000 && console.log("RUF " + q.url + " " + was + " · " + sek(t) + " s · " + sek(t0) + " s"));
            });
            w.on("error", (e) => a.end(JSON.stringify({ fehler: "SPIEGEL: " + e.message })));
            w.end(roh);
        });
    });
    await new Promise((ok, nein) => spiegel.once("error", nein).listen(S, "127.0.0.1", ok));
    const namen = Object.keys(L.seite || {});
    try {
        await tor.ruf("/fenster", { w: L.fenster[0], h: L.fenster[1] });
        if (namen.length) {
            const code = namen.map((k) => "window.__linse_" + k + " = window." + k + "; window." + k + " = " + tor.quelle(...L.seite[k]) + ";").join("\n");
            await tor.ruf("/eval", { code: code + " return 1;" });
        }
        const kind = cp.spawn(process.execPath, ["scripts/werkbank.cjs", ...L.args, "--port", String(S), "--datei", tor.aus], {
            env: { ...process.env, WERKBANK_PORT: String(S) },
            stdio: ["ignore", "pipe", "pipe"],
        });
        kind.stdout.on("data", (d) => process.stdout.write(d));
        kind.stderr.on("data", (d) => process.stderr.write(d));
        const code = await new Promise((ok) => kind.on("exit", (c) => ok(c == null ? 1 : c)));
        console.log("LINSE werkbank " + L.args.join(" ") + " EXIT=" + code + " nach " + sek(t0) + " s in der Welt der Sitzung (" + n + " Beruhigungen, Fenster " + L.fenster.join("×") + ")");
        process.exitCode = code;
        // DER WEG GEGEN DIE LINSE (`L.pruefe`, in der Seite): kürzt die Probe einen Weg der Linse, misst sie ihn hier gegen den vollen —
        // weicht er ab (`rot`), ist die Probe ROT beim Namen (Exit 1), nie still kurz
        if (L.pruefe) {
            const p = (await tor.ruf("/eval", { code: L.pruefe })).ergebnis;
            console.log("WEG " + JSON.stringify(p));
            if (!p || p.rot) (process.exitCode = 1), console.log("WEG ROT: " + (p ? p.rot : "keine Prüfung des Wegs"));
        }
    } finally {
        if (namen.length) await tor.ruf("/eval", { code: namen.map((k) => "window." + k + " = window.__linse_" + k + "; delete window.__linse_" + k + ";").join(" ") + " return 1;" }).catch(() => {});
        await tor.ruf("/fenster", { w: 1920, h: 1080 }).catch(() => {});
        spiegel.close();
    }
}

// ───────── lod.K3#1 — die Karte aus jeder Blick-Hebung (gate:foundry-impostor C6, w4-hebungsringe) in der Welt der Sitzung ─────────
// Die Linse startete einen eigenen Browser (WebGL2, Null-Renderer-Welt, FIMP_PORT las niemand). Hier ihr Teil C in der Seite der
// Sitzung: `installiereBacke` (die Bake-Bühne `__fimpBacke`, `__fimpKarte`), `weltRuht` (die EINE Ruhe vor Teil C) und `kleberProbe`,
// auf C6 geschnitten nach dem Fluss ihrer Namen (`hebungScheiben`, unten: kein Text-Anker) — (1) Layout, (2) Kleber-Wand, C5 und C7
// fallen, C6 Byte für Byte. Der Probe-Renderer geht wie in der Linse (`ren.dispose()`), vorher alles, was er für die Probe anlegte —
// über die API der Linse, nie über ihren Text: die Station hüllt `__fimpProbe` (installiereBacke), und der Renderer, den sie liefert,
// räumt in seinem `dispose` zuerst die Bühne (`_karteBuehneRuhe` sofort, die Ruhe der Welt — sie kam erst nach 3 s Stille, die Bühne
// des Probe-Renderers hielt ihre Ziele: +28 MB VRAM nach dem GC, swiftshader), das Array-Ziel des rgba8-Atlas samt Tiefe und jede
// Schicht-Textur des Probe-Atlas, wie die Welt sie zählt (`_karteTexturen`: seit w4-laub-karte samt der BC-Tiefe `tmap`; sonst trüge
// der VRAM-Abgriff ihre Bytes bis zum GC). Je Format (bc, rgba8) ein frischer Probe-Renderer, ein Probe-Atlas; gedruckt wird mit dem
// Druck-Block der Linse selbst (die Scheibe auf `C.oben`), nie mit einem Zwilling des Formats. DIE RÜCKGABE (die Probe misst in der Welt, die sie danach lässt): `leihe`
// (welt-boot) merkt und gibt zurück — den Karten-Atlas der Welt (Teil C setzt `_kartenAtlas` neu), Bühne und Rechner des Bakes
// (sie gehörten danach dem Probe-Gerät), den Stoff-Cache (Teil C löscht die Karten-Stoffe), den Wind (C6 setzt ihn 0), die Grenzen
// der Foundry (kein ruhender Welt-Körper fällt den zwei Probe-Körpern zum Opfer, die danach selbst fallen). Ohne Karte (kein
// `[linse-gpu]`) druckt sie keine Zeile (das Urteil hielte die Ersatz-Zeile für Hardware), und bleibt VRAM nach dem GC über
// 1 MB stehen, druckt sie keine C6-Zeile, sondern den Rest beim Namen (die Proben danach urteilen über VRAM).
async function karteHebung(tor) {
    const fs = require("fs");
    const path = require("path");
    const L = "scripts/diag-foundry-impostor.cjs";
    // die Scheiben der Linse (`hebungScheiben` als Text in argv: dieselbe Funktion urteilt die Wand ANKER am Kopf, ohne Gerät)
    const S = new Function("return (" + tor.arg[0] + ");")()(require(path.resolve("node_modules/acorn")), fs.readFileSync(L, "utf8"));
    console.log("  SCHEIBEN " + L + ": kleberProbe " + S.teile.kleber.join(" von ") + " Anweisungen · Druck-Block " + S.teile.drucke.join(" von "));
    const kleber = new Function("return (" + S.kleber + ");")();
    const drucke = new Function("C", "errs", S.drucke);
    const page = await tor.seite();
    const karte = tor.karte();
    if (!karte) throw new Error("ohne Karte keine Zeile (die Ersatz-Zeile hielte das Urteil für Hardware)");
    const cdp = await page.target().createCDPSession();
    const vram = async () => {
        await cdp.send("HeapProfiler.collectGarbage");
        await page.evaluate(() => new Promise((ok) => setTimeout(ok, 200)));
        await cdp.send("HeapProfiler.collectGarbage");
        return page.evaluate(() => (window.__vram ? +((window.__vram.puffer + window.__vram.texturen) / 1048576).toFixed(1) : null));
    };
    const v0 = await vram();
    await new Function("return (" + tor.quelle(L, "installiereBacke") + ");")()(page);
    const ruhe = await new Function("return (" + tor.quelle(L, "weltRuht") + ");")()(page);
    console.log("  RUHE VOR TEIL C: die Welt steht nach " + ruhe.takte + " Takten · mit einer wartenden Karte: " + ruhe.karte);
    await page.evaluate(() => {
        const A = r.constructor, st = r.state, w = st.windUniforms && st.windUniforms.uWindStrength;
        const keys = [93, 94].map((v) => r._foundryKoerperKey("eiche", v, r._foundryServierStufe("eiche", 1), null));
        window.__hebungZurueck = [
            leihe(r, { _kartenAtlas: r._kartenAtlas, _karteBuehneSatz: r._karteBuehneSatz, _karteRechnerSatz: r._karteRechnerSatz }),
            leihe(st, { _foliageMatCache: new Map(st._foliageMatCache || []), foundryCrossfade: st.foundryCrossfade }),
            ...(w ? [leihe(w, { value: w.value })] : []),
            leihe(A, { FOUNDRY_RUHE_BYTES: Infinity, FOUNDRY_CACHE_BYTES: Infinity, FOUNDRY_CACHE_CAP: Infinity }),
            leihe(window, { __fimpProbe: window.__fimpProbe }),
        ];
        // DAS ENDE DES PROBE-RENDERERS (die API der Linse statt eines Ankers): sein `dispose` räumt zuerst, was er für die Probe anlegte
        const probe = window.__fimpProbe;
        window.__fimpProbe = async (...a) => {
            const pr = await probe(...a);
            if (pr && pr.ren) {
                const { ren, at } = pr, ende = ren.dispose;
                ren.dispose = function () {
                    const b = r._karteBuehneSatz;
                    if (b && b.rend === ren) (b.zuletzt = -Infinity), r._karteBuehneRuhe();
                    for (const t of new Set([at.rt, ...r._karteTexturen(at)])) if (t && t.dispose) t.dispose();
                    return ende.apply(this, arguments);
                };
            }
            return pr;
        };
        window.__hebungKoerper = keys.map((k) => [k, r._foundryCacheGet(k)]);
        window.__hebungRend = [st.renderer, st.renderer.setAnimationLoop];
        return 1;
    });
    const Cs = [];
    try {
        for (const fmt of ["bc", "rgba8"]) {
            const C = await kleber(page, fmt);
            C.fremd = C.ohneFeature ? [] : await page.evaluate(() => [...((r._kartenAtlas && r._kartenAtlas.zellen) || new Map()).keys()].filter((k) => !k.startsWith("fimp:gateKarte|")));
            Cs.push(C);
        }
    } finally {
        await page.evaluate(() => {
            for (const [k, alt] of window.__hebungKoerper || []) alt === undefined ? r._foundryCacheEvict(k) : r._foundryCacheSet(k, alt);
            for (const z of (window.__hebungZurueck || []).reverse()) z();
            delete window.__hebungZurueck;
            delete window.__hebungKoerper;
            return 1;
        });
    }
    const rend = await page.evaluate(() => {
        const [R, S] = window.__hebungRend;
        delete window.__hebungRend;
        return r.state.renderer === R && r.state.renderer.setAnimationLoop === S;
    });
    const v1 = await vram();
    await cdp.detach().catch(() => {});
    const rest = v0 != null && v1 != null ? +(v1 - v0).toFixed(1) : null;
    console.log("  RÜCKGABE: der Renderer der Welt " + (rend ? "derselbe" : "ein ANDERER") + " · VRAM nach dem GC " + v0 + " → " + v1 + " MB (" + (rest >= 0 ? "+" : "") + rest + ")");
    const errs = [];
    if (ruhe.karte) errs.push("C: eine wartende Karte bricht die Ruhe nicht (`_weltSteht` true)");
    if (!rend) errs.push("RÜCKGABE: der Renderer der Welt ist nach der Probe ein anderer");
    if (!(rest != null && rest <= 1)) errs.push("RÜCKGABE: " + rest + " MB VRAM blieben nach dem GC in der Welt (Soll ≤ 1)");
    const rueck = errs.length > (ruhe.karte ? 1 : 0);
    for (const C of Cs) {
        const F = `C[${C.fmt}]`;
        if (C.ohneFeature) {
            console.log("  [" + C.fmt + "] die Welt wählt auf dem Probe-Renderer rgba8 — ohne texture-compression-bc");
            continue;
        }
        if (C.err) {
            console.log("  Fehler [" + C.fmt + "]: " + C.err);
            errs.push(`${F}: Karten-Probe brach ab — ${C.err}`);
            continue;
        }
        if ((C.fremd || []).length) errs.push(`${F}: die Welt lieferte in den Probe-Atlas (${C.fremd.join(", ")}) — Teil C begann vor der Ruhe`);
        if (!rueck) drucke(C, errs);
    }
    for (const x of errs) console.log("  ROT " + x);
    fs.writeFileSync(tor.aus, JSON.stringify({ ruhe, C: Cs.map((C) => ({ fmt: C.fmt, ohneFeature: !!C.ohneFeature, err: C.err || null, fremd: C.fremd, oben: C.oben || null })), vram: [v0, v1], rend }, null, 1));
    process.exitCode = errs.length ? 1 : 0;
}

// DIE SCHEIBEN DER LINSE (lod.K3#1, 04.11.): aus scripts/diag-foundry-impostor.cjs am Stand die zwei Teile, die C6 braucht — geschnitten
// nach dem Fluss der Namen (acorn), nie nach Text. (1) `kleberProbe`, der try-Block ihrer Seiten-Funktion auf die Anweisungen gekürzt,
// aus denen `out.oben` fließt: die Anweisungen, die `out.oben` nennen, rückwärts jede Deklaration, deren Namen sie lesen, und jede
// Anweisung ohne eigene Deklaration, deren Namen schon alle stehen (die Regeln der Welt am Probe-Renderer, die Wache des Stoffs, der
// ruhende Wind, das Ende des Renderers) — bis sich nichts mehr ändert. (2) Der Druck-Block: in der Schleife `for (const C of Cs)` des
// Haupt-Laufs die Anweisungen, die `C.oben` lesen, vorwärts jede, die ihre Namen liest, rückwärts die Deklarationen, die sie brauchen.
// Bis 04.11. hielten drei Text-Anker C6 (`const H0 = 8;` · `const kr = [` · `rtO.dispose();`) und zwei den Druck-Block: w4-laub-karte
// (6df5c040, 31.10.) baute die Probe-Gestalt mit `__fimpTeile` statt `kr`, und die Station stand an jedem Kopf danach UNGEMESSEN (GTX
// 10770eb5 · 1e90e7cd · 5fba36ea · 6a571e3b · 6d6a8336: „ANKER fehlt … const kr = [“) — gesehen erst am Gerät. Die Scheiben folgen jeder
// Umbenennung und jedem neuen Teil (C7 fällt von selbst); fehlt der Teil selbst, wirft sie beim Namen. Die Wand ANKER (punkte.cjs) ruft
// dieselbe Funktion am Kopf. Rückgabe { kleber, drucke, teile: { kleber: [behalten, von], drucke: [behalten, von] } } (Quelltexte).
function hebungScheiben(acorn, text) {
    const L = "scripts/diag-foundry-impostor.cjs";
    const ast = acorn.parse(text, { ecmaVersion: "latest", sourceType: "script", allowHashBang: true, allowReturnOutsideFunction: true });
    const kinder = (n) =>
        Object.keys(n)
            .filter((k) => k !== "type" && k !== "start" && k !== "end")
            .flatMap((k) => (Array.isArray(n[k]) ? n[k] : [n[k]]))
            .filter((c) => c && typeof c.type === "string");
    const finde = (n, ja) => {
        if (ja(n)) return n;
        for (const c of kinder(n)) {
            const f = finde(c, ja);
            if (f) return f;
        }
        return null;
    };
    // die gelesenen Namen (über-genähert: jeder Bezeichner außer Schlüsseln und den Namen, die ein Muster deklariert)
    const muster = (p, aus) => {
        if (!p) return aus;
        if (p.type === "AssignmentPattern") muster(p.left, aus), lies(p.right, aus);
        else if (p.type === "ObjectPattern") for (const q of p.properties) q.type === "RestElement" ? muster(q.argument, aus) : (q.computed && lies(q.key, aus), muster(q.value, aus));
        else if (p.type === "ArrayPattern") for (const q of p.elements) muster(q, aus);
        else if (p.type === "RestElement") muster(p.argument, aus);
        else if (p.type !== "Identifier") lies(p, aus);
        return aus;
    };
    const lies = (n, aus) => {
        if (!n || typeof n.type !== "string") return aus;
        if (n.type === "Identifier") aus.add(n.name);
        else if (n.type === "MemberExpression") lies(n.object, aus), n.computed && lies(n.property, aus);
        else if (n.type === "Property" || n.type === "MethodDefinition" || n.type === "PropertyDefinition") n.computed && lies(n.key, aus), lies(n.value, aus);
        else if (n.type === "VariableDeclarator") muster(n.id, aus), lies(n.init, aus);
        else if (/Function/.test(n.type)) n.params.forEach((p) => muster(p, aus)), lies(n.body, aus);
        else if (n.type === "CatchClause") muster(n.param, aus), lies(n.body, aus);
        else if (n.type === "LabeledStatement") lies(n.body, aus);
        else if (n.type !== "BreakStatement" && n.type !== "ContinueStatement") for (const c of kinder(n)) lies(c, aus);
        return aus;
    };
    const namen = (p, aus = []) => {
        if (!p) return aus;
        if (p.type === "Identifier") aus.push(p.name);
        else if (p.type === "AssignmentPattern") namen(p.left, aus);
        else if (p.type === "ObjectPattern") for (const q of p.properties) namen(q.type === "RestElement" ? q.argument : q.value, aus);
        else if (p.type === "ArrayPattern") for (const q of p.elements) namen(q, aus);
        else if (p.type === "RestElement") namen(p.argument, aus);
        return aus;
    };
    const dekl = (s) => (s.type === "VariableDeclaration" ? s.declarations.flatMap((d) => namen(d.id)) : /Declaration$/.test(s.type) && s.id ? [s.id.name] : []);
    const nennt = (s, o, p) => !!finde(s, (x) => x.type === "MemberExpression" && !x.computed && x.object.type === "Identifier" && x.object.name === o && x.property.name === p);
    // der Schnitt einer Anweisungs-Liste: Samen (nennen o.p), vorwärts (lesen einen Namen der Samen), rückwärts (deklarieren, was sie lesen),
    // `frei` — Anweisungen ohne Deklaration, deren lokale Namen alle schon stehen
    const schnitt = (S, o, p, frei) => {
        const D = S.map(dekl);
        const lokal = new Set(D.flat());
        const R = S.map((s) => [...lies(s, new Set())].filter((x) => lokal.has(x)));
        const K = new Set(S.map((_s, i) => i).filter((i) => nennt(S[i], o, p)));
        if (!K.size) return K;
        const vor = new Set([...K].flatMap((i) => D[i]));
        for (let mehr = !frei; mehr; ) {
            mehr = false;
            S.forEach((_s, i) => !K.has(i) && R[i].some((x) => vor.has(x)) && (K.add(i), D[i].forEach((x) => vor.add(x)), (mehr = true)));
        }
        for (let mehr = true; mehr; ) {
            mehr = false;
            const steht = new Set([...K].flatMap((i) => D[i]));
            const braucht = new Set([...K].flatMap((i) => R[i]));
            S.forEach((_s, i) => {
                if (K.has(i)) return;
                if (D[i].some((x) => braucht.has(x)) || (frei && !D[i].length && R[i].every((x) => steht.has(x)))) (K.add(i), (mehr = true));
            });
        }
        return K;
    };
    const quelle = (S, K) => S.filter((_s, i) => K.has(i)).map((s) => text.slice(s.start, s.end)).join("\n");
    // (1) kleberProbe
    const kp = ast.body.find((n) => n.type === "FunctionDeclaration" && n.id && n.id.name === "kleberProbe");
    if (!kp) throw new Error(L + ": keine Funktion kleberProbe auf oberster Ebene");
    const ev = finde(kp.body, (n) => n.type === "CallExpression" && n.callee.type === "MemberExpression" && !n.callee.computed && n.callee.property.name === "evaluate" && /Function/.test((n.arguments[0] || {}).type));
    const seite = ev && ev.arguments[0];
    const versuch = seite && seite.body.type === "BlockStatement" && seite.body.body.find((n) => n.type === "TryStatement");
    if (!versuch) throw new Error(L + " kleberProbe: keine Seiten-Funktion mit try-Block (page.evaluate)");
    const S1 = versuch.block.body;
    const K1 = schnitt(S1, "out", "oben", true);
    if (!K1.size) throw new Error(L + " kleberProbe: keine Anweisung schreibt out.oben (C6)");
    const kleber = text.slice(kp.start, versuch.block.start) + "{\n" + quelle(S1, K1) + "\n}" + text.slice(versuch.block.end, kp.end);
    // (2) der Druck-Block
    const haupt = finde(ast, (n) => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "hauptLauf");
    const ist = (n, name) => n && n.type === "Identifier" && n.name === name;
    const schleife = haupt && finde(haupt, (n) => n.type === "ForOfStatement" && n.left.type === "VariableDeclaration" && ist(n.left.declarations[0].id, "C") && ist(n.right, "Cs"));
    if (!schleife || schleife.body.type !== "BlockStatement") throw new Error(L + ": keine Schleife for (const C of Cs) im Haupt-Lauf");
    const S2 = schleife.body.body;
    const K2 = schnitt(S2, "C", "oben", false);
    if (!K2.size) throw new Error(L + ": der Haupt-Lauf liest C.oben nicht (kein Druck-Block C6)");
    // DIE NAMEN DES HAUPT-LAUFS (w27-verkehr-station-pm; main a3782a65 druckt über die Kurzformen `const [J, log] = …` vor der Schleife —
    // die Scheibe ohne sie warf „log is not defined“: lod.K3#1 und der Selbsttest der Maschine ROT am Kopf): was die Scheibe liest und
    // weder sie noch die Schleife (C, errs) deklariert, deklariert der Rumpf des Haupt-Laufs vor der Schleife — diese Anweisungen, und
    // rückwärts, was sie lesen, stehen ihr voran; ein Name, den dort keiner deklariert, ist global (JSON, console). C und errs sind die
    // Parameter der Scheibe (die Station reicht ihr Fehler-Feld): der Rumpf deklariert sie nie für sie (`const errs = []` bleibt dort)
    const rumpf = (haupt.arguments.find((f) => /Function/.test(f.type)) || {}).body;
    const S0 = rumpf && rumpf.type === "BlockStatement" ? rumpf.body.filter((x) => x.end <= schleife.start) : [];
    const K0 = new Set();
    const steht = new Set(["C", "errs", ...[...K2].flatMap((i) => dekl(S2[i]))]);
    const braucht = new Set([...K2].flatMap((i) => [...lies(S2[i], new Set())]).filter((x) => !steht.has(x)));
    for (let mehr = true; mehr; ) {
        mehr = false;
        S0.forEach((x, i) => {
            if (K0.has(i) || !dekl(x).some((n) => braucht.has(n)) || dekl(x).some((n) => n === "C" || n === "errs")) return;
            K0.add(i);
            lies(x, new Set()).forEach((n) => !steht.has(n) && braucht.add(n));
            mehr = true;
        });
    }
    return { kleber, drucke: (K0.size ? quelle(S0, K0) + "\n" : "") + quelle(S2, K2), teile: { kleber: [K1.size, S1.length], drucke: [K2.size, S2.length] } };
}

module.exports = { sitzungTor, torBefehl, kollisionTempo, bodenRollen, tierKreis, sprungKadenz, fadenZaehler, fahrWelt, fahrRueck, fahrWegenetz, wasserGraben, naesseDorf, naesseWiese, werkbankLinse, karteHebung, hebungScheiben };
