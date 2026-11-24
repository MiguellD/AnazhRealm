"use strict";
const fs = require("fs"), path = require("path"), { execFileSync, spawnSync } = require("child_process");
const REPO = "C:/Users/micha/AnazhRealm-profiband";
const S = __dirname;
const AKT = path.join(S, "pm", "vision", "richter");
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", maxBuffer: 1 << 28 });
const ok = (...a) => spawnSync("git", ["-C", REPO, ...a]).status === 0;

// Karte jetzt und am Beginn des 24.11.
const karte = JSON.parse(fs.readFileSync(path.join(S, "karte.json"), "utf8"));
const alt = git("log", "-1", "--before=2026-11-24T00:00:00+01:00", "--format=%H", "origin/punkte-maschine", "--", "vision/meisterkarte-2.json").trim();
const karteAlt = JSON.parse(git("show", alt + ":vision/meisterkarte-2.json"));
const L = (k) => { const m = new Map(); for (const g of k.gruppen) for (const c of g.kriterien) m.set(c.id, c); return m; };
const LJ = L(karte), LA = L(karteAlt);
const gebucht = (M, id, nr) => { const c = M.get(id); if (!c) return null; return c.zaehlung === "glieder" ? (c.heuteSprossen || []).includes(nr) : nr <= (c.heute || 0); };

// Ansprüche
const txt = git("show", "origin/koordination:zug/anspruch.txt").split("\n");
const zeilen = []; let kom = null;
for (const z of txt) {
  if (z.startsWith("#")) { kom = z; continue; }
  const m = /^(\S+) (\S+)/.exec(z); if (!m) continue;
  zeilen.push({ kom, zweig: m[1], ids: m[2].split(",") });
}
// Landung: main-SHA oder Stations-SHA (punkte-maschine)
const voll = new Map();
const rp = (s) => { if (!voll.has(s)) { try { voll.set(s, git("rev-parse", s + "^{commit}").trim()); } catch { voll.set(s, null); } } return voll.get(s); };
const zeit = (h) => git("show", "-s", "--format=%cI", h).trim();
const anc = new Map();
const istAhn = (a, b) => { const k = a + b; if (!anc.has(k)) anc.set(k, ok("merge-base", "--is-ancestor", a, b)); return anc.get(k); };

// Akten-Index
const idx = new Map();
for (const f of fs.readdirSync(AKT)) {
  const m = /^(.+)\.(\d+)\.([0-9a-f]{8})-(gtx|radeon)\.json$/.exec(f); if (!m) continue;
  const k = m[1] + "#" + m[2]; if (!idx.has(k)) idx.set(k, []); idx.get(k).push({ f, g: m[4] });
}
const lies = (f) => { const j = JSON.parse(fs.readFileSync(path.join(AKT, f), "utf8")); return Array.isArray(j) ? j : [j]; };

// Mess-Dateien der Köpfe seit 21.11.
const mainSeit = new Set(fs.readFileSync(path.join(S, "main-seit.txt"), "utf8").split(/\s+/).filter(Boolean));
const messListe = git("ls-tree", "--name-only", "origin/punkte-maschine", "meisterkarte-quelle/punkte/messung/").split("\n")
  .map((p) => /\/([0-9a-f]{8})-(gtx|radeon)\.json$/.exec(p)).filter(Boolean).filter((m) => [...mainSeit].some((h) => h.startsWith(m[1])));
const mess = [];
for (const m of messListe) {
  try { const j = JSON.parse(git("show", "origin/punkte-maschine:meisterkarte-quelle/punkte/messung/" + m[0].slice(1))); mess.push({ k8: m[1], g: m[2], j, h: rp(m[1]) }); } catch {}
}

const R = git("show", "origin/koordination:zug/runde.txt"); const liste = {}; for (const z of R.split("\n")) { const m = /^(gtx|radeon) (\S+) .*? liste (\S+)/.exec(z); if (m) liste[m[1]] = m[3].replace("|", ",").split(","); }
const kurz = (s, n = 140) => String(s || "").replace(/\s+/g, " ").slice(0, n);
const art = (w) => /fehlender Leser|Leser fehlt/.test(w) ? "Leser fehlt" : /Umfang nicht erzeugbar|nicht erzeugbar/.test(w) ? "Umfang" : "Soll verfehlt";
const summe24 = {}; const out = [], summe = {}, jeZeile = [];
for (const Z of zeilen) {
  const mm = /\((main|punkte-maschine[^ ]*) ([0-9a-f]{8})/.exec(Z.kom || "") || ((x) => x && [x[0], "main", x[1]])(/→ ([0-9a-f]{8})/.exec(Z.kom || ""));
  const istMain = mm && mm[1] === "main";
  const land = mm ? rp(mm[2]) : null;
  const landZeit = land ? zeit(land) : null;
  if (landZeit && landZeit < "2026-11-22") continue;
  const kopf = kurz((Z.kom || "").replace(/^# /, ""), 60);
  for (const id of Z.ids) {
    const m = /^karte2\.(.+)#(\d+)$/.exec(id); const lid = m[1], nr = +m[2];
    const jetzt = gebucht(LJ, lid, nr), vorher = gebucht(LA, lid, nr);
    const c = LJ.get(lid);
    const front = c ? (c.zaehlung === "glieder" ? "glieder" : "heute " + (c.heute || 0)) : "—";
    // jüngste Akte je Gerät
    const je = {};
    for (const a of idx.get(lid + "#" + nr) || []) for (const f of lies(a.f)) {
      const gg = (f.geraete || []).find((x) => (a.g === "gtx" ? /1060/ : /890m/i).test(x.geraet)); if (!gg) continue;
      const e = { sha: f.sha, datum: f.datum, r: gg.richter.urteil, w: gg.richter.wert, p: gg.preis ? gg.preis.urteil : "FEHLT", heap: gg.preis && (gg.preis.posten ? gg.preis.posten.heap_mb : gg.preis.heap_mb) };
      if (!je[a.g] || e.datum > je[a.g].datum) je[a.g] = e;
    }
    for (const g of Object.keys(je)) {
      const e = je[g];
      e.nach = istMain ? istAhn(land, e.sha) : landZeit ? e.datum > landZeit : false;
    }
    // ungemessen an Köpfen nach der Landung
    let ung = null;
    for (const M of mess) {
      if (istMain ? !istAhn(land, M.h) : (M.j.zeit || "") < landZeit) continue;
      const u = (M.j.ungemessen || {})[id];
      if (u && (!ung || (M.j.zeit || "") > ung.z)) ung = { z: M.j.zeit || "", g: M.g, k8: M.k8, grund: kurz(u.grund || JSON.stringify(u), 110) };
    }
    const nach = Object.entries(je).filter(([, e]) => e.nach);
    let kl, warum = "";
    if (jetzt) kl = "GEBUCHT", warum = vorher ? "schon vor 24.11. gebucht" : "am 24.11. gebucht";
    else if (!nach.length) {
      if (ung) kl = "UNGEMESSEN", warum = `${ung.g}@${ung.k8}: ${ung.grund}`;
      else kl = "NICHT NACHGEMESSEN", warum = "keine Akte und kein ungemessen-Eintrag an einem Kopf nach der Landung";
    } else {
      const rot = nach.filter(([, e]) => e.r === "ROT");
      const altRot = Object.entries(je).filter(([, e]) => !e.nach && e.r === "ROT");
      if (rot.length) { const w = String(rot[0][1].w); kl = "ROT NACH DER LANDUNG"; warum = `[${art(w)}] ${rot[0][0]}: ${kurz(w)}`; }
      else {
        const pr = nach.filter(([, e]) => e.p !== "GRÜN");
        if (altRot.length) { kl = "GRÜN UNGEBUCHT"; warum = `Nachwache: ${altRot[0][0]} trägt ROT von vor der Landung (${altRot[0][1].sha.slice(0, 8)} ${altRot[0][1].datum.slice(5, 16)}): ${kurz(altRot[0][1].w, 90)}`; }
        else if (pr.length === nach.length) { kl = "GRÜN, PREIS ROT"; warum = pr.map(([g, e]) => `${g} Preis ${e.p} (Heap ${e.heap})`).join(" · "); }
        else {
          kl = "GRÜN UNGEBUCHT";
          const tiefer = c && c.zaehlung !== "glieder" && nr > (c.heute || 0) + 1 ? `Front: Leiter heute ${c.heute}, Sprosse ${c.heute + 1} fehlt` : "";
          warum = tiefer || "Buchung nach der Akte noch nicht gelaufen oder Kopf nicht main-Linie";
        }
      }
    }
    summe[kl] = (summe[kl] || 0) + 1; if (landZeit >= "2026-11-24" && /^w28-/.test(Z.zweig)) summe24[kl] = (summe24[kl] || 0) + 1;
    const a = (g) => je[g] ? `${je[g].sha.slice(0, 8)} ${je[g].datum.slice(5, 16)} ${je[g].r}/${je[g].p}${je[g].nach ? " ✓L" : " ✗L"}` : "—";
    out.push(`| ${Z.zweig} | ${mm ? mm[2] : "—"} ${landZeit ? landZeit.slice(5, 16) : ""} | ${lid}#${nr} | ${front} | ${jetzt ? "ja" : "nein"} | ${["gtx","radeon"].map((g)=>g[0]+(liste[g].indexOf(id)+1||"–")).join(" ")} | ${a("radeon")} | ${a("gtx")} | ${kl} | ${warum.replace(/\|/g, "/")} |`);
    jeZeile.push({ zweig: Z.zweig, id, kl });
  }
}
const kopfZ = ["# Umsatz-Tafel der Ansprüche (zug/anspruch.txt ab 22.11.)", "",
  `Karte: origin/punkte-maschine vision/meisterkarte-2.json (Buchung 9e1ceb7f, am Kopf 499f8b57); Vergleich Beginn 24.11.: ${alt.slice(0, 8)}. Akten: koordination 70bce02a (3 132). ✓L = der Akten-Kopf trägt die Landung (merge-base --is-ancestor; pm-Zeilen: Akten-Datum nach dem Stations-Commit). Urteil = Richter/Preis.`, "",
  "## Summen", "", ...Object.entries(summe).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v}`), `- Summe Einträge: ${out.length}`, "", "Nur Landungen des 24.11. (w28-Zeilen): " + JSON.stringify(summe24), "",
  "| Zweig | Landung | Sprosse | Leiter | gebucht | Platz R22 | Radeon jüngste | GTX jüngste | Klasse | Grund |", "|---|---|---|---|---|---|---|---|---|---|"];
fs.writeFileSync(path.join(S, "tafel.md"), kopfZ.concat(out).join("\n") + "\n");
fs.writeFileSync(path.join(S, "tafel.json"), JSON.stringify(jeZeile));
console.log(JSON.stringify(summe24),JSON.stringify(summe), out.length, "mess", mess.length);
