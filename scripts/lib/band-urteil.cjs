// band-urteil.cjs — DAS URTEIL DER BAND-LINSE (W0): der Zensus eines Messorts (Klasse × Stufe × Pass, aus
// scripts/lib/draw-zaehler.cjs, die Klasse ist die Täter-Klasse des Stamms), der VRAM je Erzeuger und die GPU-Zeit
// gegen den Haushalt (spec/profiband/haushalt.json) und die Ratsche des Orts (`messorte[].ratsche`: ratsche.json die
// Mess-Wiese, ratsche-genesis.json der Genesis-Ring) → die Tabelle
// Ist/Soll/Täter und ZWEI Urteile:
//
//   BAND     das Profi-Band selbst (Befehle · Dreiecke · VRAM · GPU-Zeit je Frame): ROT, solange ein Ist darüber liegt
//            — die Zahl, die jede Welle senkt (Pflicht-OFFEN E). Nie grün gefärbt, wenn es überschritten ist.
//   LINSE    was die Messung selbst bricht oder einen Rückschritt zeigt:
//     unbenannt  ein Befehl ohne Täter-Namen (`UNBENANNT:<type>`), ein Textur-Objekt ohne Erzeuger (Textur-Zensus)
//                oder GPU-Bytes ohne Erzeuger (`tex:?` im VRAM-Abgriff)
//     haushalt   ein benannter Täter, den keine Haushalt-Klasse nimmt — es gibt keine Sammelzeile: jede neue Klasse
//                einer Welle braucht ihre Regel (die stille Rest-Zeile nahm `bodenSatz` als „Einzelstück")
//     stufe      eine Nah-Stufe in der Ferne (die `stufenWand` des Haushalts — der stille L0-Rückfall)
//     ratsche    eine Klasse × Pass (oder ein VRAM-Erzeuger, oder die Summe) über ihrem letzten Ist plus Toleranz
//     leck       VRAM, den kein Bild trägt: Geometrie-Puffer, die nur der Foundry-Cache (`buf:ruhend`) oder nur r184s
//                Attribut-Register (`buf:verwaist`) hält — der Täter beim Namen (W6)
//
// Die RATSCHE zieht nur die HÜLLE einer Mess-Serie nach (`werkbank ratsche`: ≥ 4 eingeschwungene Läufe der vollen
// Welt aus Erst- und Zweit-Boot, je Klasse × Pass das Maximum) und nur ohne Linsen-Fehler (unbenannt · haushalt ·
// ratsche); ein Stufen-Befund ist eine Kosten-Wahrheit, die Ratsche hält ihn fest, bis die Stufe fällt.
// Eine FREIE Klasse (`ratsche.frei`, je Grund mit dem Gate der Kosten je Einheit) misst den Weltzustand — die Tiere
// wandern —, die Ratsche hält sie nicht und die Summen-Ratsche zählt nur die gebundenen Klassen; im Band zählt sie voll.
//
//   Werkbank:  node scripts/werkbank.cjs umstellen --ort <id> · band --ort <id>   (die echte Messung am Ort, echte GPU)
//              node scripts/werkbank.cjs ratsche --ort <id> <band-*.json …>   (die Ratsche des Orts aus der Hülle einer Serie)
//   Wand:      node scripts/diag-profiband.cjs              (Schema, Summe <= Band, Selbsttests gegen injizierte Fälle)
"use strict";
const fs = require("fs");
const path = require("path");
const { vramFalte } = require("./draw-zaehler.cjs");

const SPEC = path.join(__dirname, "..", "..", "spec", "profiband");

// DIE MESSORTE (S1 W1f): das Band gilt überall, gemessen wird an benannten Orten — die Mess-Wiese (W0, Wald und
// Wiese fern vom Ursprung) und der Genesis-Ring (die Ankunft: zehn Kern-Portale, die Vorschauen). Je Ort Spieler,
// Blick, Dorf-Zug, Ort-Takt und seine EIGENE Ratsche (die Kosten zweier Orte sind zwei Hüllen, nie eine). Ohne Wahl
// gilt der erste Ort (die Mess-Wiese, die Serie seit 04.10.).
function ortOf(haushalt, id) {
    const orte = (haushalt && haushalt.messorte) || [];
    const o = id == null ? orte[0] : orte.find((x) => x.id === id);
    if (!o) throw new Error(`unbekannter Messort „${id}" (messorte: ${orte.map((x) => x.id).join(", ")})`);
    return o;
}

function ladeSpec(ortId) {
    const haushalt = JSON.parse(fs.readFileSync(path.join(SPEC, "haushalt.json"), "utf8"));
    const ort = ortOf(haushalt, ortId);
    return {
        haushalt,
        ort,
        ratsche: JSON.parse(fs.readFileSync(path.join(SPEC, ort.ratsche), "utf8")),
    };
}

// Die Ratsche eines Orts schreiben (`werkbank ratsche --ort <id>`): dieselbe Form wie gelesen.
function schreibeRatsche(ort, ratsche) {
    fs.writeFileSync(path.join(SPEC, ort.ratsche), JSON.stringify(ratsche, null, 4) + "\n");
}

// Der Blick eines Orts als Gier des Stamms: die Kamera sieht entlang (sin yaw, 0, cos yaw) (gemessen an der Welt:
// yaw 0 → +z, π/2 → +x), also yaw = atan2(dx, dz) zum Blickpunkt.
function ortGier(ort) {
    return Math.atan2(ort.blick[0] - ort.spieler[0], ort.blick[1] - ort.spieler[1]);
}

// Das Schema der Messorte: eindeutige ids, Spieler und Blick als [x, z], der Dorf-Zug als Wahrheitswert, der Ort-Takt
// als Liste von Stamm-Methoden (die Wand H6 in diag-profiband prüft, dass der Stamm sie trägt), die Ratsche als Datei
// in spec/profiband, die Soll-Zeilen benannt.
function messortePruefen(h) {
    const f = [];
    const orte = h && h.messorte;
    if (!Array.isArray(orte) || !orte.length) return ["messorte fehlt (mindestens ein Ort)"];
    const ids = new Set();
    const dateien = new Set();
    const xz = (v) => Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === "number" && Number.isFinite(n));
    for (const o of orte) {
        if (!o || typeof o.id !== "string" || !/^[a-z][a-z0-9-]*$/.test(o.id) || ids.has(o.id))
            f.push(`Messort ohne/mit doppelter id: ${o && o.id}`);
        ids.add(o && o.id);
        if (!o.titel) f.push(`${o.id}: titel fehlt`);
        if (!xz(o.spieler)) f.push(`${o.id}: spieler ist kein [x, z]`);
        if (!xz(o.blick)) f.push(`${o.id}: blick ist kein [x, z]`);
        else if (xz(o.spieler) && Math.hypot(o.blick[0] - o.spieler[0], o.blick[1] - o.spieler[1]) < 1)
            f.push(`${o.id}: blick liegt auf dem Spieler (keine Richtung)`);
        if (typeof o.dorfZug !== "boolean") f.push(`${o.id}: dorfZug ist kein Wahrheitswert`);
        if (!Array.isArray(o.ortTakt) || o.ortTakt.some((m) => typeof m !== "string" || !/^_?[A-Za-z]\w*$/.test(m)))
            f.push(`${o.id}: ortTakt ist keine Liste von Methoden-Namen`);
        if (typeof o.ratsche !== "string" || !/^ratsche(-[a-z0-9-]+)?\.json$/.test(o.ratsche))
            f.push(`${o.id}: ratsche ist keine Datei ratsche[-<ort>].json`);
        else if (dateien.has(o.ratsche)) f.push(`${o.id}: die Ratsche ${o.ratsche} trägt schon ein anderer Ort`);
        else if (!fs.existsSync(path.join(SPEC, o.ratsche))) f.push(`${o.id}: die Ratsche ${o.ratsche} fehlt`);
        dateien.add(o.ratsche);
        for (const s of o.soll || [])
            if (!s.name || !s.quelle || !(s.dreieckeJeTor > 0) || !s.art || !Number.isInteger(s.stufe) || !s.pass)
                f.push(`${o.id}: Soll-Zeile ohne name/art/stufe/pass/dreieckeJeTor/quelle`);
    }
    return f;
}

const familieOf = (klasse) => {
    const m = /^(f|fimp|fscatter|g):/.exec(klasse);
    return m ? m[1] : null;
};
const istUnbenannt = (klasse) => /^UNBENANNT:/.test(klasse);
const ganz = (x) => Number.isInteger(x) && x >= 0;
const nullOderZahl = (x) => x === null || (typeof x === "number" && Number.isFinite(x) && x >= 0);
const LINSEN_ARTEN = ["unbenannt", "haushalt", "ratsche", "leck"];
// DER SPEICHER OHNE BILD (W6): ein Geometrie-Puffer, den kein Objekt des Szenen-Graphen zeichnet und den nur der Foundry-Cache
// (`ruhend`) oder nur r184s Attribut-Register (`verwaist`) hält (`__pufferZensus`, draw-zaehler) — VRAM an der Geschichte
// statt am Schirm. Jedes MB davon ist ein LECK, der Täter steht im Urteil beim Namen.
const LECK_ERZEUGER = /^buf:(ruhend|verwaist)$/;
// Eine FREIE Klasse misst den Weltzustand, nicht die Kosten (die Tiere wandern: an der Mess-Wiese 0 bis 3 Arten im Bild):
// die Ratsche hält sie nicht, ihre Kosten je Einheit hält das Gate, das ihr Grund nennt. Im Band zählt sie voll.
const freiGrund = (ratsche, id) => (ratsche && ratsche.frei && ratsche.frei[id]) || null;

function regelPasst(regel, e) {
    if (regel.muster && !new RegExp(regel.muster).test(e.klasse)) return false;
    if (regel.familie && !regel.familie.includes(e.familie)) return false;
    if (regel.art && !regel.art.includes(e.art)) return false;
    if (regel.stufe && !regel.stufe.includes(e.stufe)) return false;
    return true;
}

// Der Täter-Schlüssel eines Zensus-Eintrags (draw-zaehler `klassen[]`: klasse · stufe · art) — das EINE Eingangs-Format
// von `zuordnen` (Band-Urteil und GPU-Zerlegung ordnen über dieselbe Regel).
const einOf = (e) => ({ klasse: e.klasse, familie: familieOf(e.klasse), stufe: e.stufe, art: e.art || null });

// Die Haushalt-Klasse eines Täter-Schlüssels: die erste Klasse, deren Regel passt; sonst keine (ROT `haushalt`).
function zuordnen(haushalt, e) {
    if (istUnbenannt(e.klasse)) return null;
    for (const k of haushalt.klassen) if ((k.regeln || []).some((r) => regelPasst(r, e))) return k.id;
    return null;
}

// Der Erzeuger eines VRAM-Schlüssels (`tex:<label> <format> <größe>` · `buf:<label>`): das gefaltete Label
// (`vramFalte`, dieselbe Regel wie der Abgriff — idempotent) bis zum ersten `:`/`#` (die Karten tragen
// `karte-albedo:<preset>|…`, r184 `bindingBuffer<id>_…`); `?` = ohne Namen.
// Die Geometrie der Tiere (`buf:szene:tier:<seele>`) ist ihr eigener Erzeuger `buf:tier`: sie misst den Weltzustand (die
// Tiere wandern an der Mess-Wiese um den Spieler, 0 bis 10 MB) — die freie Klasse `tier` trägt auch im Speicher keine Ratsche.
function erzeugerOf(k) {
    const m = /^(tex|buf):(\S*)/.exec(String(k));
    if (!m) return { art: "?", erzeuger: "?" };
    const label = m[2] ? vramFalte(m[2]) : "?";
    if (m[1] === "buf" && /^szene:tier:/.test(label)) return { art: "buf", erzeuger: "tier" };
    return { art: m[1], erzeuger: label === "?" ? "?" : label.split(/[:#]/)[0] || "?" };
}
// Ein VRAM-Erzeuger einer FREIEN Klasse (`buf:<id>` mit `ratsche.frei[id]`): Weltzustand, keine Ratsche.
const vramFrei = (ratsche, erzeuger) => {
    const m = /^buf:(.+)$/.exec(erzeuger);
    return !!(m && freiGrund(ratsche, m[1]));
};

// DIE PROBEN EINER MESSUNG: je Klasse × Pass das MAXIMUM über die Zähl-Frames (der teuerste Frame, den der Spieler an
// diesem Ort sieht — die Tiere wandern, der Takt rechnet zwischen den Proben weiter), dMax ebenso.
function zensusMax(proben) {
    const je = new Map();
    for (const z of proben)
        for (const e of z.klassen || []) {
            const a = je.get(e.klasse);
            if (!a) {
                je.set(e.klasse, JSON.parse(JSON.stringify(e)));
                continue;
            }
            for (const [p, c] of Object.entries(e.je || {})) a.je[p] = Math.max(a.je[p] || 0, c);
            for (const [p, t] of Object.entries(e.jeTris || {})) a.jeTris[p] = Math.max(a.jeTris[p] || 0, t);
            if (Number.isFinite(e.dMax)) a.dMax = Number.isFinite(a.dMax) ? Math.max(a.dMax, e.dMax) : e.dMax;
            if (Number.isFinite(e.dMin)) a.dMin = Number.isFinite(a.dMin) ? Math.min(a.dMin, e.dMin) : e.dMin;
            a.inst = Math.max(a.inst || 0, e.inst || 0);
        }
    const klassen = [...je.values()];
    for (const k of klassen) {
        k.cmd = Object.values(k.je || {}).reduce((s, x) => s + x, 0);
        k.tris = Object.values(k.jeTris || {}).reduce((s, x) => s + x, 0);
    }
    klassen.sort((a, b) => b.cmd - a.cmd);
    return { klassen, proben: proben.length, unbenannt: proben.flatMap((z) => z.unbenannt || []).slice(0, 24) };
}

// DIE HÜLLE EINER MESS-SERIE (`werkbank ratsche <band-*.json…>`): die volle Welt schwankt auch eingeschwungen von Lauf
// zu Lauf (ein Bau an der Cull-Kante, die Schatten-Werfer der Streu, die Stufen der Fern-Streu, Erst- gegen Zweit-
// Boot) — die Ratsche nimmt darum nie einen Lauf, sondern die obere Hülle einer Serie: je Klasse × Pass das Maximum
// über alle Proben aller Läufe, der VRAM je Erzeuger und gesamt ebenso. `laeufe` = [{ zensus: [Klassen], vram,
// texturen }] (das `roh` der Band-Messung).
function bandHuelle(laeufe) {
    const zensus = zensusMax(laeufe.map((l) => ({ klassen: l.zensus || [] })));
    // Der VRAM je ERZEUGER: erst je Lauf summiert (die Puffer-Kennungen wechseln von Lauf zu Lauf), dann das Maximum.
    let vram = null;
    const je = new Map();
    for (const l of laeufe) {
        if (!l.vram) continue;
        vram = vram || { mb: 0, liste: [] };
        vram.mb = Math.max(vram.mb, l.vram.mb);
        const lauf = new Map();
        for (const v of l.vram.liste || []) {
            const { art, erzeuger } = erzeugerOf(v.k);
            const k = art + ":" + erzeuger;
            const e = lauf.get(k) || { k, mb: 0, n: 0 };
            e.mb += v.mb;
            e.n += v.n;
            lauf.set(k, e);
        }
        for (const e of lauf.values()) {
            const a = je.get(e.k);
            if (!a || e.mb > a.mb) je.set(e.k, { k: e.k, mb: +e.mb.toFixed(1), n: e.n });
        }
    }
    if (vram) vram.liste = [...je.values()];
    const texturen = laeufe.length ? laeufe[laeufe.length - 1].texturen || null : null;
    return { zensus, vram, texturen };
}

function haushaltPruefen(h) {
    const f = [];
    if (!h || h.version !== 1) f.push("haushalt.version ist nicht 1");
    const b = (h && h.band) || {};
    for (const k of ["befehle", "dreiecke", "vramMB", "gpuMs"]) if (!(b[k] > 0)) f.push(`band.${k} fehlt`);
    const paesse = h && h.paesse;
    if (!Array.isArray(paesse) || !paesse.length) f.push("paesse fehlt");
    if (!h || typeof h.geraet !== "string" || !h.geraet) f.push("geraet fehlt");
    f.push(...messortePruefen(h));
    const kl = (h && h.klassen) || [];
    if (!kl.length) f.push("keine Klassen");
    const ids = new Set();
    let sb = 0,
        st = 0;
    for (const k of kl) {
        if (!k.id || ids.has(k.id)) f.push(`Klasse ohne/mit doppelter id: ${k.id}`);
        ids.add(k.id);
        if (!ganz(k.befehle) || !ganz(k.dreiecke)) f.push(`${k.id}: befehle/dreiecke sind keine ganzen Zahlen >= 0`);
        sb += k.befehle || 0;
        st += k.dreiecke || 0;
        // Die Sammelzeile ist gefallen: sie nahm jede unbekannte Klasse still auf (fail-soft) — der ROT-Weg
        // `haushalt` war tot.
        if (k.rest !== undefined) f.push(`${k.id}: \`rest\` ist die stille Sammelzeile — jede Klasse trägt Regeln`);
        if (!Array.isArray(k.regeln)) f.push(`${k.id}: regeln fehlt`);
        for (const r of k.regeln || []) {
            if (!r.muster && !r.familie && !r.art && !r.stufe) f.push(`${k.id}: leere Regel`);
            if (r.muster)
                try {
                    new RegExp(r.muster);
                    // Ein Muster ist verankert: vorn `^`, hinten `$` oder ein Namensraum-Trenner `:` (`^tier:`) —
                    // `^g:(…|tor)` fing g:torus, `^(bau|…)` jeden „baum…".
                    if (!r.muster.startsWith("^") || !(r.muster.endsWith("$") || r.muster.endsWith(":")))
                        f.push(`${k.id}: Muster ${r.muster} ohne Anker (vorn ^, hinten $ oder :)`);
                } catch (_e) {
                    f.push(`${k.id}: Muster ${r.muster} ist kein Regex`);
                }
        }
    }
    if (sb > b.befehle) f.push(`Haushalt-Summe ${sb} Befehle über dem Band ${b.befehle}`);
    if (st > b.dreiecke) f.push(`Haushalt-Summe ${st} Dreiecke über dem Band ${b.dreiecke}`);
    for (const w of (h && h.stufenWand) || [])
        if (!ganz(w.stufe) || !(w.maxM > 0) || !w.grund) f.push("stufenWand-Eintrag ohne stufe/maxM/grund");
    return { fehler: f, summe: { befehle: sb, dreiecke: st } };
}

function ratschePruefen(r, h) {
    const f = [];
    if (!r || r.version !== 1) f.push("ratsche.version ist nicht 1");
    if (!(typeof r.toleranzPct === "number" && r.toleranzPct >= 0)) f.push("toleranzPct fehlt");
    const ta = r && r.toleranzAbs;
    if (!ta || !ganz(ta.befehle) || !ganz(ta.dreiecke) || !nullOderZahl(ta.vramMB))
        f.push("toleranzAbs braucht {befehle, dreiecke, vramMB} (Zahlen >= 0)");
    if (!(r.gemessen === null || (r.gemessen && typeof r.gemessen.datum === "string")))
        f.push("gemessen ist weder null noch { datum, … } (der letzte Nachzug)");
    if (r.gemessen && r.gemessen.eingeschwungen !== true)
        f.push("gemessen stammt aus keiner eingeschwungenen Messung (die Ratsche nimmt nur sie)");
    for (const k of ["befehle", "dreiecke", "vramMB"])
        if (!r.gesamt || !nullOderZahl(r.gesamt[k])) f.push(`gesamt.${k} ist weder null noch Zahl >= 0`);
    const ids = (h.klassen || []).map((k) => k.id);
    const paesse = h.paesse;
    for (const id of ids) {
        const e = r.klassen && r.klassen[id];
        if (!e) {
            f.push(`Ratsche ohne Klasse ${id}`);
            continue;
        }
        for (const p of paesse) {
            const z = e[p];
            if (!z || !nullOderZahl(z.befehle) || !nullOderZahl(z.dreiecke))
                f.push(`Ratsche ${id}.${p} braucht {befehle, dreiecke} (null oder Zahl >= 0)`);
        }
        for (const p of Object.keys(e)) if (!paesse.includes(p)) f.push(`Ratsche ${id} trägt fremden Pass ${p}`);
    }
    for (const id of Object.keys((r && r.klassen) || {}))
        if (!ids.includes(id)) f.push(`Ratsche trägt Klasse ${id}, die der Haushalt nicht kennt`);
    for (const [id, grund] of Object.entries((r && r.frei) || {})) {
        if (!ids.includes(id)) f.push(`frei: ${id} ist keine Haushalt-Klasse`);
        if (typeof grund !== "string" || !/gate:[a-z-]+/.test(grund))
            f.push(`frei.${id} braucht einen Grund, der das Gate der Kosten je Einheit nennt (gate:…)`);
        const e = r.klassen && r.klassen[id];
        if (e && Object.values(e).some((z) => z && (z.befehle != null || z.dreiecke != null)))
            f.push(`frei.${id}: eine freie Klasse trägt keine Ratschen-Werte`);
    }
    for (const [k, v] of Object.entries((r && r.vramMB) || {}))
        if (!nullOderZahl(v)) f.push(`vramMB.${k} ist weder null noch Zahl >= 0`);
    return f;
}

// Liegt ein Ist über seiner Ratsche? Relativ (toleranzPct) UND absolut (toleranzAbs: kleine Zahlen sind diskret —
// ein Tier mehr im Bild sind +6 Befehle, kein Rückschritt).
function ueberRatsche(ist, r, ratsche, groesse) {
    if (r == null) return false;
    const pct = 1 + ((ratsche && ratsche.toleranzPct) || 0) / 100;
    const abs = (ratsche && ratsche.toleranzAbs && ratsche.toleranzAbs[groesse]) || 0;
    return ist > Math.max(r * pct, r + abs);
}

// zensus   = { klassen: [{klasse, stufe, art, je:{pass:cmd}, jeTris:{pass:tris}, dMax}], kamera } (ein Frame oder
//            `zensusMax` über die Proben)
// vram     = { mb, liste: [{k, mb, n}] } (der VRAM-Abgriff der Werkbank, nur WebGPU) oder null
// texturen = { mb, erzeuger: [{erzeuger, mb, n}], unbenannt: [Spur] } (Textur-Objekte, jedes Backend) oder null
// gpu      = { gpuJeFrameMs } (die GPU-Bank) oder null
function bandUrteil({ zensus, vram, texturen, gpu, haushalt, ratsche, ort }) {
    const paesse = haushalt.paesse;
    const rot = [];
    const zeilen = new Map();
    const zeile = (id, titel, soll) => {
        if (!zeilen.has(id))
            zeilen.set(id, {
                id,
                titel,
                soll,
                ist: { befehle: 0, dreiecke: 0 },
                je: Object.fromEntries(paesse.map((p) => [p, { befehle: 0, dreiecke: 0 }])),
                taeter: [],
            });
        return zeilen.get(id);
    };
    for (const k of haushalt.klassen) zeile(k.id, k.titel, { befehle: k.befehle, dreiecke: k.dreiecke });
    const ausserhalb = {};
    for (const e of zensus.klassen || []) {
        const ein = einOf(e);
        let cmd = 0,
            tris = 0;
        const je = {};
        for (const [p, c] of Object.entries(e.je || {})) {
            const t = (e.jeTris || {})[p] || 0;
            if (!paesse.includes(p)) {
                ausserhalb[p] = (ausserhalb[p] || 0) + c;
                continue;
            }
            cmd += c;
            tris += t;
            je[p] = { befehle: c, dreiecke: t };
        }
        for (const w of haushalt.stufenWand || []) {
            if (w.familie && !w.familie.includes(ein.familie)) continue;
            if (w.art && !w.art.includes(ein.art)) continue;
            if (ein.stufe !== w.stufe) continue;
            if (Number.isFinite(e.dMax) && e.dMax > w.maxM)
                rot.push({
                    art: "stufe",
                    text: `${e.klasse}: L${w.stufe} bis ${e.dMax} m im Hauptbild (Wand ${w.maxM} m) — ${w.grund}`,
                });
        }
        if (!cmd && !tris) continue;
        let id = zuordnen(haushalt, ein);
        if (istUnbenannt(e.klasse)) {
            rot.push({
                art: "unbenannt",
                text: `${e.klasse}: ${cmd} Befehle ohne Täter-Namen (Spur: zensus.unbenannt)`,
            });
            id = "UNBENANNT";
        } else if (!id) {
            rot.push({
                art: "haushalt",
                text: `${e.klasse}: ${cmd} Befehle, keine Haushalt-Klasse nimmt den Täter (Regel in haushalt.json)`,
            });
            id = "OHNE-HAUSHALT";
        }
        const z = zeile(id, id, { befehle: 0, dreiecke: 0 });
        z.ist.befehle += cmd;
        z.ist.dreiecke += tris;
        for (const [p, v] of Object.entries(je)) {
            z.je[p].befehle += v.befehle;
            z.je[p].dreiecke += v.dreiecke;
        }
        z.taeter.push({ klasse: e.klasse, befehle: cmd, dreiecke: tris, je, dMax: e.dMax != null ? e.dMax : null });
    }
    // DIE RATSCHE: eine Klasse × Pass darf nur fallen.
    for (const z of zeilen.values()) {
        z.taeter.sort((a, b) => b.befehle - a.befehle || b.dreiecke - a.dreiecke);
        const rz = ratsche && ratsche.klassen && ratsche.klassen[z.id];
        z.ratsche = rz || null;
        z.frei = freiGrund(ratsche, z.id);
        if (!rz || z.frei) continue;
        for (const p of paesse) {
            const r = rz[p] || {};
            for (const g of ["befehle", "dreiecke"])
                if (ueberRatsche(z.je[p][g], r[g], ratsche, g))
                    rot.push({
                        art: "ratsche",
                        text: `${z.id} ${p}: ${z.je[p][g]} ${g} über der Ratsche ${r[g]} (Täter: ${z.taeter
                            .slice(0, 3)
                            .map((t) => t.klasse)
                            .join(", ")})`,
                    });
        }
    }
    const summe = { befehle: 0, dreiecke: 0, je: Object.fromEntries(paesse.map((p) => [p, 0])) };
    // Die gebundene Summe (ohne die freien Klassen des Weltzustands) trägt die Summen-Ratsche.
    const gebunden = { befehle: 0, dreiecke: 0 };
    for (const z of zeilen.values()) {
        summe.befehle += z.ist.befehle;
        summe.dreiecke += z.ist.dreiecke;
        for (const p of paesse) summe.je[p] += z.je[p].befehle;
        if (z.frei) continue;
        gebunden.befehle += z.ist.befehle;
        gebunden.dreiecke += z.ist.dreiecke;
    }
    summe.gebunden = gebunden;
    // DER VRAM je Erzeuger (Abgriff am GPUDevice: das Label ist `texture.name` bzw. das Puffer-Label von r184).
    let speicher = null;
    if (vram && Array.isArray(vram.liste)) {
        const je = new Map();
        for (const v of vram.liste) {
            const { art, erzeuger } = erzeugerOf(v.k);
            const key = art + ":" + erzeuger;
            const e = je.get(key) || { erzeuger: key, mb: 0, n: 0, form: [] };
            e.mb += v.mb;
            e.n += v.n;
            e.form.push(v);
            je.set(key, e);
            if (art === "tex" && erzeuger === "?")
                rot.push({ art: "unbenannt", text: `${v.k}: ${v.mb} MB in ${v.n} Texturen ohne Erzeuger-Namen` });
        }
        // Je Erzeuger seine drei größten Schlüssel (die Täter-Klassen eines Halters, die Formen einer Textur).
        const liste = [...je.values()]
            .map((e) => {
                e.mb = +e.mb.toFixed(1);
                e.form = e.form
                    .sort((a, b) => b.mb - a.mb)
                    .slice(0, 3)
                    .map((v) => v.k);
                return e;
            })
            .sort((a, b) => b.mb - a.mb);
        for (const e of liste)
            if (LECK_ERZEUGER.test(e.erzeuger) && e.mb > 0)
                rot.push({
                    art: "leck",
                    text: `VRAM-Leck ${e.erzeuger}: ${e.mb} MB in ${e.n} Puffern, die kein Bild trägt (${e.form.join(" · ")})`,
                });
        const rv = (ratsche && ratsche.vramMB) || {};
        let frei = 0;
        for (const e of liste) {
            if (vramFrei(ratsche, e.erzeuger)) {
                frei += e.mb;
                continue;
            }
            if (ueberRatsche(e.mb, rv[e.erzeuger], ratsche, "vramMB"))
                rot.push({ art: "ratsche", text: `VRAM ${e.erzeuger}: ${e.mb} MB über der Ratsche ${rv[e.erzeuger]}` });
        }
        // gebunden = ohne die freien Erzeuger (wie die Summen-Ratsche der Befehle): die Ratsche hält, was Kosten sind
        speicher = { mb: vram.mb, gebunden: +(vram.mb - frei).toFixed(1), band: haushalt.band.vramMB, erzeuger: liste };
    }
    // DIE TEXTUR-OBJEKTE (Backend-unabhängig): jedes trägt seinen Erzeuger — selbst oder über sein Render-Ziel.
    if (texturen)
        for (const t of texturen.unbenannt || [])
            rot.push({
                art: "unbenannt",
                text:
                    `Textur-Objekt ohne Erzeuger: ${t.klasse}${t.tiefe ? " (Tiefe)" : ""} ${(t.groesse || []).join("x")} ` +
                    `${t.mb} MB${t.ziel ? " in einem namenlosen Ziel" : ", ohne Ziel"}`,
            });
    const rg = (ratsche && ratsche.gesamt) || {};
    if (ueberRatsche(gebunden.befehle, rg.befehle, ratsche, "befehle"))
        rot.push({ art: "ratsche", text: `Summe (gebunden) ${gebunden.befehle} Befehle über der Ratsche ${rg.befehle}` });
    if (ueberRatsche(gebunden.dreiecke, rg.dreiecke, ratsche, "dreiecke"))
        rot.push({ art: "ratsche", text: `Summe (gebunden) ${gebunden.dreiecke} Dreiecke über der Ratsche ${rg.dreiecke}` });
    if (speicher && ueberRatsche(speicher.gebunden, rg.vramMB, ratsche, "vramMB"))
        rot.push({ art: "ratsche", text: `VRAM ${speicher.gebunden} MB (gebunden) über der Ratsche ${rg.vramMB}` });
    // DAS BAND: jede Größe gegen ihr Soll — ROT, solange ein Ist darüber liegt.
    const B = haushalt.band;
    const gpuMs = gpu && Number.isFinite(gpu.gpuJeFrameMs) ? gpu.gpuJeFrameMs : null;
    const groessen = [
        { name: "Befehle", ist: summe.befehle, soll: B.befehle },
        { name: "Dreiecke", ist: summe.dreiecke, soll: B.dreiecke },
        { name: "VRAM MB", ist: speicher && Number.isFinite(speicher.mb) ? speicher.mb : null, soll: B.vramMB },
        { name: "GPU ms/Frame", ist: gpuMs, soll: B.gpuMs },
    ].map((g) => Object.assign(g, { faktor: g.ist == null ? null : +(g.ist / g.soll).toFixed(2) }));
    const ueber = groessen.filter((g) => g.ist != null && g.ist > g.soll);
    const linse = rot.some((r) => LINSEN_ARTEN.includes(r.art));
    return {
        // GRUEN nur, wenn das Band hält UND die Linse nichts findet; die Ratsche zieht nach, wenn `linse` sauber ist.
        urteil: ueber.length || rot.length ? "ROT" : "GRUEN",
        linse: linse ? "ROT" : "SAUBER",
        bandUrteil: ueber.length ? "UEBER" : groessen.some((g) => g.ist == null) ? "UNGEMESSEN" : "IM BAND",
        groessen,
        rot,
        band: B,
        summe,
        abstand: {
            befehle: +(summe.befehle / B.befehle).toFixed(2),
            dreiecke: +(summe.dreiecke / B.dreiecke).toFixed(2),
            vram: speicher && Number.isFinite(speicher.mb) ? +(speicher.mb / B.vramMB).toFixed(2) : null,
            gpu: gpuMs == null ? null : +(gpuMs / B.gpuMs).toFixed(2),
        },
        ausserhalb,
        klassen: [...zeilen.values()],
        vram: speicher,
        texturen: texturen ? { n: texturen.n, mb: texturen.mb, erzeuger: texturen.erzeuger } : null,
        ort: ort ? ort.id : null,
        soll: ort ? ortSoll(ort, zensus) : [],
    };
}

// DIE SOLL-ZEILEN EINES ORTS (haushalt.messorte[].soll): je Studio-Klasse der Art `art` auf Stufe `stufe` die Hülle EINES
// Exemplars im Pass `pass` — die Dreiecke des Passes geteilt durch die Exemplare je Zug (`inst` zählt jede Instanz jedes
// Stoff-Zugs, `je[pass]` die Züge): an den Toren des Genesis-Rings die Tor-Hülle gegen das Band je Tor (W3d).
function ortSoll(ort, zensus) {
    const out = [];
    for (const s of ort.soll || [])
        for (const e of zensus.klassen || []) {
            if (e.art !== s.art || e.stufe !== s.stufe) continue;
            const zuege = (e.je || {})[s.pass] || 0;
            const tris = (e.jeTris || {})[s.pass] || 0;
            if (!zuege || !e.inst) continue;
            const exemplare = e.inst / zuege;
            const huelle = Math.round(tris / exemplare);
            out.push({
                name: s.name,
                klasse: e.klasse,
                exemplare: +exemplare.toFixed(2),
                huelle,
                soll: s.dreieckeJeTor,
                faktor: +(huelle / s.dreieckeJeTor).toFixed(2),
            });
        }
    return out.sort((x, y) => y.huelle - x.huelle);
}

// DIE RATSCHE NACHZIEHEN (`werkbank ratsche`, die Hülle einer eingeschwungenen Serie der echten GPU, nur ohne Linsen-
// Fehler): jedes Ist — Klasse × Pass, die Summe, der VRAM je Erzeuger — setzt ein ungemessenes Feld und senkt ein
// gemessenes; heben tut sie nie (ein Ist darüber ist ROT, heben ist ein begründeter Akt von Hand im Commit).
// `nur: "vram"` (W6): ein Schnitt, der nur den Speicher bewegt, zieht nur den VRAM nach — die Klassen-Zeilen bleiben die
// Hülle ihrer eigenen Serie (`gemessen`), die VRAM-Serie steht in `gemessen.vram`.
function ratscheNachziehen(ratsche, u, gemessen, nur) {
    const neu = JSON.parse(JSON.stringify(ratsche));
    const aenderungen = [];
    const setze = (obj, key, ist, name) => {
        if (!(typeof ist === "number" && Number.isFinite(ist) && ist >= 0)) return;
        const alt = obj[key];
        if (alt == null || ist < alt) {
            obj[key] = ist;
            aenderungen.push(`${name}: ${alt == null ? "–" : alt} → ${ist}`);
        }
    };
    for (const z of nur === "vram" ? [] : u.klassen) {
        const rz = neu.klassen[z.id];
        if (!rz || freiGrund(neu, z.id)) continue;
        for (const p of Object.keys(rz))
            for (const g of ["befehle", "dreiecke"]) setze(rz[p], g, z.je[p] ? z.je[p][g] : 0, `${z.id}.${p}.${g}`);
    }
    if (nur !== "vram") {
        setze(neu.gesamt, "befehle", u.summe.gebunden.befehle, "gesamt.befehle");
        setze(neu.gesamt, "dreiecke", u.summe.gebunden.dreiecke, "gesamt.dreiecke");
    }
    if (u.vram) {
        setze(neu.gesamt, "vramMB", u.vram.gebunden != null ? u.vram.gebunden : u.vram.mb, "gesamt.vramMB");
        neu.vramMB = neu.vramMB || {};
        for (const e of u.vram.erzeuger)
            if (!vramFrei(neu, e.erzeuger)) setze(neu.vramMB, e.erzeuger, e.mb, "vramMB." + e.erzeuger);
        // Ein Erzeuger, den der Abgriff nicht mehr sieht, ist GEFALLEN (W6: die Leinwand-Tiefe `tex:depthBuffer`, die
        // namenlosen `buf:?`) — seine Ratsche zieht auf 0, sonst kehrte er still bis zur alten Hülle zurück.
        const lebt = new Set(u.vram.erzeuger.map((e) => e.erzeuger));
        for (const k of Object.keys(neu.vramMB))
            if (!lebt.has(k) && !vramFrei(neu, k)) setze(neu.vramMB, k, 0, "vramMB." + k);
    }
    if (aenderungen.length)
        if (nur === "vram") neu.gemessen = Object.assign({}, ratsche.gemessen || gemessen, { vram: gemessen });
        else neu.gemessen = gemessen;
    return { ratsche: neu, aenderungen };
}

// Die Befunde der LINSE, die den Speicher betreffen (`ratsche --nur vram`): ein Leck, eine Textur ohne Erzeuger, ein
// VRAM-Erzeuger oder die VRAM-Summe über der Ratsche. Ein Klassen-Befund (Befehle/Dreiecke eines Passes) gehört der
// Serie seiner Klasse, nie dem Speicher-Nachzug.
function vramBefunde(u) {
    return (u.rot || []).filter(
        (r) =>
            r.art === "leck" ||
            (r.art === "unbenannt" && /^(tex:|Textur-Objekt)/.test(r.text)) ||
            (r.art === "ratsche" && /^VRAM /.test(r.text))
    );
}

// Die Tabelle für das Auge: Ist/Soll/Täter je Klasse, die Summe gegen das Band, der VRAM je Erzeuger, die Urteile.
function bandTabelle(u) {
    const z = [];
    const pad = (s, n) => String(s).padEnd(n);
    const lpad = (s, n) => String(s).padStart(n);
    const k = (x) => (x >= 1000 ? Math.round(x / 1000) + "k" : String(Math.round(x)));
    const kopfBand =
        `BAND ${u.bandUrteil === "UEBER" ? "ROT" : u.bandUrteil}: ` +
        u.groessen
            .map((g) =>
                g.ist == null
                    ? `${g.name} ungemessen`
                    : `${g.name} ${g.name === "Dreiecke" ? k(g.ist) : g.ist}/${g.name === "Dreiecke" ? k(g.soll) : g.soll} (${g.faktor}×)`
            )
            .join(" · ");
    z.push(kopfBand);
    if (u.ort) z.push(`ORT ${u.ort}`);
    z.push("");
    z.push(
        pad("Klasse", 15) +
            lpad("Befehle Ist/Soll", 18) +
            lpad("haupt/k0/k1", 15) +
            lpad("Dreiecke Ist/Soll", 19) +
            "  Täter (Befehle)"
    );
    for (const r of u.klassen) {
        if (!r.ist.befehle && !r.soll.befehle) continue;
        const je = Object.values(r.je)
            .map((v) => v.befehle)
            .join("/");
        const ueber = r.ist.befehle > r.soll.befehle || r.ist.dreiecke > r.soll.dreiecke ? " !" : "  ";
        z.push(
            pad(r.id + (r.frei ? "*" : ""), 15) +
                lpad(`${r.ist.befehle}/${r.soll.befehle}`, 18) +
                lpad(je, 15) +
                lpad(`${k(r.ist.dreiecke)}/${k(r.soll.dreiecke)}`, 19) +
                ueber +
                r.taeter
                    .slice(0, 4)
                    .map((t) => `${t.klasse} ${t.befehle}`)
                    .join(" · ")
        );
    }
    z.push(
        pad("SUMME", 15) +
            lpad(`${u.summe.befehle}/${u.band.befehle}`, 18) +
            lpad(Object.values(u.summe.je).join("/"), 15) +
            lpad(`${k(u.summe.dreiecke)}/${k(u.band.dreiecke)}`, 19) +
            `  Abstand ${u.abstand.befehle}× Befehle · ${u.abstand.dreiecke}× Dreiecke`
    );
    for (const r of u.klassen) if (r.frei) z.push(`* ${r.id} ist frei (keine Ratsche): ${r.frei}`);
    // Die Soll-Zeilen des Orts (die Hülle EINES Exemplars gegen ihr Band): benannt, nie Teil des Urteils — das Band selbst
    // urteilt über die Summe, die Ratsche über die Klasse.
    for (const x of u.soll || [])
        z.push(
            `SOLL ${x.name} ${x.klasse}: ${x.huelle} Dreiecke je Exemplar (${x.exemplare} im Bild) / ${x.soll} (${x.faktor}×)`
        );
    if (Object.keys(u.ausserhalb || {}).length)
        z.push(
            `außerhalb des Haushalts (Post-Kette): ${Object.entries(u.ausserhalb)
                .map(([p, c]) => `${p} ${c}`)
                .join(" · ")} Befehle`
        );
    if (u.vram) {
        z.push("");
        z.push(`VRAM ${u.vram.mb} MB / Band ${u.vram.band} MB (${u.abstand.vram}×) — je Erzeuger:`);
        for (const e of u.vram.erzeuger.slice(0, 18))
            z.push(
                "  " +
                    lpad(e.mb.toFixed(1), 7) +
                    " MB  " +
                    pad(e.n, 6) +
                    e.erzeuger +
                    (e.erzeuger.startsWith("buf:") && e.form && e.form.length && e.form[0] !== e.erzeuger
                        ? "  (" + e.form.map((k) => k.slice(e.erzeuger.length + 1)).join(" · ") + ")"
                        : "")
            );
    } else if (u.texturen) {
        z.push("");
        z.push(
            `Texturen ${u.texturen.mb} MB in ${u.texturen.n} Objekten (r184-Schätzung — dieses Backend hat keinen GPU-Abgriff) — je Erzeuger:`
        );
        for (const e of u.texturen.erzeuger.slice(0, 16))
            z.push("  " + lpad(e.mb.toFixed(1), 7) + " MB  " + pad(e.n, 6) + e.erzeuger);
    }
    // Die Messung: Boot-Art der Serie, Einschwingen, Proben, Foundry-Kanal dieser Ladung (die Werkbank hängt sie an).
    if (u.boot || u.fluss || u.messung) {
        z.push("");
        const b = u.boot
            ? `${u.boot.art}-Boot${u.boot.serie ? ` (Serie ${u.boot.serie})` : ""}, Ladung ${u.boot.ladungen}`
            : "";
        const m = u.messung
            ? `${u.messung.eingeschwungen ? "eingeschwungen" : "NICHT eingeschwungen"} nach ${u.messung.takte} Takten ` +
              `(${Math.round(u.messung.ms / 1000)} s)${u.messung.offen ? " — offen: " + JSON.stringify(u.messung.offen) : ""}, ` +
              `${u.messung.proben} Proben (Maximum je Klasse × Pass)`
            : "";
        const f = u.fluss
            ? `Foundry ${u.fluss.n} Antworten ${u.fluss.mb} MB — von der Platte ${u.fluss.platte} (${u.fluss.platteMb} MB), ` +
              `Neubau ${u.fluss.neuMb} MB`
            : "";
        z.push([b, m, f].filter(Boolean).join(" · "));
    }
    z.push("");
    z.push(kopfBand);
    z.push(
        u.linse === "ROT"
            ? "LINSE ROT — ein Linsen-Fehler oder ein Rückschritt über die Ratsche:"
            : "LINSE SAUBER — jeder Täter benannt und im Haushalt, keine Klasse über ihrer Ratsche."
    );
    for (const r of u.rot.slice(0, 40)) z.push(`  [${r.art}] ${r.text}`);
    return z.join("\n");
}

module.exports = {
    ladeSpec,
    ortOf,
    ortGier,
    ortSoll,
    messortePruefen,
    schreibeRatsche,
    haushaltPruefen,
    ratschePruefen,
    bandUrteil,
    zensusMax,
    bandHuelle,
    ratscheNachziehen,
    vramBefunde,
    bandTabelle,
    einOf,
    zuordnen,
    erzeugerOf,
    ueberRatsche,
};
