// 1110-9 Nachtrag / 1310-1: die Schalter des Band-Täters in EINER Sitzung (B torwurf, Genesis). node schalter.cjs <port> <name> <an|aus>
//   null:           derselbe Eingriff ohne Änderung — die Bündel der Tor-Zwillinge werden neu aufgenommen (needsUpdate)
//   zwilling-stoff: die Tor-Zwillinge (Instanz-Gruppen f:<tor>|…, shadowTwin) tragen einen schlichten Stoff (kein Atlas-Alpha,
//                   kein alphaTest, kein Wind) statt des EINEN Schatten-Stoffs
//   fern-march:     die Fernform-Felder der Tore (entry._ziegelSlot) bleiben aus (Hülle um _weltFeldAktiv)
//   zwilling-weg:   die Tor-Zwillinge zeichnen nicht (die Kaskaden ohne Tor-Wurf)
//   global-zuerst / wahl-zuerst: die Reihe der Region-Bündel @global/@wahl in der Szene (reihe-null: derselbe Griff ohne Tausch)
//   l0-wirft:       der Zustand von Z live: die Tor-L0 werfen selbst (castShadow), die Zwillinge zeichnen nicht
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
if (${JSON.stringify(name)} === "null") {
  for (const [k, g] of st.archInstanceGroups) {
    if (!g || !g.shadowTwin || !torGruppe(k)) continue;
    neuZeichnen(g.mesh); n++;
  }
} else if (${JSON.stringify(name)} === "global-zuerst" || ${JSON.stringify(name)} === "wahl-zuerst" || ${JSON.stringify(name)} === "reihe-null") {
  // DIE BÜNDEL-REIHE: r184 zeichnet die Region-Bündel in Szenen-Reihenfolge vor allen losen Objekten. Der Schalter stellt
  // @global vor @wahl (bzw. @wahl vor @global); "aus" stellt die Reihe beim Start wieder her; reihe-null fasst die Reihe an,
  // ohne sie zu ändern (derselbe Eingriff).
  const sc = st.scene, map = st._regionBundles;
  const g = map && map.get("@global"), w = map && map.get("@wahl");
  if (!g || !w) return { fehler: "Bündel fehlt", global: !!g, wahl: !!w };
  if (window.__reiheStart == null) window.__reiheStart = sc.children.indexOf(g) < sc.children.indexOf(w) ? "global" : "wahl";
  const ziel = ${JSON.stringify(name)} === "reihe-null" ? null : ${an} ? (${JSON.stringify(name)} === "global-zuerst" ? "global" : "wahl") : window.__reiheStart;
  const ig = sc.children.indexOf(g), iw = sc.children.indexOf(w);
  const ist = ig < iw ? "global" : "wahl";
  if (ziel && ziel !== ist) { const [vorn, hinten] = ziel === "global" ? [g, w] : [w, g]; sc.children.splice(sc.children.indexOf(vorn), 1); sc.children.splice(sc.children.indexOf(hinten), 0, vorn); }
  else { const i = sc.children.indexOf(g); sc.children.splice(i, 1); sc.children.splice(i, 0, g); }
  n = 2;
  return { schalter: ${JSON.stringify(name)}, an: ${an}, start: window.__reiheStart, vorher: ist, nachher: sc.children.indexOf(g) < sc.children.indexOf(w) ? "global" : "wahl", kinder: [g.children.length, w.children.length] };
} else if (${JSON.stringify(name)} === "l0-wirft") {
  // der Zustand von Z (Zeile 0 schatten: 0) live in der torwurf-Welt: die Tor-L0 werfen selbst, die Zwillinge zeichnen nicht
  window.__l0Orig = window.__l0Orig || new Map();
  for (const [k, g] of st.archInstanceGroups) {
    if (!g || !torGruppe(k)) continue;
    if (g.shadowTwin) g.mesh.visible = !${an};
    else if (${an}) { if (!window.__l0Orig.has(g.mesh)) window.__l0Orig.set(g.mesh, g.mesh.castShadow); g.mesh.castShadow = true; }
    else if (window.__l0Orig.has(g.mesh)) { g.mesh.castShadow = window.__l0Orig.get(g.mesh); window.__l0Orig.delete(g.mesh); }
    neuZeichnen(g.mesh); n++;
  }
} else if (${JSON.stringify(name)} === "zwilling-stoff") {
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
