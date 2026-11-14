// seite-bauen.cjs — die Seite der Meisterkarte 2 ist eine FUNKTION ihrer Datei: liest vision/meisterkarte-2.json und schreibt
// vision/meisterkarte-2.html (eine Datei, kein Netz, hell und dunkel). Aufruf: node vision/seite-bauen.cjs
const fs = require("fs");
const path = require("path");
const j = JSON.parse(fs.readFileSync(path.join(__dirname, "meisterkarte-2.json"), "utf8"));
const esc = (s) =>
    String(s == null ? "" : s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
// kleines Markdown der Texte: `code`, **fett**, *kursiv*
const md = (s) =>
    esc(s)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
        .replace(/\*([^*]+)\*/g, "<i>$1</i>");
const zahl = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const proz = (x) => String(x).replace(".", ",") + " %";
const S = j.summe;

const leiter = (L) => {
    const n = L.sprossen.length;
    const pillen = L.sprossen
        .map((s) => {
            // Kern liegt ÜBER dem Gebuchten (Z5): in Leitern heute+1 … heute+kern, in Glieder-Leitern die Nummern der Buchung
            const kl = L.zaehlung === "glieder"
                ? ((L.heuteSprossen || []).includes(s.nr) ? "ist" : (L.kernSprossen || []).includes(s.nr) ? "kern" : "")
                : s.nr <= (L.heute || 0) ? "ist" : s.nr <= (L.heute || 0) + (L.kern || 0) ? "kern" : "";
            return `<span class="p ${kl}" title="${esc(s.umfang)}">${s.nr}</span>`;
        })
        .join("");
    const zeilen = L.sprossen
        .map(
            (s) =>
                `<tr><td class="nr">${s.nr}</td><td>${md(s.umfang)}</td><td>${md(s.tiefe)}</td><td>${md(s.preis)}</td><td>${md(s.richter)}</td></tr>`
        )
        .join("");
    const marke = L.art === "kopplung" ? '<span class="tag">Kopplung</span>' : "";
    const glied = L.zaehlung === "glieder" ? '<span class="tag">Glieder</span>' : "";
    return `<details class="leiter"><summary><span class="ln">${esc(L.name)}</span>${marke}${glied}<span class="pl">${pillen}</span>
<span class="weg"><b>1</b> ${md(L.sprossen[0].umfang)} <span class="pf">→</span> <b>${n}</b> ${md(L.sprossen[n - 1].umfang)}</span></summary>
<div class="li"><p class="misst"><b>Misst:</b> ${md(L.misst)}</p>
<div class="tw"><table><thead><tr><th>#</th><th>Umfang</th><th>Tiefe</th><th>Preis</th><th>Richter am Ergebnis</th></tr></thead><tbody>${zeilen}</tbody></table></div>
<p class="beleg"><b>Heute:</b> ${md(L.beleg)}</p><p class="id"><code>${esc(L.id)}</code>${L.alt && L.alt.length ? " · alte Karte: " + L.alt.map(esc).join(", ") : ""}</p></div></details>`;
};

const kapitel = j.gruppen
    .map((g) => {
        const persp = g.perspektiven
            .map((p) => {
                // Kopplungs-Leitern tragen die Perspektive „kopplung“; ihre Seite steht im ersten Glied ihrer Kennung
                const Ls = g.kriterien.filter(
                    (L) => L.perspektive === p.id || (L.perspektive === "kopplung" && L.id.split(".")[0] === p.id)
                );
                const kern = Ls.reduce((a, L) => a + (L.kern || 0), 0);
                return `<details class="persp"><summary><span class="pn">${esc(p.name)}</span><span class="pz">${Ls.length} Leitern · ${p.sprossen} Sprossen${kern ? ` · <b class="k">Kern ${kern}</b>` : ""}</span></summary>
<p class="korpus"><b>Gemessen gegen:</b> ${md(p.korpus)}</p>${Ls.map(leiter).join("\n")}</details>`;
            })
            .join("\n");
        return `<section id="${esc(g.id)}"><h2>${esc(g.name)}</h2>
<p class="vision">${md(g.text)}</p><p class="heute">${md(String(g.heuteText || "").replace(/^\*|\*$/g, ""))}</p>
<p class="sz">${g.summe.kriterien} Leitern · ${zahl(g.summe.sprossen)} Sprossen · gebucht ${g.summe.heute} · im Kern ${g.summe.kern} (${proz(g.summe.anteilKern)})</p>
${persp}</section>`;
    })
    .join("\n");

const kacheln = j.gruppen
    .map(
        (g) =>
            `<a class="kachel" href="#${esc(g.id)}"><span class="kn">${esc(g.name)}</span><span class="kz">${zahl(g.summe.sprossen)}</span><span class="ku">Sprossen · ${g.summe.kriterien} Leitern</span><span class="kk">Kern ${g.summe.kern}</span></a>`
    )
    .join("");
const regeln = j.regeln.map((r) => `<li><b>${esc(r.id)} ${esc(r.name)}.</b> ${md(r.satz)}</li>`).join("");
const treppe = j.preisTreppe
    .map(
        (t) =>
            `<tr><td><b>${esc(t.klasse)}</b></td><td>${md(t.umfang)}</td><td>${md(t.bild)}</td><td>${md(t.ankunft)}</td><td>${md(t.speicher)}</td><td>${md(t.bytes)}</td></tr>`
    )
    .join("");
const klassen = j.umfangsKlassen
    .map((t) => `<tr><td><b>${esc(t.wort)}</b></td><td>${md(t.bauten)}</td><td>${md(t.menschen)}</td><td>${md(t.mass)}</td></tr>`)
    .join("");
const offen = j.offen.map((o) => `<li>${md(o)}</li>`).join("");

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Meisterkarte 2</title>
<style>
:root{--bg:#f6f4ef;--fl:#fffdf8;--tx:#1d1b16;--ge:#6b6558;--li:#ddd6c6;--ak:#8a4b12;--ist:#2f7d4f;--kern:#c98a1a;--code:#efe9db}
@media (prefers-color-scheme:dark){:root{--bg:#14130f;--fl:#1c1a15;--tx:#ece6d8;--ge:#a39a86;--li:#34302a;--ak:#e2a25a;--ist:#5fc98a;--kern:#e0b04a;--code:#26231c}}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--tx);font:16px/1.5 "Segoe UI",system-ui,sans-serif}
main{max-width:1180px;margin:0 auto;padding:28px 16px 80px}
h1{font:600 clamp(30px,5vw,52px)/1.05 Georgia,"Times New Roman",serif;margin:0 0 6px;letter-spacing:-.01em}
h2{font:600 30px/1.15 Georgia,serif;margin:56px 0 8px;padding-top:18px;border-top:2px solid var(--tx)}
h3{font:600 20px/1.2 Georgia,serif;margin:40px 0 8px}
.unter{color:var(--ge);margin:0 0 26px}
.zahlen{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:0 0 14px}
.z{background:var(--fl);border:1px solid var(--li);border-radius:10px;padding:16px 18px}
.z b{display:block;font:600 40px/1 Georgia,serif;font-variant-numeric:tabular-nums}
.z span{color:var(--ge);font-size:14px}
.z.haupt b{color:var(--ak)}
.satz{background:var(--fl);border-left:4px solid var(--ak);padding:12px 16px;margin:14px 0;border-radius:0 8px 8px 0}
.kacheln{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:22px 0 0}
.kachel{display:flex;flex-direction:column;background:var(--fl);border:1px solid var(--li);border-radius:10px;padding:12px 14px;color:inherit;text-decoration:none}
.kachel:hover{border-color:var(--ak)}
.kn{font-weight:600;min-height:2.6em;line-height:1.3}.kz{font:600 26px/1.1 Georgia,serif;font-variant-numeric:tabular-nums}.ku{font-size:13px;color:var(--ge)}.kk{font-size:13px;color:var(--kern);font-weight:600;margin-top:4px}
.vision{font:18px/1.5 Georgia,serif;margin:6px 0;max-width:70ch}
.heute{color:var(--ge);margin:4px 0;max-width:80ch}.sz{font-size:14px;color:var(--ge);margin:4px 0 14px;font-variant-numeric:tabular-nums}
details.persp{background:var(--fl);border:1px solid var(--li);border-radius:10px;margin:8px 0;padding:0 14px}
details.persp>summary{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline;justify-content:space-between;cursor:pointer;padding:12px 0;font-weight:600}
.pz{font-weight:400;font-size:14px;color:var(--ge)}.k{color:var(--kern)}
.korpus{font-size:14px;color:var(--ge);margin:0 0 10px}
details.leiter{border-top:1px solid var(--li);padding:0}
details.leiter>summary{display:grid;grid-template-columns:minmax(200px,1fr) auto;gap:4px 12px;align-items:center;cursor:pointer;padding:10px 0}
.ln{font-weight:600}.tag{font-size:11px;border:1px solid var(--li);border-radius:99px;padding:1px 8px;color:var(--ge);margin-left:8px;font-weight:400}
.pl{display:flex;gap:3px;justify-self:end}
.p{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:5px;border:1px solid var(--li);font-size:12px;color:var(--ge);font-variant-numeric:tabular-nums}
.p.ist{background:var(--ist);border-color:var(--ist);color:#fff}.p.kern{background:var(--kern);border-color:var(--kern);color:#1d1b16}
.weg{grid-column:1/-1;font-size:14px;color:var(--ge)}.weg b{color:var(--tx)}.pf{color:var(--ak);padding:0 4px}
.li{padding:2px 0 14px}.misst,.beleg{font-size:14px;margin:6px 0;max-width:110ch}.beleg{color:var(--ge)}.id{font-size:12px;color:var(--ge);margin:6px 0 0}
.tw{overflow-x:auto;border:1px solid var(--li);border-radius:8px;margin:8px 0}
table{border-collapse:collapse;width:100%;font-size:13.5px;min-width:760px}
th,td{text-align:left;vertical-align:top;padding:7px 10px;border-top:1px solid var(--li)}thead th{border-top:0;color:var(--ge);font-weight:600;background:var(--code)}
td.nr{font-weight:600;font-variant-numeric:tabular-nums;color:var(--ak)}
code{background:var(--code);border-radius:4px;padding:0 4px;font:13px/1.4 Consolas,monospace;word-break:break-word}
ul.regeln{padding-left:20px}ul.regeln li{margin:6px 0;max-width:110ch}
details.klapp{background:var(--fl);border:1px solid var(--li);border-radius:10px;padding:0 14px;margin:10px 0}details.klapp>summary{cursor:pointer;font-weight:600;padding:12px 0}
summary::marker{color:var(--ak)}
.leg{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--ge);margin:16px 0 0}.leg .p{margin-right:6px}
</style></head><body><main>
<h1>${esc(j.titel)}</h1>
<p class="unter">Stand ${esc(j.stand)} · ${esc(j.fassung)} · ${S.kapitel} Kapitel · ${S.perspektiven} Perspektiven</p>
<div class="zahlen">
<div class="z haupt"><b>${S.heute} / ${zahl(S.sprossen)}</b><span>Sprossen gebucht (${proz(S.anteilHeute)}) — erreicht heißt: der eigene Richter misst im echten Spiel GRÜN und der Preis hält in derselben Fahrt</span></div>
<div class="z"><b>${S.kern}</b><span>Sprossen im Kern (${proz(S.anteilKern)}) — die Welt zeigt es im Spiel an beiden Geräten, der Preis oder die Fahrt des Richters fehlt</span></div>
<div class="z"><b>${S.kriterien}</b><span>Leitern, davon ${S.davonKopplungen} Kopplungen · Fuß der Leitern: ${S.fuss.kern} im Kern, ${S.fuss.gemessen} von der alten Karte gemessen, ${S.fuss.ungemessen} nie gemessen</span></div>
</div>
<p class="satz">Jede Leiter steigt über Größenordnungen; ihre oberste Sprosse ist die Vision. Ein Punkt ist eine Sprosse. Die alte Karte (223 von 330) misst den Fuß dieser Leitern — darum stehen hier wenige Prozent, und das ist die ehrliche Zahl.</p>
<div class="kacheln">${kacheln}</div>
<div class="leg"><span><span class="p ist">n</span>gebucht</span><span><span class="p kern">n</span>im Kern</span><span><span class="p">n</span>offen</span><span>Eine Leiter aufklappen zeigt jede Sprosse mit Umfang, Tiefe, Preis und Richter.</span></div>
${kapitel}
<h2>Regeln und Tafeln</h2>
<details class="klapp"><summary>Die Regeln R1–R11 und die Zählung Z1–Z8</summary><ul class="regeln">${regeln}</ul></details>
<details class="klapp"><summary>Die Preis-Treppe</summary><div class="tw"><table><thead><tr><th>Klasse</th><th>Umfang</th><th>Bild und Ton</th><th>Ankunft</th><th>Speicher</th><th>Bytes</th></tr></thead><tbody>${treppe}</tbody></table></div></details>
<details class="klapp"><summary>Die Umfangs-Klassen</summary><div class="tw"><table><thead><tr><th>Wort</th><th>Bauten</th><th>Menschen</th><th>Maß</th></tr></thead><tbody>${klassen}</tbody></table></div></details>
<details class="klapp"><summary>Offene Fragen (${j.offen.length}) — noch ohne Richter, darum ohne Punkt</summary><ul class="regeln">${offen}</ul></details>
</main></body></html>
`;
fs.writeFileSync(path.join(__dirname, "meisterkarte-2.html"), html);
console.log(`meisterkarte-2.html: ${Math.round(html.length / 1024)} KB · ${j.gruppen.length} Kapitel · ${S.kriterien} Leitern · ${S.sprossen} Sprossen`);
