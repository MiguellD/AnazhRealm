// 1110-9 Nachtrag: die Schalter des Band-Täters in EINER Sitzung (B torwurf, Genesis). node schalter.cjs <port> <name> <an|aus>
//   zwilling-stoff: die Tor-Zwillinge (Instanz-Gruppen f:<tor>|…, shadowTwin) tragen einen schlichten Stoff (kein Atlas-Alpha,
//                   kein alphaTest, kein Wind) statt des EINEN Schatten-Stoffs
//   fern-march:     die Fernform-Felder der Tore (entry._ziegelSlot) bleiben aus (Hülle um _weltFeldAktiv)
//   zwilling-weg:   die Tor-Zwillinge zeichnen nicht (die Kaskaden ohne Tor-Wurf)
"use strict";
const http = require("http");
const [port, name, wie] = process.argv.slice(2);
const an = wie === "an";
const code = `
const G = ["drachentor","kathedrale","maschine","geisttor","verkalkt","ruine","maurentor"];
const st = r.state;
const torGruppe = (k) => G.some((n) => String(k).startsWith("f:" + n + "|"));
const neuZeichnen = (m) => { let p = m.parent; while (p) { if (p.isBundleGroup) p.needsUpdate = true; p = p.parent; } };
let n = 0;
if (${JSON.stringify(name)} === "zwilling-stoff") {
  window.__schalterOrig = window.__schalterOrig || new Map();
  const schlicht = window.__schlichtStoff || (window.__schlichtStoff = new T.MeshBasicNodeMaterial({ color: 0x000000 }));
  for (const [k, g] of st.archInstanceGroups) {
    if (!g || !g.shadowTwin || !torGruppe(k)) continue;
    if (${an}) { if (!window.__schalterOrig.has(g.mesh)) window.__schalterOrig.set(g.mesh, g.mesh.material); g.mesh.material = schlicht; }
    else if (window.__schalterOrig.has(g.mesh)) { g.mesh.material = window.__schalterOrig.get(g.mesh); window.__schalterOrig.delete(g.mesh); }
    neuZeichnen(g.mesh); n++;
  }
} else if (${JSON.stringify(name)} === "zwilling-weg") {
  for (const [k, g] of st.archInstanceGroups) {
    if (!g || !g.shadowTwin || !torGruppe(k)) continue;
    g.mesh.visible = !${an}; neuZeichnen(g.mesh); n++;
  }
} else if (${JSON.stringify(name)} === "fern-march") {
  const slots = new Set();
  for (const e of st.architectures || []) if (e && e._ziegelSlot && G.includes(r._foundryPresetForEntry(e))) slots.add(e._ziegelSlot);
  if (!r.__wfaOrig) { r.__wfaOrig = Object.getPrototypeOf(r)._weltFeldAktiv; r._weltFeldAktiv = function (h, a) { return r.__wfaOrig.call(this, h, window.__torMarchAus && window.__torMarchSlots && window.__torMarchSlots.has(h) ? false : a); }; }
  window.__torMarchSlots = slots; window.__torMarchAus = ${an};
  for (const e of st.architectures || []) if (e && e._ziegelSlot && slots.has(e._ziegelSlot)) { r.__wfaOrig.call(r, e._ziegelSlot, ${an} ? false : !(e._ziegelNah && r._archIsRendered(e))); n++; }
}
return { schalter: ${JSON.stringify(name)}, an: ${an}, betroffen: n };`;
const q = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => console.log(d.slice(0, 300)));
});
q.end(JSON.stringify({ code }));
