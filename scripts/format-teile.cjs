// format-teile.cjs — DER FORMAT-CHECK IN TEILEN (K14, CI in zwei Stufen).
//
// Der Schnitt: dieselbe Prüfung (dasselbe Prettier, dieselbe Konfiguration, dieselben Dateien) auf Teilen, parallel. Eine
// Datei zerfällt an den Grenzen ihrer Anweisungen — die oberste Ebene, und eine große Klasse (`class AnazhRealm`) an ihren
// Gliedern; jedes Teil formatiert Prettier in seinem echten Rahmen (Klassen-Glieder in `class AnazhRealm {` … `}`).
// Warum Teil-grün ⇔ Datei-grün: Prettier druckt jede Anweisung und jedes Klassen-Glied für sich (printClassBody/
// printStatementSequence: das Glied, dann eine Leerzeile, wenn im Original eine folgte); ein eigener Zeilen-Kommentar vor
// einem Glied ist sein führender Kommentar, ein Kommentar auf seiner letzten Zeile sein nachgestellter. Geschnitten wird
// darum NUR, wo der Trenner kanonisch ist — zwischen dem Zeilen-Ende des einen Glieds (samt nachgestelltem Kommentar) und
// dem Zeilen-Anfang des nächsten (samt führenden Kommentaren) steht genau "\n" oder "\n\n" — und nie vor einer Zeichenketten-
// Anweisung (sie würde im Teil zur Direktive). Jede andere Stelle (drei Umbrüche, Leerraum in der Leerzeile, zwei Anweisungen
// auf einer Zeile, CRLF, ein Parse-Fehler) bleibt IN einem Teil: dort urteilt Prettier mit dem echten Nachbarn. Die Linse
// urteilt nie selbst über Format, sie wählt nur die Schnitte.
//
// Selbsttest (--selftest): ein Fixture mit oberster Ebene, Direktive, großer Klasse, Kommentaren, Feldern und Schwanz, dazu
// 17 Täter (drei Umbrüche an einer Schnitt-Stelle, Leerraum-Zeile, Leerzeile nach `{` und vor `}`, zwei Anweisungen auf
// einer Zeile, falscher Einzug, fehlendes Semikolon, zu lange Zeile, CRLF, fehlender/doppelter Datei-Umbruch, Zeichenkette
// nach dem Schnitt …): das Urteil in Teilen (Schnitt an JEDER erlaubten Stelle) gleicht je Fall dem Urteil über die ganze
// Datei; der blinde Schneider (Schnitt ohne die Trenner-Regel) MUSS sich an mindestens einem Täter irren.
//
//   node scripts/format-teile.cjs [--selftest] <datei …>       (npm run format:check)
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const { Worker, isMainThread, parentPort } = require("worker_threads");
const { hauptLauf, selbsttestEnde, ausDatei } = require("./lib/welt-boot.cjs");

const TEIL_BYTES = 160 * 1024;

// ── die Schnitte ──
// Zeilen-Anfang (Index nach dem letzten "\n" vor i)
const zeilenAnfang = (t, i) => t.lastIndexOf("\n", i - 1) + 1;
// Das Zeilen-Ende einer Einheit: nach `end` nur Leerzeichen und Kommentare bis zum Umbruch → Index des "\n"; sonst -1
// (Code auf derselben Zeile — dort wird nie geschnitten).
function zeilenEnde(t, end, kommentare) {
    let i = end;
    for (;;) {
        while (t[i] === " " || t[i] === "\t") i++;
        const k = kommentare.find((c) => c.start === i);
        if (k) {
            i = k.end;
            continue;
        }
        return t[i] === "\n" ? i : -1;
    }
}
// Der Anfang einer Einheit samt führender Kommentare: der Zeilen-Anfang des ersten Kommentars nach `vorEnde` (dem
// Zeilen-Ende des Vorgängers); vor ihm steht auf seiner Zeile nur Einzug — sonst -1 (kein Schnitt davor).
function einheitAnfang(t, start, vorEnde, kommentare) {
    const k = kommentare.find((c) => c.start > vorEnde && c.start < start);
    const a = k ? k.start : start;
    const z = zeilenAnfang(t, a);
    return /^[ \t]*$/.test(t.slice(z, a)) ? z : -1;
}
const istZeichenkettenAnweisung = (n) =>
    n.type === "ExpressionStatement" && n.expression.type === "Literal" && typeof n.expression.value === "string";

// Eine Folge von Einheiten (Anweisungen oder Glieder) → Gruppen [von, bis) der Einheiten-Indizes, geschnitten nur an
// erlaubten Stellen, sobald eine Gruppe `teilBytes` erreicht. `blind`: ohne die Trenner-Regel (nur im Selbsttest).
function gruppen(t, einheiten, teilBytes, blind) {
    const out = [];
    let von = 0;
    for (let i = 0; i < einheiten.length - 1; i++) {
        const a = einheiten[i],
            b = einheiten[i + 1];
        const erlaubt =
            a.ende >= 0 &&
            b.anfang >= 0 &&
            !b.zeichenkette &&
            (blind || ["\n", "\n\n"].includes(t.slice(a.ende, b.anfang)));
        if (erlaubt && b.anfang - einheiten[von].anfang >= teilBytes) {
            out.push([von, i + 1]);
            von = i + 1;
        }
    }
    out.push([von, einheiten.length]);
    return out;
}

// Eine Datei → Teile { soll, von, rahmen } (`soll` ist zugleich die Eingabe: ein Teil ist formatiert, wenn Prettier ihn
// unverändert zurückgibt; `von` die Original-Zeile seines ersten Inhalts, `rahmen` die Zahl der vorangestellten Zeilen).
function teile(t, teilBytes = TEIL_BYTES, blind = false) {
    const ganz = [{ soll: t, von: 1, rahmen: 0 }];
    if (t.includes("\r") || t.length <= teilBytes) return ganz;
    const acorn = require("acorn");
    const kommentare = [];
    let ast = null;
    for (const sourceType of ["script", "module"]) {
        try {
            kommentare.length = 0;
            ast = acorn.parse(t, {
                ecmaVersion: "latest",
                sourceType,
                allowHashBang: true,
                allowReturnOutsideFunction: true,
                onComment: (block, text, start, end) => kommentare.push({ start, end }),
            });
            break;
        } catch {
            ast = null;
        }
    }
    if (!ast) return ganz; // Prettier nennt den Parse-Fehler selbst
    const zeile = (i) => {
        let n = 1;
        for (let p = t.indexOf("\n"); p >= 0 && p < i; p = t.indexOf("\n", p + 1)) n++;
        return n;
    };
    const einheit = (n, vorEnde) => ({
        anfang: einheitAnfang(t, n.start, vorEnde, kommentare),
        ende: zeilenEnde(t, n.end, kommentare),
        zeichenkette: istZeichenkettenAnweisung(n),
        n,
    });
    // die oberste Ebene; die Direktiven-Einleitung bleibt bei der ersten Anweisung
    const oben = [];
    let vorEnde = -1;
    for (const n of ast.body) {
        const e = einheit(n, vorEnde);
        if (n.directive !== undefined && oben.length && oben[oben.length - 1].n.directive !== undefined) e.anfang = -1;
        oben.push(e);
        vorEnde = e.ende;
    }
    if (!oben.length) return ganz;
    oben[0].anfang = 0;
    const out = [];
    // eine Strecke der obersten Ebene [von, bis) als Teile; die letzte trägt das Datei-Ende
    const obenTeile = (von, bis, letzte) => {
        if (von >= bis) return true;
        for (const [g0, g1] of gruppen(t, oben.slice(von, bis), teilBytes, blind)) {
            const a = oben[von + g0].anfang,
                istLetzte = letzte && von + g1 === bis;
            const e = istLetzte ? t.length : oben[von + g1 - 1].ende;
            if (a < 0 || e < 0) return false;
            out.push({ soll: t.slice(a, e) + (istLetzte ? "" : "\n"), von: zeile(a), rahmen: 0 });
        }
        return true;
    };
    // die große Klasse: an ihren Gliedern geteilt, jedes Teil in ihrem Rahmen `class X {` … `}`
    const ki = oben.findIndex(
        (e) => e.n.type === "ClassDeclaration" && e.n.end - e.n.start >= 2 * teilBytes && e.n.body.body.length > 1
    );
    if (ki < 0) return obenTeile(0, oben.length, true) ? out : ganz;
    const K = oben[ki];
    const koerper = K.n.body;
    const glieder = [];
    let gEnde = koerper.start;
    for (const n of koerper.body) {
        const e = einheit(n, gEnde);
        glieder.push(e);
        gEnde = e.ende;
    }
    const letztesG = glieder[glieder.length - 1];
    const sauber =
        K.anfang >= 0 &&
        glieder[0].anfang === koerper.start + 2 &&
        t.slice(koerper.start, koerper.start + 2) === "{\n" &&
        letztesG.ende >= 0 &&
        t.slice(letztesG.ende, koerper.end) === "\n}" &&
        (ki === oben.length - 1 ? t.slice(koerper.end) === "\n" : K.ende === koerper.end) &&
        (ki === 0 || (oben[ki - 1].ende >= 0 && ["\n", "\n\n"].includes(t.slice(oben[ki - 1].ende, K.anfang)))) &&
        (ki === oben.length - 1 ||
            (oben[ki + 1].anfang >= 0 &&
                !oben[ki + 1].zeichenkette &&
                ["\n", "\n\n"].includes(t.slice(K.ende, oben[ki + 1].anfang))));
    if (!sauber) return obenTeile(0, oben.length, true) ? out : ganz;
    if (!obenTeile(0, ki, false)) return ganz;
    const kopf = t.slice(K.anfang, koerper.start + 1) + "\n";
    const kopfZeilen = kopf.split("\n").length - 1;
    for (const [g0, g1] of gruppen(t, glieder, teilBytes, blind)) {
        const a = glieder[g0].anfang,
            e = glieder[g1 - 1].ende;
        if (a < 0 || e < 0) return ganz;
        out.push({ soll: kopf + t.slice(a, e) + "\n}\n", von: zeile(a), rahmen: kopfZeilen });
    }
    if (!obenTeile(ki + 1, oben.length, true)) return ganz;
    return out;
}

// ── das Urteil ──
// Ein Teil → null (formatiert) oder die erste abweichende Original-Zeile.
async function pruefeTeil(prettier, teil, optionen) {
    const ist = await prettier.format(teil.soll, optionen);
    if (ist === teil.soll) return null;
    const a = teil.soll.split("\n"),
        b = ist.split("\n");
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    return i < teil.rahmen ? `im Rahmen (Zeile ${i + 1} des Kopfs)` : `ab Zeile ${teil.von + i - teil.rahmen}`;
}

if (!isMainThread) {
    // ein Arbeiter: lädt Prettier einmal, prüft Teil um Teil
    const prettier = require("prettier");
    parentPort.on("message", async ({ nr, teil, optionen }) => {
        try {
            parentPort.postMessage({ nr, abweichung: await pruefeTeil(prettier, teil, optionen) });
        } catch (e) {
            parentPort.postMessage({ nr, fehler: String((e && e.message) || e).split("\n")[0] });
        }
    });
    return;
}

async function pruefen(dateien) {
    const prettier = require("prettier");
    const auftraege = [];
    const je = new Map();
    for (const d of dateien) {
        const abs = path.resolve(d);
        const info = await prettier.getFileInfo(abs, { ignorePath: [".gitignore", ".prettierignore"] });
        if (info.ignored) {
            console.log(`  ${d}: ignoriert (.prettierignore)`);
            continue;
        }
        const optionen = { ...((await prettier.resolveConfig(abs)) || {}), filepath: abs };
        const tt = teile(ausDatei(abs));
        je.set(d, { teile: tt.length, befund: [] });
        for (const teil of tt) auftraege.push({ d, teil, optionen });
    }
    // die größten Teile zuerst (ein ganzes Datei-Teil darf nicht am Ende allein laufen)
    auftraege.sort((x, y) => y.teil.soll.length - x.teil.soll.length);
    // so viele Arbeiter wie Kerne (höchstens 12); FORMAT_ARBEITER setzt die Zahl (Messung: 1 = ein Kern wie Prettier)
    const kerne = Number(process.env.FORMAT_ARBEITER) || Math.min(os.availableParallelism(), 12);
    const n = Math.max(1, Math.min(auftraege.length, kerne));
    let naechster = 0;
    await Promise.all(
        Array.from({ length: n }, () => {
            const w = new Worker(__filename);
            return new Promise((fertig, fehl) => {
                const geben = () => {
                    if (naechster >= auftraege.length) return w.terminate().then(() => fertig());
                    const nr = naechster++;
                    w.postMessage({ nr, teil: auftraege[nr].teil, optionen: auftraege[nr].optionen });
                };
                w.on("message", (m) => {
                    const a = auftraege[m.nr];
                    if (m.fehler) je.get(a.d).befund.push(`Fehler: ${m.fehler}`);
                    else if (m.abweichung) je.get(a.d).befund.push(m.abweichung);
                    geben();
                });
                w.on("error", fehl);
                geben();
            });
        })
    );
    let rot = 0;
    for (const [d, { teile: k, befund }] of je) {
        if (befund.length) {
            rot++;
            console.log(`[warn] ${d} — nicht formatiert (${befund.slice(0, 5).join(" · ")})`);
        } else console.log(`  ${d}: formatiert (${k} ${k === 1 ? "Teil" : "Teile"})`);
    }
    console.log(`  ${auftraege.length} Teile auf ${n} Arbeitern`);
    return rot;
}

// ── der Selbsttest: Teil-Urteil ≡ Datei-Urteil ──
function fixture() {
    const glieder = [];
    for (let i = 0; i < 14; i++) {
        const vor = i % 3 === 0 ? `    // Kommentar vor m${i}\n` : i % 3 === 1 ? `    /** Doku m${i} */\n` : "";
        const rumpf =
            i % 4 === 0
                ? `    static f${i} = { a: ${i}, b: "x" };\n`
                : `    m${i}(x) {\n        const y = x + ${i}; // nachgestellt\n        return y * 2;\n    }\n`;
        glieder.push(vor + rumpf);
    }
    const koerper = glieder.map((g, i) => g + (i % 2 ? "\n" : "")).join("");
    return (
        `"use strict";\n// Kopf der Datei\nconst a = 1;\n\nfunction f(x) {\n    return x;\n}\n\n` +
        `/** die große Klasse */\nclass K {\n${koerper.replace(/\n+$/, "")}\n}\n\n` +
        `K.X = 1;\n\n// Schwanz\nK.Y = function () {\n    return 2;\n};\nK.Z = [1, 2, 3];\n`
    );
}
async function selbsttest() {
    const prettier = require("prettier");
    const optionen = {
        // die Konfiguration der Wurzel (für jede Datei dort dieselbe; der Stamm ist nach dem Schnitt keine Wurzel-Datei mehr)
        ...((await prettier.resolveConfig(path.join(__dirname, "..", "package.json"))) || {}),
        filepath: "f.js",
    };
    const ganz = async (t) => {
        try {
            return (await prettier.format(t, optionen)) === t;
        } catch {
            return false;
        }
    };
    const inTeilen = async (t, blind) => {
        // Schnitt an JEDER erlaubten Stelle (Teil-Größe 1), die Klasse wird ab 2 Bytes geteilt
        const tt = teileMit(t, blind);
        for (const teil of tt)
            try {
                if ((await prettier.format(teil.soll, optionen)) !== teil.soll) return { ok: false, n: tt.length };
            } catch {
                return { ok: false, n: tt.length };
            }
        return { ok: true, n: tt.length };
    };
    const g = fixture();
    const ersetze = (a, b) => (t) => {
        if (!t.includes(a)) throw new Error(`Fixture trägt „${a}" nicht`);
        return t.replace(a, b);
    };
    const faelle = [
        ["gut", (t) => t],
        [
            "drei Umbrüche zwischen zwei Gliedern",
            ersetze("    }\n\n    // Kommentar vor m6", "    }\n\n\n    // Kommentar vor m6"),
        ],
        [
            "Leerraum in der Leerzeile",
            ersetze("    }\n\n    // Kommentar vor m6", "    }\n    \n    // Kommentar vor m6"),
        ],
        ["Leerzeile nach der Klassen-Klammer", ersetze("class K {\n", "class K {\n\n")],
        ["Leerzeile vor der schließenden Klammer", ersetze("\n}\n\nK.X", "\n\n}\n\nK.X")],
        ["zwei Anweisungen auf einer Zeile", ersetze("K.X = 1;\n", "K.X = 1; K.W = 0;\n")],
        ["falscher Einzug im Glied", ersetze("        return y * 2;\n", "      return y * 2;\n")],
        ["fehlendes Semikolon am Feld", ersetze('b: "x" };\n', 'b: "x" }\n')],
        [
            "zu lange Zeile",
            ersetze("const a = 1;", `const a = [${Array.from({ length: 40 }, (_, i) => i).join(", ")}];`),
        ],
        ["CRLF", (t) => t.replace(/\n/g, "\r\n")],
        ["kein Umbruch am Datei-Ende", (t) => t.replace(/\n$/, "")],
        ["zwei Umbrüche am Datei-Ende", (t) => t + "\n"],
        ["Zeichenkette nach einem Schnitt", ersetze("K.X = 1;\n", 'K.X = 1;\n"kein Direktiv";\n')],
        [
            "Kommentar mit Leerzeile vor dem Glied (bleibt)",
            ersetze("    // Kommentar vor m6\n", "    // Kommentar vor m6\n\n"),
        ],
        [
            "nachgestellter Kommentar am Glied-Ende",
            ersetze("    }\n\n    // Kommentar vor m6", "    } // Ende m1\n\n    // Kommentar vor m6"),
        ],
        ["drei Umbrüche auf der obersten Ebene", ersetze("K.X = 1;\n\n// Schwanz", "K.X = 1;\n\n\n// Schwanz")],
        ["Leerzeile nach der Direktive (bleibt)", ersetze('"use strict";\n', '"use strict";\n\n')],
    ];
    const f = [];
    let blindIrrt = 0;
    for (const [n, tat] of faelle) {
        const t = tat(g);
        const soll = await ganz(t);
        const ist = await inTeilen(t, false);
        const blind = await inTeilen(t, true);
        if (blind.ok !== soll) blindIrrt++;
        const ok = ist.ok === soll && (n !== "gut" || (soll && ist.n >= 10));
        console.log(
            `  ${ok ? "✅" : "❌"} Selbsttest „${n}" → ganze Datei ${soll ? "formatiert" : "ROT"}, in ${ist.n} Teilen ${ist.ok ? "formatiert" : "ROT"}` +
                (blind.ok !== soll ? " (der blinde Schneider irrt hier)" : "")
        );
        if (!ok) f.push(`„${n}": ganze Datei ${soll}, Teile ${ist.ok} (${ist.n} Teile)`);
    }
    if (!blindIrrt) f.push("der blinde Schneider irrt an keinem Täter — das Fixture beweist die Trenner-Regel nicht");
    return f;
}
// Teilen mit Schnitt an jeder erlaubten Stelle (Selbsttest)
function teileMit(t, blind) {
    return teile(t, 1, blind);
}

hauptLauf(async () => {
    const args = process.argv.slice(2);
    if (args.includes("--selftest")) {
        console.log("=== FORMAT IN TEILEN — Selbsttest (Teil-Urteil gegen Datei-Urteil) ===");
        selbsttestEnde(await selbsttest(), "in Teilen urteilt Prettier wie über die ganze Datei, der blinde Schneider irrt.");
        if (args.length === 1) return;
    }
    // ein Verzeichnis (der Stamm `stamm/`) steht für seine .js-Dateien — cmd expandiert keine Globs
    const dateien = args
        .filter((a) => !a.startsWith("--"))
        .flatMap((a) =>
            fs.statSync(a).isDirectory()
                ? fs
                      .readdirSync(a)
                      .filter((f) => f.endsWith(".js"))
                      .sort()
                      .map((f) => path.join(a, f))
                : [a]
        );
    if (!dateien.length) {
        console.error("Aufruf: node scripts/format-teile.cjs [--selftest] <datei …>");
        process.exit(2);
    }
    const t0 = Date.now();
    console.log(`=== FORMAT IN TEILEN — ${dateien.length} Dateien (Prettier ${require("prettier").version}) ===`);
    const rot = await pruefen(dateien);
    const s = ((Date.now() - t0) / 1000).toFixed(1);
    if (rot) {
        console.log(`❌ ${rot} ${rot === 1 ? "Datei ist" : "Dateien sind"} nicht formatiert (${s} s) — npm run format`);
        process.exit(1);
    }
    console.log(`✅ Alle Dateien formatiert (${s} s).`);
});
