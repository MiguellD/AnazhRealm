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
vm.runInContext("self.__K = { PRESETS, buildInstance, PRC: PORTAL_RENDER_CONFIG, welt: __weltSkalaArt }", sb);
const K = sb.__K;
try { K.buildInstance("eiche", 1, 0); } catch (e) {}
for (const id of ["eiche","fichte","birke","weide","mammut","tanne","buche","karst","totholz","strauch","gestruepp","gras","schilf","farn","blume"]) {
  const lod = id==="gras"?1:0;
  const g = K.buildInstance(id, 1, lod); const w=K.welt(id);
  const typA={}, typN={}; let ny={};
  g.traverse(o=>{ if(!o.isMesh) return; const ge=o.geometry, P=ge.attributes.position.array, T=ge.attributes.aType.array, I=ge.index?ge.index.array:null; const n=I?I.length/3:P.length/9;
    for(let t=0;t<n;t++){ const a=I?I[3*t]:3*t,b=I?I[3*t+1]:3*t+1,c=I?I[3*t+2]:3*t+2;
      const ux=P[3*b]-P[3*a],uy=P[3*b+1]-P[3*a+1],uz=P[3*b+2]-P[3*a+2],vx=P[3*c]-P[3*a],vy=P[3*c+1]-P[3*a+1],vz=P[3*c+2]-P[3*a+2];
      const cx=uy*vz-uz*vy,cy=uz*vx-ux*vz,cz=ux*vy-uy*vx; const A=0.5*Math.hypot(cx,cy,cz)*w*w; const ty=T[a];
      typA[ty]=(typA[ty]||0)+A; typN[ty]=(typN[ty]||0)+1; ny[ty]=(ny[ty]||0)+A*Math.abs(cy)/(Math.hypot(cx,cy,cz)||1);} });
  console.log(id.padEnd(10),"welt",w.toFixed(3), Object.keys(typA).map(k=>`t${k}: A ${typA[k].toFixed(3)} m² n ${typN[k]} |ny| ${(ny[k]/typA[k]).toFixed(2)}`).join("  "));
}
