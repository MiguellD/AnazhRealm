#!/usr/bin/env node
// Meisterkarte 2.0 — die Ansicht: meisterkarte.json -> meisterkarte.html (Seiten-Inhalt ohne eigenes doctype/head; der Artifact-
// Rahmen legt es darum). Aufruf: node ansicht.cjs [json] [html]
"use strict";
const fs = require("fs");
const path = require("path");
const jsonPfad = process.argv[2] || path.join(__dirname, "..", "meisterkarte.json");
const htmlPfad = process.argv[3] || path.join(__dirname, "..", "meisterkarte.html");
const m = JSON.parse(fs.readFileSync(jsonPfad, "utf8"));

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const md = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
const de = (x, d = 2) => Number(x).toFixed(d).replace(".", ",");
const halb = (x) => { const g = Math.floor(x), r = x - g; if (r === 0) return String(g); if (Math.abs(r - 0.5) < 1e-9) return (g ? String(g) : "") + "½"; return de(x, 1); };
const tage = (t) => (Array.isArray(t) ? (t[0] === t[1] ? halb(t[0]) : halb(t[0]) + "–" + halb(t[1])) : String(t)) + " d";
const punkte = (p) => `<span class="dots" aria-label="${p} von 2"><i${p >= 1 ? ' class="an"' : ""}></i><i${p >= 2 ? ' class="an"' : ""}></i></span>`;
const balken = (p, max, gross) => `<div class="bar${gross ? " gross" : ""}" role="img" aria-label="${p} von ${max}"><span style="width:${Math.max(0, Math.min(100, Math.round((100 * p) / max)))}%"></span></div>`;
const erster = (s) => { const t = String(s || ""); const i = t.search(/[.!?](\s|$)/); return i > 0 ? t.slice(0, i + 1) : t; };
const bestHebel = (b) => (b.hebel || []).slice().sort((x, y) => (y.p_je_tag || 0) - (x.p_je_tag || 0))[0];

// DER WEG ZU 330 (punkte/weg.json): jede offene Staffel mit Klasse, Aufwand und Wahrscheinlichkeit aus der Triage, dazu die
// Wellen im Bau. Was die Buchung schon trägt, fällt heraus — die Segmente summieren sich immer auf max; was keine Zeile trägt,
// steht offen als „ohne Triage".
const wegPfad = path.join(__dirname, "punkte", "weg.json");
const weg = fs.existsSync(wegPfad) ? JSON.parse(fs.readFileSync(wegPfad, "utf8")) : null;
const erreicht = (id) => {
    const [bk, rest] = id.split(".K");
    const [k, s] = rest.split("#").map(Number);
    const b = m.bereiche.find((x) => x.key === bk);
    return !!b && b.kriterien[k - 1].punkte >= s;
};
const WEG_KLASSEN = [
    ["gebucht", "gebucht", "am Kopf gemessen und gebucht"],
    ["welle", "in Arbeit", "Zweig gebaut oder Karte läuft — fällt mit Zug und Messung"],
    ["nur-station", "nur die Station fehlt", "das Verhalten steht im Spiel, es fehlt Werkzeug und Station (≤ 4 h)"],
    ["schnitt+station", "Schnitt + Station", "ein Schnitt ≤ 1 Tag an EINER Wurzel, dann die Station"],
    ["gpu-rot", "Station rot", "die Station steht und ist rot, der Täter steht beim Namen"],
    ["gesetz", "neues Gesetz", "ein Gesetz oder Teilsystem, mehr als 1 Tag"],
    ["pflicht", "an Pflicht-Offen", "fällt erst mit A, B, C oder E"],
];
const wegSektion = () => {
    if (!weg) return "";
    const inWelle = new Map();
    for (const w of weg.wellen) for (const [id, z] of Object.entries(w.staffeln)) if (!erreicht(id)) inWelle.set(id, z);
    const offen = weg.staffeln.filter((s) => !erreicht(s.id) && !inWelle.has(s.id));
    const n = { gebucht: m.summe, welle: inWelle.size };
    const h = {}, ew = {}, karten = {};
    for (const s of offen) {
        n[s.klasse] = (n[s.klasse] || 0) + 1;
        h[s.klasse] = (h[s.klasse] || 0) + s.h;
        ew[s.klasse] = (ew[s.klasse] || 0) + s.sicher;
        (karten[s.klasse] = karten[s.klasse] || new Set()).add(s.buendel || s.id);
    }
    const rest = m.max - WEG_KLASSEN.reduce((a, [k]) => a + (n[k] || 0), 0);
    const zeilen = WEG_KLASSEN.map(([k, name, was], i) => ({ k, name, was, i, n: n[k] || 0 }));
    if (rest > 0) zeilen.push({ k: "rest", name: "ohne Triage", was: "offen, ohne Zeile in weg.json", i: 7, n: rest });
    const seg = zeilen.filter((z) => z.n > 0).map((z) => `<span class="w${z.i}" style="flex-grow:${z.n}" title="${esc(z.name)}: ${z.n} Punkte"></span>`).join("");
    // die nächsten Karten: Bündel aus Station, Schnitt und Röte nach erwarteten Punkten je Macher-Stunde
    const b = new Map();
    for (const s of offen.filter((x) => ["nur-station", "schnitt+station", "gpu-rot"].includes(x.klasse))) {
        const key = s.buendel || s.id;
        const e = b.get(key) || { key, ids: [], h: 0, ew: 0, gpu: false, karte: s.karte };
        e.ids.push(s.id); e.h += s.h; e.ew += s.sicher; e.gpu = e.gpu || s.geraet === "gpu";
        b.set(key, e);
    }
    const top = [...b.values()].sort((x, y) => y.ew / y.h - x.ew / x.h).slice(0, 10);
    const hSum = offen.reduce((a, s) => a + s.h, 0);
    const ewSum = offen.reduce((a, s) => a + s.sicher, 0);
    return `
  <section aria-labelledby="h-weg">
    <h2 id="h-weg">Der Weg zu ${m.max}</h2>
    <p class="sub">Jede der ${m.max - m.summe} offenen Staffeln trägt eine Klasse, einen Aufwand in Macher-Stunden und eine Wahrscheinlichkeit, dass ihre Karte den Punkt am Gerät holt (${esc(weg.quelle)}). Offen ohne Welle: ${offen.length} Staffeln, ≈ ${Math.round(hSum)} Macher-Stunden, erwartet ≈ ${Math.round(ewSum)} Punkte beim ersten Anlauf.</p>
    <div class="flaeche">
      <div class="weg-bar" role="img" aria-label="${zeilen.filter((z) => z.n > 0).map((z) => z.name + " " + z.n).join(", ")} von ${m.max}">${seg}</div>
      <table class="weg-tafel">
        <thead><tr><th scope="col">Klasse</th><th scope="col" class="z">Punkte</th><th scope="col" class="z">Macher-h</th><th scope="col" class="z">erwartet</th><th scope="col" class="z">Karten</th></tr></thead>
        <tbody>
${zeilen.map((z) => `          <tr><td><i class="w${z.i}" aria-hidden="true"></i><strong>${esc(z.name)}</strong><span class="meta"> — ${esc(z.was)}</span></td><td class="z">${z.n}</td><td class="z">${h[z.k] ? Math.round(h[z.k]) : "—"}</td><td class="z">${ew[z.k] ? de(ew[z.k], 1) : "—"}</td><td class="z">${karten[z.k] ? karten[z.k].size : z.k === "welle" ? new Set(inWelle.values()).size : "—"}</td></tr>`).join("\n")}
        </tbody>
      </table>
    </div>
    <h3 style="margin-top:16px">Die nächsten Karten (erwartete Punkte je Macher-Stunde)</h3>
    <ol class="liste top" style="margin-top:8px">
${top.map((e) => `      <li class="flaeche"><div class="kopf"><strong>${esc(e.key)}</strong><span class="rate">+${e.ids.length} · ${Math.round(e.h)} h · ${e.gpu ? "GPU" : "headless"}</span></div><p class="meta">${esc(e.ids.join(" · "))} — ${md(erster(e.karte))}</p></li>`).join("\n")}
    </ol>
  </section>`;
};

const altSkala = m.verlauf.filter((v) => v.skala !== "2.0");
const neuSkala = m.verlauf.filter((v) => v.skala === "2.0");
const verlaufText = `Alte Skala (9 Bereiche, max 90): ${altSkala.map((v) => `${v.stand.slice(8, 10)}.${v.stand.slice(5, 7)}. ${v.summe}`).join(" · ")}. Neue Skala (33 Bereiche, max 330): ${neuSkala.map((v) => `${v.stand.slice(8, 10)}.${v.stand.slice(5, 7)}. ${v.summe}`).join(" · ")}.`;

const karte = (b) => {
    const h = bestHebel(b);
    return `      <article class="flaeche karte">
        <div class="kopf"><h3>${esc(b.titel)}</h3><span class="punkte">${b.punkte}/10</span></div>
        ${balken(b.punkte, 10)}
        <ul class="krit">
${b.kriterien.map((k) => `          <li><span>${md(k.name)}</span>${punkte(k.punkte)}</li>`).join("\n")}
        </ul>
        <p class="pfad">${md(b.pfad || "")}</p>
        <details><summary>10/10 und Messung</summary>
          <p class="vision">${md(b.aaaa)}</p>
          <ul class="mess">
${b.kriterien.map((k) => `            <li><strong>${md(k.name)}</strong> — ${md(k.messung)}${k.beleg ? `<br><span class="beleg">Heute: ${md(k.beleg)}</span>` : ""}</li>`).join("\n")}
          </ul>
        </details>
        ${h ? `<p class="hebel"><span class="marke">Nächster Hebel:</span> ${md(h.name)} · +${h.punkte} · ${tage(h.tage)} · ${de(h.p_je_tag || 0)} P/d</p>` : ""}
      </article>`;
};

const gruppe = (g) => {
    const bs = g.bereiche.map((k) => m.bereiche.find((b) => b.key === k)).filter(Boolean);
    return `  <section aria-labelledby="g-${g.key}">
    <div class="gkopf"><h2 id="g-${g.key}">${esc(g.titel)}</h2><span class="punkte">${g.summe}/${g.max}</span></div>
    ${g.intro ? `<p class="sub">${md(erster(g.intro))}</p>` : ""}
    <div class="grid">
${bs.map(karte).join("\n")}
    </div>
  </section>`;
};

const html = `<title>Meisterkarte</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
  /* Ein Prüfbogen: eine Summe oben, dann Gruppen von Bereichskarten; Grün nur für erreichte Punkte. */
  :root {
    --bg: #f5f4ef; --fg: #1c1e20; --muted: #5c6166; --card: #ffffff; --line: #e2dfd6; --track: #e9e6dd;
    --fill: #2f6f5e; --fill-strong: #245a4c; --dot-off: #d3cfc4; --chip: #e6efea; --chip-fg: #245a4c; --code: #efece4;
    /* der Weg zu 330: EINE Grün-Rampe nach Nähe zum Punkt (gebucht am dunkelsten), ordinal validiert gegen die Fläche */
    --w0: #0f3029; --w1: #1b4a3e; --w2: #286253; --w3: #377a68; --w4: #49917d; --w5: #5ea692; --w6: #77b8a4; --w7: #d3cfc4;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark; --bg: #111315; --fg: #e7e5e0; --muted: #9ba1a7; --card: #1a1d20; --line: #2a2e32; --track: #2a2e33;
      --fill: #5fb497; --fill-strong: #8fd3bc; --dot-off: #3a4045; --chip: #1f2a26; --chip-fg: #8fd3bc; --code: #22262a;
      --w0: #b5e8d8; --w1: #94d4c0; --w2: #76bea7; --w3: #5da68f; --w4: #4a8e78; --w5: #3b7764; --w6: #306253; --w7: #3a4045;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark; --bg: #111315; --fg: #e7e5e0; --muted: #9ba1a7; --card: #1a1d20; --line: #2a2e32; --track: #2a2e33;
    --fill: #5fb497; --fill-strong: #8fd3bc; --dot-off: #3a4045; --chip: #1f2a26; --chip-fg: #8fd3bc; --code: #22262a;
    --w0: #b5e8d8; --w1: #94d4c0; --w2: #76bea7; --w3: #5da68f; --w4: #4a8e78; --w5: #3b7764; --w6: #306253; --w7: #3a4045;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  main { max-width: 1120px; margin: 0 auto; padding-block: 24px 40px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  h1 { font-size: 1.75rem; line-height: 1.2; margin: 0 0 4px; letter-spacing: -0.01em; text-wrap: balance; }
  h2 { font-size: 1.125rem; margin: 0; text-wrap: balance; }
  h3 { font-size: 1rem; margin: 0; min-width: 0; }
  p, li, h1, h2, h3, summary { overflow-wrap: break-word; hyphens: auto; }
  code { font-family: ui-monospace, "Cascadia Mono", Consolas, monospace; font-size: 0.85em; background: var(--code); padding: 0 3px; border-radius: 3px; }
  section { margin-top: 32px; }
  .sub { color: var(--muted); margin: 4px 0 14px; font-size: 0.9rem; max-width: 75ch; }
  .flaeche { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px; }
  .zahl { font-size: 2.5rem; font-weight: 650; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .zahl small { font-size: 1.1rem; font-weight: 500; color: var(--muted); margin-left: 4px; }
  .bar { height: 8px; background: var(--track); border-radius: 999px; overflow: hidden; }
  .bar > span { display: block; height: 100%; background: var(--fill); border-radius: inherit; min-width: 2px; }
  .bar.gross { height: 12px; margin: 10px 0 12px; }
  .summe p { margin: 0 0 6px; font-size: 0.95rem; }
  .vision-text p { margin: 0 0 10px; max-width: 80ch; }
  .gkopf { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; border-bottom: 1px solid var(--line); padding-bottom: 6px; }
  .kopf { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .punkte, .rate { font-weight: 650; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .rate { color: var(--fill-strong); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 12px; }
  .karte { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .krit, .mess { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 0.88rem; }
  .krit li { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .mess li { font-size: 0.85rem; }
  .beleg { color: var(--muted); }
  .dots { display: inline-flex; gap: 4px; flex: none; }
  .dots i { display: block; width: 10px; height: 10px; border-radius: 50%; background: var(--dot-off); }
  .dots i.an { background: var(--fill); }
  .pfad { margin: 0; color: var(--muted); font-size: 0.8rem; }
  .vision { color: var(--muted); font-size: 0.88rem; margin: 8px 0; }
  .hebel { border-top: 1px solid var(--line); padding-top: 10px; margin: auto 0 0; font-size: 0.88rem; }
  .marke { font-weight: 600; }
  details summary { cursor: pointer; color: var(--fill-strong); font-size: 0.88rem; }
  details summary:focus-visible { outline: 2px solid var(--fill); outline-offset: 2px; border-radius: 4px; }
  .liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
  .top { counter-reset: top; }
  .top li { position: relative; padding-left: 52px; }
  .top li::before { counter-increment: top; content: counter(top); position: absolute; left: 16px; top: 15px; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: var(--chip); color: var(--chip-fg); font-size: 0.85rem; font-weight: 650; }
  .meta { color: var(--muted); font-size: 0.875rem; margin: 2px 0 0; }
  .regeln li { font-size: 0.9rem; }
  .weg-bar { display: flex; gap: 2px; height: 28px; margin: 4px 0 14px; }
  .weg-bar > span { display: block; min-width: 3px; flex-basis: 0; }
  .weg-bar > span:first-child { border-radius: 4px 0 0 4px; }
  .weg-bar > span:last-child { border-radius: 0 4px 4px 0; }
  .w0 { background: var(--w0); } .w1 { background: var(--w1); } .w2 { background: var(--w2); } .w3 { background: var(--w3); }
  .w4 { background: var(--w4); } .w5 { background: var(--w5); } .w6 { background: var(--w6); } .w7 { background: var(--w7); }
  .weg-tafel { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  .weg-tafel th { text-align: left; color: var(--muted); font-weight: 500; padding: 4px 8px 6px 0; border-bottom: 1px solid var(--line); }
  .weg-tafel td { padding: 6px 8px 6px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
  .weg-tafel .z { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .weg-tafel td i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 8px; vertical-align: baseline; }
  @media (max-width: 560px) { .weg-tafel .meta { display: none; } }
  footer { color: var(--muted); font-size: 0.85rem; margin-top: 32px; }
  footer p { margin: 0 0 4px; }
</style>
<main>
  <header>
    <h1>Meisterkarte 2.0</h1>
    <p class="sub">Ultiversum · Stand ${esc(m.stand.slice(8, 10))}.${esc(m.stand.slice(5, 7))}.${esc(m.stand.slice(0, 4))} · main ${esc(m.kopf)} (${esc(m.version)}) · ${m.bereiche.length} Bereiche × 5 Kriterien × 2 Punkte</p>
    <section class="flaeche summe" aria-label="Gesamtstand" style="margin-top:12px">
      <div class="zahl">${m.summe}<small>/ ${m.max}</small></div>
      ${balken(m.summe, m.max, true)}
      <p>${esc(verlaufText)}</p>
      <p>Das Lineal misst jetzt, was der Spieler erlebt: ungemessen zählt 0, ein Punkt gilt nur frisch am Kopf, der Prüf-Apparat zählt nie. Die Welt ist nicht schlechter geworden; 30/90 und ${m.summe}/${m.max} messen verschiedene Dinge.</p>
      <p class="meta">${md(m.text.messschuldErwartung)}</p>
    </section>
  </header>
${wegSektion()}

  <section aria-labelledby="h-vision">
    <h2 id="h-vision">Was AnazhRealm im AAAA-Zustand ist</h2>
    <div class="vision-text" style="margin-top:12px">
${m.text.aaaaKopf.map((p) => `      <p>${md(p)}</p>`).join("\n")}
    </div>
  </section>

  <section aria-labelledby="h-top">
    <h2 id="h-top">Die nächsten Hebel (Punkte je Tag, nur v1-Pfad oder Pflicht)</h2>
    <ol class="liste top" style="margin-top:12px">
${m.top5.map((t) => `      <li class="flaeche"><div class="kopf"><strong>${md(t.hebel)}</strong><span class="rate">${de(t.p_je_tag || 0)} P/d</span></div><p class="meta">${esc((m.bereiche.find((b) => b.key === t.bereich) || {}).titel || t.bereich)} · +${t.punkte} · ${tage(t.tage)}${t.pflicht ? " · " + md(t.pflicht) : ""}</p></li>`).join("\n")}
    </ol>
  </section>

  <section aria-labelledby="h-fest">
    <h2 id="h-fest">Wo wir feststecken — und der andere Weg</h2>
    <ul class="liste" style="margin-top:12px">
${m.text.feststeck.map((f) => `      <li class="flaeche"><details><summary><strong>${md(f[0])}</strong></summary><p class="meta">${md(f.slice(1).join(" · "))}</p></details></li>`).join("\n")}
    </ul>
  </section>

${m.gruppen.map(gruppe).join("\n\n")}

  <section aria-labelledby="h-regeln">
    <h2 id="h-regeln">Das Gesetz der Belohnung</h2>
    <ul class="liste regeln" style="margin-top:12px">
${m.text.regeln.map((r) => `      <li><details><summary><strong>${md(r[0])}</strong> — ${md(erster(r[1]))}</summary><p class="meta">${md(r[1])}</p></details></li>`).join("\n")}
    </ul>
  </section>

  <section aria-labelledby="h-schuld">
    <h2 id="h-schuld">Messschuld (wird erst mit der Messung am Kopf gebucht)</h2>
    <ul class="liste" style="margin-top:12px">
${m.messschuld.map((s) => `      <li class="meta"><strong>${esc(s.id)}</strong> · ${esc(s.kriterium)} · ${md(s.messung)} — erwartet ${md(s.erwartung)}</li>`).join("\n")}
    </ul>
  </section>

  <footer>
    <p>Punkte je Kriterium: 2 = alle Pflicht-Posen auf Radeon 890M UND GTX 1060 frisch am Kopf · 1 = eine Spieler-Pose auf einem Gerät · 0 = fehlt, ROT oder ungemessen.</p>
    <p>Quelle: MEISTERKARTE.md und meisterkarte.json im Zweig koordination (erzeugt mit gen.cjs, diese Ansicht mit ansicht.cjs).</p>
  </footer>
</main>
`;
fs.writeFileSync(htmlPfad, html);
console.log(`Ansicht ${htmlPfad}: ${(html.length / 1024).toFixed(0)} KB, ${m.bereiche.length} Bereiche, Summe ${m.summe}/${m.max}`);
