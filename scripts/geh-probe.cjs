#!/usr/bin/env node
// geh-probe.cjs — DIE ZERLEGUNG DES GANGS UND DER FAHRT auf der echten GPU (profiband.K4, die Glätte am Genesis-Ring): EINE Werkbank am
// Tor; je Zelle frisch umgestellt, dann das Fenster wie die Station (`haenger`, 0,3 s Einschwingen, Regler des Spielers, Tiere frei) mit
// der Spur — aus DERSELBEN Spur zwei Urteile: die Hänger-Linse (jedes Bild über 33 ms mit Klasse TAKT · NEBEN · GC · GPU und Engstelle)
// und die Takt-Spitze (je Rahmen ms je Takt ab p95 gegen die Mitte, `HL.linseWerten(…, {spitze})`). Die Zellen: Gehen (Bahn, V alle
// 0,75 s, PB_SEITE.k4geh), die Fahrt im GT Ego und Third (20 m/s, E aus 1 s nach dem Aufsitzen, E ein 1 s später, PB_SEITE.k4fahrt).
// Zeilen „GEH …“ ≤ 590 Zeichen (der GPU-Probe-Dienst postet die letzten zehn mit Urteil).
// Exit 0 nur, wenn jede Zelle ≤ 1 % Bilder über 33 ms und keines über 100 ms hält (die Staffel 2 von profiband.K4).
//   node scripts/geh-probe.cjs [--port 4793] [--sek 4]     (npm run gate:geh-zerlegung; je Push nimmt der freie Läufer sie)
"use strict";
const fs = require("fs");
const path = require("path");
const { werkbankTor } = require("./lib/welt-boot.cjs");
const HL = require("./lib/haenger-linse.cjs");

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const PORT = Number(arg("--port", 4793));
const D = path.resolve("artifacts", "geh-probe");
fs.mkdirSync(D, { recursive: true });
const kern = []; // die Zeilen des Urteils: am Ende noch einmal (der GPU-Probe-Dienst postet die letzten zehn)
const zeile = (s, k) => (console.log((s = s.replace(/\s+/g, " ").slice(0, 590))), k && kern.push(s));
const q = (z) => (z ? [z.p50, z.p95, z.p99, z.max].join("/") : "?");
const json = (out) => {
    try {
        return JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
    } catch {
        return null;
    }
};
let vorStand = "";
// der Teilbaum unter jedem Rahmen `wurzel` der Takt-Spitze (`zeilen` in Tiefen-Reihe): je relative Tiefe × Name die Summe
// Spitze/Mitte, ab `min` ms in einer der beiden; voran die Wurzel selbst
const teilbaum = (s, wurzel, tief = 3, min = 0.3) => {
    const m = new Map([["0", { s: 0, m: 0 }]]);
    const z = s.zeilen;
    for (let i = 0; i < z.length; i++) {
        if (!wurzel.test(kurz(z[i].name))) continue;
        m.get("0").s += z[i].spitzeMs;
        m.get("0").m += z[i].mitteMs;
        for (let j = i + 1; j < z.length && z[j].tiefe > z[i].tiefe; j++) {
            const d = z[j].tiefe - z[i].tiefe;
            if (d > tief) continue;
            const k = d + kurz(z[j].name);
            const x = m.get(k) || { s: 0, m: 0 };
            x.s += z[j].spitzeMs;
            x.m += z[j].mitteMs;
            m.set(k, x);
        }
    }
    return [...m]
        .filter(([k, x]) => k === "0" || x.s >= min || x.m >= min)
        .map(([k, x]) => `${k} ${x.s.toFixed(1)}/${x.m.toFixed(1)}`)
        .join(" · ");
};
const kurz = (n) =>
    String(n)
        .replace(/ \[[^\]]*\]/g, "")
        .slice(0, 40);

// die Tasten der Station (punkte-maschine g6.js PB_SEITE k4geh · k4fahrt): V alle 0,75 s im Gehen; in der Fahrt E aus 1 s nach dem
// Aufsitzen, E ein 1 s später — der Sattel des Stroms geht 1 → 0 → 1
const TASTE = 'const t = (c, k) => { for (const a of ["keydown", "keyup"]) window.dispatchEvent(new KeyboardEvent(a, { bubbles: true, code: c, key: k })); }; '; // prettier-ignore
const SEITE = {
    geh: `clearInterval(window.__k4iv); const z = (window.__k4 = { v: 0 }); ${TASTE} window.__k4iv = setInterval(() => { t("KeyV", "v"); z.v++; }, 750); setTimeout(() => clearInterval(window.__k4iv), 5000); return 1;`, // prettier-ignore
    fahrt: `clearInterval(window.__k4iv); const z = (window.__k4 = { wagen: "-", aus: "-", ein: "-" }); ${TASTE} const bis = performance.now() + 20000; const iv = setInterval(() => { if (st.player.mountedArch !== "werkbank-fahrt" && performance.now() < bis) return; clearInterval(iv); setTimeout(() => { z.wagen = st.player.mountedArch; t("KeyE", "e"); setTimeout(() => { z.aus = st.player.mountedArch; t("KeyE", "e"); setTimeout(() => { z.ein = st.player.mountedArch; }, 300); }, 1000); }, 1000); }, 50); return 1;`, // prettier-ignore
};
const SEK = arg("--sek", "4");
// DER GRUND JEDES BRUCHS DER LAGE (`--ab`, die letzte Fahrt): `_passLageHaelt` je Anker (Pass × Weg|Auge) gezählt — gehalten oder
// der erste Grund, der fiel: art · scheibe · band · blende · licht (Kaskade) · auge · ende · quer · lot (die Strecke) · proj · dreh
const HALT_GRUND = `const P = Object.getPrototypeOf(r), H = P.__haltRoh || (P.__haltRoh = P._passLageHaelt), PW = r.constructor.PASS_WAHL;
const G = (window.__haltGrund = {});
const name = (an) => { for (const [k, a] of r._passLagen || []) { if (a === an) return k + ":weg"; if (a.auge === an) return k + ":auge"; } return "?"; };
const steht = (d) => d <= PW.haltM / 2;
P._passLageHaelt = function (a, s, an) {
  const ok = H.call(this, a, s, an);
  let w = "halt";
  if (!ok) {
    if (s[84] !== a[84] || s[27] !== a[27]) w = "art";
    else if (s[84] === 0 && s[27] === 1) {
      w = "licht";
      for (let o = 28; o < 52; o += 4) if (!steht(Math.abs(s[o + 3] - a[o + 3])) || [0, 1, 2].some((j) => !(Math.abs(s[o + j] - a[o + j]) <= 1e-9))) w = "scheibe";
      if (w === "licht" && (s[53] !== a[53] || !steht(Math.abs(s[87] - a[87])) || !steht(Math.abs(s[88] - a[88])))) w = "band";
      if (w === "licht" && !r._blendeHaelt(a, s, an)) w = "blende";
    } else {
      const d = [s[0] - a[0], s[1] - a[1], s[2] - a[2]];
      const persp = s[84] === 1;
      if (persp ? !r._aufStrecke(d[0], d[1], d[2], an) : !steht(Math.hypot(d[0], d[1], d[2]))) {
        const u = an.u, v = d[0] * u[0] + d[1] * u[1] + d[2] * u[2], t = Math.max(0, Math.min(an.lw, v));
        w = !(an.lw > 0) ? "auge" : v > an.lw + an.q ? "ende" : Math.hypot(d[0] - t * u[0], d[2] - t * u[2]) > an.q ? "quer" : "lot";
      } else if (persp && Array.from({ length: 24 }, (_, i) => i).some((i) => s[3 + i] !== a[3 + i])) w = "proj";
      else {
        let sp = 0;
        for (let i = 75; i < 84; i++) sp += s[i] * a[i];
        w = Math.acos(Math.max(-1, Math.min(1, (sp - 1) / 2))) > an.drehRand / 2 ? "dreh" : !r._blendeHaelt(a, s, an) ? "blende" : "sonst";
      }
    }
  }
  const g = G[name(an)] || (G[name(an)] = {});
  g[w] = (g[w] || 0) + 1;
  if (w === "halt" || ok) g.lw = Math.max(g.lw || 0, +(an.lw || 0).toFixed(1));
  return ok;
};
return 1;`;

(async () => {
    const tor = werkbankTor(PORT);
    let gruen = true;
    try {
        await tor.bereit;
        console.log((/\[linse-gpu\][^\r\n]*/.exec(tor.log) || ["[linse-gpu] ungenannt"])[0]);
        const wb = (args, s) => {
            const o = tor.rufe([...args, "--port", String(PORT)], s * 1000);
            fs.appendFileSync(path.join(D, "werkbank.log"), `\n$ ${args.join(" ")}\n${o.stdout}${o.stderr}`);
            return o.stdout || "";
        };
        const ev = (code) => (json(wb(["eval", code], 60)) || {}).ergebnis;
        // DER BAU-STAND der Erst-Zeichnung (`_erstZeichnungStand`): fertige Knoten-Bauten, ihre Zeit, asynchron angelegte Pipelines
        const BAU =
            "const E = r._erstZeichnung || {}; return [E.bauN | 0, +(E.bauMs || 0).toFixed(1), E.pipeAsync | 0, E.neubauN | 0, E.vorwaermN | 0, E.vorwaerm ? E.vorwaerm.size : -1, E.vorwaermVerweigert | 0];";
        const bauStand = () => ev(BAU) || [0, 0, 0, 0, 0, 0, 0];
        // DER STAND DES VORWÄRM-GESETZES: gebaut ohne Draw, Rufe, verweigert, offen je Klasse und fehlender Familie, die kommenden
        // Gestalten der Hotbar, die Arenen des GT (z gezeichnet · v vorgebaut · q in der Reihe · i Form steht) und die Zeit
        const VW = `const E = r._erstZeichnung || {}; const V = r._geistVorbauStand; const q = {};
            for (const o of E.vorwaerm || []) { const k = r._taeterKlasse(o) + ":" + [...(E.vorwaermFehlt.get(o) || [])].join("+"); q[k] = (q[k] | 0) + 1; }
            const gt = []; for (const [k, g] of r.state.archInstanceGroups || []) if (/(^|[:|])gt[|:]/.test(k)) { const a = g.mesh.__arena;
              gt.push(k.replace(/^.*?(gt[^#]*).*$/, "$1") + (a ? "@" + (E.gezeichnet.has(a) ? "z" : "") + (E.vorgebaut.has(a) ? "v" : "") + (E.vorwaerm.has(a) ? "q" : "") + (a.geometry.index ? "i" : "") : "@-") + "#" + g.liveCount); }
            return { n: E.vorwaermN, rufe: E.vorwaermRufe, verw: E.vorwaermVerweigert, offen: E.vorwaerm ? E.vorwaerm.size : -1, zeit: r._vorwaermZeit(), gestalt: V ? [...V.gestalt].length : null, q: Object.entries(q).sort((a, b) => b[1] - a[1]).slice(0, 6), gt: gt.slice(0, 6) };`; // prettier-ignore
        let ankunft = ""; // die erste Zeile des Vorwärmens trägt sie (die Probe postet die letzten zehn)
        const vorwaermZeile = (wo) => {
            zeile(`GEH GRÜN ${ankunft}Vorwärmen (Messung) ${wo}: ${JSON.stringify(ev(VW))}`, true);
            ankunft = "";
        };
        const zelle = (name, wandern, code, tief, still) => {
            const j = path.join(D, name.replace(/\W+/g, "-") + ".json");
            const bv = bauStand();
            ev(code);
            wb(
                [
                    "haenger",
                    SEK,
                    "--ein",
                    "0.3",
                    "--wandern",
                    wandern,
                    "--regler",
                    "frei",
                    "--tiere",
                    "frei",
                    "--schwelle",
                    "33",
                    "--json",
                    j,
                ],
                240
            );
            if (!fs.existsSync(j)) return ((gruen = false), zeile(`GEH ROT ${name}: das Fenster lieferte kein JSON`));
            const a = JSON.parse(fs.readFileSync(j, "utf8"));
            const { roh, spur } = JSON.parse(fs.readFileSync(j.replace(/\.json$/, ".roh.json"), "utf8"));
            const bn = bauStand();
            // die Pipelines des Fensters je Auftraggeber (Pass · Täter-Klasse), aus den Namen der Hänger-Linse
            const pa = {};
            for (const x of roh.namen || []) if (x.art === "async" || x.art === "sync") pa[`${x.pass} ${x.klasse || x.n}`] = (pa[`${x.pass} ${x.klasse || x.n}`] | 0) + 1; // prettier-ignore
            const imFenster = `Knoten fertig ${bn[0] - bv[0]} Σ ${(bn[1] - bv[1]).toFixed(1)} ms · vorgewärmt davor ${bv[4]} offen ${bv[5]} im Fenster ${bn[4] - bv[4]} · Pipelines ${bn[2] - bv[2]} (Gerät async ${(a.pipelines || {}).async} sync ${(a.pipelines || {}).sync}) ${JSON.stringify(Object.entries(pa).sort((x, y) => y[1] - x[1]).slice(0, 4))} · `; // prettier-ignore
            const s = HL.linseWerten(roh, spur, { spitze: true });
            const anteil = a.frames ? a.haengerN / a.frames : 1;
            const ok = anteil <= 0.01 && a.frameMs.max <= 100;
            if (still) return { a, s, anteil, weg: roh.bahnM };
            const stand = vorStand;
            vorStand = "";
            gruen = gruen && ok;
            const kb = a.knotenBau || {},
                pp = a.pipelines || {};
            zeile(
                `GEH ${ok ? "GRÜN" : "ROT"} ${name}: ${stand}Bild p50/95/99/max ${q(a.frameMs)} · ${(100 * anteil).toFixed(1)} % > 33 ms · ` +
                    `Takt ${q(a.taktMs)} · ${a.frames} Bilder · Weg ${roh.bahnM} m · Tasten ${JSON.stringify(ev("return window.__k4 || null"))} · ` +
                    `> 33 ms ${a.haengerN} (${Object.entries(a.jeKlasse)
                        .map(([k, v]) => k + " " + v)
                        .join(" ")}) · Bau ${kb.sync} Σ ${kb.ms} ms ` + // prettier-ignore
                    `${JSON.stringify(Object.entries(kb.jeAuftragMs || {}).slice(0, 4))} · Pipe sync ${pp.sync} · Ursachen ` +
                    a.jeUrsache
                        .slice(0, 5)
                        .map((e) => `${e.n}× ${e.summeMs}/${e.maxMs} ${e.ursache}`)
                        .join(" | "),
                true
            );
            zeile(
                `GEH ${ok ? "GRÜN" : "ROT"} ${name} Bau im Fenster: ${imFenster}max-Schritt ${kb.maxMs} ms, ${kb.ueber16} > 16,7 ms`,
                true
            );
            if (!tief) return;
            // die Teilbäume der Blöcke des Haupt-Fadens (je Rahmen ms je Takt ab p95 / in der Mitte, bis drei Ebenen tief, ab
            // 0,5 ms): der Kopf des Takts (zwei Ebenen), die Sicht je Pass, der Takt-Planer; dazu die teuersten Selbst-Rahmen
            // aller Hänger (je Hänger sein Anteil an dt, summiert)
            const selbst = new Map();
            for (const h of a.haenger || [])
                for (const x of h.selbst || []) selbst.set(x.name, (selbst.get(x.name) || 0) + (x.pct * h.dt) / 100);
            const kopf = s.zeilen.filter((z) => z.tiefe <= 1 && (z.spitzeMs >= 1 || z.mitteMs >= 1));
            for (const [wort, inhalt] of [
                [`Kopf, CPU ${JSON.stringify(s.cpuMs)}`, kopf.map((z) => `${z.tiefe}${kurz(z.name)} ${z.spitzeMs.toFixed(1)}/${z.mitteMs.toFixed(1)}`).join(" · ")], // prettier-ignore
                ["Sicht", teilbaum(s, /^_passSicht$/, 3, 0.5)],
                ["Planer", teilbaum(s, /^_runFrameScheduler$/, 3, 0.5)],
                ["Zeichnung", `${teilbaum(s, /^_renderScene$/, 2, 1)} ‖ Selbst ${[...selbst].sort((x, y) => y[1] - x[1]).slice(0, 6).map(([n, ms]) => `${kurz(n)} ${Math.round(ms)}`).join(" · ")}`], // prettier-ignore
            ])
                zeile(`GEH ${ok ? "GRÜN" : "ROT"} ${name} ${wort} ab p95 ${s.spitzeN}/${s.takte} Takte: ${inhalt}`);
        };
        // der Stand vor dem ersten Fenster (wie die Station: das Anker-Fenster nach dem Umstellen) — Bild, GPU und Phasen als Bezug
        const steh = (ort, sicht) => {
            wb(["umstellen", "--ort", ort, "--sicht", sicht], 300);
            // DIE ANKUNFT (das erste Weltbild steht nach dem ersten Umstellen): ihre Zeit ab Navigation und die Bauten bis dahin
            const anft = ev("const s = r.state; return [Math.round(s._weltbildDa || -1), Math.round(s._fernbildDa || -1)];") || []; // prettier-ignore
            const b0 = bauStand();
            ankunft = `Ankunft Weltbild ${anft[0]} ms (Ferne ${anft[1]}) · Knoten bis jetzt ${b0[0]} Σ ${b0[1]} ms · Pipelines ${b0[2]} · `; // prettier-ignore
            const l = json(wb(["lauf", "2", "--ein", "0.3", "--regler", "voll", "--tiere", "frei"], 120)) || {};
            vorStand = `Stand Bild ${q(l.frameMs)} GPU ${q(l.gpuMs)} · `;
        };
        if (process.argv.includes("--ab")) {
            // DAS A/B IN EINER WELT (`--ab`, npm run gate:fahrt-ab): A = die Anker der Lage am Punkt (der Stand vor w24:
            // `_lageAnker` ohne Weg), B = der Weg des Auges; je Variante eine Fahrt (GT, E aus und ein) und ein Gang am
            // Genesis-Ring, Folge A B B A nach einer unbewerteten Aufwärm-Fahrt (der erste GT der Sitzung baut seine Programme)
            const setze = (punkt) =>
                ev(
                    "const P = Object.getPrototypeOf(r); P.__lageAnker = P.__lageAnker || P._lageAnker; " +
                        `P._lageAnker = ${punkt} ? function (a, s, k, L, key) { return P.__lageAnker.call(this, a, s, k, L, key, null); } : P.__lageAnker; ` + // prettier-ignore
                        "if (r._passLagen) r._passLagen.clear(); return P._lageAnker === P.__lageAnker;"
                );
            const M = { A: [], B: [] };
            wb(["umstellen", "--ort", "genesis", "--sicht", "ego"], 300);
            zelle("Aufwaermen", "fahrt", SEITE.fahrt, false, true);
            for (const [i, v] of ["A", "B", "B", "A"].entries()) {
                if (setze(v === "A") !== (v === "B")) throw new Error(`Variante ${v} nicht gesetzt`);
                wb(["umstellen", "--ort", "genesis", "--sicht", "ego"], 300);
                M[v].push({ f: zelle(`Fahrt ${v}${i}`, "fahrt", SEITE.fahrt, false, true), g: zelle(`Gehen ${v}${i}`, "bahn", SEITE.geh, false, true) }); // prettier-ignore
            }
            // die letzte Fahrt (B) nennt den Grund jedes Bruchs je Anker
            setze(false);
            wb(["umstellen", "--ort", "genesis", "--sicht", "ego"], 300);
            ev(HALT_GRUND);
            const fg = zelle("Fahrt Grund", "fahrt", SEITE.fahrt, false, true);
            const grund = ev(
                "const g = window.__haltGrund; const P = Object.getPrototypeOf(r); P._passLageHaelt = P.__haltRoh; return g;"
            );
            zeile(`GEH-AB GRÜN Halt der Lage in Fahrt B (${fg ? fg.a.frames : "?"} Bilder, je Anker gehalten/Grund des Bruchs): ${JSON.stringify(grund)}`); // prettier-ignore
            // je Zelle: Bild p50/p95/max, Anteil über 33 ms, die Mitte der Sicht und des Planers (ms je Takt), der CPU-Takt p50
            const mitte = (x, w) => x.s.zeilen.filter((z) => w.test(kurz(z.name))).reduce((n, z) => n + z.mitteMs, 0);
            const kennung = (x) => x ? `${x.a.frameMs.p50}/${x.a.frameMs.p95}/${x.a.frameMs.max} ${(100 * x.anteil).toFixed(1)}% Sicht ${mitte(x, /^_passSicht$/).toFixed(1)} Planer ${mitte(x, /^_runFrameScheduler$/).toFixed(1)} CPU ${x.s.cpuMs.p50} n${x.a.frames}` : "?"; // prettier-ignore
            const med = (l) => l.slice().sort((x, y) => x - y)[(l.length - 1) >> 1];
            for (const [art, k] of [
                ["Fahrt", "f"],
                ["Gehen", "g"],
            ]) {
                const p95 = (v) => med(M[v].map((m) => (m[k] ? m[k].a.frameMs.p95 : Infinity)));
                const anteil = (v) => med(M[v].map((m) => (m[k] ? m[k].anteil : 1)));
                const ok = p95("B") <= p95("A") && anteil("B") <= anteil("A");
                gruen = gruen && ok;
                zeile(
                    `GEH-AB ${ok ? "GRÜN" : "ROT"} ${art} Genesis (Bild p50/p95/max · > 33 ms · Mitte je Takt): A ${M.A.map((m) => kennung(m[k])).join(" ; ")} ‖ ` + // prettier-ignore
                        `B ${M.B.map((m) => kennung(m[k])).join(" ; ")} ‖ Median p95 ${p95("A")} → ${p95("B")} ms, > 33 ms ${(100 * anteil("A")).toFixed(1)} → ${(100 * anteil("B")).toFixed(1)} %` // prettier-ignore
                );
            }
        } else {
            steh("genesis", "ego");
            vorwaermZeile("vor dem Gehen");
            zelle("genesis Gehen", "bahn", SEITE.geh, false);
            wb(["umstellen", "--ort", "genesis", "--sicht", "ego"], 300);
            vorwaermZeile("vor der Fahrt Ego");
            zelle("genesis Fahrt Ego", "fahrt", SEITE.fahrt, true);
            wb(["umstellen", "--ort", "genesis", "--sicht", "third"], 300);
            vorwaermZeile("vor der Fahrt Third");
            zelle("genesis Fahrt Third", "fahrt", SEITE.fahrt, true);
        }
    } catch (e) {
        gruen = false;
        zeile(`GEH ROT Error ${String((e && e.stack) || e).slice(0, 400)} · ${tor.log.slice(-300)}`);
    } finally {
        for (const k of kern) console.log(k);
        tor.stop();
    }
    process.exit(gruen ? 0 : 1);
})();
