// diag-pipeline-constitution.cjs — P8: DIE VERFASSUNG DER PIPELINE (Struktur ersetzt Ermahnung), im `check`-Gate.
// Eine Absenz-Wand: jede Regel nennt das Anti-Muster eines vollzogenen Pipeline-Schnitts (Inline-Wuchs, Welt-Bäcker,
// Bake-iframe, Formel-Kopie, Dichte-Zwilling, nackter Render-Zähler, kind-Zweig, Kern-ns-Literal, zweite Naht, mp-Zwilling,
// Mesh-Gras, placeExtra-Griff) und liest über den EINEN Absenz-Helfer `stammLib.fehlt` (Klarheit D3: keine
// Präsenz-Probe liest Quelltext) — im Stamm, in einem Glied, im Stamm außer seiner Engstelle (`ausser`) oder in einer
// Datei; ein Glied ohne Definition wirft. Die Anwesenheit des Baus beweisen die Verhaltens-Bänder. Der Immer-Selbsttest
// trägt ein Anti-Muster in den Stamm zurück und muss ROT sehen. Vollständig: `docs/neues-kleid-verfassung.md`.
//   node scripts/diag-pipeline-constitution.cjs
"use strict";
require("./lib/urteil-zeile.cjs").wache(); // Lehre 6: eine gedruckte ROTE Zeile bei Exit 0 wird Exit 1
const fs = require("fs");
const path = require("path");
const { fehlt } = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
const datei = (d) => ({ datei: d });
// [Gesetz, Glied (null = der ganze Text, { ausser } = außer der Engstelle), Anti-Muster, Quelle (ohne = der Stamm)]
const GESETZE = [
    ["G2 EIN Wuchs: keine Inline-Rekursion grow(pos,dir,radius,length,depth) in foundry-core", null, /function grow\(pos, ?dir, ?radius, ?length, ?depth/, datei("foundry-core.js")],
    ["G3 kein Welt-RTT-Nachbau (_bakeImpostorAtlasRTT · _impostorBlitPixels · _impostorDilate · _foundryBakeLeaves)", null, /_bakeImpostorAtlasRTT|_impostorBlitPixels|_impostorDilate|_foundryBakeLeaves/],
    ["G3 kein asset-foundry-Bake-iframe", null, /iframe\.src\s*=\s*[^;]*asset-foundry/],
    // pipeline.K2: EIN Bäcker der Karte (der Welt-Renderer) — kein Studio-Bäcker in Brücke und Labor
    ["G3 EIN Karten-Bäcker: die Brücke", null, /bakeImpostorAtlas|WebGLRenderTarget/, datei("foundry-bruecke.js")],
    ["G3 EIN Karten-Bäcker: das Labor", null, /bakeImpostorAtlas|_impRT\b/, datei("worlds/terrain/phytogenesis.js")],
    ["G3 die iframe-Impostor-Methoden bleiben geschnitten", null, /_foundryEnsureBakeIframe|_foundryRequestImpostor|_foundryBuildImpostorRecord|_foundryBakeImpostorRequest|_applyStudioImpostorPayload|_foundryBaecker/],
    ["G6 keine Nischen-Formel-Kopie (wF/wT/wE)", null, /const wF = \(ss\(0\.4, 0\.8, clim\)/],
    ["G6 keine reverse-J-Größen-Kopie (0.55 + 1.45·ue^1.45)", null, /0\.55 \+ 1\.45 \* Math\.pow\(ue/],
    ["G6 keine v36-Rahmen-Kopie (totalH * 0.51)", null, /totalH \* 0\.51/],
    ["G7 kein eigener Dichte-Rechner in _scatterPass", "_scatterPass", /_foliageDensityScale/],
    ["G7 kein eigener Dichte-Rechner in _tickFoliageThin", "_tickFoliageThin", /_foliageDensityScale/],
    ["G7 kein nackter render.calls (nur hinter drawCalls und als Kehraus-Marke)", { ausser: "_gpuKehrausMarke" }, /(?<!drawCalls[^;]{0,160})render\.calls/],
    ["N1/M8 kein kind-Vergleich im Auto-Register-Chokepoint", "_foundryAutoRegisterSpecies", /kind\s*[!=]==?\s*"/],
    ["N2 kein Kern-ns-Literal in der Brücke (self.__vehicleCore)", null, /self\.__vehicleCore/, datei("foundry-bruecke.js")],
    ["N2 kein Kern-ns-Literal im Pflanzen-Labor (self.__vehicleCore)", null, /self\.__vehicleCore/, datei("worlds/terrain/phytogenesis.js")],
    ["N4.1 keine zweite Reply→Geometrie-Konversion neben _foundryBuildMesh", { ausser: "_foundryBuildMesh" }, /new T\.BufferAttribute\(m\.position\.array/],
    ["N4.2 kein eigener mp-Leser (budgetRegler trägt)", null, /typeof mp\.(roughness|metalness|envMapIntensity)\b/],
    ["N7.4 der Mesh-Gras-Konsum bleibt tot", null, /sg === "leer"|if \(!grassStudio\) \{/],
    ["N7.4 kein _grassBladeTuftGeometry", null, /_grassBladeTuftGeometry/],
    ["N7.4 kein Gras-Thin-Tick", null, /_tickGrassThin/],
    ["N4.4 kein tree|shrub-Literal in _foundryPresetIsTree", "_foundryPresetIsTree", /"tree"|"shrub"/],
    ["N5 kein placeExtra-Griff in der Wald-Nischen-Quelle", "_forestExtraSpecies", /placeExtra/],
    ["N5 außer _placePolicyFor liest kein Glied .placeExtra", { ausser: "_placePolicyFor" }, /\.placeExtra/],
];

const selbst = !fehlt(null, /_tickGrassThin/, (t) => t.replace(/\n {4}_tickFoliageThin\(/, "\n    _tickGrassThin(")) && /_tickGrassThin/.test(fehlt.wo || "");
if (!selbst) {
    console.error("❌ SELBSTCHECK FEHLGESCHLAGEN — die Wand sieht ein zurückgekehrtes Anti-Muster nicht. Kein verlässliches Grün.");
    process.exit(2);
}
console.log("=== P8 — DIE VERFASSUNG DER PIPELINE (Absenzen über stammLib.fehlt, Selbsttest feuert) ===");
let rot = 0;
for (const [name, glied, re, quelle] of GESETZE) {
    const ok = fehlt(glied, re, quelle);
    if (!ok) rot++;
    console.log(`  ${ok ? "✅" : "❌"} ${name}${ok ? "" : " — " + fehlt.wo}`);
}
const v2 = fs.existsSync(path.join(ROOT, "spec/asset-contract/v2/CONTRACT.md"));
if (v2) rot++;
console.log(`  ${v2 ? "❌" : "✅"} G4 Vertrag v2 (Kreatur-Skin) bleibt gefallen (KONVERGENZ III — der Baum trägt)`);
console.log(`\n${GESETZE.length + 1 - rot} Gesetze gehalten, ${rot} verletzt.`);
if (rot) {
    console.error("\n❌ ROT — ein Pipeline-Gesetz wurde still gebrochen: heile die Wurzel, nicht diese Linse.");
    process.exit(1);
}
console.log("\n✅ GRÜN — die Pipeline-Verfassung steht: kein Schnitt kehrt zurück.");

// ============================================================================
// TEIL 2 — DIE EIN-SCHREIBER-WAND (Wort des Schöpfers 19.11.: „wir werden exponentiell schneller, wenn wir dinge im
// untersten kern perfektionieren, in synergie“). Jeder rote Bruch des 19.11. war ein Zwilling einer GRUNDGRÖSSE (die
// Belichtung von außen gesetzt, tagNull an sieben Geburtsorten, ein eigener Licht-Pfad, die Rad-Haftung aus der
// Bodenfarbe). Das Register spec/stamm/grundgroessen.json nennt je Größe den EINEN Schreiber (`schreiber`, seine Anker
// je Datei in `kanon`) und die Muster, an denen ein Schreiber erkannt wird (`muster`: wer die Größe selbst ERZEUGT — ein
// Feld-Schreiber, ein eigener Generator, ein Literal); die Schuld von heute steht beim Namen in der Ratsche
// spec/profiband/ratsche-grundgroessen.json (`zwillinge`: Größe → Datei → Anker, `×n` = n Treffer; das Werkzeug
// schreibt sie, sie sinkt nur — eine Ratsche wie ratsche-quelltext.json). Der Korpus: der Stamm,
// die Kerne (cores.manifest.json), worlds/ (ohne die Vendor-Kopien in lib/, die Seiten mit ihrem Inline-Skript), die
// Wurzel-JS — und scripts/ für den BEOBACHTER: eine Probe, die eine Grundgröße von außen setzt (Muster mit
// `beobachter`), misst nicht die Welt. Kommentare fallen über den EINEN Stripper, Literale bleiben (der Seiten-Code
// einer Probe steht im Literal). Das Urteil:
//   TÄTER               ein Treffer ohne Anker in `kanon` oder `zwillinge` (oder über der Zahl seines Ankers) — Datei:Zeile,
//                       Größe, „lies stattdessen <Kanon>“.
//   REGISTER-ZEILE …    ein Anker, den der Code nicht mehr (so oft) trägt: die Ratsche ist keine Erlaubnis-Liste, sie
//                       schrumpft nur — `--schrumpfen` streicht die Zeile, im selben Commit wie der Schnitt.
//   KANON-ANKER TOT     der Schreiber zog um, das Register folgt.
// Die Tafel je Größe (Z = Dateien mit Zwilling, L = Dateien, die den Kanon lesen, Z × L) ist der Zähler der Wellen.
// Der Immer-Selbsttest pflanzt JEDES Muster als Mutant in eine Kopie (Täter beim Namen), lässt je Größe einen
// registrierten Zwilling verschwinden und liest die `frei`-Zeilen (Messung, Geburt einer Kennung: die Wand schweigt).
//   node scripts/diag-pipeline-constitution.cjs [--roh | --schrumpfen]
//   --roh         die Täter am Bestand OHNE das Register der Zwillinge (die Zahl vor der Registrierung), Exit 0
//   --schrumpfen  streicht tote Anker und senkt Zahlen in der Ratsche (nie hinauf, nie neu)
// ============================================================================
const stammLib = require("./lib/stamm.cjs");
const [REGISTER, RATSCHE] = ["spec/stamm/grundgroessen.json", "spec/profiband/ratsche-grundgroessen.json"];
const lies = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const baum = (d, aus = []) => {
    for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
        const p = `${d}/${e.name}`;
        if (e.isDirectory()) (e.name === "lib" && d.startsWith("worlds")) || baum(p, aus);
        else if (/\.(?:[cm]?js|html)$/.test(p) && !p.endsWith(".min.js")) aus.push(p);
    }
    return aus;
};
const korpus = () => [
    ...new Set([
        ...stammLib.dateien(ROOT),
        ...JSON.parse(lies("cores.manifest.json")).flatMap((k) => k.scripts),
        ...fs.readdirSync(ROOT).filter((f) => /^[\w-]+\.js$/.test(f) || f === "index.html"),
        ...baum("worlds"),
        ...baum("scripts"),
    ]),
];
// das Inline-Skript einer Seite, alles andere geleert (die Zeilen bleiben)
function nurSkript(html) {
    const leer = (t) => t.replace(/[^\n]/g, "");
    let [aus, i] = ["", 0];
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        const a = m.index + m[0].indexOf(">") + 1;
        aus += leer(html.slice(i, a)) + (/\bsrc\s*=|importmap|json/.test(m[1]) ? leer(m[2]) : m[2]);
        i = a + m[2].length;
    }
    return aus + leer(html.slice(i));
}
const beobachtet = (f) => f.startsWith("scripts/");
const anker = (a) => ((m) => (m ? [a.slice(0, m.index), +m[1]] : [a, 1]))(/ ×(\d+)$/.exec(a));
const rxMerk = new Map();
const rxVon = (rx, f) => rxMerk.get(rx + f) || rxMerk.set(rx + f, new RegExp(rx, f)).get(rx + f);

// die Treffer einer Datei: je Muster-Fund Größe, Zeile und Fenster (die Zeile; an einer gepressten Zeile ±100 Zeichen)
function treffer(reg, f, c) {
    const aus = [];
    for (const m of Object.values(reg.muster)) {
        if (beobachtet(f) ? !m.beobachter : m.groesse === "beobachter") continue;
        for (const t of c.matchAll(rxVon(m.rx, m.i ? "gi" : "g"))) {
            const [a, e] = [c.lastIndexOf("\n", t.index - 1) + 1, c.indexOf("\n", t.index)];
            const z = c.slice(a, e < 0 ? c.length : e);
            const fenster = z.length > 240 ? c.slice(Math.max(a, t.index - 100), t.index + t[0].length + 100) : z;
            aus.push({ g: beobachtet(f) ? "beobachter" : m.groesse, m, was: t[0], i: t.index, fenster });
        }
    }
    let [pos, zeile] = [0, 1];
    for (const t of aus.sort((x, y) => x.i - y.i)) {
        for (let k = c.indexOf("\n", pos); k >= 0 && k < t.i; k = c.indexOf("\n", k + 1)) zeile++;
        [pos, t.zeile] = [t.i, zeile];
    }
    return aus;
}

// das Urteil über `dateien` (`text(f)` ihr Quelltext): die Verletzungen, je Größe der Stand (Z, Stellen, L, Namen) und je
// Anker die gelesene Zahl (`ist`, der Grund von --schrumpfen); `ganz` = der volle Korpus: ein Eintrag ohne Datei verletzt
function urteil(reg, dateien, text, ganz) {
    const [rot, stand, ist] = [[], {}, {}];
    for (const g of Object.keys(reg.groessen)) [stand[g], ist[g]] = [{ z: 0, stellen: 0, l: 0, namen: [] }, {}];
    for (const f of dateien) {
        const c = stammLib.ohneKommentare(f.endsWith(".html") ? nurSkript(text(f)) : text(f));
        const alle = treffer(reg, f, c);
        for (const [g, G] of Object.entries(reg.groessen)) {
            if (beobachtet(f) === (g === "beobachter") && rxVon(G.leser, "").test(c)) stand[g].l++;
            const [kanon, zw] = [G.kanon[f] || [], (G.zwillinge[f] || []).map(anker)];
            const [kn, zn] = [kanon.map(() => 0), zw.map(() => [])];
            for (const t of alle) {
                if (t.g !== g) continue;
                const k = kanon.findIndex((a) => t.fenster.includes(a));
                const z = k < 0 ? zw.findIndex(([a]) => t.fenster.includes(a)) : -1;
                if (k >= 0) kn[k]++;
                else if (z >= 0) zn[z].push(t);
                else rot.push(`TÄTER ${f}:${t.zeile} · ${G.name} · ${t.m.was}: \`${t.was}\` — lies stattdessen ${t.m.lies}`);
            }
            kanon.forEach(
                (a, i) => kn[i] || rot.push(`KANON-ANKER TOT ${f} „${a}“ (${G.name}) — der Schreiber zog um, das Register folgt im selben Commit`)
            );
            zw.forEach(([a, n], i) => {
                const da = zn[i];
                if (da.length < n)
                    rot.push(`REGISTER-ZEILE STIRBT IM SELBEN COMMIT ${f} „${a}“ (${G.name}): ${da.length} statt ${n} Treffer — \`--schrumpfen\` streicht sie`);
                if (da.length > n)
                    rot.push(`TÄTER ${f}:${da.map((t) => t.zeile).join(",")} · ${G.name} · ${da[0].m.was}: ${da.length} statt ${n} an „${a}“ — lies stattdessen ${da[0].m.lies}`);
                stand[g].stellen += Math.min(da.length, n);
            });
            if (zw.length) {
                ist[g][f] = zn.map((da) => da.length);
                stand[g].z++;
                stand[g].namen.push(`${f} (${G.zwillinge[f].join(" · ")})`);
            }
        }
    }
    if (ganz)
        for (const G of Object.values(reg.groessen))
            for (const f of new Set([...Object.keys(G.kanon), ...Object.keys(G.zwillinge)]))
                if (!dateien.includes(f)) rot.push(`REGISTER-ZEILE STIRBT IM SELBEN COMMIT ${f} (${G.name}): die Datei liegt nicht im Korpus`);
    return { rot, stand, ist };
}
// das Register mit anderen Zwillingen (`zw(g, G)`) — ohne Wort: ohne Kanon und ohne Zwillinge (der Mutant steht allein)
const mitZwillingen = (reg, zw = () => ({}), kanon = false) => ({
    ...reg,
    groessen: Object.fromEntries(Object.entries(reg.groessen).map(([g, G]) => [g, { ...G, kanon: kanon ? G.kanon : {}, zwillinge: zw(g, G) }])),
});

// DER IMMER-SELBSTTEST: jedes Muster feuert an seinem Mutanten beim Namen (im Spiel und, als Beobachter, in scripts/), die
// `frei`-Zeilen schweigen, die Zahl eines Ankers hält nach oben und unten, je Größe stirbt ein registrierter Zwilling laut
function selbsttest(reg) {
    const fehler = [];
    const allein = (f, t, r = mitZwillingen(reg)) => urteil(r, [f], () => t, false).rot;
    let n = 0;
    for (const [id, m] of Object.entries(reg.muster))
        for (const f of [m.groesse === "beobachter" ? [] : "stamm/mutant.js", m.beobachter ? "scripts/mutant.cjs" : []].flat()) {
            const G = reg.groessen[beobachtet(f) ? "beobachter" : m.groesse];
            const r = allein(f, "\n" + m.mutant + "\n");
            const soll = `TÄTER ${f}:2 · ${G.name} · ${m.was}`;
            n++;
            if (r.length !== 1 || !r[0].startsWith(soll) || !r[0].endsWith("lies stattdessen " + m.lies))
                fehler.push(`Mutant „${id}“ in ${f}: ${r.length} Zeilen statt der einen „${soll}“`);
        }
    for (const f of ["stamm/frei.js", "scripts/frei.cjs"])
        for (const z of allein(f, reg.frei.join("\n"))) fehler.push(`die Wand feuert an einer \`frei\`-Zeile: ${z}`);
    const mitZahl = mitZwillingen(reg, (g) => (g === "samen" ? { "stamm/mutant.js": ["Math.random ×2"] } : {}));
    const zahl = [1, 2, 3].map((k) => allein("stamm/mutant.js", "Math.random();".repeat(k), mitZahl).map((z) => z.split(" ")[0]).join());
    if (String(zahl) !== "REGISTER-ZEILE,,TÄTER") fehler.push(`die Zahl eines Ankers hält nicht (1 · 2 · 3 Treffer an ×2: ${zahl.join(" | ")})`);
    for (const [g, G] of Object.entries(reg.groessen)) {
        const f = Object.keys(G.zwillinge)[0];
        if (!f) continue;
        const soll = `REGISTER-ZEILE STIRBT IM SELBEN COMMIT ${f} „${anker(G.zwillinge[f][0])[0]}“`;
        n++;
        if (!allein(f, "", reg).some((z) => z.startsWith(soll))) fehler.push(`der entfernte Zwilling der Größe ${g} bleibt still (${f})`);
    }
    if (fehler.length) {
        console.error("❌ SELBSTTEST DER EIN-SCHREIBER-WAND — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(2);
    }
    return n;
}

const registerText = (reg) =>
    JSON.stringify(reg, null, 4).replace(/\[\n\s+([^\][{}]*?)\n\s+\]/g, (m, innen) =>
        ((eins) => (eins.length < 150 ? eins : m))("[" + innen.split(/\n\s+/).join(" ") + "]")
    ) + "\n";

{
    const ratsche = JSON.parse(lies(RATSCHE));
    const reg = mitZwillingen(JSON.parse(lies(REGISTER)), (g) => ratsche.zwillinge[g] || {}, true);
    const mutanten = selbsttest(reg);
    const [roh, t0, dateien] = [process.argv.includes("--roh"), Date.now(), korpus()];
    const { rot: taeter, stand, ist } = urteil(roh ? mitZwillingen(reg, () => ({}), true) : reg, dateien, lies, true);
    console.log(`\n=== TEIL 2 — DIE EIN-SCHREIBER-WAND (${REGISTER} + ${RATSCHE}; Selbsttest: ${mutanten} Mutanten feuern beim Namen) ===`);
    if (process.argv.includes("--schrumpfen")) {
        let fiel = 0;
        for (const [g, G] of Object.entries(reg.groessen))
            for (const [f, zahlen] of Object.entries(ist[g])) {
                const neu = G.zwillinge[f].map(anker).flatMap(([a, n], i) => {
                    const k = Math.min(n, zahlen[i]);
                    fiel += n - k;
                    return k ? [k > 1 ? `${a} ×${k}` : a] : [];
                });
                if (neu.length) G.zwillinge[f] = neu;
                else delete G.zwillinge[f];
            }
        fs.writeFileSync(path.join(ROOT, RATSCHE), registerText(ratsche));
        console.log(`  --schrumpfen: ${fiel} Zwillings-Stellen aus der Ratsche gestrichen (${RATSCHE} geschrieben, fahre die Wand neu)`);
        process.exit(0);
    }
    if (roh) {
        for (const z of taeter) console.log("  " + z);
        const n = taeter.filter((z) => z.startsWith("TÄTER"));
        console.log(`\nROH (ohne das Register der Zwillinge): ${n.length} Täter in ${new Set(n.map((z) => z.split(/[ :]/)[1])).size} Dateien.`);
        process.exit(0);
    }
    const reihe = Object.entries(reg.groessen).sort(([a], [b]) => stand[b].z * stand[b].l - stand[a].z * stand[a].l);
    for (const [g, G] of reihe) {
        const s = stand[g];
        console.log(`  ${G.name} · Welle ${G.welle} · Z ${s.z} Dateien (${s.stellen} Stellen) · L ${s.l} · Z × L ${s.z * s.l}`);
        console.log(`     Schreiber: ${G.schreiber}`);
        if (s.z) console.log(`     offen: ${s.namen.join(" · ")}`);
    }
    const [z, stellen] = ["z", "stellen"].map((k) => reihe.reduce((n, [g]) => n + stand[g][k], 0));
    for (const zeile of taeter) console.log("  ❌ " + zeile);
    if (taeter.length) {
        console.error(
            `\n❌ ROT — ${taeter.length} Verletzung(en) der Ein-Schreiber-Wand: lies den Kanon oder streiche die tote Register-Zeile (\`--schrumpfen\`), nie ein neuer Anker.`
        );
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — kein Schreiber neben Kanon und benannter Schuld: ${stellen} Zwillings-Stellen in ${z} Datei-Einträgen stehen beim Namen (${dateien.length} Dateien, ${Date.now() - t0} ms).`
    );
}
