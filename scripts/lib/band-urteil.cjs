// band-urteil.cjs — DAS URTEIL DER BAND-LINSE (W0): der Zensus eines Frames (Klasse × Stufe × Pass, aus
// scripts/lib/draw-zaehler.cjs) und der VRAM je Erzeuger gegen den Haushalt (spec/profiband/haushalt.json) und die
// Ratsche (spec/profiband/ratsche.json) → die Tabelle Ist/Soll/Täter und die ROTEN Befunde.
//
// Rot ist, was die Linse selbst bricht oder einen Rückschritt zeigt — nie der Abstand zum Band (der ist die Zahl,
// die jede Welle senkt):
//   unbenannt  ein Befehl ohne Täter-Namen (`UNBENANNT:<type>`), ein Textur-Objekt ohne Erzeuger (Textur-Zensus) oder
//              GPU-Bytes ohne Erzeuger (`tex:?` im VRAM-Abgriff)
//   stufe      eine Nah-Stufe in der Ferne (die `stufenWand` des Haushalts — der stille L0-Rückfall)
//   ratsche    eine Klasse × Pass (oder ein VRAM-Erzeuger, oder die Summe) über ihrem letzten Ist
//   haushalt   ein benannter Täter, den keine Klasse nimmt (nur ohne `rest`-Klasse möglich)
//
//   Werkbank:  node scripts/werkbank.cjs band      (die echte Messung, Integration auf der echten GPU)
//   Wand:      node scripts/diag-profiband.cjs     (Schema, Summe <= Band, Selbsttests gegen injizierte Fälle)
"use strict";
const fs = require("fs");
const path = require("path");

const SPEC = path.join(__dirname, "..", "..", "spec", "profiband");

function ladeSpec() {
    return {
        haushalt: JSON.parse(fs.readFileSync(path.join(SPEC, "haushalt.json"), "utf8")),
        ratsche: JSON.parse(fs.readFileSync(path.join(SPEC, "ratsche.json"), "utf8")),
    };
}

const familieOf = (klasse) => {
    const m = /^(f|fimp|fscatter|g):/.exec(klasse);
    return m ? m[1] : null;
};
const istUnbenannt = (klasse) => /^UNBENANNT:/.test(klasse);
const ganz = (x) => Number.isInteger(x) && x >= 0;
const nullOderZahl = (x) => x === null || (typeof x === "number" && Number.isFinite(x) && x >= 0);

function regelPasst(regel, e) {
    if (regel.muster && !new RegExp(regel.muster).test(e.klasse)) return false;
    if (regel.familie && !regel.familie.includes(e.familie)) return false;
    if (regel.art && !regel.art.includes(e.art)) return false;
    if (regel.stufe && !regel.stufe.includes(e.stufe)) return false;
    return true;
}

// Die Haushalt-Klasse eines Täter-Schlüssels: die erste Klasse, deren Regel passt; sonst die `rest`-Klasse; ein
// unbenannter Täter gehört keiner.
function zuordnen(haushalt, e) {
    if (istUnbenannt(e.klasse)) return null;
    for (const k of haushalt.klassen) if ((k.regeln || []).some((r) => regelPasst(r, e))) return k.id;
    const rest = haushalt.klassen.find((k) => k.rest === true);
    return rest ? rest.id : null;
}

// Der Erzeuger eines VRAM-Schlüssels (`tex:<label> <format> <größe>` · `buf:<label>`): das Label bis zum ersten
// `:`/`#` (die Karten tragen `karte-albedo:<preset>|…`); `?` = ohne Namen.
function erzeugerOf(k) {
    const m = /^(tex|buf):(\S*)/.exec(String(k));
    if (!m) return { art: "?", erzeuger: "?" };
    const label = m[2] || "?";
    return { art: m[1], erzeuger: label === "?" ? "?" : label.split(/[:#]/)[0] || "?" };
}

function haushaltPruefen(h) {
    const f = [];
    if (!h || h.version !== 1) f.push("haushalt.version ist nicht 1");
    const b = (h && h.band) || {};
    for (const k of ["befehle", "dreiecke", "vramMB"]) if (!(b[k] > 0)) f.push(`band.${k} fehlt`);
    const paesse = h && h.messort && h.messort.paesse;
    if (!Array.isArray(paesse) || !paesse.length) f.push("messort.paesse fehlt");
    const kl = (h && h.klassen) || [];
    if (!kl.length) f.push("keine Klassen");
    const ids = new Set();
    let sb = 0,
        st = 0,
        rest = 0;
    for (const k of kl) {
        if (!k.id || ids.has(k.id)) f.push(`Klasse ohne/mit doppelter id: ${k.id}`);
        ids.add(k.id);
        if (!ganz(k.befehle) || !ganz(k.dreiecke)) f.push(`${k.id}: befehle/dreiecke sind keine ganzen Zahlen >= 0`);
        sb += k.befehle || 0;
        st += k.dreiecke || 0;
        if (k.rest === true) rest++;
        if (!Array.isArray(k.regeln)) f.push(`${k.id}: regeln fehlt`);
        for (const r of k.regeln || []) {
            if (!r.muster && !r.familie && !r.art && !r.stufe) f.push(`${k.id}: leere Regel`);
            if (r.muster)
                try {
                    new RegExp(r.muster);
                } catch (_e) {
                    f.push(`${k.id}: Muster ${r.muster} ist kein Regex`);
                }
        }
    }
    if (rest > 1) f.push(`${rest} rest-Klassen (höchstens eine)`);
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
    if (!(r.gemessen === null || (r.gemessen && typeof r.gemessen.datum === "string")))
        f.push("gemessen ist weder null noch { datum, … } (der letzte Nachzug)");
    for (const k of ["befehle", "dreiecke", "vramMB"])
        if (!r.gesamt || !nullOderZahl(r.gesamt[k])) f.push(`gesamt.${k} ist weder null noch Zahl >= 0`);
    const ids = (h.klassen || []).map((k) => k.id);
    const paesse = h.messort.paesse;
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
    for (const [k, v] of Object.entries((r && r.vramMB) || {}))
        if (!nullOderZahl(v)) f.push(`vramMB.${k} ist weder null noch Zahl >= 0`);
    return f;
}

// zensus = { klassen: [{klasse, stufe, art, je:{pass:cmd}, jeTris:{pass:tris}, dMax}], kamera }
// vram     = { mb, liste: [{k, mb, n}] } (der VRAM-Abgriff der Werkbank, nur WebGPU) oder null
// texturen = { mb, erzeuger: [{erzeuger, mb, n}], unbenannt: [Spur] } (Textur-Objekte, jedes Backend) oder null
function bandUrteil({ zensus, vram, texturen, haushalt, ratsche }) {
    const paesse = haushalt.messort.paesse;
    const tol = 1 + ((ratsche && ratsche.toleranzPct) || 0) / 100;
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
        const ein = { klasse: e.klasse, familie: familieOf(e.klasse), stufe: e.stufe, art: e.art || null };
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
            rot.push({ art: "haushalt", text: `${e.klasse}: ${cmd} Befehle, keine Haushalt-Klasse nimmt den Täter` });
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
        if (!rz) continue;
        for (const p of paesse) {
            const r = rz[p] || {};
            for (const g of ["befehle", "dreiecke"])
                if (r[g] != null && z.je[p][g] > r[g] * tol)
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
    for (const z of zeilen.values()) {
        summe.befehle += z.ist.befehle;
        summe.dreiecke += z.ist.dreiecke;
        for (const p of paesse) summe.je[p] += z.je[p].befehle;
    }
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
            if (e.form.length < 3) e.form.push(v.k);
            je.set(key, e);
            if (art === "tex" && erzeuger === "?")
                rot.push({ art: "unbenannt", text: `${v.k}: ${v.mb} MB in ${v.n} Texturen ohne Erzeuger-Namen` });
        }
        const liste = [...je.values()].map((e) => ((e.mb = +e.mb.toFixed(1)), e)).sort((a, b) => b.mb - a.mb);
        const rv = (ratsche && ratsche.vramMB) || {};
        for (const e of liste)
            if (rv[e.erzeuger] != null && e.mb > rv[e.erzeuger] * tol)
                rot.push({ art: "ratsche", text: `VRAM ${e.erzeuger}: ${e.mb} MB über der Ratsche ${rv[e.erzeuger]}` });
        speicher = { mb: vram.mb, band: haushalt.band.vramMB, erzeuger: liste };
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
    if (rg.befehle != null && summe.befehle > rg.befehle * tol)
        rot.push({ art: "ratsche", text: `Summe ${summe.befehle} Befehle über der Ratsche ${rg.befehle}` });
    if (rg.dreiecke != null && summe.dreiecke > rg.dreiecke * tol)
        rot.push({ art: "ratsche", text: `Summe ${summe.dreiecke} Dreiecke über der Ratsche ${rg.dreiecke}` });
    if (speicher && rg.vramMB != null && speicher.mb > rg.vramMB * tol)
        rot.push({ art: "ratsche", text: `VRAM ${speicher.mb} MB über der Ratsche ${rg.vramMB}` });
    return {
        urteil: rot.length ? "ROT" : "GRUEN",
        rot,
        band: haushalt.band,
        summe,
        abstand: {
            befehle: +(summe.befehle / haushalt.band.befehle).toFixed(2),
            dreiecke: +(summe.dreiecke / haushalt.band.dreiecke).toFixed(2),
            vram: speicher && Number.isFinite(speicher.mb) ? +(speicher.mb / haushalt.band.vramMB).toFixed(2) : null,
        },
        ausserhalb,
        klassen: [...zeilen.values()],
        vram: speicher,
        texturen: texturen ? { n: texturen.n, mb: texturen.mb, erzeuger: texturen.erzeuger } : null,
    };
}

// DIE RATSCHE NACHZIEHEN (`werkbank band --ratsche`, nur auf der echten GPU und nur bei GRÜN): jedes Ist — Klasse ×
// Pass, die Summe, der VRAM je Erzeuger — setzt ein ungemessenes Feld und senkt ein gemessenes; heben tut sie nie
// (ein Ist darüber ist ROT, heben ist ein begründeter Akt von Hand im Commit).
function ratscheNachziehen(ratsche, u, gemessen) {
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
    for (const z of u.klassen) {
        const rz = neu.klassen[z.id];
        if (!rz) continue;
        for (const p of Object.keys(rz))
            for (const g of ["befehle", "dreiecke"]) setze(rz[p], g, z.je[p] ? z.je[p][g] : 0, `${z.id}.${p}.${g}`);
    }
    setze(neu.gesamt, "befehle", u.summe.befehle, "gesamt.befehle");
    setze(neu.gesamt, "dreiecke", u.summe.dreiecke, "gesamt.dreiecke");
    if (u.vram) {
        setze(neu.gesamt, "vramMB", u.vram.mb, "gesamt.vramMB");
        neu.vramMB = neu.vramMB || {};
        for (const e of u.vram.erzeuger) setze(neu.vramMB, e.erzeuger, e.mb, "vramMB." + e.erzeuger);
    }
    if (aenderungen.length) neu.gemessen = gemessen;
    return { ratsche: neu, aenderungen };
}

// Die Tabelle für das Auge: Ist/Soll/Täter je Klasse, die Summe gegen das Band, der VRAM je Erzeuger, die Befunde.
function bandTabelle(u) {
    const z = [];
    const pad = (s, n) => String(s).padEnd(n);
    const lpad = (s, n) => String(s).padStart(n);
    const k = (x) => (x >= 1000 ? Math.round(x / 1000) + "k" : String(Math.round(x)));
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
        z.push(
            pad(r.id, 15) +
                lpad(`${r.ist.befehle}/${r.soll.befehle}`, 18) +
                lpad(je, 15) +
                lpad(`${k(r.ist.dreiecke)}/${k(r.soll.dreiecke)}`, 19) +
                "  " +
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
    if (u.vram) {
        z.push("");
        z.push(`VRAM ${u.vram.mb} MB / Band ${u.vram.band} MB (${u.abstand.vram}×) — je Erzeuger:`);
        for (const e of u.vram.erzeuger.slice(0, 16))
            z.push("  " + lpad(e.mb.toFixed(1), 7) + " MB  " + pad(e.n, 6) + e.erzeuger);
    } else if (u.texturen) {
        z.push("");
        z.push(
            `Texturen ${u.texturen.mb} MB in ${u.texturen.n} Objekten (r184-Schätzung — dieses Backend hat keinen GPU-Abgriff) — je Erzeuger:`
        );
        for (const e of u.texturen.erzeuger.slice(0, 16))
            z.push("  " + lpad(e.mb.toFixed(1), 7) + " MB  " + pad(e.n, 6) + e.erzeuger);
    }
    // Die Boot-Art der Mess-Serie und der Foundry-Kanal dieser Ladung (die Werkbank hängt beide an).
    if (u.boot || u.fluss) {
        z.push("");
        const b = u.boot
            ? `${u.boot.art}-Boot${u.boot.serie ? ` (Serie ${u.boot.serie})` : ""}, Ladung ${u.boot.ladungen}`
            : "";
        const f = u.fluss
            ? `Foundry ${u.fluss.n} Antworten ${u.fluss.mb} MB — von der Platte ${u.fluss.platte} (${u.fluss.platteMb} MB), ` +
              `Neubau ${u.fluss.neuMb} MB`
            : "";
        z.push([b, f].filter(Boolean).join(" · "));
    }
    z.push("");
    z.push(u.rot.length ? `ROT (${u.rot.length}):` : "GRÜN: kein Linsen-Fehler, keine Klasse über ihrer Ratsche.");
    for (const r of u.rot.slice(0, 40)) z.push(`  [${r.art}] ${r.text}`);
    return z.join("\n");
}

module.exports = {
    ladeSpec,
    haushaltPruefen,
    ratschePruefen,
    bandUrteil,
    ratscheNachziehen,
    bandTabelle,
    zuordnen,
    erzeugerOf,
};
