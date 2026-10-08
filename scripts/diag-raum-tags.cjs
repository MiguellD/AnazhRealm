#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-raum-tags.cjs — DAS GEDÄCHTNIS DER RAUM-TAGS SIEHT JEDEN SCHREIBER (0710-11). Befund (OMEN 0710-10, Werkbank an der
// Mess-Wiese): `tickPlayerBoosts` rechnete je Sekunde `computeSpatialTags` für jeden nahen Eintrag neu — 10 Rufe für 5
// Baupläne (Haselbusch 112 Teile 1,1 ms, Bäume 80 Teile 0,6 ms), 8,3 ms je Boost-Takt, Spitze 10,3 ms: eine CPU-Spitze jede
// Sekunde. Die Rechnung prüft je Teil-Paar Kontakt und Hohlraum (O(Teile²)) und hing an keiner Änderung.
// Der Schnitt: `computeSpatialTags` merkt sich je Bauplan die Tags und einen SCHLÜSSEL — den Schnappschuss jedes Eingangs der
// Rechnung (`_raumTagSchluessel`), bei jedem Ruf gebaut und Wert für Wert verglichen; die Rechnung (`_raumTagsRechnen`) läuft
// nur bei geändertem Schlüssel. Ein Schreiber muss sich nicht melden: der Schlüssel liest den Inhalt.
// Die Wand:
//   (Q) QUELLE (AST, auch im Selbsttest): der Aufrufbaum der Rechnung liest keinen Zustand außer `state.materials` und kein
//       Feld der Instanz; jede statische Tabelle, die er liest, schreibt niemand (außer ihrer Definition); kein Leser umgeht
//       das Gedächtnis (`_raumTagsRechnen` ruft nur `computeSpatialTags`);
//   (L) DIE LINSE DES SCHLÜSSELS (Proxy, je Bauplan der Welt): jeder Pfad, den die Rechnung liest (Bauplan, Teile, Stoffe),
//       liest auch der Schlüssel — so sieht er jeden Schreiber;
//   (O) DAS ORAKEL — eine Werkstatt-Sitzung: Teil verschieben, Stoff, Form, Farbe (kein Eingang: Treffer), Teil hinzufügen und
//       löschen, Undo/Redo, direkte Änderungen ohne API (Position, Größe, Stoff-Tag), `defineMaterial`, ein Spielstand geladen
//       (`_loadStateRestoreCraftingInventory`), ein neues Teile-Array, ein neues Bauplan-Objekt — je Frage dieselben Tags wie
//       die Rechnung (Werte `Object.is`, Schlüssel-Folge), nach jeder Änderung rechnet es neu, beim zweiten Fragen nicht;
//       alle Baupläne der Welt zweimal: dieselben Tags, beim zweiten Mal ohne Rechnung;
//   (S) DIE ZÄHNE: ein Schlüssel ohne die Stoff-Tags fällt beim direkt geänderten Stoff-Tag rot;
//   (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): die Quell-Wand ist am Stamm grün und fällt bei einem eingeschleusten
// Zustands-Leser, einem Instanz-Feld, einem Tabellen-Schreiber und einem Leser vorbei am Gedächtnis rot.
//   node scripts/diag-raum-tags.cjs [--selftest]   (npm run gate:raum-tags; Port RAUM_TAGS_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");

const PORT = Number(process.env.RAUM_TAGS_PORT || 4606);
const root = path.resolve(__dirname, "..");

// DIE QUELL-WAND: der Aufrufbaum von `_raumTagsRechnen` (über `this.<methode>(`), seine Eingänge und seine Tabellen.
const MUTIERER = /^(add|delete|clear|set|push|pop|splice|shift|unshift|sort|reverse|fill|copyWithin)$/;
function quellWand(quelle) {
    const acorn = require("acorn");
    const ast = acorn.parse(quelle, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const kinder = (n) => {
        const out = [];
        for (const k in n) {
            if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
            const v = n[k];
            if (Array.isArray(v)) {
                for (const x of v) if (x && typeof x.type === "string") out.push(x);
            } else if (v && typeof v.type === "string") out.push(v);
        }
        return out;
    };
    const lauf = (n, f, eltern) => {
        f(n, eltern);
        for (const k of kinder(n)) lauf(k, f, n);
    };
    const befunde = [];
    const methoden = new Map();
    lauf(ast, (m) => {
        if (m.type === "MethodDefinition" && m.key && m.value && m.value.body)
            methoden.set(m.key.name || String(m.key.value), m);
    });
    const istThis = (n) => n && n.type === "ThisExpression";
    // der Aufrufbaum: jede über `this.<name>(` gerufene Methode, transitiv
    const baum = new Set();
    const tabellen = new Set();
    const offen = ["_raumTagsRechnen"];
    while (offen.length) {
        const name = offen.pop();
        if (baum.has(name)) continue;
        const m = methoden.get(name);
        if (!m) {
            befunde.push(`STUMPF: die Rechnung ruft ${name}, die Wand findet die Methode nicht`);
            continue;
        }
        baum.add(name);
        lauf(m.value.body, (n, eltern) => {
            if (n.type !== "MemberExpression" || n.computed) return;
            // this.<feld>: ein Ruf ist ein Ast des Baums, ein Lesen ein Eingang
            if (istThis(n.object)) {
                const feld = n.property.name;
                const ruf = eltern && eltern.type === "CallExpression" && eltern.callee === n;
                if (ruf) {
                    offen.push(feld);
                    return;
                }
                const weiter = eltern && eltern.type === "MemberExpression" && eltern.object === n;
                if (feld === "state" && weiter && !eltern.computed) {
                    const was = eltern.property.name;
                    if (was !== "materials")
                        befunde.push(
                            `${name} Zeile ${n.loc.start.line}: die Rechnung liest this.state.${was} — der Schlüssel kennt diesen Eingang nicht`
                        );
                    return;
                }
                if (feld === "state" && !(weiter && !eltern.computed)) {
                    befunde.push(`${name} Zeile ${n.loc.start.line}: die Rechnung liest this.state als Ganzes`);
                    return;
                }
                befunde.push(
                    `${name} Zeile ${n.loc.start.line}: die Rechnung liest das Instanz-Feld this.${feld} — der Schlüssel kennt diesen Eingang nicht`
                );
                return;
            }
            if (n.object.type === "Identifier" && n.object.name === "AnazhRealm") tabellen.add(n.property.name);
        });
    }
    // jede gelesene Tabelle: niemand schreibt sie (außer ihrer Definition auf oberster Ebene)
    const wurzel = (n) => {
        // die Tabelle am Grund einer Kette `AnazhRealm.T(.x|[y])*`
        let x = n;
        while (x && x.type === "MemberExpression") {
            if (
                x.object.type === "Identifier" &&
                x.object.name === "AnazhRealm" &&
                !x.computed &&
                tabellen.has(x.property.name)
            )
                return x.property.name;
            x = x.object;
        }
        return null;
    };
    const definitionen = new Set();
    for (const st of ast.body)
        if (st.type === "ExpressionStatement" && st.expression.type === "AssignmentExpression")
            definitionen.add(st.expression);
    lauf(ast, (n) => {
        let t = null,
            wie = null;
        if (n.type === "AssignmentExpression" && n.left.type === "MemberExpression" && !definitionen.has(n)) {
            t = wurzel(n.left);
            wie = "weist zu";
        } else if (n.type === "UpdateExpression" && n.argument.type === "MemberExpression") {
            t = wurzel(n.argument);
            wie = "zählt";
        } else if (n.type === "UnaryExpression" && n.operator === "delete" && n.argument.type === "MemberExpression") {
            t = wurzel(n.argument);
            wie = "löscht";
        } else if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && !n.callee.computed) {
            const p = n.callee.property.name;
            if (MUTIERER.test(p)) {
                t = wurzel(n.callee.object);
                wie = `ruft .${p}`;
            } else if (
                n.callee.object.type === "Identifier" &&
                n.callee.object.name === "Object" &&
                /^(assign|defineProperty|defineProperties|setPrototypeOf)$/.test(p) &&
                n.arguments[0] &&
                n.arguments[0].type === "MemberExpression"
            ) {
                t = wurzel(n.arguments[0]);
                wie = `Object.${p}`;
            }
        }
        if (t)
            befunde.push(
                `Zeile ${n.loc.start.line}: ${wie} die Tabelle AnazhRealm.${t} — die Rechnung liest sie, der Schlüssel nicht`
            );
    });
    // kein Leser umgeht das Gedächtnis
    lauf(ast, (m) => {
        if (m.type !== "MethodDefinition" || !m.value || !m.value.body) return;
        const name = m.key.name || String(m.key.value);
        if (name === "computeSpatialTags") return;
        lauf(m.value.body, (n) => {
            if (
                n.type === "CallExpression" &&
                n.callee.type === "MemberExpression" &&
                !n.callee.computed &&
                n.callee.property.name === "_raumTagsRechnen"
            )
                befunde.push(
                    `${name} Zeile ${n.loc.start.line}: ruft _raumTagsRechnen vorbei am Gedächtnis (Leser fragen computeSpatialTags)`
                );
        });
    });
    const gedaechtnis = methoden.get("computeSpatialTags");
    const src = gedaechtnis ? quelle.slice(gedaechtnis.start, gedaechtnis.end) : "";
    if (!/_raumTagSchluessel\(/.test(src) || !/_raumTagGleich\(/.test(src) || !/_raumTagsRechnen\(/.test(src))
        befunde.push("computeSpatialTags ist nicht das Gedächtnis (Schlüssel, Vergleich, Rechnung)");
    return { befunde, baum: [...baum], tabellen: [...tabellen] };
}

if (process.argv.includes("--selftest")) {
    console.log("=== RAUM-TAGS — Selbsttest der Quell-Wand (ohne Browser) ===");
    const v = [];
    const stammQ = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const stamm = quellWand(stammQ);
    for (const b of stamm.befunde) v.push("STAMM: " + b);
    if (stamm.baum.length < 8) v.push(`STAMM: der Aufrufbaum ist stumpf (${stamm.baum.join(", ")})`);
    const ein = (was, alt, neu, satz) => {
        if (!stammQ.includes(alt)) return v.push(`Probe „${was}": Anker fehlt im Stamm (${alt})`);
        const b = quellWand(stammQ.replace(alt, neu)).befunde;
        if (!b.some((x) => x.includes(satz))) v.push(`${was} fällt nicht rot (${JSON.stringify(b.slice(0, 3))})`);
    };
    ein(
        "ein Zustands-Leser im Aufrufbaum",
        "    _hasResonantArray(blueprint) {",
        "    _hasResonantArray(blueprint) {\n        if (this.state.weather === 'x') return false;",
        "this.state.weather"
    );
    ein(
        "ein Instanz-Feld im Aufrufbaum",
        "    _partBoundingBox(part) {",
        "    _partBoundingBox(part) {\n        if (this._raumNebel) return null;",
        "Instanz-Feld this._raumNebel"
    );
    ein(
        "ein Schreiber einer gelesenen Tabelle",
        "    _raumTagGleich(a, b) {",
        "    _raumTagNeu() {\n        AnazhRealm.SPATIAL_HOLLOW_SHAPES.add('cube');\n    }\n\n    _raumTagGleich(a, b) {",
        "AnazhRealm.SPATIAL_HOLLOW_SHAPES"
    );
    ein(
        "ein Zuweiser einer gelesenen Tabelle",
        "    _raumTagGleich(a, b) {",
        "    _raumTagNeu() {\n        AnazhRealm.FORM_TAG_ACTIVATION.cube.härte = 3;\n    }\n\n    _raumTagGleich(a, b) {",
        "AnazhRealm.FORM_TAG_ACTIVATION"
    );
    ein(
        "ein Leser vorbei am Gedächtnis",
        "    _raumTagGleich(a, b) {",
        "    _raumTagNeu(bp) {\n        return this._raumTagsRechnen(bp);\n    }\n\n    _raumTagGleich(a, b) {",
        "vorbei am Gedächtnis"
    );
    for (const x of v) console.log("  ❌ " + x);
    if (v.length) {
        console.log("\n❌ SELBSTTEST ROT");
        process.exit(1);
    }
    console.log(
        `✅ SELBSTTEST GRÜN — Aufrufbaum ${stamm.baum.length} Methoden, ${stamm.tabellen.length} Tabellen (${stamm.tabellen.join(", ")}); ` +
            "Zustands-Leser, Instanz-Feld, Tabellen-Schreiber und Leser vorbei am Gedächtnis fallen rot."
    );
    process.exit(0);
}

const puppeteer = require("puppeteer");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
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

async function probe() {
    const r = window.anazhRealm;
    const st = r.state;
    const AR = r.constructor;
    const P = Object.getPrototypeOf(r);
    const aus = { linse: null, sitzung: [], welt: null, zaehne: null };
    const hatGedaechtnis = typeof P._raumTagsRechnen === "function" && typeof P._raumTagSchluessel === "function";
    aus.hatGedaechtnis = hatGedaechtnis;
    // die gedächtnislose Rechnung: am Schnitt `_raumTagsRechnen`, am Stamm von main die alte `computeSpatialTags`
    const rechne = (bp) => (hatGedaechtnis ? P._raumTagsRechnen.call(r, bp) : P.computeSpatialTags.call(r, bp));
    const gleich = (a, b) => {
        const ka = Object.keys(a),
            kb = Object.keys(b);
        return ka.length === kb.length && ka.every((k, i) => k === kb[i] && Object.is(a[k], b[k]));
    };
    // die Zahl (vor der Linse: ihre Proxies stören den JIT der Rechnung): Rechnung gegen Gedächtnis je Ruf, größter Bauplan
    let gross = null;
    for (const name of Object.keys(st.blueprints)) {
        const bp = st.blueprints[name];
        if (bp && Array.isArray(bp.parts) && (!gross || bp.parts.length > st.blueprints[gross].parts.length))
            gross = name;
    }
    if (gross) {
        const bp = st.blueprints[gross];
        const N = 40;
        let t0 = performance.now();
        for (let i = 0; i < N; i++) rechne(bp);
        const tR = (performance.now() - t0) / N;
        r.computeSpatialTags(bp);
        t0 = performance.now();
        for (let i = 0; i < N; i++) r.computeSpatialTags(bp);
        const tG = (performance.now() - t0) / N;
        aus.zahl = {
            bauplan: gross,
            teile: bp.parts.length,
            rechnungMs: +tR.toFixed(3),
            gedaechtnisMs: +tG.toFixed(4),
        };
    }
    // (L) DIE LINSE DES SCHLÜSSELS: Proxy über eine Kopie des Bauplans und der Stoffe; je Lese-Pfad (Indizes → [], Stoff-
    // Namen → {}) — die Pfade der Rechnung gegen die Pfade des Schlüssels
    const linse = { bauplaene: 0, rechnung: new Set(), schluessel: new Set(), fehlt: new Set() };
    const prox = (obj, pfad, buch, karte) =>
        new Proxy(obj, {
            get(t, k, rcv) {
                const v = Reflect.get(t, k, rcv);
                if (typeof k === "symbol" || typeof v === "function") return v;
                const norm = karte ? "{}" : /^\d+$/.test(k) ? "[]" : k;
                const p = pfad + "." + norm;
                buch.add(p);
                return v && typeof v === "object" ? prox(v, p, buch, false) : v;
            },
            // `k in obj` (auch die Array-Methoden je Index) liest dasselbe wie der Zugriff: ob es den Eintrag gibt
            has(t, k) {
                if (typeof k !== "symbol") buch.add(pfad + "." + (karte ? "{}" : /^\d+$/.test(k) ? "[]" : k));
                return Reflect.has(t, k);
            },
        });
    if (hatGedaechtnis) {
        const echteStoffe = st.materials;
        for (const name of Object.keys(st.blueprints)) {
            const bp = st.blueprints[name];
            if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) continue;
            let kopie, stoffe;
            try {
                kopie = JSON.parse(JSON.stringify(bp));
                stoffe = JSON.parse(JSON.stringify(echteStoffe));
            } catch (_e) {
                continue;
            }
            const lr = new Set(),
                ls = new Set();
            try {
                st.materials = prox(stoffe, "M", lr, true);
                P._raumTagsRechnen.call(r, prox(kopie, "B", lr, false));
                st.materials = prox(stoffe, "M", ls, true);
                P._raumTagSchluessel.call(r, prox(kopie, "B", ls, false), []);
            } finally {
                st.materials = echteStoffe;
            }
            linse.bauplaene++;
            for (const p of lr) {
                linse.rechnung.add(p);
                if (!ls.has(p)) linse.fehlt.add(`${p} (${name})`);
            }
            for (const p of ls) linse.schluessel.add(p);
        }
    }
    aus.linse = {
        bauplaene: linse.bauplaene,
        rechnung: [...linse.rechnung].sort(),
        schluessel: [...linse.schluessel].sort(),
        fehlt: [...linse.fehlt].slice(0, 12),
        fehltN: linse.fehlt.size,
    };
    // (O) DAS ORAKEL — eine Werkstatt-Sitzung
    let gerechnet = 0;
    if (hatGedaechtnis)
        r._raumTagsRechnen = function (bp) {
            gerechnet++;
            return P._raumTagsRechnen.call(this, bp);
        };
    const frage = (name, schritt, erwartet) => {
        const bp = st.blueprints[name];
        const n0 = gerechnet;
        const ist = r.computeSpatialTags(bp);
        const soll = rechne(bp);
        const n1 = gerechnet;
        const zweit = r.computeSpatialTags(bp);
        const n2 = gerechnet;
        const z = {
            schritt,
            teile: bp.parts.length,
            gleich: gleich(ist, soll) && gleich(zweit, soll),
            gerechnet: n1 - n0, // die Soll-Rechnung läuft am Prototyp, am Zähler vorbei
            zweit: n2 - n1,
            erwartet,
            frisch: ist !== zweit,
        };
        if (!z.gleich) z.diff = { ist, soll };
        aus.sitzung.push(z);
        return z;
    };
    const quelle = ["grown_busch_hazel_v2", "baum_birke", "baum_eiche"].find(
        (n) => st.blueprints[n] && Array.isArray(st.blueprints[n].parts) && st.blueprints[n].parts.length > 8
    );
    const NAME = "raum_probe";
    aus.quelle = quelle;
    if (quelle && r.cloneBlueprint(quelle, NAME)) {
        const bp0 = () => st.blueprints[NAME];
        const stoff = Object.keys(st.materials).find((m) => st.materials[m] && st.materials[m].tags && m !== "stein");
        r.defineMaterial("raum_stoff", 0x885533, { resoniert: 0.8, härte: 0.3, magieleitung: 0.6 });
        frage(NAME, "erste Frage", "rechnet");
        frage(NAME, "zweite Frage", "Treffer");
        const p0 = bp0().parts[0].position || { x: 0, y: 0, z: 0 };
        r.updatePartInBlueprint(NAME, 0, { position: { x: (p0.x || 0) + 0.4 } });
        frage(NAME, "Teil verschieben (API)", "rechnet");
        r.updatePartInBlueprint(NAME, 1, { material: "raum_stoff" });
        frage(NAME, "Stoff ändern (API)", "rechnet");
        r.updatePartInBlueprint(NAME, 2, { shape: "sphere" });
        frage(NAME, "Form ändern (API)", "rechnet");
        r.updatePartInBlueprint(NAME, 0, { color: 0x123456 });
        frage(NAME, "Farbe ändern (kein Eingang)", "Treffer");
        r.addPartToBlueprint(NAME, {
            shape: "cone",
            material: stoff || "stein",
            position: { x: 0.2, y: 3.1, z: -0.1 },
            size: { x: 0.4, y: 0.8, z: 0.4 },
        });
        frage(NAME, "Teil hinzufügen (API)", "rechnet");
        r.removePartFromBlueprint(NAME, 3);
        frage(NAME, "Teil löschen (API)", "rechnet");
        r.undoBlueprintEdit(NAME);
        frage(NAME, "Undo", "rechnet");
        r.undoBlueprintEdit(NAME);
        frage(NAME, "Undo", "rechnet");
        r.redoBlueprintEdit(NAME);
        frage(NAME, "Redo", "rechnet");
        const q = bp0().parts[0];
        q.position = q.position || { x: 0, y: 0, z: 0 };
        q.position.y = (q.position.y || 0) + 0.25;
        frage(NAME, "Position direkt (ohne API)", "rechnet");
        bp0().parts[1].size = { x: 2, y: 0.5, z: 2 };
        frage(NAME, "Größe direkt (ohne API)", "rechnet");
        r.defineMaterial("raum_stoff", 0x885533, { resoniert: 0.2, härte: 0.9, magieleitung: 0.1 });
        frage(NAME, "defineMaterial (Stoff neu)", "rechnet");
        st.materials.raum_stoff.tags.resoniert = 0.95;
        frage(NAME, "Stoff-Tag direkt (ohne API)", "rechnet");
        // ein Spielstand geladen: der Bauplan als neues Objekt, die Stoff-Tags im Bestand
        const ser = JSON.parse(JSON.stringify(r._serializeBlueprint(bp0())));
        if (ser.parts && ser.parts[0] && ser.parts[0].position) ser.parts[0].position.x += 1;
        r._loadStateRestoreCraftingInventory({
            materials: [
                { name: "raum_stoff", color: 0x885533, tags: { resoniert: 0.5, härte: 0.5, magieleitung: 0.7 } },
            ],
            blueprints: [ser],
        });
        frage(NAME, "Spielstand geladen", "rechnet");
        bp0().parts = bp0().parts.slice().reverse();
        frage(NAME, "neues Teile-Array", "rechnet");
        st.blueprints[NAME] = JSON.parse(JSON.stringify(bp0()));
        frage(NAME, "neues Bauplan-Objekt", "rechnet");
        // (S) DIE ZÄHNE: ein Schlüssel ohne die Stoffe (er baut, als gäbe es keine) — ein direkt geänderter Stoff, der die
        // Tags sichtbar ändert (jedes Teil aus `raum_stoff`, alle Tags 0 → 1), muss als Abweichung fallen
        if (hatGedaechtnis) {
            const bp = st.blueprints[NAME];
            for (const p of bp.parts) if (p && typeof p === "object") p.material = "raum_stoff";
            const t = st.materials.raum_stoff.tags;
            for (const k of AR.MATERIAL_TAG_KEYS) t[k] = 0;
            const vorher = rechne(bp);
            r._raumTagSchluessel = function (b, out) {
                const m = st.materials;
                st.materials = null;
                try {
                    return P._raumTagSchluessel.call(this, b, out);
                } finally {
                    st.materials = m;
                }
            };
            r.computeSpatialTags(bp);
            for (const k of AR.MATERIAL_TAG_KEYS) t[k] = 1;
            const ist = r.computeSpatialTags(bp);
            const soll = rechne(bp);
            delete r._raumTagSchluessel;
            const echt = r.computeSpatialTags(bp);
            aus.zaehne = {
                wirkt: !gleich(vorher, soll),
                faellt: !gleich(ist, soll),
                echtGleich: gleich(echt, soll),
                ist: ist.magieleitung,
                soll: soll.magieleitung,
            };
        }
    }
    // die ganze Welt: jeder Bauplan zweimal, beim zweiten Mal ohne Rechnung
    const welt = { bauplaene: 0, abweichungen: 0, gerechnetZweit: 0, beispiel: null };
    for (const name of Object.keys(st.blueprints)) {
        const bp = st.blueprints[name];
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) continue;
        let a, b, c;
        try {
            a = r.computeSpatialTags(bp);
            const n = gerechnet;
            b = r.computeSpatialTags(bp);
            welt.gerechnetZweit += gerechnet - n;
            c = rechne(bp);
        } catch (e) {
            welt.abweichungen++;
            if (!welt.beispiel) welt.beispiel = `${name}: ${e.message}`;
            continue;
        }
        welt.bauplaene++;
        if (!gleich(a, c) || !gleich(b, c)) {
            welt.abweichungen++;
            if (!welt.beispiel) welt.beispiel = name;
        }
    }
    aus.welt = welt;
    delete r._raumTagsRechnen;
    return aus;
}

function urteil(S, Q, pageErrors) {
    const rot = [];
    for (const b of Q.befunde) rot.push(`(Q) QUELLE: ${b}`);
    if (!S.hatGedaechtnis)
        rot.push("(O) das Spiel kennt kein Gedächtnis der Raum-Tags (`_raumTagsRechnen`, `_raumTagSchluessel`)");
    const L = S.linse;
    if (S.hatGedaechtnis) {
        if (L.fehltN)
            rot.push(`(L) LINSE: ${L.fehltN} Pfade liest die Rechnung, der Schlüssel nicht — ${L.fehlt.join(" · ")}`);
        const muss = [
            "B.parts.[].position.x",
            "B.parts.[].size.x",
            "B.parts.[].shape",
            "B.parts.[].material",
            "M.{}.tags",
        ];
        const fehlt = muss.filter((p) => !L.rechnung.includes(p));
        if (fehlt.length || L.bauplaene < 5)
            rot.push(`(L) LINSE stumpf: ${L.bauplaene} Baupläne, die Rechnung las nicht ${fehlt.join(", ")}`);
    }
    if (!S.quelle) rot.push("(O) kein Bauplan mit Teilen für die Werkstatt-Sitzung (vakuös)");
    for (const z of S.sitzung) {
        if (!z.gleich)
            rot.push(`(O) ${z.schritt}: das Gedächtnis urteilt anders als die Rechnung — ${JSON.stringify(z.diff)}`);
        if (!z.frisch) rot.push(`(O) ${z.schritt}: zwei Fragen gaben dasselbe Objekt (der Leser darf es ändern)`);
        if (S.hatGedaechtnis) {
            if (z.erwartet === "rechnet" && z.gerechnet !== 1)
                rot.push(`(O) ${z.schritt}: nach der Änderung rechnete das Gedächtnis ${z.gerechnet}× (soll 1×)`);
            if (z.erwartet === "Treffer" && z.gerechnet !== 0)
                rot.push(`(O) ${z.schritt}: ohne geänderten Eingang rechnete das Gedächtnis ${z.gerechnet}× (soll 0×)`);
            if (z.zweit !== 0) rot.push(`(O) ${z.schritt}: die zweite Frage rechnete ${z.zweit}× (soll 0×)`);
        }
    }
    if (S.sitzung.length < 15) rot.push(`(O) die Sitzung ist zu kurz (${S.sitzung.length} Schritte)`);
    const W = S.welt;
    if (W.abweichungen)
        rot.push(`(O) WELT: ${W.abweichungen} von ${W.bauplaene} Bauplänen urteilen anders — ${W.beispiel}`);
    if (S.hatGedaechtnis && W.gerechnetZweit)
        rot.push(`(O) WELT: die zweite Frage rechnete ${W.gerechnetZweit}× (soll 0×)`);
    if (S.hatGedaechtnis && !(S.zaehne && S.zaehne.wirkt && S.zaehne.faellt && S.zaehne.echtGleich))
        rot.push(
            `(S) ZÄHNE: der Stoff wirkt nicht, ein Schlüssel ohne Stoffe fiel nicht auf, oder der echte Schlüssel urteilt danach anders (${JSON.stringify(S.zaehne)})`
        );
    for (const e of pageErrors) rot.push(`(P) PAGE-ERROR: ${e}`);
    return rot;
}

(async () => {
    const Q = quellWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 120000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.player ||
                typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    const S = await page.evaluate(probe);
    await browser.close();
    server.close();
    console.log(
        "=== DAS GEDÄCHTNIS DER RAUM-TAGS — der Schlüssel sieht jeden Schreiber (Null-Renderer, eine echte Welt) ==="
    );
    console.log(
        `  Quelle: Aufrufbaum ${Q.baum.length} Methoden, Tabellen ${Q.tabellen.join(", ")} · Befunde ${Q.befunde.length}`
    );
    const L = S.linse;
    console.log(
        `  Linse: ${L.bauplaene} Baupläne · die Rechnung liest ${L.rechnung.length} Pfade, der Schlüssel ${L.schluessel.length} · fehlend ${L.fehltN}`
    );
    console.log(`  Sitzung am Klon von ${S.quelle}:`);
    for (const z of S.sitzung)
        console.log(
            `    ${z.schritt.padEnd(30)} ${String(z.teile).padStart(3)} Teile · gleich ${z.gleich} · gerechnet ${z.gerechnet} (soll ${
                z.erwartet === "rechnet" ? 1 : 0
            }) · zweite Frage ${z.zweit}`
        );
    console.log(
        `  Welt: ${S.welt.bauplaene} Baupläne · Abweichungen ${S.welt.abweichungen} · zweite Frage gerechnet ${S.welt.gerechnetZweit}`
    );
    console.log(`  Zähne: ${JSON.stringify(S.zaehne)}`);
    if (S.zahl)
        console.log(
            `  Zahl: ${S.zahl.bauplan} (${S.zahl.teile} Teile) · Rechnung ${S.zahl.rechnungMs} ms je Ruf · Gedächtnis ${S.zahl.gedaechtnisMs} ms je Ruf`
        );
    const rot = urteil(S, Q, pageErrors);
    if (rot.length) {
        console.error("\nROT:");
        for (const e of rot) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\nGRÜN — das Gedächtnis urteilt über jede Werkstatt-Änderung byte-gleich wie die Rechnung; sein Schlüssel liest jeden ihrer Eingänge."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Raum-Tags-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
