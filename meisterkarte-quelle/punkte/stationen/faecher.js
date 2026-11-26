// DER FÄCHER (Meta-Gesetz M4, vision/TIEFE-DER-GESETZE.md: „der Richter ist selbst eine Adresse“) — EIN Urteil ist ein Prädikat über
// die Funktion, die das Spiel liest, an einem FÄCHER von Adressen (Saaten × Orte × Zeiten): Funktionsrufe in der EINEN warmen Welt der
// Sitzung, nie eine Welt je Saat, nie eine Bühne je Sprosse (M6: das Spiel liest dieselbe Funktion, die der Richter ruft). Vorher: die
// Front von 63 Sprossen stand ROT „Umfang nicht erzeugbar“, weil die Bühne EINE Saat, EINE Stadt, EINEN Spieler trägt; das Muster war
// mensch.wirtschaft.technik#1 (20 Saaten als Funktionsrufe, die Station 0,1 s).
//
// EINE Station nennt vier Dinge, die Bauart rechnet den Rest:
//   gesetz   { fn, export, leser } — fn: die Seiten-Funktion (r, T, a, mit) → der Wert des Gesetzes an EINER Adresse a = { saat, ort,
//            zeit } (sie RUFT den Export, den das Spiel liest, und rechnet ihn nie nach; trägt die Welt die Fähigkeit nicht, gibt sie
//            { fehlt: "<was>" }); export: „<datei>:<zeile> <name>“ (was fn ruft); leser: „<datei>:<zeile>“ (wo das Spiel ihn liest)
//   adressen { saaten: N | [..], orte: [..], zeiten: [..], dazu: [..] } — das kartesische Produkt, dazu einzelne Adressen
//   masse    { key: { wie, feld, nur, x, y } } — das Prädikat: je Maß die Verdichtung über den Fächer (WIE unten oder eine Funktion);
//            feld liest den Wert („a.<feld>“ die Adresse), nur wählt Adressen (ein Feld der Adresse oder eine Funktion (a, w));
//            die Schwelle steht an der Sprosse der Karte, nie hier
//   schlecht { feld, richtung: "max" | "min" } und pose(a, w) — die schlechteste Adresse des Fächers und die Pose EINES Bilds dort
// Was der Fächer nicht misst, nennt die Station in `ungemessen` (je ein Satz mit Grund) — die Akte trägt es, nie still.
//
// Der Rahmen gibt nur das Auge der Welt: ev(code, ms) — K.welt (k2-mensch.js), L.ev (k2-same.js), H.seite (k2-planet.js). Die Bauart
// reist als Text (H.seite.FAECHER in K und L, `faecher: true` im Planet-Kern) und sieht nichts aus diesem Modul.
"use strict";

const FAECHER = async (ev, f) => {
    // DER KERN IN DER SEITE: jede Adresse ein Ruf des Gesetzes; ein Wurf ist der Wert dieser Adresse (beim Namen), die Frist lässt den
    // Rest UNGEMESSEN (gezählt, nie geraten)
    const KERN = async (r, T, arg, wert) => {
        const t0 = performance.now();
        const bis = t0 + arg.ms;
        const liste = [];
        for (const saat of arg.saaten.length ? arg.saaten : [null])
            for (const ort of arg.orte.length ? arg.orte : [null])
                for (const zeit of arg.zeiten.length ? arg.zeiten : [null]) if (saat != null || ort != null || zeit != null) liste.push({ saat, ort, zeit });
        for (const a of arg.dazu) liste.push(a);
        const je = [];
        let gerissen = 0;
        for (const a of liste) {
            if (performance.now() > bis) {
                gerissen++;
                continue;
            }
            try {
                je.push({ a, w: await wert(r, T, a, arg.mit) });
            } catch (e) {
                je.push({ a, fehler: String((e && e.message) || e).split("\n")[0].slice(0, 200) });
            }
        }
        return { je, gerissen, ms: Math.round(performance.now() - t0) };
    };
    const A = f.adressen || {};
    const reihe = (x) => (x == null ? [] : typeof x === "number" ? Array.from({ length: x }, (_, i) => i + 1) : x);
    const arg = { saaten: reihe(A.saaten), orte: A.orte || [], zeiten: A.zeiten || [], dazu: A.dazu || [], mit: f.mit || {}, ms: f.ms || 40000 };
    const t = Date.now();
    const roh = await ev("return await (" + KERN + ")(r, T, " + JSON.stringify(arg) + ", " + f.gesetz.fn + ");", arg.ms + (f.zugabe || 3000));
    if (!roh || !Array.isArray(roh.je)) throw new Error("der Fächer kam ohne Antwort aus der Welt");
    const lies = (x, p) => (p == null ? x.w : String(p).startsWith("a.") ? x.a[String(p).slice(2)] : String(p).split(".").reduce((o, k) => (o == null ? undefined : o[k]), x.w));
    const zahl = (v) => v.filter((x) => typeof x === "number" && Number.isFinite(x));
    // DIE VERDICHTUNG (das feste Vokabular des Prädikats)
    const WIE = {
        summe: (v) => zahl(v).reduce((s, x) => s + x, 0),
        max: (v) => (zahl(v).length ? Math.max(...zahl(v)) : null),
        min: (v) => (zahl(v).length ? Math.min(...zahl(v)) : null),
        mittel: (v) => (zahl(v).length ? zahl(v).reduce((s, x) => s + x, 0) / zahl(v).length : null),
        anteil: (v) => (v.length ? v.filter(Boolean).length / v.length : null),
        anzahl: (v) => v.length,
        verschieden: (v) => new Set(v.map((x) => JSON.stringify(x))).size,
        erste: (v) => v.find((x) => x != null),
        zaehle: (v) => {
            const o = {};
            for (const x of v) for (const k in x || {}) o[k] = (o[k] || 0) + x[k];
            return o;
        },
        // die Steigung der Geraden y über x (kleinste Quadrate) — v sind Paare [x, y]
        steigung: (v) => {
            const p = v.filter((q) => Array.isArray(q) && zahl(q).length === 2);
            if (p.length < 2) return null;
            const mx = p.reduce((s, q) => s + q[0], 0) / p.length, my = p.reduce((s, q) => s + q[1], 0) / p.length;
            const sxx = p.reduce((s, q) => s + (q[0] - mx) * (q[0] - mx), 0);
            return sxx > 0 ? p.reduce((s, q) => s + (q[0] - mx) * (q[1] - my), 0) / sxx : null;
        },
    };
    const gut = roh.je.filter((x) => !x.fehler && !(x.w && x.w.fehlt));
    const fehler = roh.je.filter((x) => x.fehler);
    const fehlt = roh.je.filter((x) => !x.fehler && x.w && x.w.fehlt);
    const werte = {};
    for (const [k, m] of Object.entries(f.masse || {})) {
        const aus = gut.filter((x) => !m.nur || (typeof m.nur === "function" ? m.nur(x.a, x.w) : x.a[m.nur] != null));
        const v = aus.map((x) => (m.x != null ? [lies(x, m.x), lies(x, m.y)] : lies(x, m.feld))).filter((x) => x !== undefined);
        if (typeof m.wie !== "function" && !WIE[m.wie]) throw new Error("der Fächer kennt die Verdichtung „" + m.wie + "“ nicht (" + Object.keys(WIE).join(" · ") + ")");
        werte[k] = typeof m.wie === "function" ? m.wie(v, aus) : WIE[m.wie](v);
    }
    let schlecht = null;
    if (f.schlecht) {
        const s = f.schlecht, v = (x) => +lies(x, s.feld);
        for (const x of gut) if (Number.isFinite(v(x)) && (!schlecht || (s.richtung === "min" ? v(x) < v(schlecht) : v(x) > v(schlecht)))) schlecht = x;
    }
    const pose = schlecht && f.pose ? f.pose(schlecht.a, schlecht.w) : null;
    const n = roh.je.length + roh.gerissen;
    const teile = [arg.saaten.length && arg.saaten.length + " Saaten", arg.orte.length && arg.orte.length + " Orte", arg.zeiten.length && arg.zeiten.length + " Zeiten"].filter(Boolean);
    const kurz = (x) => JSON.stringify(x).slice(0, 80);
    // DIE AKTE: Umfang, Zeit, der Leser im Spiel und das Gesetz, was warf, was fehlt, was ungemessen blieb, die schlechteste Adresse —
    // der Leser vorn: der Rahmen K kürzt den Beleg auf 300 Zeichen (technik#1 verlor ihn am 23.11. hinter dem Bild der Saaten)
    const akte = "Fächer " + gut.length + "/" + n + " Adressen (" + (teile.join(" × ") || "—") + (arg.dazu.length ? " + " + arg.dazu.length : "") + ") in " + roh.ms + " ms · Leser " + f.gesetz.leser +
        " · Gesetz " + f.gesetz.export + (fehler.length ? " · " + fehler.length + " warfen (" + fehler[0].fehler + ")" : "") + (fehlt.length ? " · " + fehlt.length + " ohne Fähigkeit (" + fehlt[0].w.fehlt + ")" : "") +
        (roh.gerissen ? " · " + roh.gerissen + " an der Frist ungemessen" : "") + (schlecht ? " · schlechteste " + kurz(schlecht.a) + " " + f.schlecht.feld + " " + lies(schlecht, f.schlecht.feld) : "") +
        (pose ? " · Bild dort " + (typeof pose === "string" ? pose : kurz(pose)) : "") + ((f.ungemessen || []).length ? " · ungemessen: " + f.ungemessen.join("; ") : "");
    // KEINE GUTE ADRESSE IST KEIN MASS (26.11., planet.kosmos.systeme#1: alle 1 460 Adressen warfen „MOND_EPHEMERIDE is not defined“,
    // die Station las `werte.x` null und warf selbst „reading 'toFixed'“ — der Grund stand in keiner Zeile, die das Lauf-Log bewahrt).
    // Warf JEDE gelaufene Adresse, ist der Wurf das, was fehlt: jede Station mit der Wache `R.fehlt` urteilt damit beim Namen.
    const leer = !gut.length && !fehlt.length && fehler.length ? "der Fächer maß an keiner Adresse: " + fehler.length + " von " + n + " warfen (" + fehler[0].fehler + ")" : null;
    return { werte, gemessen: gut.length, adressen: n, fehler, fehlt: fehlt.length ? fehlt[0].w.fehlt : leer, fehltAn: fehlt.map((x) => x.a), gerissen: roh.gerissen, ms: roh.ms, msGesamt: Date.now() - t, schlecht, pose, akte, je: gut };
};

module.exports = { FAECHER };
