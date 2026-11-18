const ROOT="C:/Users/micha/AnazhRealm-profiband";
const fs=require("fs"), path=require("path");
const t0=Date.now();
const W = require(ROOT+"/scripts/lib/welt-boot.cjs");
const vm=W.vm;
const absorber=()=>{const a=new Proxy(function(){}, {get:(_t,k)=>(k===Symbol.toPrimitive?()=>0:a), apply:()=>a, construct:()=>a}); return a;};
const sb = { console:{log(){},warn(){},error(){}}, Math, performance:{now:()=>Date.now()}, setTimeout, clearTimeout };
sb.self=sb.globalThis=sb.window=sb; sb.THREE=W.ENGINE_THREE();
sb.OffscreenCanvas=function(w,h){this.width=w;this.height=h;this.getContext=()=>new Proxy({}, {get:(t,k)=>{ if(k==="createImageData"||k==="getImageData") return (a,b,c,d)=>({data:new Uint8ClampedArray((c||a)*(d||b)*4), width:(c||a), height:(d||b)}); if(k in t) return t[k]; return ()=>absorber(); }, set:(t,k,v)=>{t[k]=v;return true;}}); this.convertToBlob=async()=>null; this.transferToImageBitmap=()=>({});};
vm.createContext(sb);
for (const f of ["phyto-core.js","foundry-core.js","foundry-bruecke.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT,f),"utf8"), sb, {filename:f});
vm.runInContext("self.__K = {PRESETS, buildInstance, skelettDerGestalt, PRC: PORTAL_RENDER_CONFIG}", sb);
const K=sb.__K, THREE=sb.THREE;
console.log("load ms", Date.now()-t0);
for (const id of Object.keys(K.PRESETS)) { if(K.PRESETS[id].panel==="rock") continue; const t=Date.now(); let g; let err=null; sb.console.warn=(...a)=>{err=a.map(String).join(" ").slice(0,200)};
 g = K.buildInstance(id,1,0);
 let n=0, m=0; g.traverse(o=>{if(o.isMesh){m++; n+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;}});
 const box=new THREE.Box3().setFromObject(g); const s=box.getSize(new THREE.Vector3());
 console.log(id+" kind="+K.PRESETS[id].kind+" meshes="+m+" tris="+n+" ms="+(Date.now()-t)+" size="+s.toArray().map(v=>v.toFixed(2)).join("/")+" scale="+K.PRC.placement.scale[id]+" s="+JSON.stringify(K.PRESETS[id].s)+(err?" ERR "+err:"")); }
