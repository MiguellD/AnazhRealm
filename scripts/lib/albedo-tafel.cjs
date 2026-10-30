// albedo-tafel.cjs — DIE ALBEDO-TAFEL LABOR ↔ WELT (S1 W1e, Gebot 10: die Klasse beim NAMEN, bevor ein Schnitt fällt).
// Wo das FARB-GESETZ (Lehre 21: Hex = sRGB-Absicht, Albedo = sein linearer Wert) erst im Ofen oder nur in der Welt greift,
// sieht der Schöpfer im Labor eine andere Farbe als im Spiel — die Tafel misst je Klasse BEIDE Seiten mit DERSELBEN Rechnung.
//
// DIE TAFEL (spec/farbe/albedo-tafel.json): je Klasse (Rinde · Laub · Fels · Boden · Haus · Metall/Lack · Haut/Fell ·
// Klinge) ein Exemplar im Labor (Studio · Vorlage · Stoff-Wähler) und in der Welt (Exemplar · Täter-Klasse · Stoff-Wähler),
// gemessen mit EINER Rechnung: Licht = nur ein weißes Umgebungslicht (Lambert: Ausgabe = Albedo), Albedo = Schuss hell −
// Schuss dunkel (Emission und jedes andere Licht fallen heraus), Metall für den Schuss 0 (die Basis-Albedo), gezählt jeder
// geschriebene Pixel (Alpha > 0), ausgewertet von `albedoAuswerten` (scripts/lib/licht-linsen.cjs — Welt und Labor lesen DIESELBE
// Funktion), selbst geeicht an der 18-%-Karte (liest 0,180 auf beiden Seiten). Je Zeile: Labor-Y, Welt-Y, das Verhältnis
// v = Labor / Welt und die Abweichung a = |ln v|.
//   RATSCHE  je Zeile die Abweichung des letzten Nachzugs — eine neue Messung darf nur näher an 1 (a ≤ Ratsche + Messrand);
//            sie ist die Wand, solange W5 (das FARB-GESETZ in jedem Kern) offen ist.
//   SOLL     a ≤ ln(1 + Toleranz) (die Toleranz steht in der Tafel, W5: „Albedo Lab ↔ Welt je Klasse innerhalb einer
//            gesetzten Toleranz") — benannt, gezählt (n von N innerhalb); eine `pflicht`-Zeile hält es selbst.
//   KARTE    je Studio die 18-%-Karte unter dem Labor-Licht: k·L = Belichtung × Leuchtdichte (der Eingang der Tonkurve),
//            Soll: Mittelgrau + 1 EV durch die Kurve der Labore (Tafel `belichtung.kurve`, r128 ACESFilmicToneMapping;
//            `kartenEichung`, scripts/lib/licht-linsen.cjs — dieselbe Rechnung, mit der die Welt ihre Kurve eicht, BELICHTUNG),
//            dazu der Pixel, den der Ausgabe-Weg des Labors zeigt. Ratsche und Soll wie oben.
//
// Werkzeuge:  node scripts/werkbank.cjs albedo --tafel --datei welt.json     (die Welt-Seite, echte GPU, am Ort)
//             node scripts/diag-albedo-tafel.cjs --labor [--echt] --datei labor.json   (die Labor-Seite, r128 je Studio)
//             node scripts/diag-albedo-tafel.cjs --nachziehen welt.json labor.json     (setzt Ist, senkt die Ratsche)
//   Wand:     node scripts/diag-albedo-tafel.cjs [--selftest]   (npm run gate:albedo-tafel)
"use strict";
const fs = require("fs");
const path = require("path");
const { albedoAuswerten, stoffPasst, TAFEL_BLICKE, kartenEichung } = require("./licht-linsen.cjs");

const ROOT = path.resolve(__dirname, "..", "..");
const TAFEL_PFAD = path.join(ROOT, "spec", "farbe", "albedo-tafel.json");

// Die acht Klassen des Studio-Befunds (Synthese §4 W1e) — jede trägt mindestens eine Zeile.
const PFLICHT_GRUPPEN = ["Rinde", "Laub", "Baum", "Fels", "Boden", "Haus", "Metall/Lack", "Haut/Fell", "Klinge"];

// DIE STUDIOS des Labors (r128): Seite, die globalen Namen ihrer Szene, ihres Renderers, ihres Ausgabe-Wegs (der
// Composer oder der Renderer selbst) und die Bereitschaft. Jede Shell legt diese Namen als klassische Globale ab.
const STUDIOS = {
    terrain: {
        pfad: "worlds/terrain/index.html",
        szene: "scene",
        renderer: "renderer",
        ausgabe: "composer",
        wurzel: "subject",
    },
    garage: { pfad: "worlds/garage/index.html", szene: "scene", renderer: "R", ausgabe: null, wurzel: "vehicle" },
    portale: {
        pfad: "worlds/portale/index.html",
        szene: "scene",
        renderer: "renderer",
        ausgabe: "composer",
        wurzel: "gate",
    },
    schmiede: {
        pfad: "worlds/schmiede/index.html",
        szene: "scene",
        renderer: "R",
        ausgabe: "composer",
        wurzel: "weapon",
    },
    fachwerk: {
        pfad: "worlds/fachwerk/index.html",
        szene: "scene",
        renderer: "renderer",
        ausgabe: null,
        wurzel: "houseGroup",
    },
    koerperstudio: {
        pfad: "worlds/koerperstudio/index.html",
        szene: "scene",
        renderer: "renderer",
        ausgabe: "composer",
        wurzel: "character",
    },
    tetrapoda: {
        pfad: "worlds/tetrapoda/index.html",
        szene: "scene",
        renderer: "renderer",
        ausgabe: "composer",
        wurzel: "wolf",
    },
};

// DIE FOLGEN einer Zeile (`welt.folgen` {name: [stufe, klasse]}, S8): je Stufe eine Stufen-Zeile `<id>-<name>` — dasselbe
// Exemplar im Auge der Stufe, nur die Welt (das Labor zeigt die L0, `welt.stufeVon`), die Quellen der Zeile, ihr Ist in `ist.folgen`
function ladeTafel(p) {
    const t = JSON.parse(fs.readFileSync(p || TAFEL_PFAD, "utf8"));
    t.zeilen = t.zeilen.flatMap((z) => [
        z,
        ...Object.entries(z.welt.folgen || {}).map(([n, [stufe, klasse]]) => ({
            ...z,
            id: `${z.id}-${n}`,
            labor: undefined,
            welt: { ...z.welt, exemplar: { ...z.welt.exemplar, stufe }, klasse, stufen: [stufe], stufeVon: z.id },
            ist: ((z.ist || {}).folgen || {})[n] || null,
        })),
    ]);
    return t;
}
function tafelSchreiben(t) {
    for (const z of t.zeilen)
        if (z.welt.stufeVon && z.ist) {
            const b = t.zeilen.find((x) => x.id === z.welt.stufeVon);
            if (b.ist) (b.ist.folgen ||= {})[z.id.slice(b.id.length + 1)] = z.ist;
        }
    fs.writeFileSync(TAFEL_PFAD, JSON.stringify({ ...t, zeilen: t.zeilen.filter((z) => !z.welt.stufeVon) }, null, 4) + "\n");
}

const zahl = (x) => typeof x === "number" && Number.isFinite(x);
const abweichung = (v) => (zahl(v) && v > 0 ? Math.abs(Math.log(v)) : null);

// Das Schema der Tafel. `ist`/`ratsche` dürfen null sein (ungemessen), sonst Zahlen; jede Pflicht-Gruppe trägt eine Zeile.
function tafelPruefen(t) {
    const f = [];
    if (!t || t.version !== 1) f.push("version ist nicht 1");
    if (!(zahl(t.toleranz) && t.toleranz > 0 && t.toleranz < 1)) f.push("toleranz (Soll-Rand Labor/Welt, 0..1) fehlt");
    if (!(zahl(t.messRand) && t.messRand >= 0 && t.messRand < 0.2)) f.push("messRand (Rand der Ratsche, 0..0,2) fehlt");
    if (!t.karte || t.karte.albedo !== 0.18 || !(zahl(t.karte.eichRand) && t.karte.eichRand > 0))
        f.push("karte {albedo 0.18, eichRand} fehlt (die Selbst-Eichung)");
    // DIE UHR-SPALTEN des Stufen-Tons (material.K3): die erste ist die Bühne (Mittag), jede weitere bricht einen Hand-Faktor
    if (!(t.uhren && t.uhren[0] === 0.5)) f.push("uhren fehlen");
    if (!t.belichtung || !(kartenEichung(t.belichtung.kurve) > 0))
        f.push("belichtung.kurve (die Tonkurve der Labore) trägt keine Eichung (kartenEichung)");
    const ids = new Set();
    for (const z of t.zeilen || []) {
        const fz = (x) => f.push(`${z.id}: ${x}`);
        if (!z.id || !/^[a-z][a-z0-9-]*$/.test(z.id) || ids.has(z.id)) f.push(`Zeile ohne/mit doppelter id: ${z.id}`);
        ids.add(z.id);
        if (!PFLICHT_GRUPPEN.includes(z.gruppe)) fz(`gruppe ${z.gruppe} ist keine der acht Klassen`);
        const L = z.labor || {};
        if (!STUDIOS[L.studio] !== !!z.welt.stufeVon) fz(`labor.studio ${L.studio}`);
        const W = z.welt || {};
        try {
            new RegExp(W.klasse);
            if (!W.klasse || !W.klasse.startsWith("^") || !W.klasse.endsWith("$"))
                fz(`welt.klasse ohne Anker ^…$`);
        } catch {
            fz(`welt.klasse ist kein Regex`);
        }
        const ex = W.exemplar || {};
        if (!["architektur", "tier", "mensch", "boden"].includes(ex.typ))
            fz(`welt.exemplar.typ unbekannt`);
        if ((ex.typ === "architektur" || ex.typ === "tier") && !ex.name) fz(`welt.exemplar.name fehlt`);
        if (ex.typ === "boden" && !(Array.isArray(ex.stelle) && ex.stelle.length === 2 && ex.stelle.every(zahl)))
            fz(`welt.exemplar.stelle ist kein [x, z] — der Boden misst an EINER festen Stelle`);
        if (ex.radius !== undefined && !(zahl(ex.radius) && ex.radius > 0))
            fz(`welt.exemplar.radius ist keine Zahl > 0`);
        for (const sel of [L.stoff, W.stoff])
            if (sel)
                for (const k of ["r", "mt", "cc"])
                    if (sel[k] && !(Array.isArray(sel[k]) && sel[k].length === 2 && sel[k].every(zahl)))
                        fz(`Stoff-Wähler ${k} ist kein [min, max]`);
        const ist = z.ist;
        if (ist !== null && ist !== undefined) {
            for (const s of z.labor ? ["labor", "welt"] : ["welt"])
                if (!ist[s] || !zahl(ist[s].Y) || typeof ist[s].rgb !== "string")
                    fz(`ist.${s} {Y, rgb} fehlt`);
            if (z.labor && !zahl(ist.verhaeltnis)) fz(`ist.verhaeltnis fehlt`);
            else if (
                ist.labor &&
                ist.welt &&
                Math.abs(ist.verhaeltnis - ist.labor.Y / ist.welt.Y) > 1e-3 * ist.verhaeltnis
            )
                fz(`ist.verhaeltnis ${ist.verhaeltnis} ist nicht Labor/Welt`);
        }
        if (z.ratsche !== null && z.ratsche !== undefined && !zahl(z.ratsche))
            fz(`ratsche ist weder null noch Zahl`);
        // DIE STUFEN-PFLICHT: eine Welt-Klasse der Foundry (`:L<n>`, der Bau-Satz) erklärt die Stufen ihres Exemplars —
        // eine Klasse, die still weitere Stufen zulässt, misst die gefaltete Stufe
        const wk = String((z.welt && z.welt.klasse) || "");
        const st = z.welt && z.welt.stufen;
        if (/:L|bauSatz/.test(wk) && !(Array.isArray(st) && st.length && st.every((s) => Number.isInteger(s) && s >= 0)))
            fz(`welt.stufen fehlt — die Klasse ${wk} zeigt Foundry-Stufen, die Zeile erklärt keine`);
        // DIE QUELLEN der Zeile: die Kerne und Stamm-Zonen, deren Bytes ihre Albedo tragen — der Stand des Ists
        if (!(Array.isArray(z.quellen) && z.quellen.length && z.quellen.every((d) => typeof d === "string" && d)))
            fz(`quellen fehlen (die Dateien, deren Bytes die Albedo der Zeile tragen)`);
        else
            for (const d of z.quellen)
                if (!fs.existsSync(path.join(ROOT, d))) fz(`Quelle ${d} fehlt im Baum`);
    }
    for (const g of PFLICHT_GRUPPEN)
        if (!(t.zeilen || []).some((z) => z.gruppe === g)) f.push(`die Klasse ${g} trägt keine Zeile`);
    for (const [s, k] of Object.entries(t.karten || {})) {
        if (!STUDIOS[s]) f.push(`karten.${s}: Studio unbekannt`);
        if (k.ist !== null && k.ist !== undefined && !(zahl(k.ist.kL) && k.ist.kL > 0))
            f.push(`karten.${s}: ist.kL fehlt`);
        if (k.ratsche !== null && k.ratsche !== undefined && !zahl(k.ratsche))
            f.push(`karten.${s}: ratsche ist keine Zahl`);
    }
    for (const s of Object.keys(STUDIOS))
        if (!(t.karten || {})[s]) f.push(`karten.${s} fehlt (jedes Studio misst seine Karte)`);
    if (t.gemessen !== null && t.gemessen !== undefined && (!t.gemessen.labor || !t.gemessen.welt))
        f.push("gemessen braucht {labor, welt} (Gerät, Datum, Ort der beiden Seiten)");
    return f;
}

// DER STAND DES ISTS: je Zeile und Seite die EINE Regel der Soll-Tafel (`messStand`) gegen den `kernStand`
// der Messung (`gemessen.welt|labor`): ohne Version, Commit oder Abdruck `ungeprüft`, ein fremder Abdruck `veraltet` — jeder
// fremde beim Namen. `pruefsumme(d)` liest den Baum von heute.
function tafelStand(t, pruefsumme) {
    const { messStand } = require("./abnahme-urteil.cjs");
    const rot = [];
    const g = t.gemessen || {};
    for (const z of t.zeilen || [])
        for (const seite of z.labor ? ["welt", "labor"] : ["welt"]) {
            const q = (g[seite] || {}).quellen || {};
            const s = messStand([g[seite] || {}], z.quellen || [], { pruefsumme });
            const art = /^veraltet/.test(s) ? "veraltet" : "ungeprüft";
            const fremd = art === "ungeprüft" ? [] : z.quellen.filter((d) => q[d] !== pruefsumme(d)).slice(1);
            const auch = fremd.map((d) => `${d} (${q[d]} → ${pruefsumme(d)})`).join(", ");
            if (s)
                rot.push({ zeile: z.id, seite, art, text: `${z.id}: das Ist der ${seite} — ${s}${auch && "; fremd auch " + auch}` });
        }
    return rot;
}
// DIE WAND DES STANDS: ungeprüft bricht, veraltet benannt ohne Bruch; `neu`: die Neumessung.
function standWand(rot) {
    const brueche = rot.filter((r) => r.art !== "veraltet").map((r) => r.text);
    const veraltet = {};
    for (const r of rot) if (r.art === "veraltet") (veraltet[r.zeile] = veraltet[r.zeile] || []).push(r.text);
    return { brueche, veraltet, neu: Object.keys(veraltet) };
}

// DAS URTEIL einer Messung (`messung` = { labor: {id: {Y, rgb}}, welt: {id: {Y, rgb}}, karten: {studio: {kL}},
// eichung: {labor: [Y …], welt: Y} }) gegen die Tafel: je Zeile v, a, Ratsche (ROT, wenn a über der Ratsche + Messrand),
// Soll (innerhalb Toleranz ja/nein). Eine Seite ohne Messung ist ROT (`stumm` — eine stille Linse ist nie grün).
function tafelUrteil(t, messung) {
    const rot = [];
    const randA = Math.log(1 + t.messRand);
    const sollA = Math.log(1 + t.toleranz);
    const zeilen = [];
    const eich = (messung && messung.eichung) || {};
    const eichOk = (y) => zahl(y) && Math.abs(y - t.karte.albedo) <= t.karte.eichRand;
    if (!eichOk(eich.welt)) rot.push({ art: "eichung", text: `Welt-Karte liest ${eich.welt} statt ${t.karte.albedo}` });
    for (const [s, y] of Object.entries(eich.labor || {}))
        if (!eichOk(y)) rot.push({ art: "eichung", text: `Labor-Karte ${s} liest ${y} statt ${t.karte.albedo}` });
    for (const z of t.zeilen) {
        const rz = (art, x) => rot.push({ art, text: `${z.id}: ${x}` });
        const L = messung.labor && messung.labor[z.id];
        const W = messung.welt && messung.welt[z.id];
        const e = { id: z.id, gruppe: z.gruppe, titel: z.titel, labor: L || null, welt: W || null, ratsche: z.ratsche };
        if (z.labor && !(L && zahl(L.Y) && L.Y > 0))
            rz("stumm", `das Labor maß nichts (${(L && L.fehler) || "keine Zeile"})`);
        if (!W || !zahl(W.Y) || !(W.Y > 0))
            rz("stumm", `die Welt maß nichts (${(W && W.fehler) || "keine Zeile"})`);
        // DIE STUFE DES EXEMPLARS: eine Zeile erklärt die Stufen, in denen die Welt ihr Exemplar zeigt
        // (`welt.stufen`); zeichnet der Schuss eine andere, misst er einen anderen Stoff
        const ds = z.welt && Array.isArray(z.welt.stufen) ? z.welt.stufen : null;
        if (ds && W && zahl(W.Y)) {
            // eine leere Liste ist keine Antwort: der Schuss trug keinen Zug mit Stufe (ein ganzer Satz statt seines Exemplars)
            const fremd =
                Array.isArray(W.stufen) && W.stufen.length ? W.stufen.filter((s) => !ds.includes(s)) : null;
            if (!fremd)
                rz("stufe", `die Welt-Messung nennt ihre Stufen nicht (erklärt L${ds.join("/L")})`);
            else if (fremd.length)
                rz("stufe", `die Welt zeichnet das Exemplar in L${W.stufen.join("/L")}, erklärt ist L${ds.join("/L")} — ein anderer Stoff im Schuss`);
        }
        // DER TON DER STUFE (S8): Welt / Welt der Zeile `stufeVon` im Band `stufenToleranz`, zu jeder Uhr der Tafel (die weiteren
        // als `<id>@<uhr>`; eine fehlende Spalte ist stumm, nie grün)
        if (z.welt.stufeVon)
            for (const u of t.uhren) {
                const [Wu, W0] = [z.id, z.welt.stufeVon].map((id) => messung.welt[id + (u === 0.5 ? "" : "@" + u)] || {});
                const v = (e.stufeTon = e.stufeTon || {})[u] = W0.Y > 0 && zahl(Wu.Y) ? +(Wu.Y / W0.Y).toFixed(3) : null;
                if (!(Math.abs(v - 1) <= t.stufenToleranz)) rz("stufen-ton", `Welt/${z.welt.stufeVon} ${v} (Uhr ${u})`);
            }
        if (z.labor && L && W && L.Y > 0 && W.Y > 0) {
            e.verhaeltnis = +(L.Y / W.Y).toFixed(4);
            e.abweichung = +abweichung(e.verhaeltnis).toFixed(4);
            e.imSoll = e.abweichung <= sollA;
            if (zahl(z.ratsche) && e.abweichung > z.ratsche + randA)
                rz("ratsche", `Labor/Welt ${e.verhaeltnis} (|ln| ${e.abweichung}) über der Ratsche ${z.ratsche} + Rand`);
            if (z.pflicht && !e.imSoll) rz("soll", `Labor/Welt ${e.verhaeltnis} außerhalb des Solls`);
        }
        zeilen.push(e);
    }
    const karten = [];
    for (const [s, k] of Object.entries(t.karten || {})) {
        const m = messung.karten && messung.karten[s];
        const e = { studio: s, ist: m || null, ratsche: k.ratsche };
        if (!m || !(m.kL > 0)) rot.push({ art: "stumm", text: `Karte ${s}: das Labor maß keine Karte` });
        else {
            e.verhaeltnis = +(m.kL / kartenEichung(t.belichtung.kurve)).toFixed(4);
            e.abweichung = +abweichung(e.verhaeltnis).toFixed(4);
            e.imSoll = e.abweichung <= sollA;
            if (zahl(k.ratsche) && e.abweichung > k.ratsche + randA)
                rot.push({
                    art: "ratsche",
                    text: `Karte ${s}: k·L ${m.kL} (|ln| ${e.abweichung} zur Eichung der Kurve) über der Ratsche ${k.ratsche}`,
                });
        }
        karten.push(e);
    }
    const imSoll = zeilen.filter((z) => z.imSoll).length;
    const kartenImSoll = karten.filter((k) => k.imSoll).length;
    return {
        urteil: rot.length ? "ROT" : "GRUEN",
        rot,
        zeilen,
        karten,
        soll: {
            zeilen: `${imSoll}/${zeilen.length}`,
            karten: `${kartenImSoll}/${karten.length}`,
            toleranz: t.toleranz,
        },
    };
}

// DER NACHZUG (nur aus einer Messung beider Seiten mit grüner Eichung und ohne stumme Zeile): Ist setzen, die Ratsche
// SENKEN (nie heben — eine Zeile über der Ratsche ist ROT, heben ist ein begründeter Akt von Hand im Commit).
// EINE STUMME ZEILE hält den Nachzug nicht mehr auf: der Stand reist je Messung in die Tafel (`gemessen`, die Wand
// prüft ihn je Zeile), und ein altes Ist unter dem neuen Stand wäre still veraltet — darum FÄLLT ihr Ist (die Wand: „ohne Ist",
// ROT beim Namen), die Ratsche bleibt. Nur eine falsche Eichung zieht nichts.
function tafelNachziehen(t, messung, gemessen) {
    const u = tafelUrteil(t, messung);
    if (u.rot.some((r) => r.art === "eichung")) return { tafel: null, aenderungen: [], u, grund: "Eichung — kein Nachzug" };
    const neu = structuredClone(t);
    const aenderungen = [];
    for (const z of neu.zeilen) {
        const e = u.zeilen.find((x) => x.id === z.id);
        if (!(e && (zahl(e.verhaeltnis) || (!z.labor && e.welt && zahl(e.welt.Y))))) {
            const r = u.rot.find((x) => x.art === "stumm" && x.text.startsWith(`${z.id}:`));
            z.ist = null;
            aenderungen.push(`${z.id}: das Ist fällt (${r ? r.text : "stumm"})`);
            continue;
        }
        // die Stufen der Welt reisen mit dem Ist: die Wand prüft sie gegen `welt.stufen` auch am gespeicherten Stand
        const knapp = (m) => Object.assign({ Y: m.Y, rgb: m.rgb, pixel: m.pixel }, Array.isArray(m.stufen) ? { stufen: m.stufen } : {});
        z.ist = z.labor ? { labor: knapp(e.labor), welt: knapp(e.welt), verhaeltnis: e.verhaeltnis } : { welt: knapp(e.welt) };
        // die Uhr-Spalten der Welt (material.K3): je weitere Uhr ihr Ist `@<uhr>`
        for (const u of neu.uhren.slice(1)) if ((messung.welt[z.id + "@" + u] || {}).Y) z.ist["@" + u] = knapp(messung.welt[z.id + "@" + u]);
        if (z.labor && (z.ratsche == null || e.abweichung < z.ratsche)) {
            aenderungen.push(`${z.id}: ${z.ratsche == null ? "–" : z.ratsche} → ${e.abweichung}`);
            z.ratsche = e.abweichung;
        }
    }
    for (const k of u.karten) {
        const z = neu.karten[k.studio];
        z.ist = { kL: k.ist.kL, ausgabe: k.ist.ausgabe };
        if (z.ratsche == null || k.abweichung < z.ratsche) {
            aenderungen.push(`Karte ${k.studio}: ${z.ratsche == null ? "–" : z.ratsche} → ${k.abweichung}`);
            z.ratsche = k.abweichung;
        }
    }
    neu.gemessen = gemessen;
    return { tafel: neu, aenderungen, u };
}

function tafelTabelle(u) {
    const z = [];
    const pad = (s, n) => String(s).padEnd(n);
    const lpad = (s, n) => String(s).padStart(n);
    z.push(
        `ALBEDO LABOR ↔ WELT ${u.urteil} · im Soll (±${Math.round(u.soll.toleranz * 100)} %): ${u.soll.zeilen} Zeilen, ${u.soll.karten} Karten`
    );
    z.push("");
    z.push(
        pad("Zeile", 14) +
            pad("Klasse", 12) +
            lpad("Labor Y", 9) +
            lpad("Welt Y", 9) +
            lpad("L/W", 8) +
            lpad("Ratsche", 9) +
            "  Soll  Labor rgb · Welt rgb"
    );
    for (const e of u.zeilen)
        z.push(
            pad(e.id, 14) +
                pad(e.gruppe, 12) +
                lpad(e.labor && zahl(e.labor.Y) ? e.labor.Y.toFixed(4) : "–", 9) +
                lpad(e.welt && zahl(e.welt.Y) ? e.welt.Y.toFixed(4) : "–", 9) +
                lpad(zahl(e.verhaeltnis) ? e.verhaeltnis.toFixed(2) : "–", 8) +
                lpad(zahl(e.ratsche) ? e.ratsche.toFixed(3) : "–", 9) +
                "  " +
                pad(e.imSoll ? "ja" : "nein", 5) +
                ` ${(e.labor && e.labor.rgb) || "–"} · ${(e.welt && e.welt.rgb) || "–"}`
        );
    z.push("");
    z.push(
        pad("Karte (18 %)", 16) +
            lpad("k·L", 8) +
            lpad("/Eichung", 9) +
            lpad("Ratsche", 9) +
            "  Soll  Ausgabe-Pixel"
    );
    for (const k of u.karten)
        z.push(
            pad(k.studio, 16) +
                lpad(k.ist && zahl(k.ist.kL) ? k.ist.kL.toFixed(4) : "–", 8) +
                lpad(zahl(k.verhaeltnis) ? k.verhaeltnis.toFixed(2) : "–", 9) +
                lpad(zahl(k.ratsche) ? k.ratsche.toFixed(3) : "–", 9) +
                "  " +
                pad(k.imSoll ? "ja" : "nein", 5) +
                ` ${k.ist && k.ist.ausgabe ? k.ist.ausgabe.join("/") : "–"}`
        );
    z.push("");
    for (const r of u.rot) z.push(`  [${r.art}] ${r.text}`);
    return z.join("\n");
}

// DAS ZIEL DES LABORS (EINE Quelle für Albedo und Karte): ein Halbfloat-Ziel W × H und sein Leser. Die Engine der Welt (r184,
// auch die Garage) liest es als Versprechen, das WebGPU-Backend aufrecht; WebGL (r128 und der WebGL2-Ersatz von r184)
// liest von unten nach oben — die Zeilen kehren um (das Bild steht wie in der Welt). Die Kopie bucht beim Aufruf, das Ziel
// wechselt sofort zurück.
function laborZiel(R, W, H) {
    const T = window.THREE,
        gpu = !!R.isWebGPURenderer,
        gl = gpu ? null : R.getContext();
    if (gl) gl.getExtension("EXT_color_buffer_float");
    const rt = new T[gpu ? "RenderTarget" : "WebGLRenderTarget"](W, H, { type: T.HalfFloatType, depthBuffer: true });
    const lies = async () => {
        let roh = gpu ? R.readRenderTargetPixelsAsync(rt, 0, 0, W, H) : new Float32Array(W * H * 4);
        if (gl) gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, roh);
        R.setRenderTarget(null);
        if (gpu) roh = Float32Array.from(await roh, T.DataUtils.fromHalfFloat);
        if (gpu && R.backend.isWebGPUBackend) return roh;
        const out = new Float32Array(W * H * 4);
        for (let y = 0; y < H; y++) out.set(roh.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
        return out;
    };
    return { gpu, rt, lies };
}

// ── DIE LABOR-LINSE (r128, im Studio): dieselbe Rechnung wie die Welt-Tafel (`__albedoSicht({zeilen})`) ──────────────────
// Der Stoff eines Labor-Materials: seine Art (der Spiegel der Brücken-Zuordnung `__assetMaterialKind`,
// foundry-bruecke.js — die geteilten Pflanzen-Stoffe sind Globale der Brücke, das Labor liest sie; sonst die Look-Klasse des Bäckers
// `userData.__klasse`), Rauheit, Metall, Klarlack und die Seh-Klasse des Gesetzbuchs (`userData.__seh`) — dieselben
// Felder, die die Brücke über die Naht reicht und der Wirt in seinen Stoff-Schlüssel schreibt.
function laborAlbedo(o) {
    return (async () => {
        const T = window.THREE;
        // die strenge CSP der Seiten erlaubt new Function nur im Aufruf von außen, nie nach einem await: jeder Name EINMAL zuerst
        const namen = new Map();
        const g = (n) => (n ? (namen.has(n) ? namen.get(n) : namen.set(n, new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)()).get(n)) : undefined);
        for (const L of (o.zeilen || []).map((z) => z.labor || {})) [L.wurzel, ...(L.nur || []), ...(L.ohne || [])].forEach(g);
        [o.studio.wurzel, "camera"].forEach(g);
        const R = g(o.studio.renderer),
            sc = g(o.studio.szene);
        const W = o.w || 640,
            H = o.h || 400;
        const { gpu, rt, lies } = window.__laborZiel(R, W, H);
        const ARTEN = new Map(
            Object.entries({ barkMat: "bark", barkMatBirch: "bark", foliageMatTex: "foliageTex", foliageMat: "foliage", foliageMatKrone: "foliage", grassMat: "grass", stemMat: "stem" })
                .map(([n, a]) => [g(n), a])
                .filter(([m]) => m)
        );
        const artOf = (m) => ARTEN.get(m) || (m && m.userData && typeof m.userData.__klasse === "string" ? m.userData.__klasse : "unknown");
        const stoffOf = (m) => ({
            kind: artOf(m),
            r: m.roughness,
            mt: m.metalness,
            cc: m.clearcoat || 0,
            seh: (m.userData && m.userData.__seh) || null,
        });
        const matsOf = (x) => (Array.isArray(x.material) ? x.material : [x.material]).filter(Boolean);
        const alleMeshes = [];
        sc.traverse((x) => {
            if (x.isMesh || x.isPoints || x.isLine || x.isSprite) alleMeshes.push(x);
        });
        const unter = (x, w) => {
            for (let p = x; p; p = p.parent) if (p === w) return true;
            return false;
        };
        const karte = new T.Mesh(
            new T.PlaneGeometry(2, 2),
            new T.MeshStandardMaterial({
                color: new T.Color(0.18, 0.18, 0.18),
                roughness: 1,
                metalness: 0,
                side: T.DoubleSide,
            })
        );
        const cam = new T.PerspectiveCamera(35, W / H, 0.01, 4000);
        const amb = new T.AmbientLight(0xffffff, 0);
        const lichter = [];
        sc.traverse((x) => {
            if (x.isLight) lichter.push([x, x.intensity]);
        });
        const alt = {
            fog: sc.fog,
            bg: sc.background,
            env: sc.environment,
            tm: R.toneMapping,
            rt: R.getRenderTarget(),
            vis: new Map(alleMeshes.map((x) => [x, x.visible])),
            matVis: new Map(),
            metall: new Map(),
        };
        // Lambert unter dem Umgebungslicht: r128 trägt π im Legacy-Modus selbst (Ausgabe = Farbe × Albedo), mit
        // physikalischen Lichtern ist die Stärke π nötig — die Karte prüft beides (0,180).
        const AMB = gpu || R.physicallyCorrectLights ? Math.PI : 1;
        const schuss = async (sicht) => {
            for (const x of alleMeshes) x.visible = !!alt.vis.get(x) && sicht(x);
            for (const [l] of lichter) l.intensity = 0;
            sc.fog = null;
            sc.background = null;
            sc.environment = null;
            R.toneMapping = T.NoToneMapping;
            // r184 schreibt die Licht-Stärke einmal je Bild (NodeUpdateType.FRAME): je Pass ein neues Bild, sonst trüge der
            // dunkle Pass das Licht des hellen (gemessen: Tiefschwarz hell = dunkel = 0,0058)
            const pass = async (e) => {
                amb.intensity = e;
                if (gpu) await new Promise((r) => requestAnimationFrame(r));
                R.setRenderTarget(rt);
                R.setClearColor(0x000000, 0);
                R.clear();
                R.render(sc, cam);
                return lies();
            };
            await pass(AMB);
            return { hell: await pass(AMB), dunkel: await pass(0) };
        };
        // Die Stellungen der Kamera: wie in der Welt die TAFEL-BLICKE auf die Hülle der gewählten Züge, oder von oben.
        const stellungenFuer = (sel, blick) => {
            const bb = new T.Box3();
            for (const x of sel) bb.expandByObject(x);
            const c = bb.getCenter(new T.Vector3());
            if (blick === "oben") {
                // Der Boden von oben: der Mittelpunkt ist der Ort des Labor-Blicks (im Wald der Spieler), die Höhe der
                // Strahl auf die gewählten Züge.
                const lc = g("camera") ? g("camera").position : c;
                const ray = new T.Raycaster(new T.Vector3(lc.x, 1e4, lc.z), new T.Vector3(0, -1, 0));
                const hit = ray.intersectObjects(sel, false)[0];
                const y = hit ? hit.point.y : c.y;
                return [[new T.Vector3(lc.x, y + 14, lc.z + 0.01), new T.Vector3(lc.x, y, lc.z)]];
            }
            const rad = Math.max(0.4, bb.getSize(new T.Vector3()).length() / 2);
            // `waagrecht` (der Baum, wie seine Karte in der Welt): die vier Seiten im Horizont, kein Blick von oben
            const w = blick === "waagrecht";
            return window.__tafelBlicke
                .filter((d) => !(w && d[1] > 0.9))
                .map((d) => [c.clone().addScaledVector(new T.Vector3(d[0], w ? 0 : d[1], d[2]).normalize(), rad * 2.6), c]);
        };
        sc.add(amb);
        const ergebnisse = [];
        try {
            for (const z of o.zeilen || []) {
                const L = z.labor || {};
                const wurzel = g(L.wurzel || o.studio.wurzel);
                const nur = (L.nur || []).map(g),
                    ohne = (L.ohne || []).map(g);
                const passtMat = (m) =>
                    window.__stoffPasst(L.stoff || null, stoffOf(m)) &&
                    (!nur.length || nur.includes(m)) &&
                    !ohne.includes(m);
                const sel = alleMeshes.filter(
                    (x) => alt.vis.get(x) && wurzel && unter(x, wurzel) && matsOf(x).some(passtMat)
                );
                if (!sel.length) {
                    ergebnisse.push({
                        id: z.id,
                        pixel: 0,
                        fehler: "kein Zug mit passendem Stoff unter " + (L.wurzel || o.studio.wurzel),
                    });
                    continue;
                }
                // Gemischte Züge (Material-Liste): die fremden Stoffe des Zugs sind für den Schuss unsichtbar.
                for (const x of sel)
                    for (const m of matsOf(x)) {
                        if (!passtMat(m) && !alt.matVis.has(m)) {
                            alt.matVis.set(m, m.visible);
                            m.visible = false;
                        }
                        if (passtMat(m) && z.basis !== false && typeof m.metalness === "number" && !alt.metall.has(m)) {
                            alt.metall.set(m, m.metalness);
                            m.metalness = 0;
                        }
                    }
                const stellungen = stellungenFuer(sel, L.blick);
                const set = new Set(sel);
                const s = {
                    hell: new Float32Array(W * H * 4 * stellungen.length),
                    dunkel: new Float32Array(W * H * 4 * stellungen.length),
                };
                for (const [i, [p, ziel]] of stellungen.entries()) {
                    cam.position.copy(p);
                    cam.lookAt(ziel);
                    cam.updateMatrixWorld(true);
                    const t = await schuss((x) => set.has(x));
                    s.hell.set(t.hell, i * W * H * 4);
                    s.dunkel.set(t.dunkel, i * W * H * 4);
                }
                for (const [m, v] of alt.matVis) m.visible = v;
                alt.matVis.clear();
                for (const [m, v] of alt.metall) m.metalness = v;
                alt.metall.clear();
                const stoffe = [
                    ...new Set(
                        sel.flatMap((x) =>
                            matsOf(x)
                                .filter(passtMat)
                                .map((m) => JSON.stringify(stoffOf(m)))
                        )
                    ),
                ];
                ergebnisse.push(
                    Object.assign(window.__albedoAuswerten(s.hell, s.dunkel, W, H * stellungen.length, 0, z.id), {
                        id: z.id,
                        zuege: sel.length,
                        stoffe,
                    })
                );
            }
            // Die Selbst-Eichung: die 18-%-Karte liest unter demselben Licht 0,180.
            sc.add(karte);
            alleMeshes.push(karte);
            alt.vis.set(karte, true);
            karte.position.set(0, 50, 0);
            karte.updateMatrixWorld(true);
            // BÜHNE: die Karte der Albedo-Tafel 50 m über der Welt
            cam.position.set(0, 50, 2.2);
            cam.lookAt(0, 50, 0);
            cam.updateMatrixWorld(true);
            const sk = await schuss((x) => x === karte);
            ergebnisse.push(window.__albedoAuswerten(sk.hell, sk.dunkel, W, H, 0, "graukarte"));
        } finally {
            for (const [m, v] of alt.matVis) m.visible = v;
            for (const [m, v] of alt.metall) m.metalness = v;
            for (const x of alleMeshes) if (alt.vis.has(x)) x.visible = alt.vis.get(x);
            for (const [l, i] of lichter) l.intensity = i;
            sc.remove(amb);
            sc.remove(karte);
            sc.fog = alt.fog;
            sc.background = alt.bg;
            sc.environment = alt.env;
            R.toneMapping = alt.tm;
            R.setRenderTarget(alt.rt);
            rt.dispose();
        }
        await sleep(0);
        return ergebnisse;
    })();
}

// DIE KARTE IM LABOR: eine waagrechte 18-%-Karte am Ort des Exemplars, allein (alles andere aus, kein Nebel), unter dem
// Licht des Labors wie es steht (Lichter, Umgebung, Belichtung). k·L = Belichtung × Leuchtdichte: die Tonkurve linear
// (r128 `LinearToneMapping` = Belichtung × Farbe) in ein Halb-Float-Ziel. Dazu der Pixel, den der Ausgabe-Weg des Labors
// (sein Composer bzw. der Renderer auf den Schirm) für dieselbe Karte zeigt.
function laborKarte(o) {
    return (async () => {
        const T = window.THREE;
        const g = (n) => (n ? new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)() : undefined);
        const R = g(o.studio.renderer),
            sc = g(o.studio.szene);
        const W = 64,
            H = 64;
        const { rt, lies } = window.__laborZiel(R, W, H);
        const wurzel = g(o.studio.wurzel);
        const bb = new T.Box3();
        if (wurzel) bb.setFromObject(wurzel);
        const c = bb.isEmpty() ? new T.Vector3() : bb.getCenter(new T.Vector3());
        const y0 = bb.isEmpty() ? 0 : bb.min.y + 0.02;
        const karte = new T.Mesh(
            new T.PlaneGeometry(2, 2),
            new T.MeshStandardMaterial({ color: new T.Color(0.18, 0.18, 0.18), roughness: 1, metalness: 0 })
        );
        karte.rotation.x = -Math.PI / 2;
        karte.position.set(c.x, y0, c.z);
        karte.updateMatrixWorld(true);
        const cam = new T.PerspectiveCamera(35, 1, 0.01, 100);
        cam.position.set(c.x, y0 + 2, c.z + 0.001);
        cam.lookAt(c.x, y0, c.z);
        cam.updateMatrixWorld(true);
        const alle = [];
        sc.traverse((x) => {
            if (x.isMesh || x.isPoints || x.isLine || x.isSprite) alle.push(x);
        });
        const vis = new Map(alle.map((x) => [x, x.visible]));
        const alt = { fog: sc.fog, tm: R.toneMapping, rt: R.getRenderTarget() };
        const out = {
            studio: o.studioId,
            belichtung: R.toneMappingExposure,
        };
        try {
            for (const x of alle) x.visible = false;
            sc.add(karte);
            sc.fog = null;
            R.toneMapping = T.LinearToneMapping;
            R.setRenderTarget(rt);
            R.setClearColor(0x000000, 0);
            R.clear();
            R.render(sc, cam);
            const px = await lies(); // die Mitte (Zeilen H/2 ± 4) liest sich in beiden Richtungen gleich
            const s = [0, 0, 0];
            let n = 0;
            for (let y = H / 2 - 4; y < H / 2 + 4; y++)
                for (let x = W / 2 - 4; x < W / 2 + 4; x++) {
                    for (let k = 0; k < 3; k++) s[k] += px[(y * W + x) * 4 + k];
                    n++;
                }
            const m = s.map((v) => v / n);
            out.kL = +luma709(m).toFixed(4);
            out.kLrgb = m.map((v) => +v.toFixed(4)).join("/");
            // Der Ausgabe-Weg des Labors: seine Tonkurve und sein Composer (dessen Pässe kurz auf die Karten-Kamera sehen).
            R.toneMapping = alt.tm;
            const comp = o.studio.ausgabe ? g(o.studio.ausgabe) : null;
            const kams = [];
            const groesse = R.getSize(new T.Vector2());
            cam.aspect = groesse.x / groesse.y;
            cam.updateProjectionMatrix();
            if (comp && comp.passes) {
                for (const p of comp.passes)
                    if (p && p.camera) {
                        kams.push([p, p.camera]);
                        p.camera = cam;
                    }
                comp.render();
            } else R.render(sc, cam);
            const db = R.getDrawingBufferSize(new T.Vector2());
            // der Schirm dieses Takts (WebGL wie WebGPU): eine 2D-Fläche liest seine Mitte
            const k2 = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
            k2.drawImage(R.domElement, Math.floor(db.x / 2), db.y - 1 - Math.floor(db.y / 2), 1, 1, 0, 0, 1, 1); // die Zeile des GL-Lesens
            const u8 = k2.getImageData(0, 0, 1, 1).data;
            out.ausgabe = [u8[0], u8[1], u8[2]];
            for (const [p, k] of kams) p.camera = k;
        } finally {
            for (const x of alle) x.visible = vis.get(x);
            sc.remove(karte);
            sc.fog = alt.fog;
            R.toneMapping = alt.tm;
            R.setRenderTarget(alt.rt);
            rt.dispose();
        }
        return out;
    })();
}

// DIE LABOR-SEITE DER LAUB-LICHT-LINSE (K19, phyto-core `laubDurchlass`, foundry-core RE_Direct_Laub): das Laub des Subjekts
// (foliageMat · foliageMatTex) aus `abstand` m (Augenhöhe 1,7 m, Blick auf die Kronen-Mitte), der Key allein ohne Schatten (Rim · Fill ·
// Back · Hemi · Umgebung schweigen), einmal HINTER der Krone (seine Höhe = die Peilung vom Auge zur Kronen-Mitte), einmal
// hinter dem Auge — wie die Welt-Seite `__laubGegenlicht` unter `nurSonne`. Gezählt jedes Pixel, das beide Lagen zeichnen,
// das Mittel der linearen Luma (Halb-Float, ungetont).
function laborLaubGegenlicht(o) {
    o = o || {};
    const T = window.THREE;
    const g = (n) => new Function(`return typeof ${n} !== "undefined" ? ${n} : undefined;`)();
    const R = g(o.studio.renderer),
        sc = g(o.studio.szene),
        wurzel = g(o.studio.wurzel),
        key = g("keyLight");
    const gl = R.getContext();
    gl.getExtension("EXT_color_buffer_float");
    const W = o.w || 320,
        H = o.h || 240;
    const laubStoffe = [g("foliageMat"), g("foliageMatKrone"), g("foliageMatTex")].filter(Boolean);
    const laub = [],
        alle = [];
    sc.traverse((x) => {
        if (!(x.isMesh || x.isPoints || x.isLine || x.isSprite)) return;
        alle.push(x);
        let unter = false;
        for (let p = x; p; p = p.parent) if (p === wurzel) unter = true;
        if (unter && laubStoffe.includes(x.material)) laub.push(x);
    });
    if (!laub.length || !key) return { fehler: !key ? "kein keyLight" : "kein Laub am Subjekt" };
    wurzel.updateMatrixWorld(true);
    const box = new T.Box3();
    for (const x of laub) box.expandByObject(x);
    const mitte = box.getCenter(new T.Vector3());
    const fuss = new T.Vector3().setFromMatrixPosition(wurzel.matrixWorld);
    // Der Labor-Baum steht in seinem Mass (die Vorlage, nicht das Exemplar der Welt): mit `weltHoehe` rückt das Auge im
    // Verhältnis der Höhen heran — dieselbe Peilung, dieselbe Sonnen-Höhe wie die Welt-Seite.
    const abstand = (o.abstand || 8) * (o.weltHoehe > 0 ? (box.max.y - fuss.y) / o.weltHoehe : 1);
    const auge = new T.Vector3(fuss.x, fuss.y + 1.7, fuss.z + abstand);
    const elev = Math.max(
        (5 * Math.PI) / 180,
        Math.atan2(mitte.y - auge.y, Math.hypot(mitte.x - auge.x, mitte.z - auge.z))
    );
    const cam = new T.PerspectiveCamera(o.fov || 75, W / H, 0.05, 400);
    cam.position.copy(auge);
    cam.lookAt(mitte);
    cam.updateMatrixWorld(true);
    const rt = new T.WebGLRenderTarget(W, H, { type: T.HalfFloatType, format: T.RGBAFormat, depthBuffer: true });
    const lichter = [];
    sc.traverse((x) => {
        if (x.isLight) lichter.push([x, x.intensity]);
    });
    const alt = {
        fog: sc.fog,
        bg: sc.background,
        env: sc.environment,
        tm: R.toneMapping,
        kp: key.position.clone(),
        kt: key.target.position.clone(),
        ks: key.castShadow,
        vis: new Map(alle.map((x) => [x, x.visible])),
    };
    const lies = () => {
        const px = new Float32Array(W * H * 4);
        gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, px);
        return px;
    };
    const dh = new T.Vector3(auge.x - fuss.x, 0, auge.z - fuss.z).normalize();
    const schuss = (gegen) => {
        const sd = dh
            .clone()
            .multiplyScalar((gegen ? -1 : 1) * Math.cos(elev))
            .add(new T.Vector3(0, Math.sin(elev), 0))
            .normalize();
        key.target.position.copy(mitte);
        key.position.copy(mitte.clone().add(sd.multiplyScalar(20)));
        key.target.updateMatrixWorld(true);
        key.updateMatrixWorld(true);
        R.setRenderTarget(rt);
        R.setClearColor(0x000000, 0);
        R.clear();
        R.render(sc, cam);
        const px = lies();
        R.setRenderTarget(null);
        return px;
    };
    try {
        for (const x of alle) x.visible = !!alt.vis.get(x) && laub.includes(x);
        for (const [l, i] of lichter) l.intensity = l === key ? i : 0;
        sc.fog = null;
        sc.background = null;
        sc.environment = null;
        key.castShadow = false; // der Stoff allein, wie die Welt-Seite unter `nurSonne`
        R.toneMapping = T.NoToneMapping;
        schuss(true);
        const ge = schuss(true),
            au = schuss(false);
        let sg = 0,
            sa = 0,
            n = 0;
        for (let i = 0; i < W * H; i++)
            if (ge[i * 4 + 3] > 0 && au[i * 4 + 3] > 0) {
                sg += luma709(ge, i * 4);
                sa += luma709(au, i * 4);
                n++;
            }
        // das Bild je Lage (sRGB, Rest magenta; WebGL liest von unten)
        const png = (px) => {
            const img = { data: new Uint8ClampedArray(W * H * 4) };
            const enc = (v) => Math.round(255 * Math.min(1, linSrgb(v)));
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++) {
                    const i = ((H - 1 - y) * W + x) * 4,
                        q = (y * W + x) * 4;
                    const da = px[i + 3] > 0;
                    img.data[q] = da ? enc(px[i]) : 255;
                    img.data[q + 1] = da ? enc(px[i + 1]) : 0;
                    img.data[q + 2] = da ? enc(px[i + 2]) : 255;
                    img.data[q + 3] = 255;
                }
            return window.__png(img.data, W, H);
        };
        return {
            bilder: o.bilder ? { gegen: png(ge), auf: png(au) } : undefined,
            abstand: +abstand.toFixed(1),
            sonneGrad: +((elev * 180) / Math.PI).toFixed(1),
            hoehe: +(box.max.y - fuss.y).toFixed(1),
            pixel: n,
            gegen: { Y: n ? +(sg / n).toFixed(4) : null },
            auf: { Y: n ? +(sa / n).toFixed(4) : null },
            verhaeltnis: n && sa > 0 ? +(sg / sa).toFixed(3) : null,
        };
    } finally {
        for (const x of alle) x.visible = alt.vis.get(x);
        for (const [l, i] of lichter) l.intensity = i;
        sc.fog = alt.fog;
        sc.background = alt.bg;
        sc.environment = alt.env;
        R.toneMapping = alt.tm;
        key.position.copy(alt.kp);
        key.target.position.copy(alt.kt);
        key.castShadow = alt.ks;
        key.target.updateMatrixWorld(true);
        key.updateMatrixWorld(true);
        rt.dispose();
    }
}

const LABOR_INSTALL =
    require("./abnahme-urteil.cjs").ABNAHME_INSTALL +
    `window.__laborLaub = ${laborLaubGegenlicht.toString()};` +
    `window.__albedoAuswerten = ${albedoAuswerten.toString()};` +
    `window.__stoffPasst = ${stoffPasst.toString()};` +
    `window.__tafelBlicke = ${JSON.stringify(TAFEL_BLICKE)};` +
    `window.__laborZiel = ${laborZiel.toString()};` +
    `window.__laborAlbedo = ${laborAlbedo.toString()};` +
    `window.__laborKarte = ${laborKarte.toString()};`;

module.exports = {
    PFLICHT_GRUPPEN,
    STUDIOS,
    ladeTafel,
    tafelSchreiben,
    tafelPruefen,
    tafelStand,
    standWand,
    tafelUrteil,
    tafelNachziehen,
    tafelTabelle,
    abweichung,
    LABOR_INSTALL,
};
