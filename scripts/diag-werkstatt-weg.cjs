// diag-werkstatt-weg.cjs — DIE WERKSTATT-WEG-LINSE (v1-Schritte 3–4: in der Werkstatt bauen, mit der KI erschaffen), im
// echten Boot (headless, foundry-ON, Null-Renderer der Welt); jede Probe ruft ihren Chokepoint, L-WERKSTATT fährt echte Eingaben.
//   D10 — der Same eines Satzes (Hain, Insel, Fraktal, KI ohne Seed) kommt aus dem Welt-Strom (`_bauSame`), nie aus
//     Math.random; derselbe Satz an derselben Stelle der Welt-Geschichte ist derselbe Hain.
//   L-WORTSCHATZ — jedes Wort löst über die Studio-Arten auf, „bau mir ein fachwerkhaus" stellt ein Haus, ein unbekanntes Wort
//     hört den Katalog.
//   L-WERKSTATT (Bauen K1) — Eiche, Haus, GT und das eigene Teil-Werk über Werkstatt, Rezeptbuch und Hotbar in ≤ 3 echten
//     Eingaben (Capture-Hörer auf window), schöpfer · frieden · pfad, Ego und Third; Rohdatei artifacts/werkstatt-weg/weg.json.
//   BRENNGLAS — die Eiche an der Genesis-Plattform übersteht einen sonnigen Tag; die gebaute Linse entzündet zu Mittag die
//     Eiche unter sich und sagt es, nachts nie, außerhalb kühlt es.
//   DER SAME DES WERKS — das Setzen stellt Gestalt und Drehung des Phantoms (`_werkSame`), der Mitspieler dasselbe Werk, der
//     Welt-Strom übersteht den Reload.
//   PRÜF-SATZ (Bauen K3) — zehn Konstruktionen über den Bau-Weg (spec/pruefsatz/bauen-k3.json): das Stabile steht, das Instabile
//     stürzt sichtbar (die EINE Statik beim Setzen); Brennglas, Rad, Schale und Gründer wirken aus der Form.
//   node scripts/diag-werkstatt-weg.cjs [--selftest]          Port: WERKSTATT_WEG_PORT (Standard 4623)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, starteBrowser, nullRenderer } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

const PORT = Number(process.env.WERKSTATT_WEG_PORT || 4623);
const PRUEF_SATZ = require("../spec/pruefsatz/bauen-k3.json"); // Meisterkarte Bauen K3: 5 stabil, 5 instabil, die Wirkungen

const { errs, check } = require("./lib/welt-boot.cjs").pruefer();

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

// Die Wörter und ihre Studio-Art; unbekannt bleibt, was kein Studio baut.
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

// L-WERKSTATT: je Lage × Weg × Werk × Sicht ein Lauf { steht, eingaben, unecht, folge, ms, kalt, zeile, gesperrt, bauModus,
// farbe, verbraucht, kosten, imInventar, fehler }; dazu Phantom, Gerät, Suche, Lichtung.
const WEGE = ["werkstatt", "rezeptbuch", "hotbar"];
const LAGEN = ["schöpfer", "frieden mit Material", "frieden ohne Material", "pfad"];
const WERKE = { Eiche: "baum_eiche", Haus: "haus_alemannisch", GT: "fahrzeug_gt", Teil: "eigen_huette" };
const SICHTEN = ["Ego", "Third"];
const EINGABEN_SOLL = 3; // Meisterkarte Bauen K1: vom Willen zum stehenden Werk ≤ 3 Eingaben
function wegVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = konsumTaeter(m.konsum);
    for (const lage of LAGEN)
        for (const weg of WEGE)
            for (const werk of Object.keys(WERKE))
                for (const sicht of SICHTEN) {
                    const e = ((((m.wege || {})[lage] || {})[weg] || {})[werk] || {})[sicht];
                    const wo = `${lage} · ${weg} · ${werk} · ${sicht}: `;
                    const t = (x) => out.push(wo + x);
                    if (!e) {
                        t("nicht gelaufen");
                        continue;
                    }
                    if (e.fehler) t(e.fehler.slice(0, 90));
                    if (e.unecht > 0) t(`${e.unecht} Ereignis(se) ohne Spieler (isTrusted false)`);
                    if (!(e.eingaben > 0)) t("kein echtes Eingabe-Ereignis — der Weg lief ohne Spieler");
                    if (lage === "frieden ohne Material") {
                        if (e.steht > 0) t("steht ohne Material");
                        if (!/fehlt/i.test(`${e.zeile} ${e.gesperrt}`)) t(`stumme Absage („${(e.zeile || "").slice(0, 50)}")`);
                        if (e.bauModus && weg !== "hotbar") t("der Weg führt in einen Bau-Modus, der nur ablehnen kann");
                        continue;
                    }
                    if (e.steht !== 1) t(`${e.steht} Werk(e) stehen (Soll 1)${e.imInventar ? ", das Werk liegt im Inventar" : ""}`);
                    else if (e.eingaben > EINGABEN_SOLL) t(`${e.eingaben} Eingaben bis zum stehenden Werk (Soll ≤ ${EINGABEN_SOLL}: ${e.folge})`);
                    // das Gesetz des Modus: frieden und pfad zahlen genau einmal, frei baut nur schöpfer
                    for (const [mt, n] of Object.entries(e.kosten || {}))
                        if (((e.verbraucht || {})[mt] || 0) !== (lage === "schöpfer" ? 0 : n))
                            t(lage === "schöpfer" ? "schöpfer zahlt" : `${mt} ${(e.verbraucht || {})[mt] || 0}× gezogen (Soll ${n})`);
                }
    // Ein Gerät aus der Hotbar (frieden, ohne Material): der Griff schmiedet und sagt, was fehlt.
    const ge = m.geraet || {};
    if (!ge.name) out.push("kein ungeschmiedetes Gerät mit Kosten (Vorbedingung)");
    else if (!/fehlt/.test(ge.zeile || "")) out.push(`das Gerät aus der Hotbar verweigert stumm („${(ge.zeile || "").slice(0, 50)}")`);
    const ph = m.phantom || {};
    if (!(ph.meshes > 0)) out.push("kein Phantom im Bau-Modus (Vorbedingung)");
    else if (ph.verworfen > 0) out.push(`das Phantom ist unsichtbar: ${ph.verworfen}/${ph.meshes} Meshes verwirft der Alpha-Test`);
    if (!(m.sucheHaus > 0)) out.push(`die Suche „haus" findet kein Haus (${m.sucheHaus})`);
    const l = m.lichtung || {};
    const tl = l.toenung || {};
    if (l.wand !== "lichtung") out.push(`das Phantom über der Lichtung urteilt nicht (Urteil ${l.wand})`);
    // Die Tönung im Stoff: der Studio-Stoff liest seine Farbe aus colorNode, die Tönung muss dort wirken.
    if (!(tl.stoffe > 0)) out.push("kein Studio-Phantom über der Lichtung (Vorbedingung)");
    else if (tl.lesen !== tl.stoffe) out.push(`das Phantom färbt sich nicht: ${tl.lesen}/${tl.stoffe} Stoffe lesen die Tönung`);
    if (tl.farbe !== "rot") out.push(`das Phantom über der Lichtung steht ${tl.farbe} (Soll rot)`);
    if (ph.farbe !== "grün") out.push(`das Phantom am freien Ort steht ${ph.farbe} (Soll grün)`);
    // Grün heißt: das Setzen trägt (Auflage 2) — ohne Material lehnt es ab, das Phantom steht rot.
    const ohne = (((m.wege || {})["frieden ohne Material"] || {}).hotbar || {}).Eiche || {};
    if ((ohne.Ego || {}).farbe !== "rot") out.push(`das Phantom ohne Material steht ${(ohne.Ego || {}).farbe} (Soll rot)`);
    if (l.steht > 0) out.push(`auf der Lichtung steht ${l.steht} Eiche (die Natur-Wand gilt dem Satz, nicht dem Bau-Modus)`);
    if (!/Lichtung/.test(l.zeile || "")) out.push(`die Lichtung verweigert stumm („${(l.zeile || "").slice(0, 50)}")`);
    return out;
}

// Brennglas: { plattform: {steht, maxWaerme, zeilen}, linse: {glimmtBei, brenntBei, steht, zeileGlimmt, zeileBrennt},
// nacht: {waerme, steht}, kuehlung: {nachFokus, nachKuehlen} }.
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
    return out;
}

// Der Prüf-Satz (Bauen K3) mit dem Brennglas → die Täter je Konstruktion und Wirkung.
const WIRKUNGEN = ["Brennglas mittags", "Brennglas nachts", "Rad", "Schale", "Gründer"];
function pruefVerdict(m, b) {
    if (!m || !m.gestartet) return { statik: ["start"], wirkung: WIRKUNGEN, richtig: 0 };
    const z = Object.entries(m.statik);
    const statik = z
        .filter(([, w]) => !w.gesetzt || (w.art === "stabil" ? !w.steht : !(w.neigung >= 30 || w.fall >= 0.3) || !w.zeile))
        .map(([k, w]) => `${k} ${JSON.stringify(w)}`);
    const [l, n, rad, s, g] = [b.linse || {}, b.nacht || {}, m.rad || {}, m.schale, m.gruender];
    const ok = [
        l.brenntBei > 0,
        n.waerme === 0 && n.steht,
        rad.rad && rad.rad.weg >= 1 && rad.rad.hinab > 0 && rad.rad.neigung > 30 && rad.klotz.weg < 0.01,
        s.regen > 0 && s.sonne >= 0.8 * s.regen && s.sichtbar && s.loch === 0,
        g.breit > 0.05 && g.hoch < 0.01,
    ];
    const rest = [...konsumTaeter(m.konsum), ...(z.length === 10 ? [] : [`${z.length} von 10 gesetzt`])];
    return { statik: [...rest, ...statik], wirkung: WIRKUNGEN.filter((_, i) => !ok[i]), richtig: z.length - statik.length };
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
    // Das Werk steht nie im Spieler: wie weit es reicht, misst die Linse an der Studio-Gestalt des Phantoms in Weltgröße.
    if (!(m.mindest > 0)) out.push("kein Spieler-Abstand des Werks (Vorbedingung)");
    else if (!(m.abstand >= m.mindest - 0.01))
        out.push(
            `das Phantom steht ${m.abstand} m vor dem Spieler, das Werk reicht ${m.reicht} m (Soll ≥ ${m.mindest} m)`
        );
    // Die Hülle des gesetzten Werks liegt in der Reichweite, die die Klemme misst.
    if (Number.isFinite(m.huelleReicht) && m.reicht > 0 && m.huelleReicht > m.reicht + 0.01)
        out.push(
            `die Hülle des Werks reicht ${m.huelleReicht} m, die Klemme misst ${m.reicht} m — der Spieler steht im Werk`
        );
    if (m.gesendetSame !== m.werkSame)
        out.push(`der Mitspieler bekommt den Samen ${m.gesendetSame}, das Werk trägt ${m.werkSame}`);
    // Jedes Setzen ein neues Werk: nach dem Setzen zeigt das Phantom den nächsten Samen.
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

// ── DIE STATISCHE WAND (Node): jede Absenz über den EINEN Helfer (stammLib.fehlt, der Täter mit Datei und Zeile; ein
// totes Glied wirft). `w` wandelt den Stamm (der Vor-Stand des Selbsttests). Liefert [name, ok, detail]. ──
function wand(w) {
    // alle Absenzen einer Zeile: [ok, der erste Täter]
    const alle = (...faelle) => {
        for (const [g, re] of faelle) if (!stammLib.fehlt(g, re, w)) return [false, stammLib.fehlt.wo];
        return [true];
    };
    const wurzeln = ["spawnArchitecture", "spawnIslandAt", "spawnUfoAt", "_workshopRecipeSpec", "dslCompose", "generateEvolution", "confirmBuild"];
    const WORT = /"(?:baum_|haus_|fels|stein|kristall|eiche|kiefer|birke|tanne|buche|hain|wald)\w*"/;
    return [
        ["W1 kein Satz würfelt aus Math.random (chatDslPatterns · dslCtx · _dslSpawnStudioItems)", ...alle([[/\n {4}get chatDslPatterns\(\) \{/, "dslCtx", "_dslSpawnStudioItems"], /Math\.random/])],
        ["W2 die Streuung zieht nie aus dem Programm-Strom (kein `ctx.rng()` in `_dslSpawnStudioItems`)", ...alle(["_dslSpawnStudioItems", /ctx\.rng\(\)/])],
        [
            "W3 der Wort-Katalog liest den Rezept-Katalog (kein STUDIO_WORT, keine Wort-Literale in Auflöser · Katalog · Wortliste)",
            ...alle([null, /AnazhRealm\.STUDIO_WORT\b/], [["_studioBlueprintForWord", "_studioWortKatalog", "_studioWordsForPrompt"], WORT]),
        ],
        [
            "W5 das Brennglas spricht nie nur ins Log, der Sonnen-Winkel ist EINE Formel (`_sonnenWinkel`)",
            ...alle(["_tickFocusingAffordances", /this\.log\(/], [{ ausser: "_sonnenWinkel" }, /\* Math\.PI \* 2 - Math\.PI \/ 2/]),
        ],
        [
            "W7 kein Werk würfelt aus Math.random (spawnArchitecture · spawnIslandAt · spawnUfoAt · Werkstatt-Würfel · dslCompose · generateEvolution · confirmBuild), kein Sitzungs-Zähler des Welt-Stroms",
            ...alle([wurzeln, /Math\.random/], [null, /_bauSameZaehler/]),
        ],
        [
            "W8 EIN Same-Hash (`_werkSame`), die Nachricht an den Mitspieler trägt nie den Samen 0",
            ...alle([{ ausser: "_werkSame" }, /Math\.imul\(\w+, 131\)/], ["confirmBuild", /"spawn_blueprint", bm\.blueprintName, posNode, 0\b/]),
        ],
        ["W9 kein zweites LCG im Strom-Gesetz (`_streamRng`)", ...alle(["_streamRng", /1664525/])],
    ];
}

const server = statikServer();

// ── DIE PROBEN IN DER SEITE (Funktionsrumpf; r = die Welt). ──
async function probe(argW) {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const out = {};
    await window.__weltDa();
    const r = window.anazhRealm;
    const st = r.state;
    const zeilen = () => [...document.querySelectorAll("#chat-output > div")].map((d) => d.textContent);
    const tick = async (n, ms) => {
        for (let i = 0; i < n; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(ms || 30);
        }
    };
    for (
        const weiter = window.__deckel("Buch, Leib und Eiche", 900);
        weiter() &&
        !(
            st.playerMesh &&
            r._foundry &&
            r._foundry.recipes &&
            st.blueprints &&
            st.blueprints.baum_eiche &&
            r._genesisPlattform()
        );

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
    // DER BAU-WEG DES SPIELERS: der Plan in die Hotbar, das Phantom an den Ort, `confirmBuild` (schöpfer) — ruft es die Statik?
    const satz = argW.satz;
    const konsum = { "confirmBuild → _workshopPhysicsVerdict": false };
    const setze = (name, plan, x, z, dreh = 0) => {
        const [key, bm, vor, urteil, modus, slot] = ["__pruef_" + name, st.buildMode, new Set(st.architectures), r._workshopPhysicsVerdict, r.getGameMode(), st.hotbar[6]];
        const teil = ([px, py, pz, sx, sy, sz, material = "stein", shape = "box", rz = 0]) =>
            ({ shape, material, position: { x: px, y: py, z: pz }, size: { x: sx, y: sy, z: sz }, rotation: { x: 0, y: 0, z: rz } });
        st.blueprints[key] = { name: key, label: name, parts: plan.map(teil) };
        r.setGameMode("schöpfer");
        r._clearBuildMode();
        bm.slotIndex = -1;
        r.setHotbarSlot(6, key);
        r.selectHotbarSlot(6);
        bm.phantomMesh.position.set(x, r._voxelSurfaceY(x, z), z);
        [bm.phantomMesh.rotation.y, bm.phantomOnGround] = [dreh, true];
        r._workshopPhysicsVerdict = function (...a) {
            konsum["confirmBuild → _workshopPhysicsVerdict"] = true;
            return urteil.apply(this, a);
        };
        try {
            r.confirmBuild();
        } finally {
            delete r._workshopPhysicsVerdict;
            r._clearBuildMode();
            r.setHotbarSlot(6, slot);
            r.setGameMode(modus);
        }
        return st.architectures.find((e) => !vor.has(e) && e.type === key) || null;
    };
    // die gezeichnete Lage (Gruppe oder erste Instanz)
    const bild = (e) => {
        const m = new THREE.Matrix4();
        if (e.mesh) m.compose(e.mesh.position, e.mesh.quaternion, e.mesh.scale);
        else if (e.instSlots && e.instSlots.length) st.archInstanceGroups.get(e.instSlots[0].key).mesh.getMatrixAt(e.instSlots[0].slot, m);
        else return null;
        const [p, q] = [new THREE.Vector3(), new THREE.Quaternion()];
        m.decompose(p, q, new THREE.Vector3());
        return { p, q };
    };
    const grad = (a, b) => (360 / Math.PI) * Math.acos(Math.min(1, Math.abs(a.q.dot(b.q))));

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
        // Ein Verb mit einem Wort, das kein Ding ist: der Studio-Satz stiehlt dem Vorschlag die Zeile nicht.
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
            // EIN Same je Werk: Vorschau und Hand ziehen `_werkSame`; der Ghost baut das Werk des Phantoms an SEINEM Ort.
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
                // Die Hülle des Werks (seine Blocker): wie weit sie waagrecht über seinen Ort reicht.
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
        const wetterAlt = st.weather;
        const zeitAlt = st.timeOfDay;
        const takt = (s) => r._tickFocusingAffordances(s);
        try {
            st.weather = "sunny";
            // (1) Die Eiche 2,4 m vor der Plattform-Mitte (direkt gesetzt: der Bau-Modus hält die Lichtung frei): ein sonniger Tag.
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
            // (2) Die gebaute Linse (das Gesetz lebt): Quarz-Kugel im Bronze-Ring auf drei Beinen, 1 m über dem Boden, die Eiche
            // darunter — gesetzt über den Bau-Weg (der Prüf-Satz `Brennglas`; ohne Beine schwebte sie und stürzte).
            const L0 = { x: frei.x + 30, y: frei.y, z: frei.z };
            const linse = setze("Brennglas", satz.wirkung.Brennglas, L0.x, L0.z);
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
        } finally {
            st.weather = wetterAlt;
            st.timeOfDay = zeitAlt;
        }
        m.gestartet = true;
    } catch (e) {
        out.brenn = Object.assign(out.brenn || {}, { err: (e && e.stack) || String(e) });
    }

    // ── Der Prüf-Satz (Bauen K3): Statik und Wirkung aus der Form, in der Welt ──
    try {
        const m = (out.pruef = { gestartet: false, statik: {}, konsum });
        const [emo, wetter, chaos, h] = [st.player.emotions, st.weather, st.player.emotions.chaos, (x, z) => r.getTerrainHeightAt(x, z)];
        const takte = (n, dt) => {
            for (let i = 0; i < n; i++) r.tickAffordances(dt);
        };
        st.playerMesh.position.set(frei.x, frei.y + 1.2, frei.z);
        // gesetzt, n Takte zu 1/30 s: größte Drehung, tiefster Fall der gezeichneten Lage
        const lauf = (name, plan, x, z, n, dreh) => {
            const [n0, e] = [zeilen().length, setze(name, plan, x, z, dreh)];
            const [b0, p0, o] = [e && bild(e), e && { ...e.position }, { neigung: 0, fall: 0 }];
            for (let t = 0; t < n && b0 && st.architectures.includes(e); t++) {
                takte(1, 1 / 30);
                const b = st.architectures.includes(e) && bild(e);
                if (b) [o.neigung, o.fall] = [Math.max(o.neigung, grad(b0, b)), Math.max(o.fall, b0.p.y - b.p.y)];
            }
            const da = !!e && st.architectures.includes(e);
            Object.assign(o, { gesetzt: !!b0, steht: da && o.neigung < 0.5 && o.fall < 0.01, zeile: zeilen().slice(n0).find((l) => l.includes(name)) || "" });
            if (e) Object.assign(o, { weg: Math.hypot(e.position.x - p0.x, e.position.z - p0.z), hinab: p0.y - e.position.y });
            if (da) r.removeArchitecture(e);
            return o;
        };
        for (const art of ["stabil", "instabil"])
            for (const [name, plan] of Object.entries(satz[art])) m.statik[name] = { art, ...lauf(name, plan, frei.x + 12, frei.z, 150) };
        // DAS RAD quer zur Falllinie eines trockenen Hangs (Gefälle 0,3–0,6), der Klotz ebenso
        let hang = null;
        for (let i = 0; i < 744 && !hang; i++) {
            const [w, ring] = [((i % 24) / 12) * Math.PI, 20 + 6 * Math.floor(i / 24)];
            const [x, z] = [frei.x + Math.cos(w) * ring, frei.z + Math.sin(w) * ring];
            const [gx, gz] = [(h(x + 1, z) - h(x - 1, z)) / 2, (h(x, z + 1) - h(x, z - 1)) / 2];
            const g = Math.hypot(gx, gz);
            if (g > 0.3 && g < 0.6 && !r._nassAt(x, z) && h(x - (6 * gx) / g, z - (6 * gz) / g) < h(x, z) - 1.5) hang = { x, z, dreh: Math.atan2(-gx, -gz) };
        }
        if (hang) {
            st.playerMesh.position.set(hang.x, h(hang.x, hang.z) + 1.2, hang.z);
            m.rad = { rad: lauf("Rad", satz.wirkung.Rad, hang.x, hang.z, 90, hang.dreh), klotz: lauf("Klotz", satz.wirkung.Klotz, hang.x, hang.z, 90, hang.dreh) };
            st.playerMesh.position.set(frei.x, frei.y + 1.2, frei.z);
        }
        // DIE SCHALE: 60 s Regen, 30 s Sonne; die Schale mit Loch daneben
        const [sch, loch] = [setze("Schale", satz.wirkung.Schale, frei.x + 12, frei.z), setze("Schale mit Loch", satz.wirkung["Schale mit Loch"], frei.x + 12, frei.z + 5)];
        const F = (e) => (e && e._gesetz && e._gesetz.gefaess) || { wasser: 0 };
        st.weather = "rainy";
        const regen = (takte(60, 1), F(sch).wasser);
        st.weather = "sunny";
        m.schale = { regen, sichtbar: !!(F(sch).mesh && F(sch).mesh.parent), sonne: (takte(30, 1), F(sch).wasser), loch: F(loch).wasser };
        st.weather = wetter;
        for (const e of [sch, loch]) if (e) r.removeArchitecture(e);
        // DER GRÜNDER legt den Aufruhr, dieselben Steine gestapelt nicht
        m.gruender = {};
        for (const [name, k] of [["Gründer", "breit"], ["Stapel", "hoch"]]) {
            const e = setze(name, satz.wirkung[name], frei.x + 3, frei.z);
            emo.chaos = 0.8;
            takte(150, 1 / 30);
            m.gruender[k] = 0.8 - emo.chaos;
            if (e) r.removeArchitecture(e);
        }
        emo.chaos = chaos;
        for (const k of Object.keys(st.blueprints)) if (k.startsWith("__pruef_")) delete st.blueprints[k];
        m.gestartet = true;
    } catch (e) {
        out.pruef = Object.assign(out.pruef || {}, { err: (e && e.stack) || String(e) });
    }
    return out;
}

// ── L-WERKSTATT, die Seite: sie bereitet vor (vor dem Zähler) und liest — nie ein Schritt des Wegs. Headless tickt die
// Schleife nicht von selbst: hier tickt `_gameLoopTick` (die Schleife des Spiels). ──
function wegHelfer(arg) {
    const r = window.anazhRealm;
    const st = r.state;
    const inv = st.player.inventory;
    const P = r._genesisPlattform().position;
    const yaw = Math.atan2(arg.frei.x - P.x, arg.frei.z - P.z);
    const zeilen = () => document.querySelectorAll("#chat-output > div");
    const habe = () => {
        const h = {};
        for (const s of inv) if (s && s.kind === "material") h[s.material] = (h[s.material] || 0) + (s.count || 0);
        return h;
    };
    // das eigene Werk: eine Hütte aus fünf Grundformen (vier Wände, ein Dach), Teil für Teil gefügt
    if (!st.blueprints[arg.teil]) r.createBlueprint(arg.teil, "Hütte");
    for (const [x, y, z, a, b, c] of st.blueprints[arg.teil].parts.length ? [] : [[0, 1.2, -1.5, 3.2, 2.4, 0.3], [0, 1.2, 1.5, 3.2, 2.4, 0.3], [-1.5, 1.2, 0, 0.3, 2.4, 3.2], [1.5, 1.2, 0, 0.3, 2.4, 3.2], [0, 2.55, 0, 3.6, 0.3, 3.6]])
        r.addPartToBlueprint(arg.teil, { shape: "box", material: "stein", position: { x, y, z }, size: { x: a, y: b, z: c } });
    // Die Tönung des Phantoms: wie viele Studio-Stoffe (colorNode) den EINEN Tönungs-Uniform lesen, und seine Farbe (rot:
    // das Setzen wird abgelehnt, grün: es trägt).
    const liest = (k, ziel, gesehen) => k === ziel || (!gesehen.has(k) && gesehen.size < 2000 && (gesehen.add(k), [...(k.getChildren ? k.getChildren() : [])].some((c) => c && liest(c, ziel, gesehen))));
    const toenung = (ph) => {
        const t = r._phantomTintU;
        const o = { stoffe: 0, lesen: 0 };
        if (ph) ph.traverse((m) => m.isMesh && m.material && m.material.colorNode && (o.stoffe++, t && liest(m.material.colorNode, t, new Set()) && o.lesen++));
        const c = t && t.value;
        o.farbe = !c ? "ohne Tönung" : c.r > c.g * 1.5 ? "rot" : c.g > c.r * 1.5 ? "grün" : "grau";
        return o;
    };
    const aufraeumen = () => {
        if (st.buildMode.active) r._clearBuildMode();
        if (st.uiActiveDrawer) r.closeAllDrawers();
        if (st.inventoryOpen) r.toggleInventoryOverlay(false);
        r._workshopClosePicker();
        if (document.activeElement) document.activeElement.blur();
        r._spielerSagtLetzte = null; // die 2-s-Sperre derselben Zeile gilt dem gehaltenen Rechtsklick, nicht dem nächsten Lauf
    };
    const modusAlt = r.getGameMode();
    const gebaut = new Set();
    let lauf = null;
    const neue = () => st.architectures.filter((a) => a && !lauf.vorher.has(a) && a.type === lauf.name && typeof a.id === "string");
    const takt = setInterval(() => {
        try {
            r._gameLoopTick(performance.now());
        } catch (_e) {}
        if (lauf && lauf.standT == null && neue().length) lauf.standT = performance.now();
    }, 40);
    window.__bauWeg = {
        // kein Stoff der Szene trägt einen Schwellen-Knoten: die Zahl regiert den Schnitt (das Phantom erbt nie 0,5, K68-N1; A3)
        konsum: () => ((n) => (st.scene.traverse((o) => (n += o.material && o.material.alphaTestNode ? 1 : 0)), { "Stoff → alphaTest": n === 0 }))(0),
        // o = { lage, weg, name, sicht, ort, slot }; die Werkstatt zeigt ein anderes Werk (der Wille wählt), der Hotbar-Weg
        // setzt das Werk in der Hotbar voraus, die Katalog-Wege finden es selbst
        vorbereiten(o) {
            aufraeumen();
            r.setGameMode(o.lage === "schöpfer" ? "schöpfer" : o.lage === "pfad" ? "pfad" : "frieden");
            inv.fill(null);
            const kosten = Object.assign({}, r.checkBuildCost(o.name).cost);
            if (o.lage === "frieden mit Material" || o.lage === "pfad") for (const mt in kosten) r.addMaterialToInventory(mt, kosten[mt]);
            r.setCameraMode(o.sicht === "Third" ? "third" : "first");
            const hotbarAlt = st.hotbar.slice();
            if (o.slot != null || (o.weg === "hotbar" && !st.hotbar.includes(o.name))) r.setHotbarSlot(o.slot != null ? o.slot : st.hotbar.indexOf(null), o.name);
            r.selectBlueprintForEdit(Object.keys(st.blueprints).find((n) => n !== o.name && r._katalogSichtbar(n)));
            const ort = o.ort === "lichtung" ? { x: P.x, y: P.y + 1, z: P.z } : arg.frei;
            st.playerMesh.position.set(ort.x, ort.y + 1.2, ort.z);
            st.yaw = yaw;
            st.pitch = -0.45;
            lauf = { name: o.name, vorher: new Set(st.architectures), h0: habe(), n0: zeilen().length, kosten, hotbarAlt, kalt: !gebaut.has(o.name) };
            gebaut.add(o.name);
            window.__eingabeStrom.length = 0;
            return st.hotbar.indexOf(o.name);
        },
        zustand: () => ({
            drawer: st.uiActiveDrawer,
            inv: !!st.inventoryOpen,
            picker: !!document.querySelector(".workshop-picker.open"),
            gewaehlt: st.workshop.selectedBlueprint,
            bauModus: !!(st.buildMode.active && st.buildMode.phantomMesh) && st.buildMode.blueprintName === lauf.name,
            wand: st.buildMode.phantomWand || false,
            toenung: toenung(st.buildMode.phantomMesh),
        }),
        // die Studio-Gestalt des Phantoms (sie heilt den Spender-Geist, sobald das Asset dockt) und je Mesh, ob ein volles
        // Fragment den Alpha-Test übersteht (r184: Alpha × Deckkraft < alphaTest → verworfen)
        async phantom() {
            const bm = st.buildMode;
            for (let i = 0; i < 300 && bm.phantomStudioPending; i++) await new Promise((q) => setTimeout(q, 50));
            const o = { studio: !!bm.phantomMesh.userData.studioGhost, meshes: 0, verworfen: 0, farbe: toenung(bm.phantomMesh).farbe };
            bm.phantomMesh.traverse((m) => m.isMesh && m.material && (o.meshes++, (m.material.transparent ? m.material.opacity : 1) < (m.material.alphaTest || 0) && o.verworfen++));
            return o;
        },
        // der Weg ist zu Ende: das Werk steht, oder der Spieler-Kanal hat gesprochen
        fertig: () => neue().length > 0 || zeilen().length > lauf.n0,
        rezept: (name) => [...document.querySelectorAll("#inventory-recipes .recipe-row")].find((z) => z.querySelector(".recipe-name").textContent === String(st.blueprints[name].label || name)).querySelector("button"),
        lesen() {
            const echt = window.__eingabeStrom.filter((e) => e.echt);
            const h1 = habe();
            const verbraucht = {};
            for (const mt in lauf.kosten) verbraucht[mt] = (lauf.h0[mt] || 0) - (h1[mt] || 0);
            return {
                steht: neue().length,
                eingaben: echt.length,
                unecht: window.__eingabeStrom.length - echt.length,
                folge: echt.map((e) => e.was).join(" · "),
                ms: lauf.standT != null && echt.length ? Math.round(lauf.standT - echt[0].t) : null,
                kalt: lauf.kalt,
                zeile: [...zeilen()].slice(lauf.n0).map((d) => d.textContent).join(" | "),
                verbraucht,
                kosten: lauf.kosten,
                imInventar: inv.some((s) => s && s.blueprintName === lauf.name),
            };
        },
        abschluss() {
            for (const a of neue()) r.removeArchitecture(a);
            aufraeumen();
            lauf.hotbarAlt.forEach((n, i) => st.hotbar[i] !== n && r.setHotbarSlot(i, n));
        },
        ende() {
            clearInterval(takt);
            aufraeumen();
            r.setGameMode(modusAlt);
            r.setCameraMode("first");
            inv.fill(null);
        },
        // ein ungeschmiedetes Gerät mit Kosten (die Spitzhacke, sonst das erste)
        geraet: () =>
            ["klinge_spitzhacke", ...Object.keys(st.blueprints)].find((n) => {
                const b = st.blueprints[n];
                return b && !r._isPlaceableBlueprint(b) && !["armor", "soul", "consumable"].includes(b.role) && !Number.isFinite(b.forgedPrecision) && Object.keys(r.checkBuildCost(n).cost).length;
            }),
        sucheHaus: () => [...document.querySelectorAll("#workshop-list .workshop-list-row")].filter((z) => z.style.display !== "none" && /^haus_/.test(z.dataset.blueprint)).length,
    };
}

// ── L-WERKSTATT, der Spieler (Node): jeder Schritt ein echtes Ereignis (page.keyboard / page.mouse); ein Ziel außerhalb der
// Liste erreicht das Mausrad über ihr, je Raste 100 px und eine Eingabe. ──
const pause = (ms) => new Promise((q) => setTimeout(q, ms));
const bauWeg = (page, fn, ...a) => page.evaluate((f, ...x) => window.__bauWeg[f](...x), fn, ...a);
const taste = async (page, code) => (await page.keyboard.press(code), pause(120));
async function klicke(page, el, liste) {
    for (let i = 0; i < 80 && !(await el.isIntersectingViewport({ threshold: 1 })); i++) {
        const [b, h] = [await el.boundingBox(), await (await page.$(liste)).boundingBox()];
        if (!b || !h) throw new Error(`${liste}: nicht offen`);
        await page.mouse.move(h.x + h.width / 2, Math.max(h.y, 0) + 40);
        await page.mouse.wheel({ deltaY: b.y < Math.max(h.y, 0) ? -100 : 100 });
        await pause(150);
    }
    const b = await el.boundingBox();
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await pause(150);
    return el.evaluate((k) => (k.disabled ? k.title || "gesperrt" : null));
}
const finde = async (page, sel) => (await page.$(sel)) || Promise.reject(new Error(`${sel} fehlt in der UI`));
// Die drei Wege bis zum Bau-Modus bzw. zur Absage; das Setzen (F) folgt in `wegLauf`.
const WEG_FAHRT = {
    async werkstatt(page, name) {
        if ((await bauWeg(page, "zustand")).drawer !== "werkstatt") await taste(page, "KeyB");
        if ((await bauWeg(page, "zustand")).gewaehlt !== name) {
            if (!(await bauWeg(page, "zustand")).picker) await klicke(page, await finde(page, "#workshop-search"), "#workshop-search");
            await klicke(page, await finde(page, `#workshop-list .workshop-list-row[data-blueprint="${name}"]`), "#workshop-list");
        }
        await klicke(page, await finde(page, "#workshop-action-zone .workshop-fertigen"), "#workshop-action-zone");
    },
    async rezeptbuch(page, name) {
        if (!(await bauWeg(page, "zustand")).inv) await taste(page, "Tab");
        return klicke(page, await page.evaluateHandle((n) => window.__bauWeg.rezept(n), name), "#inventory-recipes");
    },
    hotbar: (page, name, slot) => taste(page, `Digit${slot + 1}`),
};
// Ein Lauf: vorbereiten (vor dem Zähler) → der Weg → im Bau-Modus F (confirmBuild) → das Werk steht oder der Kanal spricht.
async function wegLauf(page, o) {
    const slot = await bauWeg(page, "vorbereiten", o);
    const e = {};
    try {
        e.gesperrt = (await WEG_FAHRT[o.weg](page, o.name, slot)) || undefined;
        const z = await bauWeg(page, "zustand");
        Object.assign(e, { bauModus: z.bauModus, farbe: z.bauModus ? z.toenung.farbe : null, lichtung: { wand: z.wand, toenung: z.toenung } });
        if (o.phantom && z.bauModus) e.phantom = await bauWeg(page, "phantom");
        if (z.bauModus) await taste(page, "KeyF");
        if (!e.gesperrt) await page.evaluate(() => window.__gebautNach("der Weg", { fertig: () => window.__bauWeg.fertig() }));
    } catch (err) {
        e.fehler = String((err && err.message) || err);
    }
    Object.assign(e, await bauWeg(page, "lesen"));
    await bauWeg(page, "abschluss");
    return e;
}
async function wegProbe(page, frei) {
    const m = { gestartet: false, wege: {} };
    await page.evaluate(wegHelfer, { frei, teil: WERKE.Teil });
    m.konsum = await bauWeg(page, "konsum");
    for (const lage of LAGEN)
        for (const weg of WEGE)
            for (const [werk, name] of Object.entries(WERKE))
                for (const sicht of SICHTEN) {
                    const phantom = lage === "schöpfer" && weg === "hotbar" && werk === "Eiche" && sicht === "Ego";
                    const e = await wegLauf(page, { lage, weg, name, sicht, phantom });
                    if (phantom) m.phantom = e.phantom;
                    (((m.wege[lage] ||= {})[weg] ||= {})[werk] ||= {})[sicht] = e;
                }
    // Ein Gerät aus der Hotbar in frieden ohne Material: der Griff schmiedet — und sagt, was fehlt.
    const geraet = await bauWeg(page, "geraet");
    m.geraet = { name: geraet, zeile: geraet && (await wegLauf(page, { lage: "frieden ohne Material", weg: "hotbar", name: geraet, sicht: "Ego", slot: 5 })).zeile };
    // Die getippte Suche „haus" in der Werkstatt.
    await bauWeg(page, "vorbereiten", { lage: "schöpfer", name: WERKE.Haus, sicht: "Ego" });
    await taste(page, "KeyB");
    await klicke(page, await finde(page, "#workshop-search"), "#workshop-search");
    await page.keyboard.type("haus", { delay: 40 });
    await pause(200);
    m.sucheHaus = await bauWeg(page, "sucheHaus");
    await bauWeg(page, "abschluss");
    // Die Lichtung: der Spieler mitten auf der Plattform, die Eiche (schöpfer) aus der Hotbar vor ihm.
    const l = await wegLauf(page, { lage: "schöpfer", weg: "hotbar", name: WERKE.Eiche, sicht: "Ego", ort: "lichtung" });
    m.lichtung = Object.assign({ steht: l.steht, zeile: l.zeile }, l.lichtung);
    await bauWeg(page, "ende");
    m.gestartet = true;
    return m;
}

(async () => {
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
        const w0 = wand();
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
            ["der Sonnen-Winkel ein zweites Mal ausgeschrieben", kopfMit("_dayNightApplyStarField", "t * Math.PI * 2 - Math.PI / 2"), "W5"],
            ["die Wurzel würfelt wieder (Befund)", kopfMit("spawnArchitecture", "Math.random()"), "W7"],
            ["der Zähler wird wieder Sitzungs-Feld", kopfMit("_bauSame", "this._bauSameZaehler"), "W7"],
            ["der Broadcast schickt wieder den Samen 0 (Befund)", kopfMit("confirmBuild", '["spawn_blueprint", bm.blueprintName, posNode, 0]'), "W8"],
            ["die Vorschau hasht ihren Samen selbst", kopfMit("_workshopFoundryPreviewGroup", "Math.imul(seedNum, 131)"), "W8"],
            ["ein zweites LCG im Strom-Gesetz", kopfMit("_streamRng", "1664525"), "W9"],
        ]) {
            const rot = wand((t) => stammLib.ersetze(t, [gift]))
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
        const fehlt = "Eiche: fehlt 44× holz · 50× laub — sammeln";
        const gesundG = {
            gestartet: true,
            wege: {},
            konsum: { "Stoff → alphaTest": true },
            geraet: { name: "klinge_spitzhacke", zeile: "Spitzhacke: fehlt 12× eisen — sammeln" },
            phantom: { studio: true, meshes: 2, verworfen: 0, farbe: "grün" },
            sucheHaus: 32,
            lichtung: { wand: "lichtung", steht: 0, zeile: "Eiche: die Lichtung bleibt frei", toenung: { stoffe: 2, lesen: 2, farbe: "rot" } },
        };
        for (const lage of LAGEN)
            for (const weg of WEGE)
                for (const werk of Object.keys(WERKE))
                    for (const sicht of SICHTEN)
                        (((gesundG.wege[lage] ||= {})[weg] ||= {})[werk] ||= {})[sicht] =
                            lage === "frieden ohne Material"
                                ? { eingaben: 2, zeile: fehlt, steht: 0, bauModus: weg === "hotbar", farbe: "rot" }
                                : { eingaben: 3, steht: 1, kosten: KOST, verbraucht: lage === "schöpfer" ? {} : KOST };
        check("Selbst-Test L-Werkstatt: gesund == 0 Täter", wegVerdict(gesundG).length === 0, wegVerdict(gesundG).join(" · "));
        const mitG = (wo, e, b = JSON.parse(JSON.stringify(gesundG))) => (Object.assign(wo.split(" · ").reduce((o, k) => o[k], b.wege), e), b);
        const mitL = (e) => Object.assign(JSON.parse(JSON.stringify(gesundG)), e);
        for (const [name, bruch, soll] of [
            ["ein Weg mit einem zusätzlichen Bestätigungs-Klick", mitG("frieden mit Material · werkstatt · Haus · Third", { eingaben: 4 }), "frieden mit Material · werkstatt · Haus · Third: 4 Eingaben bis zum stehenden Werk"],
            ["das Werk steht per Methoden-Aufruf, ohne Ereignis des Spielers", mitG("pfad · rezeptbuch · GT · Ego", { eingaben: 0 }), "pfad · rezeptbuch · GT · Ego: kein echtes Eingabe-Ereignis"],
            ["ein geschmiedetes Ereignis (isTrusted false)", mitG("schöpfer · hotbar · Teil · Third", { unecht: 1 }), "schöpfer · hotbar · Teil · Third: 1 Ereignis(se) ohne Spieler"],
            ["das Rezeptbuch legt ins Inventar (Befund)", mitG("schöpfer · rezeptbuch · Eiche · Ego", { steht: 0, imInventar: true }), "schöpfer · rezeptbuch · Eiche · Ego: 0 Werk(e) stehen"],
            ["das Rezeptbuch zahlt doppelt", mitG("frieden mit Material · rezeptbuch · Eiche · Ego", { verbraucht: { holz: 88, laub: 100 } }), "frieden mit Material · rezeptbuch · Eiche · Ego: holz 88× gezogen"],
            ["pfad zieht nichts", mitG("pfad · hotbar · Haus · Ego", { verbraucht: {} }), "pfad · hotbar · Haus · Ego: holz 0× gezogen"],
            ["schöpfer zahlt", mitG("schöpfer · hotbar · Eiche · Ego", { verbraucht: { holz: 44 } }), "schöpfer · hotbar · Eiche · Ego: schöpfer zahlt"],
            ["frieden verweigert nur im Log (Befund)", mitG("frieden ohne Material · hotbar · Eiche · Ego", { zeile: "" }), "frieden ohne Material · hotbar · Eiche · Ego: stumme Absage"],
            ["FERTIGEN führt in den Bau-Modus ohne Material", mitG("frieden ohne Material · werkstatt · Eiche · Ego", { bauModus: true }), "frieden ohne Material · werkstatt · Eiche · Ego: der Weg führt in einen Bau-Modus"],
            ["der GT hat keinen Weg", mitG("schöpfer · werkstatt · GT · Ego", { steht: 0, fehler: "fahrzeug_gt fehlt in der UI" }), "schöpfer · werkstatt · GT · Ego: fahrzeug_gt fehlt in der UI"],
            ["grün ohne Material (Auflage 2 der zweiten Gegenprüfung)", mitG("frieden ohne Material · hotbar · Eiche · Ego", { farbe: "grün" }), "das Phantom ohne Material steht grün"],
            ["das Gerät aus der Hotbar verweigert nur im Log", mitL({ geraet: { name: "klinge_spitzhacke", zeile: "" } }), "das Gerät aus der Hotbar verweigert stumm"],
            ["das Phantom ist unsichtbar (Befund Leben-Schau)", mitL({ phantom: { studio: true, meshes: 2, verworfen: 2 } }), "das Phantom ist unsichtbar: 2/2"],
            ["die Suche findet kein Haus (Befund)", mitL({ sucheHaus: 0 }), 'die Suche „haus" findet kein Haus'],
            ["das Phantom färbt sich nicht (Gegenprüfung 08.10.)", mitL({ lichtung: Object.assign({}, gesundG.lichtung, { toenung: { stoffe: 2, lesen: 0, farbe: "rot" } }) }), "das Phantom färbt sich nicht: 0/2"],
            ["das Phantom steht grün über der Lichtung", mitL({ lichtung: Object.assign({}, gesundG.lichtung, { toenung: { stoffe: 2, lesen: 2, farbe: "grün" } }) }), "das Phantom über der Lichtung steht grün"],
            ["die Eiche steht auf der Lichtung", mitL({ lichtung: { wand: false, steht: 1, zeile: "" } }), "auf der Lichtung steht 1 Eiche"],
            ["ein Stoff mit Schwellen-Knoten statt der Zahl (K68-N1)", mitL({ konsum: { "Stoff → alphaTest": false } }), "Konsum: Stoff → alphaTest"],
        ]) {
            const v = wegVerdict(bruch);
            check(`Selbst-Test L-Werkstatt: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        // Der Same des Werks: gesund ohne Täter, je Befund-Zustand der Täter beim Namen.
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
        ]) {
            const v = brennVerdict(bruch);
            check(
                `Selbst-Test Brennglas: ‚${name}' → die Linse nennt ${soll}`,
                v.some((t) => t.startsWith(soll)),
                v.join(" · ")
            );
        }
        // Prüf-Satz: gesund ohne Täter, je Befund am main der Täter beim Namen
        const z = (art, steht) => ({ art, gesetzt: true, steht, neigung: steht ? 0 : 90, fall: 0, zeile: steht ? "" : "X" });
        const gesundP = {
            gestartet: true,
            konsum: { k: true },
            statik: Object.fromEntries(["stabil", "instabil"].flatMap((a) => Object.keys(PRUEF_SATZ[a]).map((k) => [k, z(a, a === "stabil")]))),
            rad: { rad: { weg: 4, hinab: 1, neigung: 170 }, klotz: { weg: 0 } },
            schale: { regen: 0.4, sonne: 0.4, sichtbar: true, loch: 0 },
            gruender: { breit: 0.2, hoch: 0 },
        };
        const mitP = (k, o) => ({ ...gesundP, [k]: { ...gesundP[k], ...o } });
        for (const [bruch, soll] of [
            [gesundP, ""],
            [mitP("statik", { "überlanger Kragarm": z("instabil", true) }), "überlanger Kragarm"],
            [mitP("statik", { Bogen: z("stabil", false) }), "Bogen"],
            [mitP("konsum", { k: false }), "Konsum"],
            [mitP("rad", { rad: { weg: 0, hinab: 0, neigung: 0 } }), "Rad"],
            [mitP("schale", { regen: 0 }), "Schale"],
        ]) {
            const v = pruefVerdict(bruch, gesundB);
            const t = [...v.statik, ...v.wirkung];
            check(`Selbst-Test Prüf-Satz: ${soll || "gesund"} → ${soll ? "Täter" : "0 Täter"}`, soll ? t.some((x) => x.startsWith(soll)) : !t.length, t.join(" · "));
        }
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Werkstatt-Weg-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of wand()) check(name, ok, detail);

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "linse", frist: 600000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await nullRenderer(page, { foundry: true });
    // DER EREIGNIS-STROM: jede Eingabe des Spielers (pointerdown · keydown · wheel), vor jedem Hörer der Seite gefangen
    await page.evaluateOnNewDocument(() => {
        const strom = (window.__eingabeStrom = []);
        for (const typ of ["pointerdown", "keydown", "wheel"])
            window.addEventListener(
                typ,
                (e) =>
                    strom.push({
                        was: typ === "keydown" ? e.code : typ === "wheel" ? "Rad" : "Klick",
                        echt: e.isTrusted,
                        t: performance.now(),
                    }),
                { capture: true, passive: true }
            );
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(probe, { soll: WORT_SOLL, unbekannt: WORT_UNBEKANNT, satz: PRUEF_SATZ });
    try {
        out.weg = await wegProbe(page, out.frei);
    } catch (e) {
        out.weg = { err: (e && e.stack) || String(e) };
    }
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
    fs.mkdirSync(path.join(__dirname, "../artifacts/werkstatt-weg"), { recursive: true });
    fs.writeFileSync(path.join(__dirname, "../artifacts/werkstatt-weg/weg.json"), JSON.stringify(gm, null, 1)); // die Rohdatei
    // je Weg (die tragenden Lagen): stehend / Läufe, Eingaben min–max, Zeit bis zum Werk (kalt: der erste Bau des Werks)
    const jeWeg = WEGE.map((w) => {
        const l = LAGEN.filter((x) => x !== "frieden ohne Material").flatMap((x) => Object.values((gm.wege || {})[x][w]).flatMap(Object.values));
        const n = l.map((e) => e.eingaben);
        return `${w} ${l.filter((e) => e.steht === 1).length}/${l.length} stehen, Eingaben ${Math.min(...n)}–${Math.max(...n)}, max ${Math.max(...l.map((e) => e.ms))} ms (kalt ${l.filter((e) => e.kalt).map((e) => e.ms)})`;
    });
    check(
        "L-Werkstatt jeder Weg (Werkstatt · Rezeptbuch · Hotbar) stellt Eiche, Haus, GT und das eigene Teil-Werk über echte Eingaben in ≤ 3 Schritten — schöpfer, frieden, pfad, Ego und Third; frieden zahlt einmal, jede Absage spricht, die Lichtung sagt warum",
        vG.length === 0,
        `${gm.gestartet ? `${jeWeg.join(" · ")} · Phantom ${JSON.stringify(gm.phantom)} · Suche „haus" ${gm.sucheHaus} · Gerät „${gm.geraet.zeile}" · Lichtung ${JSON.stringify(gm.lichtung)}` : "nicht gestartet"}${vG.length ? ` — Täter (${vG.length}): ` + vG.slice(0, 40).join(", ") : ""}`
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
        `${bm.gestartet ? `Plattform: ${bp_.steht ? `steht nach 480 s (max. Wärme ${bp_.maxWaerme})` : `verbrannt nach ${bp_.verbranntNach} s`} · Linse: glimmt ${bl.glimmtBei} s, brennt ${bl.brenntBei} s („${(bl.zeileBrennt || "").slice(0, 60)}") · Nacht Wärme ${(bm.nacht || {}).waerme} · Kühlung ${(bm.kuehlung || {}).nachFokus} → ${(bm.kuehlung || {}).nachKuehlen}` : "nicht gestartet"}${vB.length ? " — Täter: " + vB.join(", ") : ""}`
    );
    console.log("=== PRÜF-SATZ — STATIK UND WIRKUNG AUS DER FORM, IN DER WELT (Bauen K3) ===");
    const pm = out.pruef || {};
    if (pm.err) check("Prüf-Satz Probe ohne Ausnahme", false, pm.err.split("\n")[0]);
    const vP = pruefVerdict(pm, bm);
    const t = [...vP.statik, ...vP.wirkung];
    check(
        "Prüf-Satz über den Bau-Weg: das Stabile steht nach 150 Takten, das Instabile stürzt sichtbar und nennt den Grund; die Wirkung aus der Form hält",
        !t.length,
        `Statik ${vP.richtig}/10 · Wirkung ${5 - vP.wirkung.length}/5 — ${JSON.stringify(pm).slice(0, 2400)}${t.length ? " — Täter: " + t : ""}`
    );
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
