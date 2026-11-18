"use strict";
const ROOT = "C:/Users/micha/AnazhRealm-profiband";
const fs = require("fs"), path = require("path");
const W = require(ROOT + "/scripts/lib/welt-boot.cjs");
const vm = W.vm;
const absorber = () => { const a = new Proxy(function () {}, { get: (_t, k) => (k === Symbol.toPrimitive ? () => 0 : a), apply: () => a, construct: () => a }); return a; };
const sb = { console: { log() {}, warn() {}, error() {} }, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
sb.self = sb.globalThis = sb.window = sb;
sb.THREE = W.ENGINE_THREE();
sb.OffscreenCanvas = function (w, h) { this.width = w; this.height = h; this.getContext = () => new Proxy({}, { get: (t, k) => (k === "createImageData" || k === "getImageData" ? (a, b, c, d) => ({ data: new Uint8ClampedArray((c || a) * (d || b) * 4) }) : k in t ? t[k] : () => absorber()), set: (t, k, v) => ((t[k] = v), true) }); };
vm.createContext(sb);
for (const f of ["phyto-core.js", "foundry-core.js", "foundry-bruecke.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sb, { filename: f });
vm.runInContext("self.__K = { PRESETS, buildInstance, skelettDerGestalt, PRC: PORTAL_RENDER_CONFIG, welt: __weltSkalaArt }", sb);
const K = sb.__K, THREE = sb.THREE;
try { K.buildInstance("eiche", 1, 0); } catch (e) {}
for (const id of ["eiche","fichte","birke","strauch","gras","farn","schilf","blume","gestruepp"]) {
  let g; try { g = K.buildInstance(id, 1, id==="gras"?1:0); } catch(e){ console.log(id,"FEHLER",e.message); continue; }
  const rows=[];
  g.traverse(o=>{ if(!o.isMesh) return; const ge=o.geometry; const n=(ge.index?ge.index.count:ge.attributes.position.count)/3; const bb=new THREE.Box3().setFromBufferAttribute(ge.attributes.position);
    rows.push(`${o.name||"-"}|mat:${(o.material&&(o.material.name||o.material.type))}|ud:${JSON.stringify(o.userData).slice(0,80)}|attr:${Object.keys(ge.attributes).join(",")}|tris ${n}|y ${bb.min.y.toFixed(2)}..${bb.max.y.toFixed(2)} inst:${!!o.isInstancedMesh}`); });
  const box=new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3());
  console.log(id, "welt", K.welt(id), "box", box.x.toFixed(2),box.y.toFixed(2),box.z.toFixed(2), "ud", JSON.stringify(g.userData).slice(0,200));
  rows.forEach(r=>console.log("   ",r));
}
