// 1310-8: die Folge der Gruppen IM @wahl-Bündel — zeigen (Schlüssel) oder in eine gegebene Folge stellen (genannte zuerst, in der
// Liste-Folge; die übrigen dahinter in ihrer Folge), dann nimmt das Bündel neu auf. node kinder.cjs <port> zeigen | setzen <datei.json> | ankunft | gesetz
"use strict";
const http = require("http");
const fs = require("fs");
const [port, wie, datei] = process.argv.slice(2);
const liste = wie === "setzen" ? fs.readFileSync(datei, "utf8") : "[]";
const code = `
const b = r.state.scene.children.find((c) => c && c.isBundleGroup && c.userData && c.userData.regionKey === "@wahl");
if (!b) return { fehlt: true };
const key = (c) => String(c.userData && c.userData.archInstanceKey);
if (${JSON.stringify(wie)} === "ankunft" || ${JSON.stringify(wie)} === "gesetz") {
  if (${JSON.stringify(wie)} === "ankunft") b.children.sort((x, y) => x.id - y.id); else AnazhRealm._buendelKinderReihe(b);
  b.needsUpdate = true;
  return { folge: b.children.map(key).slice(0, 8) };
}
if (${JSON.stringify(wie)} === "setzen") {
  const ziel = ${liste};
  const rang = (c) => { const i = ziel.indexOf(key(c)); return i < 0 ? 1e6 : i; };
  const neu = b.children.map((c, k) => ({ c, k })).sort((x, y) => rang(x.c) - rang(y.c) || x.k - y.k).map((x) => x.c);
  for (let k = 0; k < neu.length; k++) b.children[k] = neu[k];
  b.needsUpdate = true;
  return { gesetzt: b.children.map(key) };
}
return { folge: b.children.map(key) };`;
const q = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d));
});
q.end(JSON.stringify({ code }));
