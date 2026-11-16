// stationen/blind.cjs — DER BLIND-LESER: das Protokoll des Prüfer-Satzes (vision/REGELN.md R11, wörtlich: „ein blindes Panel von
// ≥ 12 Menschen ohne Projektwissen im Zwei-Wege-Zwang (2AFC über ≥ 40 Paare, 50 % heißt ununterscheidbar) oder ein eingefrorenes
// Modell, das auf 200 vom Panel gewerteten Ankern ≥ 0,8 Übereinstimmung zeigt und halbjährlich an einem frischen Panel nachgeeicht
// wird; Korpus, Schwelle und Anker werden vor dem ersten Lauf mit Quelle eingefroren").
//
// DIE ENTSCHEIDUNG (Befund vision/vorrat/blind-leser.md): EIN Protokoll, der Richter ist eine Funktion. Im Zug richtet das
// eingefrorene LOKALE Modell (ollama am Laptop, KI_ENDPUNKT 127.0.0.1:11434, KI_MODELL qwen3.6:latest — qwen35moe 36B Q4_K_M, der
// Vision-Turm v.blk.* steht im GGUF; kein fremder Dienst, kein Download), zugelassen NUR mit einer Eich-Akte: 200 Anker, die ein
// Panel ≥ 12 über DENSELBEN Plan gewertet hat (der Bogen unten, eine HTML-Datei ohne Server), Übereinstimmung ≥ 0,8, ≤ 183 Tage alt,
// derselbe Digest. Ohne Akte misst das Protokoll, aber es urteilt nie GRÜN (zugelassen: false, beim Grund).
//
// DER PLAN (eingefroren: sein sha256 steht im Protokoll, jede Auswertung prüft ihn):
//   { frage, schwelle: { richtung: "≥"|"≤", wert }, wiederholungen, samen, aufgaben: [{ id, vorlage?, wahl: [ref, …], wahr?, fang? }] }
//   je Aufgabe k = wahl.length ≥ 2 Möglichkeiten (k = 2 ist das Blindpaar; k > 2 die Blind-Klassifikation), `wahr` der Index der
//   richtigen Möglichkeit in `wahl` (aus dem Zustand der Welt oder „das Foto"), `fang` eine Aufgabe, deren Antwort jeder Sehende trifft.
// DER VERSUCH: jede Aufgabe `wiederholungen` mal, Reihenfolge der Versuche und Seite (die Permutation der Wahl) aus dem Samen des
// Sitzes (Plan-Samen × Richter-Name); der Richter sieht nur Frage, Vorlage und die Möglichkeiten in gezogener Reihe.
// DAS URTEIL: Treffer ÷ Versuche (ohne Fang) gegen den Zufall 1/k — exakte Binomial-Schwelle (einseitig α = 0,05): „erkannt" ab der
// kritischen Zahl, sonst „Zufall"; die Sprosse gilt bei „≥" nur erkannt UND Anteil ≥ wert, bei „≤" (ununterscheidbar) bei Anteil ≤ wert.
// DIE ENTLARVUNG (sonst bestünde ein blinder Richter jedes „≤"): ein Richter ist BLIND, wenn er eine Seite wählt statt eines Bildes
// (Anteil der ersten Stelle gegen 1/k, zweiseitig p < 0,001) oder die Fang-Aufgaben nicht trifft (< 90 % oder nicht erkannt); ein
// blinder Richter urteilt nie, ein blinder Prüfer fällt aus dem Panel. Ein „≤"-Plan ohne ≥ 8 Fang-Versuche wirft beim Laden.
//
//   node blind.cjs --selbsttest                         drei Fälle + die Zulassung + die Sprossen-Linse; kein Netz, kein Modell
//   node blind.cjs --sprossen                           die Sprossen 1–2 der Karte 2 mit Blind-Richter, Richter-Text aus der Karte
//   node blind.cjs --bogen <plan.json> <prüfer> <aus.html>     der Bogen eines Menschen (Bilder relativ zum Plan, Antwort als JSON)
//   node blind.cjs --panel <plan.json> <antwort.json> …        die Antworten des Panels → Protokoll + Urteil auf stdout
//   node blind.cjs --modell <plan.json> <aus.json> [eich.json]  der Lauf des lokalen Modells (KI_ENDPUNKT, KI_MODELL) → Protokoll
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const R11 = { panel: 12, versuche: 40, anker: 200, uebereinstimmung: 0.8, eichTage: 183 };
const ALPHA = 0.05;
const ALPHA_SEITE = 0.001;
const FANG_MIN = 0.9;
const FANG_VERSUCHE = 8;

// ── die Zahl ──
const kanon = (x) =>
    Array.isArray(x)
        ? "[" + x.map(kanon).join(",") + "]"
        : x && typeof x === "object"
          ? "{" +
            Object.keys(x)
                .filter((k) => x[k] !== undefined)
                .sort()
                .map((k) => JSON.stringify(k) + ":" + kanon(x[k]))
                .join(",") +
            "}"
          : JSON.stringify(x);
const hash = (x) => crypto.createHash("sha256").update(kanon(x)).digest("hex");
function zufall(samen) {
    let a = parseInt(crypto.createHash("sha256").update(String(samen)).digest("hex").slice(0, 8), 16) >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const mische = (liste, z) => {
    const a = liste.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(z() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
// P(X = i) für X ~ Bin(n, p), über den Logarithmus (n bis einige Tausend)
function binomPmf(n, p) {
    const lf = [0];
    for (let i = 1; i <= n; i++) lf[i] = lf[i - 1] + Math.log(i);
    const out = [];
    for (let i = 0; i <= n; i++)
        out[i] =
            p <= 0
                ? +(i === 0)
                : p >= 1
                  ? +(i === n)
                  : Math.exp(lf[n] - lf[i] - lf[n - i] + i * Math.log(p) + (n - i) * Math.log(1 - p));
    return out;
}
const binomOben = (x, n, p) =>
    binomPmf(n, p)
        .slice(x)
        .reduce((a, b) => a + b, 0);
// die kritische Zahl: die kleinste Trefferzahl, deren obere Schwanz-Wahrscheinlichkeit unter dem Zufall < α ist
function kritisch(n, p, alpha = ALPHA) {
    const f = binomPmf(n, p);
    let s = 0;
    for (let x = n; x >= 0; x--) {
        s += f[x];
        if (s >= alpha) return x + 1;
    }
    return 0;
}
// zweiseitig: so unwahrscheinlich oder unwahrscheinlicher als x unter Bin(n, p)
function binomZweiseitig(x, n, p) {
    const f = binomPmf(n, p);
    return Math.min(
        1,
        f.filter((q) => q <= f[x] * (1 + 1e-9)).reduce((a, b) => a + b, 0)
    );
}

// ── der Plan ──
function pruefePlan(plan) {
    const fehler = [];
    if (!plan || !Array.isArray(plan.aufgaben) || !plan.aufgaben.length) fehler.push("keine Aufgaben");
    const s = plan && plan.schwelle;
    if (!s || !["≥", "≤"].includes(s.richtung) || !(s.wert > 0 && s.wert <= 1))
        fehler.push("Schwelle { richtung ≥|≤, wert 0…1 }");
    if (!(plan.wiederholungen >= 1)) fehler.push("wiederholungen ≥ 1");
    for (const a of plan.aufgaben || []) {
        if (!a.id || !Array.isArray(a.wahl) || a.wahl.length < 2)
            fehler.push("Aufgabe " + a.id + ": wahl mit ≥ 2 Möglichkeiten");
        if (a.wahr != null && !(a.wahr >= 0 && a.wahr < a.wahl.length))
            fehler.push("Aufgabe " + a.id + ": wahr außerhalb der Wahl");
        if (a.fang && a.wahr == null) fehler.push("Fang " + a.id + " ohne wahr");
    }
    const echte = (plan.aufgaben || []).filter((a) => !a.fang && a.wahr != null).length * (plan.wiederholungen || 0);
    if (echte < R11.versuche) fehler.push("R11: " + echte + " Versuche mit Wahrheit < " + R11.versuche);
    const fang = (plan.aufgaben || []).filter((a) => a.fang).length * (plan.wiederholungen || 0);
    if (s && s.richtung === "≤" && fang < FANG_VERSUCHE)
        fehler.push("ein ≤-Plan trägt " + fang + " Fang-Versuche < " + FANG_VERSUCHE);
    if (fehler.length) throw new Error("Plan: " + fehler.join(" · "));
    return hash(plan);
}
// die Versuche eines Sitzes (deterministisch aus Plan-Samen × Name: der Bogen eines Menschen und seine Auswertung ziehen dieselben)
function ziehe(plan, sitz) {
    const z = zufall(plan.samen + "|" + sitz);
    const roh = [];
    for (const a of plan.aufgaben) for (let w = 0; w < plan.wiederholungen; w++) roh.push(a);
    return mische(roh, z).map((a, nr) => {
        const reihe = mische(
            a.wahl.map((_, i) => i),
            z
        );
        return { nr, aufgabe: a.id, fang: !!a.fang, reihe, wahr: a.wahr == null ? null : reihe.indexOf(a.wahr) };
    });
}

// ── der Lauf eines Richters: richter({ frage, vorlage, wahl: [ref in gezogener Reihe], k }) → Stelle 0 … k−1 (oder Promise) ──
async function fahre(plan, richter, name) {
    const planHash = pruefePlan(plan);
    const nach = Object.fromEntries(plan.aufgaben.map((a) => [a.id, a]));
    const versuche = [];
    for (const v of ziehe(plan, name)) {
        const a = nach[v.aufgabe];
        const t = Date.now();
        const wahl = await richter({
            frage: a.frage || plan.frage,
            vorlage: a.vorlage || null,
            wahl: v.reihe.map((i) => a.wahl[i]),
            k: a.wahl.length,
        });
        versuche.push({
            ...v,
            wahl: Number.isInteger(wahl) && wahl >= 0 && wahl < a.wahl.length ? wahl : null,
            ms: Date.now() - t,
        });
    }
    return { planHash, sitz: name, versuche };
}

// ── das Urteil über einen Sitz (ein Richter oder ein Prüfer) ──
function wertung(plan, sitz) {
    const k = Object.fromEntries(plan.aufgaben.map((a) => [a.id, a.wahl.length]));
    const mitWahr = sitz.versuche.filter((v) => v.wahr != null && !v.fang);
    const fang = sitz.versuche.filter((v) => v.fang);
    const p0 = mitWahr.length ? mitWahr.reduce((s, v) => s + 1 / k[v.aufgabe], 0) / mitWahr.length : 0.5;
    const n = mitWahr.length;
    const treffer = mitWahr.filter((v) => v.wahl === v.wahr).length;
    const krit = kritisch(n, p0);
    const alle = sitz.versuche.filter((v) => v.wahl != null);
    const pErst = alle.length ? alle.reduce((s, v) => s + 1 / k[v.aufgabe], 0) / alle.length : 0.5;
    const erste = alle.filter((v) => v.wahl === 0).length;
    const pSeite = binomZweiseitig(erste, alle.length, pErst);
    const fangTreffer = fang.filter((v) => v.wahl === v.wahr).length;
    const fangP0 = fang.length ? fang.reduce((s, v) => s + 1 / k[v.aufgabe], 0) / fang.length : 0.5;
    const blind = [];
    if (pSeite < ALPHA_SEITE)
        blind.push(
            "wählt die Seite: erste Stelle " + erste + "/" + alle.length + " (p " + pSeite.toExponential(1) + ")"
        );
    if (fang.length && (fangTreffer / fang.length < FANG_MIN || fangTreffer < kritisch(fang.length, fangP0)))
        blind.push("trifft den Fang nicht: " + fangTreffer + "/" + fang.length);
    if (sitz.versuche.some((v) => v.wahl == null)) blind.push("antwortet nicht in jedem Versuch");
    const anteil = n ? treffer / n : null;
    const erkannt = n > 0 && treffer >= krit;
    const s = plan.schwelle;
    const haelt =
        !blind.length && n >= R11.versuche && (s.richtung === "≥" ? erkannt && anteil >= s.wert : anteil <= s.wert);
    return {
        n,
        treffer,
        anteil: anteil == null ? null : +anteil.toFixed(4),
        zufall: +p0.toFixed(4),
        kritisch: krit,
        p: n ? +binomOben(treffer, n, p0).toExponential(2) : null,
        befund: blind.length ? "blind" : erkannt ? "erkannt" : "zufall",
        blind,
        seite: { erste, von: alle.length, p: +pSeite.toExponential(2) },
        fang: { treffer: fangTreffer, von: fang.length },
        haelt,
    };
}

// ── die Zulassung nach R11 ──
// Panel: ≥ 12 Prüfer, die nicht blind sind (die Versuche gepoolt). Modell: eine Eich-Akte { anker, uebereinstimmung, datum, digest }.
function eiche(panelProtokolle, modellProtokoll, digest, datum) {
    // je Anker (Aufgabe × Möglichkeit-Inhalt) die Mehrheit des Panels; das Modell stimmt überein, wenn es denselben Inhalt wählt
    const inhalt = (v) => (v.wahl == null ? null : v.reihe[v.wahl]);
    const mehrheit = {};
    for (const p of panelProtokolle)
        for (const v of p.versuche) {
            const m = (mehrheit[v.aufgabe] = mehrheit[v.aufgabe] || {});
            m[inhalt(v)] = (m[inhalt(v)] || 0) + 1;
        }
    const modell = {};
    for (const v of modellProtokoll.versuche) (modell[v.aufgabe] = modell[v.aufgabe] || []).push(inhalt(v));
    const anker = Object.keys(mehrheit).filter((id) => modell[id]);
    let gleich = 0;
    for (const id of anker) {
        const best = +Object.entries(mehrheit[id]).sort((a, b) => b[1] - a[1])[0][0];
        gleich += modell[id].filter((x) => x === best).length / modell[id].length;
    }
    return {
        anker: anker.length,
        uebereinstimmung: anker.length ? +(gleich / anker.length).toFixed(4) : 0,
        digest,
        datum,
        prueferzahl: panelProtokolle.length,
    };
}
function zulassung(richter, heute = Date.now()) {
    if (richter.art === "panel") {
        const ok = richter.pruefer.filter((p) => p.befund !== "blind").length;
        return ok >= R11.panel
            ? { zugelassen: true }
            : { zugelassen: false, grund: "Panel " + ok + " sehende Prüfer < " + R11.panel };
    }
    if (richter.art === "modell") {
        const e = richter.eichung;
        if (!e) return { zugelassen: false, grund: "Modell ohne Eich-Akte (R11: 200 Panel-Anker ≥ 0,8)" };
        const tage = (heute - Date.parse(e.datum)) / 864e5;
        const g = [];
        if (e.prueferzahl < R11.panel) g.push("Eich-Panel " + e.prueferzahl + " < " + R11.panel);
        if (e.anker < R11.anker) g.push("Anker " + e.anker + " < " + R11.anker);
        if (e.uebereinstimmung < R11.uebereinstimmung)
            g.push("Übereinstimmung " + e.uebereinstimmung + " < " + R11.uebereinstimmung);
        if (!(tage <= R11.eichTage)) g.push("Eichung " + Math.round(tage) + " Tage alt > " + R11.eichTage);
        if (e.digest !== richter.digest) g.push("Digest " + richter.digest + " ≠ geeicht " + e.digest);
        return g.length ? { zugelassen: false, grund: g.join(" · ") } : { zugelassen: true };
    }
    return { zugelassen: false, grund: "Richter „" + richter.art + "“ ist weder Panel noch geeichtes Modell (R11)" };
}
// das Protokoll: Plan-Hash, Richter, Versuche, Urteil — `pruefeProtokoll` rechnet das Urteil aus der Datei nach
function protokoll(plan, richter, sitze) {
    const wert = sitze.map((s) => ({ sitz: s.sitz, ...wertung(plan, s) }));
    const r = richter.art === "panel" ? { ...richter, pruefer: wert } : richter;
    const sehend = sitze.filter((s, i) => wert[i].befund !== "blind");
    // gepoolt über die sehenden Sitze; ist keiner sehend, stehen die Zahlen aller da, das Urteil ist „blind" und hält nie
    const gesamt = wertung(plan, { versuche: (sehend.length ? sehend : sitze).flatMap((s) => s.versuche) });
    if (!sehend.length) Object.assign(gesamt, { befund: "blind", haelt: false, blind: wert.flatMap((w) => w.blind) });
    const z = zulassung(r);
    return {
        planHash: hash(plan),
        richter: { art: r.art, name: r.name, digest: r.digest || null, eichung: r.eichung || null },
        sitze,
        wertung: wert,
        urteil: { ...gesamt, ...z, gruen: gesamt.haelt && z.zugelassen, schwelle: plan.schwelle },
    };
}
function pruefeProtokoll(plan, prot) {
    if (prot.planHash !== hash(plan))
        throw new Error(
            "Protokoll: Plan-Hash " + prot.planHash.slice(0, 12) + " ≠ eingefrorener Plan " + hash(plan).slice(0, 12)
        );
    for (const s of prot.sitze) {
        const soll = ziehe(plan, s.sitz).map((v) => kanon([v.aufgabe, v.reihe, v.wahr]));
        if (
            s.versuche.some((v, i) => kanon([v.aufgabe, v.reihe, v.wahr]) !== soll[i]) ||
            s.versuche.length !== soll.length
        )
            throw new Error("Protokoll: die Versuche von " + s.sitz + " sind nicht die gezogenen");
    }
    const neu = protokoll(plan, { ...prot.richter, pruefer: [] }, prot.sitze).urteil;
    if (kanon(neu) !== kanon(prot.urteil)) throw new Error("Protokoll: das Urteil folgt nicht aus den Versuchen");
    return neu;
}

// ── der Richter Modell: ollama am Laptop, eingefroren (Digest aus /api/tags, Temperatur 0, fester Samen, festes Wort) ──
const MODELL_WORT = (f, k, label) =>
    f +
    "\n" +
    (label
        ? "Möglichkeiten:\n" + label.map((l, i) => i + 1 + ") " + l).join("\n") + "\n"
        : "Die Bilder sind in Reihe 1 bis " + k + " angehängt.\n") +
    "Antworte NUR mit der Zahl 1 bis " +
    k +
    ".";
async function modellRichter(planDir, endpunkt, modell) {
    const ep = endpunkt.replace(/\/+$/, "");
    const tags = await fetch(ep + "/api/tags", { signal: AbortSignal.timeout(5000) }).then((x) => x.json());
    const m = (tags.models || []).find((x) => x.name === modell || x.name === modell + ":latest");
    if (!m) throw new Error(ep + " trägt " + modell + " nicht");
    const bild = (ref) => fs.readFileSync(path.resolve(planDir, ref)).toString("base64");
    const istBild = (ref) => /\.(png|jpe?g|webp)$/i.test(String(ref));
    const fn = async ({ frage, vorlage, wahl, k }) => {
        const label = wahl.every(istBild) ? null : wahl;
        const images = [...(vorlage ? [bild(vorlage)] : []), ...(label ? [] : wahl.map(bild))];
        const body = {
            model: m.name,
            stream: false,
            think: false,
            options: { temperature: 0, seed: 11, num_predict: 8 },
            messages: [{ role: "user", content: MODELL_WORT(frage, k, label), images }],
        };
        const r = await fetch(ep + "/api/chat", {
            method: "POST",
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(180000),
        }).then((x) => x.json());
        const z = parseInt(String((r.message && r.message.content) || "").match(/\d+/), 10);
        return z >= 1 && z <= k ? z - 1 : null;
    };
    return { fn, name: m.name, digest: m.digest };
}

// ── der Bogen eines Menschen: eine HTML-Datei ohne Server; ← → (oder 1 … k) wählt, am Ende lädt der Browser die Antwort als JSON ──
function bogen(plan, pruefer, planDir, ausDatei) {
    const nach = Object.fromEntries(plan.aufgaben.map((a) => [a.id, a]));
    const rel = (ref) =>
        /\.(png|jpe?g|webp|mp4|webm|wav|ogg)$/i.test(String(ref))
            ? path.relative(path.dirname(path.resolve(ausDatei)), path.resolve(planDir, ref)).replace(/\\/g, "/")
            : null;
    const vs = ziehe(plan, pruefer).map((v) => {
        const a = nach[v.aufgabe];
        return {
            nr: v.nr,
            frage: a.frage || plan.frage,
            vorlage: a.vorlage ? rel(a.vorlage) : null,
            wahl: v.reihe.map((i) => ({ bild: rel(a.wahl[i]), text: rel(a.wahl[i]) ? null : String(a.wahl[i]) })),
        };
    });
    const daten = JSON.stringify({ pruefer, planHash: hash(plan), versuche: vs });
    const html = `<!doctype html><meta charset="utf-8"><title>Blindpaar</title><style>body{background:#222;color:#eee;font:18px sans-serif;text-align:center}img{max-width:46vw;max-height:70vh;margin:1vw;cursor:pointer}button{font-size:20px;margin:8px}</style><div id="f"></div><div id="v"></div><div id="w"></div><script>
const D=${daten};let i=0,t=0;const A=[];
function zeig(){if(i>=D.versuche.length){const b=new Blob([JSON.stringify({pruefer:D.pruefer,planHash:D.planHash,wahl:A})],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="antwort-"+D.pruefer+".json";a.click();document.body.textContent="Danke. Die Datei antwort-"+D.pruefer+".json ist gespeichert.";return}
const v=D.versuche[i];f.textContent=(i+1)+" / "+D.versuche.length+": "+v.frage;v_.innerHTML=v.vorlage?'<img src="'+v.vorlage+'">':"";w.innerHTML="";v.wahl.forEach((m,j)=>{const e=m.bild?document.createElement("img"):document.createElement("button");if(m.bild)e.src=m.bild;else e.textContent=(j+1)+") "+m.text;e.onclick=()=>nimm(j);w.appendChild(e)});t=performance.now()}
function nimm(j){A.push({nr:D.versuche[i].nr,wahl:j,ms:Math.round(performance.now()-t)});i++;zeig()}
const v_=document.getElementById("v");onkeydown=(e)=>{const k=D.versuche[i]&&D.versuche[i].wahl.length;if(e.key==="ArrowLeft")nimm(0);else if(e.key==="ArrowRight"&&k===2)nimm(1);else if(+e.key>=1&&+e.key<=k)nimm(+e.key-1)};zeig();
</script>`;
    fs.writeFileSync(ausDatei, html);
    return vs.length;
}
function panelSitz(plan, antwort) {
    if (antwort.planHash !== hash(plan)) throw new Error("Antwort von " + antwort.pruefer + ": anderer Plan");
    const w = Object.fromEntries(antwort.wahl.map((x) => [x.nr, x]));
    return {
        sitz: antwort.pruefer,
        versuche: ziehe(plan, antwort.pruefer).map((v) => ({
            ...v,
            wahl: w[v.nr] ? w[v.nr].wahl : null,
            ms: w[v.nr] ? w[v.nr].ms : null,
        })),
    };
}

// ── die Sprossen 1–2 der Karte 2, deren Richter ein Blind-Urteil verlangt (der Richter-Text bleibt in vision/meisterkarte-2.json) ──
// S: Spiel gegen Spiel — die Wahrheit steht im Zustand der Welt; das Werkzeug trägt sie, sobald das Modell geeicht ist.
// F: gegen Foto, Film oder fremdes Bild (Referenz-Korpus, Vergleichstitel, Erd-Daten) — wartet zusätzlich auf den Korpus des Schöpfers.
// E: Schätzung oder Ja/Nein ohne Zwangswahl — R11 verlangt 2AFC; das Protokoll trägt sie nicht, ohne den Richter weicher zu lesen.
// N: Neulinge spielen im festen Protokoll (Spielzeit, Wiederkehr) oder ein Agent spielt — kein Blind-Urteil, nicht dieses Werkzeug.
const SPROSSEN = {
    S: "planet.geologie.lagerstaette#1 planet.relief.formschatz#1 planet.erde.gestalt#1 leben.pflanzen.arten#2 leben.tiere.lebenszyklus#2 leben.wasser.bild#2 leben.wasser.lebensraeume#2 leben.evolution.zeitreise#1 leben.evolution.erbe#2 mensch.leib.verschieden#1 mensch.leib.tracht#1 mensch.leib.tracht#2 mensch.leib.ausdruck#1 mensch.sport.kunst#1 mensch.geist.netz#2 mensch.geist.generationen#2 mensch.geist.innenleben#1 mensch.geist.absicht#1 mensch.stadt.form#2 mensch.stadt.breite#1 mensch.bau.bedarf#1 mensch.bau.bauen#2 mensch.fahrzeug.gestalt#1 mensch.macht.stand#1 mensch.kultur.sprache#1 mensch.kultur.gestalt#1 mensch.kultur.glaube#2 mensch.kultur.bildkunst#2 mensch.kopplung.kultur#1 mensch.zeit.spanne#1 mensch.zeit.erleben#2 mensch.zukunft.technik#2 erleben.schoepfen.hebel#2 erleben.schoepfen.gespraech#2 erleben.klang.stimme#2 erleben.klang.musik#1 same.physik.stoffe#1 same.physik.stoffe#2 same.entfaltung.vielfalt#1",
    F: "planet.geologie.platten#1 planet.geologie.vulkan#1 planet.geologie.vulkan#2 planet.geologie.gebirge#1 planet.geologie.unterwelt#2 planet.geologie.lagerstaette#2 planet.geologie.einschlag#2 planet.relief.formschatz#2 planet.relief.boden#1 planet.wasser.tiefsee#2 planet.wetter.wolken#1 planet.wetter.wolken#2 planet.wetter.fremde-atmosphaeren#1 planet.zeit.archiv#2 planet.kosmos.galaxien#1 same.kopplung.erdsaat#1 leben.pflanzen.arten#1 leben.pflanzen.lebenslauf#2 leben.pflanzen.dichte#1 leben.tiere.arten#2 leben.oeko.zerfall#2 leben.oeko.sukzession#2 leben.evolution.mikroben#1 mensch.leib.gesicht#2 mensch.stadt.groesse#1 mensch.stadt.groesse#2 mensch.stadt.messlatte#1 mensch.stadt.messlatte#2 mensch.bau.huelle#1 mensch.bau.huelle#2 mensch.fahrzeug.gestalt#2 mensch.nahrung.flur#2 mensch.nahrung.frucht#1 mensch.nahrung.strom#2 mensch.nahrung.jenseits#2 mensch.wirtschaft.technik#2 mensch.kultur.gestalt#2 mensch.zeit.erde#1 mensch.zukunft.medien#2 mensch.zukunft.maschinenwesen#1 erleben.spieler.hand#2 erleben.schoepfen.satz#2 erleben.schoepfen.gesetz#2 erleben.bild.flaeche#2 erleben.bild.kamera#2 erleben.kopplung.bild#2 same.entfaltung.schirm#2",
    E: "mensch.leib.spur#1 mensch.zeit.spanne#2 mensch.geist.absicht#2 mensch.stadt.vertikal#2",
    N: "erleben.schoepfen.gespraech#1 erleben.sinn.ziele#2 erleben.sinn.entdeckung#1 erleben.sinn.entdeckung#2 erleben.sinn.staunen#1 erleben.sinn.sog#1",
};
// die Treffer des Wort-Netzes, die KEIN Blind-Urteil sind: ein Maß gegen eine Referenz-Zahl oder -Statistik, Mechanik im Dunkeln
const KEIN_URTEIL =
    "planet.wasser.tiefsee#1 planet.wetter.fremde-atmosphaeren#2 planet.kosmos.kunstwelten#2 planet.wetter.vorhersage#2 erleben.sinne.sicht#2 erleben.sinne.hoeren#1 erleben.sinne.hoeren#2 erleben.bild.nacht#2 erleben.bild.himmel#2 erleben.schoepfen.hebel#1 same.entfaltung.reise#2 same.massstab.nahe#1 same.massstab.nahe#2 mensch.stadt.vertikal#1";
const NETZ =
    /blind|2AFC|Jury|Prüfer|R11|Foto|Referenz|Panel|Neuling|ununterscheid|Bildmodell|Klassifikator|Befragte|Ortskundige|erkannt|erkennbar|zugeordnet|geordnet|plausib|Leser nennt|Hausbild|weiterspielt/i;
function sprossenLesen(karte) {
    const alle = {};
    for (const g of karte.gruppen)
        for (const c of g.kriterien) for (const s of c.sprossen) alle[c.id + "#" + s.nr] = s.richter || "";
    return alle;
}
function sprossenLinse(karte) {
    const alle = sprossenLesen(karte);
    const form = {};
    for (const [f, z] of Object.entries(SPROSSEN))
        for (const id of z.split(" ")) form[id] = form[id] ? form[id] + f : f;
    const kein = new Set(KEIN_URTEIL.split(" "));
    const fehler = [];
    for (const id of [...Object.keys(form), ...kein]) if (!(id in alle)) fehler.push(id + " steht nicht in der Karte");
    for (const [id, f] of Object.entries(form)) if (f.length > 1) fehler.push(id + " in zwei Formen " + f);
    for (const id of Object.keys(form)) if (kein.has(id)) fehler.push(id + " zugleich Form und kein Urteil");
    for (const [id, r] of Object.entries(alle))
        if (+id.split("#")[1] <= 2 && NETZ.test(r) && !form[id] && !kein.has(id))
            fehler.push(id + " verlangt ein Urteil und hat keine Form: " + r);
    return { form, alle, fehler };
}

// ── der Selbsttest: drei Fälle, die Zulassung, die Linse — kein Netz, kein Modell, keine Datei außerhalb des Temp-Ordners ──
async function selbsttest() {
    const os = require("os");
    let rot = 0;
    const pruefe = (name, ok, zahl) => {
        console.log((ok ? "GRÜN " : "ROT  ") + name + (zahl ? " — " + zahl : ""));
        if (!ok) rot++;
    };
    // die Bilder: 32 × 32 Grauwerte im Speicher; das Rauschen trägt Korn, die Fläche keins
    const z = zufall("bilder");
    const rausch = Uint8Array.from({ length: 1024 }, () => Math.floor(z() * 256));
    const B = {
        rausch,
        rauschKopie: Uint8Array.from(rausch),
        glatt: new Uint8Array(1024).fill(128),
        schwarz: new Uint8Array(1024),
        weiss: new Uint8Array(1024).fill(255),
    };
    const korn = (u) => {
        let s = 0;
        for (let i = 1; i < u.length; i++) s += Math.abs(u[i] - u[i - 1]);
        return s / u.length;
    };
    // ein SEHENDER Richter (Bild-Maß): wählt das Bild mit dem meisten Korn bzw. das hellere im Fang; gleich → er rät (eigener Würfel)
    const wz = zufall("richter");
    const sehend = ({ frage, wahl }) => {
        const m = wahl.map((r) => (frage.startsWith("hell") ? B[r].reduce((a, b) => a + b, 0) : korn(B[r])));
        const best = Math.max(...m);
        const top = m
            .map((x, i) => [x, i])
            .filter(([x]) => Math.abs(x - best) < 1e-9)
            .map(([, i]) => i);
        return top[Math.floor(wz() * top.length)];
    };
    const links = () => 0;
    const fangA = {
        id: "fang",
        frage: "hell: welches Bild ist hell?",
        wahl: ["weiss", "schwarz"],
        wahr: 0,
        fang: true,
    };
    const plan = (paar, wahr, richtung, wert) => ({
        frage: "welches Bild trägt Korn?",
        schwelle: { richtung, wert },
        wiederholungen: 40,
        samen: "selbsttest-" + paar.join("-"),
        aufgaben: [{ id: "paar", wahl: paar, wahr }, fangA],
    });
    const probe = { art: "probe", name: "Bild-Maß (Selbsttest)" };

    // Fall 1: zwei gleiche Bilder → Zufall (ein sehender Richter trifft sie nicht über 1/2 hinaus)
    const p1 = plan(["rausch", "rauschKopie"], 0, "≤", 0.85);
    const r1 = protokoll(p1, probe, [await fahre(p1, sehend, "sehend")]).urteil;
    pruefe(
        "Fall 1: zwei gleiche Bilder → Zufall",
        r1.befund === "zufall" && r1.anteil > 0.3 && r1.anteil < 0.7 && r1.haelt,
        "Treffer " +
            r1.treffer +
            "/" +
            r1.n +
            " (kritisch " +
            r1.kritisch +
            ", p " +
            r1.p +
            "), erste Stelle " +
            r1.seite.erste +
            "/" +
            r1.seite.von +
            ", Fang " +
            r1.fang.treffer +
            "/" +
            r1.fang.von
    );
    // Fall 2: ein klar verschiedenes Paar → erkannt
    const p2 = plan(["rausch", "glatt"], 0, "≥", 0.8);
    const r2 = protokoll(p2, probe, [await fahre(p2, sehend, "sehend")]).urteil;
    pruefe(
        "Fall 2: klar verschiedenes Paar → erkannt",
        r2.befund === "erkannt" && r2.anteil === 1 && r2.haelt,
        "Treffer " + r2.treffer + "/" + r2.n + " (kritisch " + r2.kritisch + ", p " + r2.p + ")"
    );
    // Fall 3: ein Richter, der immer links wählt → als blind entlarvt — am ≤-Plan, den er sonst mit 50 % bestünde
    const p3 = plan(["rausch", "glatt"], 0, "≤", 0.85);
    const r3 = protokoll(p3, { art: "probe", name: "links" }, [await fahre(p3, links, "links")]).urteil;
    pruefe(
        "Fall 3: immer links → blind entlarvt, urteilt nicht",
        r3.befund === "blind" && !r3.haelt && r3.anteil > 0.3 && r3.anteil < 0.7,
        "Treffer " + r3.treffer + "/" + r3.n + " (sähe aus wie ununterscheidbar), " + r3.blind.join(" · ")
    );

    // die Protokoll-Datei: geschrieben, gelesen, nachgerechnet; ein gefälschter Plan und ein gefälschtes Urteil werfen
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blind-"));
    const datei = path.join(dir, "protokoll.json");
    fs.writeFileSync(datei, JSON.stringify(protokoll(p2, probe, [await fahre(p2, sehend, "sehend")]), null, 1));
    const gelesen = JSON.parse(fs.readFileSync(datei, "utf8"));
    let nachgerechnet = false,
        planWirft = false,
        urteilWirft = false;
    try {
        nachgerechnet = pruefeProtokoll(p2, gelesen).befund === "erkannt";
    } catch (e) {
        console.log("  " + e.message);
    }
    try {
        pruefeProtokoll({ ...p2, schwelle: { richtung: "≥", wert: 0.5 } }, gelesen);
    } catch (e) {
        planWirft = /Plan-Hash/.test(e.message);
    }
    try {
        pruefeProtokoll(p2, {
            ...gelesen,
            sitze: [{ ...gelesen.sitze[0], versuche: gelesen.sitze[0].versuche.map((v) => ({ ...v, wahl: v.wahr })) }],
            urteil: { ...gelesen.urteil, treffer: 0 },
        });
    } catch (e) {
        urteilWirft = /Urteil folgt nicht/.test(e.message);
    }
    pruefe(
        "die Protokoll-Datei rechnet sich nach, Plan und Urteil sind eingefroren",
        nachgerechnet && planWirft && urteilWirft,
        datei
    );
    fs.rmSync(dir, { recursive: true, force: true });

    // R11 am Plan: < 40 Versuche und ein ≤-Plan ohne Fang werfen
    let wenig = false,
        ohneFang = false;
    try {
        pruefePlan({ ...p2, wiederholungen: 39 });
    } catch (e) {
        wenig = /R11/.test(e.message);
    }
    try {
        pruefePlan({ ...p3, aufgaben: [p3.aufgaben[0]] });
    } catch (e) {
        ohneFang = /Fang/.test(e.message);
    }
    pruefe("R11 am Plan: 39 Versuche und ein ≤-Plan ohne Fang werfen", wenig && ohneFang);

    // die Zulassung: das Bild-Maß urteilt nie GRÜN; ein Panel aus 12 sehenden Prüfern ja, aus 11 nicht; ein Modell nur mit Eich-Akte
    const zl = (s) => protokoll(p2, { art: "panel", name: "Panel" }, s).urteil;
    const zwoelf = [];
    for (let i = 0; i < 12; i++) zwoelf.push(await fahre(p2, sehend, "pruefer-" + i));
    const mitBlind = [...zwoelf.slice(0, 11), await fahre(p2, links, "pruefer-links")];
    const u12 = zl(zwoelf),
        u11 = zl(mitBlind);
    const mod = await fahre(p2, sehend, "modell");
    const akte = eiche(zwoelf, mod, "sha256:abc", new Date().toISOString());
    const zuWenigAnker = zulassung({ art: "modell", digest: "sha256:abc", eichung: akte });
    const voll = zulassung({ art: "modell", digest: "sha256:abc", eichung: { ...akte, anker: 200 } });
    const andererDigest = zulassung({ art: "modell", digest: "sha256:neu", eichung: { ...akte, anker: 200 } });
    pruefe(
        "die Zulassung nach R11",
        !r2.gruen &&
            r2.grund &&
            u12.gruen &&
            !u11.gruen &&
            /11 sehende/.test(u11.grund) &&
            !zuWenigAnker.zugelassen &&
            voll.zugelassen &&
            !andererDigest.zugelassen,
        "Bild-Maß: " +
            r2.grund +
            " · Panel 12 GRÜN · Panel 11+links: " +
            u11.grund +
            " · Modell mit " +
            akte.anker +
            " Anker: " +
            zuWenigAnker.grund +
            " · Übereinstimmung " +
            akte.uebereinstimmung
    );

    // der Bogen: dieselben Versuche wie die Auswertung; ein Mensch, der immer links drückt, fällt aus
    const bdir = fs.mkdtempSync(path.join(os.tmpdir(), "bogen-"));
    const n = bogen(p2, "mensch-1", bdir, path.join(bdir, "bogen.html"));
    const ant = {
        pruefer: "mensch-1",
        planHash: hash(p2),
        wahl: ziehe(p2, "mensch-1").map((v) => ({ nr: v.nr, wahl: 0, ms: 900 })),
    };
    const w = wertung(p2, panelSitz(p2, ant));
    fs.rmSync(bdir, { recursive: true, force: true });
    pruefe(
        "der Bogen zieht dieselben Versuche, links-Drücker ist blind",
        n === 80 && w.befund === "blind",
        n + " Versuche, " + w.blind.join(" · ")
    );

    // die Sprossen-Linse: jede Sprosse 1–2 mit Blind-Wort hat EINE Form; ROT am Täter, wenn eine neue unklassifiziert ist
    const karte = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../vision/meisterkarte-2.json"), "utf8"));
    const L = sprossenLinse(karte);
    const zahl = Object.fromEntries(Object.keys(SPROSSEN).map((f) => [f, SPROSSEN[f].split(" ").length]));
    pruefe(
        "die Sprossen-Linse an der Karte",
        L.fehler.length === 0,
        (L.fehler[0] || "") + " S " + zahl.S + " · F " + zahl.F + " · E " + zahl.E + " · N " + zahl.N
    );
    const mutant = JSON.parse(JSON.stringify(karte));
    mutant.gruppen[0].kriterien[0].sprossen[1].richter += "; Blindpaar gegen Foto";
    const Lm = sprossenLinse(mutant);
    pruefe(
        "die Linse nennt den Täter (Mutante: planet.geologie.platten#2 + Blindpaar)",
        Lm.fehler.length === 1 && Lm.fehler[0].startsWith("planet.geologie.platten#2"),
        Lm.fehler[0]
    );

    console.log(rot ? "SELBSTTEST ROT " + rot : "SELBSTTEST GRÜN");
    process.exitCode = rot ? 1 : 0;
}

async function main() {
    const [cmd, ...a] = process.argv.slice(2);
    const lies = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
    if (cmd === "--selbsttest") return selbsttest();
    if (cmd === "--sprossen") {
        const L = sprossenLinse(lies(path.join(__dirname, "../../../vision/meisterkarte-2.json")));
        for (const f of Object.keys(SPROSSEN))
            for (const id of SPROSSEN[f].split(" ")) console.log(f + "  " + id + "  " + L.alle[id]);
        for (const e of L.fehler) console.log("FEHLT " + e);
        return;
    }
    if (cmd === "--bogen")
        return console.log(bogen(lies(a[0]), a[1], path.dirname(path.resolve(a[0])), a[2]) + " Versuche → " + a[2]);
    if (cmd === "--panel") {
        const plan = lies(a[0]);
        const p = protokoll(
            plan,
            { art: "panel", name: "Panel" },
            a.slice(1).map((f) => panelSitz(plan, lies(f)))
        );
        return console.log(JSON.stringify(p, null, 1));
    }
    if (cmd === "--modell") {
        const plan = lies(a[0]);
        const R = await modellRichter(
            path.dirname(path.resolve(a[0])),
            process.env.KI_ENDPUNKT || "http://127.0.0.1:11434",
            process.env.KI_MODELL || "qwen3.6:latest"
        );
        const p = protokoll(
            plan,
            { art: "modell", name: R.name, digest: R.digest, eichung: a[2] ? lies(a[2]) : null },
            [await fahre(plan, R.fn, R.name)]
        );
        fs.writeFileSync(a[1], JSON.stringify(p, null, 1));
        return console.log(JSON.stringify(p.urteil));
    }
    console.error(
        "node blind.cjs --selbsttest | --sprossen | --bogen <plan> <prüfer> <aus.html> | --panel <plan> <antwort…> | --modell <plan> <aus> [eich]"
    );
    process.exitCode = 2;
}
if (require.main === module) main().catch((e) => ((process.exitCode = 2), console.error(e.stack || e)));
module.exports = {
    R11,
    pruefePlan,
    ziehe,
    fahre,
    wertung,
    protokoll,
    pruefeProtokoll,
    eiche,
    zulassung,
    bogen,
    panelSitz,
    modellRichter,
    sprossenLinse,
    kritisch,
    binomOben,
};
