// diag-werkstatt-weg.cjs — DIE WERKSTATT-WEG-LINSE (Welle L Folge, v1-Schritte 3–4: in der Werkstatt bauen, mit der KI
// erschaffen). Die Defekte, die die sichtbare Leben-Schau am 07.10. auf dem v1-Pfad fand
// (artifacts/profiband/leben-schau/befund-v1-pfad.md), je beim NAMEN. Jede Probe ruft den Chokepoint selbst im echten Boot
// (headless, foundry-ON, Null-Renderer der Welt) und misst seine Wirkung.
//
//   D10 — DER SAME EINES SATZES: „pflanz mir einen eichenhain", „setze insel hier", „baue fraktal tempel" und ein KI-Programm
//     ohne Seed ziehen ihre Welt-Substanz (Same, Streuung, Drehung, Größe) aus dem Welt-Strom (`_bauSame`, Γ5), nie aus
//     Math.random. Gemessen: Math.random-Züge je Satz (Befund: Hain 1 + 24, Insel 1, Fraktal 1, KI ohne Seed 13) und die
//     Wiederholung: derselbe Satz an derselben Stelle der Welt-Geschichte ergibt denselben Samen und dieselben Orte.
//
//   L-WORTSCHATZ — DER WORT-KATALOG IST DER REZEPT-KATALOG: jedes Wort löst über die Studio-Arten auf (Rezept-ids, Werk-Namen,
//     Art-Wörter des Art-Gesetzes, Studio-Namen), nie über eine Hand-Liste. Befund: „bau mir ein fachwerkhaus" →
//     „Unbekannter Befehl. Meintest du 'baue dorf hier'?", `_studioBlueprintForWord` null für fachwerkhaus · wagen. Gemessen:
//     die Wörter des Befunds, jede platzierbare Studio-Art ihr Rezept-Wort, „bau mir ein fachwerkhaus" stellt ein Haus in
//     die Welt, und ein unbekanntes Wort („scheune") sagt dem Spieler im Chat, was die Studios kennen.
//
//   L-WERKSTATT · FRIEDEN · L-RÜCKMELDUNG — JEDER WEG FÜHRT ZUM STEHENDEN WERK: die Eiche über drei Wege (Werkstatt-FERTIGEN,
//     Rezeptbuch, Hotbar) in drei Lagen (schöpfer · frieden mit dem Material · frieden ohne), je mit dem echten Klick und dem
//     Rechtsklick (`tryMousePlace`) an einem freien Ort. Soll: mit Material bzw. in schöpfer steht das Werk auf jedem Weg,
//     das Material zieht genau EINMAL die Kosten (das Gesetz des Modus: frieden und pfad zahlen, frei nur schöpfer);
//     ohne Material sagt der erste Schritt die Absage im Spieler-Kanal (Chat) oder der Knopf steht gesperrt mit dem
//     Fehlenden. Dazu: Haus und GT aus der Werkstatt, die Suche „haus" findet die Häuser, und die Lichtung der Genesis-
//     Plattform färbt das Phantom rot und sagt beim Setzen laut, warum dort nichts wächst. Befund (Leben-Schau 07.10.):
//     „0 von 3 Wegen", frieden verweigert nur im Log (im Stamm), das Rezeptbuch legte die Eiche ins Inventar
//     und zog das Material doppelt.
//
//   BRENNGLAS — DAS LICHT BRENNT, WO ES SICH BÜNDELT, UND DIE ZERSTÖRUNG NENNT SICH: die Eiche 2,4 m vor der Mitte der
//     Genesis-Plattform (ihr Quarz-Kern ist nach der Tag-Sprache ein Brennglas) übersteht einen ganzen sonnigen Tag; die
//     gebaute Linse (Quarz-Kugel im Bronze-Ring, 1 m über dem Boden) entzündet zu Mittag die Eiche unter sich — erst glimmt
//     sie, dann brennt sie, beides im Spieler-Kanal —, nachts nie, und was den Brennpunkt verlässt, kühlt. Dazu der
//     Zensus der Welt: was das alte Gesetz im 4-m-Kreis jeder Linse erhitzte, was das Licht jetzt erreicht. Befund
//     (Leben-Schau 07.10.): die Werkstatt-Eiche verbrannte nach 20 s Sonne still (Architekturen 125 → 124, nur im Log).
//
//   DER SAME DES WERKS (Gegenprüfung 08.10., ROT 1) — DAS GESETZTE WERK IST DAS PHANTOM, AUCH BEIM MITSPIELER: das Setzen
//     (`confirmBuild`) stellt die Gestalt, Drehung und Tönung, die das Phantom zeigt (EIN Same je Werk, `_werkSame` — dieselbe
//     Gestalt wie Werkstatt-Vorschau und Hand), würfelt nichts aus Math.random, und die Nachricht an den Mitspieler trägt
//     Same und Drehung des Werks: dort steht dasselbe Werk. Der Zähler des Welt-Stroms (`_bauSame`) reist im Welt-Gedächtnis
//     (`worldMeta`): nach einem Reload wiederholt der Strom nie seinen ersten Samen. Befund: der Standard-Same der Wurzel
//     `spawnArchitecture` war Math.random, der Broadcast schickte den Samen 0 (immer Gestalt 1), das Phantom zeigte die
//     Gestalt des Bauplan-Namens und blickte zum Spieler, das Werk stand mit Drehung 0.
//
//   node scripts/diag-werkstatt-weg.cjs [--selftest]          Port: WERKSTATT_WEG_PORT (Standard 4623)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

const PORT = Number(process.env.WERKSTATT_WEG_PORT || 4623);
const root = path.resolve(__dirname, "..");

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

const ohneKommentare = stammLib.ohneKommentare;
// der EINE Rumpf-Schneider (scripts/lib/stamm.cjs): der Block an der Definition, nie am ersten Text-Treffer
function fnBody(src, kopf) {
    return stammLib.rumpf(src, kopf);
}

// ── DIE VERDIKTE (pure Funktionen; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
const SAETZE = ["hain", "insel", "fraktal", "ki ohne Seed"];
// der Konsum am Ruf: jeder Eintrag {Leser → Gesetz: gerufen}; fehlt die Probe, ist sie rot
const konsumTaeter = (k) => Object.entries(k || { "(keine Probe)": false }).filter(([, ok]) => ok !== true).map(([n]) => `Konsum: ${n} ruft sein Gesetz nicht`);
function sameVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    for (const s of SAETZE) {
        const z = m.zuege && m.zuege[s];
        if (z == null) out.push(`${s}: nicht gelaufen`);
        else if (z > 0) out.push(`${s}: ${z} Math.random-Züge`);
    }
    if (!(m.hainBaeume > 0)) out.push("der Hain wuchs nicht (Vorbedingung)");
    if (m.samenGleich !== true) out.push(`derselbe Satz, ein anderer Same (${m.samen && m.samen.join(" ≠ ")})`);
    if (!(m.ortAbweichung === 0)) out.push(`derselbe Same, andere Orte (${m.ortAbweichung} m)`);
    if (!(m.kiOrtAbweichung === 0)) out.push(`das KI-Programm ohne Seed streut anders (${m.kiOrtAbweichung} m)`);
    if (!(m.streuAbweichung === 0)) out.push(`die Streuung eines Samens folgt dem Programm-Strom (${m.streuAbweichung} m)`);
    out.push(...konsumTaeter(m.konsum));
    return out;
}

// Die Wörter des Befunds (L-Wortschatz, Drehbuch 18) und ihre Studio-Art; unbekannt bleibt, was kein Studio baut.
const WORT_SOLL = {
    fachwerkhaus: "haus",
    fachwerkhäuser: "haus",
    häuser: "haus",
    wagen: "vehicle",
    gt: "vehicle",
    birken: "tree",
    eiche: "tree",
    feuerstelle: "ausstattung",
    ziehbrunnen: "ausstattung",
    kristall: "rock",
    fels: "rock",
};
const WORT_UNBEKANNT = ["scheune", "quasselstrippe"];
function wortVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    for (const [w, art] of Object.entries(WORT_SOLL)) {
        const e = m.woerter && m.woerter[w];
        if (!e || !e.ziel) out.push(`„${w}" unbekannt`);
        else if (e.art !== art) out.push(`„${w}" → ${e.ziel} (Art ${e.art}, Soll ${art})`);
    }
    for (const w of WORT_UNBEKANNT)
        if (m.woerter && m.woerter[w] && m.woerter[w].ziel) out.push(`„${w}" → ${m.woerter[w].ziel} (geraten)`);
    if (!(m.arten > 0)) out.push("keine platzierbare Studio-Art im Buch (Vorbedingung)");
    if (m.artenOhneWort && m.artenOhneWort.length)
        out.push(`Studio-Arten ohne Wort: ${m.artenOhneWort.slice(0, 6).join(", ")}`);
    for (const [satz, v] of Object.entries(m.vorschlag || {})) {
        if (/„hier" kennt kein Studio/.test(v.zeile || ""))
            out.push(`„${satz}": der Ort gilt als Wort („${v.zeile.slice(0, 60)}")`);
        if (v.sug && !(v.zeile || "").includes(v.sug))
            out.push(
                `„${satz}": der Vorschlag „${v.sug}" fällt der Studio-Absage zum Opfer („${(v.zeile || "").slice(0, 60)}")`
            );
    }
    if (!(m.hausGebaut > 0)) out.push(`„bau mir ein fachwerkhaus" stellt kein Haus in die Welt („${m.hausZeile}")`);
    if (!/kennt kein Studio/.test(m.absageZeile || "") || !/Fachwerkhaus/.test(m.absageZeile || ""))
        out.push(
            `die Absage eines unbekannten Worts nennt den Katalog nicht („${(m.absageZeile || "").slice(0, 80)}")`
        );
    return out;
}

// L-Werkstatt: je Lage × Weg { bauModus, steht, verbraucht: {mat: n}, zeile, gesperrt }; dazu Werke, Suche, Lichtung.
// "hand": ein Werk in der Hand, der Rechtsklick (`tryMousePlace` → `_bauModusFuer`, Gegenprüfung 08.10.).
const WEGE = ["werkstatt", "rezeptbuch", "hotbar", "hand"];
const LAGEN = ["schöpfer", "frieden mit Material", "frieden ohne Material"];
function wegVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = konsumTaeter(m.konsum);
    const kosten = m.kosten || {};
    if (!Object.keys(kosten).length) out.push("die Eiche kostet nichts (Vorbedingung)");
    for (const lage of LAGEN)
        for (const weg of WEGE) {
            const e = m.wege && m.wege[lage] && m.wege[lage][weg];
            const wo = `${lage} · ${weg}`;
            if (!e) {
                out.push(`${wo}: nicht gelaufen`);
                continue;
            }
            if (e.fehler) out.push(`${wo}: wirft (${e.fehler.slice(0, 60)})`);
            if (lage === "frieden ohne Material") {
                if (e.steht > 0) out.push(`${wo}: steht ohne Material`);
                const laut = /fehlt/.test(e.zeile || "") || (e.gesperrt && /fehlt/i.test(e.gesperrt));
                if (!laut) out.push(`${wo}: stumme Absage („${(e.zeile || "").slice(0, 50)}")`);
                if (e.bauModus && weg !== "hotbar")
                    out.push(`${wo}: der Weg führt in einen Bau-Modus, der nur ablehnen kann`);
                continue;
            }
            if (!(e.steht === 1))
                out.push(
                    `${wo}: ${e.steht} Werk(e) stehen (Soll 1)${e.imInventar ? ", die Eiche liegt im Inventar" : ""}`
                );
            if (lage === "frieden mit Material")
                for (const [mt, n] of Object.entries(kosten))
                    if ((e.verbraucht || {})[mt] !== n)
                        out.push(`${wo}: ${mt} ${(e.verbraucht || {})[mt] || 0}× gezogen (Soll ${n})`);
            if (lage === "schöpfer" && Object.values(e.verbraucht || {}).some((n) => n))
                out.push(`${wo}: schöpfer zahlt`);
        }
    for (const [werk, n] of Object.entries(m.werke || {}))
        if (!(n === 1)) out.push(`Werkstatt ${werk}: ${n} stehen (Soll 1)`);
    // Ein Gerät aus der Hotbar (frieden, ohne Material): der Griff schmiedet und sagt, was fehlt (Gegenprüfung 08.10.).
    const ge = m.geraet || {};
    if (!ge.name) out.push("kein ungeschmiedetes Gerät mit Kosten (Vorbedingung)");
    else if (!/fehlt/.test(ge.zeile || ""))
        out.push(`das Gerät aus der Hotbar verweigert stumm („${(ge.zeile || "").slice(0, 50)}")`);
    const ph = m.phantom || {};
    if (!(ph.meshes > 0)) out.push("kein Phantom im Bau-Modus (Vorbedingung)");
    else if (ph.verworfen > 0)
        out.push(
            `das Phantom ist unsichtbar: ${ph.verworfen}/${ph.meshes} Meshes verwirft der Alpha-Test (Deckkraft < alphaTest)`
        );
    if (!(m.sucheHaus > 0)) out.push(`die Suche „haus" findet kein Haus (${m.sucheHaus})`);
    const l = m.lichtung || {};
    if (l.wand !== "lichtung") out.push(`das Phantom über der Lichtung urteilt nicht (Urteil ${l.wand})`);
    // Die Tönung im Stoff (Gegenprüfung 08.10.): der Studio-Stoff liest seine Farbe aus colorNode, die Tönung muss dort wirken.
    const tl = l.toenung || {};
    if (!(tl.stoffe > 0)) out.push("kein Studio-Phantom über der Lichtung (Vorbedingung)");
    else if (tl.lesen !== tl.stoffe)
        out.push(`das Phantom färbt sich nicht: ${tl.lesen}/${tl.stoffe} Stoffe lesen die Tönung`);
    if (tl.farbe !== "rot") out.push(`das Phantom über der Lichtung steht ${tl.farbe} (Soll rot)`);
    if (ph.farbe !== "grün") out.push(`das Phantom am freien Ort steht ${ph.farbe} (Soll grün)`);
    // Grün heißt: das Setzen trägt (Integration V18.536, Auflage 2) — ohne Material lehnt es ab, das Phantom steht rot.
    if (m.phantomOhneMaterial !== "rot")
        out.push(`das Phantom ohne Material steht ${m.phantomOhneMaterial} (Soll rot — das Setzen lehnt ab)`);
    if (l.steht > 0)
        out.push(`auf der Lichtung steht ${l.steht} Eiche (die Natur-Wand gilt dem Satz, nicht dem Bau-Modus)`);
    if (!/Lichtung/.test(l.zeile || "")) out.push(`die Lichtung verweigert stumm („${(l.zeile || "").slice(0, 50)}")`);
    return out;
}

// Brennglas: { plattform: {steht, maxWaerme, zeilen}, linse: {glimmtBei, brenntBei, steht, zeileGlimmt, zeileBrennt},
// nacht: {waerme, steht}, kuehlung: {nachFokus, nachKuehlen}, zensus: {linsen, altReichweite, imLicht} }.
function brennVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    const p = m.plattform || {};
    if (!p.gesetzt) out.push("die Eiche an der Plattform nicht gesetzt (Vorbedingung)");
    else if (!(p.abstand <= 3)) out.push(`die Eiche steht nicht 2,4 m vor der Mitte (Vorbedingung, ${p.abstand} m)`);
    else if (!p.steht) out.push(`die Eiche 2,4 m vor der Plattform-Mitte verbrannte (nach ${p.verbranntNach} s Sonne)`);
    const l = m.linse || {};
    if (!l.gesetzt) out.push("die gebaute Linse nicht gesetzt (Vorbedingung)");
    else {
        if (l.steht) out.push(`die gebaute Linse entzündet die Eiche unter sich nicht (Wärme ${l.waerme})`);
        if (!/glimmt/.test(l.zeileGlimmt || "")) out.push("das Glimmen schweigt");
        if (!/entzündete/.test(l.zeileBrennt || ""))
            out.push(`die Zerstörung nennt sich nicht („${(l.zeileBrennt || "").slice(0, 50)}")`);
    }
    const n = m.nacht || {};
    if (!(n.waerme === 0) || !n.steht)
        out.push(`nachts erwärmt die Linse (Wärme ${n.waerme}${n.steht ? "" : ", verbrannt"})`);
    const k = m.kuehlung || {};
    if (!(k.nachFokus > 0)) out.push("keine Wärme im Brennpunkt (Vorbedingung)");
    else if (!(k.nachKuehlen === 0))
        out.push(`außerhalb des Brennpunkts kühlt nichts (${k.nachFokus} → ${k.nachKuehlen})`);
    const ra = m.raeumung || {};
    if (!ra.gesetzt || !ra.weg) out.push("die Räumung nahm das Werk des Spielers nicht (Vorbedingung)");
    else if (!/wich/.test(ra.zeile || ""))
        out.push(`die Räumung eines Spieler-Werks schweigt („${(ra.zeile || "").slice(0, 40)}")`);
    return out;
}

// Der Same des Werks: { steht, zuege, phantomKey, werkKey, phantomDreh, werkDreh, werkSame, werkTint, gesendetSame,
// empfang: {steht, key, dreh, tint}, reload: {erst, weiter, nachReload} }.
function werkVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = konsumTaeter(m.konsum);
    if (!Array.isArray(m.stumm) || m.stumm.length) out.push(`eine Absage des Setzens schweigt: ${m.stumm ? m.stumm.join(", ") : "nicht gelaufen"}`);
    const gleich = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-6;
    if (!(m.steht === 1)) out.push(`das Setzen stellt ${m.steht} Werk(e) (Vorbedingung)`);
    if (m.zuege > 0) out.push(`das Setzen würfelt ${m.zuege}× aus Math.random`);
    if (!m.phantomKey) out.push("kein Studio-Phantom (Vorbedingung)");
    else if (m.phantomKey !== m.werkKey) out.push(`das Phantom zeigt ${m.phantomKey}, es steht ${m.werkKey}`);
    if (!gleich(m.phantomDreh, m.werkDreh))
        out.push(`das Phantom blickt ${m.phantomDreh} rad, das Werk ${m.werkDreh} rad`);
    // Das Werk steht nie im Spieler (die EINE Spieler-Klemme, Gegenprüfung 08.10. „das Phantom umhüllt die Kamera"); wie weit
    // das Werk reicht, misst die Linse an der Studio-Gestalt des Phantoms in Weltgröße (jeder Vertex, Integration V18.536 —
    // die Klemme maß die Spender-Teile, 3,01 m).
    if (!(m.mindest > 0)) out.push("kein Spieler-Abstand des Werks (Vorbedingung)");
    else if (!(m.abstand >= m.mindest - 0.01))
        out.push(
            `das Phantom steht ${m.abstand} m vor dem Spieler, das Werk reicht ${m.reicht} m (Soll ≥ ${m.mindest} m)`
        );
    // Die Hülle des gesetzten Werks liegt in der Reichweite, die die Klemme misst (Integration V18.536: die Stamm-Hülle trägt
    // seit v1-ankunft die Welt-Skala des Studio-Baums).
    if (Number.isFinite(m.huelleReicht) && m.reicht > 0 && m.huelleReicht > m.reicht + 0.01)
        out.push(
            `die Hülle des Werks reicht ${m.huelleReicht} m, die Klemme misst ${m.reicht} m — der Spieler steht im Werk`
        );
    if (m.gesendetSame !== m.werkSame)
        out.push(`der Mitspieler bekommt den Samen ${m.gesendetSame}, das Werk trägt ${m.werkSame}`);
    // Jedes Setzen ein neues Werk (Integration V18.536, Auflage 1): nach dem Setzen zeigt das Phantom den nächsten Samen.
    if (m.naechsterSame == null) out.push("nach dem Setzen kein Phantom mit Samen (Vorbedingung)");
    else if (m.naechsterSame === m.werkSame)
        out.push(`das nächste Setzen zeigt dasselbe Werk (Same ${m.werkSame}) — jedes Setzen derselbe Wurf`);
    const e = m.empfang || {};
    if (!e.steht) out.push("beim Mitspieler steht kein Werk (Vorbedingung)");
    else {
        if (e.key !== m.werkKey) out.push(`beim Mitspieler steht ${e.key} statt ${m.werkKey}`);
        if (!gleich(e.dreh, m.werkDreh)) out.push(`beim Mitspieler blickt das Werk ${e.dreh} rad statt ${m.werkDreh}`);
        if (e.tint !== m.werkTint) out.push(`beim Mitspieler eine andere Tönung (${e.tint} ≠ ${m.werkTint})`);
    }
    const rl = m.reload || {};
    if (rl.erst == null) out.push("der Welt-Strom zieht nicht (Vorbedingung)");
    else if (rl.nachReload === rl.erst)
        out.push(`nach dem Reload wiederholt der Welt-Strom seinen ersten Samen (${rl.erst})`);
    else if (rl.nachReload !== rl.weiter)
        out.push(`nach dem Reload ein fremder Same (${rl.nachReload}, Soll ${rl.weiter})`);
    return out;
}

// ── DIE STATISCHE WAND (Node, kommentarfrei). Liefert [name, ok, detail]. ──
function wand(src) {
    const nc = ohneKommentare(src);
    const body = (sig) => fnBody(nc, new RegExp("\\n {4}" + sig + "\\([^)]*\\) \\{")) || "";
    const muster = fnBody(nc, /\n {4}get chatDslPatterns\(\) \{/) || "";
    const ctx = body("dslCtx");
    const streu = body("_dslSpawnStudioItems");
    const zufall = [muster, ctx, streu].map((b) => (b.match(/Math\.random/g) || []).length);
    const aufl = body("_studioBlueprintForWord");
    const kat = body("_studioWortKatalog");
    const wl = body("_studioWordsForPrompt");
    const hand = (aufl + kat + wl).match(/"(?:baum_|haus_|fels|stein|kristall|eiche|kiefer|birke|tanne|buche|hain|wald)\w*"/g) || [];
    const brücke = (nc.match(/AnazhRealm\.STUDIO_WORT\b/g) || []).length;
    const setzen = body("confirmBuild");
    const logs = (setzen.match(/this\.log\(/g) || []).length;
    const brenn = body("_tickFocusingAffordances");
    const formel = (nc.match(/\* Math\.PI \* 2 - Math\.PI \/ 2/g) || []).length;
    const wurzeln = ["spawnArchitecture", "spawnIslandAt", "spawnUfoAt", "_workshopRecipeSpec", "dslCompose", "generateEvolution", "confirmBuild"];
    const fehlt = wurzeln.filter((n) => !body(n));
    const zuege = wurzeln.filter((n) => /Math\.random/.test(body(n))).map((n) => `${n} ${body(n).match(/Math\.random/g).length}`);
    const zaehler = (nc.match(/_bauSameZaehler/g) || []).length;
    const hash = (nc.match(/Math\.imul\(\w+, 131\)/g) || []).length;
    const null0 = /"spawn_blueprint", bm\.blueprintName, posNode, 0\b/.test(setzen);
    return [
        ["W1 kein Satz würfelt aus Math.random (chatDslPatterns · dslCtx · _dslSpawnStudioItems)", muster.length > 0 && ctx.length > 0 && streu.length > 0 && zufall.every((n) => n === 0), `Math.random ${zufall.join("/")}`],
        ["W2 die Streuung zieht nie aus dem Programm-Strom (kein `ctx.rng()` in `_dslSpawnStudioItems`)", streu.length > 0 && !/ctx\.rng\(\)/.test(streu)],
        [
            "W3 der Wort-Katalog liest den Rezept-Katalog (kein STUDIO_WORT, keine Wort-Literale in Auflöser · Katalog · Wortliste)",
            aufl.length > 0 && kat.length > 0 && wl.length > 0 && brücke === 0 && hand.length === 0,
            `STUDIO_WORT ${brücke} · Wort-Literale ${hand.length}${hand.length ? " (" + hand.slice(0, 4).join(" ") + ")" : ""}`,
        ],
        [
            "W4 das Rezeptbuch legt nie ins Inventar, FERTIGEN fragt kein zweites Tor, das Setzen sagt keine Absage nur ins Log",
            !/addToInventory/.test(body("craftFromRecipe")) && !/this\._bauVorabTor\(/.test(body("fertigeBlueprint")) && setzen.length > 0 && logs <= 1,
            `confirmBuild: ${logs}× Log`,
        ],
        ["W5 das Brennglas spricht nie nur ins Log, der Sonnen-Winkel ist EINE Formel", brenn.length > 0 && !/this\.log\(/.test(brenn) && formel === 1, `Sonnen-Winkel ausgeschrieben ${formel}×`],
        [
            "W7 kein Werk würfelt aus Math.random (spawnArchitecture · spawnIslandAt · spawnUfoAt · Werkstatt-Würfel · dslCompose · generateEvolution · confirmBuild), kein Sitzungs-Zähler des Welt-Stroms",
            !fehlt.length && !zuege.length && zaehler === 0,
            `${fehlt.length ? "fehlt " + fehlt.join(", ") + " · " : ""}Math.random ${zuege.join(", ") || "0"} · Sitzungs-Zähler ${zaehler}`,
        ],
        ["W8 EIN Same-Hash, die Nachricht an den Mitspieler trägt nie den Samen 0", hash === 1 && !null0, `Same-Hash ${hash}× · Samen 0 im Broadcast ${null0 ? "ja" : "nein"}`],
        ["W9 kein zweites LCG im Strom-Gesetz (`_streamRng`)", body("_streamRng").length > 0 && !/1664525/.test(body("_streamRng"))],
    ];
}

const server = statikServer();

// ── DIE PROBEN IN DER SEITE (Funktionsrumpf; r = die Welt). ──
async function probe(argW) {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const out = {};
    const dl0 = performance.now() + 90000;
    while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl0)
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
    const dlB = performance.now() + 90000;
    while (
        performance.now() < dlB &&
        !(
            st.playerMesh &&
            r._foundry &&
            r._foundry.recipes &&
            st.blueprints &&
            st.blueprints.baum_eiche &&
            r._genesisPlattform()
        )
    )
        await tick(1, 100);
    await tick(10, 30);
    // Ein trockener, freier Ort abseits der Genesis-Lichtung (die Natur-Wand hält die Scheibe frei): der Spieler steht dort.
    const plat = r._genesisPlattform();
    const P0 = plat ? plat.position : st.playerMesh.position;
    let frei = null;
    for (let ring = 40; ring <= 160 && !frei; ring += 12)
        for (let k = 0; k < 16 && !frei; k++) {
            const a = (k / 16) * Math.PI * 2;
            const x = P0.x + Math.cos(a) * ring;
            const z = P0.z + Math.sin(a) * ring;
            if (!r._landAt(x, z, 1)) continue;
            if (r._imGrundriss(x, z, 0.8, 12)) continue;
            const y = r._voxelSurfaceY(x, z);
            if (!Number.isFinite(y)) continue;
            if (Math.abs(r._voxelSurfaceY(x + 6, z) - y) > 2.5 || Math.abs(r._voxelSurfaceY(x, z + 6) - y) > 2.5)
                continue;
            frei = { x, y, z };
        }
    const stelle = () => {
        if (!frei) return;
        st.playerMesh.position.set(frei.x, frei.y + 1.2, frei.z);
        st.yaw = 0;
    };
    out.frei = frei;

    const orig = Math.random;
    let n = 0;
    // Gezählt wird ein Zug der WELT (der Aufrufer steht im Stamm); die UUID eines neuen three-Objekts
    // (MathUtils.generateUUID beim Bau einer Geometrie) und die Identität eines Werks (`_newArchId`: ein Name, keine
    // Substanz — er reist mit der Nachricht) sind keine Welt-Substanz.
    const zaehle = (fn) => {
        n = 0;
        Math.random = function () {
            const rufer = (new Error().stack || "").split("\n")[2] || "";
            if (/anazhRealm\.js|\/stamm\/[a-z0-9-]+\.js/.test(rufer) && !/\._newArchId \(/.test(rufer)) n++;
            return orig();
        };
        try {
            return fn();
        } finally {
            Math.random = orig;
        }
    };
    // der Spion am Ruf: lieferer[name] zählt (und delegiert), solange wer.methode(...args) läuft — true = gerufen
    const ruft = (wer, methode, lieferer, name, args) => {
        const eigen = Object.prototype.hasOwnProperty.call(lieferer, name);
        const echt = lieferer[name];
        let k = 0;
        lieferer[name] = function (...x) {
            k++;
            return echt.apply(this, x);
        };
        try {
            wer[methode](...args);
        } catch (_e) {
            /* ein Wurf nach dem Ruf entwertet den Konsum nicht */
        } finally {
            if (eigen) lieferer[name] = echt;
            else delete lieferer[name];
        }
        return k > 0;
    };
    // ── D10: der Same eines Satzes ──
    try {
        const m = { gestartet: false, zuege: {} };
        out.same = m;
        if (!frei) throw new Error("kein freier Ort abseits der Lichtung");
        stelle();
        const neue = (vorher) => st.architectures.filter((a) => a && !vorher.has(a));
        const relOrte = (liste) =>
            liste
                .map((a) => [a.position.x - frei.x, a.position.z - frei.z, a.rotationY || 0, a.scale || 1])
                .sort((p, q) => p[0] - q[0] || p[1] - q[1]);
        const abweichung = (A, B) => {
            if (A.length !== B.length || !A.length) return -1;
            let d = 0;
            for (let i = 0; i < A.length; i++) for (let j = 0; j < 4; j++) d = Math.max(d, Math.abs(A[i][j] - B[i][j]));
            return +d.toFixed(6);
        };
        // Der Hain: Satz + Programm, zweimal an derselben Stelle der Welt-Geschichte (der Zähler des Welt-Stroms zurück).
        const hain = () => {
            const vorher = new Set(st.architectures);
            const z0 = JSON.parse(JSON.stringify(st.worldMeta.bauSame || {}));
            let gebaut = null;
            zaehle(() => {
                gebaut = r.parseChatToDsl("pflanz mir einen eichenhain");
                if (gebaut) r.dslRun(gebaut.program, { source: "human" });
            });
            const zz = n;
            const liste = neue(vorher);
            for (const a of liste) r.removeArchitecture(a);
            st.worldMeta.bauSame = z0;
            return { zz, same: gebaut ? gebaut.program[4] : null, orte: relOrte(liste), n: liste.length };
        };
        const h1 = hain();
        stelle();
        const h2 = hain();
        m.zuege.hain = h1.zz;
        m.hainBaeume = h1.n;
        m.samen = [h1.same, h2.same];
        m.samenGleich = h1.same != null && h1.same === h2.same;
        m.ortAbweichung = abweichung(h1.orte, h2.orte);
        zaehle(() => r.parseChatToDsl("setze insel hier"));
        m.zuege.insel = n;
        zaehle(() => r.parseChatToDsl("baue fraktal tempel"));
        m.zuege.fraktal = n;
        // Ein KI-Programm ohne Seed: der Strom des Programms ist der Welt-Strom.
        const ki = () => {
            const vorher = new Set(st.architectures);
            const z0 = JSON.parse(JSON.stringify(st.worldMeta.bauSame || {}));
            zaehle(() =>
                r.dslRun(["spawn_studio", "birke", ["at", frei.x + 12, frei.y, frei.z], 3], { source: "llm:grok" })
            );
            const zz = n;
            const liste = neue(vorher);
            for (const a of liste) r.removeArchitecture(a);
            st.worldMeta.bauSame = z0;
            return { zz, orte: relOrte(liste) };
        };
        const k1 = ki();
        const k2 = ki();
        m.zuege["ki ohne Seed"] = k1.zz;
        m.kiOrtAbweichung = abweichung(k1.orte, k2.orte);
        // Der Programm-Strom ohne Seed ist der Welt-Strom, das Strom-Gesetz der Strom seines Samens; die Streuung eines
        // Samens ist sein eigener Strom, nie der des Programms (zwei Programm-Ströme, dieselben Orte — jeder Peer dieselbe).
        const z0 = JSON.parse(JSON.stringify(st.worldMeta.bauSame || {}));
        m.konsum = { "dslCtx → _bauSame": ruft(r, "dslCtx", r, "_bauSame", [{ source: "human" }]), "_streamRng → _samenStrom": ruft(r, "_streamRng", r, "_samenStrom", ["zensur"]) };
        st.worldMeta.bauSame = z0;
        const streu = (k) => {
            const vorher = new Set(st.architectures);
            r._dslSpawnStudioItems(r._studioBlueprintForWord("birke"), { x: frei.x + 12, y: frei.y, z: frei.z }, 3, 4711, r.dslCtx({ seed: k, source: "human" }), 4);
            const liste = neue(vorher);
            for (const a of liste) r.removeArchitecture(a);
            return relOrte(liste);
        };
        m.streuAbweichung = abweichung(streu(1), streu(2));
        m.gestartet = true;
    } catch (e) {
        out.same = Object.assign(out.same || {}, { err: (e && e.stack) || String(e) });
    }

    // ── L-Wortschatz: der Wort-Katalog ist der Rezept-Katalog ──
    try {
        const m = { gestartet: false, woerter: {} };
        out.wort = m;
        if (!frei) throw new Error("kein freier Ort abseits der Lichtung");
        const rec = r._foundry.recipes;
        // Die Art eines Bauplans: die Studio-Art, deren Rezept er trägt (das Buch, nie der Name).
        const artVon = (bp) => {
            const pr = bp ? r._foundryPresetForEntry({ type: bp }) : null;
            return pr && rec[pr] ? rec[pr].kind : null;
        };
        for (const w of [...Object.keys(argW.soll), ...argW.unbekannt]) {
            const ziel = r._studioBlueprintForWord(w);
            m.woerter[w] = { ziel, art: artVon(ziel) };
        }
        const PLATZ = ["tree", "rock", "haus", "gate", "vehicle", "ausstattung"];
        const arten = Object.keys(rec).filter((id) => PLATZ.includes(rec[id].kind));
        m.arten = arten.length;
        m.artenOhneWort = arten.filter((id) => !r._studioBlueprintForWord(id));
        // Der Satz an der Welt: „bau mir ein fachwerkhaus" vor dem Spieler (abseits der Lichtung) — ein Haus steht.
        stelle();
        const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
        const vorher = new Set(st.architectures);
        const n0 = zeilen().length;
        r.processChatCommand("bau mir ein fachwerkhaus");
        await tick(3, 30);
        const neu = st.architectures.filter((a) => a && !vorher.has(a));
        m.hausGebaut = neu.filter((a) => artVon(a.type) === "haus").length;
        m.hausZeile = zeilen().slice(n0).join(" | ").slice(0, 160);
        for (const a of neu) r.removeArchitecture(a);
        // Ein unbekanntes Wort (ohne KI-Begleiter): die Absage im Spieler-Kanal nennt, was die Studios kennen.
        const llmAlt = st.llm && st.llm.enabled;
        if (st.llm) st.llm.enabled = false;
        const n1 = zeilen().length;
        r.processChatCommand("bau mir eine scheune");
        await tick(1, 30);
        m.absageZeile = zeilen().slice(n1).join(" | ");
        // Ein Verb mit einem Wort, das kein Ding ist (Gegenprüfung 08.10.): der Studio-Satz stiehlt dem Vorschlag die Zeile nicht.
        m.vorschlag = {};
        for (const satz of ["bau hier", "mach licht"]) {
            const n2 = zeilen().length;
            const vorher2 = new Set(st.architectures);
            r.processChatCommand(satz);
            await tick(1, 30);
            for (const a of st.architectures.filter((a) => a && !vorher2.has(a))) r.removeArchitecture(a);
            m.vorschlag[satz] = { zeile: zeilen().slice(n2).join(" | "), sug: r.chatSuggest(satz) || null };
        }
        if (st.llm) st.llm.enabled = llmAlt;
        m.gestartet = true;
    } catch (e) {
        out.wort = Object.assign(out.wort || {}, { err: (e && e.stack) || String(e) });
    }

    // ── L-Werkstatt · frieden · L-Rückmeldung: jeder Weg führt zum stehenden Werk ──
    try {
        const m = { gestartet: false, wege: {}, werke: {} };
        out.weg = m;
        if (!frei || !plat) throw new Error("kein freier Ort oder keine Genesis-Plattform");
        const NAME = "baum_eiche";
        const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
        const inv = st.player.inventory;
        const kosten = Object.assign({}, r.checkBuildCost(NAME).cost);
        m.kosten = kosten;
        const leeren = () => {
            for (let i = 0; i < inv.length; i++) inv[i] = null;
        };
        const habe = () => {
            const h = {};
            for (const s of inv) if (s && s.kind === "material") h[s.material] = (h[s.material] || 0) + (s.count || 0);
            return h;
        };
        const imInventar = (n) => inv.some((s) => s && s.kind !== "material" && s.blueprintName === n);
        // Vom Spieler am freien Ort weg von der Plattform geblickt, leicht nach unten: das Phantom liegt vor ihm.
        const yawWeg = Math.atan2(frei.x - plat.position.x, frei.z - plat.position.z);
        const zielen = async (ort, yaw) => {
            st.playerMesh.position.set(ort.x, ort.y + 1.2, ort.z);
            st.yaw = yaw;
            st.pitch = -0.45;
            await tick(4, 30);
            r.tickBuildMode();
        };
        // Je Weg ein eigener Akt des Spielers: die Sperre gegen dieselbe Zeile binnen 2 s (`_spielerSagt`) gilt dem
        // gehaltenen Rechtsklick, nicht dem nächsten Weg — sie wird zwischen den Wegen gelöst.
        const aufraeumen = () => {
            if (st.buildMode.active) r._clearBuildMode();
            if (st.uiActiveDrawer) r.closeAllDrawers();
            if (st.inventoryOpen) r.toggleInventoryOverlay(false);
            if (st.player.equipped) st.player.equipped.held = null;
            r._spielerSagtLetzte = null;
        };
        // Die Tönung des Phantoms: welche Studio-Stoffe (colorNode) den EINEN Tönungs-Uniform im Knoten-Graphen lesen, und
        // seine Farbe (rot: das Setzen wird abgelehnt, grün: es trägt).
        const liest = (knoten, ziel) => {
            const gesehen = new Set();
            const stapel = [knoten];
            while (stapel.length && gesehen.size < 2000) {
                const k = stapel.pop();
                if (!k || gesehen.has(k)) continue;
                if (k === ziel) return true;
                gesehen.add(k);
                try {
                    for (const c of k.getChildren()) stapel.push(c);
                } catch (_e) {}
            }
            return false;
        };
        // der Schwellen-Knoten des Laubs liest die Zahl seines Stoffs (das Phantom erbt nie 0,5, K68-N1)
        m.konsum = { "_laubSchwelle → materialAlphaTest": liest(r._laubSchwelle(THREE.TSL), THREE.TSL.materialAlphaTest) };
        const toenung = (phantom) => {
            const t = r._phantomTintU || null;
            let stoffe = 0;
            let lesen = 0;
            if (phantom)
                phantom.traverse((o) => {
                    if (!o.isMesh || !o.material || !o.material.colorNode) return;
                    stoffe++;
                    if (t && liest(o.material.colorNode, t)) lesen++;
                });
            const c = t && t.value;
            const farbe = !c ? "ohne Tönung" : c.r > c.g * 1.5 ? "rot" : c.g > c.r * 1.5 ? "grün" : "grau";
            return { stoffe, lesen, farbe };
        };
        const klickeWeg = async (weg, name) => {
            const e = {};
            if (weg === "werkstatt") {
                if (st.uiActiveDrawer !== "werkstatt") r.toggleDrawer("werkstatt");
                r.selectBlueprintForEdit(name);
                await tick(2, 30);
                const knopf = document.querySelector("#workshop-action-zone .workshop-fertigen");
                if (!knopf) throw new Error("kein FERTIGEN in der Werkstatt");
                knopf.click();
            } else if (weg === "rezeptbuch") {
                r.toggleInventoryOverlay(true);
                r.renderRecipeBook();
                const lab = String(st.blueprints[name].label || name);
                const zeile = [...document.querySelectorAll("#inventory-recipes .recipe-row")].find(
                    (z) => (z.querySelector(".recipe-name") || {}).textContent === lab
                );
                const knopf = zeile && zeile.querySelector("button");
                if (!knopf) throw new Error("keine Rezept-Zeile");
                if (knopf.disabled) e.gesperrt = knopf.title || "gesperrt";
                knopf.click();
            } else if (weg === "hand") {
                if (!st.player.equipped) st.player.equipped = { held: null, armor: null };
                st.player.equipped.held = name;
                r.tryMousePlace();
            } else {
                r.setHotbarSlot(4, name);
                if (!(st.buildMode.active && st.buildMode.blueprintName === name)) r.selectHotbarSlot(4);
            }
            return e;
        };
        const lauf = async (lage, weg) => {
            aufraeumen();
            r.setGameMode(lage === "schöpfer" ? "schöpfer" : "frieden");
            leeren();
            if (lage === "frieden mit Material")
                for (const [mt, n] of Object.entries(kosten)) r.addMaterialToInventory(mt, n);
            const h0 = habe();
            const n0 = zeilen().length;
            const vorher = new Set(st.architectures);
            let e = {};
            try {
                await zielen(frei, yawWeg);
                e = await klickeWeg(weg, NAME);
                e.bauModus = !!(st.buildMode.active && st.buildMode.blueprintName === NAME && st.buildMode.phantomMesh);
                if (e.bauModus) {
                    await zielen(frei, yawWeg);
                    // Das Phantom im Bild: die Studio-Gestalt (sie heilt den Spender-Geist, sobald das Asset dockt) und je
                    // Mesh, ob ein volles Fragment den Alpha-Test übersteht (r184: Alpha × Deckkraft < alphaTest → verworfen).
                    if (lage === "schöpfer" && weg === "werkstatt") {
                        const bm = st.buildMode;
                        for (let i = 0; i < 300 && bm.phantomStudioPending; i++) {
                            await tick(1, 50);
                            r.tickBuildMode();
                        }
                        let meshes = 0;
                        let verworfen = 0;
                        bm.phantomMesh.traverse((o) => {
                            if (!o.isMesh || !o.material) return;
                            meshes++;
                            const ma = o.material;
                            if ((ma.transparent ? ma.opacity : 1) < (ma.alphaTest || 0)) verworfen++;
                        });
                        m.phantom = {
                            studio: !!bm.phantomMesh.userData.studioGhost,
                            meshes,
                            verworfen,
                            farbe: toenung(bm.phantomMesh).farbe,
                        };
                    }
                    // Der Hotbar-Weg führt auch ohne Material in den Bau-Modus: das Phantom sagt dort die Absage (rot).
                    if (lage === "frieden ohne Material" && weg === "hotbar")
                        m.phantomOhneMaterial = toenung(st.buildMode.phantomMesh).farbe;
                    r.tryMousePlace();
                }
            } catch (err) {
                e.fehler = String((err && err.message) || err);
            }
            const neu = st.architectures.filter(
                (a) => a && !vorher.has(a) && a.type === NAME && typeof a.id === "string"
            );
            e.steht = neu.length;
            e.imInventar = imInventar(NAME);
            const h1 = habe();
            e.verbraucht = {};
            for (const mt of Object.keys(kosten)) e.verbraucht[mt] = (h0[mt] || 0) - (h1[mt] || 0);
            e.zeile = zeilen().slice(n0).join(" | ");
            for (const a of neu) r.removeArchitecture(a);
            for (let i = 0; i < inv.length; i++) if (inv[i] && inv[i].blueprintName === NAME) inv[i] = null;
            aufraeumen();
            return e;
        };
        const modusAlt = r.getGameMode();
        try {
            for (const lage of ["schöpfer", "frieden mit Material", "frieden ohne Material"]) {
                m.wege[lage] = {};
                for (const weg of ["werkstatt", "rezeptbuch", "hotbar", "hand"])
                    m.wege[lage][weg] = await lauf(lage, weg);
            }
            // Ein Gerät aus der Hotbar in frieden ohne Material: der Griff schmiedet — und sagt, was fehlt.
            {
                aufraeumen();
                r.setGameMode("frieden");
                leeren();
                const NICHT = ["armor", "soul", "consumable"];
                const geraet = ["klinge_spitzhacke", ...Object.keys(st.blueprints)].find((n) => {
                    const b = st.blueprints[n];
                    return (
                        b &&
                        !r._isPlaceableBlueprint(b) &&
                        !NICHT.includes(b.role) &&
                        !Number.isFinite(b.forgedPrecision) &&
                        Object.keys(r.checkBuildCost(n).cost || {}).length > 0
                    );
                });
                m.geraet = { name: geraet || null };
                if (geraet) {
                    const n0 = zeilen().length;
                    r.setHotbarSlot(5, geraet);
                    r.selectHotbarSlot(5);
                    m.geraet.zeile = zeilen().slice(n0).join(" | ");
                    m.geraet.inHand = !!(st.player.equipped && st.player.equipped.held === geraet);
                    r.setHotbarSlot(5, null);
                }
                aufraeumen();
            }
            // Haus und GT aus der Werkstatt (schöpfer): FERTIGEN → Phantom → Rechtsklick.
            for (const [werk, name] of [
                ["Haus", "haus_alemannisch"],
                ["GT", "fahrzeug_gt"],
            ]) {
                aufraeumen();
                r.setGameMode("schöpfer");
                const vorher = new Set(st.architectures);
                try {
                    await zielen(frei, yawWeg);
                    await klickeWeg("werkstatt", name);
                    if (st.buildMode.active) {
                        await zielen(frei, yawWeg);
                        r.tryMousePlace();
                    }
                } catch (_e) {}
                const neu = st.architectures.filter(
                    (a) => a && !vorher.has(a) && a.type === name && typeof a.id === "string"
                );
                m.werke[werk] = neu.length;
                for (const a of neu) r.removeArchitecture(a);
                aufraeumen();
            }
            // Die Suche „haus" in der Werkstatt findet die Häuser.
            r.toggleDrawer("werkstatt");
            const suche = document.getElementById("workshop-search");
            if (suche) {
                suche.value = "haus";
                r._applyWorkshopFilter();
                m.sucheHaus = [...document.querySelectorAll("#workshop-list .workshop-list-row")].filter(
                    (z) => z.style.display !== "none" && /^haus_/.test(z.getAttribute("data-blueprint") || "")
                ).length;
                suche.value = "";
                r._applyWorkshopFilter();
            }
            aufraeumen();
            // Die Lichtung: der Spieler mitten auf der Plattform, die Eiche (schöpfer) 5 m vor ihm.
            r.setGameMode("schöpfer");
            const n0 = zeilen().length;
            const vorher = new Set(st.architectures);
            const P = plat.position;
            r.setHotbarSlot(4, NAME);
            r.selectHotbarSlot(4);
            await zielen({ x: P.x, y: P.y + 1, z: P.z }, yawWeg);
            const ph = st.buildMode.phantomMesh && st.buildMode.phantomMesh.position;
            m.lichtung = {
                wand: st.buildMode.phantomWand || false,
                phantomAbstand: ph ? +Math.hypot(ph.x - P.x, ph.z - P.z).toFixed(1) : null,
                toenung: toenung(st.buildMode.phantomMesh),
            };
            r.tryMousePlace();
            const neu = st.architectures.filter(
                (a) => a && !vorher.has(a) && a.type === NAME && typeof a.id === "string"
            );
            m.lichtung.steht = neu.length;
            m.lichtung.zeile = zeilen().slice(n0).join(" | ");
            for (const a of neu) r.removeArchitecture(a);
            aufraeumen();
        } finally {
            r.setGameMode(modusAlt);
            leeren();
        }
        m.gestartet = true;
    } catch (e) {
        out.weg = Object.assign(out.weg || {}, { err: (e && e.stack) || String(e) });
    }

    // ── Der Same des Werks: das gesetzte Werk ist das Phantom, auch beim Mitspieler ──
    try {
        const m = { gestartet: false };
        out.werk = m;
        if (!frei || !plat) throw new Error("kein freier Ort oder keine Genesis-Plattform");
        const NAME = "baum_eiche";
        const preset = r._foundryPresetForEntry({ type: NAME });
        // Die Gestalt eines Phantoms: der Schlüssel seiner Studio-Gruppe im Foundry-Cache; die eines Werks: ihr Schlüssel aus
        // Same und Stempel (dieselbe Formel wie `_foundryFlattenFor`, Stufe 0 wie das Phantom).
        const keyVon = (grp) => {
            if (!grp || !r._foundry || !r._foundry.cache) return null;
            for (const [k, v] of r._foundry.cache) if (v === grp) return k;
            return null;
        };
        const werkKey = (e) => r._foundryKoerperKey(preset, r._foundryGestaltFor(e, preset), 0, r._artifactStudioOv(e));
        const dreh = (e) => (Number.isFinite(e.rotationY) ? +e.rotationY.toFixed(6) : 0);
        const tint = (e) => [e.tintH, e.tintS, e.tintV].map((v) => (Number.isFinite(v) ? v.toFixed(6) : "-")).join("/");
        const finde = (p) => {
            if (!Array.isArray(p)) return null;
            if (p[0] === "spawn_blueprint") return p;
            for (const k of p) {
                const f = finde(k);
                if (f) return f;
            }
            return null;
        };
        const modusAlt = r.getGameMode();
        const p2pAlt = st.p2p;
        const gesendet = [];
        try {
            if (st.buildMode.active) r._clearBuildMode();
            if (st.uiActiveDrawer) r.closeAllDrawers();
            r.setGameMode("schöpfer");
            // ein schräger Blick weg von der Plattform: die Drehung des Phantoms ist nicht 0
            st.playerMesh.position.set(frei.x, frei.y + 1.2, frei.z);
            st.yaw = Math.atan2(frei.x - plat.position.x, frei.z - plat.position.z) + 0.7;
            st.pitch = -0.45;
            await tick(4, 30);
            r.setHotbarSlot(4, NAME);
            if (!(st.buildMode.active && st.buildMode.blueprintName === NAME)) r.selectHotbarSlot(4);
            const bm = st.buildMode;
            r.tickBuildMode();
            for (let i = 0; i < 300 && bm.phantomMesh && !bm.phantomMesh.userData.studioGhost; i++) {
                await tick(1, 50);
                r.tickBuildMode();
            }
            m.phantomKey = bm.phantomMesh ? keyVon(bm.phantomMesh.userData.foundrySrcGroup) : null;
            m.phantomDreh = bm.phantomMesh ? +bm.phantomMesh.rotation.y.toFixed(6) : null;
            // EIN Same je Werk: Vorschau und Hand ziehen `_werkSame`; der Ghost baut das Werk des Phantoms an SEINEM Ort (K20).
            const Q = { x: frei.x + 3, y: frei.y, z: frei.z + 3 };
            const pw = r._phantomWerk;
            let woG = null;
            r._phantomWerk = function (bp, wo) {
                woG = wo;
                return pw.call(this, bp, wo);
            };
            try {
                r._buildStudioPlacementGhost(st.blueprints[NAME], Q);
            } finally {
                delete r._phantomWerk;
            }
            m.konsum = {
                "_workshopFoundryPreviewGroup → _werkSame": ruft(r, "_workshopFoundryPreviewGroup", r, "_werkSame", [NAME]),
                "_heldFoundryGroup → _werkSame": ruft(r, "_heldFoundryGroup", r, "_werkSame", [NAME]),
                "_buildStudioPlacementGhost → _phantomWerk am Ort": !!woG && woG.x === Q.x && woG.z === Q.z,
            };
            // Jede Absage des Setzens spricht im Spieler-Kanal (Material und Lichtung fährt L-Werkstatt): je ein Instanz-Feld.
            const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
            m.stumm = [
                ["_setzUrteil", () => ({ grund: "standort" }), "Standort trägt nicht"],
                ["_setzUrteil", () => ({ grund: "werkstatt", domaene: "x" }), "Werkstatt der Domäne"],
                ["spawnArchitecture", () => null, "hier steht es nicht"],
            ]
                .filter(([nm, fn, satz]) => {
                    const z0 = zeilen().length;
                    r[nm] = fn;
                    r._spielerSagtLetzte = null;
                    try {
                        return !(r.confirmBuild() === false && zeilen().slice(z0).some((z) => z.includes(satz)));
                    } finally {
                        delete r[nm];
                    }
                })
                .map(([, , satz]) => satz);
            // Wie nah das Phantom dem Spieler kommt, wenn er nach unten blickt (−0,45 … −1,4 rad: der Blick-Strahl trifft den
            // Boden immer näher), und wie weit sein Werk reicht (der Footprint der Spieler-Klemme). Danach der Blick der Probe.
            if (bm.phantomMesh) {
                let naechst = Infinity;
                for (const pitch of [-0.45, -0.7, -0.95, -1.2, -1.4]) {
                    st.pitch = pitch;
                    await tick(2, 30);
                    r.tickBuildMode();
                    const pp = st.playerMesh.position;
                    const q = bm.phantomMesh.position;
                    naechst = Math.min(naechst, Math.hypot(q.x - pp.x, q.z - pp.z));
                }
                st.pitch = -0.45;
                await tick(2, 30);
                r.tickBuildMode();
                m.abstand = +naechst.toFixed(2);
                // Wie weit das Werk reicht: die Studio-Gestalt des Phantoms in Weltgröße, jeder Vertex jedes Teils durch
                // seine Matrix (die Welt-Skala der Art) — der weiteste von der Hoch-Achse. Daneben die Spender-Teile.
                let q = 0;
                bm.phantomMesh.updateMatrixWorld(true);
                const inv = bm.phantomMesh.matrixWorld.clone().invert();
                const v = bm.phantomMesh.position.clone();
                bm.phantomMesh.traverse((o) => {
                    const pos = o.isMesh && o.geometry && o.geometry.attributes.position;
                    if (!pos) return;
                    for (let i = 0; i < pos.count; i++) {
                        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
                        q = Math.max(q, v.x * v.x + v.z * v.z);
                    }
                });
                m.reicht = +Math.sqrt(q).toFixed(2);
                m.reichtSpender = +r._blueprintFootprintRadius(NAME).toFixed(2);
                m.mindest = +(m.reicht + r.constructor.STRUCTURE_PLAYER_CLEAR_MARGIN).toFixed(2);
            }
            // Die Naht zum Mitspieler: das Programm, das der Sender schickt.
            st.p2p = Object.assign({}, p2pAlt || {}, { enabled: true });
            r.p2pBroadcastDsl = (prog) => gesendet.push(JSON.parse(JSON.stringify(prog)));
            const vorher = new Set(st.architectures);
            zaehle(() => r.tryMousePlace());
            m.zuege = n;
            // Das nächste Phantom: sein Same (der Bau-Modus hält ihn, `_werkSame` mit `bm`).
            m.naechsterSame = bm.setzSame ? bm.setzSame.same : null;
            st.p2p = p2pAlt;
            delete r.p2pBroadcastDsl;
            const neu = st.architectures.filter(
                (a) => a && !vorher.has(a) && a.type === NAME && typeof a.id === "string"
            );
            m.steht = neu.length;
            const e = neu[0];
            if (e) {
                m.werkSame = e.seed;
                m.werkKey = werkKey(e);
                m.werkDreh = dreh(e);
                m.werkTint = tint(e);
                // Die Hülle des Werks (seine Blocker, seit v1-ankunft in der Welt-Skala des Studio-Werks, `_studioWeltSkala`):
                // wie weit sie waagrecht über seinen Ort reicht — die Klemme muss sie tragen, sonst steht der Spieler im Werk.
                let hq = 0;
                for (const b of e.blockerAABBs || [])
                    for (const x of [b.minX, b.maxX])
                        for (const z of [b.minZ, b.maxZ])
                            hq = Math.max(hq, Math.hypot(x - e.position.x, z - e.position.z));
                m.huelleReicht = +hq.toFixed(2);
            }
            const op = finde(gesendet[0]);
            m.gesendetSame = op ? op[3] : null;
            // Der Mitspieler: dasselbe Programm in seiner Welt (das lokale Werk weicht, der Empfänger baut aus der Nachricht).
            for (const a of neu) r.removeArchitecture(a);
            m.empfang = { steht: false };
            if (e && gesendet[0]) {
                r.dslRun(gesendet[0], { source: "remote:pruef" });
                const e2 = st.architectures.find((a) => a && a.id === e.id);
                if (e2) {
                    m.empfang = { steht: true, same: e2.seed, key: werkKey(e2), dreh: dreh(e2), tint: tint(e2) };
                    r.removeArchitecture(e2);
                }
            }
        } finally {
            st.p2p = p2pAlt;
            delete r.p2pBroadcastDsl;
            if (st.buildMode.active) r._clearBuildMode();
            r.setGameMode(modusAlt);
        }
        // Der Welt-Strom über einen Reload: der Snapshot trägt das Welt-Gedächtnis (`worldMeta`), der Restore mischt es
        // über den frischen Stand (`_loadStateRestoreWorldMeta`); die Sitzung vergisst alles, was nicht dort reist.
        const wmAlt = st.worldMeta;
        const zAlt = wmAlt.bauSame ? JSON.parse(JSON.stringify(wmAlt.bauSame)) : undefined;
        const rl = {};
        try {
            rl.erst = r._bauSame("pruef:reload");
            const snapMeta = JSON.parse(JSON.stringify(r.buildStateSnapshot().worldMeta));
            rl.weiter = r._bauSame("pruef:reload");
            st.worldMeta = Object.assign({}, wmAlt, { bauSame: undefined }, snapMeta);
            delete st.worldMeta.scatterPromoted;
            rl.nachReload = r._bauSame("pruef:reload");
        } finally {
            st.worldMeta = wmAlt;
            if (zAlt === undefined) delete wmAlt.bauSame;
            else wmAlt.bauSame = zAlt;
        }
        m.reload = rl;
        m.gestartet = true;
    } catch (e) {
        out.werk = Object.assign(out.werk || {}, { err: (e && e.stack) || String(e) });
    }

    // ── Brennglas: das Licht brennt, wo es sich bündelt, und die Zerstörung nennt sich ──
    try {
        const m = { gestartet: false };
        out.brenn = m;
        if (!frei || !plat) throw new Error("kein freier Ort oder keine Genesis-Plattform");
        const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
        const wetterAlt = st.weather;
        const zeitAlt = st.timeOfDay;
        const takt = (s) => r._tickFocusingAffordances(s);
        try {
            st.weather = "sunny";
            // Der Zensus: Linsen der Welt, was das alte Gesetz im 4-m-Kreis erreichte, was das Licht zu Mittag erreicht.
            const R2 = r.constructor.FOCUSING_HEAT_RANGE_M ** 2;
            const linsen = st.architectures.filter((e) => e.affordances && e.affordances.focusing);
            const brennbar = (e) => {
                const b = st.blueprints[e.type];
                return b && (r.computeCompoundTags(b).brennbar || 0) >= r.constructor.BRENNBAR_TAG_MIN;
            };
            const nah = st.architectures.filter(
                (e) =>
                    !(e.affordances && e.affordances.focusing) &&
                    linsen.some((f) => (f.position.x - e.position.x) ** 2 + (f.position.z - e.position.z) ** 2 <= R2) &&
                    brennbar(e)
            );
            st.timeOfDay = 0.5;
            const licht = typeof r._sonnenRichtung === "function" ? r._sonnenRichtung() : null;
            const imLicht =
                licht && typeof r._brennpunkte === "function"
                    ? nah.filter((e) =>
                          linsen.some((f) =>
                              r._brennpunkte(f, licht).some((p) => r._traegtPunkt(e, st.blueprints[e.type], p))
                          )
                      ).length
                    : null;
            m.zensus = { linsen: [...new Set(linsen.map((e) => e.type))], altReichweite: nah.length, imLicht };
            // (1) Die Eiche 2,4 m vor der Plattform-Mitte (der Ort der Leben-Schau; direkt gesetzt — der Bau-Modus hält die
            // Lichtung seit dem Schnitt der Wege frei, hier wird das Brennglas-Gesetz allein gemessen): ein sonniger Tag.
            const P = plat.position;
            const vorn = r._blickVorn ? r._blickVorn(0, 0) : { x: 0, z: 1 };
            const eiche = r.spawnArchitecture(
                "baum_eiche",
                { x: P.x + vorn.x * 2.4, y: P.y + 1.5, z: P.z + vorn.z * 2.4 },
                { precise: true } // bit-treu wie das Setzen (confirmBuild: string-id) — keine Spieler-Klemme
            );
            m.plattform = { gesetzt: !!eiche };
            if (eiche) m.plattform.abstand = +Math.hypot(eiche.position.x - P.x, eiche.position.z - P.z).toFixed(2);
            if (eiche) {
                let maxW = 0;
                let nach = null;
                for (let s = 0; s < 480; s++) {
                    st.timeOfDay = s / 480;
                    takt(1);
                    maxW = Math.max(maxW, eiche.heatBuildup || 0);
                    if (!st.architectures.includes(eiche)) {
                        nach = s;
                        break;
                    }
                }
                m.plattform.steht = st.architectures.includes(eiche);
                m.plattform.maxWaerme = +maxW.toFixed(3);
                m.plattform.verbranntNach = nach;
                if (m.plattform.steht) r.removeArchitecture(eiche);
            }
            // (2) Die gebaute Linse (das Gesetz lebt): Quarz-Kugel im Bronze-Ring, 1 m über dem Boden, die Eiche darunter.
            const LINSE = "__werkstatt_weg_linse";
            st.blueprints[LINSE] = {
                name: LINSE,
                label: "Prüf-Linse",
                parts: [
                    {
                        shape: "sphere",
                        material: "quarz",
                        position: { x: 0, y: 1, z: 0 },
                        size: { x: 0.8, y: 0.8, z: 0.8 },
                    },
                    {
                        shape: "torus",
                        material: "bronze",
                        position: { x: 0, y: 1, z: 0 },
                        size: { x: 0.9, y: 0.15, z: 0.9 },
                    },
                ],
            };
            const L0 = { x: frei.x + 30, y: frei.y, z: frei.z };
            const linse = r.spawnArchitecture(LINSE, L0, { silent: true });
            m.linse = { gesetzt: !!(linse && linse.affordances && linse.affordances.focusing) };
            const baum = () => r.spawnArchitecture("baum_eiche", { x: L0.x + 0.3, y: L0.y, z: L0.z }, { silent: true });
            if (m.linse.gesetzt) {
                // Nachts: 30 s Sonne-Wetter ohne Sonne.
                const b0 = baum();
                st.timeOfDay = 0.0;
                for (let s = 0; s < 30; s++) takt(1);
                m.nacht = { waerme: +(b0.heatBuildup || 0).toFixed(3), steht: st.architectures.includes(b0) };
                // Kühlung: 10 s im Brennpunkt (Mittag), dann 30 s Nacht.
                st.timeOfDay = 0.5;
                for (let s = 0; s < 10; s++) takt(1);
                const nachFokus = +(b0.heatBuildup || 0).toFixed(3);
                st.timeOfDay = 0.0;
                for (let s = 0; s < 30; s++) takt(1);
                m.kuehlung = { nachFokus, nachKuehlen: +(b0.heatBuildup || 0).toFixed(3) };
                if (st.architectures.includes(b0)) r.removeArchitecture(b0);
                // Mittag: glimmen, dann brennen — im Spieler-Kanal.
                r._spielerSagtLetzte = null;
                const b1 = baum();
                st.timeOfDay = 0.5;
                const n0 = zeilen().length;
                let glimmt = null;
                let brennt = null;
                for (let s = 1; s <= 40 && st.architectures.includes(b1); s++) {
                    takt(1);
                    if (
                        glimmt == null &&
                        zeilen()
                            .slice(n0)
                            .some((z) => /glimmt/.test(z))
                    )
                        glimmt = s;
                    if (!st.architectures.includes(b1)) brennt = s;
                }
                const neu = zeilen().slice(n0);
                Object.assign(m.linse, {
                    steht: st.architectures.includes(b1),
                    waerme: +(b1.heatBuildup || 0).toFixed(3),
                    glimmtBei: glimmt,
                    brenntBei: brennt,
                    zeileGlimmt: neu.find((z) => /glimmt/.test(z)) || "",
                    zeileBrennt: neu.find((z) => /entzünd/i.test(z)) || neu.join(" | "),
                });
                if (st.architectures.includes(b1)) r.removeArchitecture(b1);
            }
            if (linse) r.removeArchitecture(linse);
            delete st.blueprints[LINSE];
            // (3) Die Räumung eines Grundrisses nimmt ein Werk des Spielers (string-id, wie das Setzen es trägt): sie nennt es.
            r._spielerSagtLetzte = null;
            const O = { x: frei.x - 30, y: frei.y, z: frei.z };
            const werk = r.spawnArchitecture("baum_eiche", O, { id: "lf-werkstatt-raeumung" });
            const n3 = zeilen().length;
            if (werk) {
                // ein Haus-Grundriss über dem Werk (wie ein Dorf, das über einem gepflanzten Baum gegründet wird) — kurz in der
                // Welt, damit das Grundriss-Gitter ihn kennt
                const haus = {
                    type: "haus_alemannisch",
                    position: { x: O.x, y: O.y, z: O.z },
                    fundament: { ex: 3, ez: 3 },
                };
                st.architectures.push(haus);
                try {
                    r._grundrissRaeumen(haus);
                } finally {
                    st.architectures.splice(st.architectures.indexOf(haus), 1);
                    r._grundrissFaellt();
                }
            }
            m.raeumung = {
                gesetzt: !!werk,
                weg: !!werk && !st.architectures.includes(werk),
                zeile: zeilen().slice(n3).join(" | "),
            };
            if (werk && st.architectures.includes(werk)) r.removeArchitecture(werk);
        } finally {
            st.weather = wetterAlt;
            st.timeOfDay = zeitAlt;
        }
        m.gestartet = true;
    } catch (e) {
        out.brenn = Object.assign(out.brenn || {}, { err: (e && e.stack) || String(e) });
    }
    return out;
}

(async () => {
    const quelle = stammLib.text(root);
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST — die Verdikte und die Wand nennen ihre Täter ===");
        const gesund = {
            gestartet: true,
            zuege: { hain: 0, insel: 0, fraktal: 0, "ki ohne Seed": 0 },
            hainBaeume: 6,
            samen: [11, 11],
            samenGleich: true,
            ortAbweichung: 0,
            kiOrtAbweichung: 0,
            streuAbweichung: 0,
            konsum: { "dslCtx → _bauSame": true, "_streamRng → _samenStrom": true },
        };
        check("Selbst-Test D10: gesund == 0 Täter", sameVerdict(gesund).length === 0, sameVerdict(gesund).join(" · "));
        const mit = (o) => Object.assign({}, gesund, o);
        for (const [name, bruch, soll] of [
            [
                "der Hain würfelt (Befund 1 + 24)",
                mit({ zuege: Object.assign({}, gesund.zuege, { hain: 25 }) }),
                "hain: 25 Math.random-Züge",
            ],
            [
                "die Insel würfelt",
                mit({ zuege: Object.assign({}, gesund.zuege, { insel: 1 }) }),
                "insel: 1 Math.random",
            ],
            [
                "das Fraktal würfelt",
                mit({ zuege: Object.assign({}, gesund.zuege, { fraktal: 1 }) }),
                "fraktal: 1 Math.random",
            ],
            [
                "die KI ohne Seed würfelt (Befund 13)",
                mit({ zuege: Object.assign({}, gesund.zuege, { "ki ohne Seed": 13 }) }),
                "ki ohne Seed: 13",
            ],
            [
                "derselbe Satz, ein anderer Same",
                mit({ samen: [11, 12], samenGleich: false }),
                "derselbe Satz, ein anderer Same",
            ],
            ["dieselben Samen, andere Orte", mit({ ortAbweichung: 3.2 }), "derselbe Same, andere Orte"],
            ["die KI streut anders", mit({ kiOrtAbweichung: 1.5 }), "das KI-Programm ohne Seed streut anders"],
            ["die Streuung zieht aus dem Programm-Strom", mit({ streuAbweichung: 2.1 }), "die Streuung eines Samens folgt dem Programm-Strom"],
            ["der Programm-Strom ohne Seed würfelt", mit({ konsum: { "dslCtx → _bauSame": false, "_streamRng → _samenStrom": true } }), "Konsum: dslCtx → _bauSame"],
            ["ohne Konsum-Probe (vakuös)", mit({ konsum: undefined }), "Konsum: (keine Probe)"],
            ["kein Hain (vakuös)", mit({ hainBaeume: 0 }), "der Hain wuchs nicht"],
        ]) {
            const v = sameVerdict(bruch);
            check(
                `Selbst-Test D10: ‚${name}' → die Linse nennt ${soll}`,
                v.some((t) => t.startsWith(soll)),
                v.join(" · ")
            );
        }
        // Die Wand: gesund grün, je gebrochene Stelle rot.
        const w0 = wand(quelle);
        check(
            "Selbst-Test Wand: die Quelle ist grün",
            w0.every(([, ok]) => ok),
            w0
                .filter(([, ok]) => !ok)
                .map(([n]) => n)
                .join(" · ")
        );
        const kopfMit = (n, rein) => [null, new RegExp(`(\\n {4}${n}\\([^)]*\\) \\{)`), `$1 ${rein};`];
        for (const [name, gift, soll] of [
            ["ein Satz würfelt (dslCtx)", kopfMit("dslCtx", "Math.random()"), "W1"],
            ["die Streuung zieht aus dem Programm-Strom", kopfMit("_dslSpawnStudioItems", "ctx.rng()"), "W2"],
            ["die Hand-Liste kehrt zurück", kopfMit("_studioWortKatalog", "AnazhRealm.STUDIO_WORT"), "W3"],
            ["ein Wort-Literal im Katalog", kopfMit("_studioWortKatalog", '"fels"'), "W3"],
            ["das Rezeptbuch legt wieder ins Inventar", kopfMit("craftFromRecipe", "this.addToInventory(name, 1)"), "W4"],
            ["der Sonnen-Winkel ein zweites Mal ausgeschrieben", kopfMit("_dayNightApplyStarField", "t * Math.PI * 2 - Math.PI / 2"), "W5"],
            ["die Wurzel würfelt wieder (Befund)", kopfMit("spawnArchitecture", "Math.random()"), "W7"],
            ["der Zähler wird wieder Sitzungs-Feld", kopfMit("_bauSame", "this._bauSameZaehler"), "W7"],
            ["der Broadcast schickt wieder den Samen 0 (Befund)", kopfMit("confirmBuild", '["spawn_blueprint", bm.blueprintName, posNode, 0]'), "W8"],
            ["die Vorschau hasht ihren Samen selbst", kopfMit("_workshopFoundryPreviewGroup", "Math.imul(seedNum, 131)"), "W8"],
            ["ein zweites LCG im Strom-Gesetz", kopfMit("_streamRng", "1664525"), "W9"],
        ]) {
            const rot = wand(stammLib.ersetze(quelle, [gift]))
                .filter(([, ok]) => !ok)
                .map(([n]) => n);
            check(`Selbst-Test Wand: ‚${name}' → ${soll} rot`, rot.some((n) => n.startsWith(soll)), rot.join(" · ") || "alles grün");
        }
        // L-Wortschatz: gesund ohne Täter, je Befund-Zustand der Täter beim Namen.
        const artVonSoll = Object.fromEntries(
            Object.entries(WORT_SOLL).map(([w, a]) => [w, { ziel: "x_" + w, art: a }])
        );
        const gesundW = {
            gestartet: true,
            woerter: Object.assign({}, artVonSoll, { scheune: { ziel: null }, quasselstrippe: { ziel: null } }),
            arten: 62,
            artenOhneWort: [],
            hausGebaut: 1,
            absageZeile: '„scheune" kennt kein Studio. Die Studios bauen — Häuser: Haus, Fachwerkhaus …',
            vorschlag: {
                "bau hier": { zeile: "Unbekannter Befehl. Tippe 'hilfe' — die Welt nennt ihre Sätze.", sug: null },
                "mach licht": { zeile: "Unbekannter Befehl. Meintest du: 'mach es hell'?", sug: "mach es hell" },
            },
        };
        check(
            "Selbst-Test L-Wortschatz: gesund == 0 Täter",
            wortVerdict(gesundW).length === 0,
            wortVerdict(gesundW).join(" · ")
        );
        const mitW = (o) => Object.assign({}, gesundW, o);
        const wortWeg = (w) =>
            mitW({ woerter: Object.assign({}, gesundW.woerter, { [w]: { ziel: null, art: null } }) });
        for (const [name, bruch, soll] of [
            ["fachwerkhaus unbekannt (Befund)", wortWeg("fachwerkhaus"), '„fachwerkhaus" unbekannt'],
            ["wagen unbekannt (Befund)", wortWeg("wagen"), '„wagen" unbekannt'],
            ["Häuser ohne den Plural-Umlaut", wortWeg("häuser"), '„häuser" unbekannt'],
            [
                "fels löst auf ein Haus",
                mitW({ woerter: Object.assign({}, gesundW.woerter, { fels: { ziel: "haus_x", art: "haus" } }) }),
                '„fels" → haus_x',
            ],
            [
                "die Scheune geraten",
                mitW({ woerter: Object.assign({}, gesundW.woerter, { scheune: { ziel: "haus_alemannisch" } }) }),
                '„scheune" → haus_alemannisch',
            ],
            ["eine Studio-Art ohne Wort", mitW({ artenOhneWort: ["zacken"] }), "Studio-Arten ohne Wort: zacken"],
            [
                "der Satz baut kein Haus",
                mitW({ hausGebaut: 0, hausZeile: "Unbekannter Befehl" }),
                '„bau mir ein fachwerkhaus" stellt kein Haus',
            ],
            [
                "die Absage rät (Befund)",
                mitW({ absageZeile: "Unbekannter Befehl. Meintest du: 'baue dorf hier'?" }),
                "die Absage eines unbekannten Worts",
            ],
            [
                "der Ort gilt als Wort (Auflage 3 der zweiten Gegenprüfung)",
                mitW({
                    vorschlag: Object.assign({}, gesundW.vorschlag, {
                        "bau hier": {
                            zeile: '„hier" kennt kein Studio. Die Studios bauen — Häuser: Haus …',
                            sug: null,
                        },
                    }),
                }),
                '„bau hier": der Ort gilt als Wort',
            ],
            [
                "der Vorschlag fällt der Studio-Absage zum Opfer (Auflage 3 der zweiten Gegenprüfung)",
                mitW({
                    vorschlag: Object.assign({}, gesundW.vorschlag, {
                        "mach licht": { zeile: '„licht" kennt kein Studio. Die Studios bauen …', sug: "mach es hell" },
                    }),
                }),
                '„mach licht": der Vorschlag „mach es hell" fällt',
            ],
        ]) {
            const v = wortVerdict(bruch);
            check(
                `Selbst-Test L-Wortschatz: ‚${name}' → die Linse nennt ${soll}`,
                v.some((t) => t.startsWith(soll)),
                v.join(" · ")
            );
        }
        // L-Werkstatt: gesund ohne Täter, je Befund-Zustand der Täter beim Namen.
        const KOST = { holz: 44, laub: 50 };
        const steht = (verbraucht) => ({ bauModus: true, steht: 1, verbraucht, zeile: "" });
        const gesundG = {
            gestartet: true,
            kosten: KOST,
            wege: {
                schöpfer: { werkstatt: steht({}), rezeptbuch: steht({}), hotbar: steht({}), hand: steht({}) },
                "frieden mit Material": {
                    werkstatt: steht(KOST),
                    rezeptbuch: steht(KOST),
                    hotbar: steht(KOST),
                    hand: steht(KOST),
                },
                "frieden ohne Material": {
                    werkstatt: { bauModus: false, steht: 0, zeile: "Eiche: fehlt 44× holz · 50× laub — sammeln" },
                    rezeptbuch: { bauModus: false, steht: 0, zeile: "", gesperrt: "Es fehlt: 44× holz, 50× laub" },
                    hotbar: { bauModus: true, steht: 0, zeile: "Eiche: fehlt 44× holz · 50× laub — sammeln" },
                    hand: { bauModus: false, steht: 0, zeile: "Eiche: fehlt 44× holz · 50× laub — sammeln" },
                },
            },
            werke: { Haus: 1, GT: 1 },
            konsum: { "_laubSchwelle → materialAlphaTest": true },
            geraet: { name: "klinge_spitzhacke", zeile: "Spitzhacke: fehlt 12× eisen — sammeln", inHand: false },
            phantom: { studio: true, meshes: 2, verworfen: 0, farbe: "grün" },
            phantomOhneMaterial: "rot",
            sucheHaus: 32,
            lichtung: {
                wand: "lichtung",
                steht: 0,
                zeile: "Eiche: die Lichtung der Genesis-Plattform bleibt frei",
                toenung: { stoffe: 2, lesen: 2, farbe: "rot" },
            },
        };
        check(
            "Selbst-Test L-Werkstatt: gesund == 0 Täter",
            wegVerdict(gesundG).length === 0,
            wegVerdict(gesundG).join(" · ")
        );
        const mitG = (lage, weg, e) => {
            const b = JSON.parse(JSON.stringify(gesundG));
            b.wege[lage][weg] = Object.assign(b.wege[lage][weg], e);
            return b;
        };
        for (const [name, bruch, soll] of [
            [
                "das Rezeptbuch legt ins Inventar (Befund)",
                mitG("schöpfer", "rezeptbuch", { steht: 0, imInventar: true }),
                "schöpfer · rezeptbuch: 0 Werk(e) stehen",
            ],
            [
                "das Rezeptbuch zahlt doppelt",
                mitG("frieden mit Material", "rezeptbuch", { verbraucht: { holz: 88, laub: 100 } }),
                "frieden mit Material · rezeptbuch: holz 88× gezogen",
            ],
            [
                "frieden verweigert nur im Log (Befund)",
                mitG("frieden ohne Material", "hotbar", { zeile: "" }),
                "frieden ohne Material · hotbar: stumme Absage",
            ],
            [
                "FERTIGEN führt in den Bau-Modus ohne Material",
                mitG("frieden ohne Material", "werkstatt", { bauModus: true }),
                "frieden ohne Material · werkstatt: der Weg führt in einen Bau-Modus",
            ],
            [
                "das Werk in der Hand führt ohne Material in den Bau-Modus (Gegenprüfung 08.10.)",
                mitG("frieden ohne Material", "hand", { bauModus: true }),
                "frieden ohne Material · hand: der Weg führt in einen Bau-Modus",
            ],
            [
                "das Gerät aus der Hotbar verweigert nur im Log",
                Object.assign({}, gesundG, { geraet: { name: "klinge_spitzhacke", zeile: "" } }),
                "das Gerät aus der Hotbar verweigert stumm",
            ],
            [
                "schöpfer zahlt",
                mitG("schöpfer", "hotbar", { verbraucht: { holz: 44 } }),
                "schöpfer · hotbar: schöpfer zahlt",
            ],
            [
                "der GT hat keinen Weg",
                Object.assign({}, gesundG, { werke: { Haus: 1, GT: 0 } }),
                "Werkstatt GT: 0 stehen",
            ],
            [
                "das Phantom ist unsichtbar (Befund Leben-Schau)",
                Object.assign({}, gesundG, { phantom: { studio: true, meshes: 2, verworfen: 2 } }),
                "das Phantom ist unsichtbar: 2/2",
            ],
            [
                "die Suche findet kein Haus (Befund)",
                Object.assign({}, gesundG, { sucheHaus: 0 }),
                'die Suche „haus" findet kein Haus',
            ],
            [
                "das Phantom färbt sich nicht (Gegenprüfung 08.10.)",
                Object.assign({}, gesundG, {
                    lichtung: Object.assign({}, gesundG.lichtung, { toenung: { stoffe: 2, lesen: 0, farbe: "rot" } }),
                }),
                "das Phantom färbt sich nicht: 0/2",
            ],
            [
                "das Phantom steht grün über der Lichtung",
                Object.assign({}, gesundG, {
                    lichtung: Object.assign({}, gesundG.lichtung, { toenung: { stoffe: 2, lesen: 2, farbe: "grün" } }),
                }),
                "das Phantom über der Lichtung steht grün",
            ],
            [
                "die Eiche steht auf der Lichtung",
                Object.assign({}, gesundG, { lichtung: { wand: false, steht: 1, zeile: "" } }),
                "auf der Lichtung steht 1 Eiche",
            ],
            [
                "der Schwellen-Knoten des Laubs ohne die Zahl des Stoffs (K68-N1)",
                Object.assign({}, gesundG, { konsum: { "_laubSchwelle → materialAlphaTest": false } }),
                "Konsum: _laubSchwelle → materialAlphaTest",
            ],
            [
                "grün ohne Material (Auflage 2 der zweiten Gegenprüfung)",
                Object.assign({}, gesundG, { phantomOhneMaterial: "grün" }),
                "das Phantom ohne Material steht grün",
            ],
        ]) {
            const v = wegVerdict(bruch);
            check(
                `Selbst-Test L-Werkstatt: ‚${name}' → die Linse nennt ${soll}`,
                v.some((t) => t.startsWith(soll)),
                v.join(" · ")
            );
        }
        // Der Same des Werks: gesund ohne Täter, je Befund-Zustand (Gegenprüfung 08.10.) der Täter beim Namen.
        const gesundK = {
            gestartet: true,
            steht: 1,
            zuege: 0,
            phantomKey: "eiche|2|0",
            werkKey: "eiche|2|0",
            phantomDreh: -0.7,
            werkDreh: -0.7,
            werkSame: 1785671328,
            werkTint: "1.0/0.98/1.0",
            gesendetSame: 1785671328,
            empfang: { steht: true, key: "eiche|2|0", dreh: -0.7, tint: "1.0/0.98/1.0" },
            reload: { erst: 540370045, weiter: 490037188, nachReload: 490037188 },
            abstand: 7.4,
            reicht: 3.9,
            mindest: 7.4,
            naechsterSame: 2034871155,
            huelleReicht: 1.1,
            konsum: { "_workshopFoundryPreviewGroup → _werkSame": true, "_heldFoundryGroup → _werkSame": true, "_buildStudioPlacementGhost → _phantomWerk am Ort": true },
            stumm: [],
        };
        check(
            "Selbst-Test Werk-Same: gesund == 0 Täter",
            werkVerdict(gesundK).length === 0,
            werkVerdict(gesundK).join(" · ")
        );
        const mitK = (o) => Object.assign({}, gesundK, o);
        for (const [name, bruch, soll] of [
            ["das Setzen würfelt (Befund: der Standard-Same)", mitK({ zuege: 1 }), "das Setzen würfelt 1×"],
            ["die Vorschau hasht ihren Samen selbst", mitK({ konsum: Object.assign({}, gesundK.konsum, { "_workshopFoundryPreviewGroup → _werkSame": false }) }), "Konsum: _workshopFoundryPreviewGroup"],
            ["der Ghost fragt das Werk ohne Ort (K20: eiche|3 statt eiche|2)", mitK({ konsum: Object.assign({}, gesundK.konsum, { "_buildStudioPlacementGhost → _phantomWerk am Ort": false }) }), "Konsum: _buildStudioPlacementGhost"],
            ["der Standort schweigt (Befund: nur im Log)", mitK({ stumm: ["Standort trägt nicht"] }), "eine Absage des Setzens schweigt: Standort"],
            [
                "das Phantom zeigt eine andere Gestalt (Befund)",
                mitK({ werkKey: "eiche|1|0" }),
                "das Phantom zeigt eiche|2|0, es steht eiche|1|0",
            ],
            ["das Werk steht mit Drehung 0 (Befund)", mitK({ werkDreh: 0 }), "das Phantom blickt -0.7 rad"],
            [
                "der Mitspieler bekommt den Samen 0 (Befund)",
                mitK({ gesendetSame: 0 }),
                "der Mitspieler bekommt den Samen 0",
            ],
            [
                "beim Mitspieler eine andere Gestalt",
                mitK({ empfang: Object.assign({}, gesundK.empfang, { key: "eiche|1|0" }) }),
                "beim Mitspieler steht eiche|1|0",
            ],
            [
                "beim Mitspieler eine andere Tönung (Befund)",
                mitK({ empfang: Object.assign({}, gesundK.empfang, { tint: "0.89/0.92/0.95" }) }),
                "beim Mitspieler eine andere Tönung",
            ],
            [
                "der Zähler vergisst den Reload (Befund)",
                mitK({ reload: { erst: 540370045, weiter: 490037188, nachReload: 540370045 } }),
                "nach dem Reload wiederholt der Welt-Strom",
            ],
            [
                "das Phantom umhüllt den Spieler (Gegenprüfung 08.10.)",
                mitK({ abstand: 3.1 }),
                "das Phantom steht 3.1 m vor dem Spieler",
            ],
            [
                "die Klemme misst die Spender-Teile (Auflage 4 der zweiten Gegenprüfung)",
                mitK({ abstand: 6.51 }),
                "das Phantom steht 6.51 m vor dem Spieler, das Werk reicht 3.9 m",
            ],
            [
                "jedes Setzen derselbe Wurf (Auflage 1 der zweiten Gegenprüfung)",
                mitK({ naechsterSame: 1785671328 }),
                "das nächste Setzen zeigt dasselbe Werk",
            ],
            [
                "die Hülle reicht über die Klemme (Integration V18.536)",
                mitK({ huelleReicht: 10.3 }),
                "die Hülle des Werks reicht 10.3 m, die Klemme misst 3.9 m",
            ],
        ]) {
            const v = werkVerdict(bruch);
            check(
                `Selbst-Test Werk-Same: ‚${name}' → die Linse nennt ${soll}`,
                v.some((t) => t.startsWith(soll)),
                v.join(" · ")
            );
        }
        // Brennglas: gesund ohne Täter, je Befund-Zustand der Täter beim Namen.
        const gesundB = {
            gestartet: true,
            plattform: { gesetzt: true, abstand: 2.4, steht: true, maxWaerme: 0.2 },
            linse: {
                gesetzt: true,
                steht: false,
                waerme: 1,
                glimmtBei: 10,
                brenntBei: 20,
                zeileGlimmt: "„Eiche“ glimmt im Brennpunkt",
                zeileBrennt: "Die Sonne entzündete durch „Prüf-Linse“ „Eiche“",
            },
            nacht: { waerme: 0, steht: true },
            kuehlung: { nachFokus: 0.5, nachKuehlen: 0 },
            raeumung: { gesetzt: true, weg: true, zeile: "„Eiche“ wich dem Grundriss von „Alemannisch“." },
        };
        check(
            "Selbst-Test Brennglas: gesund == 0 Täter",
            brennVerdict(gesundB).length === 0,
            brennVerdict(gesundB).join(" · ")
        );
        const mitB = (k, o) => Object.assign({}, gesundB, { [k]: Object.assign({}, gesundB[k], o) });
        for (const [name, bruch, soll] of [
            [
                "die Plattform verbrennt die Eiche (Befund)",
                mitB("plattform", { steht: false, verbranntNach: 20 }),
                "die Eiche 2,4 m vor der Plattform-Mitte verbrannte",
            ],
            [
                "die Zerstörung steht nur im Log (Befund)",
                mitB("linse", { zeileBrennt: "" }),
                "die Zerstörung nennt sich nicht",
            ],
            ["das Glimmen schweigt", mitB("linse", { zeileGlimmt: "" }), "das Glimmen schweigt"],
            [
                "das Gesetz ist tot (die Linse brennt nicht)",
                mitB("linse", { steht: true, waerme: 0 }),
                "die gebaute Linse entzündet",
            ],
            ["nachts brennt es", mitB("nacht", { waerme: 1.5, steht: false }), "nachts erwärmt die Linse"],
            ["nichts kühlt", mitB("kuehlung", { nachKuehlen: 0.5 }), "außerhalb des Brennpunkts kühlt nichts"],
            ["die Räumung schweigt", mitB("raeumung", { zeile: "" }), "die Räumung eines Spieler-Werks schweigt"],
        ]) {
            const v = brennVerdict(bruch);
            check(
                `Selbst-Test Brennglas: ‚${name}' → die Linse nennt ${soll}`,
                v.some((t) => t.startsWith(soll)),
                v.join(" · ")
            );
        }
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Werkstatt-Weg-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of wand(quelle)) check(name, ok, detail);

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "linse", frist: 600000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(probe, { soll: WORT_SOLL, unbekannt: WORT_UNBEKANNT });
    await browser.close();
    server.close();

    console.log("=== D10 — DER SAME EINES SATZES KOMMT AUS DEM WELT-STROM ===");
    const sm = out.same || {};
    if (sm.err) check("D10 Probe ohne Ausnahme", false, sm.err.split("\n")[0]);
    const vS = sameVerdict(sm);
    check(
        "D10 kein Satz würfelt aus Math.random, derselbe Satz an derselben Stelle der Welt-Geschichte ist derselbe Hain",
        vS.length === 0,
        `${sm.gestartet ? `Math.random-Züge ${SAETZE.map((s) => `${s} ${sm.zuege[s]}`).join(" · ")} · Hain ${sm.hainBaeume} Bäume, Samen ${JSON.stringify(sm.samen)}, Orte ±${sm.ortAbweichung} m · KI ohne Seed ±${sm.kiOrtAbweichung} m` : "nicht gestartet"}${vS.length ? " — Täter: " + vS.join(", ") : ""}`
    );
    console.log("=== L-WORTSCHATZ — DER WORT-KATALOG IST DER REZEPT-KATALOG ===");
    const wm = out.wort || {};
    if (wm.err) check("L-Wortschatz Probe ohne Ausnahme", false, wm.err.split("\n")[0]);
    const vW = wortVerdict(wm);
    const bekannt = Object.keys(WORT_SOLL).filter((w) => wm.woerter && wm.woerter[w] && wm.woerter[w].ziel).length;
    check(
        "L-Wortschatz jedes Wort des Befunds löst über die Studio-Arten auf, „bau mir ein fachwerkhaus“ stellt ein Haus, ein unbekanntes Wort hört den Katalog",
        vW.length === 0,
        `${
            wm.gestartet
                ? `${bekannt}/${Object.keys(WORT_SOLL).length} Wörter bekannt (fachwerkhaus → ${wm.woerter.fachwerkhaus && wm.woerter.fachwerkhaus.ziel}, wagen → ${wm.woerter.wagen && wm.woerter.wagen.ziel}) · ${wm.arten - (wm.artenOhneWort || []).length}/${wm.arten} Studio-Arten mit Wort · Haus gebaut ${wm.hausGebaut} · Absage „${(wm.absageZeile || "").slice(0, 70)}…" · ${Object.entries(
                      wm.vorschlag || {}
                  )
                      .map(([k, v]) => `„${k}" → „${(v.zeile || "").replace(/^> [^|]*\| /, "").slice(0, 60)}…"`)
                      .join(" · ")}`
                : "nicht gestartet"
        }${vW.length ? " — Täter: " + vW.join(", ") : ""}`
    );
    console.log("=== L-WERKSTATT · FRIEDEN · L-RÜCKMELDUNG — JEDER WEG FÜHRT ZUM STEHENDEN WERK ===");
    const gm = out.weg || {};
    if (gm.err) check("L-Werkstatt Probe ohne Ausnahme", false, gm.err.split("\n")[0]);
    const vG = wegVerdict(gm);
    const zelle = (lage, weg) => {
        const e = (gm.wege && gm.wege[lage] && gm.wege[lage][weg]) || {};
        if (lage === "frieden ohne Material")
            return `${weg} ${e.steht ? "steht!" : /fehlt/.test(e.zeile || "") ? "sagt es" : e.gesperrt ? "gesperrt" : "stumm"}`;
        return `${weg} ${e.steht}${lage === "frieden mit Material" ? ` (${Object.values(e.verbraucht || {}).join("/")})` : ""}`;
    };
    const tragen = ["schöpfer", "frieden mit Material"].reduce(
        (n, lage) =>
            n + WEGE.filter((w) => gm.wege && gm.wege[lage] && gm.wege[lage][w] && gm.wege[lage][w].steht === 1).length,
        0
    );
    check(
        "L-Werkstatt jeder Weg (Werkstatt · Rezeptbuch · Hotbar) führt zum stehenden Werk, frieden zahlt einmal, jede Absage spricht, die Lichtung sagt warum",
        vG.length === 0,
        `${gm.gestartet ? `${tragen}/${2 * WEGE.length} Wege tragen · ${LAGEN.map((l) => `${l}: ${WEGE.map((w) => zelle(l, w)).join(", ")}`).join(" · ")} · Werkstatt ${JSON.stringify(gm.werke)} · Phantom ${JSON.stringify(gm.phantom)}, ohne Material ${gm.phantomOhneMaterial} · Suche „haus" ${gm.sucheHaus} · Gerät ${(gm.geraet || {}).name}: „${((gm.geraet || {}).zeile || "").slice(0, 60)}" · Lichtung ${JSON.stringify({ wand: gm.lichtung && gm.lichtung.wand, steht: gm.lichtung && gm.lichtung.steht, toenung: gm.lichtung && gm.lichtung.toenung })}` : "nicht gestartet"}${vG.length ? " — Täter: " + vG.join(", ") : ""}`
    );
    console.log("=== DER SAME DES WERKS — DAS GESETZTE WERK IST DAS PHANTOM, AUCH BEIM MITSPIELER ===");
    const km = out.werk || {};
    if (km.err) check("Werk-Same Probe ohne Ausnahme", false, km.err.split("\n")[0]);
    const vK = werkVerdict(km);
    const ke = km.empfang || {};
    const kr = km.reload || {};
    check(
        "Werk-Same das Setzen stellt Gestalt und Drehung des Phantoms ohne Math.random, der Mitspieler baut dasselbe Werk, der Welt-Strom übersteht den Reload",
        vK.length === 0,
        `${km.gestartet ? `Math.random ${km.zuege} · Phantom ${km.abstand} m vor dem Spieler (Soll ≥ ${km.mindest} m; die Studio-Gestalt reicht ${km.reicht} m, die Spender-Teile ${km.reichtSpender} m, die Hülle des Werks ${km.huelleReicht} m) · Phantom ${km.phantomKey} @ ${km.phantomDreh} rad → Werk ${km.werkKey} @ ${km.werkDreh} rad (Same ${km.werkSame}, das nächste Phantom ${km.naechsterSame}) · gesendet Same ${km.gesendetSame} → Mitspieler ${ke.steht ? `${ke.key} @ ${ke.dreh} rad, Tönung ${ke.tint === km.werkTint ? "gleich" : "anders"}` : "nichts"} · Strom ${kr.erst} → ${kr.weiter}, nach Reload ${kr.nachReload}` : "nicht gestartet"}${vK.length ? " — Täter: " + vK.join(", ") : ""}`
    );
    console.log("=== BRENNGLAS — DAS LICHT BRENNT, WO ES SICH BÜNDELT, UND DIE ZERSTÖRUNG NENNT SICH ===");
    const bm = out.brenn || {};
    if (bm.err) check("Brennglas Probe ohne Ausnahme", false, bm.err.split("\n")[0]);
    const vB = brennVerdict(bm);
    const bp_ = bm.plattform || {};
    const bl = bm.linse || {};
    check(
        "Brennglas die Eiche an der Genesis-Plattform übersteht einen sonnigen Tag, die gebaute Linse brennt zu Mittag und sagt es, nachts nie, außerhalb kühlt es",
        vB.length === 0,
        `${bm.gestartet ? `Plattform: ${bp_.steht ? `steht nach 480 s (max. Wärme ${bp_.maxWaerme})` : `verbrannt nach ${bp_.verbranntNach} s`} · Linse: glimmt ${bl.glimmtBei} s, brennt ${bl.brenntBei} s („${(bl.zeileBrennt || "").slice(0, 60)}") · Nacht Wärme ${(bm.nacht || {}).waerme} · Kühlung ${(bm.kuehlung || {}).nachFokus} → ${(bm.kuehlung || {}).nachKuehlen} · Räumung „${((bm.raeumung || {}).zeile || "").slice(0, 60)}" · Zensus ${JSON.stringify(bm.zensus)}` : "nicht gestartet"}${vB.length ? " — Täter: " + vB.join(", ") : ""}`
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Werkstatt-Weg trägt seine benannten Schnitte.");
    process.exit(0);
})().catch((e) => {
    console.error("Werkstatt-Weg-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
